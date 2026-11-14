import { ChevronLeft } from 'lucide-react';
import { type MotionValue, motion, useReducedMotion, useTransform } from 'motion/react';
import { RECEDE_SHIFT } from '../../motion/tokens';
import type { StackAction, StackEntry } from './stackTypes';
import type { StackLayers } from './useStackTransition';

export const NAV_BAR_HEIGHT = 56;

interface StackNavBarProps {
  layers: StackLayers;
  progress: MotionValue<number>;
  backLabel: string;
  onBack: () => void;
}

/**
 * Barra do topo fixa da folha (DESIGN.md §8, D33): o `<` fica parado na mesma altura em todas as telas;
 * o título centralizado e a ação da direita entram e saem junto com a página.
 */
export function StackNavBar({ layers, progress, backLabel, onBack }: StackNavBarProps) {
  const { top, under } = layers;
  if (!top.navBar && !under?.navBar) return null;
  return (
    <div className="absolute inset-x-0 top-0 z-10 bg-sheet" style={{ height: NAV_BAR_HEIGHT }}>
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        className="press absolute left-2 top-1.5 z-10 w-11 h-11 rounded-full flex items-center justify-center text-ink/80 hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        <ChevronLeft size={26} strokeWidth={2.25} aria-hidden="true" />
      </button>
      {under?.navBar && <NavLayer entry={under} progress={progress} role="under" />}
      {top.navBar && <NavLayer entry={top} progress={progress} role={under ? 'top' : 'alone'} />}
    </div>
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
          style={{ x, opacity }}
          className="pointer-events-none absolute inset-x-0 top-0 h-full px-16 flex items-center justify-center text-[17px] leading-6 font-semibold text-ink"
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
      className="press absolute right-2 top-1.5 w-11 h-11 rounded-full flex items-center justify-center text-ink/80 hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
    >
      <Icon size={22} aria-hidden="true" />
    </motion.button>
  );
}
