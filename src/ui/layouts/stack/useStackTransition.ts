import { animate, type MotionValue, useMotionValue, useReducedMotion } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { FADE, SPRING } from '../../motion/tokens';
import type { StackEntry } from './stackTypes';

export interface StackLayers {
  /** Tela de cima (a que entra, ou a que sai ao voltar). */
  top: StackEntry;
  /** Tela de baixo, visível só durante a troca ou o arraste. */
  under: StackEntry | null;
}

const keysOf = (entries: StackEntry[]) => entries.map((entry) => entry.key);
const isPrefix = (short: string[], long: string[]) => short.every((key, i) => long[i] === key);

/**
 * Troca de telas da pilha (DESIGN.md §9.1): `progress` vai de 0 (a de cima fora, à direita) a 1 (no
 * lugar). Avançar anima 0 → 1; voltar mantém a tela que sai em cima e anima até 0, partindo de onde o
 * dedo a deixou (`releaseVelocity`).
 */
export function useStackTransition(entries: StackEntry[], onPopped?: () => void) {
  const reduced = useReducedMotion();
  const progress = useMotionValue(1);
  const [leaving, setLeaving] = useState<StackEntry | null>(null);
  const [moving, setMoving] = useState(false);
  // Pilha da última troca. A troca é detectada durante a renderização (e não depois, num efeito) para
  // a tela que sai continuar montada: antes ela sumia e era montada de novo para a animação de saída,
  // e o primeiro quadro da volta engasgava.
  const [shown, setShown] = useState(() => ({ signature: keysOf(entries).join('/'), entries }));
  const pending = useRef<'push' | 'pop' | 'jump' | null>(null);
  const releaseVelocity = useRef<number | undefined>(undefined);
  const popped = useRef(onPopped);
  popped.current = onPopped;
  const keySignature = keysOf(entries).join('/');

  let currentLeaving = leaving;
  let currentMoving = moving;
  if (shown.signature !== keySignature) {
    const before = keysOf(shown.entries);
    const after = keysOf(entries);
    const outgoing = shown.entries[shown.entries.length - 1];
    if (after.length === before.length + 1 && isPrefix(before, after)) {
      pending.current = 'push';
      currentLeaving = null;
      currentMoving = true;
      // Já no primeiro desenho a tela nova está fora, à direita: o valor muda aqui, durante a
      // renderização, porque as posições das telas são calculadas nela. Num efeito, o primeiro quadro
      // mostrava a tela nova no lugar e ela saltava para fora antes de deslizar.
      progress.jump(0);
    } else if (after.length < before.length && isPrefix(after, before) && outgoing) {
      pending.current = 'pop';
      currentLeaving = outgoing;
      currentMoving = true;
    } else {
      pending.current = 'jump';
      currentLeaving = null;
      currentMoving = false;
      progress.jump(1);
    }
    setShown({ signature: keySignature, entries });
    setLeaving(currentLeaving);
    setMoving(currentMoving);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: a animação só começa quando a pilha muda de telas.
  useLayoutEffect(() => {
    const kind = pending.current;
    pending.current = null;
    if (!kind) return;
    const velocity = releaseVelocity.current;
    releaseVelocity.current = undefined;
    const transition = reduced ? FADE : { ...SPRING, velocity };
    if (kind === 'push') {
      void animate(progress, 1, transition).then(() => setMoving(false));
    } else if (kind === 'pop') {
      void animate(progress, 0, transition).then(() => {
        setLeaving(null);
        setMoving(false);
        progress.set(1);
        popped.current?.();
      });
    }
  }, [keySignature]);

  const top = currentLeaving ?? entries[entries.length - 1];
  if (!top) throw new Error('StackSheet precisa de ao menos uma tela.');
  const underIndex = currentLeaving ? entries.length - 1 : entries.length - 2;
  const layers: StackLayers = {
    top,
    under: (currentMoving && entries[underIndex]) || null,
  };

  return {
    layers,
    progress: progress as MotionValue<number>,
    /** O dedo começou a arrastar a tela de cima: a de baixo aparece. */
    beginDrag: () => setMoving(true),
    /** Soltou sem voltar: a tela de cima volta para o lugar. */
    settle: (velocity: number) => {
      void animate(progress, 1, reduced ? FADE : { ...SPRING, velocity }).then(() =>
        setMoving(false)
      );
    },
    /** Soltou voltando: guarda a velocidade do dedo para a troca que vem com a pilha nova. */
    rememberReleaseVelocity: (velocity: number) => {
      releaseVelocity.current = velocity;
    },
  };
}
