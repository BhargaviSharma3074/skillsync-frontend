
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  hidePassword = true;
  showPasswordRequirements = false;

  // 1. Validator defined BEFORE the form
  passwordValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasDigit = /[0-9]/.test(value);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(value);
    const hasMinLength = value.length >= 8;

    const isValid = hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar && hasMinLength;
    return isValid ? null : { passwordStrength: true };
  };

  // 2. Form comes AFTER the validator
  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, this.passwordValidator]]
  });

  // Getters for real-time validation
  get pw(): string {
    return this.form.get('password')?.value || '';
  }

  get hasMinLength(): boolean { return this.pw.length >= 8; }
  get hasUppercase(): boolean { return /[A-Z]/.test(this.pw); }
  get hasLowercase(): boolean { return /[a-z]/.test(this.pw); }
  get hasDigit(): boolean { return /[0-9]/.test(this.pw); }
  get hasSpecialChar(): boolean { return /[^A-Za-z0-9]/.test(this.pw); }

  get loading() { return this.auth.loading(); }

  onSubmit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();

    this.auth.register({
      username: `${v.firstName}.${v.lastName}`.toLowerCase(),
      email: v.email,
      password: v.password
    }).subscribe({
      next: () => {
        this.toast.success('Account created! Welcome to SkillSync 🎉');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if (err.status === 409) this.toast.error('Email already registered. Please login.');
        else if (err.status === 400) this.toast.error('Validation failed. Check your inputs.');
        else if (err.status === 0) this.toast.error('Cannot connect to server.');
        else this.toast.error('Registration failed. Please try again.');
      }
    });
  }
}