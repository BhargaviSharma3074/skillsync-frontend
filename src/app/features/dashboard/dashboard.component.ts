import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { LearnerDashboardComponent } from './learner-dashboard/learner-dashboard.component';
import { MentorDashboardComponent } from './mentor-dashboard/mentor-dashboard.component';
import { AdminConsoleComponent } from '../admin/admin-console/admin-console.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LearnerDashboardComponent, MentorDashboardComponent, AdminConsoleComponent],
  template: `
    @switch (auth.userRole()) {
      @case ('ADMIN')   { <app-admin-console /> }
      @case ('MENTOR')  { <app-mentor-dashboard /> }
      @default          { <app-learner-dashboard /> }
    }
  `
})
export class DashboardComponent {
  auth = inject(AuthService);
}