import { useReducedMotion } from 'motion/react';
import { type RefObject, useEffect, useState } from 'react';

export type PreaPhase = 'rest' | 'run' | 'slow' | 'hop';

const NEXT: Record<PreaPhase, PreaPhase> = { rest: 'run', run: 'slow', slow: 'hop', hop: 'rest' };

const PHASE_MS: Record<PreaPhase, number> = { rest: 3200, run: 6000, slow: 900, hop: 700 };

// Animações da corrida (roda, patas, balanço e areia): a velocidade sobe e desce aos poucos.
const GAIT = new Set([
  'ug-prea-wheel-spin',
  'ug-prea-leg-front',
  'ug-prea-leg-back',
  'ug-prea-bob',
  'ug-prea-dust',
]);
const RAMP_UP_MS = 700;
const RAMP_DOWN_MS = PHASE_MS.slow;

function gaitAnimations(root: Element): Animation[] {
  if (typeof root.getAnimations !== 'function' || typeof CSSAnimation === 'undefined') return [];
  return root
    .getAnimations({ subtree: true })
    .filter((animation) => animation instanceof CSSAnimation && GAIT.has(animation.animationName));
}

function rampGait(root: Element, from: number, to: number, ms: number): () => void {
  const start = performance.now();
  let frame = requestAnimationFrame(function step(now) {
    const progress = Math.min(1, (now - start) / ms);
    const eased = 1 - (1 - progress) ** 2;
    for (const animation of gaitAnimations(root)) {
      animation.playbackRate = from + (to - from) * eased;
    }
    if (progress < 1) frame = requestAnimationFrame(step);
  });
  return () => cancelAnimationFrame(frame);
}

/**
 * Sequência do preá: fareja sentado, arranca, corre 6 s, freia e dá um pulinho. A roda acelera
 * e freia junto (playbackRate das animações CSS). Com movimento reduzido, fica sentado e parado.
 */
export function usePreaChoreography(rootRef: RefObject<Element | null>): PreaPhase {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<PreaPhase>('rest');

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setTimeout(() => setPhase(NEXT[phase]), PHASE_MS[phase]);
    const root = rootRef.current;
    const stopRamp =
      root && phase === 'run'
        ? rampGait(root, 0, 1, RAMP_UP_MS)
        : root && phase === 'slow'
          ? rampGait(root, 1, 0, RAMP_DOWN_MS)
          : undefined;
    return () => {
      window.clearTimeout(timer);
      stopRamp?.();
    };
  }, [phase, reducedMotion, rootRef]);

  return reducedMotion ? 'rest' : phase;
}
