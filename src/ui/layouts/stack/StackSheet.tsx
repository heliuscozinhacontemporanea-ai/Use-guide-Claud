import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import { cn } from '../../../shared/utils/cn';
import { readSafeAreaTop } from '../../motion/safeAreaTop';
import { stackSheetProgress } from '../../motion/stackSheetProgress';
import { CARD_PEEK_PX, FADE, SPRING } from '../../motion/tokens';
import { StackPages } from './StackPages';
import { StackActionsContext } from './stackPageAction';
import type { StackAction, StackEntry } from './stackTypes';

export interface StackSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Volta uma tela (o `<` e o arrasto para a direita). Na primeira tela, o `<` fecha a folha. */
  onBack: () => void;
  /** Da primeira tela à de cima. */
  entries: StackEntry[];
  labels: { back: string; close: string; dialog: string };
  /** Algo abriu por cima da folha (ex.: login): ela recua como o fundo. */
  receded?: boolean;
  /** Ocupa a folha inteira no lugar da pilha, sem gestos (ex.: recorte da foto). */
  takeover?: ReactNode;
  /** Por cima de tudo na folha (ex.: aviso curto). */
  overlay?: ReactNode;
  /** A tela de cima terminou de sair ao voltar. */
  onPopped?: () => void;
}

/**
 * Folha em pilha (DESIGN.md §9.1, D33): sobe da base com a mola padrão e o fundo do app vira cartão
 * (`stackSheetProgress`). Dentro, as telas se empilham com a barra do topo fixa e os gestos da P18.
 */
export function StackSheet(props: StackSheetProps) {
  const { isOpen } = props;
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(isOpen);
  const releaseVelocity = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;
    const velocity = releaseVelocity.current;
    releaseVelocity.current = undefined;
    const transition = reduced ? FADE : { ...SPRING, velocity };
    const run = animate(stackSheetProgress, isOpen ? 1 : 0, transition);
    if (!isOpen) void run.then(() => setMounted(false));
    return () => run.stop();
  }, [isOpen, mounted, reduced]);

  if (!mounted) return null;
  return createPortal(
    <SheetBody
      {...props}
      onDismissDrag={(velocity) => {
        releaseVelocity.current = velocity;
        props.onClose();
      }}
    />,
    document.body
  );
}

function SheetBody({
  isOpen,
  onClose,
  onBack,
  entries,
  labels,
  receded = false,
  takeover,
  overlay,
  onPopped,
  onDismissDrag,
}: StackSheetProps & { onDismissDrag: (velocity: number) => void }) {
  const reduced = useReducedMotion();
  const [pageActions, setPageActions] = useState<Record<string, StackAction>>({});
  const setPageAction = useCallback((key: string, action: StackAction | null) => {
    setPageActions((current) => {
      if (!action) {
        if (!(key in current)) return current;
        const { [key]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [key]: action };
    });
  }, []);
  const stackEntries = entries.map((entry) =>
    entry.action || !pageActions[entry.key] ? entry : { ...entry, action: pageActions[entry.key] }
  );
  const [safeTop] = useState(() => readSafeAreaTop());
  const top = Math.max(safeTop, 16) + CARD_PEEK_PX;
  const sheetRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(() => window.innerHeight - top);
  useLayoutEffect(() => {
    const update = () => setHeight(sheetRef.current?.offsetHeight ?? window.innerHeight - top);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [top]);

  // "Reduzir movimento": o automático esmaece; o arraste do dedo continua movendo a folha (dragY).
  const dragY = useMotionValue(0);
  const live = useRef({ reduced, height });
  live.current = { reduced, height };
  const y = useTransform([stackSheetProgress, dragY], ([p = 0, d = 0]: number[]) =>
    live.current.reduced ? d : (1 - p) * live.current.height
  );
  const opacity = useTransform(stackSheetProgress, (p) => (live.current.reduced ? p : 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        keepFocusInside(sheetRef.current, e);
        return;
      }
      if (e.key !== 'Escape') return;
      if (entries.length > 1) onBack();
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entries.length, onBack, onClose]);

  // Foco vai para a folha ao abrir e volta para quem a abriu ao fechar (DESIGN.md §11).
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    sheetRef.current?.focus({ preventScroll: true });
    return () => opener?.focus({ preventScroll: true });
  }, [isOpen]);

  return (
    <motion.div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label={labels.dialog}
      tabIndex={-1}
      style={{ y, opacity, top, zIndex: Z_INDEX.modal }}
      animate={{ scale: receded ? 0.92 : 1 }}
      transition={reduced ? FADE : SPRING}
      className={cn(
        'fixed inset-x-0 bottom-0 mx-auto w-full max-w-[480px] flex flex-col overflow-hidden rounded-t-3xl outline-none origin-top',
        takeover ? 'bg-black' : 'bg-sheet text-ink'
      )}
    >
      {takeover ?? (
        <StackActionsContext.Provider value={setPageAction}>
          <StackPages
            sheetRef={sheetRef}
            entries={stackEntries}
            backLabel={entries.length > 1 ? labels.back : labels.close}
            onBack={entries.length > 1 ? onBack : onClose}
            sheetHeight={height}
            dragY={dragY}
            onDismissDrag={onDismissDrag}
            onPopped={onPopped}
          />
        </StackActionsContext.Provider>
      )}
      {overlay}
      <RecedeVeil receded={receded} />
    </motion.div>
  );
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Tab e Shift+Tab circulam dentro da folha, só entre o que está visível (as telas de trás são `inert`). */
function keepFocusInside(sheet: HTMLElement | null, event: KeyboardEvent) {
  if (!sheet) return;
  const items = [...sheet.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.closest('[inert]')
  );
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return;
  const active = document.activeElement;
  const outside = !(active instanceof Node) || !sheet.contains(active) || active === sheet;
  if (event.shiftKey && (outside || active === first)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (outside || active === last)) {
    event.preventDefault();
    first.focus();
  }
}

function RecedeVeil({ receded }: { receded: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={{ opacity: receded ? 1 : 0 }}
      transition={FADE}
      className="pointer-events-none absolute inset-0 z-20 bg-recede"
    />
  );
}
