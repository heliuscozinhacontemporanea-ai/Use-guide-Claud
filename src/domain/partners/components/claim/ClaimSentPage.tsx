import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';

/** Pedido enviado (D35, tela 7): o anúncio continua no ar como está até a análise. */
export function ClaimSentPage({ name, onOpenPanel }: { name: string; onOpenPanel: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center text-center gap-4 pt-10 pb-6">
      <span className="size-16 grid place-items-center rounded-full bg-partner-soft text-partner">
        <Check size={30} aria-hidden="true" />
      </span>
      <h3 className="text-heading font-display font-bold text-ink">{t('claims.sent.title')}</h3>
      <p className="text-meta text-ink-muted">{t('claims.sent.text', { name })}</p>
      <button type="button" onClick={onOpenPanel} className={`${BUTTON_PRIMARY} w-full min-h-12`}>
        {t('claims.sent.button')}
      </button>
    </div>
  );
}
