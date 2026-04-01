import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api/api.service';
import { User } from '../../core/auth/auth.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private api = inject(ApiService);

  getProfile(): Observable<User> {
    return this.api.get<User>('/profile');
  }

  updateProfile(body: Partial<User>): Observable<User> {
    return this.api.put<User>('/profile', body);
  }
}