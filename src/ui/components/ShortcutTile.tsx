import type { ReactNode } from 'react';

interface ShortcutTileProps {
  icon: ReactNode;
  label: string;
  /** Número em destaque; `null` enquanto carrega. */
  value: string | null;
  hint: string;
  onClick: () => void;
}

/** Atalho em cartão com um número (D19): Ingressos, Reservas, Favoritos, Avaliações. */
export function ShortcutTile({ icon, label, value, hint, onClick }: ShortcutTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press p-4 min-h-[116px] rounded-[20px] bg-surface border border-line text-left flex flex-col gap-3 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
    >
      <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
        {icon}
      </span>
      <span>
        <span className="block text-[15px] font-semibold text-ink">{label}</span>
        <span className="block text-[13px] text-ink/70">
          {value === null ? (
            <span
              className="inline-block w-10 h-3 rounded bg-ink/10 align-middle"
              aria-hidden="true"
            />
          ) : (
            <>
              <span className="font-semibold text-ink">{value}</span> {hint}
            </>
          )}
        </span>
      </span>
    </button>
  );
}
