import { Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { Dialog } from '../../../../ui/components/Dialog';
import { decideSaleClaimUseCase } from '../../application/usecases/decideSaleClaimUseCase';
import type { AdminSaleClaim, SaleClaimOutcome } from '../../types/adminFinance';
import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceErrors';
import { PRIMARY_BUTTON } from './adminFinanceStyles';

const OUTCOMES: SaleClaimOutcome[] = ['release', 'refund_full', 'refund_partial'];

const OPTION =
  'press min-h-11 px-3 py-2.5 rounded-xl border border-line bg-surface flex items-start gap-3 text-sm text-ink cursor-pointer has-[:checked]:border-accent-line has-[:checked]:bg-accent-soft focus-within:ring-2 focus-within:ring-teal-400/50';

/** Decisão do admin (D16, 2A); o backend recalcula os valores e confere a multa. */
export function SaleClaimDecisionDialog({
  claim,
  onClose,
  onDecided,
}: {
  claim: AdminSaleClaim | null;
  onClose: () => void;
  onDecided: (message: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const [outcome, setOutcome] = useState<SaleClaimOutcome | null>(null);
  const [partialMinor, setPartialMinor] = useState(0);
  const [chargePenalty, setChargePenalty] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const money = (value: number) => formatMoneyMinor(value, i18n.language);
  // A multa do cancelamento silencioso só vale quando o serviço não aconteceu (D16).
  const penaltyAllowed = claim?.reason === 'did_not_happen' && outcome === 'refund_full';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!claim) return;
    if (!outcome) return setError(t('adminFinance.claims.outcomeRequired'));
    if (
      outcome === 'refund_partial' &&
      (partialMinor <= 0 || partialMinor > claim.maxPartialRefundMinor)
    ) {
      return setError(
        t('adminFinance.claims.partialInvalid', { max: money(claim.maxPartialRefundMinor) })
      );
    }
    setSending(true);
    setError(null);
    try {
      await decideSaleClaimUseCase(claim.id, {
        outcome,
        ...(outcome === 'refund_partial' ? { amountMinor: partialMinor } : {}),
        ...(penaltyAllowed && chargePenalty ? { chargePenalty: true } : {}),
      });
      onDecided(t(`adminFinance.claims.decided.${outcome}`));
    } catch (err) {
      setError(t(adminFinanceErrorKey(errorCodeOf(err))));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={claim !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('adminFinance.claims.decideTitle')}
      description={t('adminFinance.claims.decideDescription')}
    >
      {claim && (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <fieldset className="space-y-2">
            <legend className="text-xs font-bold text-ink mb-1.5">
              {t('adminFinance.claims.outcomeLabel')}
            </legend>
            {OUTCOMES.map((value) => (
              <label key={value} className={OPTION}>
                <input
                  type="radio"
                  name={`${id}-outcome`}
                  value={value}
                  checked={outcome === value}
                  onChange={() => {
                    setOutcome(value);
                    setError(null);
                  }}
                  className="w-4 h-4 mt-0.5 accent-teal-500"
                />
                <span className="space-y-0.5">
                  <span className="block font-bold">
                    {t(`adminFinance.claims.outcome.${value}`, {
                      amount: money(claim.refundableMinor),
                    })}
                  </span>
                  <span className="block text-xs text-ink/70">
                    {t(`adminFinance.claims.outcomeHint.${value}`, {
                      max: money(claim.maxPartialRefundMinor),
                    })}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
          {outcome === 'refund_partial' && (
            <div className="space-y-1.5">
              <label htmlFor={`${id}-amount`} className="text-xs font-bold text-ink">
                {t('adminFinance.claims.partialLabel')}
              </label>
              <input
                id={`${id}-amount`}
                inputMode="numeric"
                value={partialMinor > 0 ? money(partialMinor) : ''}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, '').slice(0, 9);
                  setPartialMinor(digits ? Number.parseInt(digits, 10) : 0);
                }}
                className="w-full min-h-11 px-3 rounded-xl bg-surface border border-line text-sm text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
              />
            </div>
          )}
          {penaltyAllowed && (
            <label className={OPTION}>
              <input
                type="checkbox"
                checked={chargePenalty}
                onChange={(event) => setChargePenalty(event.target.checked)}
                className="w-4 h-4 mt-0.5 accent-teal-500"
              />
              <span className="space-y-0.5">
                <span className="block font-bold">{t('adminFinance.claims.penaltyLabel')}</span>
                <span className="block text-xs text-ink/70">
                  {t('adminFinance.claims.penaltyHint')}
                </span>
              </span>
            </label>
          )}
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
            className={`${PRIMARY_BUTTON} w-full min-h-12 text-sm flex items-center justify-center gap-2`}
          >
            {sending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {t(sending ? 'adminFinance.sending' : 'adminFinance.claims.submit')}
          </button>
        </form>
      )}
    </Dialog>
  );
}
