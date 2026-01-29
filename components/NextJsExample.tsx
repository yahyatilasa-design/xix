// This file is an EXAMPLE for Next.js App Router (Server Component).
// It demonstrates how to implement the [username]/[slug] route using the shared logic.
// Path: app/[username]/[slug]/page.tsx

import React from 'react';
import { getProductBySlug } from '../lib/nextjs-server-utils';

interface PageProps {
  params: {
    username: string;
    slug: string;
  };
}

// 2. Server Component
export default async function ProductPage({ params }: PageProps) {
  // In Next.js 15+, params is a Promise so you might need to await it.
  // For this example, we assume standard access.
  const { username, slug } = params;

  // 3. Fetch Data using the centralized Server Function
  // This keeps the component clean and logic reusable across the app
  const product = await getProductBySlug(username, slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">404</h1>
            <p className="text-zinc-500">Product Not Found</p>
            <p className="text-xs text-zinc-600 mt-2">Could not find {slug} by {username}</p>
        </div>
      </div>
    );
  }

  // Helper for currency (local formatting for server component)
  const formattedPrice = new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(product.price);

  // 4. Render
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 flex justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Section */}
        <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 aspect-square relative group">
           {product.image_url ? (
             <img 
               src={product.image_url} 
               alt={product.name} 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-zinc-700 font-mono text-sm">
                No Image Available
             </div>
           )}
           <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10 capitalize">
              {product.category}
           </div>
        </div>

        {/* Details Section */}
        <div className="flex flex-col justify-center space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 flex items-center justify-center">
                 {product.seller?.avatar_url ? (
                    <img src={product.seller.avatar_url} className="w-full h-full object-cover"/> 
                 ) : (
                    <span className="text-zinc-500 font-bold uppercase">
                        {product.seller?.username?.[0] || '?'}
                    </span>
                 )}
               </div>
               <div>
                   <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Sold by</p>
                   <p className="text-white font-semibold text-sm hover:text-emerald-500 cursor-pointer transition-colors">
                      @{product.seller?.username || 'unknown'}
                   </p>
               </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight text-white">
                {product.name}
            </h1>
            
            <div className="flex items-end gap-4">
                <div className="text-3xl font-mono text-emerald-500 font-bold">
                    {formattedPrice}
                </div>
                {product.rating > 0 && (
                    <div className="mb-1.5 flex items-center gap-1 text-yellow-400 text-sm font-medium bg-yellow-400/10 px-2 py-1 rounded">
                        <span>★</span> {product.rating}
                    </div>
                )}
            </div>
          </div>

          <div className="prose prose-invert prose-zinc max-w-none">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Description</h3>
            <p className="text-zinc-400 leading-relaxed text-base whitespace-pre-wrap">
              {product.description || 'No description provided.'}
            </p>
          </div>

          <div className="pt-6 border-t border-zinc-800">
              <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-4 px-8 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                Buy Now
              </button>
              <div className="flex justify-center gap-6 mt-6 text-zinc-600 text-xs">
                  <span className="flex items-center gap-1">🔒 Secure Payment</span>
                  <span className="flex items-center gap-1">⚡ Instant Delivery</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}