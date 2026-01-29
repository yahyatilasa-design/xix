'use client';

import React, { useEffect } from 'react';
import { AuthPage } from '../../components/AuthPage';
import { supabase } from '../../services/supabaseClient'; // This now uses the CORRECT client
import { useRouter } from 'next/navigation';

export default function AuthRoute() {
  const router = useRouter();

  useEffect(() => {
    // This listener handles the redirection AFTER a successful sign-in.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/');
      }
    });

    // On mount, also check if a session already exists (e.g., user is already logged in).
    // If so, redirect them away from the auth page.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return <AuthPage />;
}
