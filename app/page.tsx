'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TRANSLATIONS } from '../constants';
import { UserProfile as UserProfileType, Wallet, Language, Transaction, CurrencyCode, UserRole, Product } from '../types';
import Hero from '../components/Hero';
import ServiceGrid from '../components/ServiceGrid';
import Marketplace from '../components/Marketplace';
import AICore from '../components/AICore';
import LanguageToggle from '../components/LanguageToggle';
import { User, Loader2, LogOut, Globe, Shield, PlusCircle, Boxes, AlertTriangle } from 'lucide-react';
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
  
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, currency: 'IDR' });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // New state for handling errors

  const t = TRANSLATIONS[lang];

  const loadUserData = useCallback(async (userId: string, authUser: any) => {
    setIsLoading(true);
    setError(null); // Reset error state on new data load attempt
    try {
      const [fetchedWallet, fetchedTransactions, fetchedProfile, fetchedProducts] = await Promise.all([
        getUserWallet(userId),
        getUserTransactions(userId),
        getUserProfile(userId),
        getTopProducts(),
      ]);

      const appRole = authUser.app_metadata?.role?.toLowerCase();
      const dbRole = (fetchedProfile as any).role?.toLowerCase();
      let finalRole: UserRole = 'user';
      if (appRole === 'admin' || dbRole === 'admin') finalRole = 'admin';
      else if (appRole === 'seller' || dbRole === 'seller') finalRole = 'seller';

      const fullUser: UserProfileType = {
        id: userId,
        email: authUser.email || '',
        username: authUser.user_metadata?.username || null,
        full_name: authUser.user_metadata?.full_name || 'User',
        avatar_url: authUser.user_metadata?.avatar_url,
        ...(fetchedProfile as UserProfileType),
        role: finalRole,
      };

      setUser(fullUser);
      setWallet(fetchedWallet);
      setTransactions(fetchedTransactions || []);
      setProducts(fetchedProducts || []);
    } catch (e) {
      console.error("Fatal error loading user data:", e);
      setError('Gagal memuat data pengguna. Silakan muat ulang halaman.'); // Set a user-friendly error message
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchExchangeRates().then(rates => {
      if(isMounted) setRates(rates)
    }).catch(console.warn);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session) {
        await loadUserData(session.user.id, session.user);
      } else {
        setIsLoading(false);
        router.replace('/auth');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date unavailable';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-emerald-500 gap-2">
        <Loader2 size={32} className="animate-spin" />
        <span className="text-zinc-500 text-sm font-mono animate-pulse">Initializing XIX...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-red-500 gap-3 p-4 text-center">
        <AlertTriangle size={40} />
        <h2 className="text-lg font-bold text-zinc-200">Terjadi Kesalahan</h2>
        <p className="text-sm text-zinc-400">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  if (!user) {
    return null;
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
             {(user.role === 'admin' || user.role === 'seller') && (
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/products" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white transition-colors">
                        <Boxes size={14} />
                        <span className="hidden sm:inline">Manage</span>
                    </Link>
                    <Link href="/add-product" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:text-emerald-300 transition-colors">
                        <PlusCircle size={14} />
                        <span className="hidden sm:inline">Add</span>
                    </Link>
                </div>
             )}

             {user.role === 'admin' && (
               <Link href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-purple-500/10 border-purple-500/50 text-purple-400 hover:text-purple-300 transition-colors">
                 <Shield size={14} />
                 <span className="hidden sm:inline">Admin</span>
               </Link>
             )}

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
        <ServiceGrid translations={t.services} onServiceClick={(service) => router.push(`/services/${service.nameKey}`)} />
        
        <Marketplace 
            title={t.top_sellers} 
            currency={currency}
            rates={rates}
            products={products}
            seeAllHref="/search" 
            onProductClick={(product) => router.push(`/${product.seller?.username || 'user'}/${product.slug}`)}
        />
        
        <div className="px-6 mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">{t.recent_transactions}</h2>
            <div className="space-y-3">
                {safeTransactions.length > 0 ? (
                    safeTransactions.map(tx => (
                        <div key={tx.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-sm text-zinc-200">{tx.description}</p>
                                <p className="text-xs text-zinc-500 mt-1">{formatDate(tx.created_at)}</p>
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
