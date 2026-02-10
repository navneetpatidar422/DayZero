
import React from 'react';
import { StreakLog } from '../types';

interface HeatmapProps {
  logs: StreakLog[];
  targetDays: number;
  startDate: string;
}

export const Heatmap: React.FC<HeatmapProps> = ({ logs, targetDays, startDate }) => {
  // We generate exactly targetDays squares starting from the createdAt date
  const baseDate = new Date(startDate);
  baseDate.setHours(0, 0, 0, 0);

  const completionMap = new Set(
    logs.map(log => {
      const d = new Date(log.completedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Layout logic: We want columns, but if targetDays is large, we wrap.
  // The user specifically asked for "no. of columns equal to target days".
  // To handle very large streaks (e.g. 365), we'll use a horizontal scroll container.

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div 
        className="grid gap-1.5"
        style={{ 
          gridTemplateColumns: `repeat(${targetDays}, minmax(12px, 1fr))`,
          width: 'max-content'
        }}
      >
        {Array.from({ length: targetDays }).map((_, i) => {
          const currentDate = new Date(baseDate);
          currentDate.setDate(baseDate.getDate() + i);
          const time = currentDate.getTime();
          
          const isCompleted = completionMap.has(time);
          const isToday = time === today.getTime();
          const isPast = time < today.getTime();
          const isFuture = time > today.getTime();

          return (
            <div
              key={i}
              title={currentDate.toDateString()}
              className={`w-3.5 h-3.5 rounded-sm transition-all duration-500 ${
                isCompleted 
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-110' 
                  : isToday 
                    ? 'border border-rose-500 animate-pulse'
                    : isPast && !isCompleted
                      ? 'bg-rose-950/40 border border-rose-900/20'
                      : 'bg-zinc-800'
              } ${isFuture ? 'opacity-40' : 'opacity-100'}`}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">
        <span>CONTRACT_START</span>
        <span>{targetDays}_DAY_CAPACITY</span>
      </div>
    </div>
  );
};
