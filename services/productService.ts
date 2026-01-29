import { supabase } from './supabaseClient';
import { Product, ProductInsert } from '../types';

interface UploadProductParams {
  seller_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageFile: File | null;
  productFile: File | null;
}

/**
 * Uploads product image and saves product data to database.
 */
export const uploadProduct = async ({
  seller_id,
  name,
  slug,
  description,
  price,
  imageFile,
  productFile
}: UploadProductParams): Promise<void> => {
  try {
    // 1. Upload Image (Public Bucket)
    let imageUrl: string | null = null;
    
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${seller_id}/${slug}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    // 2. Upload Digital Asset (Private Bucket)
    let fileUrl: string | null = null;
    
    if (productFile) {
      const fileExt = productFile.name.split('.').pop();
      const fileName = `${seller_id}/${slug}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('digital-asset')
        .upload(fileName, productFile, {
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload product file: ${uploadError.message}`);
      }

      fileUrl = fileName;
    }

    // 3. Insert Data into Database
    const newProduct: ProductInsert = {
      seller_id,
      name,
      slug,
      description,
      price,
      image_url: imageUrl,
      file_url: fileUrl,
      category: 'digital'
    };

    const { error: insertError } = await supabase
      .from('products')
      .insert(newProduct);

    if (insertError) {
      if (insertError.code === '23505') {
        throw new Error("Slug/URL for this product is already taken. Please change the name.");
      }
      throw new Error(`Failed to save product: ${insertError.message}`);
    }

  } catch (error) {
    throw error;
  }
};

/**
 * Fetches top/recent products from the database.
 * Uses LEFT JOIN (removed !inner) so products appear even if seller profile is incomplete or RLS restricted.
 * FIX: Removed 'rating' from select to avoid error if column missing.
 */
export const getTopProducts = async (): Promise<Product[]> => {
  try {
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
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching top products:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Map data to ensure safety
    const products = data.map((item: any) => ({
      ...item,
      rating: item.rating || 5.0, // Default to 5.0 since column is missing
      // Fallback if seller is null (due to left join)
      seller: item.seller || { username: 'unknown', full_name: 'Unknown Seller', avatar_url: null }
    })) as Product[];

    return products;
    
  } catch (err) {
    console.error("Unexpected error fetching products:", err);
    return [];
  }
};