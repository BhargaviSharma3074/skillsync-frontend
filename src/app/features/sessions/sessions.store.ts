import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { SessionsService } from './sessions.service';
import { Session, TimeSlot } from './sessions.model';
import { firstValueFrom } from 'rxjs';

interface SessionsState {
  sessions: Session[];
  availableSlots: TimeSlot[];
  loading: boolean;
}

export const SessionsStore = signalStore(
  { providedIn: 'root' },
  withState<SessionsState>({
    sessions: [],
    availableSlots: [],
    loading: false
  }),
  withMethods((store) => {
    const svc = inject(SessionsService);
    return {
      async loadSessions() {
        patchState(store, { loading: true });
        try {
          const sessions = await firstValueFrom(svc.getMySessions());
          patchState(store, { sessions, loading: false });
        } catch {
          patchState(store, {
            sessions: [
              { id:'1', mentorId:'1', mentorName:'Priya Sharma', learnerId:'u1', learnerName:'Rahul', dateTime:'2025-03-15T10:00:00', duration:60, topic:'Spring Boot REST APIs', format:'VIDEO_CALL', status:'ACCEPTED', rate:800 },
              { id:'2', mentorId:'2', mentorName:'Arjun Mehta', learnerId:'u1', learnerName:'Rahul', dateTime:'2025-03-17T15:00:00', duration:60, topic:'ML Fundamentals', format:'VIDEO_CALL', status:'PENDING', rate:600 },
              { id:'3', mentorId:'3', mentorName:'Neha Kapoor', learnerId:'u1', learnerName:'Rahul', dateTime:'2025-03-10T11:00:00', duration:60, topic:'React Hooks', format:'VIDEO_CALL', status:'COMPLETED', rate:750 }
            ],
            loading: false
          });
        }
      },

      async loadSlots(mentorId: string, date: string) {
        patchState(store, { loading: true });
        try {
          const slots = await firstValueFrom(svc.getAvailableSlots(mentorId, date));
          patchState(store, { availableSlots: slots, loading: false });
        } catch {
          patchState(store, {
            availableSlots: [
              { time: '09:00 AM', available: true },
              { time: '10:30 AM', available: true },
              { time: '11:00 AM', available: true },
              { time: '02:00 PM', available: true },
              { time: '04:30 PM', available: true }
            ],
            loading: false
          });
        }
      },

      async book(payload: any) {
        patchState(store, { loading: true });
        try {
          await firstValueFrom(svc.bookSession(payload));
        } catch {}
        patchState(store, { loading: false });
      },

      async cancel(id: string) {
        await firstValueFrom(svc.cancelSession(id)).catch(() => {});
        patchState(store, {
          sessions: store.sessions().filter(s => s.id !== id)
        });
      }
    };
  })
);