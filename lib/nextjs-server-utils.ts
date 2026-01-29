import { createClient } from '@supabase/supabase-js';
import { Product, UserProfile } from '../types';

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
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
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

    // FIX: Supabase to-one relations can be returned as an array.
    // We destructure and grab the first element to ensure it's an object.
    const { seller: sellerData, ...rest } = data;
    const sellerProfile = Array.isArray(sellerData) ? sellerData[0] : sellerData;

    // Construct the final product object, conforming to the `Product` type.
    const product: Product = {
      ...rest,
      seller: sellerProfile as Pick<UserProfile, 'username' | 'full_name' | 'avatar_url'> | null,
      // Inject default rating if it's null or missing.
      rating: data.rating || 5.0, 
    };

    // Manual Verification - Case Insensitive Check
    if (product.seller && product.seller.username) {
      if (product.seller.username.toLowerCase() !== username.toLowerCase()) {
        console.warn(`Username mismatch: URL=${username}, DB=${product.seller.username}`);
        return null;
      }
    } else {
      // If the product has no seller but the URL specifies one, it's a mismatch.
      return null;
    }

    return product;
    
  } catch (error) {
    console.error("Server Error fetching product by slug:", error);
    return null;
  }
}
