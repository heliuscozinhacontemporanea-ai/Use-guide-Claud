import { useEffect } from 'react';

let activeLockCount = 0;

export function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (!scrollContainer) return;

    activeLockCount++;
    if (activeLockCount === 1) {
      (scrollContainer as HTMLElement).style.overflowY = 'hidden';
      document.documentElement.classList.add('scroll-locked');
    }

    return () => {
      activeLockCount = Math.max(0, activeLockCount - 1);
      if (activeLockCount === 0) {
        (scrollContainer as HTMLElement).style.overflowY = '';
        document.documentElement.classList.remove('scroll-locked');
      }
    };
  }, [isOpen]);
}
