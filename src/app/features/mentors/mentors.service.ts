// import { Injectable, inject } from '@angular/core';
// import { Observable, forkJoin, of } from 'rxjs';
// import { map, catchError, switchMap } from 'rxjs/operators';
// import { ApiService } from '../../core/api/api.service';
// import { UserService } from '../../core/services/user.service';
// import { Mentor, MentorFilter, RawMentorResponse } from './mentors.model';

// @Injectable({ providedIn: 'root' })
// export class MentorsService {
//   private api = inject(ApiService);
//   private userService = inject(UserService);

//   search(filter: MentorFilter): Observable<Mentor[]> {
//     return this.api.get<RawMentorResponse[]>('/mentors', filter as Record<string, any>).pipe(
//       switchMap(mentors => this.enrichMentorsWithUserData(mentors)),
//       catchError(err => {
//         console.error('Mentor search failed:', err);
//         return of([]);
//       })
//     );
//   }

//   getById(id: string): Observable<Mentor> {
//     return this.api.get<RawMentorResponse>(`/mentors/${id}`).pipe(
//       switchMap(mentor => this.enrichMentorWithUserData(mentor)),
//       catchError(err => {
//         console.error('Mentor fetch failed:', err);
//         throw err;
//       })
//     );
//   }

//   // ✅ Enrich single mentor with user data
//   private enrichMentorWithUserData(rawMentor: RawMentorResponse): Observable<Mentor> {
//     return this.userService.getUserById(rawMentor.userId).pipe(
//       map(user => this.mapToMentor(rawMentor, user)),
//       catchError(() => of(this.mapToMentor(rawMentor, null)))
//     );
//   }

//   // ✅ Enrich multiple mentors with user data
//   private enrichMentorsWithUserData(rawMentors: RawMentorResponse[]): Observable<Mentor[]> {
//     if (rawMentors.length === 0) return of([]);

//     // Get unique user IDs
//     const userIds = [...new Set(rawMentors.map(m => m.userId))];

//     // Fetch all users in parallel
//     const userRequests = userIds.map(id => 
//       this.userService.getUserById(id).pipe(
//         catchError(() => of(null))
//       )
//     );

//     return forkJoin(userRequests).pipe(
//       map(users => {
//         // Create a map of userId -> user
//         const userMap = new Map();
//         users.forEach((user, index) => {
//           if (user) {
//             userMap.set(userIds[index], user);
//           }
//         });

//         // Map mentors with user data
//         return rawMentors.map(mentor => 
//           this.mapToMentor(mentor, userMap.get(mentor.userId) || null)
//         );
//       })
//     );
//   }

//   // ✅ Map raw mentor + user data to Mentor interface
//   private mapToMentor(raw: RawMentorResponse, user: any): Mentor {
//     return {
//       id: String(raw.id),
//       userId: String(raw.userId),
//       name: user?.name || `Mentor #${raw.id}`,
//       userName: user?.name,
//       userEmail: user?.email,
//       experience: raw.experience || 0,
//       rating: raw.rating || 0,
//       reviewCount: raw.reviewCount || 0,
//       skills: raw.skills || [],
//       hourlyRate: raw.hourlyRate || 0,
//       available: raw.status === 'ACTIVE',
//       bio: raw.bio,
//       availability: raw.availability,
//       status: raw.status
//     };
//   }
// }


// src/app/features/mentors/mentors.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../core/api/api.service';
import { UserService } from '../../core/services/user.service';
import { Mentor, MentorFilter, RawMentorResponse } from './mentors.model';

@Injectable({ providedIn: 'root' })
export class MentorsService {
  private api = inject(ApiService);
  private userService = inject(UserService);

  // ✅ FIXED: handle paginated response
  search(filter: MentorFilter): Observable<Mentor[]> {
    console.log('🔍 MentorsService.search() called with filter:', filter);

    return this.api.get<any>('/mentors', filter as Record<string, any>).pipe(
      tap(res => {
        console.log('📥 Raw mentors response:', res);
      }),

      // ✅ FIX: extract content array
      map(res => res?.content ?? []),

      tap(mentors => {
        console.log(`   Total mentors: ${mentors.length}`);
      }),

      switchMap(mentors => {
        console.log('🔄 Starting to enrich mentors with user data...');
        return this.enrichMentorsWithUserData(mentors);
      }),

      tap(enriched => {
        console.log('✅ Mentors enriched:', enriched);
      }),

      catchError(err => {
        console.error('❌ Mentor search failed:', err);
        return of([]);
      })
    );
  }

  getById(id: string): Observable<Mentor> {
    console.log(`🔍 MentorsService.getById(${id}) called`);

    return this.api.get<RawMentorResponse>(`/mentors/${id}`).pipe(
      tap(mentor => console.log('📥 Raw mentor received:', mentor)),

      switchMap(mentor => this.enrichMentorWithUserData(mentor)),

      tap(enriched => console.log('✅ Mentor enriched:', enriched)),

      catchError(err => {
        console.error('❌ Mentor fetch failed:', err);
        throw err;
      })
    );
  }

  private enrichMentorWithUserData(rawMentor: RawMentorResponse): Observable<Mentor> {
    return this.userService.getUserById(rawMentor.userId).pipe(
      map(user => this.mapToMentor(rawMentor, user)),

      catchError(() => {
        return of(this.mapToMentor(rawMentor, null));
      })
    );
  }

  private enrichMentorsWithUserData(rawMentors: RawMentorResponse[]): Observable<Mentor[]> {
    if (!rawMentors.length) return of([]);

    const userIds = [...new Set(rawMentors.map(m => m.userId))];

    const userRequests = userIds.map(id =>
      this.userService.getUserById(id).pipe(
        catchError(() => of(null))
      )
    );

    return forkJoin(userRequests).pipe(
      map(users => {
        const userMap = new Map();

        users.forEach((user, index) => {
          if (user) userMap.set(userIds[index], user);
        });

        return rawMentors.map(mentor =>
          this.mapToMentor(mentor, userMap.get(mentor.userId))
        );
      })
    );
  }

  private mapToMentor(raw: RawMentorResponse, user: any): Mentor {
    return {
      id: String(raw.id),
      userId: String(raw.userId),
      name: user?.name || `Mentor #${raw.id}`,
      userName: user?.name,
      userEmail: user?.email,
      experience: raw.experience || 0,
      rating: raw.rating || 0,
      reviewCount: raw.reviewCount || 0,
      skills: raw.skills || [],
      hourlyRate: raw.hourlyRate || 0,
      available: raw.status === 'ACTIVE',
      bio: raw.bio,
      availability: raw.availability,
      status: raw.status
    };
  }
}