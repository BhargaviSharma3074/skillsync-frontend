export interface Mentor {
  id: string;
  userId: string;
  
  // User details (will be fetched separately)
  name: string;          // Computed from user data
  userName?: string;     // Full name from user service
  userEmail?: string;    // Email from user service
  
  experience: number;
  rating: number;
  reviewCount: number;
  skills: string[];
  hourlyRate: number;
  available: boolean;
  bio?: string;
  title?: string;
  availability?: string;
  status?: string;
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

// Response from backend mentor service
export interface RawMentorResponse {
  id: number;
  userId: number;
  bio?: string;
  experience: number;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  status: string;
  availability?: string;
  skills: string[];
}

// Response from user service
export interface UserResponse {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  profilePictureUrl?: string;
}