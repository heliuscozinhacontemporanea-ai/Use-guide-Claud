import { useEffect } from 'react';

/**
 * Trava a rolagem da página atrás de um editor aberto. No celular, o teclado desloca o cabeçalho;
 * ao sair de um campo, a página volta ao topo.
 */
export function useEditorScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    const handleFocusOut = () => {
      setTimeout(() => {
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.getAttribute('contenteditable') === 'true')
        ) {
          return;
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 120);
    };
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('focusout', handleFocusOut);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
  }, [active]);
}
