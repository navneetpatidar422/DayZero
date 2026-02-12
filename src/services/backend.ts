import { User, Streak, StreakLog, Badge, StreakStatus } from '../types';
import { DB } from './db';

const getISTTodayTimestamp = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (3600000 * 5.5));
  return new Date(ist.getFullYear(), ist.getMonth(), ist.getDate()).getTime();
};

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
      const todayIST = getISTTodayTimestamp();
      
      let modified = false;
      streaks.forEach(s => {
        if (s.status !== 'ACTIVE') return;
        
        const created = new Date(s.createdAt);
        const last = s.lastCompletedDate ? new Date(s.lastCompletedDate) : created;
        
        // Convert last completion to IST day start
        const lastUTC = last.getTime() + (last.getTimezoneOffset() * 60000);
        const lastIST = new Date(lastUTC + (3600000 * 5.5));
        const lastDayIST = new Date(lastIST.getFullYear(), lastIST.getMonth(), lastIST.getDate()).getTime();
        
        // If today is more than 1 day ahead of the last completion day in IST
        if (todayIST - lastDayIST > 86400000) {
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
