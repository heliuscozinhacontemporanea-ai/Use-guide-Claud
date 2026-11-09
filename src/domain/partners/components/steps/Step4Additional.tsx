import { useTranslation } from 'react-i18next';
import { HotelRules } from './additional/HotelRules';
import { LanguagesField } from './additional/LanguagesField';
import { OperatingHoursField } from './additional/OperatingHoursField';
import { type DetailsSectionProps, useDetailsForm } from './details/useDetailsForm';

const WITH_LANGUAGES = ['hotel', 'restaurant', 'sight', 'tour', 'transfer', 'rental'];
// Passeio e translado têm horários próprios em cada oferta.
const WITH_HOURS = ['restaurant', 'sight', 'rental'];

/** Passo 4 da inscrição e do editor: idiomas, regras da hospedagem e horário de funcionamento. */
export function Step4Additional(props: DetailsSectionProps & { categories?: unknown }) {
  const { t } = useTranslation();
  const { formData, updateFieldValue, toggleInList } = useDetailsForm(props);
  const category = formData.category;

  return (
    <div className="space-y-5">
      <h3 className="px-1 text-[17px] font-semibold text-ink">
        {t('partnerSignup.details.additional.title')}
      </h3>
      {WITH_LANGUAGES.includes(category) ? (
        <>
          <LanguagesField
            selected={formData.languages || []}
            onToggle={(value) => toggleInList('languages', value)}
          />
          {category === 'hotel' ? (
            <HotelRules formData={formData} update={updateFieldValue} />
          ) : null}
          {WITH_HOURS.includes(category) ? (
            <OperatingHoursField
              hours={formData.operatingHours}
              onChange={(next) => updateFieldValue('operatingHours', next)}
            />
          ) : null}
        </>
      ) : (
        <p className="px-1 text-[15px] text-ink/70">
          {t('partnerSignup.details.additional.nothing')}
        </p>
      )}
    </div>
  );
}
