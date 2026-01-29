'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TRANSLATIONS } from '../constants';
import { UserProfile as UserProfileType, Wallet, Language, Transaction, CurrencyCode, UserRole, ServiceItem, Product } from '../types';
import Hero from '../components/Hero';
import ServiceGrid from '../components/ServiceGrid';
import Marketplace from '../components/Marketplace';
import AICore from '../components/AICore';
import LanguageToggle from '../components/LanguageToggle';
import { Bell, User, Loader2, LogOut, Globe, Shield, PlusCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { getUserWallet, getUserTransactions, getUserProfile } from '../services/dbService';
import { getTopProducts } from '../services/productService';
import { fetchExchangeRates, SUPPORTED_CURRENCIES, formatCurrency } from '../services/currencyService';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('id');
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [rates, setRates] = useState<Partial<Record<CurrencyCode, number>>>({ IDR: 1 });
  
  // Data State
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, currency: 'IDR' });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [products, setProducts] = useState<Product[]>([]); // State for Top Products
  const [isLoading, setIsLoading] = useState(true);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    let isMounted = true;

    // 1. Load Exchange Rates Independently (Non-blocking)
    fetchExchangeRates().then((fetchedRates) => {
      if (isMounted) setRates(fetchedRates);
    }).catch(console.warn);

    // 2. Single Source of Truth for Auth & Data Loading
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log(`[Auth Event] ${event}`);

      // Handle Logout or No Session
      if (event === 'SIGNED_OUT' || !session) {
        if (isMounted) {
           setUser(null);
           setIsLoading(true); // Keep loading true while redirecting to prevent flash
           router.replace('/auth');
        }
        return;
      }

      // Handle Token Refresh (Skip data reload to prevent stutter)
      if (event === 'TOKEN_REFRESHED') {
        return;
      }

      // Handle Initial Session or Sign In
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        try {
           // Only show loading if we haven't loaded data yet to prevent UI flashes on re-focus
           if (!user) setIsLoading(true);
           
           await loadUserData(session.user.id, session.user);
        } catch (error) {
           console.error("Critical error loading user data:", error);
        } finally {
           if (isMounted) setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]); // Removed 'user' from dependencies to prevent infinite loops

  const loadUserData = async (userId: string, authUser: any) => {
    const appRole = authUser.app_metadata?.role?.toLowerCase();
    
    const baseUser: UserProfileType = {
        id: userId,
        email: authUser.email || '',
        username: authUser.user_metadata?.username || null,
        full_name: authUser.user_metadata?.full_name || 'User',
        avatar_url: authUser.user_metadata?.avatar_url,
        role: (appRole || 'user') as UserRole 
    };

    try {
        // Fetch all Dashboard data in parallel
        const [fetchedWallet, fetchedTransactions, fetchedProfile, fetchedProducts] = await Promise.all([
            getUserWallet(userId),
            getUserTransactions(userId),
            getUserProfile(userId),
            getTopProducts() 
        ]);

        const dbRole = fetchedProfile.role?.toLowerCase();
        let finalRole: UserRole = 'user';
        if (appRole === 'admin' || dbRole === 'admin') finalRole = 'admin';
        else if (appRole === 'seller' || dbRole === 'seller') finalRole = 'seller';

        setUser({ ...baseUser, ...fetchedProfile, role: finalRole });
        setWallet(fetchedWallet);
        setTransactions(fetchedTransactions || []);
        setProducts(fetchedProducts || []);
    } catch (e) {
        console.warn("Using fallback user data due to fetch error", e);
        // Ensure user is at least set so we don't get stuck, but keep partial data
        setUser(baseUser);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true); // Show loader during sign out
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  const handleServiceClick = (service: ServiceItem) => {
    router.push(`/services/${service.nameKey}`);
  };

  const handleProductClick = (product: Product) => {
    const sellerName = product.seller?.username || 'user';
    // Use router.push for client-side navigation instead of window.location.href
    router.push(`/${sellerName}/${product.slug}`);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-emerald-500 gap-2">
        <Loader2 size={32} className="animate-spin" />
        <span className="text-zinc-500 text-sm font-mono animate-pulse">Initializing XIX...</span>
      </div>
    );
  }

  const displayedBalance = formatCurrency(wallet.balance, currency, rates);
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="px-6 h-16 flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center transform rotate-3">
                <span className="font-mono font-bold text-zinc-950 text-xs">XIX</span>
            </div>
            <div className="hidden md:block">
                <p className="text-xs text-zinc-500">Welcome,</p>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{user.full_name}</p>
                    {user.role !== 'user' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 uppercase font-bold">{user.role}</span>
                    )}
                </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Action Buttons */}
             {(user.role === 'admin' || user.role === 'seller') && (
               <Link href="/add-product" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white transition-colors">
                 <PlusCircle size={14} />
                 <span className="hidden sm:inline">Add Product</span>
               </Link>
             )}

             {user.role === 'admin' && (
               <Link href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-purple-500/10 border-purple-500/50 text-purple-400 hover:text-purple-300 transition-colors">
                 <Shield size={14} />
                 <span className="hidden sm:inline">Admin</span>
               </Link>
             )}

             {/* Currency Dropdown */}
             <div className="relative group hidden sm:block">
                <div className="flex items-center gap-1 cursor-pointer text-zinc-400 hover:text-white">
                    <Globe size={16} />
                    <span className="text-xs font-mono font-bold">{currency}</span>
                </div>
                <div className="absolute right-0 top-full mt-2 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 hidden group-hover:block">
                    {SUPPORTED_CURRENCIES.map((c) => (
                        <button key={c.code} onClick={() => setCurrency(c.code)} className="w-full text-left px-3 py-2 text-[10px] hover:bg-zinc-800 flex justify-between">
                            <span>{c.code}</span><span>{c.symbol}</span>
                        </button>
                    ))}
                </div>
             </div>

             <LanguageToggle currentLang={lang} onToggle={() => setLang(l => l === 'id' ? 'en' : 'id')} />
             
             <div className="flex items-center gap-3 pl-2 border-l border-zinc-800">
                <Link href="/profile" className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden hover:border-emerald-500">
                    {user.avatar_url ? <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" /> : <User size={16} className="text-zinc-400" />}
                </Link>
                <button onClick={handleLogout} className="text-zinc-500 hover:text-red-400">
                    <LogOut size={18} />
                </button>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-4">
        <Hero displayedBalance={displayedBalance} labels={{ balance: t.balance, add_funds: t.add_funds, send_money: t.send_money }} />
        <ServiceGrid translations={t.services} onServiceClick={handleServiceClick} />
        
        {/* Real Data Marketplace */}
        <Marketplace 
            title={t.top_sellers} 
            currency={currency} 
            rates={rates} 
            products={products}
            seeAllHref="/search" 
            onProductClick={handleProductClick}
        />
        
        {/* Transactions */}
        <div className="px-6 mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">{t.recent_transactions}</h2>
            <div className="space-y-3">
                {safeTransactions.length > 0 ? (
                    safeTransactions.map(tx => (
                        <div key={tx.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-sm text-zinc-200">{tx.description}</p>
                                <p className="text-xs text-zinc-500 mt-1">{tx.date}</p>
                            </div>
                            <div className={`text-sm font-mono font-medium ${tx.type === 'topup' ? 'text-emerald-500' : 'text-zinc-300'}`}>
                                {tx.type === 'topup' ? '+' : '-'} {formatCurrency(tx.amount, currency, rates)}
                            </div>
                        </div>
                    ))
                ) : (
                   <p className="text-zinc-500 text-sm">No transactions found.</p>
                )}
            </div>
        </div>
      </main>

      <AICore wallet={wallet} transactions={safeTransactions} labels={{ ask: t.ask_ai, greeting: t.ai_greeting }} />
    </div>
  );
}