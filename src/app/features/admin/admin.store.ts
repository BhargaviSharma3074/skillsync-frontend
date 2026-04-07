
import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { ApiService } from '../../core/api/api.service';
import { firstValueFrom } from 'rxjs';

export interface PendingApproval {
  id: string;
  userId: string;
  name: string;
  email: string;
  experience: number;
  skills: string[];
  bio: string;
  hourlyRate: number;
  status: string;
}

export interface AdminGroup {
  id: string;
  name: string;
  description: string;
  createdBy: string | number;
  createdAt: string;
  active: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeMentors: number;
  totalGroups: number;
  platformRevenue: string;
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

interface AdminState {
  stats: AdminStats;
  pendingApprovals: PendingApproval[];
  groups: AdminGroup[];
  users: RawUser[];
  skills: string[];
  recentActivity: ActivityItem[];
  performance: PerformanceMetric[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: {
    totalUsers: 0,
    activeMentors: 0,
    totalGroups: 0,
    platformRevenue: '₹0'
  },
  pendingApprovals: [],
  groups: [],
  users: [],
  skills: [],
  recentActivity: [],
  performance: [],
  loading: false,
  error: null
};

interface RawMentor {
  id: number;
  userId: number;
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
  experience: number;
  hourlyRate: number;
  status: string;
  skills?: string[];
}

interface RawUser {
  id: number;
  username: string;
  name?: string;
  email: string;
  role: string;
  status: string;
}

interface RawGroup {
  id: number;
  name: string;
  description?: string;
  createdBy?: number;
  createdAt?: string;
  active?: boolean;
}

export const AdminStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const api = inject(ApiService);

    return {

      // ── Load all admin data ────────────────────────────
      async load() {
        patchState(store, { loading: true, error: null });

        try {
          const [allMentorsResult, usersResult, groupsResult, skillsResult] = await Promise.allSettled([
            firstValueFrom(api.get<RawMentor[]>('/admin/mentors')),
            firstValueFrom(api.get<RawUser[]>('/admin/users')),
            firstValueFrom(api.get<RawGroup[]>('/admin/groups')),
            firstValueFrom(api.get<string[]>('/admin/skills'))
          ]);

          const allMentors = allMentorsResult.status === 'fulfilled' ? allMentorsResult.value : [];
          const users      = usersResult.status === 'fulfilled'      ? usersResult.value      : [];
          const rawGroups  = groupsResult.status === 'fulfilled'     ? groupsResult.value     : [];
          const skills     = skillsResult.status === 'fulfilled'      ? skillsResult.value     : ['Angular', 'React', 'Node.js', 'Python', 'Java', 'SQL'];

          // Build user map
          const userMap = new Map<number, RawUser>();
          users.forEach(u => userMap.set(u.id, u));

          // Filter mentors by status
          const activeMentors  = allMentors.filter(m => m.status === 'ACTIVE');
          const pendingMentors = allMentors.filter(m => m.status === 'PENDING');

          // Map pending approvals
          const pendingApprovals: PendingApproval[] = pendingMentors.map(m => {
            const user = userMap.get(m.userId);
            return {
              id: String(m.id),
              userId: String(m.userId),
              name: user?.name || user?.username || m.name || m.username || `User #${m.userId}`,
              email: user?.email || m.email || '',
              experience: m.experience ?? 0,
              skills: m.skills ?? [],
              bio: m.bio ?? '',
              hourlyRate: m.hourlyRate ?? 0,
              status: m.status
            };
          });

          // Map groups
          const groups: AdminGroup[] = rawGroups.map(g => ({
            id: String(g.id),
            name: g.name,
            description: g.description ?? '',
            createdBy: g.createdBy ?? 0,
            createdAt: g.createdAt ?? '',
            active: g.active ?? true
          }));

          const stats: AdminStats = {
            totalUsers: users.length,
            activeMentors: activeMentors.length,
            totalGroups: groups.length,
            platformRevenue: '₹0'
          };

          const recentActivity: ActivityItem[] = [
            {
              icon: 'people',
              iconColor: '#16a34a',
              text: `<strong>${stats.totalUsers}</strong> total users on platform`,
              time: 'Now'
            },
            {
              icon: 'school',
              iconColor: '#0984e3',
              text: `<strong>${activeMentors.length}</strong> active mentors`,
              time: 'Now'
            },
            {
              icon: 'pending_actions',
              iconColor: '#f59e0b',
              text: `<strong>${pendingApprovals.length}</strong> mentor applications pending`,
              time: 'Now'
            },
            {
              icon: 'groups',
              iconColor: '#6c5ce7',
              text: `<strong>${groups.length}</strong> learning groups on platform`,
              time: 'Now'
            }
          ];

          const performance: PerformanceMetric[] = [
            { label: 'Mentor Approval Rate',    value: 78, color: '#16a34a' },
            { label: 'Session Completion Rate', value: 91, color: '#0984e3' },
            { label: 'User Satisfaction',       value: 88, color: '#e94560' },
            { label: 'Platform Uptime',         value: 99, color: '#6c5ce7' }
          ];

          patchState(store, {
            stats,
            pendingApprovals,
            groups,
            users,
            skills,
            recentActivity,
            performance,
            loading: false,
            error: null
          });

          console.log('✅ Admin loaded:', {
            users: users.length,
            activeMentors: activeMentors.length,
            pendingMentors: pendingMentors.length,
            groups: groups.length
          });

        } catch (err: any) {
          console.error('❌ Admin load error:', err);
          patchState(store, {
            loading: false,
            error: 'Failed to load admin data.'
          });
        }
      },

      // ── Approve mentor ─────────────────────────────────
      async approve(mentorId: string) {
        try {
          await firstValueFrom(api.put(`/admin/mentors/${mentorId}/approve`, {}));
          patchState(store, {
            pendingApprovals: store.pendingApprovals().filter(a => a.id !== mentorId),
            stats: { ...store.stats(), activeMentors: store.stats().activeMentors + 1 }
          });
          console.log('✅ Mentor approved:', mentorId);
        } catch (err) {
          console.error('❌ Approve error:', err);
        }
      },

      // ── Reject mentor ──────────────────────────────────
      async reject(mentorId: string) {
        try {
          patchState(store, {
            pendingApprovals: store.pendingApprovals().filter(a => a.id !== mentorId)
          });
        } catch (err) {
          console.error('❌ Reject error:', err);
        }
      },

      // ── Delete group permanently ───────────────────────
      async deleteGroup(groupId: string) {
        try {
          await firstValueFrom(api.delete(`/admin/groups/${groupId}`));
          patchState(store, {
            groups: store.groups().filter(g => g.id !== groupId),
            stats: {
              ...store.stats(),
              totalGroups: store.stats().totalGroups - 1
            }
          });
          console.log('✅ Group deleted:', groupId);
          return true;
        } catch (err) {
          console.error('❌ Delete group error:', err);
          return false;
        }
      },

      // ── Deactivate group ───────────────────────────────
      async deactivateGroup(groupId: string) {
        try {
          await firstValueFrom(api.put(`/admin/groups/${groupId}/deactivate`, {}));
          patchState(store, {
            groups: store.groups().map(g =>
              g.id === groupId ? { ...g, active: false } : g
            )
          });
          console.log('✅ Group deactivated:', groupId);
          return true;
        } catch (err) {
          console.error('❌ Deactivate group error:', err);
          return false;
        }
      },

      // ── Skills Management ─────────────────────────────
      async addSkill(skill: string) {
        try {
          // If backend doesn't exist, we optimistic update
          await firstValueFrom(api.post('/admin/skills', { name: skill })).catch(() => {});
          patchState(store, { skills: [...store.skills(), skill] });
          console.log('✅ Skill added:', skill);
        } catch (err) {
          console.error('❌ Add skill error:', err);
        }
      },

      async removeSkill(skill: string) {
        try {
          await firstValueFrom(api.delete(`/admin/skills/${skill}`)).catch(() => {});
          patchState(store, { skills: store.skills().filter(s => s !== skill) });
          console.log('✅ Skill removed:', skill);
        } catch (err) {
          console.error('❌ Remove skill error:', err);
        }
      },

      // ── User Management ──────────────────────────────
      async toggleUserStatus(userId: number, currentStatus: string) {
        const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        try {
          await firstValueFrom(api.put(`/admin/users/${userId}/status`, { status: newStatus }));
          patchState(store, {
            users: store.users().map(u => u.id === userId ? { ...u, status: newStatus } : u)
          });
          console.log(`✅ User #${userId} status changed to ${newStatus}`);
        } catch (err) {
          console.error('❌ Toggle status error:', err);
        }
      }
    };
  })
);