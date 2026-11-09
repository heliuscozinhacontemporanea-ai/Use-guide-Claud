import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BUTTON_SECONDARY } from '../../../../../ui/styles/controls';
import { RequiredMark, SignupError } from '../../sections/SignupFieldParts';
import { SIGNUP_LABEL } from '../../sections/signupStyles';
import { ChipGroup, type DetailOptions, TextField } from './DetailFields';
import type { FieldKey, PlaceholderKey } from './detailKeys';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const TRANSFER_VEHICLES: DetailOptions = {
  car: 'Carro',
  pickup4x4: 'Caminhonete 4x4',
  van: 'Van',
  minibus: 'Micro-ônibus',
  jardineira: 'Jardineira',
  buggy: 'Buggy',
};

const MAX_ROUTES = 30;

/** Campos da inscrição de translado: trechos, veículos e capacidade (decisão D9). */
export function TransferDetails(props: DetailsSectionProps) {
  const { t } = useTranslation();
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);
  const f = (key: FieldKey) => t(`partnerSignup.details.fields.${key}`);
  const p = (key: PlaceholderKey) => t(`partnerSignup.details.placeholders.${key}`);
  const routes = formData.transferRoutes;
  const routesError = getFieldError('transferRoutes');

  const setRoute = (index: number, field: 'from' | 'to', value: string) => {
    updateFieldValue(
      'transferRoutes',
      routes.map((route, i) => (i === index ? { ...route, [field]: value } : route))
    );
  };

  return (
    <div className="space-y-5">
      <fieldset className="space-y-3">
        <legend className={SIGNUP_LABEL}>
          {f('routes')}
          <RequiredMark />
        </legend>
        {routes.map((route, index) => (
          <div
            // Trechos não têm id; a posição é a identidade enquanto o formulário está aberto.
            key={index}
            className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end"
          >
            <TextField
              id={`transfer-from-${index}`}
              label={f('from')}
              value={route.from}
              maxLength={100}
              onChange={(value) => setRoute(index, 'from', value)}
              placeholder={p('from')}
            />
            <TextField
              id={`transfer-to-${index}`}
              label={f('to')}
              value={route.to}
              maxLength={100}
              onChange={(value) => setRoute(index, 'to', value)}
              placeholder={p('to')}
            />
            <button
              type="button"
              aria-label={t('partnerSignup.details.fields.removeRoute', { n: index + 1 })}
              onClick={() =>
                updateFieldValue(
                  'transferRoutes',
                  routes.filter((_, i) => i !== index)
                )
              }
              className="press w-12 h-12 flex items-center justify-center rounded-xl border border-line bg-surface text-danger focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
        {routes.length < MAX_ROUTES && (
          <button
            type="button"
            onClick={() => updateFieldValue('transferRoutes', [...routes, { from: '', to: '' }])}
            className={`${BUTTON_SECONDARY} inline-flex items-center gap-2`}
          >
            <Plus size={16} aria-hidden="true" /> {f('addRoute')}
          </button>
        )}
        <SignupError message={routesError} />
      </fieldset>

      <ChipGroup
        label={f('vehicles')}
        options={TRANSFER_VEHICLES}
        selected={formData.transferVehicles}
        onToggle={(value) => toggleInList('transferVehicles', value)}
        required
        error={getFieldError('transferVehicles')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField
          id="transfer-max-passengers"
          label={f('maxPassengers')}
          inputMode="numeric"
          value={formData.maxPassengers}
          onChange={(value) => updateFieldValue('maxPassengers', value.replace(/\D/g, ''))}
          placeholder={p('maxPassengers')}
          required
          error={getFieldError('maxPassengers')}
        />
        <TextField
          id="transfer-luggage"
          label={f('luggage')}
          value={formData.luggageInfo}
          maxLength={500}
          onChange={(value) => updateFieldValue('luggageInfo', value)}
          placeholder={p('luggage')}
        />
      </div>
    </div>
  );
}
