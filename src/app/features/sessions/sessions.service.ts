import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api/api.service';
import { Session, TimeSlot, BookingPayload } from './sessions.model';

@Injectable({ providedIn: 'root' })
export class SessionsService {
  private api = inject(ApiService);

  getMySessions(): Observable<Session[]> {
    return this.api.get<Session[]>('/sessions/me');
  }

  getAvailableSlots(mentorId: string, date: string): Observable<TimeSlot[]> {
    return this.api.get<TimeSlot[]>(`/sessions/slots/${mentorId}`, { date });
  }

  bookSession(payload: BookingPayload): Observable<Session> {
    return this.api.post<Session>('/sessions/book', payload);
  }

  cancelSession(id: string): Observable<void> {
    return this.api.delete<void>(`/sessions/${id}`);
  }

  getMentorPendingSessions(): Observable<Session[]> {
    return this.api.get<Session[]>('/sessions/mentor/pending');
  }

  acceptSession(id: string): Observable<Session> {
    return this.api.put<Session>(`/sessions/${id}/accept`, {});
  }

  rejectSession(id: string): Observable<Session> {
    return this.api.put<Session>(`/sessions/${id}/reject`, {});
  }
}