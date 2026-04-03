// import { Component, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { AuthService } from '../../../core/auth/auth.service';
// import { ToastService } from '../../../shared/components/toast/toast.service';

// type LoginRole = 'user' | 'mentor';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     CommonModule, ReactiveFormsModule, RouterModule,
//     MatFormFieldModule, MatInputModule, MatButtonModule,
//     MatIconModule, MatProgressSpinnerModule
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
//   activeRole = signal<LoginRole>('user');

//   loginForm = this.fb.nonNullable.group({
//     email: ['', [Validators.required, Validators.email]],
//     password: ['', [Validators.required, Validators.minLength(6)]]
//   });

//   get loading() { return this.auth.loading(); }

//   switchRole(role: LoginRole) {
//     this.activeRole.set(role);
//     this.hidePassword = true;
//     this.loginForm.reset();
//   }

//   onLogin() {
//     if (this.loginForm.invalid) return;
//     const val = this.loginForm.getRawValue();

//     this.auth.login({
//       email: val.email,
//       password: val.password
//     }).subscribe({
//       next: () => {
//         this.toast.success('Welcome back!');
//         this.router.navigate(['/dashboard']);
//       },
//       error: (err) => {
//         if (err.status === 401) {
//           this.toast.error('Invalid email or password');
//         } else if (err.status === 403) {
//           this.toast.error('Account is deactivated. Contact support.');
//         } else if (err.status === 0) {
//           this.toast.error('Cannot connect to server');
//         } else {
//           this.toast.error('Login failed. Please try again.');
//         }
//       }
//     });
//   }
// }


import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

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
  private toast = inject(ToastService);

  hidePassword = true;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  get loading() { return this.auth.loading(); }

  onSubmit() {
    if (this.form.invalid) return;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Welcome back! 👋');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if (err.status === 401) this.toast.error('Invalid email or password');
        else if (err.status === 403) this.toast.error('Account deactivated. Contact support.');
        else if (err.status === 0) this.toast.error('Cannot connect to server.');
        else this.toast.error('Login failed. Please try again.');
      }
    });
  }
}