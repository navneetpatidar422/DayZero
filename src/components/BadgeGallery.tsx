
import React from 'react';
import { Badge } from '../types';

interface BadgeGalleryProps {
  badges: Badge[];
}

export const BadgeGallery: React.FC<BadgeGalleryProps> = ({ badges }) => {
  if (badges.length === 0) return null;

  return (
    <section className="mt-32 animate-fade-up">
      <h2 className="text-[11px] font-black uppercase tracking-[0.6em] text-zinc-700 mb-16 flex items-center gap-8">
        IDENTITY_MANIFESTO
        <div className="flex-grow h-px bg-zinc-900/50" />
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {badges.slice().reverse().map((b) => (
          <div 
            key={b.id}
            className={`p-10 border relative overflow-hidden group transition-all duration-500 ${
              b.label === 'CONTRACT_FULFILLED' ? 'border-yellow-600/50 bg-yellow-950/10' : 'border-zinc-800 bg-zinc-950'
            }`}
          >
            {/* Massive Background Milestone Number */}
            <div className={`absolute -right-6 -bottom-10 text-[12rem] font-black select-none pointer-events-none transition-all duration-700 ${
              b.label === 'CONTRACT_FULFILLED' ? 'text-yellow-500/[0.05]' : 'text-white/[0.02]'
            } group-hover:scale-110 group-hover:text-rose-600/10`}>
              {b.milestone}
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-2 h-2 rounded-full ${b.label === 'CONTRACT_FULFILLED' ? 'bg-yellow-500' : 'bg-rose-600'}`}></div>
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em]">SECURED_{new Date(b.earnedAt).toLocaleDateString().replace(/\//g, '_')}</span>
              </div>
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none mb-4 group-hover:glitch-text transition-all">
                {b.label}
              </h3>
              <p className={`text-[11px] font-black uppercase tracking-[0.4em] ${
                b.label === 'CONTRACT_FULFILLED' ? 'text-yellow-500' : 'text-zinc-600'
              }`}>
                {b.milestone}_DAYS_UNBROKEN
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
