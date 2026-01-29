import React, { useState } from 'react';
import { UserProfile as UserProfileType } from '../types';
import { updateUserProfile } from '../services/dbService';
import { Save, User, ArrowLeft, Loader2, Camera, Mail, Phone, Shield, Check } from 'lucide-react';

interface UserProfileProps {
  user: UserProfileType;
  onBack: () => void;
  onUpdate: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onBack, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    phone_number: user.phone_number || '',
    avatar_url: user.avatar_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(user.id, {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        avatar_url: formData.avatar_url,
        // Role is deliberately excluded from updates here for security/correctness
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-8 pb-32">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      <div className="mb-8 flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden relative group">
           {formData.avatar_url ? (
               <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
           ) : (
               <User size={32} className="text-zinc-500" />
           )}
           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Camera size={20} className="text-white" />
           </div>
        </div>
        <div>
            <h1 className="text-2xl font-bold text-white">{user.full_name || 'User'}</h1>
            <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${
                    user.role === 'admin' 
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                    : user.role === 'seller'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                    {user.role}
                </span>
                <span className="text-xs text-zinc-500">{user.email}</span>
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
         <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Personal Information</h3>
            
            <div className="grid gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                        <User size={14} /> Full Name
                    </label>
                    <input 
                        type="text" 
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                        <Phone size={14} /> Phone Number
                    </label>
                    <input 
                        type="tel" 
                        value={formData.phone_number}
                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                        <Camera size={14} /> Avatar URL
                    </label>
                    <input 
                        type="url" 
                        value={formData.avatar_url}
                        onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none transition-all"
                    />
                    <p className="text-[10px] text-zinc-600">Enter a public image URL for your profile picture.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2 opacity-60">
                    <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                        <Mail size={14} /> Email (Read Only)
                    </label>
                    <input 
                        type="text" 
                        value={user.email}
                        disabled
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-400 cursor-not-allowed"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-medium text-purple-400 flex items-center gap-1.5">
                        <Shield size={14} /> Role (System Managed)
                    </label>
                    <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white flex justify-between items-center cursor-not-allowed opacity-80">
                         <span className="capitalize">{user.role}</span>
                         {user.role === 'admin' && <Check size={14} className="text-purple-500" />}
                    </div>
                </div>
            </div>
         </div>

         <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-550 hover:bg-emerald-600 active:scale-95 transition-all text-zinc-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
         >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
         </button>
      </form>
    </div>
  );
};

export default UserProfile;