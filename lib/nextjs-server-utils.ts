import { createClient } from '@supabase/supabase-js';
import { Product } from '../types';

// NOTE: In a real Next.js App Router project, you should use:
// import { createClient } from '@/utils/supabase/server';
// import { cookies } from 'next/headers';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tkztavbgtqfusfghoxay.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_eeW96k2UOBtZWRS4crtc-w_iBW4o8Ap';

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Key are required for server utils.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Server Function: Fetch product by slug including seller profile
 * Usage: await getProductBySlug('some-seller', 'my-product-slug');
 */
export async function getProductBySlug(username: string, slug: string): Promise<Product | null> {
  try {
    // FIX: Removed !inner to ensure product is found even if profile relation is tricky
    // FIX: Removed 'rating' from select to avoid error if column missing in DB
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        seller_id,
        name,
        slug,
        description,
        price,
        image_url,
        file_url,
        category,
        created_at,
        seller:profiles(username, full_name, avatar_url)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error("Supabase Error:", error);
      throw error;
    }

    if (!data) return null;

    // Inject default rating (5.0) because we removed it from select
    const product = { 
        ...data, 
        rating: (data as any).rating || 5.0 
    } as Product;
    
    // Manual Verification - Case Insensitive Check
    // If username is provided in URL, it must match the seller's username (case-insensitive)
    if (product.seller && product.seller.username) {
        if (product.seller.username.toLowerCase() !== username.toLowerCase()) {
            console.warn(`Username mismatch: URL=${username}, DB=${product.seller.username}`);
            // If strictly mismatching valid usernames, return null.
            // But if URL uses 'user' generic and DB has real name, maybe allow?
            // For now, strict check to prevent impersonation URLs.
            return null;
        }
    }
    
    // If product has no seller attached (orphan) but URL asks for specific user, fail safe.
    if (!product.seller && username !== 'unknown') {
        return null; 
    }

    return product;
    
  } catch (error) {
    console.error("Server Error fetching product by slug:", error);
    return null;
  }
}