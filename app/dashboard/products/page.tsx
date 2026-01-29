'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, AlertTriangle, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Tables } from '../../../types/supabase';

// Define a more specific type for the product data we need on this page
type ProductWithSeller = Tables<'products'> & {
  profiles: {
    username: string;
  } | null;
};

// Helper to format currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch products and include the seller's username from the related profiles table
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(username)') // Join with profiles to get username
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      }
      
      setProducts(data as ProductWithSeller[] || []);
    } catch (e: any) {
      setError(e.message);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchProducts(user.id);
      } else {
        setLoading(false);
        setError("You must be logged in to view this page.");
      }
    };
    getCurrentUser();
  }, [fetchProducts]);

  const handleDelete = async (product: ProductWithSeller) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      try {
        const filesToDelete: string[] = [];
        if (product.image_url) {
            const imagePath = new URL(product.image_url).pathname.split('/public/products/')[1];
            if(imagePath) filesToDelete.push(imagePath);
        }
        if (product.file_url) {
            const filePath = new URL(product.file_url).pathname.split('/public/products/')[1];
            if(filePath) filesToDelete.push(filePath);
        }

        if (filesToDelete.length > 0) {
            await supabase.storage.from('products').remove(filesToDelete);
        }

        await supabase.from('products').delete().eq('id', product.id);
        setProducts(currentProducts => currentProducts.filter(p => p.id !== product.id));

      } catch (e: any) {
        setError(e.message);
        console.error(e);
      }
    }
  };

  const handleToggleStatus = async (product: ProductWithSeller) => {
    const newStatus = product.status === 'published' ? 'hidden' : 'published';
    
    setProducts(currentProducts => 
        currentProducts.map(p => p.id === product.id ? { ...p, status: newStatus } : p)
    );

    const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', product.id);

    if (error) {
        setProducts(currentProducts => 
            currentProducts.map(p => p.id === product.id ? { ...p, status: product.status } : p)
        );
        setError(`Failed to update status: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-zinc-950"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-zinc-950 p-4">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white">An Error Occurred</h2>
        <p className="text-zinc-400 text-center">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center flex flex-col items-center justify-center h-screen bg-zinc-950 p-8">
        <h2 className="text-2xl font-bold text-white mb-2">No Products Yet</h2>
        <p className="text-zinc-400 mb-6">You haven't added any products. Let's create your first one!</p>
        <Link href="/add-product" legacyBehavior>
          <a className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-bold text-zinc-950 transition-colors hover:bg-emerald-400 active:scale-95">
            <Plus size={18} />
            Add Your First Product
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-zinc-950 text-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Your Products</h1>
            <p className="text-sm text-zinc-400 mt-1">Manage, edit, and view your digital inventory.</p>
        </div>
        <Link href="/add-product" legacyBehavior>
          <a className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-bold text-zinc-950 transition-colors hover:bg-emerald-400 active:scale-95">
            <Plus size={18} />
            Add Product
          </a>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-800">
          <thead className="bg-zinc-950">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Image</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Product Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-900">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-10 w-10 rounded-md bg-zinc-800 flex items-center justify-center">
                    {product.image_url ? (
                      <img className="h-full w-full rounded-md object-cover" src={product.image_url} alt={product.name} />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-zinc-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/${product.profiles?.username || 'user'}/${product.slug}`} passHref legacyBehavior>
                        <a target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 group">
                            <span className="font-medium text-white group-hover:text-emerald-400 transition-colors">{product.name}</span>
                            <ExternalLink className="h-3 w-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    </Link>
                    <div className="text-xs text-zinc-400">{product.category || 'Uncategorized'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-zinc-300">{formatPrice(product.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => handleToggleStatus(product)} className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full font-medium transition-colors ${product.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700'}`}>
                    {product.status === 'published' ? <Eye size={14}/> : <EyeOff size={14}/>}
                    {product.status === 'published' ? 'Published' : 'Hidden'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-3">
                    <Link href={`/dashboard/products/edit/${product.id}`} legacyBehavior>
                      <a className="text-zinc-400 hover:text-white transition-colors p-2 rounded-md hover:bg-zinc-800" title="Edit Product">
                        <Edit className="h-4 w-4" />
                      </a>
                    </Link>
                    <button onClick={() => handleDelete(product)} className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-500/10" title="Delete Product">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
