import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../shared/utils/cn';
import { BUTTON_PRIMARY } from '../styles/controls';
import { GlassCard } from './GlassCard';

type MessagePageProps = (
  | { icon: LucideIcon; visual?: never }
  /** Ilustração no lugar do ícone (ex.: o 404 da página não encontrada). */
  | { visual: ReactNode; icon?: never }
) & {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
};

/** Página simples de aviso (não encontrada, resultado de pagamento) com uma ação principal, nos dois temas. */
export function MessagePage({
  icon: Icon,
  visual,
  title,
  description,
  actionLabel,
  onAction,
}: MessagePageProps) {
  return (
    <div className="px-4 py-16 max-w-lg mx-auto">
      <GlassCard className="p-8 flex flex-col items-center text-center gap-4">
        {visual ?? (Icon && <Icon size={36} className="text-accent" aria-hidden="true" />)}
        <h1 className="text-xl font-display font-black text-ink">{title}</h1>
        <p className="text-sm text-ink/70 leading-relaxed">{description}</p>
        <button type="button" onClick={onAction} className={cn(BUTTON_PRIMARY, 'min-h-12 px-6')}>
          {actionLabel}
        </button>
      </GlassCard>
    </div>
  );
}
