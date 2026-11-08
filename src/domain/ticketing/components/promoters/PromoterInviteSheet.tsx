import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatSessionLabel } from '../../../../shared/utils/businessDateTime';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { respondPromoterInviteUseCase } from '../../application/usecases/respondPromoterInviteUseCase';
import type { MyPromotion } from '../../types/promoter';
import { promoterEarningText } from '../../utils/promoterEarningText';
import { promoterErrorKey } from '../../utils/promoterErrorKey';

/** Convite para divulgar (p27): o que ganha, quem paga e as regras, antes de aceitar (D27). */
export function PromoterInviteSheet({
  promotion,
  onClose,
  onAnswered,
}: {
  promotion: MyPromotion | null;
  onClose: () => void;
  onAnswered: (accepted: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const business = promotion?.businessName ?? t('serviceProof.buyer.businessFallback');

  const answer = async (accept: boolean) => {
    if (!promotion) return;
    setBusy(true);
    setError(null);
    try {
      await respondPromoterInviteUseCase(promotion.id, accept);
      onAnswered(accept);
    } catch (err: unknown) {
      setError(t(promoterErrorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const rows: Array<[string, string]> = promotion
    ? [
        [
          t('promoters.invite.event'),
          promotion.startsAt ? formatSessionLabel(promotion.startsAt, i18n.language) : '',
        ],
        [t('promoters.invite.earns'), promoterEarningText(t, promotion.earning, i18n.language)],
        [t('promoters.invite.payer'), t('promoters.invite.payerValue', { business })],
      ]
    : [];

  return (
    <Dialog
      open={promotion !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('promoters.invite.title')}
      description={
        promotion
          ? t('promoters.invite.description', { business, event: promotion.eventTitle })
          : undefined
      }
    >
      <div className="space-y-4">
        <dl className="p-4 rounded-2xl bg-sheet-card border border-sheet-card-line space-y-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="text-[15px] text-ink/70">{label}</dt>
              <dd className="text-[15px] font-semibold text-ink text-right">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="px-1 text-[15px] text-ink/70">{t('promoters.invite.rule')}</p>
        {error && (
          <p role="alert">
            <StatusText tone="danger">{error}</StatusText>
          </p>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void answer(true)}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t('promoters.invite.accept')}
        </button>
        <div className="flex justify-center">
          <button
            type="button"
            disabled={busy}
            onClick={() => void answer(false)}
            className="press min-h-11 px-3 rounded-xl text-[15px] font-semibold text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {t('promoters.invite.decline')}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
