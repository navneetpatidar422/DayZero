import React, { useState, useEffect } from 'react';

export const UrgencyClock: React.FC = () => {
  const [timeData, setTimeData] = useState({
    dayLeft: '00:00:00',
    yearLeft: 0,
    yearProgress: 0
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      
      // 1. IST Countdown (Streak Window)
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istTime = new Date(utc + (3600000 * 5.5));
      const istMidnight = new Date(istTime);
      istMidnight.setHours(24, 0, 0, 0);
      const diff = istMidnight.getTime() - istTime.getTime();
      
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');

      // 2. Year Mortality
      const currentYear = now.getFullYear();
      const nextYear = new Date(currentYear + 1, 0, 1);
      const startOfYear = new Date(currentYear, 0, 1);
      const msInYear = nextYear.getTime() - startOfYear.getTime();
      const msLeftInYear = nextYear.getTime() - now.getTime();
      const daysLeft = Math.ceil(msLeftInYear / (1000 * 60 * 60 * 24));
      const yearPercent = 100 - (msLeftInYear / msInYear * 100);

      setTimeData({
        dayLeft: `${h}:${m}:${s}`,
        yearLeft: daysLeft,
        yearProgress: yearPercent
      });
    };

    const timer = setInterval(update, 1000);
    update();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#050000] border-y border-rose-900/30 py-6 mb-16 animate-fade-up">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Day Expiry */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[9px] font-black text-rose-900 uppercase tracking-[0.4em]">STREAK_DEATH_WINDOW</span>
            <span className="text-rose-600 font-black mono text-2xl tracking-tighter">{timeData.dayLeft}</span>
          </div>
          <div className="h-1 bg-zinc-950 w-full overflow-hidden">
            <div 
              className="h-full bg-rose-600 animate-pulse" 
              style={{ width: `${(parseInt(timeData.dayLeft.split(':')[0]) * 3600 + parseInt(timeData.dayLeft.split(':')[1]) * 60 + parseInt(timeData.dayLeft.split(':')[2])) / 86400 * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Year Mortality */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end mb-1">
            <div className="flex flex-col">
                <span className="text-[9px] font-black text-rose-900 uppercase tracking-[0.4em]">YEAR_DEPLETION_LEVEL</span>
                <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest mt-1">MORTALITY_WATCH: {timeData.yearProgress.toFixed(4)}%</span>
            </div>
            <div className="text-right">
                <span className="text-rose-600 font-black mono text-2xl tracking-tighter">{timeData.yearLeft}</span>
                <span className="text-rose-900 font-black mono text-[10px] ml-1">DAYS_LEFT</span>
            </div>
          </div>
          <div className="h-1 bg-zinc-950 w-full overflow-hidden">
            <div 
              className="h-full bg-rose-800" 
              style={{ width: `${timeData.yearProgress}%` }}
            ></div>
          </div>
        </div>

      </div>
      
      {/* Red Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-rose-600/5 to-transparent opacity-20"></div>
    </div>
  );
};
