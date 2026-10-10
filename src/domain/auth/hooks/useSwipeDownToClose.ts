import { useRef, useEffect } from 'react';
import { useMotionValue, animate } from 'motion/react';
import { useUIStore } from '../../../shared/stores/useUIStore';

interface UseSwipeDownToCloseOptions {
  onClose?: () => void;
  enabled?: boolean;
  threshold?: number;
  velocityThreshold?: number;
}

export function useSwipeDownToClose({
  onClose,
  enabled = true,
  threshold = 90,
  velocityThreshold = 0.4,
}: UseSwipeDownToCloseOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const y = useMotionValue(0);
  const isSwipeClosingRef = useRef(false);

  const touchState = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentY: 0,
    isTracking: false,
    direction: null as 'horizontal' | 'vertical' | null,
    isInteractive: false,
    initialScrollTop: 0,
  });

  useEffect(() => {
    if (enabled) {
      isSwipeClosingRef.current = false;
      y.set(0);
    }
  }, [enabled, y]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled || !onClose) return;

    const getScrollTop = () => {
      const scrollableChild = el.querySelector<HTMLElement>('[data-scroll-container="true"]') || el;
      return scrollableChild.scrollTop;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || isSwipeClosingRef.current) return;

      const target = e.target as HTMLElement | null;
      const isDragHandle = Boolean(target?.closest('[data-drag-handle="true"]'));

      const isInteractiveTarget =
        !isDragHandle &&
        Boolean(
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
        currentY: 0,
        isTracking: !isInteractiveTarget,
        direction: null,
        isInteractive: isInteractiveTarget,
        initialScrollTop: getScrollTop(),
      };

      if (!isInteractiveTarget) {
        y.stop();
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
      const currentScrollTop = getScrollTop();

      // Se o conteúdo interno estiver rolado para baixo, permite a rolagem natural
      if (currentScrollTop > 0 && touchState.current.initialScrollTop > 0) {
        return;
      }

      if (!touchState.current.direction) {
        if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
          touchState.current.direction = 'horizontal';
          touchState.current.isTracking = false;
          return;
        }
        if (deltaY > 8 && Math.abs(deltaY) > Math.abs(deltaX)) {
          touchState.current.direction = 'vertical';
        } else if (deltaY < -8) {
          touchState.current.isTracking = false;
          return;
        }
      }

      if (touchState.current.direction === 'vertical') {
        if (deltaY > 0 && currentScrollTop <= 0) {
          touchState.current.currentY = deltaY;
          y.set(deltaY);
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

      const { startTime, currentY, direction } = touchState.current;
      touchState.current.isTracking = false;

      if (direction !== 'vertical' || currentY <= 0) {
        animate(y, 0, {
          type: 'spring',
          stiffness: 450,
          damping: 35,
        });
        return;
      }

      const duration = Date.now() - startTime;
      const velocity = duration > 0 ? currentY / duration : 0;
      const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

      if (currentY > threshold || (velocity > velocityThreshold && currentY > 30)) {
        isSwipeClosingRef.current = true;
        useUIStore.getState().setLoginClosingBySwipe(true);
        animate(y, screenHeight, {
          duration: 0.22,
          ease: [0.32, 0.72, 0, 1],
          onComplete: () => {
            onClose();
            useUIStore.getState().setLoginClosingBySwipe(false);
          },
        });
      } else {
        animate(y, 0, {
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
  }, [enabled, onClose, threshold, velocityThreshold, y]);

  return { containerRef, y, isSwipeClosingRef };
}
