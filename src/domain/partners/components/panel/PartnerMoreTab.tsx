import { ChevronRight } from 'lucide-react';

export interface PartnerMoreEntry {
  id: string;
  title: string;
  hint?: string;
  onOpen: () => void;
}

/** Mais: o que é da conta e não do dia a dia (D27). */
export function PartnerMoreTab({ title, entries }: { title: string; entries: PartnerMoreEntry[] }) {
  return (
    <section aria-labelledby="partner-more-title" className="space-y-4">
      <h2 id="partner-more-title" className="px-1 text-[22px] font-display font-bold text-ink">
        {title}
      </h2>
      <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={entry.onOpen}
              className="press w-full px-4 py-3.5 min-h-16 flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50"
            >
              <span className="flex-1 min-w-0">
                <span className="block text-[15px] font-semibold text-ink">{entry.title}</span>
                {entry.hint && <span className="block text-[13px] text-ink/70">{entry.hint}</span>}
              </span>
              <ChevronRight size={18} className="text-ink/50 shrink-0" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
