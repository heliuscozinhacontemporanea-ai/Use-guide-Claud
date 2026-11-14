import { ChevronLeft } from 'lucide-react';
import { type MotionValue, motion, useReducedMotion, useTransform } from 'motion/react';
import { RECEDE_SHIFT } from '../../motion/tokens';
import type { StackAction, StackEntry } from './stackTypes';
import type { StackLayers } from './useStackTransition';

export const NAV_BAR_HEIGHT = 56;
/**
 * A barra tem altura fixa em px e o título para de crescer em 22 px: com a letra do sistema grande, o
 * `<` e a ação continuam na barra e o título corta com reticências, como no iOS (o nome completo
 * continua no `<h2>` para o leitor de tela). O conteúdo das telas acompanha a letra (P17).
 */
const TITLE_SIZE = 'min(1.0625rem, 22px)';

interface StackNavBarProps {
  layers: StackLayers;
  progress: MotionValue<number>;
  /** "Reduzir movimento": a tela de cima segue o dedo sem deslizar sozinha. */
  dragX: MotionValue<number>;
  backLabel: string;
  onBack: () => void;
}

/**
 * Barra do topo fixa da folha (DESIGN.md §8, D33): o `<` fica parado na mesma altura em todas as telas;
 * o título centralizado e a ação da direita entram e saem junto com a página.
 */
export function StackNavBar({ layers, progress, dragX, backLabel, onBack }: StackNavBarProps) {
  const { top, under } = layers;
  if (!top.navBar && !under?.navBar) return null;
  return (
    <div className="absolute inset-x-0 top-0 z-10 bg-app" style={{ height: NAV_BAR_HEIGHT }}>
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        className="press absolute left-[8px] top-[6px] z-10 w-[44px] h-[44px] rounded-full flex items-center justify-center text-ink hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        <ChevronLeft size={24} strokeWidth={2.25} aria-hidden="true" />
      </button>
      {under?.navBar && <NavLayer entry={under} progress={progress} role="under" />}
      {under && <BarRecede progress={progress} dragX={dragX} />}
      {top.navBar && <NavLayer entry={top} progress={progress} role={under ? 'top' : 'alone'} />}
    </div>
  );
}

/**
 * Véu `recede` só na parte da barra que pertence à tela de baixo (da borda esquerda até onde a tela de
 * cima começa), com a mesma intensidade do véu do conteúdo: a tela que entra não muda de cor.
 */
function BarRecede({
  progress,
  dragX,
}: {
  progress: MotionValue<number>;
  dragX: MotionValue<number>;
}) {
  const reduced = useReducedMotion();
  const width = useTransform([progress, dragX], ([q = 1, d = 0]: number[]) =>
    reduced ? `${d}px` : `${(1 - q) * 100}%`
  );
  const opacity = useTransform(progress, (q) => q);
  return (
    <motion.div
      aria-hidden="true"
      style={{ width, opacity }}
      className="pointer-events-none absolute inset-y-0 left-0 bg-recede"
    />
  );
}

function NavLayer({
  entry,
  progress,
  role,
}: {
  entry: StackEntry;
  progress: MotionValue<number>;
  role: 'top' | 'under' | 'alone';
}) {
  const reduced = useReducedMotion();
  const x = useTransform(progress, (q) => {
    if (reduced || role === 'alone') return '0%';
    return role === 'top' ? `${(1 - q) * 100}%` : `${-RECEDE_SHIFT * 100 * q}%`;
  });
  const opacity = useTransform(progress, (q) =>
    role === 'alone' ? 1 : role === 'top' ? q : 1 - q
  );
  return (
    <>
      {entry.title && (
        <motion.h2
          style={{ x, opacity, fontSize: TITLE_SIZE }}
          className="pointer-events-none absolute inset-x-0 top-0 h-full px-[60px] flex items-center justify-center font-semibold leading-tight text-ink"
        >
          <span className="truncate">{entry.title}</span>
        </motion.h2>
      )}
      {entry.action && <NavAction action={entry.action} x={x} opacity={opacity} />}
    </>
  );
}

function NavAction({
  action,
  x,
  opacity,
}: {
  action: StackAction;
  x: MotionValue<string>;
  opacity: MotionValue<number>;
}) {
  const Icon = action.icon;
  return (
    <motion.button
      type="button"
      onClick={action.onClick}
      aria-label={action.label}
      style={{ x, opacity }}
      className="press absolute right-[8px] top-[6px] w-[44px] h-[44px] rounded-full flex items-center justify-center text-ink hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
    >
      <Icon size={24} aria-hidden="true" />
    </motion.button>
  );
}
