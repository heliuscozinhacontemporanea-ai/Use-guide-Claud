import { useTranslation } from 'react-i18next';
import { cn } from '../../../../../shared/utils/cn';
import type { FormState } from '../../../types/partsForm';
import { SIGNUP_LABEL } from '../../sections/signupStyles';
import { YesNoField } from '../details/DetailFields';
import { TimeRangeField } from './TimeRangeField';

type AdditionalKey =
  | 'checkIn'
  | 'checkOut'
  | 'from'
  | 'until'
  | 'children'
  | 'pets'
  | 'petsYes'
  | 'petsOnRequest'
  | 'petsNo'
  | 'petsCost'
  | 'petsFree'
  | 'petsPaid';

// Valores gravados em português (débito registrado); só o rótulo é traduzido.
const PETS: { value: string; key: AdditionalKey }[] = [
  { value: 'Sim', key: 'petsYes' },
  { value: 'Mediante pedido', key: 'petsOnRequest' },
  { value: 'Não', key: 'petsNo' },
];
const PET_COST: { value: string; key: AdditionalKey }[] = [
  { value: 'Gratuito', key: 'petsFree' },
  { value: 'Custos extras', key: 'petsPaid' },
];

function Choice({
  label,
  options,
  value,
  onChange,
  stacked,
}: {
  label: string;
  options: { value: string; text: string }[];
  value: string;
  onChange: (value: string) => void;
  stacked?: boolean;
}) {
  return (
    <fieldset>
      <legend className={SIGNUP_LABEL}>{label}</legend>
      <div className={cn('flex gap-2', stacked && 'flex-col')}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'press flex-1 min-h-11 px-4 rounded-xl border text-[15px] font-medium flex items-center focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
              stacked ? 'text-left' : 'justify-center',
              value === option.value
                ? 'bg-partner-soft border-partner text-ink'
                : 'bg-surface border-line text-ink/80'
            )}
          >
            {option.text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Regras da hospedagem: horários de check-in/out, crianças e pets. */
export function HotelRules({
  formData,
  update,
}: {
  formData: FormState;
  update: (field: keyof FormState, value: unknown) => void;
}) {
  const { t } = useTranslation();
  const a = (key: AdditionalKey) => t(`partnerSignup.details.additional.${key}`);
  const allowsPets = formData.petsPolicy === 'Sim' || formData.petsPolicy === 'Mediante pedido';

  return (
    <>
      <TimeRangeField
        id="check-in"
        label={a('checkIn')}
        fromLabel={a('from')}
        toLabel={a('until')}
        from={formData.checkInFrom || ''}
        to={formData.checkInTo || ''}
        onFrom={(value) => update('checkInFrom', value)}
        onTo={(value) => update('checkInTo', value)}
      />
      <TimeRangeField
        id="check-out"
        label={a('checkOut')}
        fromLabel={a('from')}
        toLabel={a('until')}
        from={formData.checkOutFrom || ''}
        to={formData.checkOutTo || ''}
        onFrom={(value) => update('checkOutFrom', value)}
        onTo={(value) => update('checkOutTo', value)}
      />
      <YesNoField
        label={a('children')}
        value={formData.childrenAllowed}
        onChange={(value) => update('childrenAllowed', value)}
      />
      <Choice
        label={a('pets')}
        stacked
        options={PETS.map(({ value, key }) => ({ value, text: a(key) }))}
        value={formData.petsPolicy}
        onChange={(value) => {
          update('petsPolicy', value);
          if (value === 'Não') update('petsExtraCost', '');
        }}
      />
      {allowsPets ? (
        <Choice
          label={a('petsCost')}
          options={PET_COST.map(({ value, key }) => ({ value, text: a(key) }))}
          value={formData.petsExtraCost}
          onChange={(value) => update('petsExtraCost', value)}
        />
      ) : null}
    </>
  );
}
