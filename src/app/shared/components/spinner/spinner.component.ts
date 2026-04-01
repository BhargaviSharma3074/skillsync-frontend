import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="spinner-overlay" [class.inline]="!overlay">
      <mat-spinner [diameter]="diameter" />
    </div>
  `,
  styles: [`
    .spinner-overlay {
      display: flex; align-items: center; justify-content: center;
      position: fixed; inset: 0; background: rgba(255,255,255,.7); z-index: 9999;
    }
    .inline { position: static; background: none; padding: 48px 0; }
  `]
})
export class SpinnerComponent {
  @Input() diameter = 48;
  @Input() overlay = true;
}