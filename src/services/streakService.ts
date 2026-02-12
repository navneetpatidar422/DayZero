
import { DB } from './db';
import { Streak, StreakLog, Badge, MILESTONES, StreakStatus } from '../types';

// Helper to get current Date object adjusted to IST
const getISTDate = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 5.5));
};

// Helper to get the start of the day in IST as a timestamp
const getISTTodayTimestamp = () => {
  const ist = getISTDate();
  return new Date(ist.getFullYear(), ist.getMonth(), ist.getDate()).getTime();
};

export const StreakService = {
  validateStreaks: (userId: string): Streak[] => {
    const streaks = DB.streaks.getByUser(userId);
    const todayIST = getISTTodayTimestamp();

    streaks.forEach(streak => {
      if (streak.status !== 'ACTIVE') return;
      
      if (!streak.lastCompletedDate) {
        const createdDate = new Date(streak.createdAt);
        // Convert creation date to IST for comparison
        const createdUTC = createdDate.getTime() + (createdDate.getTimezoneOffset() * 60000);
        const createdISTDate = new Date(createdUTC + (3600000 * 5.5));
        const createdDayIST = new Date(createdISTDate.getFullYear(), createdISTDate.getMonth(), createdISTDate.getDate()).getTime();
        
        if (todayIST - createdDayIST > 86400000) {
           streak.status = 'BROKEN';
           DB.streaks.update(streak);
        }
        return;
      }

      const lastDate = new Date(streak.lastCompletedDate);
      const lastUTC = lastDate.getTime() + (lastDate.getTimezoneOffset() * 60000);
      const lastISTDate = new Date(lastUTC + (3600000 * 5.5));
      const lastDayIST = new Date(lastISTDate.getFullYear(), lastISTDate.getMonth(), lastISTDate.getDate()).getTime();
      
      const diffMs = todayIST - lastDayIST;
      if (diffMs > 86400000) {
        streak.status = 'BROKEN';
        streak.currentStreakCount = 0;
        DB.streaks.update(streak);
      }
    });

    return DB.streaks.getByUser(userId);
  },

  completeDay: (streakId: string, note?: string): Streak => {
    const streak = DB.streaks.getById(streakId);
    if (!streak || streak.status !== 'ACTIVE') throw new Error('Streak is unavailable.');

    const now = new Date();
    const nowUTCString = now.toISOString();
    const todayIST = getISTTodayTimestamp();

    if (streak.lastCompletedDate) {
      const last = new Date(streak.lastCompletedDate);
      const lastUTC = last.getTime() + (last.getTimezoneOffset() * 60000);
      const lastISTDate = new Date(lastUTC + (3600000 * 5.5));
      const lastDayIST = new Date(lastISTDate.getFullYear(), lastISTDate.getMonth(), lastISTDate.getDate()).getTime();

      if (lastDayIST === todayIST) {
        throw new Error('Already completed for today.');
      }
    }

    streak.currentStreakCount += 1;
    if (streak.currentStreakCount > streak.longestStreak) {
      streak.longestStreak = streak.currentStreakCount;
    }
    streak.lastCompletedDate = nowUTCString;

    if (streak.currentStreakCount >= streak.targetDays) {
      streak.status = 'CONQUERED';
    }

    const log: StreakLog = {
      id: crypto.randomUUID(),
      streakId: streak.id,
      completedAt: nowUTCString,
      note
    };
    DB.logs.create(log);

    const milestone = MILESTONES.find(m => m.value === streak.currentStreakCount);
    if (milestone) {
      const newBadge: Badge = {
        id: crypto.randomUUID(),
        userId: streak.userId,
        streakId: streak.id,
        milestone: milestone.value,
        label: milestone.label,
        earnedAt: nowUTCString
      };
      DB.badges.create(newBadge);
    }

    if (streak.status === 'CONQUERED') {
      const newBadge: Badge = {
        id: crypto.randomUUID(),
        userId: streak.userId,
        streakId: streak.id,
        milestone: streak.targetDays,
        label: 'CONTRACT_FULFILLED',
        earnedAt: nowUTCString
      };
      DB.badges.create(newBadge);
    }

    DB.streaks.update(streak);
    return streak;
  }
};