import { useCallback, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import type { UsernameProfile } from '../../../user';
import { invitePromoterUseCase } from '../../application/usecases/invitePromoterUseCase';
import type { PromoterEarning } from '../../types/promoter';
import { promoterErrorKey } from '../../utils/promoterErrorKey';
import { UsernamePicker } from '../shared/UsernamePicker';

type EarningType = PromoterEarning['type'];

const INPUT =
  'w-full min-h-12 px-4 rounded-2xl bg-transparent border border-line text-[17px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50';

/** Porcentagem digitada ("10" ou "7,5") em pontos-base; null quando não vale. */
function percentToBasisPoints(raw: string): number | null {
  const value = Number(raw.replace(',', '.'));
  if (!Number.isFinite(value) || value <= 0 || value > 100) return null;
  return Math.round(value * 100);
}

/**
 * Folha Adicionar divulgador (p17): o usuário e quanto ganha (comissão, valor por ingresso ou cachê
 * fixo). O organizador paga direto; o app só calcula e mostra (D27, opção A).
 */
export function AddPromoterSheet({
  open,
  eventListingId,
  onClose,
  onInvited,
}: {
  open: boolean;
  eventListingId: string;
  onClose: () => void;
  onInvited: (username: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const amountId = useId();
  const [found, setFound] = useState<UsernameProfile | null>(null);
  const [type, setType] = useState<EarningType>('commission');
  const [percent, setPercent] = useState('10');
  const [amountMinor, setAmountMinor] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectPromoter = useCallback((profile: UsernameProfile | null) => {
    setFound(profile);
    setError(null);
  }, []);
  const searchFailed = useCallback((err: unknown) => setError(t(promoterErrorKey(err))), [t]);

  useEffect(() => {
    if (open) {
      setFound(null);
      setType('commission');
      setPercent('10');
      setAmountMinor(0);
      setError(null);
    }
  }, [open]);

  const earning: PromoterEarning | null =
    type === 'commission'
      ? (() => {
          const basisPoints = percentToBasisPoints(percent);
          return basisPoints ? { type, basisPoints } : null;
        })()
      : amountMinor > 0
        ? { type, amountMinor }
        : null;

  const send = async () => {
    if (!found || !earning) return;
    setBusy(true);
    setError(null);
    try {
      await invitePromoterUseCase(eventListingId, found.username, earning);
      onInvited(found.username);
    } catch (err: unknown) {
      setError(t(promoterErrorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const option = (value: EarningType, title: string, hint: string) => {
    const checked = type === value;
    return (
      <div
        key={value}
        className="p-4 rounded-2xl border space-y-3 bg-sheet-card border-sheet-card-line"
      >
        <label className="flex items-start gap-3 cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-400/50 rounded-xl">
          <input
            type="radio"
            name="promoter-earning"
            value={value}
            checked={checked}
            onChange={() => setType(value)}
            className="mt-1 w-5 h-5 shrink-0 accent-teal-400"
          />
          <span className="min-w-0">
            <span className="block text-[17px] font-semibold text-ink">{title}</span>
            <span className="block text-[15px] text-ink/70">{hint}</span>
          </span>
        </label>
        {checked && (
          <div className="pl-8 flex items-center gap-3">
            <label htmlFor={amountId} className="sr-only">
              {t(
                value === 'commission'
                  ? 'promoters.sheet.percentLabel'
                  : 'promoters.sheet.amountLabel'
              )}
            </label>
            {value === 'commission' ? (
              <>
                <input
                  id={amountId}
                  inputMode="decimal"
                  value={percent}
                  onChange={(event) =>
                    setPercent(event.target.value.replace(/[^\d.,]/g, '').slice(0, 5))
                  }
                  className={INPUT}
                />
                <span className="text-[17px] text-ink" aria-hidden="true">
                  %
                </span>
              </>
            ) : (
              <input
                id={amountId}
                inputMode="numeric"
                value={amountMinor > 0 ? formatMoneyMinor(amountMinor, i18n.language) : ''}
                placeholder={formatMoneyMinor(0, i18n.language)}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, '').slice(0, 9);
                  setAmountMinor(digits ? Number(digits) : 0);
                }}
                className={INPUT}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={t('promoters.sheet.title')}
      description={t('promoters.sheet.description')}
    >
      <div className="space-y-4">
        <UsernamePicker
          resetKey={open}
          label={t('promoters.sheet.searchLabel')}
          placeholder={t('promoters.sheet.searchPlaceholder')}
          notFound={t('promoters.errors.USERNAME_NOT_FOUND')}
          resultsLabel={t('courtesy.sheet.results')}
          selected={found}
          onSelect={selectPromoter}
          onError={searchFailed}
        />
        <fieldset className="space-y-3">
          <legend className="px-1 mb-2 text-[15px] font-semibold text-ink">
            {t('promoters.sheet.earningLegend')}
          </legend>
          {option(
            'commission',
            t('promoters.sheet.commission'),
            t('promoters.sheet.commissionHint')
          )}
          {option('per_ticket', t('promoters.sheet.perTicket'), t('promoters.sheet.perTicketHint'))}
          {option('flat_fee', t('promoters.sheet.flatFee'), t('promoters.sheet.flatFeeHint'))}
        </fieldset>
        <p className="px-1 text-[15px] text-ink/70">{t('promoters.sheet.rule')}</p>
        {error && (
          <p role="alert">
            <StatusText tone="danger">{error}</StatusText>
          </p>
        )}
        <button
          type="button"
          disabled={!found || !earning || busy}
          onClick={() => void send()}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t('promoters.sheet.send')}
        </button>
      </div>
    </Dialog>
  );
}
