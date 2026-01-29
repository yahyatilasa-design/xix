import React from 'react';
import { getProductBySlug } from '../../../lib/nextjs-server-utils';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ShoppingCart, ShieldCheck, Zap, User, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

// 1. Dynamic Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await params for Next.js 15+ compatibility
  const { username, slug } = await params;
  const product = await getProductBySlug(username, slug);

  if (!product) {
    return {
      title: 'Product Not Found | XIX Marketplace',
    };
  }

  const sellerName = product.seller?.full_name || product.seller?.username || 'Seller';
  
  return {
    title: `${product.name} | ${sellerName}`,
    description: product.description?.slice(0, 160) || `Buy ${product.name} on XIX Marketplace.`,
    openGraph: {
      title: product.name,
      description: product.description || '',
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

// 2. Server Component
export default async function ProductPage({ params }: PageProps) {
  // Await params for Next.js 15+ compatibility
  const { username, slug } = await params;

  // Fetch Data
  const product = await getProductBySlug(username, slug);

  // Security: If no product found or username doesn't match
  if (!product) {
    // If notFound() is causing blank screens due to layout issues, render a fallback UI here directly
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
         <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
            <AlertCircle size={32} className="text-red-500" />
         </div>
         <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
         <p className="text-zinc-500 text-sm mb-6 max-w-md text-center">
            We couldn't find a product with slug <strong>"{slug}"</strong> sold by <strong>@{username}</strong>.
         </p>
         <Link href="/" className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-xl transition-colors font-medium">
            <ArrowLeft size={18} /> Back to Marketplace
         </Link>
      </div>
    );
  }

  // Currency Formatter
  const formattedPrice = new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(product.price);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Absolute Back Button for easy navigation */}
      <Link href="/" className="fixed top-6 left-6 z-50 p-3 bg-zinc-900/80 backdrop-blur-md rounded-full border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
         <ArrowLeft size={20} />
      </Link>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-8 lg:mt-0">
        
        {/* Left Column: Image */}
        <div className="space-y-4">
            <div className="rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 aspect-square relative group shadow-2xl shadow-black/50">
            {product.image_url ? (
                <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 font-mono text-sm bg-zinc-900/50">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-2">
                        <Zap size={24} className="text-zinc-600" />
                    </div>
                    No Image Available
                </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-wider shadow-lg">
                {product.category || 'Digital'}
            </div>
            </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col space-y-8 pt-2">
          
          {/* Seller Info */}
          <div className="flex items-center gap-3 pb-6 border-b border-zinc-900">
             <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 flex items-center justify-center shrink-0">
                 {product.seller?.avatar_url ? (
                    <img src={product.seller.avatar_url} alt={product.seller.username || ''} className="w-full h-full object-cover"/> 
                 ) : (
                    <User size={20} className="text-zinc-500" />
                 )}
             </div>
             <div>
                 <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Verified Seller</p>
                 <p className="text-white font-bold text-lg leading-none mt-1 hover:text-emerald-500 transition-colors cursor-pointer">
                    @{product.seller?.username || 'unknown'}
                 </p>
             </div>
          </div>
            
          {/* Product Header */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
                {product.name}
            </h1>
            <div className="flex items-center gap-4">
                <div className="text-3xl font-mono text-emerald-400 font-bold bg-emerald-500/5 px-4 py-2 rounded-lg border border-emerald-500/10 inline-block">
                    {formattedPrice}
                </div>
                {product.rating > 0 && (
                     <div className="flex items-center gap-1 text-yellow-400 font-medium bg-yellow-400/10 px-3 py-2 rounded-lg border border-yellow-400/10">
                        <span>★</span> {product.rating}
                    </div>
                )}
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-invert prose-zinc max-w-none">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck size={16} /> Description
            </h3>
            <p className="text-zinc-300 leading-relaxed text-base whitespace-pre-wrap">
              {product.description || 'No description provided for this product.'}
            </p>
          </div>

          {/* Action Area */}
          <div className="pt-8 mt-auto">
              <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-lg py-5 px-8 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.98] shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3">
                <ShoppingCart size={24} strokeWidth={2.5} />
                Buy Now
              </button>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                 <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                    <ShieldCheck className="text-emerald-500" size={20} />
                    <div>
                        <p className="text-xs font-bold text-white">Secure Transaction</p>
                        <p className="text-[10px] text-zinc-500">Escrow protection active</p>
                    </div>
                 </div>
                 <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                    <Zap className="text-yellow-500" size={20} />
                    <div>
                        <p className="text-xs font-bold text-white">Instant Delivery</p>
                        <p className="text-[10px] text-zinc-500">Automated processing</p>
                    </div>
                 </div>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
}