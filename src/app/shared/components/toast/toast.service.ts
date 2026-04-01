import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private snack = inject(MatSnackBar);

  success(message: string) {
    this.snack.open(message, '✕', {
      duration: 3000, panelClass: ['toast-success'], horizontalPosition: 'end'
    });
  }

  error(message: string) {
    this.snack.open(message, '✕', {
      duration: 5000, panelClass: ['toast-error'], horizontalPosition: 'end'
    });
  }

  info(message: string) {
    this.snack.open(message, '✕', {
      duration: 3000, panelClass: ['toast-info'], horizontalPosition: 'end'
    });
  }
}