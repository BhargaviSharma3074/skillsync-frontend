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
import { avatarColor } from '../../../shared/utils/avatar-color';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';

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

  minDate = new Date();

  ngOnInit() {
    this.mentorId = this.route.snapshot.paramMap.get('mentorId')!;
    this.mentorStore.loadMentor(this.mentorId);
  }

  onDateSelected(date: Date) {
    this.selectedDate.set(date);
    this.selectedSlot.set(null);
    const iso = date.toISOString().split('T')[0];
    this.sessionStore.loadSlots(this.mentorId, iso);
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

  async confirmBooking() {
    await this.sessionStore.book({
      mentorId: this.mentorId,
      date: this.selectedDate()?.toISOString().split('T')[0],
      time: this.selectedSlot(),
      duration: this.selectedDuration(),
      topic: this.sessionTopic
    });
    this.toast.success('Session booked successfully!');
    this.router.navigate(['/sessions']);
  }
}