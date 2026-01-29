import React from 'react';
import { Language } from '../types';

interface LanguageToggleProps {
  currentLang: Language;
  onToggle: () => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLang, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-emerald-500 transition-colors"
    >
      <span className={currentLang === 'id' ? 'text-emerald-500 font-bold' : ''}>ID</span>
      <span className="text-zinc-700">|</span>
      <span className={currentLang === 'en' ? 'text-emerald-500 font-bold' : ''}>EN</span>
    </button>
  );
};

export default LanguageToggle;