import { motion, useReducedMotion, useTransform } from 'motion/react';
import { type ReactNode, useState } from 'react';
import { Z_INDEX } from '../shared/constants/zIndex';
import { readSafeAreaTop } from '../ui/motion/safeAreaTop';
import { stackSheetProgress } from '../ui/motion/stackSheetProgress';
import { CARD_RADIUS_PX, CARD_SCALE } from '../ui/motion/tokens';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * O app inteiro vira cartão atrás da folha em pilha (DESIGN.md §9.1, D33): encolhe, desce até a área
 * segura, arredonda os cantos e recebe o véu `recede`, no mesmo movimento da folha (inclusive no arraste).
 */
export function BackdropCard({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [top] = useState(() => Math.max(readSafeAreaTop(), 16));
  const scale = useTransform(stackSheetProgress, (p) =>
    reduced ? 1 : 1 - (1 - CARD_SCALE) * clamp01(p)
  );
  const y = useTransform(stackSheetProgress, (p) => (reduced ? 0 : top * clamp01(p)));
  // Canto aparece pronto (não se anima o raio, DESIGN.md P9).
  const borderRadius = useTransform(stackSheetProgress, (p) =>
    !reduced && p > 0.001 ? CARD_RADIUS_PX : 0
  );
  const veil = useTransform(stackSheetProgress, clamp01);
  return (
    <motion.div
      style={{ scale, y, borderRadius, transformOrigin: 'top center' }}
      className="relative h-full overflow-hidden bg-app"
    >
      {children}
      <motion.div
        aria-hidden="true"
        style={{ opacity: veil, zIndex: Z_INDEX.popover }}
        className="pointer-events-none absolute inset-0 bg-recede"
      />
    </motion.div>
  );
}
