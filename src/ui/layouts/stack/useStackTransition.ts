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
export function useStackTransition(entries: StackEntry[]) {
  const reduced = useReducedMotion();
  const progress = useMotionValue(1);
  const [leaving, setLeaving] = useState<StackEntry | null>(null);
  const [moving, setMoving] = useState(false);
  const previous = useRef(entries);
  const releaseVelocity = useRef<number | undefined>(undefined);
  const keySignature = keysOf(entries).join('/');

  // biome-ignore lint/correctness/useExhaustiveDependencies: a troca só acontece quando a pilha muda de telas; renders com as mesmas telas só atualizam o conteúdo.
  useLayoutEffect(() => {
    const before = keysOf(previous.current);
    const after = keysOf(entries);
    const outgoing = previous.current[previous.current.length - 1];
    previous.current = entries;
    const velocity = releaseVelocity.current;
    releaseVelocity.current = undefined;
    const transition = reduced ? FADE : { ...SPRING, velocity };

    if (after.length === before.length + 1 && isPrefix(before, after)) {
      setLeaving(null);
      setMoving(true);
      progress.set(0);
      void animate(progress, 1, transition).then(() => setMoving(false));
      return;
    }
    if (after.length < before.length && isPrefix(after, before) && outgoing) {
      setLeaving(outgoing);
      setMoving(true);
      void animate(progress, 0, transition).then(() => {
        setLeaving(null);
        setMoving(false);
        progress.set(1);
      });
      return;
    }
    setLeaving(null);
    setMoving(false);
    progress.set(1);
  }, [keySignature]);

  const top = leaving ?? entries[entries.length - 1];
  if (!top) throw new Error('StackSheet precisa de ao menos uma tela.');
  const underIndex = leaving ? entries.length - 1 : entries.length - 2;
  const layers: StackLayers = {
    top,
    under: (moving && entries[underIndex]) || null,
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
