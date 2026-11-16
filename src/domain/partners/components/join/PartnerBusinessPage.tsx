import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { BR_STATES } from '../../../../shared/utils/timeZones';
import { E164PhoneField } from '../../../../ui/components/E164PhoneField';
import { StatusText } from '../../../../ui/components/StatusText';
import { LISTING_CATEGORIES } from '../../constants/listingCategories';
import {
  type PartnerJoinDraft,
  type PartnerJoinField,
  partnerJoinErrors,
} from '../../utils/partnerJoinDraft';
import { listingSellsThroughApp } from '../../utils/listingSells';
import {
  SIGNUP_CHOICE,
  SIGNUP_CHOICE_OFF,
  SIGNUP_CHOICE_ON,
  SIGNUP_ERROR,
  SIGNUP_HINT,
  SIGNUP_INPUT,
  SIGNUP_LABEL,
} from '../sections/signupStyles';

/**
 * "Seu negócio" (D34): o que oferece, nome, estado e cidade, WhatsApp e o aceite dos Termos do
 * parceiro, numa tela só. O resto entra depois, pelo guia de passos do painel.
 */
export function PartnerBusinessPage({
  draft,
  onChange,
  onSubmit,
  onOpenTerms,
  submitting,
  error,
  requireTerms = true,
  categories,
  submitLabel,
  submittingLabel,
  laterText,
}: {
  draft: PartnerJoinDraft;
  onChange: (draft: PartnerJoinDraft) => void;
  onSubmit: () => void;
  onOpenTerms: () => void;
  submitting: boolean;
  error: string | null;
  /** Novo estabelecimento pelo painel (F2): os Termos já foram aceitos no Seja parceiro. */
  requireTerms?: boolean;
  /** Categorias que podem ser escolhidas (padrão: todas). */
  categories?: string[];
  submitLabel?: string;
  submittingLabel?: string;
  laterText?: string;
}) {
  const { t } = useTranslation();
  const ids = { name: useId(), state: useId(), city: useId(), phone: useId(), terms: useId() };
  const [shown, setShown] = useState<PartnerJoinField[]>([]);
  const producer = draft.category === 'producer';
  const sells = listingSellsThroughApp(draft.category);
  const set = (patch: Partial<PartnerJoinDraft>) => onChange({ ...draft, ...patch });
  const errorOf = (field: PartnerJoinField) =>
    shown.includes(field) && partnerJoinErrors(draft, { requireTerms }).includes(field);

  const submit = () => {
    const errors = partnerJoinErrors(draft, { requireTerms });
    setShown(errors);
    if (errors.length === 0) onSubmit();
  };

  return (
    <div className="space-y-6 pb-6">
      <fieldset>
        <legend className={SIGNUP_LABEL}>{t('partnerGuide.join.offer')}</legend>
        <div className="grid grid-cols-2 gap-2">
          {LISTING_CATEGORIES.filter(
            (category) => !categories || categories.includes(category.id)
          ).map((category) => {
            const on = draft.category === category.id;
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={on}
                onClick={() => set({ category: category.id })}
                className={cn(
                  SIGNUP_CHOICE,
                  'min-h-12 px-3.5 flex items-center gap-2.5 text-left text-[15px]',
                  on ? SIGNUP_CHOICE_ON : SIGNUP_CHOICE_OFF
                )}
              >
                <span className={on ? 'text-partner' : 'text-ink/60'}>{category.icon}</span>
                {t(`partnerSignup.categories.${category.id}`)}
              </button>
            );
          })}
        </div>
        {errorOf('category') ? (
          <p className={SIGNUP_ERROR}>{t('partnerSignup.errors.categoryRequired')}</p>
        ) : null}
      </fieldset>

      <div>
        <label htmlFor={ids.name} className={SIGNUP_LABEL}>
          {producer ? t('partnerGuide.join.nameProducer') : t('partnerGuide.join.name')}
        </label>
        <input
          id={ids.name}
          value={draft.name}
          maxLength={200}
          autoComplete="organization"
          onChange={(event) => set({ name: event.target.value })}
          placeholder={
            producer
              ? t('partnerGuide.join.namePlaceholderProducer')
              : t('partnerGuide.join.namePlaceholder')
          }
          aria-invalid={errorOf('name') || undefined}
          className={SIGNUP_INPUT}
        />
        {errorOf('name') ? (
          <p className={SIGNUP_ERROR}>{t('partnerGuide.join.errors.name')}</p>
        ) : null}
      </div>

      <fieldset>
        <legend className={SIGNUP_LABEL}>{t('partnerGuide.join.place')}</legend>
        <div className="grid grid-cols-[88px_1fr] gap-2">
          <select
            id={ids.state}
            value={draft.state}
            aria-label={t('partnerGuide.join.state')}
            onChange={(event) => set({ state: event.target.value })}
            className={SIGNUP_INPUT}
          >
            {BR_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <input
            id={ids.city}
            value={draft.city}
            maxLength={100}
            autoComplete="address-level2"
            aria-label={t('partnerGuide.join.city')}
            placeholder={t('partnerGuide.join.city')}
            onChange={(event) => set({ city: event.target.value })}
            aria-invalid={errorOf('city') || undefined}
            className={SIGNUP_INPUT}
          />
        </div>
        <p className={SIGNUP_HINT}>{t('partnerGuide.join.placeHint')}</p>
        {errorOf('city') ? (
          <p className={SIGNUP_ERROR}>{t('partnerGuide.join.errors.city')}</p>
        ) : null}
      </fieldset>

      <div>
        <label htmlFor={ids.phone} className={SIGNUP_LABEL}>
          {t('partnerGuide.join.phone')}
        </label>
        <E164PhoneField
          id={ids.phone}
          value={draft.phone || undefined}
          onChange={(phone) => set({ phone: phone ?? '' })}
        />
        <p className={SIGNUP_HINT}>
          {sells ? t('partnerGuide.join.phoneHintSells') : t('partnerGuide.join.phoneHintShowcase')}
        </p>
        {errorOf('phone') ? (
          <p className={SIGNUP_ERROR}>{t('partnerGuide.join.errors.phone')}</p>
        ) : null}
      </div>

      {requireTerms ? (
        <div>
          <div className="flex items-start gap-3 px-1">
            <input
              id={ids.terms}
              type="checkbox"
              checked={draft.terms}
              onChange={(event) => set({ terms: event.target.checked })}
              aria-invalid={errorOf('terms') || undefined}
              className="mt-0.5 w-5 h-5 shrink-0 accent-[var(--color-partner-fill)]"
            />
            <span className="text-[15px] text-ink/85">
              <label htmlFor={ids.terms}>{t('partnerGuide.join.termsBefore')}</label>{' '}
              <button
                type="button"
                onClick={onOpenTerms}
                className="press underline underline-offset-2 text-partner font-medium focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
              >
                {t('partnerGuide.join.termsLink')}
              </button>
            </span>
          </div>
          {errorOf('terms') ? (
            <p className={SIGNUP_ERROR}>{t('partnerGuide.join.errors.terms')}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3 pt-2">
        <p className="text-center text-[13px] text-ink/70">
          {laterText ?? t('partnerGuide.join.later')}
        </p>
        {error ? (
          <p role="alert">
            <StatusText tone="danger">{error}</StatusText>
          </p>
        ) : null}
        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="press w-full min-h-[52px] rounded-2xl bg-partner-fill text-on-fill text-[16px] font-semibold disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
        >
          {submitting
            ? (submittingLabel ?? t('partnerGuide.join.creating'))
            : (submitLabel ?? t('partnerGuide.join.create'))}
        </button>
      </div>
    </div>
  );
}
