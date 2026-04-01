export interface Session {
  id: string;
  mentorId: string;
  mentorName: string;
  learnerId: string;
  learnerName: string;
  dateTime: string;
  duration: number;         // minutes
  topic: string;
  format: 'VIDEO_CALL' | 'CHAT';
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  rate: number;
}

export interface TimeSlot {
  time: string;             // "09:00 AM"
  available: boolean;
}

export interface BookingPayload {
  mentorId: string;
  date: string;             // ISO date
  time: string;
  duration: number;
  topic: string;
}