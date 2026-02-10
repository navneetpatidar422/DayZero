
import React, { useState, useEffect } from 'react';

export const Countdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      
      // Convert current time to IST
      // IST is UTC + 5.5 hours
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istTime = new Date(utc + (3600000 * 5.5));
      
      // Calculate next midnight IST
      const istMidnight = new Date(istTime);
      istMidnight.setHours(24, 0, 0, 0);
      
      const diff = istMidnight.getTime() - istTime.getTime();
      
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      
      setTimeLeft(`${h}:${m}:${s}`);
    };

    const timer = setInterval(update, 1000);
    update();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-xs mono font-bold text-rose-500 uppercase tracking-widest">
      STREAK DEATH (IST): {timeLeft}
    </div>
  );
};
