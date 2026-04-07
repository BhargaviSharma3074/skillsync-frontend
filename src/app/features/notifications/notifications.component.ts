import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="notifications-container">
      <mat-card class="notifications-card">
        <mat-card-content class="empty-state">
          <mat-icon class="icon">notifications_off</mat-icon>
          <h2>No New Notifications</h2>
          <p>You're all caught up! Check back later for updates.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    @use '../../../styles/tokens' as *;

    .notifications-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 120px);
      padding: $sp-xl;
    }

    .notifications-card {
      width: 100%;
      max-width: 500px;
      border-radius: $radius-lg;
      box-shadow: $shadow-card;
      padding: $sp-xxl;
      text-align: center;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $sp-md;

      .icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: $text-light;
        margin-bottom: $sp-sm;
      }

      h2 {
        margin: 0;
        font-size: 20px;
        color: $text-primary;
      }

      p {
        margin: 0;
        color: $text-secondary;
        font-size: 15px;
      }
    }
  `]
})
export class NotificationsComponent {}
