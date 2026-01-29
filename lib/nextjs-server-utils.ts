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
 * Server Function: Fetch product by slug including seller profile.
 * DEFINITIVE FIX: This function now correctly handles URLs that contain either the seller's username OR their UUID (seller_id).
 */
export async function getProductBySlug(sellerIdentifier: string, slug: string): Promise<Product | null> {
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
      if (error.code === 'PGRST116') return null; // Standard case for "Not Found"
      console.error("Supabase Error fetching product:", error);
      throw error;
    }

    if (!data) return null;

    const sellerIdFromDb = data.seller_id;
    const sellerUsernameFromDb = (Array.isArray(data.seller) ? data.seller[0]?.username : data.seller?.username) || null;

    // Verification Logic: The identifier from the URL could be a username or a UUID (seller_id).
    // We must check if the identifier matches either the product's actual seller_id or the seller's username.
    const identifierIsId = sellerIdentifier.toLowerCase() === sellerIdFromDb?.toLowerCase();
    const identifierIsUsername = sellerUsernameFromDb ? sellerIdentifier.toLowerCase() === sellerUsernameFromDb.toLowerCase() : false;

    if (!identifierIsId && !identifierIsUsername) {
      console.warn(`Seller mismatch on product page: URL Identifier='${sellerIdentifier}', DB Username='${sellerUsernameFromDb}', DB ID='${sellerIdFromDb}'`);
      return null; // The product exists, but not for this seller identifier.
    }
    
    const { seller: sellerData, ...rest } = data;
    const sellerProfile = Array.isArray(sellerData) ? sellerData[0] : sellerData;

    const product: Product = {
      ...rest,
      seller: sellerProfile as Pick<UserProfile, 'username' | 'full_name' | 'avatar_url'> | null,
      rating: data.rating || 5.0, 
    };

    return product;
    
  } catch (error) {
    console.error("Server Error in getProductBySlug:", error);
    return null;
  }
}
