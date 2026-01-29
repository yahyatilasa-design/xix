import { createBrowserClient } from '@supabase/ssr';

// IMPORTANT: This file is for client-side Supabase access.
// Do not use this in Server Components or Route Handlers.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

// This is the correct way to create a client-side Supabase client in Next.js App Router.
export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
