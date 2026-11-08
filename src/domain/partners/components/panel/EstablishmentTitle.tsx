import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Nome do estabelecimento (ou "Todos") no topo do Início. Com um estabelecimento só não há o que
 * escolher: fica só o nome, sem seta (D27).
 */
export function EstablishmentTitle({
  name,
  canChoose,
  otherPending,
  onOpen,
  compact = false,
}: {
  name: string;
  /** "Todos os estabelecimentos" é longo: um tamanho menor cabe numa linha (p37). */
  compact?: boolean;
  canChoose: boolean;
  /** Outro estabelecimento, fora do filtro, tem item em "Resolva agora". */
  otherPending: boolean;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const title = (
    <span
      className={`${compact ? 'text-[22px]' : 'text-[28px]'} font-display font-bold text-ink leading-tight`}
    >
      {name}
    </span>
  );
  if (!canChoose) return <h1>{title}</h1>;
  return (
    <h1>
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        data-tour="establishment"
        aria-label={`${name}. ${t('partnerPanel.filter.open')}`}
        className="press inline-flex items-center gap-1.5 min-h-11 rounded-xl text-left focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        {title}
        <ChevronDown size={22} className="text-ink shrink-0" aria-hidden="true" />
        {otherPending && (
          <span className="w-2 h-2 rounded-full bg-danger shrink-0" aria-hidden="true" />
        )}
      </button>
    </h1>
  );
}
