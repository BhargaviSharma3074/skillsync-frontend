
// import { Injectable, inject } from '@angular/core';
// import { Observable } from 'rxjs';
// import { ApiService } from '../../core/api/api.service';
// import { AuthService } from '../../core/auth/auth.service';
// import { RawGroup, CreateGroupRequest } from './groups.model';

// @Injectable({ providedIn: 'root' })
// export class GroupsService {
//   private api = inject(ApiService);
//   private auth = inject(AuthService);

//   // Get all active groups
//   getAll(): Observable<RawGroup[]> {
//     return this.api.get<RawGroup[]>('/groups');
//   }

//   // Get groups the current user has joined
//   getJoined(): Observable<RawGroup[]> {
//     return this.api.get<RawGroup[]>('/groups/joined');
//   }

//   // Get single group
//   getById(id: string): Observable<RawGroup> {
//     return this.api.get<RawGroup>(`/groups/${id}`);
//   }

//   // Join a group — backend needs { userId }
//   join(id: string): Observable<any> {
//     const userId = Number(this.auth.currentUser()?.id ?? 0);
//     return this.api.post<any>(`/groups/${id}/join`, { userId });
//   }

//   // Leave a group — backend needs { userId }
//   leave(id: string): Observable<any> {
//     const userId = Number(this.auth.currentUser()?.id ?? 0);
//     return this.api.post<any>(`/groups/${id}/leave`, { userId });
//   }

//   // Create a group
//   create(body: CreateGroupRequest): Observable<RawGroup> {
//     return this.api.post<RawGroup>('/groups', body);
//   }

//   // ── Admin only ──────────────────────────────────────
//   adminGetAll(): Observable<RawGroup[]> {
//     return this.api.get<RawGroup[]>('/admin/groups');
//   }

//   adminDelete(id: string): Observable<any> {
//     return this.api.delete<any>(`/admin/groups/${id}`);
//   }

//   adminDeactivate(id: string): Observable<any> {
//     return this.api.put<any>(`/admin/groups/${id}/deactivate`, {});
//   }
// }


import { Injectable, inject } from '@angular/core';
import { Observable, map, forkJoin, of, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { RawGroup, CreateGroupRequest, GroupMemberRequest } from './groups.model';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  // ── Get all active groups ────────────────────────────
  getAll(): Observable<RawGroup[]> {
    return this.api.get<RawGroup[]>('/groups');
  }

  // ── Get single group ─────────────────────────────────
  getById(id: string): Observable<RawGroup> {
    return this.api.get<RawGroup>(`/groups/${id}`);
  }

  // ── Get all groups WITH membership info ──────────────
  // Since backend doesn't have /groups/joined, we need to
  // fetch individual groups and check if user is member
  getAllWithMembership(): Observable<{
    groups: RawGroup[];
    joinedGroupIds: number[];
  }> {
    const userId = Number(this.auth.currentUser()?.id ?? 0);
    
    return this.getAll().pipe(
      map(groups => {
        // TEMPORARY: Since we don't have membership info from backend,
        // we'll track it in localStorage as a workaround
        const joinedIds = this.getJoinedGroupsFromStorage();
        
        return {
          groups,
          joinedGroupIds: joinedIds
        };
      })
    );
  }

  // ── Create a group ───────────────────────────────────
 // ── Create a group ───────────────────────────────────
create(body: CreateGroupRequest): Observable<RawGroup> {
  console.log('🟢 Creating group with payload:', body);
  
  return this.api.post<RawGroup>('/groups', body).pipe(
    tap(group => {
      console.log('✅ Group created:', group);
      // Auto-join creator to the group
      this.addJoinedGroupToStorage(group.id);
    }),
    catchError(error => {
      console.error('❌ Create group failed:', error);
      console.error('   Error details:', error.error);
      return throwError(() => error);
    })
  );
}

  // ── Join a group ─────────────────────────────────────
  join(id: string): Observable<any> {
    const userId = Number(this.auth.currentUser()?.id ?? 0);
    const payload: GroupMemberRequest = { userId };
    
    return this.api.post<any>(`/groups/${id}/join`, payload).pipe(
      map(response => {
        // Track in localStorage
        this.addJoinedGroupToStorage(Number(id));
        return response;
      })
    );
  }

  leave(id: string): Observable<any> {
  const userId = Number(this.auth.currentUser()?.id ?? 0);
  const payload: GroupMemberRequest = { userId }; // ✅ This is correct
  
  return this.api.post<any>(`/groups/${id}/leave`, payload).pipe(
    map(response => {
      // Remove from localStorage
      this.removeJoinedGroupFromStorage(Number(id));
      return response;
    })
  );
}


  // ── Admin: Delete group ──────────────────────────────
  // NOTE: These endpoints don't exist in your backend yet
  // You'll need to add them or remove these methods
  adminDelete(id: string): Observable<any> {
    // TODO: Add this endpoint to backend: DELETE /api/admin/groups/{id}
    return this.api.delete<any>(`/admin/groups/${id}`);
  }

  adminDeactivate(id: string): Observable<any> {
    // TODO: Add this endpoint to backend: PUT /api/admin/groups/{id}/deactivate
    return this.api.put<any>(`/admin/groups/${id}/deactivate`, {});
  }

  // ── LocalStorage helpers (temporary workaround) ──────
  private getJoinedGroupsFromStorage(): number[] {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return [];
    
    const key = `joined_groups_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  private addJoinedGroupToStorage(groupId: number): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    
    const key = `joined_groups_${userId}`;
    const current = this.getJoinedGroupsFromStorage();
    
    if (!current.includes(groupId)) {
      current.push(groupId);
      localStorage.setItem(key, JSON.stringify(current));
    }
  }

  private removeJoinedGroupFromStorage(groupId: number): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    
    const key = `joined_groups_${userId}`;
    const current = this.getJoinedGroupsFromStorage();
    const filtered = current.filter(id => id !== groupId);
    localStorage.setItem(key, JSON.stringify(filtered));
  }
}