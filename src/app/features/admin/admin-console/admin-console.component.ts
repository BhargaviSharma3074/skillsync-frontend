
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminStore } from '../admin.store';
import { avatarColor } from '../../../shared/utils/avatar-color';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-admin-console',
  standalone: true,
  imports: [
    CommonModule, DatePipe, MatCardModule, MatButtonModule,
    MatIconModule, MatProgressBarModule, MatProgressSpinnerModule,
    InitialsPipe
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
      { icon: '👥', label: 'Total Users',      value: s.totalUsers.toLocaleString(),    change: 'Registered users', color: '#e3f2fd' },
      { icon: '👨‍🏫', label: 'Active Mentors',   value: s.activeMentors.toLocaleString(), change: 'Approved mentors', color: '#e8f5e9' },
      { icon: '📋', label: 'Pending Approvals', value: String(this.store.pendingApprovals().length), change: 'Awaiting review', color: '#fff3e0' },
      { icon: '👥', label: 'Total Groups',      value: s.totalGroups.toLocaleString(),   change: 'Learning groups',  color: '#f3e5f5' }
    ];
  }

  ngOnInit() {
    this.store.load();
  }

  async approveAndRefresh(mentorId: string) {
    await this.store.approve(mentorId);
  }

  async rejectAndRefresh(mentorId: string) {
    await this.store.reject(mentorId);
  }

  async deleteGroup(groupId: string) {
    if (confirm('Are you sure you want to permanently delete this group? This cannot be undone.')) {
      await this.store.deleteGroup(groupId);
    }
  }

  async deactivateGroup(groupId: string) {
    if (confirm('Deactivate this group? Members will no longer see it.')) {
      await this.store.deactivateGroup(groupId);
    }
  }
}