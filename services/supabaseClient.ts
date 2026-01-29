import { createClient } from '@supabase/supabase-js';

// Fallback values to ensure app doesn't crash if .env.local isn't loaded yet
// These public keys are safe to expose in client bundles for Supabase (Anon Key)
const DEFAULT_URL = 'https://tkztavbgtqfusfghoxay.supabase.co';
const DEFAULT_KEY = 'sb_publishable_eeW96k2UOBtZWRS4crtc-w_iBW4o8Ap';

// In Next.js, client-side env vars must start with NEXT_PUBLIC_
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Supabase Environment Variables missing!");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);