import { useRef, useEffect } from 'react';
import { useMotionValue, animate } from 'motion/react';

interface UseSwipeToCloseOptions {
  onClose: () => void;
  enabled?: boolean;
  threshold?: number;
  velocityThreshold?: number;
}

export function useSwipeToClose({
  onClose,
  enabled = true,
  threshold = 90,
  velocityThreshold = -0.4,
}: UseSwipeToCloseOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const isSwipeClosingRef = useRef(false);

  const touchState = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    isTracking: false,
    direction: null as 'horizontal' | 'vertical' | null,
    isInteractive: false,
  });

  useEffect(() => {
    if (enabled) {
      isSwipeClosingRef.current = false;
      x.set(0);
    }
  }, [enabled, x]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || isSwipeClosingRef.current) return;

      const target = e.target as HTMLElement | null;
      // Previne disparo acidental ao tocar em botões, links, inputs ou áreas de controle
      const isInteractiveTarget = Boolean(
        target?.closest(
          'button, a, input, textarea, select, [role="button"], [data-interactive="true"], .interactive-element'
        )
      );

      const touch = e.touches[0];
      if (!touch) return;
      touchState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        currentX: 0,
        isTracking: !isInteractiveTarget,
        direction: null,
        isInteractive: isInteractiveTarget,
      };

      if (!isInteractiveTarget) {
        x.stop();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (
        !touchState.current.isTracking ||
        touchState.current.isInteractive ||
        isSwipeClosingRef.current
      )
        return;

      const touch = e.touches[0];
      if (!touch) return;
      const deltaX = touch.clientX - touchState.current.startX;
      const deltaY = touch.clientY - touchState.current.startY;

      // Identifica intenção de rolagem vertical vs arrasto lateral
      if (!touchState.current.direction) {
        if (Math.abs(deltaY) > 8 && Math.abs(deltaY) > Math.abs(deltaX)) {
          touchState.current.direction = 'vertical';
          touchState.current.isTracking = false;
          return;
        }
        if (deltaX < -10 && Math.abs(deltaX) > Math.abs(deltaY)) {
          touchState.current.direction = 'horizontal';
        } else if (deltaX > 10) {
          touchState.current.isTracking = false;
          return;
        }
      }

      if (touchState.current.direction === 'horizontal') {
        if (deltaX < 0) {
          touchState.current.currentX = deltaX;
          x.set(deltaX);
          if (e.cancelable) {
            e.preventDefault();
          }
        }
      }
    };

    const handleTouchEnd = () => {
      if (
        !touchState.current.isTracking ||
        touchState.current.isInteractive ||
        isSwipeClosingRef.current
      ) {
        return;
      }

      const { startTime, currentX, direction } = touchState.current;
      touchState.current.isTracking = false;

      if (direction !== 'horizontal' || currentX >= 0) {
        animate(x, 0, {
          type: 'spring',
          stiffness: 450,
          damping: 35,
        });
        return;
      }

      const duration = Date.now() - startTime;
      const velocity = duration > 0 ? currentX / duration : 0;
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 500;

      if (currentX < -threshold || (velocity < velocityThreshold && currentX < -30)) {
        isSwipeClosingRef.current = true;
        animate(x, -screenWidth, {
          duration: 0.22,
          ease: [0.32, 0.72, 0, 1],
          onComplete: () => {
            onClose();
          },
        });
      } else {
        animate(x, 0, {
          type: 'spring',
          stiffness: 450,
          damping: 35,
        });
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled, onClose, threshold, velocityThreshold, x]);

  return { containerRef, x, isSwipeClosingRef };
}
