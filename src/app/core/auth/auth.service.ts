
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginPayload, RegisterPayload, AuthResponse } from './auth.model';
import { decodeJwt, isTokenExpired } from './jwt.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _token = signal<string | null>(this.restoreToken());
  private _user = signal<User | null>(this.restoreUser());
  private _loading = signal(false);

  readonly currentUser = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly isLoggedIn = computed(() => {
    const t = this._token();
    return !!t && !isTokenExpired(t);
  });

  readonly userRole = computed(() => {
    const u = this._user();
    if (!u) return null;
    const r = Array.isArray(u.role) ? (u.role as string[])[0] : u.role;
    return r ?? null;
  });

  readonly isAdmin = computed(() => {
    const r = this.userRole();
    return r === 'ROLE_ADMIN' || r === 'ADMIN';
  });

  readonly isMentor = computed(() => {
    const r = this.userRole();
    return r === 'ROLE_MENTOR' || r === 'MENTOR';
  });

  readonly isLearner = computed(() => {
    const r = this.userRole();
    return r === 'ROLE_LEARNER' || r === 'LEARNER';
  });

  // ── Login ──────────────────────────────────────────────
  login(payload: LoginPayload): Observable<AuthResponse> {
    this._loading.set(true);
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/login`,
      { email: payload.email, password: payload.password }
    ).pipe(
      tap(res => {
        this.handleToken(res.token);
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        throw err;
      })
    );
  }

  // ── Register ────────────────────────────────────────────
  register(payload: RegisterPayload): Observable<AuthResponse> {
    this._loading.set(true);
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/register`,
      { username: payload.username, email: payload.email, password: payload.password }
    ).pipe(
      tap(res => {
        this.handleToken(res.token);
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        throw err;
      })
    );
  }

  // ── Refresh Token ───────────────────────────────────────
  // Called after admin approves mentor to get new JWT with MENTOR role
  refreshToken(): Observable<AuthResponse> {
    const currentToken = this._token();
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/refresh`,
      { token: currentToken }
    ).pipe(
      tap(res => {
        this.handleToken(res.token);
        console.log('✅ Token refreshed. New role:', this.userRole());
      }),
      catchError(err => {
        console.error('❌ Token refresh failed:', err);
        throw err;
      })
    );
  }

  // ── Logout ──────────────────────────────────────────────
  logout(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  getInitials(): string {
    const u = this._user();
    if (!u) return '?';
    const first = u.firstName || u.username || '';
    const last = u.lastName || '';
    return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase() || '?';
  }

  // ── Private helpers ─────────────────────────────────────
  private handleToken(token: string): void {
    this._token.set(token);
    localStorage.setItem('access_token', token);

    const decoded = decodeJwt(token);
    const user = this.buildUser(decoded);
    this._user.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private buildUser(decoded: ReturnType<typeof decodeJwt>): User {
    if (!decoded) {
      return {
        id: '',
        email: '',
        username: '',
        firstName: 'User',
        lastName: '',
        role: 'ROLE_LEARNER'
      };
    }

    const email = decoded.sub ?? '';
    const username = email.split('@')[0];
    const parts = username.split(/[\s._-]+/);
    const firstName = capitalize(parts[0] ?? 'User');
    const lastName = capitalize(parts[1] ?? '');

    const roles = decoded.roles ?? [];
    const role = roles[0] ?? 'ROLE_LEARNER';

    return {
      id: String(decoded.userId ?? ''),
      email,
      username,
      firstName,
      lastName,
      role: role as User['role']
    };
  }

  private restoreToken(): string | null {
    const t = localStorage.getItem('access_token');
    if (t && !isTokenExpired(t)) return t;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    return null;
  }

  private restoreUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
}