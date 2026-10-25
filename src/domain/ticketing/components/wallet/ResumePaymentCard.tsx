import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { StripePaymentElement } from '../../../payment';
import { confirmTicketOrderPaymentReturnUseCase } from '../../application/usecases/confirmTicketOrderPaymentReturnUseCase';
import type { ResumingOrder } from '../../hooks/useTicketWalletActions';

interface ResumePaymentCardProps {
  resuming: ResumingOrder;
  onClose: () => void;
  onError: (message: string) => void;
  onPaid: () => Promise<void>;
}

export function ResumePaymentCard({ resuming, onClose, onError, onPaid }: ResumePaymentCardProps) {
  const { t, i18n } = useTranslation();
  const amount = formatMoneyMinor(resuming.order.totalMinor, i18n.language);
  return (
    <GlassCard className="p-4 space-y-4 border-accent-line">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-ink">
            {t('ticketWallet.resume.title', { id: resuming.order.id.slice(0, 8) })}
          </h4>
          <p className="text-xs text-ink/70">{t('ticketCheckout.payment.total', { amount })}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 px-3 rounded-xl bg-surface hover:bg-white/10 text-xs text-ink/80 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('ticketWallet.resume.close')}
        </button>
      </div>
      <StripePaymentElement
        clientSecret={resuming.clientSecret}
        orderId={resuming.order.id}
        submitLabel={t('ticketCheckout.payment.pay', { amount })}
        onError={onError}
        onSuccess={async (paymentIntentId) => {
          // O webhook é a fonte da verdade (AGENTS.md §8.4); a confirmação no retorno só adianta a tela.
          await confirmTicketOrderPaymentReturnUseCase(resuming.order.id, {
            paymentIntentId: paymentIntentId || resuming.paymentIntentId,
          }).catch(() => undefined);
          await onPaid();
        }}
      />
    </GlassCard>
  );
}
