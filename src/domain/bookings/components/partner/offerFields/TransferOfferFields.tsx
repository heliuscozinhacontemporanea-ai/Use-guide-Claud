import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RadioCardGroup } from '../../../../../ui/components/RadioCardGroup';
import { INPUT } from '../../../../../ui/styles/controls';
import type { OfferFormInput } from '../../../schemas/offerFormSchema';
import { OfferPriceFields } from '../OfferPriceFields';
import { OfferDurationFields } from './OfferDurationFields';
import { OfferNumberField } from './OfferNumberField';
import { OfferToggleField } from './OfferToggleField';
import { TransferDeparturesField } from './TransferDeparturesField';

interface TransferOfferFieldsProps {
  control: Control<OfferFormInput>;
  register: UseFormRegister<OfferFormInput>;
  setValue: UseFormSetValue<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
  /** Trechos do anúncio: a oferta escolhe um, num sentido (F3b). */
  routes: Array<{ from: string; to: string }>;
  /** Depois de publicar, o trecho e o tipo não mudam (o servidor recusa). */
  locked: boolean;
}

const routeKey = (route: { from: string; to: string }) => `${route.from}|${route.to}`;

/** Translado (F3b): trecho, privativo ou compartilhado, tempo de viagem, saídas e atendimento. */
export function TransferOfferFields(props: TransferOfferFieldsProps) {
  const { control, register, setValue, errors, routes, locked } = props;
  const { t } = useTranslation();
  const [mode, from, to, pickup] = useWatch({
    control,
    name: ['sellingUnit', 'routeFrom', 'routeTo', 'pickupMode'],
  });
  const shared = mode !== 'group';
  // Os dois sentidos de cada trecho do anúncio: ida e volta são ofertas diferentes.
  const directions = routes.flatMap((route) => [route, { from: route.to, to: route.from }]);

  return (
    <div className="space-y-5">
      {directions.length === 0 ? (
        <p className="text-sm text-ink/70">{t('fleet.editor.noRoutes')}</p>
      ) : (
        <RadioCardGroup
          name="route"
          legend={t('fleet.editor.routeLegend')}
          options={directions.map((route) => ({
            value: routeKey(route),
            title: `${route.from} → ${route.to}`,
          }))}
          value={from && to ? routeKey({ from, to }) : undefined}
          onChange={(value) => {
            if (locked) return;
            const [nextFrom = '', nextTo = ''] = value.split('|');
            setValue('routeFrom', nextFrom, { shouldDirty: true });
            setValue('routeTo', nextTo, { shouldDirty: true });
          }}
        />
      )}
      {errors.routeFrom?.message && (
        <p role="alert" className="text-xs text-danger">
          {t(errors.routeFrom.message)}
        </p>
      )}

      <Controller
        control={control}
        name="sellingUnit"
        render={({ field }) => (
          <RadioCardGroup
            name={field.name}
            legend={t('fleet.editor.transferTypeLegend')}
            options={[
              {
                value: 'group',
                title: t('fleet.editor.privateTitle'),
                description: t('fleet.editor.privateHint'),
              },
              {
                value: 'person',
                title: t('fleet.editor.sharedTitle'),
                description: t('fleet.editor.sharedHint'),
              },
            ]}
            value={field.value}
            onChange={(value) => !locked && field.onChange(value)}
          />
        )}
      />

      <OfferDurationFields
        legend={t('fleet.editor.travelTime')}
        register={register}
        errors={errors}
      />

      {shared ? (
        <OfferPriceFields control={control} register={register} errors={errors} />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <OfferNumberField
            label={t('fleet.editor.vehiclePrice')}
            decimal
            field={register('vehicleAmount')}
            error={errors.vehicleAmount?.message}
          />
          <OfferNumberField
            label={t('fleet.editor.passengersPerVehicle')}
            field={register('groupMaxPeople')}
            error={errors.groupMaxPeople?.message}
          />
        </div>
      )}
      <OfferNumberField
        label={t(shared ? 'bookings.editor.maxParticipantsLabel' : 'fleet.editor.maxVehicles')}
        field={register('maxParticipantsPerBooking')}
        error={errors.maxParticipantsPerBooking?.message}
      />

      {shared ? null : (
        <>
          <TransferDeparturesField control={control} register={register} errors={errors} />
          <OfferToggleField
            control={control}
            name="anyTimeEnabled"
            title={t('fleet.editor.customLegend')}
            hint={t('fleet.editor.anyTimeHint')}
          >
            <div className="grid grid-cols-2 gap-2">
              <OfferNumberField
                label={t('fleet.editor.anyTimeFrom')}
                type="time"
                field={register('anyTimeFrom')}
                error={errors.anyTimeFrom?.message}
              />
              <OfferNumberField
                label={t('fleet.editor.anyTimeTo')}
                type="time"
                field={register('anyTimeTo')}
              />
            </div>
            <OfferNumberField
              label={t('fleet.editor.minNotice')}
              field={register('minNoticeHours')}
              error={errors.minNoticeHours?.message}
            />
          </OfferToggleField>
        </>
      )}

      <Controller
        control={control}
        name="pickupMode"
        render={({ field }) => (
          <RadioCardGroup
            name={field.name}
            legend={t('fleet.editor.transferPickupLegend')}
            options={[
              { value: 'buyer_address', title: t('fleet.editor.pickupAddress') },
              { value: 'meeting_point', title: t('fleet.editor.pickupMeeting') },
            ]}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      {/* Busca no endereço do cliente não tem ponto de encontro (protótipo F3b, tela 6). */}
      {pickup === 'meeting_point' && (
        <label className="block space-y-1">
          <span className="text-xs text-ink/70">{t('bookings.editor.meetingPointLabel')}</span>
          <input {...register('meetingPoint')} className={INPUT} />
        </label>
      )}
    </div>
  );
}
