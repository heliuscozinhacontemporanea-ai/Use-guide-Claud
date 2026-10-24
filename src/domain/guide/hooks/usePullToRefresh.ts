import { useEffect, useRef, useState } from 'react';

// O círculo se forma por completo com 76 px de puxão.
export const PULL_REFRESH_THRESHOLD = 76;

/** Puxar para atualizar no topo da rolagem (toque e mouse). Recarrega a página ao soltar. */
export function usePullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef<number | null>(null);
  const startXRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const isMouseActiveRef = useRef(false);

  useEffect(() => {
    const scrollContainer = document.querySelector<HTMLElement>('.overflow-y-auto');
    if (!scrollContainer) return;

    const handleStart = (clientY: number, clientX: number, isMouse: boolean) => {
      if (isRefreshing) return;
      if (
        document.documentElement.classList.contains('scroll-locked') ||
        scrollContainer.style.overflowY === 'hidden'
      )
        return;

      // Só inicia se estiver no topo absoluto da rolagem (scrollTop <= 0)
      if (scrollContainer.scrollTop <= 0) {
        startYRef.current = clientY;
        startXRef.current = clientX;
        isPullingRef.current = true;
        isMouseActiveRef.current = isMouse;
      }
    };

    const handleMove = (clientY: number, clientX: number, e: TouchEvent | MouseEvent) => {
      if (!isPullingRef.current || isRefreshing) return;
      if (startYRef.current === null || startXRef.current === null) return;

      const deltaY = clientY - startYRef.current;
      const deltaX = clientX - startXRef.current;

      // Se mover horizontalmente mais do que verticalmente, cancela o puxão
      // Isso evita acidentes ao arrastar carrosséis de banners
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        isPullingRef.current = false;
        setIsPulling(false);
        setPullDistance(0);
        return;
      }

      if (deltaY > 0) {
        if (scrollContainer.scrollTop <= 0) {
          if (e.cancelable) {
            e.preventDefault();
          }
          // Resistência elástica amortecida
          const distance = Math.min(deltaY * 0.42, 120);
          setPullDistance(distance);
          setIsPulling(true);
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    };

    const handleEnd = () => {
      if (!isPullingRef.current || isRefreshing) return;
      isPullingRef.current = false;
      isMouseActiveRef.current = false;

      if (pullDistance >= PULL_REFRESH_THRESHOLD) {
        // Dispara o reload um pouco depois para o sumiço visual terminar
        setTimeout(() => {
          window.location.reload();
        }, 150);

        // Zera o estado para o círculo sumir instantaneamente com transição elástica ao soltar
        setPullDistance(0);
        setIsPulling(false);
        setIsRefreshing(false);
      } else {
        // Retorno elástico suave à posição inicial
        const current = pullDistance;
        const duration = 200;
        const startTime = performance.now();

        const animateBack = (time: number) => {
          const elapsed = time - startTime;
          const pct = Math.min(elapsed / duration, 1);
          const ease = 1 - (1 - pct) ** 3; // ease-out cubic
          const val = current * (1 - ease);

          if (pct < 1) {
            setPullDistance(val);
            requestAnimationFrame(animateBack);
          } else {
            setPullDistance(0);
            setIsPulling(false);
          }
        };
        requestAnimationFrame(animateBack);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      handleStart(touch.clientY, touch.clientX, false);
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      handleMove(touch.clientY, touch.clientX, e);
    };

    const onTouchEnd = () => {
      handleEnd();
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Apenas clique esquerdo
      handleStart(e.clientY, e.clientX, true);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseActiveRef.current) return;
      handleMove(e.clientY, e.clientX, e);
    };

    const onMouseUp = () => {
      if (isMouseActiveRef.current) {
        handleEnd();
      }
    };

    scrollContainer.addEventListener('touchstart', onTouchStart, { passive: true });
    scrollContainer.addEventListener('touchmove', onTouchMove, { passive: false });
    scrollContainer.addEventListener('touchend', onTouchEnd, { passive: true });

    scrollContainer.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp, { passive: true });

    return () => {
      scrollContainer.removeEventListener('touchstart', onTouchStart);
      scrollContainer.removeEventListener('touchmove', onTouchMove);
      scrollContainer.removeEventListener('touchend', onTouchEnd);

      scrollContainer.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [pullDistance, isRefreshing]);

  return { pullDistance, isPulling, isRefreshing };
}
