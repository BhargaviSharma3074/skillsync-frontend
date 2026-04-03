// src/app/features/dashboard/dashboard.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';

export interface DashboardStats {
    upcomingSessions: number;
    connectedMentors: number;
    activeGroups: number;
    sessionsCompleted: number;
}

export interface Session {
    id: number;
    mentorId: number;
    learnerId: number;
    status: string;        // PENDING, ACCEPTED, REJECTED, CANCELLED, COMPLETED
    scheduledAt: string;
}

export interface Group {
    id: number;
    name: string;
    memberIds: number[];
    createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private http = inject(HttpClient);
    private auth = inject(AuthService);

    getDashboardStats(): Observable<DashboardStats> {
        const userId = this.auth.currentUser()?.id;

        // Fetch sessions and groups in parallel
        return forkJoin({
            sessions: this.http.get<Session[]>(
                `${environment.apiUrl}/sessions/user/${userId}`
            ),
            groups: this.http.get<Group[]>(
                `${environment.apiUrl}/groups`
            )
        }).pipe(
            map(({ sessions, groups }) => {

                // Upcoming = ACCEPTED sessions in the future
                const now = new Date();
                const upcomingSessions = sessions.filter(s =>
                    s.status === 'ACCEPTED' &&
                    new Date(s.scheduledAt) > now
                ).length;

                // Connected mentors = unique mentorIds from all sessions
                const connectedMentors = new Set(
                    sessions.map(s => s.mentorId)
                ).size;

                // Active groups = groups where userId is a member
                const numericUserId = Number(userId);
                const activeGroups = groups.filter(g =>
                    g.memberIds?.includes(numericUserId)
                ).length;

                // Completed sessions
                const sessionsCompleted = sessions.filter(s =>
                    s.status === 'COMPLETED'
                ).length;

                return {
                    upcomingSessions,
                    connectedMentors,
                    activeGroups,
                    sessionsCompleted
                };
            })
        );
    }
}