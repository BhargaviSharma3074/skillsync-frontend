import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import {
  AdminStats,
  PendingApproval,
  ActivityItem,
  PerformanceMetric,
  AdminService
} from './admin.service';
import { firstValueFrom } from 'rxjs';

interface AdminState {
  stats: AdminStats;
  pendingApprovals: PendingApproval[];
  recentActivity: ActivityItem[];
  performance: PerformanceMetric[];
  loading: boolean;
}

const initial: AdminState = {
  stats: { totalUsers: 0, activeMentors: 0, sessionsBooked: 0, platformRevenue: '₹0' },
  pendingApprovals: [],
  recentActivity: [],
  performance: [],
  loading: false
};

export const AdminStore = signalStore(
  { providedIn: 'root' },
  withState(initial),
  withMethods((store) => {
    const svc = inject(AdminService);
    return {
      async load() {
        patchState(store, { loading: true });
        try {
          const stats = await firstValueFrom(svc.getStats());
          const approvals = await firstValueFrom(svc.getPendingApprovals());
          patchState(store, { stats, pendingApprovals: approvals, loading: false });
        } catch {
          // Mock data
          patchState(store, {
            stats: { totalUsers: 1248, activeMentors: 318, sessionsBooked: 4521, platformRevenue: '₹2.1M' },
            pendingApprovals: [
              { id: '1', name: 'Vivek Singh',  email: 'vivek@gmail.com',  skills: ['React', 'TypeScript'], experience: 5 },
              { id: '2', name: 'Sneha Patel',  email: 'sneha@gmail.com',  skills: ['Data Science', 'R'],   experience: 3 },
              { id: '3', name: 'Karan Mehta',  email: 'karan@gmail.com',  skills: ['DevOps', 'Kubernetes'], experience: 7 }
            ],
            recentActivity: [
              { icon: 'check_circle', iconColor: '#4caf50', text: 'Mentor **Divya Verma** approved',        time: '5 min ago' },
              { icon: 'event',        iconColor: '#2196f3', text: 'New session booked by **Rahul S.**',     time: '12 min ago' },
              { icon: 'groups',       iconColor: '#ff9800', text: 'Group **DSA Prep** reached 100 members', time: '1h ago' },
              { icon: 'star',         iconColor: '#f4c150', text: '**Priya Sharma** received 5-star review',time: '2h ago' },
              { icon: 'person_add',   iconColor: '#2196f3', text: '14 new users registered today',         time: '3h ago' },
              { icon: 'flag',         iconColor: '#e94560', text: 'Report filed on group **XYZ**',          time: '5h ago' }
            ],
            performance: [
              { label: 'Session Completion Rate', value: 82, color: '#e94560' },
              { label: 'Mentor Satisfaction Score', value: 91, color: '#4caf50' },
              { label: 'Group Engagement Rate',    value: 65, color: '#ff9800' },
              { label: 'Learner Retention',        value: 78, color: '#2196f3' }
            ],
            loading: false
          });
        }
      },

      async approve(id: string) {
        await firstValueFrom(svc.approveMentor(id)).catch(() => {});
        patchState(store, {
          pendingApprovals: store.pendingApprovals().filter(a => a.id !== id)
        });
      },

      async reject(id: string) {
        await firstValueFrom(svc.rejectMentor(id)).catch(() => {});
        patchState(store, {
          pendingApprovals: store.pendingApprovals().filter(a => a.id !== id)
        });
      }
    };
  })
);