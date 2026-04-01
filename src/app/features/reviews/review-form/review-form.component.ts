import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReviewsService, Review } from '../reviews.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { avatarColor } from '../../../shared/utils/avatar-color';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule, InitialsPipe, TimeAgoPipe
  ],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.scss'
})
export class ReviewFormComponent implements OnInit {
  private svc = inject(ReviewsService);
  private toast = inject(ToastService);
  avatarColor = avatarColor;

  reviews = signal<Review[]>([]);
  hoverRating = 0;
  selectedRating = 0;
  comment = '';

  ngOnInit() {
    this.svc.getMyReviews().subscribe({
      next: r => this.reviews.set(r),
      error: () => this.reviews.set([
        { id:'1', mentorId:'1', mentorName:'Priya Sharma', rating:5, comment:'Amazing session! Very clear explanations of Spring Boot concepts.', createdAt:'2025-03-10T10:00:00' },
        { id:'2', mentorId:'2', mentorName:'Arjun Mehta', rating:4, comment:'Good intro to ML. Would book again.', createdAt:'2025-03-08T14:00:00' }
      ])
    });
  }

  setRating(n: number) { this.selectedRating = n; }

  stars(n: number): string {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  submit() {
    if (!this.selectedRating || !this.comment) return;
    this.toast.success('Review submitted!');
    this.selectedRating = 0;
    this.comment = '';
  }
}