import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MentorsStore } from '../mentors.store';
import { MentorFilter } from '../mentors.model';
import { avatarColor } from '../../../shared/utils/avatar-color';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-mentor-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatChipsModule, InitialsPipe
  ],
  templateUrl: './mentor-list.component.html',
  styleUrl: './mentor-list.component.scss'
})
export class MentorListComponent implements OnInit {
  store = inject(MentorsStore);
  avatarColor = avatarColor;
  searchQuery = '';
  sortBy = 'relevant';

  ngOnInit() {
    this.store.search();
  }

  onSearch() {
    this.store.updateFilter({ search: this.searchQuery });
    this.store.search();
  }

  removeChip(key: keyof MentorFilter) {
  this.store.removeFilterChip(key);
  this.store.search();
}

  clearAll() {
    this.searchQuery = '';
    this.store.clearFilters();
    this.store.search();
  }
}