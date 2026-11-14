import * as RadixDialog from '@radix-ui/react-dialog';
import {
  animate,
  motion,
  type MotionValue,
  useMotionValue,
  usePresence,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { type ReactNode, type RefObject, useEffect, useLayoutEffect, useRef } from 'react';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import { cn } from '../../../shared/utils/cn';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { stackSheetProgress } from '../../motion/stackSheetProgress';
import {
  FADE,
  OVERDRAG_RESISTANCE,
  SHEET_CLOSE_FRACTION,
  SHEET_CLOSE_VELOCITY,
  SPRING,
} from '../../motion/tokens';
import { useStackGestures } from '../../layouts/stack/useStackGestures';

/** Diálogo do `sm:` em diante (DESIGN.md §9.1): escala de 0,96 e fade, 200 ms entrando e 150 saindo. */
const CARD_IN = { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } as const;
const CARD_OUT = { duration: 0.15, ease: [0.2, 0.8, 0.2, 1] } as const;

interface DialogPanelProps {
  nested: boolean;
  dismissible: boolean;
  /** É a primeira folha aberta: o app atrás vira cartão junto com ela. */
  drivesBackdrop: boolean;
  /** Outra folha abriu por cima: esta recua. */
  receded: boolean;
  className?: string;
  /** Velocidade do dedo ao soltar fechando (px/s), para a saída continuar o movimento. */
  releaseVelocity: RefObject<number | undefined>;
  onDragClose: (velocity: number) => void;
  children: ReactNode;
}

/** Fundo e folha com a entrada, a saída e o arraste (dentro do `Portal` do Radix, montado à força). */
export function DialogPanel(props: DialogPanelProps) {
  const isPhone = !useMediaQuery('(min-width: 640px)');
  return isPhone ? <PhoneSheet {...props} /> : <CenteredCard {...props} />;
}

function Overlay({ nested, opacity }: { nested: boolean; opacity: MotionValue<number> }) {
  return (
    <RadixDialog.Overlay forceMount asChild>
      <motion.div
        // Sem desfoque atrás das folhas (D33): o véu basta e pesa menos no celular.
        className="fixed inset-0 bg-scrim"
        style={{ opacity, zIndex: nested ? Z_INDEX.modalNested : Z_INDEX.modal }}
      />
    </RadixDialog.Overlay>
  );
}

function Content({
  nested,
  dismissible,
  className,
  style,
  sheetRef,
  children,
}: {
  nested: boolean;
  dismissible: boolean;
  className: string;
  style: Record<string, unknown>;
  sheetRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  return (
    <RadixDialog.Content
      forceMount
      asChild
      onEscapeKeyDown={(event) => !dismissible && event.preventDefault()}
      onPointerDownOutside={(event) => !dismissible && event.preventDefault()}
      // O Radix foca o primeiro controle (o botão fechar) e o anel aparece sem a pessoa usar o teclado.
      // Focar a própria folha mantém o Tab e o leitor de tela começando dentro do diálogo.
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        (event.currentTarget as HTMLElement).focus();
      }}
    >
      <motion.div
        ref={sheetRef}
        className={className}
        style={{ ...style, zIndex: nested ? Z_INDEX.modalNested : Z_INDEX.modal }}
      >
        {children}
      </motion.div>
    </RadixDialog.Content>
  );
}

const SHEET_BASE =
  'fixed inset-x-0 bottom-0 mx-auto w-full max-w-md max-h-[92dvh] overflow-y-auto overscroll-contain p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] rounded-t-3xl bg-sheet border border-line shadow-2xl text-ink outline-none origin-top';

function PhoneSheet({
  nested,
  dismissible,
  drivesBackdrop,
  receded,
  className,
  releaseVelocity,
  onDragClose,
  children,
}: DialogPanelProps) {
  const reduced = useReducedMotion();
  const [isPresent, safeToRemove] = usePresence();
  const sheetRef = useRef<HTMLDivElement>(null);
  const height = useRef(window.innerHeight);
  // Deslocamento para baixo (px); `fade` só é usado com "reduzir movimento".
  const y = useMotionValue(window.innerHeight);
  const fade = useMotionValue(reduced ? 0 : 1);
  const shown = useTransform(
    [y, fade],
    ([offset = 0, f = 1]: number[]) => Math.max(0, Math.min(1, 1 - offset / height.current)) * f
  );
  const scale = useMotionValue(1);

  useLayoutEffect(() => {
    height.current = sheetRef.current?.offsetHeight || window.innerHeight;
    if (reduced) {
      y.set(0);
      void animate(fade, 1, FADE);
    } else {
      y.set(height.current);
      void animate(y, 0, SPRING);
    }
  }, [reduced, y, fade]);

  // A primeira folha leva o app atrás junto (vira cartão), na mesma posição do dedo ou da mola.
  useEffect(() => {
    if (!drivesBackdrop) return;
    stackSheetProgress.set(shown.get());
    return shown.on('change', (value) => stackSheetProgress.set(value));
  }, [drivesBackdrop, shown]);

  useEffect(() => {
    void animate(scale, receded ? 0.92 : 1, reduced ? FADE : SPRING);
  }, [receded, reduced, scale]);

  useEffect(() => {
    if (isPresent) return;
    const velocity = releaseVelocity.current;
    releaseVelocity.current = undefined;
    const run = reduced
      ? animate(fade, 0, FADE)
      : animate(y, height.current, { ...SPRING, velocity });
    void run.then(() => safeToRemove?.());
    return () => run.stop();
  }, [isPresent, reduced, y, fade, releaseVelocity, safeToRemove]);

  useStackGestures(
    sheetRef,
    { enabled: dismissible && isPresent, canGoBack: false, getScroller: () => sheetRef.current },
    {
      onSheetDrag: (dy) => y.set(dy > 0 ? dy : dy * OVERDRAG_RESISTANCE),
      onSheetRelease: (dy, vy) => {
        if (dy > height.current * SHEET_CLOSE_FRACTION || vy > SHEET_CLOSE_VELOCITY) {
          onDragClose(vy);
        } else {
          void animate(y, 0, reduced ? FADE : { ...SPRING, velocity: vy });
        }
      },
      onPageDragStart: () => undefined,
      onPageDrag: () => undefined,
      onPageRelease: () => undefined,
    }
  );

  return (
    <>
      <Overlay nested={nested} opacity={shown} />
      <Content
        nested={nested}
        dismissible={dismissible}
        sheetRef={sheetRef}
        className={cn(SHEET_BASE, className)}
        style={{ y, scale, opacity: reduced ? fade : 1 }}
      >
        {children}
        <RecedeVeil receded={receded} />
      </Content>
    </>
  );
}

function CenteredCard({ nested, dismissible, receded, className, children }: DialogPanelProps) {
  const [isPresent, safeToRemove] = usePresence();
  const opacity = useMotionValue(0);
  const scale = useMotionValue(0.96);

  useEffect(() => {
    if (isPresent) {
      void animate(opacity, 1, CARD_IN);
      void animate(scale, receded ? 0.96 : 1, CARD_IN);
      return;
    }
    void animate(scale, 0.96, CARD_OUT);
    void animate(opacity, 0, CARD_OUT).then(() => safeToRemove?.());
  }, [isPresent, receded, opacity, scale, safeToRemove]);

  return (
    <>
      <Overlay nested={nested} opacity={opacity} />
      <Content
        nested={nested}
        dismissible={dismissible}
        className={cn(
          'fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-md max-h-[92dvh] overflow-y-auto overscroll-contain p-6 rounded-3xl bg-sheet border border-line shadow-2xl text-ink outline-none',
          className
        )}
        style={{ x: '-50%', y: '-50%', opacity, scale }}
      >
        {children}
        <RecedeVeil receded={receded} />
      </Content>
    </>
  );
}

function RecedeVeil({ receded }: { receded: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={{ opacity: receded ? 1 : 0 }}
      transition={FADE}
      className="pointer-events-none absolute inset-0 rounded-[inherit] bg-recede"
    />
  );
}
