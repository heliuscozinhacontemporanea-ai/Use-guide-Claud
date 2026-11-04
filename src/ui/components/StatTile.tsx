import type { ReactNode } from 'react';

/** Número em destaque com rótulo e linha de apoio (p10, p19). */
export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-[20px] bg-surface border border-line p-4 space-y-1">
      <p className="text-[13px] text-ink/70">{label}</p>
      <p className="text-[24px] leading-tight font-bold text-ink break-words">{value}</p>
      {hint && <p className="text-[13px] text-ink/70">{hint}</p>}
    </div>
  );
}
