import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/auth/auth.service';
import { avatarColor } from '../../shared/utils/avatar-color';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatBadgeModule, MatDividerModule, MatButtonModule, MatMenuModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  auth = inject(AuthService);

  get initials(): string {
    return this.auth.getInitials();
  }

  get bgColor(): string {
    const u = this.auth.currentUser();
    return avatarColor(u ? u.firstName + u.lastName : 'U');
  }

  logout() {
    this.auth.logout();
  }
}