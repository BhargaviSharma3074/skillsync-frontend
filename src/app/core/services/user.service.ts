// src/app/core/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UserResponse {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  profilePictureUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  getUserById(userId: number): Observable<UserResponse> {
    const url = `${this.baseUrl}/${userId}`;
    console.log(`🌐 Fetching user: GET ${url}`);
    
    return this.http.get<UserResponse>(url).pipe(
      tap(user => {
        console.log(`✅ User ${userId} fetched successfully:`, user);
      }),
      catchError(err => {
        console.error(`❌ Failed to fetch user ${userId}:`, err);
        console.error('   Status:', err.status);
        console.error('   Error:', err.error);
        
        // Return fallback user data
        const fallback: UserResponse = {
          id: userId,
          username: `user${userId}`,
          name: `User #${userId}`,
          email: `user${userId}@example.com`,
          role: 'LEARNER',
          createdAt: new Date().toISOString()
        };
        
        console.warn(`⚠️ Using fallback user data for ${userId}:`, fallback);
        return of(fallback);
      })
    );
  }
}