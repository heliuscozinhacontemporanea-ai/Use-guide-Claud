import { useEffect, useRef } from 'react';

const KEY = 'ugSheets';

function openSheets(): string[] {
  const state = window.history.state as Record<string, unknown> | null;
  const value = state?.[KEY];
  return Array.isArray(value) ? (value as string[]) : [];
}

/**
 * Folha aberta entra no histórico (DESIGN.md P19): o voltar do Android, o gesto do iPhone e o voltar
 * do navegador fecham só a folha de cima. Fechar pelo `X`, pelo arraste ou pelo código também tira a
 * entrada, para o voltar seguinte não reabrir nada.
 *
 * A entrada repete a URL e o estado do React Router (`usr`, `key`, `idx`) e só acrescenta a lista de
 * folhas abertas; por isso o roteador trata a volta como uma troca sem mudança de página.
 */
export function useSheetHistory(id: string, open: boolean, onPopped: () => void) {
  const pushed = useRef(false);
  const mounted = useRef(true);
  const latestPopped = useRef(onPopped);
  latestPopped.current = onPopped;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (open) {
      // StrictMode roda o efeito duas vezes: a entrada só é criada uma vez.
      if (!openSheets().includes(id)) {
        const state = (window.history.state as Record<string, unknown> | null) ?? {};
        window.history.pushState({ ...state, [KEY]: [...openSheets(), id] }, '');
      }
      pushed.current = true;
      const onPop = () => {
        if (!pushed.current || openSheets().includes(id)) return;
        pushed.current = false;
        latestPopped.current();
      };
      window.addEventListener('popstate', onPop);
      return () => window.removeEventListener('popstate', onPop);
    }
    if (pushed.current) {
      pushed.current = false;
      if (openSheets().at(-1) === id) window.history.back();
    }
  }, [id, open]);

  // Desmontou aberta (a tela que a continha saiu): tira a entrada, se ela ainda for a de cima. O atraso
  // deixa o StrictMode remontar antes, e aí nada acontece.
  useEffect(
    () => () => {
      window.setTimeout(() => {
        if (!mounted.current && pushed.current && openSheets().at(-1) === id) {
          pushed.current = false;
          window.history.back();
        }
      }, 0);
    },
    [id]
  );
}
