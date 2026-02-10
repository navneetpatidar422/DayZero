
import { DB } from './db';
import { Streak, StreakLog, Badge, MILESTONES, StreakStatus } from '../types';

export const StreakService = {
  validateStreaks: (userId: string): Streak[] => {
    const streaks = DB.streaks.getByUser(userId);
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    streaks.forEach(streak => {
      if (streak.status !== 'ACTIVE') return;
      if (!streak.lastCompletedDate) {
        const createdDate = new Date(streak.createdAt);
        const createdDayUTC = new Date(Date.UTC(createdDate.getUTCFullYear(), createdDate.getUTCMonth(), createdDate.getUTCDate()));
        if (todayUTC.getTime() - createdDayUTC.getTime() > 86400000) {
           streak.status = 'BROKEN';
           DB.streaks.update(streak);
        }
        return;
      }

      const lastDate = new Date(streak.lastCompletedDate);
      const lastDateUTC = new Date(Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDate()));
      const diffMs = todayUTC.getTime() - lastDateUTC.getTime();
      const diffDays = diffMs / 86400000;

      if (diffDays > 1) {
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
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (streak.lastCompletedDate) {
      const last = new Date(streak.lastCompletedDate);
      const lastUTC = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate()));
      if (lastUTC.getTime() === todayUTC.getTime()) {
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

    // Check Milestones
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

    // Check custom targetDays milestone
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
