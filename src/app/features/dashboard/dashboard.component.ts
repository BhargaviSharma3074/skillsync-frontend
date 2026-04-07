

import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LearnerDashboardComponent } from './learner-dashboard/learner-dashboard.component';
import { MentorDashboardComponent } from './mentor-dashboard/mentor-dashboard.component';
import { AdminConsoleComponent } from '../admin/admin-console/admin-console.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LearnerDashboardComponent,
    MentorDashboardComponent,
    AdminConsoleComponent
  ],
  template: `
    @if (auth.isAdmin()) {
      <app-admin-console />
    } @else if (auth.isMentor()) {
      <app-mentor-dashboard />
    } @else {
      <app-learner-dashboard />
    }
  `
})
export class DashboardComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // React to role changes automatically
    effect(() => {
      const role = this.auth.userRole();
      console.log('🔄 Role changed to:', role);
    });
  }
}