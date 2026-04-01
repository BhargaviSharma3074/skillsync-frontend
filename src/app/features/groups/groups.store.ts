import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { GroupsService } from './groups.service';
import { Group } from './groups.model';
import { firstValueFrom } from 'rxjs';

interface GroupsState {
  groups: Group[];
  loading: boolean;
  activeTab: string;
  search: string;
}

export const GroupsStore = signalStore(
  { providedIn: 'root' },
  withState<GroupsState>({
    groups: [],
    loading: false,
    activeTab: 'all',
    search: ''
  }),
  withMethods((store) => {
    const svc = inject(GroupsService);
    return {
      async loadGroups() {
        patchState(store, { loading: true });
        try {
          const groups = await firstValueFrom(svc.getAll(store.activeTab(), store.search()));
          patchState(store, { groups, loading: false });
        } catch {
          patchState(store, {
            groups: [
              { id:'1', name:'Spring Boot Beginners', description:'A group for Java developers learning Spring Boot from scratch. Weekly practice sessions, code reviews and Q&A with industry experts.', memberCount:48, createdBy:'Priya Sharma', skills:['Java','Spring Boot','REST APIs','JPA'], isPublic:true, lastActive:'2h ago', postsThisWeek:128, joined:false, icon:'🚀' },
              { id:'2', name:'Machine Learning Study Circle', description:'Weekly discussions on ML algorithms, research papers, and hands-on implementation labs. Great for beginners and intermediates alike.', memberCount:72, createdBy:'Arjun Mehta', skills:['Python','TensorFlow','Scikit-learn','Statistics'], isPublic:true, lastActive:'5h ago', postsThisWeek:95, joined:false, icon:'🤖' },
              { id:'3', name:'DSA Interview Preparation', description:'Crack coding interviews! Daily LeetCode problems, mock interviews, and discussion of optimal solutions for arrays, trees, graphs and DP.', memberCount:103, createdBy:'Rahul Gupta', skills:['Data Structures','Algorithms','LeetCode'], isPublic:true, lastActive:'1h ago', postsThisWeek:210, joined:true, icon:'📊' }
            ],
            loading: false
          });
        }
      },

      setTab(tab: string) {
        patchState(store, { activeTab: tab });
      },

      setSearch(search: string) {
        patchState(store, { search });
      },

      async joinGroup(id: string) {
        await firstValueFrom(svc.join(id)).catch(() => {});
        patchState(store, {
          groups: store.groups().map(g => g.id === id ? { ...g, joined: true, memberCount: g.memberCount + 1 } : g)
        });
      },

      async leaveGroup(id: string) {
        await firstValueFrom(svc.leave(id)).catch(() => {});
        patchState(store, {
          groups: store.groups().map(g => g.id === id ? { ...g, joined: false, memberCount: g.memberCount - 1 } : g)
        });
      }
    };
  })
);