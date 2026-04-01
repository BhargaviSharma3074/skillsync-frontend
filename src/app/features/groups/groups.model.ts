export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdBy: string;
  skills: string[];
  isPublic: boolean;
  lastActive: string;
  postsThisWeek: number;
  joined: boolean;
  icon?: string;
}