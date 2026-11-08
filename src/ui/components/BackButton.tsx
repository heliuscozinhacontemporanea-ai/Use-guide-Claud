import { ChevronLeft } from 'lucide-react';

/** Voltar no topo das telas (D17): só o chevron, sem caixa, com área de toque de 44 px. */
export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="press w-11 h-11 -ml-2 shrink-0 rounded-full flex items-center justify-center text-ink/80 hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50"
    >
      <ChevronLeft size={26} strokeWidth={2.25} aria-hidden="true" />
    </button>
  );
}
