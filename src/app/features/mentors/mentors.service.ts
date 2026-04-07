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

  search(filter: MentorFilter): Observable<Mentor[]> {
    console.log('🔍 MentorsService.search() called with filter:', filter);
    
    return this.api.get<RawMentorResponse[]>('/mentors', filter as Record<string, any>).pipe(
      tap(mentors => {
        console.log('📥 Raw mentors received from backend:', mentors);
        console.log(`   Total mentors: ${mentors.length}`);
      }),
      switchMap(mentors => {
        console.log('🔄 Starting to enrich mentors with user data...');
        return this.enrichMentorsWithUserData(mentors);
      }),
      tap(enriched => {
        console.log('✅ Mentors enriched with user data:', enriched);
        enriched.forEach(m => {
          console.log(`   - Mentor ${m.id}: "${m.name}" (userId: ${m.userId})`);
        });
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
    console.log(`🔄 Enriching single mentor ${rawMentor.id} (userId: ${rawMentor.userId})`);
    
    return this.userService.getUserById(rawMentor.userId).pipe(
      tap(user => console.log(`✅ User data received for mentor ${rawMentor.id}:`, user)),
      map(user => this.mapToMentor(rawMentor, user)),
      catchError(err => {
        console.warn(`⚠️ Failed to fetch user for mentor ${rawMentor.id}, using fallback`, err);
        return of(this.mapToMentor(rawMentor, null));
      })
    );
  }

  private enrichMentorsWithUserData(rawMentors: RawMentorResponse[]): Observable<Mentor[]> {
    if (rawMentors.length === 0) {
      console.log('ℹ️ No mentors to enrich');
      return of([]);
    }

    const userIds = [...new Set(rawMentors.map(m => m.userId))];
    console.log(`🔄 Fetching user data for ${userIds.length} unique users:`, userIds);

    const userRequests = userIds.map(id => {
      return this.userService.getUserById(id).pipe(
        catchError(err => {
          console.warn(`⚠️ Failed to fetch user ${id}, using null`, err);
          return of(null);
        })
      );
    });

    return forkJoin(userRequests).pipe(
      map(users => {
        console.log(`✅ Received ${users.length} user responses`);
        
        const userMap = new Map();
        users.forEach((user, index) => {
          if (user) {
            userMap.set(userIds[index], user);
            console.log(`   ✓ User ${userIds[index]}: ${user.name}`);
          } else {
            console.log(`   ✗ User ${userIds[index]}: null (failed)`);
          }
        });

        console.log('🔗 Mapping mentors with user data...');
        return rawMentors.map(mentor => {
          const user = userMap.get(mentor.userId);
          const mapped = this.mapToMentor(mentor, user);
          console.log(`   - Mentor ${mentor.id} + User ${mentor.userId} = "${mapped.name}"`);
          return mapped;
        });
      })
    );
  }

  private mapToMentor(raw: RawMentorResponse, user: any): Mentor {
    const mentor: Mentor = {
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

    console.log(`🎯 Mapped mentor:`, {
      id: mentor.id,
      userId: mentor.userId,
      name: mentor.name,
      hasUserData: !!user
    });

    return mentor;
  }
}