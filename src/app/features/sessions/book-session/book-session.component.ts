import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MentorsStore } from '../../mentors/mentors.store';
import { SessionsStore } from '../sessions.store';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service'; // ← add this
import { avatarColor } from '../../../shared/utils/avatar-color';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';
import { environment } from '../../../../environments/environment'; // ← add this

declare var Razorpay: any; // ← Razorpay global from CDN script

@Component({
  selector: 'app-book-session',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, DatePipe,
    MatStepperModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule, InitialsPipe
  ],
  templateUrl: './book-session.component.html',
  styleUrl: './book-session.component.scss'
})
export class BookSessionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private auth = inject(AuthService); // ← inject auth
  mentorStore = inject(MentorsStore);
  sessionStore = inject(SessionsStore);

  avatarColor = avatarColor;

  mentorId = '';
  selectedDate = signal<Date | null>(null);
  selectedSlot = signal<string | null>(null);
  selectedDuration = signal<number>(60);
  sessionTopic = '';

  durations = [30, 60, 90];

  minDate: Date = new Date();
  maxDate: Date = new Date();

  ngOnInit() {
    this.mentorId = this.route.snapshot.paramMap.get('mentorId')!;
    this.mentorStore.loadMentor(this.mentorId);

    const now = new Date();
    this.minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    this.maxDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const d   = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const min = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), this.minDate.getDate());
    const max = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), this.maxDate.getDate());
    return d >= min && d <= max;
  };

  onDatePicked(date: Date | null) {
    if (!date || !this.dateFilter(date)) {
      this.toast.error('Please select a date within the allowed range');
      this.selectedDate.set(null);
      return;
    }
    this.selectedDate.set(date);
    this.selectedSlot.set(null);
    this.sessionStore.loadSlots(this.mentorId, date.toISOString().split('T')[0]);
  }

  getFilteredSlots() {
    const allSlots = this.sessionStore.availableSlots();
    const selected = this.selectedDate();
    if (!selected || !allSlots.length) return allSlots;

    const now = new Date();
    const isToday =
      selected.getFullYear() === now.getFullYear() &&
      selected.getMonth()    === now.getMonth()    &&
      selected.getDate()     === now.getDate();

    if (!isToday) return allSlots;

    const currentMins = now.getHours() * 60 + now.getMinutes();
    return allSlots.map(slot => {
      const parsed = this.parseSlotTime(slot.time);
      if (!parsed) return { ...slot, available: false };
      return (parsed.hours * 60 + parsed.minutes) <= currentMins + 30
        ? { ...slot, available: false }
        : slot;
    });
  }

  private parseSlotTime(time: string) {
    const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  }

  hasAvailableSlots() {
    return this.getFilteredSlots().some(s => s.available);
  }

  selectSlot(time: string)  { this.selectedSlot.set(time); }
  selectDuration(d: number) { this.selectedDuration.set(d); }
  clearDate() {
    this.selectedDate.set(null);
    this.selectedSlot.set(null);
  }

  get totalCost(): number {
    const rate = this.mentorStore.selectedMentor()?.hourlyRate ?? 0;
    return Math.round((rate / 60) * this.selectedDuration());
  }

  // ─── Main booking + payment flow ───────────────────────────────────────────

  async confirmBooking() {
    const date = this.selectedDate();
    const slot = this.selectedSlot();

    if (!date || !slot || !this.sessionTopic) {
      this.toast.error('Please fill all required fields');
      return;
    }

    const chosenSlot = this.getFilteredSlots().find(s => s.time === slot);
    if (!chosenSlot?.available) {
      this.toast.error('Selected time slot is no longer available');
      this.selectedSlot.set(null);
      return;
    }

    try {
      // Step 1: Create the session — we need sessionId for payment
      const sessionId = await this.sessionStore.book({
        mentorId: this.mentorId,
        date: date.toISOString().split('T')[0],
        time: slot,
        duration: this.selectedDuration(),
        topic: this.sessionTopic
      });

      // Step 2: Create a Razorpay order via your payment service
      const token = this.auth.getToken();
      const userId = this.auth.currentUser()?.id;

      const orderRes = await fetch(`${environment.apiUrl}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': String(userId)
        },
        body: JSON.stringify({ sessionId: Number(sessionId) })
      });

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        throw new Error(err.message ?? 'Failed to initiate payment');
      }

      const order = await orderRes.json();
      // order shape: { sessionId, gatewayOrderId, amount, currency, razorpayKeyId }

      // Step 3: Open Razorpay checkout
      this.openRazorpay(order, Number(sessionId), date, slot);

    } catch (err: any) {
      this.toast.error(err.message ?? 'Something went wrong. Please try again.');
      console.error(err);
    }
  }

  private openRazorpay(order: any, sessionId: number, date: Date, slot: string) {
    const mentor = this.mentorStore.selectedMentor();

    const options = {
      key: order.razorpayKeyId,                      // comes from your backend
      amount: order.amount.toString(),               // already in paise from backend
      currency: order.currency,
      name: 'SkillSync',
      description: `Session with ${mentor?.name ?? 'Mentor'}`,
      order_id: order.gatewayOrderId,
      handler: (response: any) => {
        // Razorpay calls this on success
        this.verifyPayment(response, sessionId);
      },
      prefill: {
        name:  this.auth.currentUser()?.firstName ?? '',
        email: this.auth.currentUser()?.email ?? ''
      },
      notes: {
        sessionId: String(sessionId),
        mentorId: this.mentorId
      },
      theme: { color: '#E53935' },
      modal: {
        ondismiss: () => {
          this.toast.error('Payment cancelled. Your session is reserved but unpaid.');
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      this.toast.error(`Payment failed: ${response.error.description}`);
    });
    rzp.open();
  }

  private async verifyPayment(razorpayResponse: any, sessionId: number) {
    const token = this.auth.getToken();
    const userId = this.auth.currentUser()?.id;

    try {
      const verifyRes = await fetch(`${environment.apiUrl}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': String(userId)
        },
        body: JSON.stringify({
          sessionId,
          gatewayOrderId:   razorpayResponse.razorpay_order_id,
          gatewayPaymentId: razorpayResponse.razorpay_payment_id,
          gatewaySignature: razorpayResponse.razorpay_signature
        })
      });

      if (!verifyRes.ok) throw new Error('Payment verification failed');

      this.toast.success('Payment successful! Session confirmed 🎉');
      this.router.navigate(['/sessions']);

    } catch (err: any) {
      this.toast.error('Payment verification failed. Please contact support.');
      console.error(err);
    }
  }
}