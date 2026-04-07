export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdBy: string | number;
  createdByUserId: string | number;
  skills: string[];
  isPublic: boolean;
  lastActive?: string;
  joined: boolean;
  icon?: string;
  active: boolean;
}

// Raw response from backend (ACTUAL response structure)
export interface RawGroup {
  id: number;
  name: string;
  description: string;
  createdBy: number;
  createdAt: string;
  // Backend doesn't return these yet:
  memberCount?: number;
  isPublic?: boolean;
  active?: boolean;
  members?: number[];
}

// ✅ UPDATED - Add createdBy
export interface CreateGroupRequest {
  name: string;
  description: string;
  createdBy: number; // ← Add this
}

// For join/leave requests
export interface GroupMemberRequest {
  userId: number;
}