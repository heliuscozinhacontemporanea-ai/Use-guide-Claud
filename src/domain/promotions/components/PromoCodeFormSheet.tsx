import { placeTimeFormNote } from '../../../shared/utils/placeTime';
import { PLATFORM_TIME_ZONE } from '../../../shared/utils/timeZones';
import { type ReactNode, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../shared/utils/money';
import { Dialog } from '../../../ui/components/Dialog';
import { SegmentedControl } from '../../../ui/components/SegmentedControl';
import { StatusText } from '../../../ui/components/StatusText';
import { Switch } from '../../../ui/components/Switch';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import { savePromoCodeUseCase } from '../application/usecases/savePromoCodeUseCase';
import { updatePromoCodeLimitsUseCase } from '../application/usecases/updatePromoCodeLimitsUseCase';
import {
  PROMO_MAX_PERCENT,
  type PartnerPromoCode,
  type PromoListingTarget,
} from '../types/promoCode';
import { promoCodeErrorKey } from '../utils/promoCodeErrorKey';
import { draftFromPromo, inputFromDraft, type PromoFormDraft } from '../utils/promoForm';
import { PromoTargetsField } from './PromoTargetsField';

const INPUT =
  'w-full min-h-12 px-4 rounded-2xl bg-transparent border border-line text-[17px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 disabled:opacity-60';

/** Linha com interruptor e, ligada, o campo do número. */
function Toggle({
  title,
  hint,
  checked,
  onChange,
  disabled,
  children,
}: {
  title: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
  children?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="px-4 py-3 rounded-2xl border bg-sheet-card border-sheet-card-line space-y-2">
      <div className="flex items-center gap-3">
        <span className="flex-1 min-w-0">
          <span id={`${id}-t`} className="block text-[16px] font-semibold text-ink">
            {title}
          </span>
          <span id={`${id}-h`} className="block text-[14px] text-ink/70">
            {hint}
          </span>
        </span>
        <Switch
          checked={checked}
          onChange={onChange}
          labelledBy={`${id}-t`}
          describedBy={`${id}-h`}
          disabled={disabled}
        />
      </div>
      {checked && children}
    </div>
  );
}

/**
 * Criar ou editar cupom (B1). Antes do primeiro uso muda tudo; depois, só o limite de usos e o fim
 * (os outros campos aparecem travados, para a pessoa ver a regra que vale).
 */
export function PromoCodeFormSheet({
  open,
  promo,
  targets,
  defaultTargetKey,
  onClose,
  onSaved,
}: {
  open: boolean;
  promo: PartnerPromoCode | null;
  targets: PromoListingTarget[];
  /** `kind:id` do anúncio de onde a área foi aberta: já vem marcado. */
  defaultTargetKey: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, i18n } = useTranslation();
  const periodNote = placeTimeFormNote(t, { timeZone: PLATFORM_TIME_ZONE, city: 'Brasília' });
  const ids = { code: useId(), value: useId(), start: useId(), end: useId() };
  const [draft, setDraft] = useState<PromoFormDraft>(() => draftFromPromo(promo, defaultTargetKey));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = promo?.locked ?? false;
  const set = (patch: Partial<PromoFormDraft>) => setDraft((current) => ({ ...current, ...patch }));

  useEffect(() => {
    if (open) {
      setDraft(draftFromPromo(promo, defaultTargetKey));
      setError(null);
    }
  }, [open, promo, defaultTargetKey]);

  const save = async () => {
    const built = inputFromDraft(draft, promo?.usedCount ?? 0);
    if ('error' in built) {
      setError(t(`promoCodes.form.errors.${built.error}`));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (promo && locked) {
        await updatePromoCodeLimitsUseCase(promo.id, {
          maxUses: built.input.maxUses,
          endsAt: built.input.endsAt,
        });
      } else {
        await savePromoCodeUseCase(built.input, promo?.id);
      }
      onSaved();
    } catch (err: unknown) {
      setError(t(promoCodeErrorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const label = 'block px-1 mb-2 text-[15px] font-semibold text-ink';
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={t(promo ? 'promoCodes.form.editTitle' : 'promoCodes.form.createTitle')}
      description={t(locked ? 'promoCodes.sheet.lockedHint' : 'promoCodes.form.description')}
    >
      <div className="space-y-5">
        <div>
          <label htmlFor={ids.code} className={label}>
            {t('promoCodes.form.code')}
          </label>
          <input
            id={ids.code}
            value={draft.code}
            disabled={locked}
            onChange={(event) =>
              set({
                code: event.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, '')
                  .slice(0, 20),
              })
            }
            placeholder={t('promoCodes.form.codePlaceholder')}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className={`${INPUT} font-semibold tracking-wide`}
          />
        </div>

        <fieldset disabled={locked} className="space-y-3 disabled:opacity-60">
          <legend className={label}>{t('promoCodes.form.discount')}</legend>
          <SegmentedControl
            label={t('promoCodes.form.discount')}
            value={draft.type}
            onChange={(type) => set({ type })}
            options={[
              { value: 'percentage', label: t('promoCodes.form.percentage') },
              { value: 'fixed', label: t('promoCodes.form.fixed') },
            ]}
          />
          <div className="flex items-center gap-3">
            <label htmlFor={ids.value} className="sr-only">
              {t(
                draft.type === 'percentage'
                  ? 'promoCodes.form.percentLabel'
                  : 'promoCodes.form.valueLabel'
              )}
            </label>
            {draft.type === 'percentage' ? (
              <>
                <input
                  id={ids.value}
                  inputMode="numeric"
                  value={draft.percent}
                  onChange={(event) =>
                    set({ percent: event.target.value.replace(/\D/g, '').slice(0, 2) })
                  }
                  className={INPUT}
                />
                <span className="text-[17px] text-ink" aria-hidden="true">
                  %
                </span>
              </>
            ) : (
              <input
                id={ids.value}
                inputMode="numeric"
                value={
                  draft.valueMinor > 0 ? formatMoneyMinor(draft.valueMinor, i18n.language) : ''
                }
                placeholder={formatMoneyMinor(0, i18n.language)}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, '').slice(0, 9);
                  set({ valueMinor: digits ? Number(digits) : 0 });
                }}
                className={INPUT}
              />
            )}
          </div>
          <p className="px-1 text-[14px] text-ink/70">
            {t(
              draft.type === 'percentage'
                ? 'promoCodes.form.percentHint'
                : 'promoCodes.form.fixedHint',
              { max: PROMO_MAX_PERCENT }
            )}
          </p>
        </fieldset>

        <PromoTargetsField
          targets={targets}
          value={draft.targets}
          onChange={(targets) => set({ targets })}
          disabled={locked}
        />

        <div className="space-y-2">
          <p className={label}>{t('promoCodes.form.limits')}</p>
          <Toggle
            title={t('promoCodes.form.limitUses')}
            hint={t('promoCodes.form.limitUsesHint')}
            checked={draft.limitUses}
            onChange={(limitUses) => set({ limitUses })}
            disabled={false}
          >
            <input
              aria-label={t('promoCodes.form.maxUsesLabel')}
              inputMode="numeric"
              value={draft.maxUses}
              onChange={(event) =>
                set({ maxUses: event.target.value.replace(/\D/g, '').slice(0, 6) })
              }
              className={INPUT}
            />
          </Toggle>
          <Toggle
            title={t('promoCodes.form.onePerAccount')}
            hint={t('promoCodes.form.onePerAccountHint')}
            checked={draft.onePerAccount}
            onChange={(onePerAccount) => set({ onePerAccount })}
            disabled={locked}
          />
          {draft.type === 'percentage' && (
            <Toggle
              title={t('promoCodes.form.limitTickets')}
              hint={t('promoCodes.form.limitTicketsHint')}
              checked={draft.limitTickets}
              onChange={(limitTickets) => set({ limitTickets })}
              disabled={locked}
            >
              <input
                aria-label={t('promoCodes.form.maxTicketsLabel')}
                inputMode="numeric"
                disabled={locked}
                value={draft.maxTickets}
                onChange={(event) =>
                  set({ maxTickets: event.target.value.replace(/\D/g, '').slice(0, 2) })
                }
                className={INPUT}
              />
            </Toggle>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor={ids.start} className={label}>
              {t('promoCodes.form.startsAt')}
            </label>
            <input
              id={ids.start}
              type="datetime-local"
              disabled={locked}
              value={draft.startsAt}
              onChange={(event) => set({ startsAt: event.target.value })}
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor={ids.end} className={label}>
              {t('promoCodes.form.endsAt')}
            </label>
            <input
              id={ids.end}
              type="datetime-local"
              value={draft.endsAt}
              onChange={(event) => set({ endsAt: event.target.value })}
              className={INPUT}
            />
          </div>
        </div>
        <p className="px-1 text-[14px] text-ink/70">{t('promoCodes.form.periodHint')}</p>
        {/* O cupom vale para anúncios de vários lugares: o período é no fuso da plataforma (D28). */}
        {periodNote && <p className="px-1 text-[14px] text-ink/70">{periodNote}</p>}

        {error && (
          <p role="alert">
            <StatusText tone="danger">{error}</StatusText>
          </p>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t(promo ? 'promoCodes.form.save' : 'promoCodes.form.create')}
        </button>
      </div>
    </Dialog>
  );
}
