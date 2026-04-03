import { Component, inject, OnInit } from '@angular/core';
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
export class ApplyMentorComponent implements OnInit {
    private fb = inject(FormBuilder);
    private api = inject(ApiService);
    private toast = inject(ToastService);
    private router = inject(Router);

    loading = false;
    allSkills: Skill[] = [];
    selectedSkillIds: number[] = [];
    newSkill = '';

    form = this.fb.nonNullable.group({
        bio: ['', [Validators.required, Validators.minLength(50)]],
        experience: [1, [Validators.required, Validators.min(0), Validators.max(50)]],
        hourlyRate: [500, [Validators.required, Validators.min(1)]]
    });

    ngOnInit() {
        // Load available skills from skill service
        this.api.get<Skill[]>('/skills').subscribe({
            next: skills => this.allSkills = skills,
            error: () => {
                // Mock skills if backend not available
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
                this.toast.success('Application submitted! Awaiting admin approval. 🎉');
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.loading = false;
                if (err.status === 409) this.toast.error('You have already applied as a mentor.');
                else if (err.status === 0) this.toast.error('Cannot connect to server.');
                else this.toast.error('Application failed. Please try again.');
            }
        });
    }
}