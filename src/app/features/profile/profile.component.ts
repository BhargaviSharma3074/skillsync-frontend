import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { avatarColor } from '../../shared/utils/avatar-color';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  auth = inject(AuthService);
  user = this.auth.currentUser;

  get initials(): string {
    return this.auth.getInitials();
  }

  get bgColor(): string {
    const u = this.user();
    return avatarColor(u ? u.firstName + u.lastName : 'U');
  }

  get fullName(): string {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}` : 'Guest';
  }

  get roleDisplay(): string {
    const role = this.auth.userRole();
    if (!role) return 'N/A';
    return role.replace('ROLE_', '').charAt(0).toUpperCase() + role.replace('ROLE_', '').slice(1).toLowerCase();
  }
}
