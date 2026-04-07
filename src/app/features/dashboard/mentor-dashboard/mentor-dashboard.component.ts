import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionsStore } from '../../sessions/sessions.store';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { avatarColor } from '../../../shared/utils/avatar-color';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';

interface MentorStats {
  icon: string; label: string; value: number | string; change: string; color: string;
}

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, DatePipe, InitialsPipe],
  templateUrl: './mentor-dashboard.component.html',
  styleUrl: './mentor-dashboard.component.scss'
})
export class MentorDashboardComponent implements OnInit {
  auth = inject(AuthService);
  sessionStore = inject(SessionsStore);
  toast = inject(ToastService);

  greeting = '';
  today = new Date();
  displayedColumns = ['dateTime', 'learner', 'topic', 'duration', 'actions'];
  avatarColor = avatarColor;

  stats: MentorStats[] = [];

  get pendingSessions() {
    return this.sessionStore.sessions().filter(s => s.status === 'PENDING');
  }

  get upcomingSessions() {
    return this.sessionStore.sessions().filter(s => s.status === 'ACCEPTED');
  }

  ngOnInit() {
    const name = this.auth.currentUser()?.firstName ?? 'Mentor';
    const h = new Date().getHours();
    this.greeting = h < 12 ? `Good morning, ${name}! 👋` : h < 17 ? `Good afternoon, ${name}! 👋` : `Good evening, ${name}! 👋`;

    this.stats = [
      { icon: '📅', label: 'Sessions This Week', value: 6,      change: '+2 vs last week', color: '#fff3e0' },
      { icon: '⭐', label: 'Avg Rating',         value: '4.8',  change: '↑ 0.1 this month', color: '#fce4ec' },
      { icon: '💰', label: 'Earnings (Month)',    value: '₹24K', change: '+18% this month', color: '#e8f5e9' },
      { icon: '👨‍🎓', label: 'Total Learners',      value: 34,     change: '+5 this month',  color: '#e3f2fd' }
    ];

    this.sessionStore.loadMentorPendingSessions();
  }

  async accept(id: string) {
    try {
      await this.sessionStore.acceptSession(id);
      this.toast.success('Session accepted! Learner has been notified.');
    } catch {
      this.toast.error('Failed to accept session. Please try again.');
    }
  }

  async decline(id: string) {
    try {
      await this.sessionStore.rejectSession(id);
      this.toast.success('Session declined. Learner has been notified.');
    } catch {
      this.toast.error('Failed to decline session. Please try again.');
    }
  }
}