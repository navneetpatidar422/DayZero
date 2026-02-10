import React, { useState, useEffect, useCallback } from 'react';

import { User, Streak, Badge } from '../types';

import { DB } from './services/db.ts';
import { StreakService } from './services/streakService.ts';
import { Backend } from './services/backend.ts';

import { StreakCard } from './components/StreakCard.tsx';
import { BadgeGallery } from './components/BadgeGallery.tsx';
import { HelpModal } from './components/HelpModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { UrgencyClock } from './components/UrgencyClock.tsx'; 

type AuthStep = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'VERIFY_SECURITY' | 'RESET_PASSWORD';

const AVATARS = [
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Sheba",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Zelda",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Shadow",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Zero"
];

const RotatingTypewriter: React.FC = () => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const phrases = [
    "Built by Navneet only for YOU",
    "Inspired from personal experiences."
  ];

  useEffect(() => {
    let timer: number;
    const current = loopNum % phrases.length;
    const fullText = phrases[current];

    const handleType = () => {
      setText(prev => {
        if (isDeleting) {
          return fullText.substring(0, prev.length - 1);
        } else {
          return fullText.substring(0, prev.length + 1);
        }
      });
    };

    let delta = isDeleting ? 40 : 80;

    if (!isDeleting && text === fullText) {
      delta = 2000;
      setIsDeleting(true);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setLoopNum(prev => prev + 1);
      delta = 500;
    }

    timer = window.setTimeout(handleType, delta);
    return () => window.clearTimeout(timer);
  }, [text, isDeleting, loopNum]);

  return <span className="cursor-blink">{text}</span>;
};

const App: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dayzero_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [authStep, setAuthStep] = useState<AuthStep>('LOGIN');
  const [showHelp, setShowHelp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    age: '',
    gender: 'Other',
    target: '',
    securityQuestion: '',
    securityAnswer: '',
    profilePhoto: AVATARS[0]
  });

  const [resetQuestion, setResetQuestion] = useState('');
  const [resetAnswer, setResetAnswer] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newTargetDays, setNewTargetDays] = useState('7');

  const loadData = useCallback(async () => {
    if (user) {
      const validated = await Backend.streaks.sync(user.id);
      setStreaks(validated);
      setBadges(DB.badges.getByUser(user.id));
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setInitializing(false), 2000);
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [loadData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const authenticatedUser = await Backend.users.authenticate(formData.username, formData.password);
      setUser(authenticatedUser);
      localStorage.setItem('dayzero_current_user', JSON.stringify(authenticatedUser));
      setError(null);
    } catch (err: any) {
      setError('AUTHENTICATION FAILED: INVALID CREDENTIALS.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newUser = await Backend.users.register({
        username: formData.username,
        passwordHash: formData.password,
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        target: formData.target,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer,
        profilePhoto: formData.profilePhoto
      });
      setUser(newUser);
      localStorage.setItem('dayzero_current_user', JSON.stringify(newUser));
      setError(null);
    } catch (err: any) {
      setError(err.message === 'USERNAME_TAKEN' ? 'USERNAME UNAVAILABLE.' : 'REGISTRATION FAILED.');
    } finally {
      setLoading(false);
    }
  };

  const initiateForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const question = await Backend.users.getSecurityQuestion(formData.username);
      setResetQuestion(question);
      setAuthStep('VERIFY_SECURITY');
      setError(null);
    } catch (err) {
      setError('USER NOT FOUND.');
    } finally {
      setLoading(false);
    }
  };

  const verifySecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Backend.users.verifySecurityAnswer(formData.username, resetAnswer);
      setAuthStep('RESET_PASSWORD');
      setError(null);
    } catch (err) {
      setError('INCORRECT ANSWER.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    DB.users.updatePassword(formData.username, formData.password);
    setAuthStep('LOGIN');
    setError(null);
    setLoading(false);
    alert('PASSWORD RESET SUCCESSFUL. LOGIN NOW.');
  };

  const createStreak = () => {
    if (!user) return;
    const targetValue = Number(newTargetDays);
    if (!Number.isInteger(targetValue) || targetValue < 7) {
      setError('DURATION MUST BE INTEGER >= 7.');
      return;
    }
    if (streaks.filter(s => s.status === 'ACTIVE').length >= 3) {
      setError('MAX 3 PROTOCOLS REACHED.');
      return;
    }
    const streak: Streak = {
      id: crypto.randomUUID(),
      userId: user.id,
      name: newName,
      task: newTask,
      targetDays: targetValue,
      currentStreakCount: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE'
    };
    DB.streaks.create(streak);
    setNewName('');
    setNewTask('');
    setNewTargetDays('7');
    setShowAdd(false);
    loadData();
    setError(null);
  };

  const completeTask = (streakId: string, note?: string) => {
    try {
      StreakService.completeDay(streakId, note);
      loadData();
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (initializing) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[1000] splash-active">
        <h1 className="text-9xl font-black uppercase tracking-tighter italic glitch-text" data-text="DAYZERO">
          DAYZERO
        </h1>
        <div className="mt-12 flex flex-col items-center gap-4">
           <div className="w-64 h-[2px] bg-zinc-900 relative overflow-hidden">
             <div className="absolute inset-0 bg-rose-600 w-full translate-x-[-100%] animate-[scanline_0.5s_infinite_linear]"></div>
           </div>
           <p className="mono text-[8px] text-zinc-500 font-bold tracking-[0.8em] animate-pulse">Built by Navneet Patidar</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black overflow-y-auto">
        <div className="w-full max-w-lg bg-[#050505] border border-zinc-900 p-8 sm:p-12 my-10 rounded-none shadow-[0_0_100px_rgba(255,0,60,0.05)] animate-fade-up">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black uppercase tracking-tighter text-white glitch-text italic" data-text="DAYZERO">DAYZERO</h1>
            <p className="text-zinc-600 text-[9px] mt-2 font-black uppercase tracking-[0.5em]">SYSTEM ACCESS REQUIRED</p>
          </div>

          {authStep === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-up">
              <input type="text" placeholder="USERNAME" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="auth-input" required />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="PASSWORD" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="auth-input pr-12" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-white uppercase font-black">
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
              <button className="auth-btn-primary" disabled={loading}>{loading ? 'UPLINKING...' : 'INITIATE_UPLINK'}</button>
              <div className="flex justify-between mt-6">
                <button type="button" onClick={() => setAuthStep('REGISTER')} className="auth-link">NEW_RECRUIT</button>
                <button type="button" onClick={() => setAuthStep('FORGOT_PASSWORD')} className="auth-link">RECOVERY</button>
              </div>
            </form>
          )}

          {authStep === 'REGISTER' && (
            <div className="animate-fade-up">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="flex flex-col items-center mb-6">
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-4">Select Identity Node</p>
                  <div className="grid grid-cols-6 gap-2 mb-6">
                    {AVATARS.map((url, i) => (
                      <button 
                        key={i} 
                        type="button" 
                        onClick={() => setFormData({...formData, profilePhoto: url})}
                        className={`w-10 h-10 border transition-all ${formData.profilePhoto === url ? 'border-rose-600 scale-110' : 'border-zinc-800 opacity-50'}`}
                      >
                        <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover grayscale" />
                      </button>
                    ))}
                  </div>
                  <div className="w-full h-px bg-zinc-900 mb-6"></div>
                  <div className="w-full flex justify-between items-center text-[9px] text-zinc-600 font-black uppercase tracking-widest px-2">
                    <span>Manual Override</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer hover:text-white transition-colors">UPLOAD_BIO_METRIC</label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="FULL NAME" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="auth-input" required />
                  <input type="number" placeholder="AGE" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="auth-input" required />
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="auth-input appearance-none">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  <input type="text" placeholder="TARGET (e.g. NEET)" value={formData.target} onChange={(e) => setFormData({...formData, target: e.target.value})} className="auth-input" required />
                </div>
                <input type="text" placeholder="CHOOSE USERNAME" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="auth-input" required />
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="CREATE PASSWORD" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="auth-input pr-12" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-white uppercase font-black">
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
                
                <div className="pt-4 border-t border-zinc-900">
                  <p className="text-[9px] text-zinc-500 font-bold uppercase mb-4 tracking-widest text-center">Identity Recovery Data</p>
                  <input type="text" placeholder="SECURITY QUESTION" value={formData.securityQuestion} onChange={(e) => setFormData({...formData, securityQuestion: e.target.value})} className="auth-input mb-4" required />
                  <input type="text" placeholder="ANSWER" value={formData.securityAnswer} onChange={(e) => setFormData({...formData, securityAnswer: e.target.value})} className="auth-input" required />
                </div>
                
                <button className="auth-btn-primary" disabled={loading}>{loading ? 'ENLISTING...' : 'ENLIST_IDENTITY'}</button>
                <button type="button" onClick={() => setAuthStep('LOGIN')} className="auth-link w-full text-center mt-4">CANCEL</button>
              </form>
            </div>
          )}

          {authStep === 'FORGOT_PASSWORD' && (
            <form onSubmit={initiateForgot} className="space-y-4 animate-fade-up">
              <input type="text" placeholder="ENTER USERNAME" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="auth-input" required />
              <button className="auth-btn-primary" disabled={loading}>INITIATE_RECOVERY</button>
              <button type="button" onClick={() => setAuthStep('LOGIN')} className="auth-link w-full text-center mt-4">BACK</button>
            </form>
          )}

          {authStep === 'VERIFY_SECURITY' && (
            <form onSubmit={verifySecurity} className="space-y-4 animate-fade-up">
              <div className="p-4 bg-zinc-900 border border-zinc-800">
                <p className="text-[10px] text-zinc-400 font-bold uppercase mb-2 tracking-widest">Question:</p>
                <p className="text-sm font-bold text-white uppercase italic">"{resetQuestion}"</p>
              </div>
              <input type="text" placeholder="YOUR ANSWER" value={resetAnswer} onChange={(e) => setResetAnswer(e.target.value)} className="auth-input" required />
              <button className="auth-btn-primary" disabled={loading}>VERIFY_PROOFS</button>
            </form>
          )}

          {authStep === 'RESET_PASSWORD' && (
            <form onSubmit={resetPassword} className="space-y-4 animate-fade-up">
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="NEW PASSWORD" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="auth-input pr-12" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-white uppercase font-black">
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
              <button className="auth-btn-primary" disabled={loading}>COMMIT_NEW_KEY</button>
            </form>
          )}

          {error && <p className="text-[#ff003c] text-[10px] font-black uppercase text-center mt-6 tracking-widest animate-pulse">{error}</p>}
        </div>

        <style>{`
          .auth-input {
            width: 100%;
            background: #000;
            border: 1px solid #1a1a1a;
            padding: 1rem;
            color: #fff;
            font-size: 0.75rem;
            font-family: 'JetBrains Mono', monospace;
            transition: all 0.3s;
          }
          .auth-input:focus { outline: none; border-color: #444; background: #050505; }
          .auth-btn-primary {
            width: 100%;
            background: #fff;
            color: #000;
            font-weight: 900;
            padding: 1.2rem;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            font-size: 0.7rem;
            transition: all 0.2s;
          }
          .auth-btn-primary:hover:not(:disabled) { background: #ff003c; color: #fff; }
          .auth-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
          .auth-link {
            color: #444;
            font-weight: 900;
            font-size: 0.6rem;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            transition: color 0.2s;
          }
          .auth-link:hover { color: #fff; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-black text-white selection:bg-[#ff003c] selection:text-white">
      {/* Sidebar Help Trigger */}
      <button 
        onClick={() => setShowHelp(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[150] bg-zinc-900 border-l border-y border-zinc-800 px-2 py-8 group hover:bg-rose-600 transition-all shadow-[0_0_20px_rgba(0,0,0,1)]"
      >
        <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 group-hover:text-white">SYSTEM_INFO</span>
      </button>

      <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-xl sticky top-0 z-[100]">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row justify-between items-center gap-10 sm:gap-6">
          <div className="flex items-center gap-10">
            <div className="relative flex flex-col items-center cursor-pointer group" onClick={() => setShowProfile(true)}>
              <h1 className="text-6xl font-black uppercase tracking-tighter italic glitch-text transition-transform group-hover:scale-105" data-text="DAYZERO">DAYZERO</h1>
              <p className="text-[10px] text-zinc-500 font-black uppercase mt-4 animate-credit whitespace-nowrap opacity-60">
                Created by Navneet only for YOU
              </p>
            </div>
            <div className="h-20 w-px bg-zinc-800 hidden md:block"></div>
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setShowProfile(true)}>
              {user.profilePhoto && <img src={user.profilePhoto} className="w-14 h-14 rounded-none border border-zinc-800 grayscale object-cover group-hover:grayscale-0 transition-all duration-700" />}
              <div className="hidden sm:block">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none mb-1">{user.target}</p>
                <p className="text-[14px] mono font-bold text-zinc-400 group-hover:text-white transition-colors">{user.username}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
             <button onClick={() => { setUser(null); localStorage.removeItem('dayzero_current_user'); }} className="text-[9px] font-black uppercase text-zinc-500 border border-zinc-900 px-6 py-3 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all tracking-widest">TERMINATE_SESSION</button>
          </div>
        </div>
      </header>

      {/* --- CHANGE 2: Component Placement --- */}
      {/* Placed here so the background spans full width, outside the container of <main> */}
      <UrgencyClock />

      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-24 animate-fade-up">
          <div className="max-w-2xl">
            <h2 className="text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-8 italic">CORE<br/>PROTOCOL</h2>
            <div className="flex flex-wrap gap-4">
              <div className="bg-[#ff003c]/10 border border-[#ff003c]/30 px-4 py-2 flex items-center gap-3">
                <div className="w-2 h-2 bg-[#ff003c] rounded-full animate-pulse"></div>
                <span className="text-[#ff003c] text-[10px] font-black uppercase tracking-widest">WATCHDOG_MONITORING_ACTIVE</span>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                VERIFIED_NODES: {streaks.length} / 3
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowAdd(true)}
            className="w-full lg:w-auto bg-white text-black text-xs font-black px-12 py-6 uppercase tracking-[0.4em] hover:bg-rose-600 hover:text-white transition-all duration-500 hover:scale-105 active:scale-95 shadow-[15px_15px_0px_rgba(255,255,255,0.05)]"
          >
            + INITIALIZE_PROTOCOL
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {streaks.map(s => (
            <StreakCard key={s.id} streak={s} onComplete={completeTask} />
          ))}
          {streaks.length === 0 && (
            <div className="lg:col-span-3 border border-zinc-900 p-40 text-center cursor-pointer hover:bg-zinc-900/10 transition-colors animate-fade-up group" onClick={() => setShowAdd(true)}>
              <div className="text-zinc-900 text-[10rem] sm:text-[12rem] font-black mb-0 leading-none select-none group-hover:text-rose-600 transition-colors duration-700">EMPTY</div>
              <p className="text-zinc-700 font-black uppercase tracking-[1em] text-xs">NO_PROTOCOLS_FOUND</p>
            </div>
          )}
        </div>

        <BadgeGallery badges={badges} />
      </main>

      {showAdd && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[200] flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-[#080808] border border-zinc-800 p-12 sm:p-16 shadow-[0_0_100px_rgba(0,0,0,1)] animate-fade-up">
            <div className="mb-12">
              <h3 className="text-5xl font-black uppercase tracking-tighter italic mb-4">NEW_CONTRACT</h3>
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Minimum length is 7 days. Progress tracks exactly 1:1 with target.</p>
            </div>
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] uppercase font-black text-zinc-500 mb-4 tracking-[0.3em]">PROTOCOL_DESIGNATION</label>
                <input 
                  placeholder="e.g. MORNING_ALGO_GRIND"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value.toUpperCase())}
                  className="w-full bg-black border border-zinc-900 p-5 text-white focus:outline-none focus:border-rose-600 font-black tracking-widest"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-zinc-500 mb-4 tracking-[0.3em]">MINIMUM_SUCCESS_CRITERIA</label>
                <textarea 
                  placeholder="Define the non-negotiable daily output..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="w-full bg-black border border-zinc-900 p-5 text-white focus:outline-none focus:border-rose-600 min-h-[100px] font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-zinc-500 mb-4 tracking-[0.3em]">TARGET_DURATION (MIN: 7 DAYS)</label>
                <input 
                  type="number"
                  min="7"
                  step="1"
                  value={newTargetDays}
                  onKeyDown={(e) => { if (e.key === '.' || e.key === 'e' || e.key === '-') e.preventDefault(); }}
                  onChange={(e) => setNewTargetDays(e.target.value)}
                  className="w-full bg-black border border-zinc-900 p-5 text-white focus:outline-none focus:border-rose-600 font-black tracking-widest"
                />
              </div>
              
              {error && <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest animate-pulse">{error}</p>}

              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                <button onClick={createStreak} className="flex-grow bg-white text-black font-black py-6 text-sm uppercase tracking-[0.4em] hover:bg-rose-600 hover:text-white transition-all">BIND_CONTRACT</button>
                <button onClick={() => { setShowAdd(false); setError(null); }} className="px-12 border border-zinc-900 font-black uppercase text-[10px] text-zinc-600 hover:text-white">DISCARD</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showProfile && user && <ProfileModal user={user} onClose={() => setShowProfile(false)} onUpdate={(u) => { setUser(u); localStorage.setItem('dayzero_current_user', JSON.stringify(u)); }} />}

      <footer className="mt-40 border-t border-zinc-900 py-32 text-center bg-black">
        <div className="mb-12 opacity-40">
           <div className="flex justify-center gap-4 mb-4">
             {Array.from({length: 12}).map((_, i) => (
               <div key={i} className={`w-1 h-8 bg-zinc-900 ${i % 3 === 0 ? 'bg-zinc-700' : ''}`} />
             ))}
           </div>
           <p className="mono text-[8px] text-zinc-800 tracking-[1em] uppercase">SYSTEM_STABILITY_SECURED</p>
        </div>
        <div className="relative inline-block w-full px-4 overflow-hidden h-8">
          <p className="text-[14px] font-black uppercase tracking-[0.8em] text-zinc-600 flex justify-center items-center h-full">
            <RotatingTypewriter />
          </p>
        </div>
        <div className="mt-20 flex flex-wrap justify-center gap-12 text-zinc-900 font-black uppercase text-[9px] tracking-[0.5em]">
           <span className="hover:text-zinc-700 transition-colors cursor-default">PROTOCOL_ACTIVE</span>
           <span className="hover:text-zinc-700 transition-colors cursor-default">IDENTITY_VERIFIED</span>
           <span className="hover:text-zinc-700 transition-colors cursor-default">ENCRYPTED_STREAM</span>
        </div>
      </footer>
    </div>
  );
};

export default App;