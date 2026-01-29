import React from 'react';
import * as LucideIcons from 'lucide-react';
import { SERVICES } from '../constants';
import { ServiceItem } from '../types';

interface ServiceGridProps {
  translations: Record<string, string>;
  onServiceClick: (service: ServiceItem) => void;
}

const ServiceGrid: React.FC<ServiceGridProps> = ({ translations, onServiceClick }) => {
  return (
    <div className="px-6 py-4">
      <div className="grid grid-cols-4 gap-y-8 gap-x-4">
        {SERVICES.map((service) => {
            // Dynamically access Lucide icons
            const IconComponent = (LucideIcons as any)[service.icon] || LucideIcons.HelpCircle;
            
            return (
              <button 
                key={service.id} 
                onClick={() => onServiceClick(service)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all duration-300 shadow-sm active:scale-95">
                  <IconComponent size={24} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] md:text-xs text-zinc-400 font-medium text-center leading-tight">
                  {translations[service.nameKey] || service.nameKey}
                </span>
              </button>
            );
        })}
      </div>
    </div>
  );
};

export default ServiceGrid;