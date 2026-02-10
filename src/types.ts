
export type StreakStatus = 'ACTIVE' | 'BROKEN' | 'CONQUERED';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  age: number;
  gender: string;
  profilePhoto?: string; // Base64 string
  target: string; // e.g., NEET, JEE, UPSC
  securityQuestion: string;
  securityAnswer: string;
}

export interface Streak {
  id: string;
  userId: string;
  name: string;
  task: string;
  targetDays: number;
  currentStreakCount: number;
  longestStreak: number;
  lastCompletedDate: string | null; // ISO UTC String
  createdAt: string; // ISO UTC String
  status: StreakStatus;
}

export interface StreakLog {
  id: string;
  streakId: string;
  completedAt: string; // ISO UTC String
  note?: string;
}

export interface Badge {
  id: string;
  userId: string;
  streakId?: string;
  milestone: number;
  label: string;
  earnedAt: string;
}

export const MILESTONES = [
  { value: 7, label: 'RECRUIT' },
  { value: 15, label: 'AWAKENED' },
  { value: 30, label: 'LOCKED IN' },
  { value: 50, label: 'SERIOUS' },
  { value: 100, label: 'IDENTITY' },
  { value: 150, label: 'UNSTOPPABLE' },
  { value: 200, label: 'ELITE' },
  { value: 250, label: 'MONOLITH' },
  { value: 300, label: 'IMMORTAL' },
  { value: 350, label: 'TITAN' },
  { value: 365, label: 'LEGENDARY' }
] as const;
