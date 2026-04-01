import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/api/api.service';
import { Observable } from 'rxjs';

export interface AdminStats {
  totalUsers: number;
  activeMentors: number;
  sessionsBooked: number;
  platformRevenue: string;
}

export interface PendingApproval {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience: number;
}

export interface ActivityItem {
  icon: string;
  iconColor: string;
  text: string;
  time: string;
}

export interface PerformanceMetric {
  label: string;
  value: number;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = inject(ApiService);

  getStats(): Observable<AdminStats> {
    return this.api.get('/admin/stats');
  }

  getPendingApprovals(): Observable<PendingApproval[]> {
    return this.api.get('/admin/pending-approvals');
  }

  approveMentor(id: string): Observable<void> {
    return this.api.post(`/admin/approve-mentor/${id}`, {});
  }

  rejectMentor(id: string): Observable<void> {
    return this.api.post(`/admin/reject-mentor/${id}`, {});
  }
}