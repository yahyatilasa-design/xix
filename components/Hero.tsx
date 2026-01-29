import React from 'react';
import { Plus, ArrowRight } from 'lucide-react';

interface HeroProps {
  displayedBalance: string;
  labels: {
    balance: string;
    add_funds: string;
    send_money: string;
  };
}

const Hero: React.FC<HeroProps> = ({ displayedBalance, labels }) => {
  return (
    <div className="p-6 pt-24 pb-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="relative z-10">
        <p className="text-zinc-500 text-sm font-medium mb-1 tracking-wide uppercase">{labels.balance}</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white font-mono tracking-tighter">
          {displayedBalance}
        </h1>

        <div className="flex gap-4 mt-8">
          <button className="flex-1 bg-emerald-550 hover:bg-emerald-600 active:scale-95 transition-all text-zinc-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2">
            <Plus size={20} strokeWidth={3} />
            {labels.add_funds}
          </button>
          <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-zinc-100 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-zinc-700">
            {labels.send_money}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;