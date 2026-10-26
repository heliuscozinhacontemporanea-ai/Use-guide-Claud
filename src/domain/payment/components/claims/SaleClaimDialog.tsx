import { Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { openSaleClaimUseCase } from '../../application/usecases/openSaleClaimUseCase';
import {
  type BuyerSaleClaim,
  type ClaimableSale,
  SALE_CLAIM_REASONS,
  type SaleClaimReason,
} from '../../types/saleClaims';
import { saleClaimErrorKey } from '../../utils/saleClaimErrors';

const MAX_DETAILS = 500;

export function SaleClaimDialog({
  sale,
  open,
  onClose,
  onOpened,
}: {
  sale: ClaimableSale;
  open: boolean;
  onClose: () => void;
  onOpened: (claim: BuyerSaleClaim) => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [reason, setReason] = useState<SaleClaimReason | null>(null);
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reason) return setError(t('saleClaims.dialog.reasonRequired'));
    setSending(true);
    setError(null);
    try {
      const claim = await openSaleClaimUseCase({
        referenceType: sale.referenceType,
        referenceId: sale.referenceId,
        reason,
        ...(details.trim() ? { details: details.trim() } : {}),
      });
      onOpened(claim);
    } catch (err) {
      setError(t(saleClaimErrorKey(err)));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={t('saleClaims.dialog.title')}
      description={t('saleClaims.dialog.description')}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <fieldset className="space-y-2">
          <legend className="text-xs font-bold text-ink mb-1.5">
            {t('saleClaims.dialog.reasonLabel')}
          </legend>
          {SALE_CLAIM_REASONS.map((value) => (
            <label
              key={value}
              className="press min-h-11 px-3 py-2.5 rounded-xl border border-line bg-surface flex items-center gap-3 text-sm text-ink cursor-pointer has-[:checked]:border-accent-line has-[:checked]:bg-accent-soft focus-within:ring-2 focus-within:ring-teal-400/50"
            >
              <input
                type="radio"
                name={`${id}-reason`}
                value={value}
                checked={reason === value}
                onChange={() => {
                  setReason(value);
                  setError(null);
                }}
                className="w-4 h-4 accent-teal-500"
              />
              {t(`saleClaims.reason.${value}`)}
            </label>
          ))}
        </fieldset>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-details`} className="text-xs font-bold text-ink">
            {t('saleClaims.dialog.detailsLabel')}
          </label>
          <textarea
            id={`${id}-details`}
            value={details}
            maxLength={MAX_DETAILS}
            rows={4}
            onChange={(event) => setDetails(event.target.value)}
            aria-describedby={`${id}-details-hint`}
            className="w-full p-3 rounded-xl bg-surface border border-line text-sm text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
          />
          <p id={`${id}-details-hint`} className="text-[11px] text-ink/70">
            {t('saleClaims.dialog.detailsHint', { max: MAX_DETAILS })}
          </p>
        </div>
        {error && (
          <p
            role="alert"
            className="p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="press w-full min-h-12 rounded-xl bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {sending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {t(sending ? 'saleClaims.dialog.sending' : 'saleClaims.dialog.submit')}
        </button>
      </form>
    </Dialog>
  );
}
