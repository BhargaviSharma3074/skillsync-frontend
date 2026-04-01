import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api/api.service';
import { Group } from './groups.model';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private api = inject(ApiService);

  getAll(tab?: string, search?: string): Observable<Group[]> {
    return this.api.get<Group[]>('/groups', { tab, search });
  }

  join(id: string): Observable<void> {
    return this.api.post<void>(`/groups/${id}/join`, {});
  }

  leave(id: string): Observable<void> {
    return this.api.delete<void>(`/groups/${id}/leave`);
  }

  create(body: Partial<Group>): Observable<Group> {
    return this.api.post<Group>('/groups', body);
  }
}