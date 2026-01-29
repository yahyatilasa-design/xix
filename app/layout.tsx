'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { AuthPage } from '../components/AuthPage';
import { Session } from '@supabase/supabase-js';
import './globals.css';

// Metadata cannot be exported from a client component. 
// We can handle this in a parent layout or page if needed, but for now, let's focus on the auth flow.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <title>XIX Marketplace</title>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 font-sans antialiased">
        {loading ? (
          <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center transform rotate-3 mx-auto mb-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <span className="font-mono font-bold text-zinc-950 text-xl tracking-tighter">XIX</span>
            </div>
          </div>
        ) : !session ? (
          <AuthPage />
        ) : (
          children
        )}
      </body>
    </html>
  );
}
