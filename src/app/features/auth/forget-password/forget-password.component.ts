import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule
  ],
  template: `
    <div class="fp-page">
      <div class="fp-card">
        <h2>Reset Password 🔑</h2>
        <p class="subtitle">Enter your email and we'll send you a reset link</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email Address</mat-label>
            <input matInput formControlName="email" type="email" />
          </mat-form-field>
          <button mat-flat-button color="warn" class="submit-btn" type="submit"
                  [disabled]="form.invalid">SEND RESET LINK →</button>
        </form>
        <p class="back-link"><a routerLink="/login">← Back to Sign In</a></p>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/tokens' as *;
    .fp-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:$bg-body; }
    .fp-card { background:#fff; padding:48px; border-radius:16px; box-shadow:$shadow-card; max-width:420px; width:100%; }
    .subtitle { color:$text-secondary; margin-bottom:24px; }
    .full-width { width:100%; }
    .submit-btn { width:100%; height:46px; border-radius:$radius-pill !important; background:$accent !important; font-weight:600; }
    .back-link { text-align:center; margin-top:20px; a { color:$accent; font-weight:500; } }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit() {
    this.toast.success('Reset link sent to your email!');
  }
}