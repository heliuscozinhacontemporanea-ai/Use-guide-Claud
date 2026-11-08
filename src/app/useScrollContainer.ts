import { type RefObject, useEffect, useRef, useState } from 'react';

interface ScrollContainerState {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  isScrolled: boolean;
}

/**
 * Guarda e restaura a altura da rolagem por rota e avisa o cabeçalho quando a página rolou.
 * Espera os itens assíncronos montarem antes de aplicar a posição salva.
 */
export function useScrollContainer(pathname: string): ScrollContainerState {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});
  const lastPathname = useRef(pathname);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (lastPathname.current !== pathname) {
      scrollPositions.current[lastPathname.current] = container.scrollTop;
    }

    const savedPosition = scrollPositions.current[pathname] || 0;

    let attempts = 0;
    const maxAttempts = 15;
    const scrollInterval = setInterval(() => {
      const currentMaxScroll = container.scrollHeight - container.clientHeight;
      const canReachSaved = currentMaxScroll >= savedPosition;

      if (canReachSaved || attempts >= maxAttempts) {
        container.scrollTo({
          top: Math.min(savedPosition, currentMaxScroll),
          behavior: 'auto',
        });
        clearInterval(scrollInterval);
      }
      attempts++;
    }, 100);

    lastPathname.current = pathname;

    return () => clearInterval(scrollInterval);
  }, [pathname]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 10);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { scrollContainerRef, isScrolled };
}
