
import { User, Streak, StreakLog, Badge, StreakStatus } from '../types';
import { DB } from './db';

export const Backend = {
  delay: (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms)),

  users: {
    authenticate: async (username: string, hash: string) => {
      await Backend.delay();
      const user = DB.users.find(username);
      if (user && user.passwordHash === hash) return user;
      throw new Error('IDENT_INVALID');
    },
    register: async (userData: Omit<User, 'id'>) => {
      await Backend.delay();
      if (DB.users.find(userData.username)) throw new Error('USERNAME_TAKEN');
      const user: User = { ...userData, id: crypto.randomUUID() };
      DB.users.create(user);
      return user;
    },
    getSecurityQuestion: async (username: string) => {
      await Backend.delay(200);
      const user = DB.users.find(username);
      if (!user) throw new Error('NOT_FOUND');
      return user.securityQuestion;
    },
    verifySecurityAnswer: async (username: string, answer: string) => {
      await Backend.delay();
      const user = DB.users.find(username);
      if (user && user.securityAnswer.toLowerCase() === answer.toLowerCase()) return true;
      throw new Error('ANSWER_INCORRECT');
    }
  },

  streaks: {
    sync: async (userId: string) => {
      await Backend.delay(100);
      const streaks = DB.streaks.getByUser(userId);
      const now = new Date();
      const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).getTime();
      
      let modified = false;
      streaks.forEach(s => {
        if (s.status === 'BROKEN') return;
        
        const created = new Date(s.createdAt);
        const last = s.lastCompletedDate ? new Date(s.lastCompletedDate) : created;
        const lastDayUTC = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate())).getTime();
        
        // If more than 24 hours (86.4m ms) since the end of the day they should have completed it.
        if (todayUTC - lastDayUTC > 86400000) {
          s.status = 'BROKEN';
          s.currentStreakCount = 0;
          modified = true;
          DB.streaks.update(s);
        }
      });
      
      return DB.streaks.getByUser(userId);
    }
  }
};
