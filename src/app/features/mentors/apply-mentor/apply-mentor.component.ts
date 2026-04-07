
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/api/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

interface Skill { id: number; name: string; category: string; }

@Component({
  selector: 'app-apply-mentor',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './apply-mentor.component.html',
  styleUrl: './apply-mentor.component.scss'
})
export class ApplyMentorComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = false;
  allSkills: Skill[] = [];
  selectedSkillIds: number[] = [];

  // Track if application was submitted
  applicationSubmitted = false;
  private pollInterval: any = null;

  form = this.fb.nonNullable.group({
    bio: ['', [Validators.required, Validators.minLength(50)]],
    experience: [1, [Validators.required, Validators.min(0), Validators.max(50)]],
    hourlyRate: [500, [Validators.required, Validators.min(1)]]
  });

  ngOnInit() {
    // If already a mentor redirect to dashboard
    if (this.auth.isMentor()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Load available skills
    this.api.get<Skill[]>('/skills').subscribe({
      next: skills => this.allSkills = skills,
      error: () => {
        this.allSkills = [
          { id: 1, name: 'Java', category: 'Backend' },
          { id: 2, name: 'Spring Boot', category: 'Backend' },
          { id: 3, name: 'Python', category: 'AI/ML' },
          { id: 4, name: 'React', category: 'Frontend' },
          { id: 5, name: 'Angular', category: 'Frontend' },
          { id: 6, name: 'Node.js', category: 'Backend' },
          { id: 7, name: 'Data Science', category: 'AI/ML' },
          { id: 8, name: 'DSA', category: 'DSA' }
        ];
      }
    });
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  toggleSkill(id: number) {
    const idx = this.selectedSkillIds.indexOf(id);
    if (idx === -1) this.selectedSkillIds.push(id);
    else this.selectedSkillIds.splice(idx, 1);
  }

  isSelected(id: number): boolean {
    return this.selectedSkillIds.includes(id);
  }

  onSubmit() {
    if (this.form.invalid) return;
    if (this.selectedSkillIds.length === 0) {
      this.toast.error('Please select at least one skill');
      return;
    }

    this.loading = true;
    const v = this.form.getRawValue();

    this.api.post('/mentors/apply', {
      bio: v.bio,
      experience: v.experience,
      hourlyRate: v.hourlyRate,
      skillIds: this.selectedSkillIds
    }).subscribe({
      next: () => {
        this.loading = false;
        this.applicationSubmitted = true;
        this.toast.success('Application submitted! Awaiting admin approval. 🎉');

        // Start polling for role change every 30 seconds
        this.startPolling();

        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.toast.error('You have already applied as a mentor.');
        } else if (err.status === 0) {
          this.toast.error('Cannot connect to server.');
        } else {
          this.toast.error('Application failed. Please try again.');
        }
      }
    });
  }

  // ── Poll token refresh every 30s to detect role change ──
  private startPolling() {
    this.pollInterval = setInterval(() => {
      this.auth.refreshToken().subscribe({
        next: () => {
          // Check if role changed to MENTOR
          if (this.auth.isMentor()) {
            this.stopPolling();
            this.toast.success('🎉 Congratulations! You are now a Mentor!');
            this.router.navigate(['/dashboard']);
          }
        },
        error: () => {
          // Refresh failed, stop polling
          this.stopPolling();
        }
      });
    }, 30000); // Poll every 30 seconds
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}