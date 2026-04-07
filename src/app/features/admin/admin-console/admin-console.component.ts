
import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminStore } from '../admin.store';
import { avatarColor } from '../../../shared/utils/avatar-color';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-admin-console',
  standalone: true,
  imports: [
    CommonModule, DatePipe, MatCardModule, MatButtonModule,
    MatIconModule, MatProgressBarModule, MatProgressSpinnerModule,
    InitialsPipe, FormsModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './admin-console.component.html',
  styleUrl: './admin-console.component.scss'
})
export class AdminConsoleComponent implements OnInit {
  store = inject(AdminStore);
  router = inject(Router);
  today = new Date();
  avatarColor = avatarColor;
  newSkillName = '';

  get activeSection(): string {
    const url = this.router.url;
    if (url.includes('/admin/users')) return 'users';
    if (url.includes('/admin/approvals')) return 'approvals';
    if (url.includes('/admin/skills')) return 'skills';
    return 'dashboard';
  }

  get users() { return this.store.users(); }
  get skills() { return this.store.skills(); }

  statCards() {
    const s = this.store.stats();
    const pendingCount = this.store.pendingApprovals().length;
    return [
      { icon: '👥', label: 'Active Members',   value: s.totalUsers.toLocaleString(),    change: 'Total users',     color: '#e3f2fd' },
      { icon: '👨‍🏫', label: 'Active Mentors',   value: s.activeMentors.toLocaleString(), change: 'Approved mentors', color: '#e8f5e9' },
      { icon: '📋', label: 'Pending Mentors',  value: String(pendingCount),            change: 'Awaiting review',  color: '#fff3e0' },
      { icon: '👥', label: 'Active Groups',    value: s.totalGroups.toLocaleString(),   change: 'Platform communities', color: '#f3e5f5' }
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

  // ── Skills Management ──
  addSkill() {
    const s = this.newSkillName.trim();
    if (s) {
      this.store.addSkill(s);
      this.newSkillName = '';
    }
  }

  removeSkill(skill: string) {
    if (confirm(`Remove "${skill}" from the catalog?`)) {
      this.store.removeSkill(skill);
    }
  }

  // ── User Management ──
  toggleUserStatus(user: any) {
    const action = user.status === 'ACTIVE' ? 'Block' : 'Unblock';
    if (confirm(`${action} user ${user.username}?`)) {
      this.store.toggleUserStatus(user.id, user.status);
    }
  }
}