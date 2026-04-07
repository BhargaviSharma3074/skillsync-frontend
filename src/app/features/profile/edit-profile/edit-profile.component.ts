import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/auth/auth.service';
import { ProfileService } from '../profile.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { avatarColor } from '../../../shared/utils/avatar-color';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatChipsModule
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private profileSvc = inject(ProfileService);
  private toast = inject(ToastService);
  private router = inject(Router);
  avatarColor = avatarColor;

  form = this.fb.nonNullable.group({
    firstName: [''],
    lastName:  [''],
    email:     [''],
    bio:       ['']
  });

  skills: string[] = [];
  newSkill = '';

  ngOnInit() {
    const u = this.auth.currentUser();
    if (u) {
      this.form.patchValue(u);
      this.skills = u.skills ?? [];
    }
  }

  get initials(): string { return this.auth.getInitials(); }
  get bgColor(): string {
    const u = this.auth.currentUser();
    return avatarColor(u ? u.firstName : '');
  }

  addSkill() {
    const s = this.newSkill.trim();
    if (s && !this.skills.includes(s)) this.skills.push(s);
    this.newSkill = '';
  }

  removeSkill(s: string) {
    this.skills = this.skills.filter(x => x !== s);
  }

  save() {
    this.profileSvc.updateProfile({
      ...this.form.getRawValue(),
      skills: this.skills
    }).subscribe({
      next: () => {
        this.toast.success('Profile updated!');
        this.router.navigate(['/profile']);
      },
      error: () => this.toast.error('Update failed')
    });
  }
}