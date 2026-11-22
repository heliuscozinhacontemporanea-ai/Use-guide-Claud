import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCancellationPolicyOptions } from '../../../../shared/hooks/useCancellationPolicyOptions';
import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
import {
  type OfferFormInput,
  type OfferFormValues,
  offerFormSchema,
} from '../../schemas/offerFormSchema';
import type { BookableGuideItem, OfferFields } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { offerFormToFields } from '../../utils/offerFormMapping';
import { OfferTextFields } from './OfferTextFields';
import { RentalOfferFields } from './offerFields/RentalOfferFields';
import { TourOfferFields } from './offerFields/TourOfferFields';
import { TransferOfferFields } from './offerFields/TransferOfferFields';

interface PartnerOfferEditorProps {
  defaultValues: OfferFormValues;
  /** Política da oferta já publicada: só pode trocar por uma igual ou mais flexível (D14). */
  publishedPolicy?: string;
  /** Veículos e trechos do anúncio, que o aluguel e o translado escolhem (F3b). */
  listing?: Pick<BookableGuideItem, 'vehicles' | 'routes'>;
  /** A página entrega o salvar à barra fixa, que tem o "Salvar" (F3, D33). */
  registerSave: (save: (() => void) | null) => void;
  onSubmit: (fields: OfferFields, kind: OfferFormValues['kind']) => Promise<void>;
}

/** Editor de oferta como página empilhada do painel; voltar descarta o que não foi salvo. */
export function PartnerOfferEditor({
  defaultValues,
  publishedPolicy,
  listing,
  registerSave,
  onSubmit,
}: PartnerOfferEditorProps) {
  const { t } = useTranslation();
  const kind = defaultValues.kind;
  // Translado tem opções próprias de cancelamento (Código Civil art. 740, D14).
  const policyOptions = useCancellationPolicyOptions(
    kind === 'transfer' ? 'transfer' : 'booking',
    publishedPolicy
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<OfferFormInput, unknown, OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues,
  });

  // A barra pode ser tocada de novo enquanto a gravação anterior não voltou.
  const saving = useRef(false);
  const submit = handleSubmit(async (values) => {
    if (saving.current) return;
    saving.current = true;
    setSubmitError(null);
    try {
      await onSubmit(offerFormToFields(values), values.kind);
    } catch (error: unknown) {
      setSubmitError(getBookingErrorMessage(error));
    } finally {
      saving.current = false;
    }
  });
  const submitRef = useRef(submit);
  submitRef.current = submit;
  useEffect(() => {
    registerSave(() => void submitRef.current());
    return () => registerSave(null);
  }, [registerSave]);

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <OfferTextFields kind={kind} register={register} errors={errors} />
      {kind === 'rental' ? (
        <RentalOfferFields
          control={control}
          register={register}
          errors={errors}
          vehicles={listing?.vehicles ?? (defaultValues.vehicle ? [defaultValues.vehicle] : [])}
        />
      ) : kind === 'transfer' ? (
        <TransferOfferFields
          control={control}
          register={register}
          setValue={setValue}
          errors={errors}
          routes={
            listing?.routes ??
            (defaultValues.routeFrom
              ? [{ from: defaultValues.routeFrom, to: defaultValues.routeTo }]
              : [])
          }
          locked={Boolean(publishedPolicy)}
        />
      ) : (
        <TourOfferFields kind={kind} control={control} register={register} errors={errors} />
      )}
      <Controller
        control={control}
        name="cancellationPolicy"
        render={({ field }) => (
          <RadioCardGroup
            name={field.name}
            legend={t('salesPolicy.policyLegend')}
            hint={publishedPolicy ? t('salesPolicy.lockedHint') : undefined}
            options={policyOptions}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <p className="text-xs text-ink/70">{t('salesPolicy.withdrawalNoFee')}</p>
      {submitError && (
        <p role="alert" className="text-xs text-danger">
          {submitError}
        </p>
      )}
    </form>
  );
}
