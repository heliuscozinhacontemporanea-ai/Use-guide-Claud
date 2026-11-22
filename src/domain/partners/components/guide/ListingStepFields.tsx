import type { ReactElement, ReactNode } from 'react';
import { useId } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { BR_STATES } from '../../../../shared/utils/timeZones';
import { E164PhoneField } from '../../../../ui/components/E164PhoneField';
import { INFO_NOTE_STRONG, InfoNote } from '../../../../ui/components/InfoNote';
import type { DeclinedLink } from '../../types/partnerContent';
import type { FormState } from '../../types/partsForm';
import { listingSellsThroughApp } from '../../utils/listingSells';
import { SIGNUP_HINT, SIGNUP_INPUT, SIGNUP_LABEL } from '../sections/signupStyles';
import { HotelRules } from '../steps/additional/HotelRules';
import { LanguagesField } from '../steps/additional/LanguagesField';
import { OperatingHoursField } from '../steps/additional/OperatingHoursField';
import { TextField } from '../steps/details/DetailFields';
import { HotelDetails } from '../steps/details/HotelDetails';
import { RentalDetails } from '../steps/details/RentalDetails';
import { RestaurantDetails } from '../steps/details/RestaurantDetails';
import { SightDetails } from '../steps/details/SightDetails';
import { TourDetails } from '../steps/details/TourDetails';
import { TransferDetails } from '../steps/details/TransferDetails';
import type { DetailsSectionProps } from '../steps/details/useDetailsForm';
import { PlaceFields } from '../steps/PlaceFields';

// Descrição curta, como no cadastro: o anúncio mostra o começo dela no cartão.
const DESCRIPTION_MAX = 400;
const WITH_HOURS = ['restaurant', 'sight', 'rental'];

const DETAILS: Record<string, (props: DetailsSectionProps) => ReactElement> = {
  hotel: HotelDetails,
  restaurant: RestaurantDetails,
  sight: SightDetails,
  tour: TourDetails,
  transfer: TransferDetails,
  rental: RentalDetails,
};

export interface ListingFieldsProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  declined: ReadonlySet<DeclinedLink>;
  setDeclined: (link: DeclinedLink, declined: boolean) => void;
}

function DeclineBox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="mt-2 flex items-center gap-3 px-1 min-h-11">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="w-5 h-5 shrink-0 accent-[var(--color-partner-fill)] focus-visible:ring-2 focus-visible:ring-teal-400/50"
      />
      <label htmlFor={id} className="text-[15px] text-ink/85">
        {label}
      </label>
    </div>
  );
}

/** Página "Sobre": descrição e idiomas que o parceiro fala (D34). */
export function AboutFields({ form, setForm, errors }: ListingFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <TextField
          id="guide-description"
          label={t('partnerGuide.about.description')}
          multiline
          maxLength={DESCRIPTION_MAX}
          value={form.description}
          onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
          error={errors.description}
        />
        <p className={SIGNUP_HINT}>
          {t('partnerGuide.about.descriptionHint')} · {form.description.length}/{DESCRIPTION_MAX}
        </p>
      </div>
      <LanguagesField
        selected={form.languages ?? []}
        onToggle={(value) =>
          setForm((prev) => {
            const list = prev.languages ?? [];
            return {
              ...prev,
              languages: list.includes(value)
                ? list.filter((entry) => entry !== value)
                : [...list, value],
            };
          })
        }
      />
    </div>
  );
}

/** Página "Onde fica": estado, cidade, endereço, região e Google Maps (D34). */
export function WhereFields({ form, setForm, errors, setErrors }: ListingFieldsProps) {
  const { t } = useTranslation();
  const transfer = form.category === 'transfer';
  return (
    <div className="space-y-6">
      {transfer ? <p className={SIGNUP_HINT}>{t('partnerGuide.where.transferHint')}</p> : null}
      <PlaceFields
        formData={form}
        updateFieldValue={(field, value) => {
          setForm((prev) => ({ ...prev, [field]: value }));
          setErrors((prev) => ({ ...prev, [field]: '' }));
        }}
        getFieldError={(field) => errors[field] || undefined}
      />
      <div>
        <TextField
          id="guide-maps"
          label={t('partnerGuide.where.maps')}
          inputMode="url"
          maxLength={500}
          value={form.googleMaps}
          onChange={(value) => setForm((prev) => ({ ...prev, googleMaps: value }))}
          placeholder={t('partnerGuide.where.mapsPlaceholder')}
          error={errors.googleMaps}
        />
        <p className={SIGNUP_HINT}>{t('partnerGuide.where.mapsHint')}</p>
      </div>
    </div>
  );
}

/** Página de detalhes da categoria; os detalhes de venda ficam na oferta (D34, F3). */
export function DetailsFields(props: ListingFieldsProps & { offersLink?: ReactNode }) {
  const { t } = useTranslation();
  const { form, setForm, errors, setErrors, declined, setDeclined, offersLink } = props;
  const Details = DETAILS[form.category];
  // O que saiu do anúncio e ficou na oferta (F3, D34).
  const saleNote =
    form.category === 'tour'
      ? 'partnerGuide.offer.tourInOffer'
      : form.category === 'rental'
        ? 'partnerGuide.offer.rentalInOffer'
        : form.category === 'transfer'
          ? 'partnerGuide.offer.transferInOffer'
          : form.category === 'sight' && form.sightAccessType === 'pago'
            ? 'partnerGuide.offer.sightPriceInOffer'
            : null;
  const update = (field: keyof FormState, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));
  return (
    <div className="space-y-6">
      {Details ? (
        <Details formData={form} setFormData={setForm} errors={errors} setErrors={setErrors} />
      ) : null}
      {saleNote ? (
        <InfoNote>
          <Trans i18nKey={saleNote} components={{ b: INFO_NOTE_STRONG }} />
        </InfoNote>
      ) : null}
      {offersLink}
      {form.category === 'restaurant' ? (
        <DeclineBox
          label={t('partnerGuide.contacts.noMenu')}
          checked={declined.has('menu')}
          onChange={(checked) => setDeclined('menu', checked)}
        />
      ) : null}
      {form.category === 'hotel' ? (
        <>
          <HotelRules formData={form} update={update} errorOf={(field) => errors[field]} />
          <TextField
            id="guide-booking-link"
            label={t('partnerSignup.step2.booking')}
            placeholder={t('partnerSignup.step2.bookingPlaceholder')}
            inputMode="url"
            maxLength={500}
            value={form.bookingLinks}
            onChange={(value) => update('bookingLinks', value)}
            error={errors.bookingLinks}
          />
        </>
      ) : null}
      {WITH_HOURS.includes(form.category) ? (
        <OperatingHoursField
          hours={form.operatingHours}
          onChange={(next) => update('operatingHours', next)}
        />
      ) : null}
    </div>
  );
}

/** Página "Contatos e links": Instagram e site, cada um com "Não tenho" (D34). */
export function ContactsFields({
  form,
  setForm,
  errors,
  declined,
  setDeclined,
}: ListingFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        {declined.has('instagram') ? null : (
          <TextField
            id="guide-instagram"
            label={t('partnerGuide.contacts.instagram')}
            inputMode="url"
            maxLength={300}
            value={form.instagram}
            onChange={(value) => setForm((prev) => ({ ...prev, instagram: value }))}
            placeholder={t('partnerSignup.step2.instagramPlaceholder')}
            error={errors.instagram}
          />
        )}
        <DeclineBox
          label={t('partnerGuide.contacts.noInstagram')}
          checked={declined.has('instagram')}
          onChange={(checked) => setDeclined('instagram', checked)}
        />
      </div>
      <div>
        {declined.has('website') ? null : (
          <TextField
            id="guide-website"
            label={t('partnerGuide.contacts.site')}
            inputMode="url"
            maxLength={300}
            value={form.website}
            onChange={(value) => setForm((prev) => ({ ...prev, website: value }))}
            placeholder="https://"
            error={errors.website}
          />
        )}
        <DeclineBox
          label={t('partnerGuide.contacts.noSite')}
          checked={declined.has('website')}
          onChange={(checked) => setDeclined('website', checked)}
        />
      </div>
    </div>
  );
}

/** Bloco só do editor (F2): nome, estado e cidade; a categoria aparece, mas não muda. */
export function NameFields({ form, setForm, errors }: ListingFieldsProps) {
  const { t } = useTranslation();
  const stateId = useId();
  const producer = form.category === 'producer';
  return (
    <div className="space-y-6">
      <TextField
        id="guide-name"
        label={producer ? t('partnerGuide.join.nameProducer') : t('partnerGuide.join.name')}
        maxLength={200}
        value={form.businessName}
        onChange={(value) => setForm((prev) => ({ ...prev, businessName: value }))}
        error={errors.businessName}
      />
      {producer ? null : (
        <div>
          <span className={SIGNUP_LABEL}>{t('partnerSignup.step1.question')}</span>
          <p className="min-h-12 px-4 flex items-center rounded-xl border border-line bg-surface text-[15px] text-ink/70">
            {t(`partnerSignup.categories.${form.category}`)}
          </p>
          <p className={SIGNUP_HINT}>{t('partnerSignup.step1.lockedCategory')}</p>
        </div>
      )}
      <fieldset>
        <legend className={SIGNUP_LABEL}>{t('partnerGuide.join.place')}</legend>
        <div className="grid grid-cols-[88px_1fr] gap-2">
          <select
            id={stateId}
            value={form.state ?? ''}
            aria-label={t('partnerGuide.join.state')}
            onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
            className={SIGNUP_INPUT}
          >
            {BR_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <input
            value={form.city ?? ''}
            maxLength={100}
            aria-label={t('partnerGuide.join.city')}
            placeholder={t('partnerGuide.join.city')}
            onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
            className={SIGNUP_INPUT}
          />
        </div>
        <p className={SIGNUP_HINT}>{t('partnerGuide.join.placeHint')}</p>
      </fieldset>
    </div>
  );
}

/** Bloco só do editor (F2): o WhatsApp do negócio, com o mesmo campo do Seja parceiro. */
export function PhoneFields({
  category,
  access,
  phone,
  onChange,
  error,
}: {
  category: string;
  access?: string;
  phone: string | undefined;
  onChange: (phone: string | undefined) => void;
  error?: string;
}) {
  const { t } = useTranslation();
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={SIGNUP_LABEL}>
        {t('partnerGuide.join.phone')}
      </label>
      <E164PhoneField id={id} value={phone} onChange={onChange} />
      <p className={SIGNUP_HINT}>
        {listingSellsThroughApp(category, access)
          ? t('partnerGuide.join.phoneHintSells')
          : t('partnerGuide.join.phoneHintShowcase')}
      </p>
      {error ? <p className="mt-1.5 px-1 text-[13px] text-danger">{error}</p> : null}
    </div>
  );
}
