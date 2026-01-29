'use client';

import React, { useEffect, useState } from 'react';
import AdminDashboard from '../../components/AdminDashboard';
import { supabase } from '../../services/supabaseClient';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Double check role dari DB untuk keamanan
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      
      if (profile?.role !== 'admin') {
        router.push('/');
        return;
      }
      setChecking(false);
    };
    checkAdmin();
  }, [router]);

  if (checking) {
    return <div className="h-screen flex items-center justify-center bg-zinc-950 text-emerald-500"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
       <div className="p-4 border-b border-zinc-800">
         <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors w-fit">
            <ArrowLeft size={18} /> Back to Dashboard
         </Link>
       </div>
       <AdminDashboard />
    </div>
  );
}