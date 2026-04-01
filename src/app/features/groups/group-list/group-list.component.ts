import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { GroupsStore } from '../groups.store';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatTabsModule
  ],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.scss'
})
export class GroupListComponent implements OnInit {
  store = inject(GroupsStore);
  searchQuery = '';
  tabs = ['All Groups', 'My Groups', 'Trending', 'Recommended'];

  ngOnInit() {
    this.store.loadGroups();
  }

  onTabChange(index: number) {
    const tabMap = ['all', 'mine', 'trending', 'recommended'];
    this.store.setTab(tabMap[index]);
    this.store.loadGroups();
  }

  onSearch() {
    this.store.setSearch(this.searchQuery);
    this.store.loadGroups();
  }

  toggleJoin(group: any) {
    if (group.joined) {
      this.store.leaveGroup(group.id);
    } else {
      this.store.joinGroup(group.id);
    }
  }
}