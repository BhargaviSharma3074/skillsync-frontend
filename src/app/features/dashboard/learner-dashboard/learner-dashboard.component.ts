// import { Component, inject, OnInit } from '@angular/core';
// import { CommonModule, DatePipe } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatTableModule } from '@angular/material/table';
// import { AuthService } from '../../../core/auth/auth.service';
// import { DashboardStore } from '../dashboard.store';
// import { avatarColor } from '../../../shared/utils/avatar-color';
// import { InitialsPipe } from '../../../shared/pipes/initials.pipe';


// @Component({
//   selector: 'app-learner-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule, RouterModule, MatCardModule, MatButtonModule,
//     MatIconModule, MatTableModule, DatePipe, InitialsPipe
//   ],
//   templateUrl: './learner-dashboard.component.html',
//   styleUrl: './learner-dashboard.component.scss'
// })
// export class LearnerDashboardComponent implements OnInit {
//   auth = inject(AuthService);
//   store = inject(DashboardStore);

//   greeting = '';
//   today = new Date();
//   displayedColumns = ['dateTime', 'mentor', 'topic', 'duration', 'status'];

//   get isMentor(): boolean {
//     return this.auth.isMentor();
//   }

//   ngOnInit() {
//     const hour = new Date().getHours();
//     const name = this.auth.currentUser()?.firstName ?? 'Learner';
//     if (hour < 12) this.greeting = `Good morning, ${name}! 👋`;
//     else if (hour < 17) this.greeting = `Good afternoon, ${name}! 👋`;
//     else this.greeting = `Good evening, ${name}! 👋`;

//     this.store.loadLearnerDashboard();
//   }

//   avatarColor = avatarColor;

//   statsCards() {
//     const s = this.store.stats();
//     return [
//       { icon: '📅', label: 'Upcoming Sessions', value: s.upcomingSessions, change: '↑ This week', color: '#fff3e0' },
//       { icon: '👨‍🏫', label: 'Connected Mentors', value: s.connectedMentors, change: '+1 this month', color: '#e8f5e9' },
//       { icon: '👥', label: 'Active Groups', value: s.activeGroups, change: '2 new posts', color: '#e3f2fd' },
//       { icon: '⭐', label: 'Sessions Completed', value: s.sessionsCompleted, change: '+3 this month', color: '#fce4ec' }
//     ];
//   }
// }


import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';
import { DashboardStore } from '../dashboard.store';
import { avatarColor } from '../../../shared/utils/avatar-color';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-learner-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatIconModule, MatTableModule, DatePipe, InitialsPipe,
    MatProgressSpinnerModule
  ],
  templateUrl: './learner-dashboard.component.html',
  styleUrl: './learner-dashboard.component.scss'
})
export class LearnerDashboardComponent implements OnInit {
  auth = inject(AuthService);
  store = inject(DashboardStore);

  greeting = '';
  today = new Date();
  displayedColumns = ['dateTime', 'mentor', 'topic', 'duration', 'status'];

  get isMentor(): boolean {
    return this.auth.isMentor();
  }

  ngOnInit() {
    const hour = new Date().getHours();
    const name = this.auth.currentUser()?.firstName ?? 'Learner';
    if (hour < 12)       this.greeting = `Good morning, ${name}! 👋`;
    else if (hour < 17)  this.greeting = `Good afternoon, ${name}! 👋`;
    else                 this.greeting = `Good evening, ${name}! 👋`;

    this.store.loadLearnerDashboard();
  }

  avatarColor = avatarColor;

  retry() {
    this.store.loadLearnerDashboard();
  }

  statsCards() {
    const s = this.store.stats();
    return [
      {
        icon: '📅',
        label: 'Upcoming Sessions',
        value: s.upcomingSessions,
        change: '↑ This week',
        color: '#fff3e0'
      },
      {
        icon: '👨‍🏫',
        label: 'Connected Mentors',
        value: s.connectedMentors,
        change: 'Total mentors',
        color: '#e8f5e9'
      },
      {
        icon: '👥',
        label: 'Active Groups',
        value: s.activeGroups,
        change: 'You are a member',
        color: '#e3f2fd'
      },
      {
        icon: '⭐',
        label: 'Sessions Completed',
        value: s.sessionsCompleted,
        change: 'All time',
        color: '#fce4ec'
      }
    ];
  }
}