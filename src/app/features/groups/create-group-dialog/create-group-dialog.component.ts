
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GroupsStore } from '../groups.store';

@Component({
  selector: 'app-create-group-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-header">
        <h2>Create New Group</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="dialog-body">

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Group Name</mat-label>
            <input matInput formControlName="name"
                   placeholder="e.g. Spring Boot Beginners" />
            <mat-error>Group name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description"
                      rows="4"
                      placeholder="What is this group about?">
            </textarea>
            <mat-error>Description is required</mat-error>
          </mat-form-field>

        </div>

        <div class="dialog-footer">
          <button mat-stroked-button type="button" (click)="close()">
            Cancel
          </button>
          <button mat-flat-button color="warn" type="submit"
                  [disabled]="form.invalid || submitting()">
            @if (submitting()) {
              <mat-spinner diameter="18" />
            } @else {
              Create Group
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-wrapper { width: 480px; max-width: 100%; }
    .dialog-header {
      display: flex; align-items: center;
      justify-content: space-between; padding: 20px 24px 0;
      h2 { font-size: 1.3rem; font-weight: 600; margin: 0; }
    }
    .dialog-body {
      padding: 20px 24px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .full-width { width: 100%; }
    .dialog-footer {
      display: flex; justify-content: flex-end;
      gap: 12px; padding: 0 24px 24px;
    }
  `]
})
export class CreateGroupDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateGroupDialogComponent>);
  private store = inject(GroupsStore);

  submitting = signal(false);

  form = this.fb.nonNullable.group({
    name:        ['', Validators.required],
    description: ['', Validators.required]
  });

 async onSubmit() {
  if (this.form.invalid) return;
  
  this.submitting.set(true);
  const formValue = this.form.getRawValue();
  
  console.log('📝 Form submitted:', formValue);

  // Pass complete CreateGroupRequest with placeholder createdBy
  const success = await this.store.createGroup({
    name: formValue.name,
    description: formValue.description,
    createdBy: 0 // ← Add this placeholder (store will replace it with actual user ID)
  });

  this.submitting.set(false);
  
  if (success) {
    console.log('✅ Dialog: Group created successfully');
    this.dialogRef.close(true);
  } else {
    console.error('❌ Dialog: Group creation failed');
  }
}

  close() {
    this.dialogRef.close(false);
  }
}
