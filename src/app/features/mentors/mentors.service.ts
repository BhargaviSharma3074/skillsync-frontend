import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api/api.service';
import { Mentor, MentorFilter } from './mentors.model';

@Injectable({ providedIn: 'root' })
export class MentorsService {
  private api = inject(ApiService);

  search(filter: MentorFilter): Observable<Mentor[]> {
    return this.api.get<Mentor[]>('/mentors', filter as Record<string, any>);
  }

  getById(id: string): Observable<Mentor> {
    return this.api.get<Mentor>(`/mentors/${id}`);
  }
}