
import React from 'react';
import { MILESTONES } from '../types';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[300] flex justify-end">
      <div className="w-full max-w-lg bg-[#050505] border-l border-zinc-800 p-8 sm:p-12 overflow-y-auto animate-slide-right no-scrollbar">
        <div className="flex justify-between items-start mb-16">
          <div className="group">
            <h2 className="text-6xl font-black uppercase tracking-tighter italic glitch-text">SYSTEM_GUIDE</h2>
            <p className="text-[7px] text-zinc-600 font-black uppercase tracking-[0.4em] mt-1">Operational Protocol V4.0</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-rose-600 font-black text-xs uppercase tracking-widest transition-colors">[X_CLOSE]</button>
        </div>

        <section className="mb-12">
          <h3 className="text-rose-600 font-black text-[10px] uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
            <div className="w-10 h-px bg-rose-600"></div>
            01_THE_RULES
          </h3>
          <p className="text-zinc-300 text-sm leading-relaxed mb-6 font-medium">
            DAYZERO operates on cold logic. There are no excuses, no "oops" buttons, and no manual edits to your chain progress.
          </p>
          <ul className="space-y-6 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <li className="flex gap-4"><span className="text-zinc-700">01.</span> DAILY LOGS ARE IST-BASED. LOG SUCCESS BEFORE 23:59:59 IST.</li>
            <li className="flex gap-4"><span className="text-zinc-700">02.</span> MINIMUM CONTRACT LENGTH IS 7 DAYS. PROGRESS BARS ARE UNEDITABLE.</li>
            <li className="flex gap-4"><span className="text-zinc-700">03.</span> A SINGLE MISSED DAY VOIDS THE ENTIRE CONTRACT. FOREVER.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h3 className="text-rose-600 font-black text-[10px] uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
            <div className="w-10 h-px bg-rose-600"></div>
            02_IDENTITY_TAGS
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {MILESTONES.map(m => (
              <div key={m.value} className="border border-zinc-900 p-5 bg-zinc-950/50 group hover:border-zinc-700 transition-colors">
                <span className="block text-[9px] text-zinc-600 font-black tracking-widest mb-1">{m.value} DAYS</span>
                <span className="block text-sm text-zinc-100 font-black tracking-tighter italic group-hover:text-rose-600">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-rose-600 font-black text-[10px] uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
            <div className="w-10 h-px bg-rose-600"></div>
            03_PROFILE_MANAGEMENT
          </h3>
          <p className="text-zinc-300 text-sm leading-relaxed font-medium">
            You can update your personal Identity File (Name, Target, Photo) at any time. However, your core security questions and streak histories are permanent records in the datastream.
          </p>
        </section>

        <section className="mb-12">
          <h3 className="text-rose-600 font-black text-[10px] uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
            <div className="w-10 h-px bg-rose-600"></div>
            04_DEVELOPER_IDENTITY
          </h3>
          <div className="border border-zinc-900 p-6 bg-zinc-950/80">
            <p className="text-zinc-100 text-xl font-black uppercase italic tracking-tighter mb-4">Navneet Patidar</p>
            <div className="space-y-3 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span>EMAIL</span>
                <a href="mailto:navneetpatidar422@gmail.com" className="text-rose-600 hover:underline">navneetpatidar422@gmail.com</a>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span>LINKEDIN</span>
                <a href="https://www.linkedin.com/in/navneet-patidar/" target="_blank" className="text-rose-600 hover:underline">navneet-patidar</a>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span>INSTAGRAM</span>
                <a href="https://instagram.com/_navneetpatidar" target="_blank" className="text-rose-600 hover:underline">_navneetpatidar</a>
              </div>
            </div>
          </div>
        </section>
        
        <div className="pt-20 border-t border-zinc-900 opacity-20 text-[8px] font-black uppercase tracking-[1em] text-center pb-10">
          Created by Navneet only for YOU
        </div>
      </div>
    </div>
  );
};
