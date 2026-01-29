'use client';

import React, { useEffect, useState } from 'react';
import UserProfile from '../../components/UserProfile';
import { supabase } from '../../services/supabaseClient';
import { getUserProfile } from '../../services/dbService';
import { useRouter } from 'next/navigation';
import { UserProfile as UserProfileType, UserRole } from '../../types';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfileType | null>(null);

  const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
          router.push('/auth');
          return;
      }

      const profile = await getUserProfile(authUser.id);
      const appRole = authUser.app_metadata?.role?.toLowerCase();
      
      // Merge Auth data with DB data
      setUser({
          id: authUser.id,
          email: authUser.email || '',
          role: (profile.role || appRole || 'user') as UserRole,
          username: profile.username || null,
          full_name: profile.full_name || authUser.user_metadata?.full_name,
          phone_number: profile.phone_number,
          avatar_url: profile.avatar_url,
      });
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (!user) return <div className="h-screen bg-zinc-950 flex items-center justify-center text-emerald-500"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-zinc-950">
        <UserProfile 
            user={user} 
            onBack={() => router.push('/')} 
            onUpdate={loadUser} 
        />
    </div>
  );
}