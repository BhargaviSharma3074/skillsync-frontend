import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
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
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  avatarColor = avatarColor;

  mentorId = '';
  mentorName = '';

  reviews = signal<Review[]>([]);
  hoverRating = 0;
  selectedRating = 0;
  comment = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.mentorId = params['mentorId'] || '';
      this.mentorName = params['mentorName'] || '';
    });
    this.loadReviews();
  }

  loadReviews() {
    this.svc.getMyReviews().subscribe({
      next: r => this.reviews.set(r),
      error: () => {
        // Fallback or handle error
      }
    });
  }

  setRating(n: number) { this.selectedRating = n; }

  stars(n: number): string {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  submit() {
    if (!this.selectedRating || !this.comment || !this.mentorId) {
      if (!this.mentorId) this.toast.error('No mentor selected for review');
      return;
    }

    this.svc.submitReview({
      mentorId: this.mentorId,
      rating: this.selectedRating,
      comment: this.comment
    }).subscribe({
      next: () => {
        this.toast.success('Review submitted successfully!');
        this.selectedRating = 0;
        this.comment = '';
        this.loadReviews();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to submit review');
      }
    });
  }
}