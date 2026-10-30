import { AlertCircle, Loader2 } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { Dialog } from '../../../../ui/components/Dialog';
import { decideSaleClaimUseCase } from '../../application/usecases/decideSaleClaimUseCase';
import type { AdminSaleClaim, SaleClaimOutcome } from '../../types/adminFinance';
import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceErrors';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';

const OUTCOMES: SaleClaimOutcome[] = ['release', 'refund_full', 'refund_partial'];

const OPTION =
  'press min-h-14 px-4 py-2.5 rounded-2xl bg-ink/[0.04] flex items-center gap-3 text-sm text-ink cursor-pointer has-[:checked]:bg-accent-soft has-[:checked]:ring-1 has-[:checked]:ring-accent-line focus-within:ring-2 focus-within:ring-teal-400/50';

/** Decisão do admin (D16, 2A); o backend recalcula os valores e confere a multa. */
export function SaleClaimDecisionDialog({
  claim,
  onClose,
  onDecided,
  renderEvidence,
}: {
  claim: AdminSaleClaim | null;
  onClose: () => void;
  onDecided: (message: string) => void;
  /** Slot da composição para as provas do serviço (D20). */
  renderEvidence?: (claim: AdminSaleClaim) => ReactNode;
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
      title={claim?.title ?? t('adminFinance.claims.decideTitle')}
      description={
        claim
          ? [claim.sellerName ?? t('adminFinance.unknownSeller'), claim.maskedDocument]
              .filter(Boolean)
              .join(' · ')
          : undefined
      }
    >
      {claim && (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="p-4 rounded-2xl bg-ink/[0.04] space-y-1.5">
            <p className="text-[13px] font-semibold text-warn flex items-center gap-1.5">
              <AlertCircle size={15} aria-hidden="true" />
              {t(`saleClaims.reason.${claim.reason}`)}
            </p>
            {claim.details && (
              <p className="text-sm text-ink/80 whitespace-pre-line break-words">
                “{claim.details}”
              </p>
            )}
            <p className="text-[12px] text-ink/60">
              {t('adminFinance.claims.meta', {
                opened: formatBusinessDay(claim.openedAt, i18n.language),
                paid: money(claim.grossMinor),
              })}
              {claim.serviceEndsAt &&
                ` · ${t('adminFinance.claims.metaEnd', {
                  date: formatBusinessDay(claim.serviceEndsAt, i18n.language),
                })}`}
            </p>
          </div>
          {renderEvidence?.(claim)}
          <p className="text-[12px] text-ink/60">{t('adminFinance.claims.decideDescription')}</p>
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
                  className="w-4 h-4 shrink-0 accent-teal-500"
                />
                <span className="space-y-0.5">
                  <span className="block font-semibold">
                    {t(`adminFinance.claims.outcome.${value}`, {
                      amount: money(claim.refundableMinor),
                    })}
                  </span>
                  <span className="block text-[13px] text-ink/70">
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
            <label className="press min-h-14 px-4 py-2.5 rounded-2xl bg-ink/[0.04] flex items-center justify-between gap-3 cursor-pointer focus-within:ring-2 focus-within:ring-teal-400/50">
              <span className="space-y-0.5">
                <span className="block text-sm font-semibold text-ink">
                  {t('adminFinance.claims.penaltyLabel')}
                </span>
                <span className="block text-[13px] text-ink/70">
                  {t('adminFinance.claims.penaltyHint')}
                </span>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={chargePenalty}
                onChange={(event) => setChargePenalty(event.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="relative w-11 h-6 shrink-0 rounded-full bg-ink/20 transition-colors peer-checked:bg-teal-500 after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-surface-solid after:shadow after:transition-[translate] peer-checked:after:translate-x-5"
              />
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
            className={`${BUTTON_PRIMARY} w-full min-h-12 text-[15px] flex items-center justify-center gap-2`}
          >
            {sending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {t(sending ? 'adminFinance.sending' : 'adminFinance.claims.submit')}
          </button>
        </form>
      )}
    </Dialog>
  );
}
