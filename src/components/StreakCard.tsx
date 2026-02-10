import React, { useState, useEffect } from 'react';
import { Streak, StreakLog, MILESTONES } from '../types';
import { Heatmap } from './Heatmap';
import { Countdown } from './Countdown';
import { DB } from '../services/db';

interface StreakCardProps {
  streak: Streak;
  onComplete: (id: string, note?: string) => void;
  onRestart: (id: string) => void;
}

export const StreakCard: React.FC<StreakCardProps> = ({ streak, onComplete, onRestart }) => {
  const [bounce, setBounce] = useState(false);
  const logs = DB.logs.getByStreak(streak.id);
  
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).getTime();
  
  const lastDate = streak.lastCompletedDate ? new Date(streak.lastCompletedDate) : null;
  const lastDateUTC = lastDate ? new Date(Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDate())).getTime() : null;
  
  const isDoneToday = lastDateUTC === todayUTC;
  const isBroken = streak.status === 'BROKEN';
  const isConquered = streak.status === 'CONQUERED';

  // Milestone logic for "Unlocking" effect
  const nextMilestone = MILESTONES.find(m => streak.currentStreakCount < m.value) || MILESTONES[MILESTONES.length - 1];
  const prevMilestone = [...MILESTONES].reverse().find(m => streak.currentStreakCount >= m.value);
  const prevValue = prevMilestone ? prevMilestone.value : 0;
  
  // Calculate percentage of progress through the current bracket (e.g., from 0 to 7, or 7 to 15)
  const bracketRange = nextMilestone.value - prevValue;
  const currentInRange = streak.currentStreakCount - prevValue;
  const tagFillPercent = Math.min(100, Math.max(0, (currentInRange / bracketRange) * 100));

  const progressPercent = (streak.currentStreakCount / streak.targetDays) * 100;

  // Trigger bounce effect when streak count changes
  useEffect(() => {
    if (streak.currentStreakCount > 0) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 400);
      return () => clearTimeout(timer);
    }
  }, [streak.currentStreakCount]);

  const handleShare = () => {
    const text = `IDENTITY_SECURED: Protocol "${streak.name}" conquered after ${streak.currentStreakCount} days. 100% Discipline. System Status: ELITE. [DAYZERO]`;
    navigator.clipboard.writeText(text);
    alert('BATTLE_REPORT COPIED TO DATASTREAM.');
  };

  return (
    <div className={`animate-fade-up relative border p-6 rounded-none transition-all duration-700 overflow-hidden group ${
        isBroken 
          ? 'border-red-950 bg-red-950/20 shadow-[0_0_30px_rgba(153,27,27,0.1)]' 
          : isConquered
            ? 'border-yellow-600 bg-yellow-950/20 shadow-[0_0_30px_rgba(234,179,8,0.1)]'
            : isDoneToday 
              ? 'border-emerald-800 bg-emerald-950/20 shadow-[0_0_30px_rgba(6,95,70,0.1)]' 
              : 'border-zinc-800 bg-zinc-900 shadow-[0_0_20px_rgba(255,0,60,0.05)]'
      }`}
    >
      <div className={`absolute -left-10 -top-10 text-[10rem] font-black text-white/[0.03] select-none italic pointer-events-none transition-transform duration-500 ${bounce ? 'scale-110' : ''}`}>
        {streak.currentStreakCount}
      </div>

      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
        {isBroken ? (
          <span className="text-rose-600 font-black mono uppercase text-sm">ELIMINATED</span>
        ) : isConquered ? (
          <div className="flex flex-col items-end gap-2">
            <span className="text-yellow-500 font-black mono uppercase text-sm">CONQUERED</span>
            <button onClick={handleShare} className="text-[10px] text-yellow-500 border border-yellow-500/30 px-3 py-1 bg-yellow-500/5 hover:bg-yellow-500 hover:text-black transition-all font-black">
              SHARE_RESULT
            </button>
          </div>
        ) : isDoneToday ? (
          <span className="text-emerald-500 font-black mono uppercase text-sm">PROTECTED</span>
        ) : (
          <Countdown />
        )}
      </div>

      <div className="mb-8 pt-4">
        <h3 className="text-3xl font-black uppercase tracking-tighter leading-none italic group-hover:glitch-text transition-all" data-text={streak.name}>{streak.name}</h3>
        <div className="mt-4 flex items-center gap-2">
           <div className="w-1 h-3 bg-zinc-700"></div>
           <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">{streak.task}</p>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div className={`flex items-baseline gap-2 transition-transform duration-500 ${bounce ? 'animate-bounce-count' : ''}`}>
          <span className={`text-7xl font-black mono tracking-tighter ${
            isBroken ? 'text-red-900' : isConquered ? 'text-yellow-500' : isDoneToday ? 'text-emerald-500' : 'text-white'
          }`}>
            {streak.currentStreakCount}
          </span>
          <div className="flex flex-col">
            <span className="text-zinc-600 font-black uppercase text-[10px] tracking-[0.2em]">DAY</span>
            <span className="text-zinc-600 font-black uppercase text-[10px] tracking-[0.2em]">CHAIN</span>
          </div>
        </div>
        <div className="h-16 w-px bg-zinc-800" />
        
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">TARGET_TAG</span>
          <div className="relative">
            {/* Ghost text (faded part) */}
            <span className="text-3xl font-black italic tracking-tighter uppercase text-zinc-800/40 select-none whitespace-nowrap">
              {nextMilestone.label}
            </span>
            {/* Filled text (progress part) */}
            <span 
              className={`absolute top-0 left-0 text-3xl font-black italic tracking-tighter uppercase transition-all duration-1000 overflow-hidden whitespace-nowrap ${
                isBroken ? 'text-zinc-800' : isConquered ? 'text-yellow-500' : isDoneToday ? 'text-emerald-400' : 'text-zinc-100'
              }`}
              style={{ clipPath: `inset(0 ${100 - tagFillPercent}% 0 0)` }}
            >
              {nextMilestone.label}
            </span>
          </div>
          <span className="text-[8px] font-black text-zinc-700 mt-1 tracking-widest uppercase">
            {Math.round(tagFillPercent)}%_UNLOCKED
          </span>
        </div>
      </div>

      {!isBroken && !isDoneToday && !isConquered && (
        <div className="space-y-4 relative z-10 animate-fade-up">
          <button
            onClick={() => onComplete(streak.id)}
            className="w-full bg-rose-600 text-white font-black py-5 uppercase tracking-[0.4em] hover:bg-rose-500 transition-all active:scale-95 text-xs shadow-[0_0_20px_rgba(255,0,60,0.1)]"
          >
            I SHOWED UP TODAY
          </button>
        </div>
      )}

      {isBroken && (
        <div className="space-y-4 relative z-10 animate-fade-up">
          <div className="text-center p-5 border border-red-900 text-red-700 bg-red-950/20 text-xs font-black uppercase tracking-[0.3em] italic">
            PROTOCOL_TERMINATED
          </div>
          <button
            onClick={() => onRestart(streak.id)}
            className="w-full bg-white text-black font-black py-5 uppercase tracking-[0.4em] hover:bg-rose-600 hover:text-white transition-all active:scale-95 text-xs"
          >
            RESTART_PROTOCOL
          </button>
        </div>
      )}

      {(isDoneToday || isConquered) && !isBroken && (
        <div className={`text-center p-5 border text-xs font-black uppercase tracking-[0.3em] italic ${
          isConquered ? 'border-yellow-600 text-yellow-500 bg-yellow-950/20' :
          'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
        }`}>
          {isConquered ? 'CONTRACT_FULFILLED' : 'IDENTITY_SECURED'}
        </div>
      )}

      <div className="mt-12">
        <div className="flex justify-between text-[9px] uppercase font-black text-zinc-600 mb-3 tracking-[0.2em]">
          <span>Path to {streak.targetDays} Days</span>
          <span className={isConquered ? 'text-yellow-500' : 'text-zinc-400'}>{Math.round(progressPercent)}% SECURED</span>
        </div>
        <div className="h-[3px] bg-zinc-950 rounded-none overflow-hidden border border-zinc-900">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${isBroken ? 'bg-red-900' : isConquered ? 'bg-yellow-500 shadow-[0_0_100px_#fbbf24]' : 'bg-emerald-600'}`} 
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-zinc-800/50">
        <Heatmap logs={logs} targetDays={streak.targetDays} startDate={streak.createdAt} />
      </div>
    </div>
  );
};
