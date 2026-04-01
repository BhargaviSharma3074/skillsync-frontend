import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MentorsStore } from '../mentors.store';
import { avatarColor } from '../../../shared/utils/avatar-color';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-mentor-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatChipsModule, InitialsPipe],
  templateUrl: './mentor-profile.component.html',
  styleUrl: './mentor-profile.component.scss'
})
export class MentorProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  store = inject(MentorsStore);
  avatarColor = avatarColor;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.loadMentor(id);
  }
}