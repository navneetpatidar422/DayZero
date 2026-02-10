
import React, { useState } from 'react';
import { User } from '../../types';
import { DB } from "../services/db";


const AVATARS = [
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Sheba",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Zelda",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Shadow",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Zero"
];

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updated: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });

  const handleUpdate = () => {
    DB.users.update(formData);
    onUpdate(formData);
    setEditing(false);
  };

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

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[300] flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#050505] border border-zinc-800 p-8 sm:p-12 shadow-[0_0_100px_rgba(0,0,0,1)] animate-fade-up my-10">
        <div className="flex justify-between items-start mb-12">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic glitch-text">IDENTITY_FILE</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-white font-black text-[10px] uppercase tracking-[0.2em]">[CLOSE]</button>
        </div>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="w-full md:w-auto flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-40 h-40 bg-zinc-900 border border-zinc-800 grayscale group-hover:grayscale-0 overflow-hidden relative transition-all">
                <img src={formData.profilePhoto} className="w-full h-full object-cover" />
                {editing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-black text-white uppercase text-center px-4">Click to Upload New</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                )}
              </div>
            </div>
            {editing && (
               <div className="w-full">
                 <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest text-center mb-4">Quick Node Selection</p>
                 <div className="grid grid-cols-6 gap-2">
                   {AVATARS.map((url, i) => (
                     <button 
                       key={i} 
                       onClick={() => setFormData({...formData, profilePhoto: url})}
                       className={`w-full aspect-square border ${formData.profilePhoto === url ? 'border-rose-600 scale-110' : 'border-zinc-800 opacity-50'}`}
                     >
                       <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover grayscale" />
                     </button>
                   ))}
                 </div>
               </div>
            )}
            <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] text-center">ID_NODE: {user.id.slice(0,8)}</div>
          </div>

          <div className="flex-grow space-y-8 w-full">
            <div>
              <label className="block text-[10px] uppercase font-black text-zinc-600 mb-2 tracking-widest">Legal Designation</label>
              {editing ? (
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-black border border-zinc-900 p-4 w-full text-white font-bold focus:border-rose-600 outline-none" />
              ) : (
                <p className="text-2xl font-black uppercase italic text-zinc-200">{user.name}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] uppercase font-black text-zinc-600 mb-2 tracking-widest">Age / Gender</label>
                {editing ? (
                   <div className="flex gap-2">
                    <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} className="bg-black border border-zinc-900 p-3 w-full text-white font-bold outline-none" />
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="bg-black border border-zinc-900 p-3 w-full text-white font-bold outline-none">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                   </div>
                ) : (
                  <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{user.age} / {user.gender}</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-zinc-600 mb-2 tracking-widest">Active Target</label>
                {editing ? (
                  <input value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} className="bg-black border border-zinc-900 p-3 w-full text-white font-bold focus:border-rose-600 outline-none" />
                ) : (
                  <p className="text-sm font-black text-rose-600 uppercase tracking-[0.2em] italic">{user.target}</p>
                )}
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-4">
              {editing ? (
                <>
                  <button onClick={handleUpdate} className="flex-grow bg-white text-black font-black py-5 uppercase text-[10px] tracking-[0.3em] hover:bg-emerald-500 transition-all">COMMIT_CHANGES</button>
                  <button onClick={() => { setEditing(false); setFormData({...user}); }} className="px-10 border border-zinc-800 text-zinc-500 font-black py-5 uppercase text-[10px] tracking-[0.3em] hover:text-white">ABORT</button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="flex-grow border border-zinc-800 text-zinc-400 font-black py-5 uppercase text-[10px] tracking-[0.3em] hover:border-white hover:text-white transition-all">EDIT_IDENTITY_NODE</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
