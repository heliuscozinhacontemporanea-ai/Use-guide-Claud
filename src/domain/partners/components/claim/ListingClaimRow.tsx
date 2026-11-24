import { ChevronRight, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Fim do anúncio cadastrado pelo Use Guide (D35, 3b e escolhas dos prints): uma linha discreta, mas com
 * cara de botão. Só aparece em lugar do Use Guide; a composição decide.
 */
export function ListingClaimRow({ onClaim }: { onClaim: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClaim}
      className="press w-full min-h-[52px] flex items-center gap-3 px-4 rounded-card bg-surface border border-line text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
    >
      <Store size={20} className="shrink-0 text-ink-muted" aria-hidden="true" />
      <span className="flex-1 min-w-0 text-meta text-ink">{t('claims.row.question')}</span>
      <span className="shrink-0 inline-flex items-center gap-0.5 text-meta font-semibold text-partner">
        {t('claims.row.action')}
        <ChevronRight size={16} aria-hidden="true" />
      </span>
    </button>
  );
}
