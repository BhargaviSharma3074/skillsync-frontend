import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState, withHooks } from '@ngrx/signals';
import { ApiService } from '../../core/api/api.service';
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
}

const initialState: LearnerDashboardState = {
  stats: { upcomingSessions: 0, connectedMentors: 0, activeGroups: 0, sessionsCompleted: 0 },
  mentors: [],
  sessions: [],
  loading: false
};

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const api = inject(ApiService);
    return {
      async loadLearnerDashboard() {
        patchState(store, { loading: true });
        try {
          const [stats, mentors, sessions] = await Promise.all([
            firstValueFrom(api.get<DashboardStats>('/dashboard/stats')),
            firstValueFrom(api.get<RecommendedMentor[]>('/dashboard/recommended-mentors')),
            firstValueFrom(api.get<UpcomingSession[]>('/dashboard/upcoming-sessions'))
          ]);
          patchState(store, { stats, mentors, sessions, loading: false });
        } catch {
          // Fallback mock data for development
          patchState(store, {
            stats: { upcomingSessions: 2, connectedMentors: 4, activeGroups: 3, sessionsCompleted: 12 },
            mentors: [
              { id: '1', name: 'Priya Sharma', experience: 8, rating: 4.9, reviewCount: 42, skills: ['Spring Boot', 'Java', 'REST APIs'], hourlyRate: 800 },
              { id: '2', name: 'Arjun Mehta', experience: 5, rating: 4.7, reviewCount: 28, skills: ['Machine Learning', 'Python'], hourlyRate: 600 },
              { id: '3', name: 'Neha Kapoor', experience: 6, rating: 4.8, reviewCount: 35, skills: ['React', 'Node.js', 'TypeScript'], hourlyRate: 750 }
            ],
            sessions: [
              { id: '1', dateTime: '2025-03-15T10:00:00', mentorName: 'Priya Sharma', topic: 'Spring Boot REST APIs', duration: 60, status: 'ACCEPTED' },
              { id: '2', dateTime: '2025-03-17T15:00:00', mentorName: 'Arjun Mehta', topic: 'ML Fundamentals', duration: 60, status: 'PENDING' }
            ],
            loading: false
          });
        }
      }
    };
  })
);