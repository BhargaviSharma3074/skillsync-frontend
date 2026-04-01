export interface Mentor {
  id: string;
  name: string;
  experience: number;
  rating: number;
  reviewCount: number;
  skills: string[];
  hourlyRate: number;
  available: boolean;
  bio?: string;
  title?: string;
}

export interface MentorFilter {
  search?: string;
  skills?: string[];
  minRating?: number;
  maxRate?: number;
  minExperience?: number;
  availability?: boolean;
  sort?: 'relevant' | 'rating' | 'price_low' | 'price_high' | 'experience';
}