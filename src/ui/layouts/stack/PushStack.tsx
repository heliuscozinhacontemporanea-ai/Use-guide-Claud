import { useRef } from 'react';
import { StackPages } from './StackPages';
import type { StackEntry } from './stackTypes';

/**
 * Páginas empilhadas em tela cheia (DESIGN.md §9.1, P10, D33): a mesma pilha da folha do Perfil,
 * sem a folha. A primeira entrada é a tela de base (com o próprio topo, `bare`); as outras entram da
 * direita com a mola, têm a barra fixa e voltam arrastando da esquerda para a direita.
 */
export function PushStack({
  entries,
  backLabel,
  onBack,
}: {
  entries: StackEntry[];
  backLabel: string;
  onBack: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={containerRef} className="fixed inset-0 flex flex-col bg-app">
      <StackPages
        containerRef={containerRef}
        entries={entries}
        backLabel={backLabel}
        onBack={onBack}
      />
    </div>
  );
}
