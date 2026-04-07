
import { firstValueFrom } from 'rxjs';
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
import { AuthService } from '../../../core/auth/auth.service';
import { avatarColor } from '../../../shared/utils/avatar-color';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';
import { PaymentService } from '../../../core/services/payment.service';

declare var Razorpay: any;

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
  private auth = inject(AuthService);

  mentorStore = inject(MentorsStore);
  sessionStore = inject(SessionsStore);
  private paymentService = inject(PaymentService);

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
      this.toast.error('Please select a valid date');
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
      selected.getMonth()    === now.getMonth() &&
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

  // 🔥 NEW FUNCTION (FIX)
  private convertTo24Hour(time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const hh = hours.toString().padStart(2, '0');

  // ✅ ADD SECONDS (THIS FIXES 500)
  return `${hh}:${minutes}:00`;
}

  selectSlot(time: string)  { this.selectedSlot.set(time); }
  selectDuration(d: number) { this.selectedDuration.set(d); }

  clearDate() {
    this.selectedDate.set(null);
    this.selectedSlot.set(null);
  }

  hasAvailableSlots(): boolean {
    return this.getFilteredSlots().some(s => s.available);
  }

  get totalCost(): number {
    const rate = this.mentorStore.selectedMentor()?.hourlyRate ?? 0;
    return Math.round((rate / 60) * this.selectedDuration());
  }

  async confirmBooking() {
    const date = this.selectedDate();
    const slot = this.selectedSlot();

    if (!date || !slot || !this.sessionTopic) {
      this.toast.error('Please fill all fields');
      return;
    }

    console.log("BOOK PAYLOAD:", {
      mentorId: this.mentorId,
      date: date.toISOString().split('T')[0],
      time: slot,
      duration: this.selectedDuration(),
      topic: this.sessionTopic
    });

    try {
      const sessionId = await this.sessionStore.book({
        mentorId: Number(this.mentorId),
        sessionDate: date.toISOString().split('T')[0],
        startTime: this.convertTo24Hour(slot), // 🔥 FIX APPLIED
        durationMinutes: this.selectedDuration(),
        topic: this.sessionTopic
      });

      if (!sessionId) {
        throw new Error('Session creation failed');
      }

      const order = await firstValueFrom(
        this.paymentService.initiatePayment(Number(sessionId))
      );

      console.log('ORDER:', order);

      this.openRazorpay(order, Number(sessionId));

    } catch (err: any) {
      this.toast.error(err.message || 'Something went wrong');
      console.error(err);
    }
  }

  private openRazorpay(order: any, sessionId: number) {
    const mentor = this.mentorStore.selectedMentor();

    const options = {
      key: order.key || order.razorpayKeyId,
      amount: order.amount,
      currency: order.currency,
      name: 'SkillSync',
      description: `Session with ${mentor?.name || 'Mentor'}`,
      order_id: order.orderId || order.gatewayOrderId,

      handler: (response: any) => {
        this.verifyPayment(response, sessionId);
      },

      prefill: {
        name: this.auth.currentUser()?.firstName || '',
        email: this.auth.currentUser()?.email || ''
      },

      notes: {
        sessionId: String(sessionId)
      },

      theme: { color: '#E53935' }
    };

    const rzp = new Razorpay(options);

    rzp.on('payment.failed', (res: any) => {
      this.toast.error('Payment failed: ' + res.error.description);
    });

    rzp.open();
  }

  private async verifyPayment(response: any, sessionId: number) {
    try {
      await firstValueFrom(
        this.paymentService.verifyPayment({
          sessionId,
          gatewayOrderId: response.razorpay_order_id,
          gatewayPaymentId: response.razorpay_payment_id,
          gatewaySignature: response.razorpay_signature
        })
      );

      this.toast.success('Payment successful 🎉');
      this.router.navigate(['/sessions']);

    } catch (err) {
      this.toast.error('Payment verification failed');
      console.error(err);
    }
  }
}
