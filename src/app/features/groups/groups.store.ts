
// // import { inject } from '@angular/core';
// // import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
// // import { GroupsService } from './groups.service';
// // import { AuthService } from '../../core/auth/auth.service';
// // import { Group, RawGroup, CreateGroupRequest } from './groups.model';
// // import { firstValueFrom } from 'rxjs';

// // interface GroupsState {
// //   groups: Group[];
// //   loading: boolean;
// //   error: string | null;
// //   search: string;
// // }

// // // ── Map raw API group → UI Group ─────────────────────────
// // function mapGroup(raw: RawGroup, joinedIds: Set<number>, currentUserId: number): Group {
// //   const icons = ['📚', '🚀', '🤖', '💡', '🎯', '🔥', '⚡', '🌟', '💻', '🧠'];
// //   const icon = icons[(raw.id ?? 0) % icons.length];

// //   return {
// //     id: String(raw.id),
// //     name: raw.name ?? 'Unnamed Group',
// //     description: raw.description ?? 'No description available.',
// //     memberCount: raw.memberCount ?? 0, // Backend doesn't provide this yet
// //     createdBy: String(raw.createdBy ?? ''),
// //     createdByUserId: raw.createdBy ?? 0,
// //     skills: [],
// //     isPublic: raw.isPublic ?? true, // Backend doesn't provide this yet
// //     lastActive: raw.createdAt ?? '',
// //     joined: joinedIds.has(raw.id) || raw.createdBy === currentUserId, // Auto-join creator
// //     icon,
// //     active: raw.active ?? true // Backend doesn't provide this yet
// //   };
// // }

// // export const GroupsStore = signalStore(
// //   { providedIn: 'root' },
// //   withState<GroupsState>({
// //     groups: [],
// //     loading: false,
// //     error: null,
// //     search: ''
// //   }),
// //   withMethods((store) => {
// //     const svc = inject(GroupsService);
// //     const auth = inject(AuthService);

// //     return {

// //       // ── Load all groups + membership info ───────────────
// //       async loadGroups() {
// //         patchState(store, { loading: true, error: null });

// //         const currentUserId = Number(auth.currentUser()?.id ?? 0);

// //         try {
// //           const result = await firstValueFrom(svc.getAllWithMembership());
// //           const { groups: allGroups, joinedGroupIds } = result;

// //           // Build a Set of joined group IDs for fast lookup
// //           const joinedIds = new Set<number>(joinedGroupIds);

// //           console.log('✅ All groups:', allGroups.length);
// //           console.log('✅ Joined group IDs:', [...joinedIds]);

// //           const groups = allGroups.map(raw =>
// //             mapGroup(raw, joinedIds, currentUserId)
// //           );

// //           patchState(store, { groups, loading: false });

// //         } catch (err: any) {
// //           console.error('❌ Groups load error:', err);
// //           patchState(store, {
// //             loading: false,
// //             error: err?.error?.message || 'Failed to load groups. Please try again.'
// //           });
// //         }
// //       },

// //       // ── Search (client-side) ────────────────────────────
// //       setSearch(search: string) {
// //         patchState(store, { search });
// //       },

// //       // ── Join a group ────────────────────────────────────
// //       async joinGroup(id: string) {
// //         try {
// //           await firstValueFrom(svc.join(id));
// //           patchState(store, {
// //             groups: store.groups().map(g =>
// //               g.id === id
// //                 ? { ...g, joined: true, memberCount: g.memberCount + 1 }
// //                 : g
// //             )
// //           });
// //           console.log('✅ Joined group:', id);
// //         } catch (err: any) {
// //           console.error('❌ Join group error:', err);
// //           patchState(store, {
// //             error: err?.error?.message || 'Failed to join group. Please try again.'
// //           });
// //         }
// //       },

// //       // ── Leave a group ───────────────────────────────────
// //       async leaveGroup(id: string) {
// //         try {
// //           await firstValueFrom(svc.leave(id));
// //           patchState(store, {
// //             groups: store.groups().map(g =>
// //               g.id === id
// //                 ? { ...g, joined: false, memberCount: Math.max(0, g.memberCount - 1) }
// //                 : g
// //             )
// //           });
// //           console.log('✅ Left group:', id);
// //         } catch (err: any) {
// //           console.error('❌ Leave group error:', err);
// //           patchState(store, {
// //             error: err?.error?.message || 'Failed to leave group. Please try again.'
// //           });
// //         }
// //       },

// //       // ── Create a group ──────────────────────────────────
// //       async createGroup(body: CreateGroupRequest) {
// //         const currentUserId = Number(auth.currentUser()?.id ?? 0);
// //         try {
// //           const rawGroup = await firstValueFrom(svc.create(body));

// //           // Creator is automatically a member
// //           const joinedIds = new Set<number>([rawGroup.id]);
// //           const newGroup = mapGroup(rawGroup, joinedIds, currentUserId);

// //           patchState(store, {
// //             groups: [
// //               { ...newGroup, joined: true, memberCount: 1 },
// //               ...store.groups()
// //             ]
// //           });
// //           console.log('✅ Group created:', newGroup);
// //           return true;
// //         } catch (err: any) {
// //           console.error('❌ Create group error:', err);
// //           patchState(store, {
// //             error: err?.error?.message || 'Failed to create group. Please try again.'
// //           });
// //           return false;
// //         }
// //       },

// //       // ── Admin: Delete group ─────────────────────────────
// //       async adminDeleteGroup(id: string) {
// //         try {
// //           await firstValueFrom(svc.adminDelete(id));
// //           patchState(store, {
// //             groups: store.groups().filter(g => g.id !== id)
// //           });
// //           console.log('✅ Group deleted:', id);
// //           return true;
// //         } catch (err: any) {
// //           console.error('❌ Delete group error:', err);
// //           patchState(store, {
// //             error: err?.error?.message || 'Failed to delete group.'
// //           });
// //           return false;
// //         }
// //       },

// //       // ── Clear error ─────────────────────────────────────
// //       clearError() {
// //         patchState(store, { error: null });
// //       }
// //     };
// //   })
// // );

// import { inject } from '@angular/core';
// import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
// import { GroupsService } from './groups.service';
// import { AuthService } from '../../core/auth/auth.service';
// import { Group, RawGroup, CreateGroupRequest } from './groups.model';
// import { firstValueFrom } from 'rxjs';

// interface GroupsState {
//   groups: Group[];
//   loading: boolean;
//   error: string | null;
//   search: string;
// }

// // ── Map raw API group → UI Group ─────────────────────────
// function mapGroup(raw: RawGroup, joinedIds: Set<number>, currentUserId: number): Group {
//   const icons = ['📚', '🚀', '🤖', '💡', '🎯', '🔥', '⚡', '🌟', '💻', '🧠'];
//   const icon = icons[(raw.id ?? 0) % icons.length];

//   return {
//     id: String(raw.id),
//     name: raw.name ?? 'Unnamed Group',
//     description: raw.description ?? 'No description available.',
//     memberCount: raw.memberCount ?? 0,
//     createdBy: String(raw.createdBy ?? ''),
//     createdByUserId: raw.createdBy ?? 0,
//     skills: [],
//     isPublic: raw.isPublic ?? true,
//     lastActive: raw.createdAt ?? '',
//     joined: joinedIds.has(raw.id) || raw.createdBy === currentUserId,
//     icon,
//     active: raw.active ?? true
//   };
// }

// export const GroupsStore = signalStore(
//   { providedIn: 'root' },
//   withState<GroupsState>({
//     groups: [],
//     loading: false,
//     error: null,
//     search: ''
//   }),
//   withMethods((store) => {
//     const svc = inject(GroupsService);
//     const auth = inject(AuthService);

//     return {

//       // ── Load all groups + membership info ───────────────
//       async loadGroups() {
//         patchState(store, { loading: true, error: null });

//         const currentUserId = Number(auth.currentUser()?.id ?? 0);

//         try {
//           const result = await firstValueFrom(svc.getAllWithMembership());
//           const { groups: allGroups, joinedGroupIds } = result;

//           const joinedIds = new Set<number>(joinedGroupIds);

//           console.log('✅ All groups:', allGroups.length);
//           console.log('✅ Joined group IDs:', [...joinedIds]);

//           const groups = allGroups.map(raw =>
//             mapGroup(raw, joinedIds, currentUserId)
//           );

//           patchState(store, { groups, loading: false });

//         } catch (err: any) {
//           console.error('❌ Groups load error:', err);
//           patchState(store, {
//             loading: false,
//             error: err?.error?.message || 'Failed to load groups. Please try again.'
//           });
//         }
//       },

//       // ── Search (client-side) ────────────────────────────
//       setSearch(search: string) {
//         patchState(store, { search });
//       },

//       // ── Join a group ────────────────────────────────────
//       async joinGroup(id: string): Promise<void> {
//         try {
//           console.log('🔍 Store: Attempting to join group', id);
          
//           // Call backend first
//           await firstValueFrom(svc.join(id));
//           console.log('✅ Backend: Join successful');
          
//           // Only update UI after backend confirms success
//           patchState(store, {
//             groups: store.groups().map(g =>
//               g.id === id
//                 ? { 
//                     ...g, 
//                     joined: true, 
//                     memberCount: g.memberCount + 1 
//                   }
//                 : g
//             ),
//             error: null // Clear any previous errors
//           });
          
//           console.log('✅ UI: Updated to show joined');
          
//         } catch (err: any) {
//           console.error('❌ Join group error:', err);
//           console.error('   Status:', err.status);
//           console.error('   Message:', err.error);
          
//           // Handle specific error cases
//           if (err.status === 409) {
//             // Already a member - just update UI to reflect reality
//             patchState(store, {
//               groups: store.groups().map(g =>
//                 g.id === id ? { ...g, joined: true } : g
//               ),
//               error: 'You are already a member of this group'
//             });
//           } else {
//             patchState(store, {
//               error: err?.error?.message || 'Failed to join group. Please try again.'
//             });
//           }
          
//           throw err; // Re-throw so component can handle it
//         }
//       },

//       // ── Leave a group ───────────────────────────────────
//       async leaveGroup(id: string): Promise<void> {
//         try {
//           console.log('🔍 Store: Attempting to leave group', id);
          
//           // Call backend first
//           await firstValueFrom(svc.leave(id));
//           console.log('✅ Backend: Leave successful');
          
//           // Only update UI after backend confirms success
//           patchState(store, {
//             groups: store.groups().map(g =>
//               g.id === id
//                 ? { 
//                     ...g, 
//                     joined: false, 
//                     memberCount: Math.max(0, g.memberCount - 1) 
//                   }
//                 : g
//             ),
//             error: null // Clear any previous errors
//           });
          
//           console.log('✅ UI: Updated to show left');
          
//         } catch (err: any) {
//           console.error('❌ Leave group error:', err);
//           console.error('   Status:', err.status);
//           console.error('   Message:', err.error);
          
//           // Handle specific error cases
//           if (err.status === 404 || err.status === 409) {
//             // Not a member - just update UI to reflect reality
//             patchState(store, {
//               groups: store.groups().map(g =>
//                 g.id === id ? { ...g, joined: false } : g
//               ),
//               error: 'You are not a member of this group'
//             });
//           } else {
//             patchState(store, {
//               error: err?.error?.message || 'Failed to leave group. Please try again.'
//             });
//           }
          
//           throw err; // Re-throw so component can handle it
//         }
//       },

//       // ── Create a group ──────────────────────────────────
//       async createGroup(body: CreateGroupRequest): Promise<boolean> {
//         const currentUserId = Number(auth.currentUser()?.id ?? 0);
//         try {
//           console.log('🔍 Creating group:', body);
          
//           const rawGroup = await firstValueFrom(svc.create(body));
//           console.log('✅ Backend: Group created', rawGroup);

//           // Creator is automatically a member
//           const joinedIds = new Set<number>([rawGroup.id]);
//           const newGroup = mapGroup(rawGroup, joinedIds, currentUserId);

//           patchState(store, {
//             groups: [
//               { ...newGroup, joined: true, memberCount: 1 },
//               ...store.groups()
//             ],
//             error: null
//           });
          
//           console.log('✅ Group created and added to UI');
//           return true;
          
//         } catch (err: any) {
//           console.error('❌ Create group error:', err);
//           patchState(store, {
//             error: err?.error?.message || 'Failed to create group. Please try again.'
//           });
//           return false;
//         }
//       },

//       // ── Admin: Delete group ─────────────────────────────
//       async adminDeleteGroup(id: string): Promise<boolean> {
//         try {
//           await firstValueFrom(svc.adminDelete(id));
//           patchState(store, {
//             groups: store.groups().filter(g => g.id !== id),
//             error: null
//           });
//           console.log('✅ Group deleted:', id);
//           return true;
//         } catch (err: any) {
//           console.error('❌ Delete group error:', err);
//           patchState(store, {
//             error: err?.error?.message || 'Failed to delete group.'
//           });
//           return false;
//         }
//       },

//       // ── Clear error ─────────────────────────────────────
//       clearError() {
//         patchState(store, { error: null });
//       }
//     };
//   })
// );


import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { GroupsService } from './groups.service';
import { AuthService } from '../../core/auth/auth.service';
import { Group, RawGroup, CreateGroupRequest } from './groups.model';
import { firstValueFrom } from 'rxjs';

interface GroupsState {
  groups: Group[];
  loading: boolean;
  error: string | null;
  search: string;
}

// ── Map raw API group → UI Group ─────────────────────────
function mapGroup(raw: RawGroup, joinedIds: Set<number>, currentUserId: number): Group {
  const icons = ['📚', '🚀', '🤖', '💡', '🎯', '🔥', '⚡', '🌟', '💻', '🧠'];
  const icon = icons[(raw.id ?? 0) % icons.length];

  return {
    id: String(raw.id),
    name: raw.name ?? 'Unnamed Group',
    description: raw.description ?? 'No description available.',
    memberCount: raw.memberCount ?? 0,
    createdBy: String(raw.createdBy ?? ''),
    createdByUserId: raw.createdBy ?? 0,
    skills: [],
    isPublic: raw.isPublic ?? true,
    lastActive: raw.createdAt ?? '',
    joined: joinedIds.has(raw.id) || raw.createdBy === currentUserId,
    icon,
    active: raw.active ?? true
  };
}

export const GroupsStore = signalStore(
  { providedIn: 'root' },
  withState<GroupsState>({
    groups: [],
    loading: false,
    error: null,
    search: ''
  }),
  withMethods((store) => {
    const svc = inject(GroupsService);
    const auth = inject(AuthService);

    return {

      // ── Load all groups + membership info ───────────────
      async loadGroups() {
        patchState(store, { loading: true, error: null });

        const currentUserId = Number(auth.currentUser()?.id ?? 0);

        try {
          const result = await firstValueFrom(svc.getAllWithMembership());
          const { groups: allGroups, joinedGroupIds } = result;

          const joinedIds = new Set<number>(joinedGroupIds);

          console.log('✅ Loaded groups:', allGroups.length);
          console.log('✅ Joined IDs:', [...joinedIds]);

          const groups = allGroups.map(raw =>
            mapGroup(raw, joinedIds, currentUserId)
          );

          patchState(store, { groups, loading: false });

        } catch (err: any) {
          console.error('❌ Groups load error:', err);
          patchState(store, {
            loading: false,
            error: err?.error?.message || 'Failed to load groups.'
          });
        }
      },

      // ── Search ──────────────────────────────────────────
      setSearch(search: string) {
        patchState(store, { search });
      },

      // ── Join a group ────────────────────────────────────
      async joinGroup(id: string): Promise<void> {
        console.log('🔵 STORE: Join group', id);
        
        try {
          // 1. Call backend
          await firstValueFrom(svc.join(id));
          console.log('✅ BACKEND: Join successful');
          
          // 2. Create NEW array (immutable update triggers change detection)
          const updatedGroups = store.groups().map(g => 
            g.id === id 
              ? { ...g, joined: true, memberCount: g.memberCount + 1 }
              : g
          );
          
          // 3. Update state with NEW array reference
          patchState(store, { 
            groups: updatedGroups,
            error: null 
          });
          
          console.log('✅ STORE: UI state updated (joined=true)');
          
        } catch (err: any) {
          console.error('❌ STORE: Join failed', err);
          
          if (err.status === 409) {
            // Already a member - fix UI state
            const updatedGroups = store.groups().map(g =>
              g.id === id ? { ...g, joined: true } : g
            );
            patchState(store, {
              groups: updatedGroups,
              error: 'Already a member of this group'
            });
          } else {
            patchState(store, {
              error: err?.error?.message || 'Failed to join group'
            });
          }
          
          throw err;
        }
      },

      // ── Leave a group ───────────────────────────────────
      async leaveGroup(id: string): Promise<void> {
        console.log('🔴 STORE: Leave group', id);
        
        try {
          // 1. Call backend
          await firstValueFrom(svc.leave(id));
          console.log('✅ BACKEND: Leave successful');
          
          // 2. Create NEW array (immutable update triggers change detection)
          const updatedGroups = store.groups().map(g =>
            g.id === id
              ? { ...g, joined: false, memberCount: Math.max(0, g.memberCount - 1) }
              : g
          );
          
          // 3. Update state with NEW array reference
          patchState(store, { 
            groups: updatedGroups,
            error: null 
          });
          
          console.log('✅ STORE: UI state updated (joined=false)');
          console.log('   Updated groups:', updatedGroups.find(g => g.id === id));
          
        } catch (err: any) {
          console.error('❌ STORE: Leave failed', err);
          
          if (err.status === 404 || err.status === 409) {
            // Not a member - fix UI state
            const updatedGroups = store.groups().map(g =>
              g.id === id ? { ...g, joined: false } : g
            );
            patchState(store, {
              groups: updatedGroups,
              error: 'Not a member of this group'
            });
          } else {
            patchState(store, {
              error: err?.error?.message || 'Failed to leave group'
            });
          }
          
          throw err;
        }
      },

      // ── Create a group ──────────────────────────────────
      // ── Create a group ──────────────────────────────────
async createGroup(body: CreateGroupRequest): Promise<boolean> {
  const currentUserId = Number(auth.currentUser()?.id ?? 0);
  
  if (!currentUserId) {
    console.error('❌ No user ID found, cannot create group');
    patchState(store, { error: 'You must be logged in to create a group' });
    return false;
  }
  
  try {
    console.log('🟢 STORE: Creating group', body);
    
    // Add createdBy to the request
    const payload: CreateGroupRequest = {
      ...body,
      createdBy: currentUserId // ← Add creator ID
    };
    
    console.log('📤 Sending to backend:', payload);
    
    const rawGroup = await firstValueFrom(svc.create(payload));
    console.log('✅ BACKEND: Group created', rawGroup);

    // Map new group
    const joinedIds = new Set<number>([rawGroup.id]);
    const newGroup = mapGroup(rawGroup, joinedIds, currentUserId);

    // Create NEW array with new group prepended
    const updatedGroups = [
      { ...newGroup, joined: true, memberCount: 1 },
      ...store.groups()
    ];

    patchState(store, {
      groups: updatedGroups,
      error: null
    });
    
    console.log('✅ STORE: New group added to UI');
    return true;
    
  } catch (err: any) {
    console.error('❌ STORE: Create failed', err);
    console.error('   Error body:', err.error);
    patchState(store, {
      error: err?.error?.message || 'Failed to create group'
    });
    return false;
  }
},

      // ── Admin: Delete group ─────────────────────────────
      async adminDeleteGroup(id: string): Promise<boolean> {
        try {
          await firstValueFrom(svc.adminDelete(id));
          
          // Create NEW filtered array
          const updatedGroups = store.groups().filter(g => g.id !== id);
          
          patchState(store, {
            groups: updatedGroups,
            error: null
          });
          
          console.log('✅ Group deleted:', id);
          return true;
        } catch (err: any) {
          console.error('❌ Delete failed:', err);
          patchState(store, {
            error: err?.error?.message || 'Failed to delete group'
          });
          return false;
        }
      },

      // ── Clear error ─────────────────────────────────────
      clearError() {
        patchState(store, { error: null });
      }
    };
  })
);