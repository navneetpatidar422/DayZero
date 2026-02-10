
import { User, Streak, StreakLog, Badge, StreakStatus } from '../types';

const STORAGE_KEYS = {
  USERS: 'dayzero_users',
  STREAKS: 'dayzero_streaks',
  LOGS: 'dayzero_logs',
  BADGES: 'dayzero_badges',
  AUTH: 'dayzero_current_user'
};

const get = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const set = <T>(key: string, data: T[]) => localStorage.setItem(key, JSON.stringify(data));

export const DB = {
  users: {
    find: (username: string) => get<User>(STORAGE_KEYS.USERS).find(u => u.username === username),
    create: (user: User) => {
      const users = get<User>(STORAGE_KEYS.USERS);
      users.push(user);
      set(STORAGE_KEYS.USERS, users);
    },
    update: (user: User) => {
      const users = get<User>(STORAGE_KEYS.USERS);
      const index = users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users[index] = user;
        set(STORAGE_KEYS.USERS, users);
      }
    },
    updatePassword: (username: string, newHash: string) => {
      const users = get<User>(STORAGE_KEYS.USERS);
      const index = users.findIndex(u => u.username === username);
      if (index !== -1) {
        users[index].passwordHash = newHash;
        set(STORAGE_KEYS.USERS, users);
      }
    }
  },
  streaks: {
    getByUser: (userId: string) => get<Streak>(STORAGE_KEYS.STREAKS).filter(s => s.userId === userId),
    getById: (id: string) => get<Streak>(STORAGE_KEYS.STREAKS).find(s => s.id === id),
    update: (streak: Streak) => {
      const all = get<Streak>(STORAGE_KEYS.STREAKS);
      const index = all.findIndex(s => s.id === streak.id);
      if (index !== -1) {
        all[index] = streak;
        set(STORAGE_KEYS.STREAKS, all);
      }
    },
    create: (streak: Streak) => {
      const all = get<Streak>(STORAGE_KEYS.STREAKS);
      all.push(streak);
      set(STORAGE_KEYS.STREAKS, all);
    }
  },
  logs: {
    getByStreak: (streakId: string) => get<StreakLog>(STORAGE_KEYS.LOGS).filter(l => l.streakId === streakId),
    create: (log: StreakLog) => {
      const all = get<StreakLog>(STORAGE_KEYS.LOGS);
      all.push(log);
      set(STORAGE_KEYS.LOGS, all);
    }
  },
  badges: {
    getByUser: (userId: string) => get<Badge>(STORAGE_KEYS.BADGES).filter(b => b.userId === userId),
    create: (badge: Badge) => {
      const all = get<Badge>(STORAGE_KEYS.BADGES);
      all.push(badge);
      set(STORAGE_KEYS.BADGES, all);
    }
  }
};
