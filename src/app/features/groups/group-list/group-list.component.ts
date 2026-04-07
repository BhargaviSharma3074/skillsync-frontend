// import { Component, inject, OnInit } from '@angular/core';
// import { CommonModule, DatePipe } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatTabsModule } from '@angular/material/tabs';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// import { GroupsStore } from '../groups.store';
// import { AuthService } from '../../../core/auth/auth.service';
// import { CreateGroupDialogComponent } from '../create-group-dialog/create-group-dialog.component';
// import { Group } from '../groups.model';

// @Component({
//   selector: 'app-group-list',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     DatePipe,

//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatIconModule,
//     MatTabsModule,
//     MatProgressSpinnerModule,

//     MatDialogModule,
//     MatSnackBarModule,

//     CreateGroupDialogComponent
//   ],
//   templateUrl: './group-list.component.html',
//   styleUrl: './group-list.component.scss'
// })
// export class GroupListComponent implements OnInit {
//   store = inject(GroupsStore);
//   auth = inject(AuthService);
//   dialog = inject(MatDialog);
//   snackBar = inject(MatSnackBar);

//   searchQuery = '';
//   activeTabIndex = 0;
//   tabs = ['All Groups', 'My Groups'];

//   // local UI state so buttons can show spinner/disable per-card
//   pendingGroupIds = new Set<string>();

//   get currentUserId(): string {
//     return String(this.auth.currentUser()?.id ?? '');
//   }

//   get isAdmin(): boolean {
//     return this.auth.isAdmin();
//   }

//   // Learner + Mentor can create/join/leave
//   get canCreateGroup(): boolean {
//     return this.auth.isLearner() || this.auth.isMentor();
//   }

//   isCreator(group: Group): boolean {
//     return String(group.createdByUserId) === this.currentUserId;
//   }

//   isPending(groupId: string): boolean {
//     return this.pendingGroupIds.has(groupId);
//   }

//   get filteredGroups(): Group[] {
//     let groups = this.store.groups();

//     // "My Groups" tab: joined OR creator
//     if (this.activeTabIndex === 1) {
//       groups = groups.filter(g => g.joined || this.isCreator(g));
//     }

//     // search
//     const q = this.searchQuery.toLowerCase().trim();
//     if (q) {
//       groups = groups.filter(g =>
//         (g.name ?? '').toLowerCase().includes(q) ||
//         (g.description ?? '').toLowerCase().includes(q)
//       );
//     }

//     return groups;
//   }

//   ngOnInit(): void {
//     this.store.loadGroups();
//   }

//   onTabChange(index: number): void {
//     this.activeTabIndex = index;
//   }

//   onSearch(): void {
//     this.store.setSearch(this.searchQuery);
//   }

//   refreshGroups(): void {
//     this.store.loadGroups();
//   }

//   openCreateDialog(): void {
//     if (!this.canCreateGroup) {
//       this.snackBar.open('Only learners and mentors can create groups', 'Close', { duration: 3000 });
//       return;
//     }

//     const dialogRef = this.dialog.open(CreateGroupDialogComponent, {
//       width: '500px',
//       disableClose: true
//     });

//     dialogRef.afterClosed().subscribe(created => {
//       if (created) {
//         this.snackBar.open('✅ Group created successfully', 'Close', { duration: 2500 });
//         // No reload needed if store prepends the created group.
//         // If your backend sets createdBy/createdAt and you want them instantly:
//         // this.store.loadGroups();
//       }
//     });
//   }

//   async toggleJoin(group: Group): Promise<void> {
//     if (this.isCreator(group)) return;              // creator can't join/leave own group
//     if (this.isAdmin) return;                       // admin shouldn't join/leave
//     if (this.isPending(group.id)) return;           // avoid double-clicks

//     this.pendingGroupIds.add(group.id);

//     try {
//       if (group.joined) {
//         await this.store.leaveGroup(group.id);
//         this.snackBar.open('Left group', 'Close', { duration: 2000 });
//       } else {
//         await this.store.joinGroup(group.id);
//         this.snackBar.open('Joined group', 'Close', { duration: 2000 });
//       }

//       // Optional: if you want absolute truth from backend (and membership endpoint exists),
//       // reload groups. Not required if store updates state correctly.
//       // await this.store.loadGroups();

//     } catch (err: any) {
//       const msg =
//         err?.error?.message ||
//         (group.joined ? 'Failed to leave group' : 'Failed to join group');

//       this.snackBar.open(msg, 'Close', { duration: 4000 });

//       // If you want to hard-sync after any error:
//       // this.store.loadGroups();
//     } finally {
//       this.pendingGroupIds.delete(group.id);
//     }
//   }

//   async deleteGroup(group: Group): Promise<void> {
//     if (!this.isAdmin) return;

//     const ok = confirm(`Delete group "${group.name}"?`);
//     if (!ok) return;

//     try {
//       // If you have admin delete in store, call it; otherwise just show message.
//       if ((this.store as any).adminDeleteGroup) {
//         const success = await (this.store as any).adminDeleteGroup(group.id);
//         if (success) this.snackBar.open('Group deleted', 'Close', { duration: 2500 });
//         else this.snackBar.open('Failed to delete group', 'Close', { duration: 3500 });
//       } else {
//         this.snackBar.open('Admin delete not implemented in store', 'Close', { duration: 3500 });
//       }
//     } catch (e) {
//       this.snackBar.open('Failed to delete group', 'Close', { duration: 3500 });
//     }
//   }
// }

import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { GroupsStore } from '../groups.store';
import { AuthService } from '../../../core/auth/auth.service';
import { CreateGroupDialogComponent } from '../create-group-dialog/create-group-dialog.component';
import { Group } from '../groups.model';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    CreateGroupDialogComponent
  ],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.scss'
})
export class GroupListComponent implements OnInit { // ← Make sure "export" is here
  store = inject(GroupsStore);
  auth = inject(AuthService);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  searchQuery = '';
  activeTabIndex = 0;
  tabs = ['All Groups', 'My Groups'];
  pendingGroupIds = new Set<string>();

  get currentUserId(): string {
    return String(this.auth.currentUser()?.id ?? '');
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  get canCreateGroup(): boolean {
    return this.auth.isLearner() || this.auth.isMentor();
  }

  isCreator(group: Group): boolean {
    return String(group.createdByUserId) === this.currentUserId;
  }

  isPending(groupId: string): boolean {
    return this.pendingGroupIds.has(groupId);
  }

  get filteredGroups(): Group[] {
    let groups = this.store.groups();

    if (this.activeTabIndex === 1) {
      groups = groups.filter(g => g.joined || this.isCreator(g));
    }

    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      groups = groups.filter(g =>
        (g.name ?? '').toLowerCase().includes(q) ||
        (g.description ?? '').toLowerCase().includes(q)
      );
    }

    return groups;
  }

  ngOnInit(): void {
    this.store.loadGroups();
  }

  onTabChange(index: number): void {
    this.activeTabIndex = index;
  }

  onSearch(): void {
    this.store.setSearch(this.searchQuery);
  }

  refreshGroups(): void {
    console.log('🔄 Manual refresh clicked');
    this.store.loadGroups();
  }

  openCreateDialog(): void {
    if (!this.canCreateGroup) {
      this.snackBar.open('Only learners and mentors can create groups', 'Close', { 
        duration: 3000 
      });
      return;
    }

    const dialogRef = this.dialog.open(CreateGroupDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async (created) => {
      if (created) {
        this.snackBar.open('✅ Group created successfully', 'Close', { 
          duration: 2500 
        });
        this.cdr.detectChanges();
      }
    });
  }

  async toggleJoin(group: Group): Promise<void> {
    if (this.isCreator(group)) return;
    if (this.isAdmin) return;
    if (this.isPending(group.id)) return;
    if (!group.active) {
      this.snackBar.open('This group is no longer active and cannot be joined.', 'Close', { duration: 3000 });
      return;
    }

    this.pendingGroupIds.add(group.id);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 TOGGLE JOIN CLICKED');
    console.log('   Group:', group.name);
    console.log('   Group ID:', group.id);
    console.log('   Currently joined:', group.joined);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      if (group.joined) {
        console.log('🔴 User wants to LEAVE group');
        await this.store.leaveGroup(group.id);
        this.cdr.detectChanges();
        console.log('✅ Leave completed, UI should update now');
        this.snackBar.open('Left group', 'Close', { duration: 2000 });
      } else {
        console.log('🔵 User wants to JOIN group');
        await this.store.joinGroup(group.id);
        this.cdr.detectChanges();
        console.log('✅ Join completed, UI should update now');
        this.snackBar.open('Joined group', 'Close', { duration: 2000 });
      }

      const updatedGroup = this.store.groups().find(g => g.id === group.id);
      console.log('📊 Final group state:', updatedGroup);

    } catch (err: any) {
      console.error('❌ Toggle failed:', err);
      const msg = err?.error?.message || 
                  (group.joined ? 'Failed to leave group' : 'Failed to join group');
      this.snackBar.open(msg, 'Close', { duration: 4000 });
      this.cdr.detectChanges();
    } finally {
      this.pendingGroupIds.delete(group.id);
      this.cdr.detectChanges();
    }
  }

  async deleteGroup(group: Group): Promise<void> {
    if (!this.isAdmin) return;

    const ok = confirm(`Delete group "${group.name}"?`);
    if (!ok) return;

    try {
      const success = await this.store.adminDeleteGroup(group.id);
      if (success) {
        this.snackBar.open('Group deleted', 'Close', { duration: 2500 });
        this.cdr.detectChanges();
      } else {
        this.snackBar.open('Failed to delete group', 'Close', { duration: 3500 });
      }
    } catch (e) {
      this.snackBar.open('Failed to delete group', 'Close', { duration: 3500 });
    }
  }
}