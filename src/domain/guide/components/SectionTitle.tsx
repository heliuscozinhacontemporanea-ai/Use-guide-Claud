import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
}

export function SectionTitle({ title, subtitle, onSeeAll }: SectionTitleProps) {
  return (
    <div className="px-10 mb-2 mt-4 flex items-end justify-between">
      <div>
        <h2 className="text-2xl font-display font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-white/50 font-medium">{subtitle}</p>}
      </div>
      <button
        onClick={onSeeAll}
        className="text-[10px] text-teal-400 font-black flex items-center gap-1 uppercase tracking-widest bg-teal-500/10 px-4 py-2 rounded-full border border-teal-500/20 active:scale-95 transition-transform"
      >
        Ver Tudo <ChevronRight size={12} strokeWidth={3} />
      </button>
    </div>
  );
}
