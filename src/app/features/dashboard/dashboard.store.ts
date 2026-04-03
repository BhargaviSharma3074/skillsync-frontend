// import { computed, inject } from '@angular/core';
// import { signalStore, withState, withComputed, withMethods, patchState, withHooks } from '@ngrx/signals';
// import { ApiService } from '../../core/api/api.service';
// import { firstValueFrom } from 'rxjs';

// export interface DashboardStats {
//   upcomingSessions: number;
//   connectedMentors: number;
//   activeGroups: number;
//   sessionsCompleted: number;
// }

// export interface RecommendedMentor {
//   id: string;
//   name: string;
//   experience: number;
//   rating: number;
//   reviewCount: number;
//   skills: string[];
//   hourlyRate: number;
// }

// export interface UpcomingSession {
//   id: string;
//   dateTime: string;
//   mentorName: string;
//   topic: string;
//   duration: number;
//   status: 'ACCEPTED' | 'PENDING' | 'CANCELLED';
// }

// export interface LearnerDashboardState {
//   stats: DashboardStats;
//   mentors: RecommendedMentor[];
//   sessions: UpcomingSession[];
//   loading: boolean;
// }

// const initialState: LearnerDashboardState = {
//   stats: { upcomingSessions: 0, connectedMentors: 0, activeGroups: 0, sessionsCompleted: 0 },
//   mentors: [],
//   sessions: [],
//   loading: false
// };

// export const DashboardStore = signalStore(
//   { providedIn: 'root' },
//   withState(initialState),
//   withMethods((store) => {
//     const api = inject(ApiService);
//     return {
//       async loadLearnerDashboard() {
//         patchState(store, { loading: true });
//         try {
//           const [stats, mentors, sessions] = await Promise.all([
//             firstValueFrom(api.get<DashboardStats>('/dashboard/stats')),
//             firstValueFrom(api.get<RecommendedMentor[]>('/dashboard/recommended-mentors')),
//             firstValueFrom(api.get<UpcomingSession[]>('/dashboard/upcoming-sessions'))
//           ]);
//           patchState(store, { stats, mentors, sessions, loading: false });
//         } catch {
//           // Fallback mock data for development
//           patchState(store, {
//             stats: { upcomingSessions: 2, connectedMentors: 4, activeGroups: 3, sessionsCompleted: 12 },
//             mentors: [
//               { id: '1', name: 'Priya Sharma', experience: 8, rating: 4.9, reviewCount: 42, skills: ['Spring Boot', 'Java', 'REST APIs'], hourlyRate: 800 },
//               { id: '2', name: 'Arjun Mehta', experience: 5, rating: 4.7, reviewCount: 28, skills: ['Machine Learning', 'Python'], hourlyRate: 600 },
//               { id: '3', name: 'Neha Kapoor', experience: 6, rating: 4.8, reviewCount: 35, skills: ['React', 'Node.js', 'TypeScript'], hourlyRate: 750 }
//             ],
//             sessions: [
//               { id: '1', dateTime: '2025-03-15T10:00:00', mentorName: 'Priya Sharma', topic: 'Spring Boot REST APIs', duration: 60, status: 'ACCEPTED' },
//               { id: '2', dateTime: '2025-03-17T15:00:00', mentorName: 'Arjun Mehta', topic: 'ML Fundamentals', duration: 60, status: 'PENDING' }
//             ],
//             loading: false
//           });
//         }
//       }
//     };
//   })
// );




import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { firstValueFrom } from 'rxjs';

export interface DashboardStats {
  upcomingSessions: number;
  connectedMentors: number;
  activeGroups: number;
  sessionsCompleted: number;
}

export interface RecommendedMentor {
  id: string;
  name: string;
  experience: number;
  rating: number;
  reviewCount: number;
  skills: string[];
  hourlyRate: number;
}

export interface UpcomingSession {
  id: string;
  dateTime: string;
  mentorName: string;
  topic: string;
  duration: number;
  status: 'ACCEPTED' | 'PENDING' | 'CANCELLED';
}

export interface LearnerDashboardState {
  stats: DashboardStats;
  mentors: RecommendedMentor[];
  sessions: UpcomingSession[];
  loading: boolean;
  error: string | null;
}

const initialState: LearnerDashboardState = {
  stats: {
    upcomingSessions: 0,
    connectedMentors: 0,
    activeGroups: 0,
    sessionsCompleted: 0
  },
  mentors: [],
  sessions: [],
  loading: false,
  error: null
};

// ── Raw API response shapes ──────────────────────────────────────────

interface RawSession {
  id: number;
  mentorId: number;
  learnerId: number;
  mentorName?: string;
  topic?: string;
  scheduledAt?: string;
  duration?: number;
  status: string;
}

interface RawMentor {
  id: number;
  userId?: number;
  bio?: string;
  experience: number;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  status: string;
  skills?: string[];
  name?: string;
  username?: string;
}

interface RawGroup {
  id: number;
  name: string;
  memberIds?: number[];
  members?: { id: number }[];
}

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const api = inject(ApiService);
    const auth = inject(AuthService);

    return {
      async loadLearnerDashboard() {
        patchState(store, { loading: true, error: null });

        const userId = auth.currentUser()?.id;

        if (!userId) {
          patchState(store, {
            loading: false,
            error: 'User not found. Please login again.'
          });
          return;
        }

        try {
          // ── Fetch all 3 APIs in parallel ──────────────────────────
          const [rawSessions, rawMentors, rawGroups] = await Promise.all([
            firstValueFrom(
              api.get<RawSession[]>(`/sessions/user/${userId}`)
            ),
            firstValueFrom(
              api.get<RawMentor[]>('/mentors')
            ),
            firstValueFrom(
              api.get<RawGroup[]>('/groups')
            )
          ]);

          const now = new Date();
          const numericUserId = Number(userId);

          // ── Calculate Stats ───────────────────────────────────────

          // 1. Upcoming = ACCEPTED sessions scheduled in the future
          const upcomingSessions = rawSessions.filter(s =>
            s.status === 'ACCEPTED' &&
            s.scheduledAt &&
            new Date(s.scheduledAt) > now
          ).length;

          // 2. Connected Mentors = unique mentorIds across all sessions
          const uniqueMentorIds = new Set(rawSessions.map(s => s.mentorId));
          const connectedMentors = uniqueMentorIds.size;

          // 3. Active Groups = groups where this user is a member
          const activeGroups = rawGroups.filter(g => {
            // Handle both memberIds array and members array of objects
            if (g.memberIds) {
              return g.memberIds.includes(numericUserId);
            }
            if (g.members) {
              return g.members.some(m => m.id === numericUserId);
            }
            return false;
          }).length;

          // 4. Completed sessions
          const sessionsCompleted = rawSessions.filter(s =>
            s.status === 'COMPLETED'
          ).length;

          const stats: DashboardStats = {
            upcomingSessions,
            connectedMentors,
            activeGroups,
            sessionsCompleted
          };

          // ── Map Mentors ───────────────────────────────────────────
          // Only show ACTIVE mentors, max 6 for dashboard
          const mentors: RecommendedMentor[] = rawMentors
            .filter(m => m.status === 'ACTIVE')
            .slice(0, 6)
            .map(m => ({
              id: String(m.id),
              name: m.name || m.username || `Mentor #${m.id}`,
              experience: m.experience ?? 0,
              rating: m.rating ?? 0,
              reviewCount: m.reviewCount ?? 0,
              skills: m.skills ?? [],
              hourlyRate: m.hourlyRate ?? 0
            }));

          // ── Map Sessions ──────────────────────────────────────────
          // Show ACCEPTED and PENDING sessions, sorted by date
          const sessions: UpcomingSession[] = rawSessions
            .filter(s =>
              s.status === 'ACCEPTED' ||
              s.status === 'PENDING'
            )
            .sort((a, b) => {
              const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
              const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
              return dateA - dateB;
            })
            .map(s => ({
              id: String(s.id),
              dateTime: s.scheduledAt ?? new Date().toISOString(),
              mentorName: s.mentorName ?? `Mentor #${s.mentorId}`,
              topic: s.topic ?? 'Session',
              duration: s.duration ?? 60,
              status: s.status as 'ACCEPTED' | 'PENDING' | 'CANCELLED'
            }));

          // ── Update Store ──────────────────────────────────────────
          patchState(store, {
            stats,
            mentors,
            sessions,
            loading: false,
            error: null
          });

          console.log('✅ Dashboard loaded:', { stats, mentors, sessions });

        } catch (err: any) {
          console.error('❌ Dashboard load error:', err);
          patchState(store, {
            loading: false,
            error: 'Failed to load dashboard data. Please try again.'
          });
        }
      }
    };
  })
);