'use client';

import React from 'react';
import { Star, Zap, ArrowRight } from 'lucide-react';
import { CurrencyCode, Product } from '../types';
import { formatCurrency } from '../services/currencyService';

interface MarketplaceProps {
  title: string;
  currency: CurrencyCode;
  rates: Partial<Record<CurrencyCode, number>>;
  products: Product[];
  seeAllHref?: string;
  onProductClick?: (product: Product) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ title, currency, rates, products = [], seeAllHref, onProductClick }) => {
  // Safe array access in case products is passed as null
  const productList = Array.isArray(products) ? products : [];

  return (
    <div className="py-6 border-t border-zinc-900 relative z-10">
      <div className="px-6 mb-4 flex justify-between items-end">
        <h2 className="text-lg font-semibold text-white tracking-tight">{title}</h2>
        {seeAllHref && (
          <button 
            className="text-xs text-emerald-500 font-medium hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            See All <ArrowRight size={12} />
          </button>
        )}
      </div>
      
      {productList.length === 0 ? (
        <div className="px-6 py-8 text-center bg-zinc-900/30 mx-6 rounded-xl border border-zinc-800 border-dashed">
            <p className="text-zinc-500 text-sm">No products available yet.</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto px-6 gap-4 pb-4 no-scrollbar snap-x">
          {productList.map((product) => {
            return (
              <div 
                key={product.id} 
                onClick={() => onProductClick && onProductClick(product)}
                className="min-w-[160px] md:min-w-[200px] snap-center block cursor-pointer"
              >
                <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 group hover:border-zinc-700 transition-colors h-full flex flex-col">
                  <div className="aspect-square relative overflow-hidden bg-zinc-800">
                    {product.image_url ? (
                        <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Zap size={24} />
                        </div>
                    )}
                    
                    {product.rating > 0 && (
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white flex items-center gap-0.5">
                        <Star size={8} className="fill-yellow-400 text-yellow-400" />
                        {product.rating}
                        </div>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="text-sm font-medium text-white truncate">{product.name}</h3>
                    <p className="text-xs text-zinc-500 truncate mb-2">
                        @{product.seller?.username || 'unknown'}
                    </p>
                    <div className="mt-auto">
                        <p className="text-emerald-500 font-mono font-bold text-sm">
                        {formatCurrency(product.price, currency, rates)}
                        </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Marketplace;