'use client'; // Error components must be Client Components
 
import { useEffect } from 'react';
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
 
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center transform rotate-3 mx-auto mb-4 shadow-[0_0_20px_rgba(255,0,0,0.1)]">
             <span className="font-mono font-bold text-red-400 text-xl tracking-tighter">!</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong!</h2>
        <p className="text-zinc-500 text-sm mb-6 max-w-sm">
            An unexpected error occurred. This might be a temporary issue. Please try again.
        </p>
        <button
            onClick={() => reset()}
            className="bg-emerald-550 hover:bg-emerald-600 active:scale-95 transition-all text-zinc-950 font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2"
        >
            Try again
        </button>
    </div>
  );
}
