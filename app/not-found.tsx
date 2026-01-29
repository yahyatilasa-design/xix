import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
      <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800 animate-pulse">
        <FileQuestion size={48} className="text-emerald-500" />
      </div>
      
      <h2 className="text-4xl font-bold tracking-tight mb-2">Page Not Found</h2>
      <p className="text-zinc-500 mb-8 text-center max-w-md">
        The product or page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <Link 
        href="/"
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6 py-3 rounded-xl transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Marketplace
      </Link>
    </div>
  );
}