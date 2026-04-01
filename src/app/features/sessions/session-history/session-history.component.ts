import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { SessionsStore } from '../sessions.store';
import { avatarColor } from '../../../shared/utils/avatar-color';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [
    CommonModule, RouterModule, DatePipe, MatTableModule,
    MatButtonModule, MatIconModule, MatTabsModule, InitialsPipe
  ],
  templateUrl: './session-history.component.html',
  styleUrl: './session-history.component.scss'
})
export class SessionHistoryComponent implements OnInit {
  store = inject(SessionsStore);
  avatarColor = avatarColor;

  displayedColumns = ['dateTime', 'mentor', 'topic', 'duration', 'status', 'actions'];
  activeTab = 0;

  ngOnInit() {
    this.store.loadSessions();
  }

  filteredSessions() {
    const all = this.store.sessions();
    if (this.activeTab === 1) return all.filter(s => s.status === 'PENDING' || s.status === 'ACCEPTED');
    if (this.activeTab === 2) return all.filter(s => s.status === 'COMPLETED');
    if (this.activeTab === 3) return all.filter(s => s.status === 'CANCELLED');
    return all;
  }

  cancel(id: string) {
    this.store.cancel(id);
  }
}