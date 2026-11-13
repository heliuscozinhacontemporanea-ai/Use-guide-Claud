import { useState } from 'react';

/**
 * Verdadeiro desde a primeira vez que `open` fica verdadeiro. Monta uma tela sob demanda só quando
 * ela é pedida e a mantém montada depois, para a animação de saída continuar funcionando.
 */
export function useOpenedOnce(open: boolean): boolean {
  const [opened, setOpened] = useState(open);
  if (open && !opened) setOpened(true);
  return opened || open;
}
