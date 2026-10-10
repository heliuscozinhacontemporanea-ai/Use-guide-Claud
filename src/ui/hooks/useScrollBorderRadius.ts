import { useRef } from 'react';
import { useScroll, useTransform } from 'motion/react';

export function useScrollBorderRadius() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: containerRef });

  // Interpola a curvatura de 0px (borda reta no início) até 40px (rounded-[2.5rem] correspondente à borda do card)
  const borderRadius = useTransform(scrollY, [0, 100], ['0px', '40px']);

  return { containerRef, borderRadius, scrollY };
}
