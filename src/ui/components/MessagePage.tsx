import type { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface MessagePageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

/** Página simples de aviso (não encontrada, resultado de pagamento) com uma ação principal. */
export function MessagePage({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: MessagePageProps) {
  return (
    <div className="px-4 py-16 max-w-lg mx-auto">
      <GlassCard className="p-8 flex flex-col items-center text-center gap-4">
        <Icon size={36} className="text-teal-300" aria-hidden="true" />
        <h1 className="text-xl font-display font-black text-white">{title}</h1>
        <p className="text-sm text-white/70 leading-relaxed">{description}</p>
        <button
          type="button"
          onClick={onAction}
          className="min-h-12 px-6 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-sm font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
        >
          {actionLabel}
        </button>
      </GlassCard>
    </div>
  );
}
