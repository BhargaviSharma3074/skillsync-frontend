import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  
  // Theme state using Angular Signals
  theme = signal<'light' | 'dark'>(this.getInitialTheme());

  constructor() {
    // Automatically persist theme changes
    effect(() => {
      const currentTheme = this.theme();
      localStorage.setItem(this.THEME_KEY, currentTheme);
      this.applyTheme(currentTheme);
    });
  }

  toggleTheme() {
    this.theme.update(t => (t === 'light' ? 'dark' : 'light'));
  }

  isDarkMode() {
    return this.theme() === 'dark';
  }

  private getInitialTheme(): 'light' | 'dark' {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as 'light' | 'dark';
    if (savedTheme) return savedTheme;
    
    // Default to system preference or light
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: 'light' | 'dark') {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
