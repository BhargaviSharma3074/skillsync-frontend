
// import { Component, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSnackBarModule } from '@angular/material/snack-bar';  // ← ADD THIS
// import { AuthService } from '../../../core/auth/auth.service';
// import { ToastService } from '../../../shared/components/toast/toast.service';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     CommonModule, ReactiveFormsModule, RouterModule,
//     MatFormFieldModule, MatInputModule, MatButtonModule,
//     MatIconModule, MatProgressSpinnerModule,
//     MatSnackBarModule   // ← ADD THIS
//   ],
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.scss'
// })
// export class LoginComponent {
//   private fb = inject(FormBuilder);
//   private auth = inject(AuthService);
//   private router = inject(Router);
//   private toast = inject(ToastService);

//   hidePassword = true;

//   form = this.fb.nonNullable.group({
//     email: ['', [Validators.required, Validators.email]],
//     password: ['', [Validators.required, Validators.minLength(6)]]
//   });

//   get loading() { return this.auth.loading(); }

//   onSubmit() {

//     // console.log('Submit clicked');
//     // this.toast.error('Test toast message');
//     // console.log('Toast called');
//     // return;
//     if (this.form.invalid) return;

//     this.auth.login(this.form.getRawValue()).subscribe({
//       next: () => {
//         this.toast.success('Welcome back! 👋');
//         this.router.navigate(['/dashboard']);
//       },
//       error: (err) => {
//         if (err.status === 401 || err.status === 400) {
//           this.toast.error('Email or password is incorrect');
//           this.form.get('password')?.reset();
//         }
//         else if (err.status === 403) {
//           this.toast.error('Account deactivated. Contact support.');
//         }
//         else if (err.status === 0) {
//           this.toast.error('Cannot connect to server.');
//         }
//         else {
//           this.toast.error('Login failed. Please try again.');
//         }
//       }
//     });
//   }
// }


import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  hidePassword = true;

  // Error message signal
  errorMessage = signal<string | null>(null);

  // Form logic
  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  // Getters for cleaner template access
  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  // New properties for the template
  features = [
    { icon: '🎯', title: 'Expert mentors matched to your goals' },
    { icon: '📅', title: '1-on-1 sessions at your convenience' },
    { icon: '👥', title: 'Peer learning groups & communities' },
    { icon: '⭐', title: 'Track growth with ratings & reviews' }
  ];

  socialLoading: string | null = null;
  loadingAuth = signal(false); // Alias or additional state if needed

  get loading() { return this.auth.loading(); }

  onSubmit() {
    if (this.loginForm.invalid) return;

    // Clear previous error
    this.errorMessage.set(null);

    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.errorMessage.set(null);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.log('Login error status:', err.status);
        console.log('Login error:', err);

        if (err.status === 401 || err.status === 400) {
          this.errorMessage.set('Email or password is incorrect. Please try again.');
          this.loginForm.get('password')?.reset();
        } else if (err.status === 403) {
          this.errorMessage.set('Your account has been deactivated. Contact support.');
        } else if (err.status === 0) {
          this.errorMessage.set('Cannot connect to server. Check your internet connection.');
        } else {
          this.errorMessage.set('Login failed. Please try again.');
        }
      }
    });
  }

  clearError() {
    this.errorMessage.set(null);
  }

  onForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  onSignUp() {
    this.router.navigate(['/register']);
  }

  onSocialLogin(provider: string) {
    this.socialLoading = provider;
    console.log(`Social login with ${provider} triggered`);
    // Mock simulation
    setTimeout(() => {
      this.socialLoading = null;
    }, 2000);
  }
}