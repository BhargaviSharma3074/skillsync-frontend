import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AdminStore } from '../admin.store';
import { avatarColor } from '../../../shared/utils/avatar-color';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-admin-console',
  standalone: true,
  imports: [
    CommonModule, DatePipe, MatCardModule, MatButtonModule,
    MatIconModule, MatProgressBarModule, InitialsPipe
  ],
  templateUrl: './admin-console.component.html',
  styleUrl: './admin-console.component.scss'
})
export class AdminConsoleComponent implements OnInit {
  store = inject(AdminStore);
  today = new Date();
  avatarColor = avatarColor;

  statCards() {
    const s = this.store.stats();
    return [
      { icon: '👥', label: 'Total Users',      value: s.totalUsers.toLocaleString(),   change: '↑ +12% this month', color: '#e3f2fd' },
      { icon: '👨‍🏫', label: 'Active Mentors',    value: s.activeMentors.toLocaleString(), change: '↑ +8% this month',  color: '#e8f5e9' },
      { icon: '📅', label: 'Sessions Booked',   value: s.sessionsBooked.toLocaleString(), change: '↑ +24% this month', color: '#fff3e0' },
      { icon: '💰', label: 'Platform Revenue',  value: s.platformRevenue,               change: '↑ +18% this month', color: '#fce4ec' }
    ];
  }

  ngOnInit() {
    this.store.load();
  }
}