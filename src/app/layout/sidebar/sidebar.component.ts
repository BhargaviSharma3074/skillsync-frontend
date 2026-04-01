import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface NavGroup {
  heading?: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatListModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private auth = inject(AuthService);
  @Input() collapsed = false;

  get navGroups(): NavGroup[] {
    const role = this.auth.userRole();
    if (role === 'ADMIN') return this.adminNav;
    if (role === 'MENTOR') return this.mentorNav;
    return this.learnerNav;
  }

  private learnerNav: NavGroup[] = [
    {
      items: [
        { label: 'Dashboard',       icon: 'dashboard',        route: '/dashboard' },
        { label: 'Find Mentors',    icon: 'person_search',    route: '/mentors' },
        { label: 'My Sessions',     icon: 'event_note',       route: '/sessions' },
        { label: 'Learning Groups', icon: 'groups',           route: '/groups' },
        { label: 'Reviews',         icon: 'star_rate',        route: '/reviews' },
      ]
    },
    {
      heading: 'ACCOUNT',
      items: [
        { label: 'My Profile',    icon: 'person',        route: '/profile' },
        { label: 'Notifications', icon: 'notifications', route: '/notifications' },
        { label: 'Settings',      icon: 'settings',      route: '/settings' },
      ]
    }
  ];

  private mentorNav: NavGroup[] = [
    {
      items: [
        { label: 'Dashboard',       icon: 'dashboard',     route: '/dashboard' },
        { label: 'My Sessions',     icon: 'event_note',    route: '/sessions' },
        { label: 'Learning Groups', icon: 'groups',        route: '/groups' },
        { label: 'Reviews',         icon: 'star_rate',     route: '/reviews' },
      ]
    },
    {
      heading: 'ACCOUNT',
      items: [
        { label: 'My Profile',    icon: 'person',        route: '/profile' },
        { label: 'Notifications', icon: 'notifications', route: '/notifications' },
        { label: 'Settings',      icon: 'settings',      route: '/settings' },
      ]
    }
  ];

  private adminNav: NavGroup[] = [
    {
      items: [
        { label: 'Dashboard',         icon: 'dashboard',        route: '/dashboard' },
        { label: 'Manage Users',      icon: 'manage_accounts',  route: '/admin/users' },
        { label: 'Mentor Approvals',  icon: 'how_to_reg',       route: '/admin/approvals' },
        { label: 'All Sessions',      icon: 'event_note',       route: '/sessions' },
        { label: 'Learning Groups',   icon: 'groups',           route: '/groups' },
      ]
    },
    {
      heading: 'PLATFORM',
      items: [
        { label: 'Skill Catalog',  icon: 'category',      route: '/admin/skills' },
        { label: 'Notifications',  icon: 'notifications',  route: '/notifications' },
        { label: 'Settings',       icon: 'settings',       route: '/settings' },
      ]
    }
  ];
}