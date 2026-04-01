import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../core/auth/auth.service';
import { avatarColor } from '../../../shared/utils/avatar-color';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';

interface MentorStats {
  icon: string; label: string; value: number | string; change: string; color: string;
}

interface PendingSession {
  id: string; dateTime: string; learnerName: string; topic: string; duration: number; status: string;
}

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, DatePipe, InitialsPipe],
  templateUrl: './mentor-dashboard.component.html',
  styleUrl: './mentor-dashboard.component.scss'
})
export class MentorDashboardComponent implements OnInit {
  auth = inject(AuthService);

  greeting = '';
  today = new Date();
  displayedColumns = ['dateTime', 'learner', 'topic', 'duration', 'actions'];
  avatarColor = avatarColor;

  stats: MentorStats[] = [];
  pendingSessions: PendingSession[] = [];

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

    this.pendingSessions = [
      { id: '1', dateTime: '2025-03-18T09:00:00', learnerName: 'Rahul Sharma',  topic: 'Spring Boot Basics',     duration: 60, status: 'PENDING' },
      { id: '2', dateTime: '2025-03-19T14:00:00', learnerName: 'Sneha Patel',   topic: 'Data Science Intro',     duration: 60, status: 'PENDING' },
      { id: '3', dateTime: '2025-03-20T11:00:00', learnerName: 'Karan Mehta',   topic: 'Kubernetes Deployment',  duration: 90, status: 'PENDING' }
    ];
  }
}