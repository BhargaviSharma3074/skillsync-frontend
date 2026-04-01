import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api/api.service';

export interface Review {
  id: string;
  mentorId: string;
  mentorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private api = inject(ApiService);

  getMyReviews(): Observable<Review[]> {
    return this.api.get<Review[]>('/reviews/me');
  }

  submitReview(body: { mentorId: string; rating: number; comment: string }): Observable<Review> {
    return this.api.post<Review>('/reviews', body);
  }
}