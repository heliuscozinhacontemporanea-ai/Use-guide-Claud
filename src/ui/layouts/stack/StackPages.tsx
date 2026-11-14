import {
  animate,
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { type RefObject, useEffect, useRef } from 'react';
import { cn } from '../../../shared/utils/cn';
import { stackSheetProgress } from '../../motion/stackSheetProgress';
import {
  FADE,
  OVERDRAG_RESISTANCE,
  PAGE_BACK_FRACTION,
  PAGE_BACK_VELOCITY,
  RECEDE_SHIFT,
  SHEET_CLOSE_FRACTION,
  SHEET_CLOSE_VELOCITY,
  SPRING,
} from '../../motion/tokens';
import { NAV_BAR_HEIGHT, StackNavBar } from './StackNavBar';
import type { StackEntry } from './stackTypes';
import { useStackGestures } from './useStackGestures';
import { useStackTransition } from './useStackTransition';

/** Folha que contém a pilha (Perfil): arrastar para baixo fecha a folha inteira. */
export interface StackSheetControl {
  height: number;
  /** "Reduzir movimento": deslocamento da folha enquanto o dedo arrasta. */
  dragY: MotionValue<number>;
  onDismissDrag: (velocity: number) => void;
}

interface StackPagesProps {
  /** Onde os gestos começam (a folha, ou a área da pilha de páginas). */
  containerRef: RefObject<HTMLDivElement | null>;
  entries: StackEntry[];
  backLabel: string;
  onBack: () => void;
  /** Sem folha (`PushStack`), só existe o gesto de voltar. */
  sheet?: StackSheetControl;
  /** A tela de cima terminou de sair (voltar): quem guarda o conteúdo dela pode soltá-lo. */
  onPopped?: () => void;
}

/**
 * Telas da pilha (na folha do Perfil ou no `PushStack`): a de cima, a de baixo durante a troca, a
 * barra fixa e os gestos (DESIGN.md P18).
 * Todas as telas da pilha ficam montadas (as de trás escondidas), como num app: voltar devolve a tela
 * com o estado e a rolagem de quando a pessoa saiu (P23).
 */
export function StackPages({
  containerRef,
  entries,
  backLabel,
  onBack,
  sheet,
  onPopped,
}: StackPagesProps) {
  const reduced = useReducedMotion();
  const { layers, progress, beginDrag, settle, rememberReleaseVelocity } = useStackTransition(
    entries,
    onPopped
  );
  const scroller = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const width = () => containerRef.current?.offsetWidth || 1;

  useEffect(() => {
    if (!layers.under) dragX.set(0);
  }, [layers.under, dragX]);

  useStackGestures(
    containerRef,
    {
      enabled: true,
      sheet: Boolean(sheet),
      canGoBack: entries.length > 1,
      getScroller: () => scroller.current,
    },
    {
      onSheetDrag: (dy) => {
        if (!sheet) return;
        if (reduced) {
          sheet.dragY.set(Math.max(0, dy));
          return;
        }
        const p = 1 - dy / sheet.height;
        stackSheetProgress.set(p > 1 ? 1 + (p - 1) * OVERDRAG_RESISTANCE : p);
      },
      onSheetRelease: (dy, vy) => {
        if (!sheet) return;
        if (dy > sheet.height * SHEET_CLOSE_FRACTION || vy > SHEET_CLOSE_VELOCITY) {
          sheet.onDismissDrag(-vy / sheet.height);
        } else if (reduced) {
          void animate(sheet.dragY, 0, FADE);
        } else {
          void animate(stackSheetProgress, 1, { ...SPRING, velocity: -vy / sheet.height });
        }
      },
      onPageDragStart: beginDrag,
      onPageDrag: (dx) => {
        if (reduced) dragX.set(dx);
        else progress.set(Math.min(1, Math.max(0, 1 - dx / width())));
      },
      onPageRelease: (dx, vx) => {
        if (dx > width() * PAGE_BACK_FRACTION || vx > PAGE_BACK_VELOCITY) {
          rememberReleaseVelocity(-vx / width());
          onBack();
        } else if (reduced) {
          void animate(dragX, 0, FADE);
          settle(0);
        } else {
          settle(-vx / width());
        }
      },
    }
  );

  const moving = layers.under !== null;
  const stack = entries.some((entry) => entry.key === layers.top.key)
    ? entries
    : [...entries, layers.top];
  const roleOf = (key: string): PageRole => {
    if (key === layers.top.key) return moving ? 'top' : 'alone';
    return key === layers.under?.key ? 'under' : 'hidden';
  };
  return (
    <div className="relative flex-1 min-h-0">
      {sheet && (
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1.5 z-20 h-1.5 w-10 -translate-x-1/2 rounded-full bg-line"
        />
      )}
      {/* A barra vem antes das telas no código: o leitor de tela e o Tab começam pelo `<`; fica por cima pelo z-index. */}
      <StackNavBar
        layers={layers}
        progress={progress}
        dragX={dragX}
        backLabel={backLabel}
        onBack={onBack}
      />
      {stack.map((entry) => {
        const role = roleOf(entry.key);
        return (
          <PageLayer
            key={entry.key}
            entry={entry}
            role={role}
            progress={progress}
            dragX={dragX}
            scrollerRef={role === 'top' || role === 'alone' ? scroller : undefined}
          />
        );
      })}
    </div>
  );
}

type PageRole = 'top' | 'under' | 'alone' | 'hidden';

function PageLayer({
  entry,
  role,
  progress,
  dragX,
  scrollerRef,
}: {
  entry: StackEntry;
  role: PageRole;
  progress: MotionValue<number>;
  dragX: MotionValue<number>;
  scrollerRef?: RefObject<HTMLDivElement | null>;
}) {
  const reduced = useReducedMotion();
  const slide = useTransform(progress, (q) => {
    if (role === 'top') return `${(1 - q) * 100}%`;
    if (role === 'under') return `${-RECEDE_SHIFT * 100 * q}%`;
    return '0%';
  });
  const fade = useTransform(progress, (q) => (role === 'top' ? q : 1));
  const veil = useTransform(progress, (q) => q);
  return (
    <motion.div
      ref={scrollerRef}
      inert={role === 'hidden'}
      aria-hidden={role === 'hidden' || undefined}
      style={{
        x: reduced ? (role === 'top' ? dragX : 0) : slide,
        opacity: reduced ? fade : 1,
      }}
      className={cn(
        'absolute inset-0 overflow-y-auto overscroll-contain no-scrollbar bg-app',
        role === 'hidden' && 'invisible',
        role === 'top' && 'shadow-[-8px_0_24px_rgba(0,0,0,0.12)]'
      )}
    >
      {entry.bare ? (
        entry.render()
      ) : (
        <div
          style={{ paddingTop: entry.navBar ? NAV_BAR_HEIGHT + 8 : 28 }}
          className="min-h-full flex flex-col px-6 sm:px-8 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)]"
        >
          {entry.render()}
        </div>
      )}
      {role === 'under' && (
        <motion.div
          aria-hidden="true"
          style={{ opacity: veil }}
          className="pointer-events-none absolute inset-0 bg-recede"
        />
      )}
    </motion.div>
  );
}
