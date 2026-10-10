import { AlertTriangle, RefreshCw } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <GlassCard className="p-6 flex flex-col items-center text-center gap-3">
      <AlertTriangle size={28} className="text-amber-400" />
      <p className="text-sm text-white/70 leading-relaxed">{message}</p>
      <button
        onClick={onRetry}
        aria-label="Tentar novamente"
        className="flex items-center gap-2 px-4 py-2.5 bg-teal-500/10 border border-teal-500/25 rounded-xl text-xs font-bold uppercase tracking-wide text-teal-400 hover:bg-teal-500/20 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        <RefreshCw size={14} />
        Tentar novamente
      </button>
    </GlassCard>
  );
}
