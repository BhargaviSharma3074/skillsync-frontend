// // src/app/features/dashboard/dashboard.store.ts
// import { inject } from '@angular/core';
// import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
// import { MentorsService } from '../mentors/mentors.service';
// import { Mentor } from '../mentors/mentors.model';
// import { firstValueFrom } from 'rxjs';

// interface Session {
//   id: string;
//   dateTime: string;
//   mentorName: string;
//   topic: string;
//   duration: number;
//   status: string;
// }

// interface DashboardState {
//   mentors: Mentor[];
//   sessions: Session[];
//   stats: {
//     upcomingSessions: number;
//     connectedMentors: number;
//     activeGroups: number;
//     sessionsCompleted: number;
//   };
//   loading: boolean;
//   error: string | null;
// }

// export const DashboardStore = signalStore(
//   { providedIn: 'root' },
//   withState<DashboardState>({
//     mentors: [],
//     sessions: [],
//     stats: {
//       upcomingSessions: 0,
//       connectedMentors: 0,
//       activeGroups: 0,
//       sessionsCompleted: 0
//     },
//     loading: false,
//     error: null
//   }),
//   withMethods((store) => {
//     const mentorsService = inject(MentorsService);

//     return {
//       async loadLearnerDashboard() {
//         patchState(store, { loading: true, error: null });

//         try {
//           console.log('🔄 Loading learner dashboard...');

//           // ✅ Fetch mentors from backend (will enrich with user data)
//           console.log('📤 Calling mentorsService.search()...');
//           const mentors = await firstValueFrom(
//             mentorsService.search({ sort: 'rating' })
//           );

//           console.log('✅ Mentors loaded:', mentors);

//           // Mock stats (replace with actual API calls later)
//           const stats = {
//             upcomingSessions: 3,
//             connectedMentors: mentors.length,
//             activeGroups: 2,
//             sessionsCompleted: 12
//           };

//           // Mock sessions (replace with actual API call)
//           const sessions: Session[] = [];

//           patchState(store, {
//             mentors: mentors.slice(0, 6), // Top 6 mentors for recommendations
//             sessions,
//             stats,
//             loading: false
//           });

//           console.log('✅ Dashboard loaded successfully');

//         } catch (err: any) {
//           console.error('❌ Dashboard load error:', err);
//           patchState(store, {
//             loading: false,
//             error: err?.error?.message || 'Failed to load dashboard data'
//           });
//         }
//       }
//     };
//   })
// );


// src/app/features/dashboard/dashboard.store.ts
import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { MentorsService } from '../mentors/mentors.service';
import { Mentor } from '../mentors/mentors.model';
import { firstValueFrom } from 'rxjs';

interface Session {
  id: string;
  dateTime: string;
  mentorName: string;
  topic: string;
  duration: number;
  status: string;
}

interface DashboardState {
  mentors: Mentor[];
  sessions: Session[];
  stats: {
    upcomingSessions: number;
    connectedMentors: number;
    activeGroups: number;
    sessionsCompleted: number;
  };
  loading: boolean;
  error: string | null;
}

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState<DashboardState>({
    mentors: [],
    sessions: [],
    stats: {
      upcomingSessions: 0,
      connectedMentors: 0,
      activeGroups: 0,
      sessionsCompleted: 0
    },
    loading: false,
    error: null
  }),
  withMethods((store) => {
    const mentorsService = inject(MentorsService); // ✅ Inject the correct service

    return {
      async loadLearnerDashboard() {
        patchState(store, { loading: true, error: null });

        try {
          console.log('🔄 Loading learner dashboard...');

          // ✅ Use MentorsService which enriches with user data
          console.log('📤 Calling mentorsService.search()...');
          
          const mentors = await firstValueFrom(
            mentorsService.search({ sort: 'rating' })
          );

          console.log('✅ Mentors loaded from service:', mentors);

          // Calculate stats
          const stats = {
            upcomingSessions: 0,
            connectedMentors: mentors.length,
            activeGroups: 0,
            sessionsCompleted: 0
          };

          // Mock sessions (replace with actual API call later)
          const sessions: Session[] = [];

          const dashboardData = {
            mentors: mentors.slice(0, 6), // Top 6 mentors
            sessions,
            stats,
            loading: false
          };

          console.log('✅ Dashboard loaded:', dashboardData);

          patchState(store, dashboardData);

        } catch (err: any) {
          console.error('❌ Dashboard load error:', err);
          patchState(store, {
            loading: false,
            error: err?.error?.message || 'Failed to load dashboard data'
          });
        }
      },

      async loadMentorDashboard() {
        patchState(store, { loading: true, error: null });

        try {
          console.log('🔄 Loading mentor dashboard...');

          // Mock data for mentor dashboard
          const stats = {
            upcomingSessions: 0,
            connectedMentors: 0,
            activeGroups: 0,
            sessionsCompleted: 0
          };

          patchState(store, {
            mentors: [],
            sessions: [],
            stats,
            loading: false
          });

        } catch (err: any) {
          console.error('❌ Mentor dashboard load error:', err);
          patchState(store, {
            loading: false,
            error: 'Failed to load dashboard'
          });
        }
      }
    };
  })
);