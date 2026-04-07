
import { Component, OnInit, ElementRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent implements OnInit {
  private el = inject(ElementRef);

  ngOnInit() {
    // Remove aria-hidden if it was incorrectly set
    this.el.nativeElement.removeAttribute('aria-hidden');
  }
}