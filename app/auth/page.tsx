'use client';

import React, { useEffect, useState } from 'react';
import { AuthPage } from '../../components/AuthPage';
import { supabase } from '../../services/supabaseClient';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthRoute() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // 1. Check current session immediately
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsRedirecting(true);
        router.push('/');
      }
    };
    checkSession();

    // 2. Listen for auth changes (e.g. user just logged in via AuthPage)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsRedirecting(true);
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Show loader while redirecting to prevent "stuck" feeling
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return <AuthPage />;
}