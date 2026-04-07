
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
import { MatNativeDateModule, DateAdapter } from '@angular/material/core';
import { MentorsStore } from '../../mentors/mentors.store';
import { SessionsStore } from '../sessions.store';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { avatarColor } from '../../../shared/utils/avatar-color';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';
// import { CustomDateAdapter } from '../../../shared/utils/custom-date-adapter';

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
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const min = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), this.minDate.getDate());
    const max = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), this.maxDate.getDate());
    return d.getTime() >= min.getTime() && d.getTime() <= max.getTime();
  };

  onDatePicked(date: Date | null) {
    if (!date) return;

    if (!this.dateFilter(date)) {
      this.toast.error('Please select a date within the allowed range');
      this.selectedDate.set(null);
      return;
    }

    this.selectedDate.set(date);
    this.selectedSlot.set(null);

    const iso = date.toISOString().split('T')[0];
    this.sessionStore.loadSlots(this.mentorId, iso);
  }

  getFilteredSlots() {
    const allSlots = this.sessionStore.availableSlots();
    const selected = this.selectedDate();
    if (!selected || !allSlots.length) return allSlots;

    const now = new Date();
    const isToday =
      selected.getFullYear() === now.getFullYear() &&
      selected.getMonth() === now.getMonth() &&
      selected.getDate() === now.getDate();

    if (!isToday) return allSlots;

    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    return allSlots.map(slot => {
      const parsed = this.parseSlotTime(slot.time);
      if (!parsed) return { ...slot, available: false };
      const slotTotalMinutes = parsed.hours * 60 + parsed.minutes;
      if (slotTotalMinutes <= currentTotalMinutes + 30) {
        return { ...slot, available: false };
      }
      return slot;
    });
  }

  private parseSlotTime(time: string): { hours: number; minutes: number } | null {
    const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  }

  hasAvailableSlots(): boolean {
    return this.getFilteredSlots().some(s => s.available);
  }

  selectSlot(time: string) {
    this.selectedSlot.set(time);
  }

  selectDuration(d: number) {
    this.selectedDuration.set(d);
  }

  get totalCost(): number {
    const rate = this.mentorStore.selectedMentor()?.hourlyRate ?? 0;
    return (rate / 60) * this.selectedDuration();
  }

  clearDate() {
    this.selectedDate.set(null);
    this.selectedSlot.set(null);
  }

  async confirmBooking() {
    const date = this.selectedDate();
    const slot = this.selectedSlot();

    if (!date || !slot || !this.sessionTopic) {
      this.toast.error('Please fill all required fields');
      return;
    }

    if (!this.dateFilter(date)) {
      this.toast.error('Selected date is no longer valid');
      this.clearDate();
      return;
    }

    const filteredSlots = this.getFilteredSlots();
    const chosenSlot = filteredSlots.find(s => s.time === slot);
    if (!chosenSlot || !chosenSlot.available) {
      this.toast.error('Selected time slot is no longer available');
      this.selectedSlot.set(null);
      return;
    }

    await this.sessionStore.book({
      mentorId: this.mentorId,
      date: date.toISOString().split('T')[0],
      time: slot,
      duration: this.selectedDuration(),
      topic: this.sessionTopic
    });

    this.toast.success('Session booked successfully!');
    this.router.navigate(['/sessions']);
  }
}