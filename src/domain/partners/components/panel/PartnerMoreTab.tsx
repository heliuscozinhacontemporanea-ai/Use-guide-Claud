import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

export interface PartnerMoreEntry {
  id: string;
  title: string;
  hint?: ReactNode;
  onOpen: () => void;
  /** Ícone antes do título. */
  icon?: ReactNode;
  /** Convite da área de parceiro, no roxo dela (DESIGN.md §2.2). */
  partner?: boolean;
}

/** Lista em grupos (p24): cada grupo é um cartão. */
export function PartnerMoreTab({
  title,
  groups,
  hideTitle = false,
  tourTarget,
  groupTitles = [],
}: {
  title: string;
  groups: PartnerMoreEntry[][];
  /** Título de cada grupo, na mesma posição de `groups` (ex.: "Seu negócio"). */
  groupTitles?: Array<string | undefined>;
  /** Sem título visível: a lista fica abaixo de outra tela (ex.: Ganhos). */
  hideTitle?: boolean;
  /** `data-tour` do primeiro grupo, para o tour do painel. */
  tourTarget?: string;
}) {
  return (
    <section aria-label={title} className="space-y-6">
      {!hideTitle && <h2 className="px-1 text-[22px] font-display font-bold text-ink">{title}</h2>}
      {groups
        .map((group, index) => ({ group, groupTitle: groupTitles[index] }))
        .filter(({ group }) => group.length > 0)
        .map(({ group, groupTitle }, index) => (
          <div key={group[0]?.id} className="space-y-2">
            {groupTitle && (
              <h3 className="px-1 text-[13px] font-semibold uppercase tracking-wide text-ink/70">
                {groupTitle}
              </h3>
            )}
            <ul
              data-tour={index === 0 ? tourTarget : undefined}
              className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden"
            >
              {group.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={entry.onOpen}
                    className="press w-full px-4 py-3.5 min-h-16 flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50"
                  >
                    {entry.icon && (
                      <span className={entry.partner ? 'text-partner' : 'text-ink/70'}>
                        {entry.icon}
                      </span>
                    )}
                    <span className="flex-1 min-w-0">
                      <span
                        className={`block text-[15px] font-semibold ${entry.partner ? 'text-partner' : 'text-ink'}`}
                      >
                        {entry.title}
                      </span>
                      {entry.hint && (
                        <span className="block text-[13px] text-ink/70">{entry.hint}</span>
                      )}
                    </span>
                    <ChevronRight size={18} className="text-ink/50 shrink-0" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </section>
  );
}
