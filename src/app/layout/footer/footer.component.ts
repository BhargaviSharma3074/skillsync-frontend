import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <span>© 2025 SkillSync — Peer Learning &amp; Mentor Matching Platform</span>
    </footer>
  `,
  styles: [`
    .footer {
      text-align: center; padding: 16px; font-size: 13px;
      color: #999; border-top: 1px solid #e8e8e8;
    }
  `]
})
export class FooterComponent {}