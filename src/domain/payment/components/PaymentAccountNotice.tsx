import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../ui/components/Dialog';
import { PartnerStripeConnectPortal } from './PartnerStripeConnectPortal';

/**
 * Aviso de uma linha para telas de venda: a configuração financeira abre numa folha, em vez de um
 * cartão de Recebimentos dentro da lista (planos de cor empilhados).
 */
export function PaymentAccountNotice({
  message,
  onClosed,
}: {
  message: string;
  /** Ao fechar a folha, a tela de venda relê o status das contas. */
  onClosed?: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-warn-soft border border-warn-line">
        <AlertTriangle size={16} className="shrink-0 text-warn" aria-hidden="true" />
        <p className="flex-1 min-w-[12rem] text-xs text-warn">{message}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="press min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('receivables.notice.open')}
        </button>
      </div>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) onClosed?.();
        }}
        title={t('paymentAccounts.title')}
        description={t('paymentAccounts.subtitle')}
        className="sm:max-w-2xl"
      >
        <PartnerStripeConnectPortal bare />
      </Dialog>
    </>
  );
}
