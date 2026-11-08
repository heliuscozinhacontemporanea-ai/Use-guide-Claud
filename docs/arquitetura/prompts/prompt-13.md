# Prompt 13 — bookings: painel do parceiro (frontend)

> Lote 6 — gerado do commit de referência `53b8064` da branch `claude/agents-md-v2`. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 13 — bookings: painel do parceiro (frontend)

O parceiro passa a criar ofertas para seus passeios e atrações, publicar, pausar ou arquivar cada uma, e gerenciar horários semana a semana. Os horários podem ser recorrentes ou avulsos, no fuso de Fortaleza. Ele também cancela horário (com reembolso integral, depois de confirmação) e vê as reservas.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade, migração ou transição (§2.2 item 8). A decisão D5 (tradução automática) está em aberto: não implemente tradução automática.

O QUE MUDA:
1) src/domain/bookings (frontend): types (espelho dos DTOs), port + HttpBookingsAdapter (erros pelo `code`), UseCases (um por arquivo), hooks (usePartnerOffers, usePartnerSlots, useOfferBookings), schema Zod do formulário (mensagens como chaves de tradução), utils (dinheiro em centavos, conversão "150,90" → 15090, datas no fuso de Fortaleza), componentes do parceiro (PartnerOffersManager, PartnerOfferRow, PartnerOfferEditor com abas pt-BR/en/fr, OfferTextFields, OfferPriceFields, PartnerSlotsManager, SlotCreationForm, PartnerBookingsList) e index.ts exportando só o que as compositions usam.
2) Traduções em src/shared/i18n/bookingsResources.ts (pt-BR, en, fr, mesmas chaves garantidas pelo tipo), ligadas ao resources.ts como `bookings`.
3) PartnerPanel NÃO importa bookings: ganha só o render-prop renderBookableOffersManager(items), exibido na aba de itens. src/app/compositions/PartnerBookingsComposition.tsx monta o gerenciador e, se a conta financeira não estiver habilitada, mostra o aviso com o PartnerStripeConnectPortal.
4) Componentes novos usam só classes que o tema claro já sobrescreve (text-white/*, bg-white/*, border-white/*), toque ≥ 44 px, aria-label nos botões de ícone, ConfirmDialog (nunca confirm()) e estados de carregando/vazio/erro.

ARQUIVOS (crie, altere ou apague exatamente estes):
- src/app/compositions/PartnerBookingsComposition.tsx (criar)
- src/app/compositions/PartnerPortalComposition.tsx (alterar)
- src/domain/bookings/adapters/httpBookingsAdapter.ts (criar)
- src/domain/bookings/application/usecases/cancelSlotUseCase.ts (criar)
- src/domain/bookings/application/usecases/createOfferUseCase.ts (criar)
- src/domain/bookings/application/usecases/createSlotsUseCase.ts (criar)
- src/domain/bookings/application/usecases/listOfferBookingsUseCase.ts (criar)
- src/domain/bookings/application/usecases/listPartnerOffersUseCase.ts (criar)
- src/domain/bookings/application/usecases/listPartnerSlotsUseCase.ts (criar)
- src/domain/bookings/application/usecases/markNoShowUseCase.ts (criar)
- src/domain/bookings/application/usecases/setOfferStatusUseCase.ts (criar)
- src/domain/bookings/application/usecases/updateOfferUseCase.ts (criar)
- src/domain/bookings/components/partner/OfferPriceFields.tsx (criar)
- src/domain/bookings/components/partner/OfferTextFields.tsx (criar)
- src/domain/bookings/components/partner/PartnerBookingsList.tsx (criar)
- src/domain/bookings/components/partner/PartnerOfferEditor.tsx (criar)
- src/domain/bookings/components/partner/PartnerOfferRow.tsx (criar)
- src/domain/bookings/components/partner/PartnerOffersManager.test.tsx (criar)
- src/domain/bookings/components/partner/PartnerOffersManager.tsx (criar)
- src/domain/bookings/components/partner/PartnerSlotsManager.tsx (criar)
- src/domain/bookings/components/partner/SlotCreationForm.tsx (criar)
- src/domain/bookings/components/shared/ListState.tsx (criar)
- src/domain/bookings/factory.ts (criar)
- src/domain/bookings/hooks/useOfferBookings.ts (criar)
- src/domain/bookings/hooks/usePartnerOffers.ts (criar)
- src/domain/bookings/hooks/usePartnerSlots.ts (criar)
- src/domain/bookings/index.ts (criar)
- src/domain/bookings/ports/bookingsApiPort.ts (criar)
- src/domain/bookings/schemas/offerFormSchema.ts (criar)
- src/domain/bookings/types/bookings.ts (criar)
- src/domain/bookings/utils/bookingErrorMessage.ts (criar)
- src/domain/bookings/utils/bookingsFrontendUtils.test.ts (criar)
- src/domain/bookings/utils/dates.ts (criar)
- src/domain/bookings/utils/money.ts (criar)
- src/domain/bookings/utils/offerFormMapping.ts (criar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/shared/i18n/bookingsResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== src/app/compositions/PartnerBookingsComposition.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type BookableGuideItem, PartnerOffersManager } from '../../domain/bookings';
import { getPartnerConnectStatusUseCase, PartnerStripeConnectPortal } from '../../domain/payment';

/** Junta o gerenciador de reservas (bookings) e o onboarding financeiro (payment) na área do parceiro. */
export function PartnerBookingsComposition({ items }: { items: BookableGuideItem[] }) {
  const { t } = useTranslation();
  const [paymentsReady, setPaymentsReady] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    getPartnerConnectStatusUseCase()
      .then((status) => {
        if (active) setPaymentsReady(status.chargesEnabled && status.payoutsEnabled);
      })
      .catch(() => {
        if (active) setPaymentsReady(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PartnerOffersManager
      items={items}
      accountNotice={
        paymentsReady === false ? (
          <div className="space-y-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-200">{t('bookings.partner.stripeRequired')}</p>
            <PartnerStripeConnectPortal />
          </div>
        ) : null
      }
    />
  );
}

=== src/app/compositions/PartnerPortalComposition.tsx — diff ===
@@ -7,6 +7,7 @@ import { UserRole } from '../../domain/auth/types/auth';
 import { useAuthContext } from '../../domain/auth/context/AuthContext';
 import { ReportsView } from '../../domain/insights';
 import { CheckoutModal, isPaidPlanId, PlanSubscriptionCard } from '../../domain/payment';
+import { PartnerBookingsComposition } from './PartnerBookingsComposition';
 import { NotificationBell } from '../../domain/notifications';
 import { PartnerEventTicketingManager } from '../../domain/ticketing';
 import { ErrorState } from '../../ui/components/ErrorState';
@@ -122,6 +123,7 @@ export function PartnerPortalComposition() {
         ) : null
       }
       planSubscriptionSlot={<PlanSubscriptionCard />}
+      renderBookableOffersManager={(items) => <PartnerBookingsComposition items={items} />}
       renderEventTicketingManager={(eventListingId) => (
         <PartnerEventTicketingManager eventListingId={eventListingId} />
       )}

=== src/domain/bookings/adapters/httpBookingsAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { BookingsApiPort } from '../ports/bookingsApiPort';
import type {
  BookingSummary,
  CreateOfferPayload,
  CreateSlotsPayload,
  OfferFields,
  OfferStatus,
  Page,
  PartnerOffer,
  PartnerSlot,
} from '../types/bookings';

const OPTIONS = { requireAuth: true, requireAppCheck: true } as const;

/** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
async function call<T>(path: string, init: RequestInit = { method: 'GET' }): Promise<T> {
  const response = await firebaseApiFetch(path, init, OPTIONS);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data?.error?.code === 'string' ? data.error.code : 'INTERNAL_ERROR');
  }
  return data as T;
}

function json(method: 'POST' | 'PATCH', body: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

const offerPath = (offerId: string) => `/api/partners/offers/${encodeURIComponent(offerId)}`;

export class HttpBookingsAdapter implements BookingsApiPort {
  async listPartnerOffers(): Promise<PartnerOffer[]> {
    return (await call<{ data: PartnerOffer[] }>('/api/partners/offers')).data;
  }

  async createOffer(payload: CreateOfferPayload): Promise<PartnerOffer> {
    return call('/api/partners/offers', json('POST', payload));
  }

  async updateOffer(offerId: string, payload: Partial<OfferFields>): Promise<PartnerOffer> {
    return call(offerPath(offerId), json('PATCH', payload));
  }

  async setOfferStatus(
    offerId: string,
    status: Exclude<OfferStatus, 'draft'>
  ): Promise<PartnerOffer> {
    return call(`${offerPath(offerId)}/status`, json('POST', { status }));
  }

  async listPartnerSlots(offerId: string, fromIso: string, toIso: string): Promise<PartnerSlot[]> {
    const query = new URLSearchParams({ from: fromIso, to: toIso });
    return (await call<{ data: PartnerSlot[] }>(`${offerPath(offerId)}/slots?${query}`)).data;
  }

  async createSlots(offerId: string, payload: CreateSlotsPayload): Promise<PartnerSlot[]> {
    return (
      await call<{ data: PartnerSlot[] }>(`${offerPath(offerId)}/slots`, json('POST', payload))
    ).data;
  }

  async cancelSlot(offerId: string, slotId: string): Promise<{ canceledBookings: number }> {
    return call(
      `${offerPath(offerId)}/slots/${encodeURIComponent(slotId)}/cancel`,
      json('POST', {})
    );
  }

  async listOfferBookings(offerId: string, cursor?: string | null): Promise<Page<BookingSummary>> {
    const query = new URLSearchParams({ limit: '20', ...(cursor ? { cursor } : {}) });
    return call(`${offerPath(offerId)}/bookings?${query}`);
  }

  async markNoShow(bookingId: string): Promise<BookingSummary> {
    return call(`/api/bookings/${encodeURIComponent(bookingId)}/no-show`, json('POST', {}));
  }
}

=== src/domain/bookings/application/usecases/cancelSlotUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';

/** Cancela o horário; o backend reembolsa integralmente todas as reservas pagas dele. */
export async function cancelSlotUseCase(
  offerId: string,
  slotId: string
): Promise<{ canceledBookings: number }> {
  return bookingsApi.cancelSlot(offerId, slotId);
}

=== src/domain/bookings/application/usecases/createOfferUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { CreateOfferPayload, PartnerOffer } from '../../types/bookings';

export async function createOfferUseCase(payload: CreateOfferPayload): Promise<PartnerOffer> {
  return bookingsApi.createOffer(payload);
}

=== src/domain/bookings/application/usecases/createSlotsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { CreateSlotsPayload, PartnerSlot } from '../../types/bookings';

export async function createSlotsUseCase(
  offerId: string,
  payload: CreateSlotsPayload
): Promise<PartnerSlot[]> {
  return bookingsApi.createSlots(offerId, payload);
}

=== src/domain/bookings/application/usecases/listOfferBookingsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { BookingSummary, Page } from '../../types/bookings';

export async function listOfferBookingsUseCase(
  offerId: string,
  cursor?: string | null
): Promise<Page<BookingSummary>> {
  return bookingsApi.listOfferBookings(offerId, cursor);
}

=== src/domain/bookings/application/usecases/listPartnerOffersUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { PartnerOffer } from '../../types/bookings';

export async function listPartnerOffersUseCase(): Promise<PartnerOffer[]> {
  return bookingsApi.listPartnerOffers();
}

=== src/domain/bookings/application/usecases/listPartnerSlotsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { PartnerSlot } from '../../types/bookings';

export async function listPartnerSlotsUseCase(
  offerId: string,
  fromIso: string,
  toIso: string
): Promise<PartnerSlot[]> {
  return bookingsApi.listPartnerSlots(offerId, fromIso, toIso);
}

=== src/domain/bookings/application/usecases/markNoShowUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { BookingSummary } from '../../types/bookings';

export async function markNoShowUseCase(bookingId: string): Promise<BookingSummary> {
  return bookingsApi.markNoShow(bookingId);
}

=== src/domain/bookings/application/usecases/setOfferStatusUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { OfferStatus, PartnerOffer } from '../../types/bookings';

export async function setOfferStatusUseCase(
  offerId: string,
  status: Exclude<OfferStatus, 'draft'>
): Promise<PartnerOffer> {
  return bookingsApi.setOfferStatus(offerId, status);
}

=== src/domain/bookings/application/usecases/updateOfferUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { OfferFields, PartnerOffer } from '../../types/bookings';

export async function updateOfferUseCase(
  offerId: string,
  payload: Partial<OfferFields>
): Promise<PartnerOffer> {
  return bookingsApi.updateOffer(offerId, payload);
}

=== src/domain/bookings/components/partner/OfferPriceFields.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Plus, Trash2 } from 'lucide-react';
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  useFieldArray,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { OfferFormInput } from '../../schemas/offerFormSchema';
import { BUTTON_SECONDARY, INPUT } from '../shared/ListState';

interface OfferPriceFieldsProps {
  control: Control<OfferFormInput>;
  register: UseFormRegister<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
}

export function OfferPriceFields({ control, register, errors }: OfferPriceFieldsProps) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ control, name: 'priceOptions' });

  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-semibold text-white/70">
        {t('bookings.editor.pricingLegend')}
      </legend>
      {fields.map((field, index) => {
        const error = errors.priceOptions?.[index];
        return (
          <div
            key={field.id}
            className="grid grid-cols-1 sm:grid-cols-[1fr_8rem_auto] gap-2 items-end"
          >
            <label className="block space-y-1">
              <span className="text-xs text-white/70">{t('bookings.editor.priceLabel')}</span>
              <input {...register(`priceOptions.${index}.label`)} className={INPUT} />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-white/70">{t('bookings.editor.priceAmount')}</span>
              <input
                {...register(`priceOptions.${index}.amount`)}
                inputMode="decimal"
                className={INPUT}
              />
            </label>
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              aria-label={t('bookings.editor.removePriceOption')}
              className={`${BUTTON_SECONDARY} w-11 flex items-center justify-center`}
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
            {(error?.label?.message || error?.amount?.message) && (
              <p role="alert" className="sm:col-span-3 text-xs text-red-300">
                {t(error.label?.message ?? error.amount?.message ?? '')}
              </p>
            )}
          </div>
        );
      })}
      {errors.priceOptions?.root?.message && (
        <p role="alert" className="text-xs text-red-300">
          {t(errors.priceOptions.root.message)}
        </p>
      )}
      <button
        type="button"
        onClick={() => append({ id: `option${fields.length + 1}`, label: '', amount: '' })}
        disabled={fields.length >= 10}
        className={BUTTON_SECONDARY}
      >
        <Plus size={13} className="inline mr-1" aria-hidden="true" />
        {t('bookings.editor.addPriceOption')}
      </button>
    </fieldset>
  );
}

=== src/domain/bookings/components/partner/OfferTextFields.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { OfferFormInput } from '../../schemas/offerFormSchema';
import { INPUT } from '../shared/ListState';

const LANGUAGES = ['pt-BR', 'en', 'fr'] as const;
type Language = (typeof LANGUAGES)[number];

interface OfferTextFieldsProps {
  register: UseFormRegister<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
}

/** Título e descrição por idioma: pt-BR obrigatório, en e fr opcionais (AGENTS.md §12.6). */
export function OfferTextFields({ register, errors }: OfferTextFieldsProps) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState<Language>('pt-BR');
  const titleError = errors.title?.[language]?.message;

  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-semibold text-white/70">
        {t('bookings.editor.languageTabs')}
      </legend>
      <div role="tablist" className="flex gap-2">
        {LANGUAGES.map((code) => (
          <button
            key={code}
            type="button"
            role="tab"
            aria-selected={language === code}
            onClick={() => setLanguage(code)}
            className={`min-h-11 px-3 rounded-xl text-xs font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
              language === code ? 'bg-teal-500/20 text-teal-200' : 'bg-white/5 text-white/70'
            }`}
          >
            {t(`common.locales.${code === 'pt-BR' ? 'ptBR' : code}`)}
          </button>
        ))}
      </div>
      {language !== 'pt-BR' && (
        <p className="text-xs text-white/60">{t('bookings.editor.optionalTranslation')}</p>
      )}
      {LANGUAGES.map((code) => (
        <div key={code} hidden={language !== code} className="space-y-3">
          <label className="block space-y-1">
            <span className="text-xs text-white/70">{t('bookings.editor.titleLabel')}</span>
            <input {...register(`title.${code}`)} className={INPUT} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-white/70">{t('bookings.editor.descriptionLabel')}</span>
            <textarea {...register(`description.${code}`)} rows={4} className={`${INPUT} py-2`} />
          </label>
        </div>
      ))}
      {titleError && (
        <p role="alert" className="text-xs text-red-300">
          {t(titleError)}
        </p>
      )}
    </fieldset>
  );
}

=== src/domain/bookings/components/partner/PartnerBookingsList.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { useOfferBookings } from '../../hooks/useOfferBookings';
import { formatSlotDateTime } from '../../utils/dates';
import { formatMinor } from '../../utils/money';
import { BUTTON_SECONDARY, ListEmpty, ListError, ListLoading } from '../shared/ListState';

export function PartnerBookingsList({ offerId }: { offerId: string }) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, hasMore, reload, loadMore, markNoShow } = useOfferBookings(offerId);
  const now = Date.now();

  return (
    <section className="space-y-3" aria-label={t('bookings.bookingsList.title')}>
      {error && <ListError message={error} onRetry={() => void reload()} />}
      {!error && !loading && data.length === 0 && (
        <ListEmpty message={t('bookings.bookingsList.empty')} />
      )}
      <ul className="space-y-2">
        {data.map((booking) => {
          const started = new Date(booking.offer.startsAt).getTime() <= now;
          return (
            <li
              key={booking.id}
              className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <p className="text-sm font-bold text-white">
                  {formatSlotDateTime(booking.offer.startsAt, i18n.language)}
                </p>
                <p className="text-xs text-white/60">
                  {t('bookings.bookingsList.participants', { count: booking.participantsCount })} ·{' '}
                  {formatMinor(booking.totalMinor, i18n.language)} ·{' '}
                  {t(`bookings.bookingStatus.${booking.status}`)}
                </p>
              </div>
              {booking.status === 'confirmed' && started && (
                <button
                  type="button"
                  onClick={() => void markNoShow(booking.id)}
                  className={BUTTON_SECONDARY}
                >
                  {t('bookings.bookingsList.markNoShow')}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {loading && <ListLoading label={t('bookings.partner.loading')} />}
      {!loading && hasMore && (
        <button type="button" onClick={() => void loadMore()} className={BUTTON_SECONDARY}>
          {t('bookings.bookingsList.loadMore')}
        </button>
      )}
    </section>
  );
}

=== src/domain/bookings/components/partner/PartnerOfferEditor.tsx — ARQUIVO NOVO, conteúdo completo ===
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  type OfferFormInput,
  type OfferFormValues,
  offerFormSchema,
} from '../../schemas/offerFormSchema';
import type { OfferFields } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { offerFormToFields } from '../../utils/offerFormMapping';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT } from '../shared/ListState';
import { OfferPriceFields } from './OfferPriceFields';
import { OfferTextFields } from './OfferTextFields';

interface PartnerOfferEditorProps {
  mode: 'create' | 'edit';
  defaultValues: OfferFormValues;
  onSubmit: (fields: OfferFields, kind: OfferFormValues['kind']) => Promise<void>;
  onCancel: () => void;
}

export function PartnerOfferEditor({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
}: PartnerOfferEditorProps) {
  const { t } = useTranslation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormInput, unknown, OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues,
  });

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await onSubmit(offerFormToFields(values), values.kind);
    } catch (error: unknown) {
      setSubmitError(getBookingErrorMessage(error));
    }
  });

  const numberField = (
    name: 'durationMinutes' | 'freeCancellationHoursBefore' | 'maxParticipantsPerBooking',
    label: string
  ) => (
    <label className="block space-y-1">
      <span className="text-xs text-white/70">{label}</span>
      <input type="number" inputMode="numeric" {...register(name)} className={INPUT} />
      {errors[name]?.message && (
        <span role="alert" className="text-xs text-red-300">
          {t(errors[name]?.message ?? '')}
        </span>
      )}
    </label>
  );

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <h3 className="text-base font-bold text-white">
        {mode === 'create' ? t('bookings.editor.titleNew') : t('bookings.editor.titleEdit')}
      </h3>
      <OfferTextFields register={register} errors={errors} />
      <OfferPriceFields control={control} register={register} errors={errors} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {numberField('durationMinutes', t('bookings.editor.durationLabel'))}
        {numberField('maxParticipantsPerBooking', t('bookings.editor.maxParticipantsLabel'))}
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-white/70">{t('bookings.editor.meetingPointLabel')}</span>
        <input {...register('meetingPoint')} className={INPUT} />
      </label>
      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <legend className="text-xs font-semibold text-white/70 mb-2">
          {t('bookings.editor.policyLegend')}
        </legend>
        {numberField('freeCancellationHoursBefore', t('bookings.editor.freeHoursLabel'))}
        <label className="block space-y-1">
          <span className="text-xs text-white/70">{t('bookings.editor.refundAfterLabel')}</span>
          <select {...register('refundPercentAfterDeadline')} className={INPUT}>
            <option value="0">{t('bookings.editor.refundNone')}</option>
            <option value="50">{t('bookings.editor.refundHalf')}</option>
            <option value="100">{t('bookings.editor.refundFull')}</option>
          </select>
        </label>
      </fieldset>
      <label className="flex items-center gap-3 min-h-11">
        <input
          type="checkbox"
          {...register('requiresParticipantNames')}
          className="w-5 h-5 accent-teal-400"
        />
        <span className="text-sm text-white/80">{t('bookings.editor.requireNamesLabel')}</span>
      </label>
      {submitError && (
        <p role="alert" className="text-xs text-red-300">
          {submitError}
        </p>
      )}
      <div className="flex flex-wrap gap-2 justify-end">
        <button type="button" onClick={onCancel} className={BUTTON_SECONDARY}>
          {t('bookings.editor.cancel')}
        </button>
        <button type="submit" disabled={isSubmitting} className={BUTTON_PRIMARY}>
          {t('bookings.editor.save')}
        </button>
      </div>
    </form>
  );
}

=== src/domain/bookings/components/partner/PartnerOfferRow.tsx — ARQUIVO NOVO, conteúdo completo ===
import { CalendarClock, Pencil, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OfferStatus, PartnerOffer } from '../../types/bookings';
import { formatMinor } from '../../utils/money';
import { BUTTON_SECONDARY } from '../shared/ListState';

const STATUS_STYLE: Record<OfferStatus, string> = {
  draft: 'bg-white/10 text-white/80',
  published: 'bg-emerald-500/15 text-emerald-300',
  paused: 'bg-amber-500/15 text-amber-200',
  archived: 'bg-white/5 text-white/60',
};

interface PartnerOfferRowProps {
  offer: PartnerOffer;
  busy: boolean;
  onEdit: () => void;
  onSlots: () => void;
  onBookings: () => void;
  onStatus: (status: Exclude<OfferStatus, 'draft'>) => void;
}

export function PartnerOfferRow({
  offer,
  busy,
  onEdit,
  onSlots,
  onBookings,
  onStatus,
}: PartnerOfferRowProps) {
  const { t, i18n } = useTranslation();
  const fromMinor = Math.min(...offer.pricing.priceOptions.map((option) => option.unitAmountMinor));
  const archived = offer.status === 'archived';

  return (
    <li className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white break-words">{offer.title['pt-BR']}</p>
          <p className="text-xs text-white/60">
            {t(`bookings.kind.${offer.kind}`)} ·{' '}
            {t('bookings.partner.fromPrice', { amount: formatMinor(fromMinor, i18n.language) })}
          </p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLE[offer.status]}`}
        >
          {t(`bookings.status.${offer.status}`)}
        </span>
      </div>
      {!archived && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onEdit} className={BUTTON_SECONDARY}>
            <Pencil size={13} className="inline mr-1" aria-hidden="true" />
            {t('bookings.partner.edit')}
          </button>
          <button type="button" onClick={onSlots} className={BUTTON_SECONDARY}>
            <CalendarClock size={13} className="inline mr-1" aria-hidden="true" />
            {t('bookings.partner.manageSlots')}
          </button>
          <button type="button" onClick={onBookings} className={BUTTON_SECONDARY}>
            <Users size={13} className="inline mr-1" aria-hidden="true" />
            {t('bookings.partner.viewBookings')}
          </button>
          {offer.status === 'published' ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onStatus('paused')}
              className={BUTTON_SECONDARY}
            >
              {t('bookings.partner.pause')}
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => onStatus('published')}
              className={BUTTON_SECONDARY}
            >
              {t('bookings.partner.publish')}
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatus('archived')}
            className={BUTTON_SECONDARY}
          >
            {t('bookings.partner.archive')}
          </button>
        </div>
      )}
    </li>
  );
}

=== src/domain/bookings/components/partner/PartnerOffersManager.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { PartnerOffersManager } from './PartnerOffersManager';
import { PartnerSlotsManager } from './PartnerSlotsManager';

vi.mock('../../application/usecases/listPartnerOffersUseCase', () => ({
  listPartnerOffersUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/setOfferStatusUseCase', () => ({
  setOfferStatusUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/createOfferUseCase', () => ({ createOfferUseCase: vi.fn() }));
vi.mock('../../application/usecases/updateOfferUseCase', () => ({ updateOfferUseCase: vi.fn() }));
vi.mock('../../application/usecases/listPartnerSlotsUseCase', () => ({
  listPartnerSlotsUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/cancelSlotUseCase', () => ({ cancelSlotUseCase: vi.fn() }));
vi.mock('../../application/usecases/createSlotsUseCase', () => ({ createSlotsUseCase: vi.fn() }));

import { cancelSlotUseCase } from '../../application/usecases/cancelSlotUseCase';
import { createOfferUseCase } from '../../application/usecases/createOfferUseCase';
import { listPartnerOffersUseCase } from '../../application/usecases/listPartnerOffersUseCase';
import { listPartnerSlotsUseCase } from '../../application/usecases/listPartnerSlotsUseCase';

describe('PartnerOffersManager', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });
  afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('sem passeio nem atração mostra o estado vazio traduzido', async () => {
    vi.mocked(listPartnerOffersUseCase).mockResolvedValue([]);
    await i18n.changeLanguage('fr');
    render(
      <PartnerOffersManager items={[{ id: 'r1', name: 'Restaurante', category: 'restaurant' }]} />
    );
    expect(
      await screen.findByText(
        'Ajoutez une excursion ou une attraction pour vendre des réservations.'
      )
    ).toBeTruthy();
  });

  it('cria oferta convertendo R$ 150,90 em 15090 centavos', async () => {
    vi.mocked(listPartnerOffersUseCase).mockResolvedValue([]);
    vi.mocked(createOfferUseCase).mockImplementation(async (payload) => ({
      ...payload,
      id: 'offer_1',
      status: 'draft',
      createdAt: '',
      updatedAt: '',
    }));
    render(
      <PartnerOffersManager
        items={[{ id: 'item-1', name: 'Lagoa do Paraíso', category: 'tour' }]}
      />
    );
    fireEvent.click(await screen.findByRole('button', { name: /Nova oferta/ }));
    fireEvent.change(screen.getAllByLabelText('Título')[0]!, {
      target: { value: 'Passeio de buggy' },
    });
    fireEvent.change(screen.getByLabelText('Nome da opção'), { target: { value: 'Adulto' } });
    fireEvent.change(screen.getByLabelText('Valor (R$)'), { target: { value: '150,90' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(createOfferUseCase).toHaveBeenCalled());
    const payload = vi.mocked(createOfferUseCase).mock.calls[0]![0];
    expect(payload).toMatchObject({
      guideItemId: 'item-1',
      kind: 'tour',
      title: { 'pt-BR': 'Passeio de buggy' },
    });
    expect(payload.pricing.priceOptions[0]?.unitAmountMinor).toBe(15090);
  });
});

describe('PartnerSlotsManager', () => {
  beforeEach(() => vi.clearAllMocks());

  it('cancelar horário só acontece depois da confirmação', async () => {
    vi.mocked(listPartnerSlotsUseCase).mockResolvedValue([
      {
        id: 'slot-1',
        startsAt: new Date(Date.now() + 86_400_000).toISOString(),
        endsAt: null,
        capacityTotal: 10,
        capacityReserved: 1,
        capacitySold: 3,
        status: 'open',
      },
    ]);
    vi.mocked(cancelSlotUseCase).mockResolvedValue({ canceledBookings: 3 });
    render(<PartnerSlotsManager offerId="offer-1" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar horário' }));
    expect(cancelSlotUseCase).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        'Cancelar este horário? Todas as reservas pagas serão reembolsadas integralmente.'
      )
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(cancelSlotUseCase).toHaveBeenCalledWith('offer-1', 'slot-1'));
    expect(await screen.findByText('Horário cancelado. 3 reservas reembolsadas.')).toBeTruthy();
  });
});

=== src/domain/bookings/components/partner/PartnerOffersManager.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ArrowLeft, Plus } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { usePartnerOffers } from '../../hooks/usePartnerOffers';
import type { BookableGuideItem, OfferStatus, PartnerOffer } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { emptyOfferFormValues, offerToFormValues } from '../../utils/offerFormMapping';
import { BUTTON_SECONDARY, ListEmpty, ListError, ListLoading } from '../shared/ListState';
import { PartnerBookingsList } from './PartnerBookingsList';
import { PartnerOfferEditor } from './PartnerOfferEditor';
import { PartnerOfferRow } from './PartnerOfferRow';
import { PartnerSlotsManager } from './PartnerSlotsManager';

// Fase 1 (decisão D3): passeio vende horários; atração vende entradas.
const KIND_BY_CATEGORY: Record<string, PartnerOffer['kind']> = {
  tour: 'tour',
  sight: 'private_entry',
};

type View =
  | { type: 'list' }
  | { type: 'editor'; item: BookableGuideItem; offer?: PartnerOffer }
  | { type: 'slots' | 'bookings'; offer: PartnerOffer };

interface PartnerOffersManagerProps {
  items: BookableGuideItem[];
  /** Aviso montado pela composição quando a conta financeira ainda não está habilitada. */
  accountNotice?: ReactNode;
}

export function PartnerOffersManager({ items, accountNotice }: PartnerOffersManagerProps) {
  const { t } = useTranslation();
  const offers = usePartnerOffers();
  const [view, setView] = useState<View>({ type: 'list' });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const eligible = items.filter((item) => KIND_BY_CATEGORY[item.category]);

  const changeStatus = async (offer: PartnerOffer, status: Exclude<OfferStatus, 'draft'>) => {
    setBusyId(offer.id);
    setActionError(null);
    try {
      await offers.setStatus(offer.id, status);
    } catch (error: unknown) {
      setActionError(getBookingErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const requestStatus = (offer: PartnerOffer, status: Exclude<OfferStatus, 'draft'>) => {
    if (status !== 'archived') {
      void changeStatus(offer, status);
      return;
    }
    setConfirm({
      message: t('bookings.partner.confirmArchive'),
      onCancel: () => setConfirm(null),
      onConfirm: () => {
        setConfirm(null);
        void changeStatus(offer, status);
      },
    });
  };

  const backButton = (
    <button
      type="button"
      onClick={() => setView({ type: 'list' })}
      aria-label={t('bookings.editor.cancel')}
      className={`${BUTTON_SECONDARY} w-11`}
    >
      <ArrowLeft size={16} aria-hidden="true" />
    </button>
  );

  return (
    <GlassCard className="p-5 space-y-4 border border-white/10">
      <div>
        <h2 className="text-base font-bold text-white">{t('bookings.partner.sectionTitle')}</h2>
        <p className="text-xs text-white/60">{t('bookings.partner.sectionDescription')}</p>
      </div>
      {accountNotice}
      {actionError && (
        <p role="alert" className="text-xs text-red-300">
          {actionError}
        </p>
      )}

      {view.type === 'editor' && (
        <PartnerOfferEditor
          mode={view.offer ? 'edit' : 'create'}
          defaultValues={
            view.offer
              ? offerToFormValues(view.offer)
              : emptyOfferFormValues(KIND_BY_CATEGORY[view.item.category] ?? 'tour')
          }
          onCancel={() => setView({ type: 'list' })}
          onSubmit={async (fields, kind) => {
            if (view.offer) await offers.update(view.offer.id, fields);
            else await offers.create({ ...fields, guideItemId: view.item.id, kind });
            setView({ type: 'list' });
          }}
        />
      )}

      {(view.type === 'slots' || view.type === 'bookings') && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {backButton}
            <p className="text-sm font-bold text-white">{view.offer.title['pt-BR']}</p>
          </div>
          {view.type === 'slots' ? (
            <PartnerSlotsManager offerId={view.offer.id} />
          ) : (
            <PartnerBookingsList offerId={view.offer.id} />
          )}
        </div>
      )}

      {view.type === 'list' && (
        <>
          {offers.loading && <ListLoading label={t('bookings.partner.loading')} />}
          {!offers.loading && offers.error && (
            <ListError message={offers.error} onRetry={() => void offers.reload()} />
          )}
          {!offers.loading && !offers.error && eligible.length === 0 && (
            <ListEmpty message={t('bookings.partner.noEligibleItems')} />
          )}
          {!offers.loading &&
            !offers.error &&
            eligible.map((item) => {
              const itemOffers = offers.data.filter((offer) => offer.guideItemId === item.id);
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white/90 break-words">{item.name}</h3>
                    <button
                      type="button"
                      onClick={() => setView({ type: 'editor', item })}
                      className={BUTTON_SECONDARY}
                    >
                      <Plus size={13} className="inline mr-1" aria-hidden="true" />
                      {t('bookings.partner.newOffer')}
                    </button>
                  </div>
                  {itemOffers.length === 0 ? (
                    <ListEmpty message={t('bookings.partner.emptyOffers')} />
                  ) : (
                    <ul className="space-y-2">
                      {itemOffers.map((offer) => (
                        <PartnerOfferRow
                          key={offer.id}
                          offer={offer}
                          busy={busyId === offer.id}
                          onEdit={() => setView({ type: 'editor', item, offer })}
                          onSlots={() => setView({ type: 'slots', offer })}
                          onBookings={() => setView({ type: 'bookings', offer })}
                          onStatus={(status) => requestStatus(offer, status)}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
        </>
      )}
      <ConfirmDialog data={confirm} />
    </GlassCard>
  );
}

=== src/domain/bookings/components/partner/PartnerSlotsManager.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { usePartnerSlots } from '../../hooks/usePartnerSlots';
import type { CreateSlotsPayload, PartnerSlot } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import {
  addDays,
  formatDayLabel,
  formatSlotTime,
  fortalezaDateKey,
  startOfFortalezaWeek,
} from '../../utils/dates';
import { BUTTON_SECONDARY, ListEmpty, ListError, ListLoading } from '../shared/ListState';
import { SlotCreationForm } from './SlotCreationForm';

function groupByDay(slots: PartnerSlot[]): Array<[string, PartnerSlot[]]> {
  const groups = new Map<string, PartnerSlot[]>();
  for (const slot of slots) {
    const key = fortalezaDateKey(slot.startsAt);
    groups.set(key, [...(groups.get(key) ?? []), slot]);
  }
  return [...groups.entries()];
}

export function PartnerSlotsManager({ offerId }: { offerId: string }) {
  const { t, i18n } = useTranslation();
  const [weekStart, setWeekStart] = useState(() => startOfFortalezaWeek(new Date()));
  const { data, loading, error, reload, create, cancel } = usePartnerSlots(offerId, weekStart);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const days = useMemo(() => groupByDay(data), [data]);

  const handleCreate = async (payload: CreateSlotsPayload) => {
    try {
      const created = await create(payload);
      setNotice(t('bookings.slots.created', { count: created.length }));
    } catch (err: unknown) {
      setNotice(getBookingErrorMessage(err));
    }
  };

  const requestCancel = (slot: PartnerSlot) =>
    setConfirm({
      message: t('bookings.slots.confirmCancelSlot'),
      onCancel: () => setConfirm(null),
      onConfirm: async () => {
        setConfirm(null);
        try {
          const result = await cancel(slot.id);
          setNotice(t('bookings.slots.canceled', { count: result.canceledBookings }));
        } catch (err: unknown) {
          setNotice(getBookingErrorMessage(err));
        }
      },
    });

  return (
    <section className="space-y-4" aria-label={t('bookings.slots.title')}>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          aria-label={t('bookings.slots.previousWeek')}
          className={`${BUTTON_SECONDARY} w-11`}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <p className="text-sm font-semibold text-white">
          {formatDayLabel(weekStart.toISOString(), i18n.language)} –{' '}
          {formatDayLabel(addDays(weekStart, 6).toISOString(), i18n.language)}
        </p>
        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          aria-label={t('bookings.slots.nextWeek')}
          className={`${BUTTON_SECONDARY} w-11`}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
      {notice && (
        <p role="status" className="text-xs text-teal-200">
          {notice}
        </p>
      )}
      {loading && <ListLoading label={t('bookings.partner.loading')} />}
      {!loading && error && <ListError message={error} onRetry={() => void reload()} />}
      {!loading && !error && days.length === 0 && (
        <ListEmpty message={t('bookings.slots.emptyWeek')} />
      )}
      {!loading &&
        !error &&
        days.map(([day, slots]) => (
          <div key={day} className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-white/70">
              {formatDayLabel(slots[0]!.startsAt, i18n.language)}
            </h4>
            <ul className="space-y-2">
              {slots.map((slot) => {
                const free = Math.max(
                  0,
                  slot.capacityTotal - slot.capacityReserved - slot.capacitySold
                );
                return (
                  <li
                    key={slot.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">
                        {formatSlotTime(slot.startsAt, i18n.language)}
                      </p>
                      <p className="text-xs text-white/60">
                        {slot.status === 'open'
                          ? t('bookings.slots.capacity', {
                              sold: slot.capacitySold,
                              reserved: slot.capacityReserved,
                              free,
                            })
                          : t(
                              slot.status === 'canceled'
                                ? 'bookings.slots.statusCanceled'
                                : 'bookings.slots.statusClosed'
                            )}
                      </p>
                    </div>
                    {slot.status === 'open' && (
                      <button
                        type="button"
                        onClick={() => requestCancel(slot)}
                        className={BUTTON_SECONDARY}
                      >
                        {t('bookings.slots.cancelSlot')}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      <SlotCreationForm onCreate={handleCreate} />
      <ConfirmDialog data={confirm} />
    </section>
  );
}

=== src/domain/bookings/components/partner/SlotCreationForm.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateSlotsPayload } from '../../types/bookings';
import { fortalezaInputToIso } from '../../utils/dates';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT } from '../shared/ListState';

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

interface SlotCreationFormProps {
  onCreate: (payload: CreateSlotsPayload) => Promise<void>;
}

/** Monta o pedido de criação; datas e horas digitadas são do fuso de Fortaleza. */
export function buildSlotsPayload(state: {
  mode: 'recurrence' | 'list';
  capacity: string;
  startDate: string;
  endDate: string;
  weekdays: number[];
  times: string;
  single: string;
}): CreateSlotsPayload | null {
  const capacity = Number(state.capacity);
  if (!Number.isInteger(capacity) || capacity < 1) return null;
  if (state.mode === 'list') {
    const startsAt = fortalezaInputToIso(state.single);
    return startsAt ? { mode: 'list', capacity, slots: [{ startsAt }] } : null;
  }
  const times = state.times
    .split(',')
    .map((time) => time.trim())
    .filter(Boolean);
  if (!state.startDate || !state.endDate || state.weekdays.length === 0 || times.length === 0)
    return null;
  if (times.some((time) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) return null;
  return {
    mode: 'recurrence',
    capacity,
    startDate: state.startDate,
    endDate: state.endDate,
    weekdays: [...state.weekdays].sort(),
    times,
  };
}

export function SlotCreationForm({ onCreate }: SlotCreationFormProps) {
  const { t } = useTranslation();
  const [state, setState] = useState({
    mode: 'recurrence' as 'recurrence' | 'list',
    capacity: '10',
    startDate: '',
    endDate: '',
    weekdays: [] as number[],
    times: '08:00',
    single: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const payload = buildSlotsPayload(state);

  const toggleWeekday = (day: number) =>
    setState((current) => ({
      ...current,
      weekdays: current.weekdays.includes(day)
        ? current.weekdays.filter((value) => value !== day)
        : [...current.weekdays, day],
    }));

  return (
    <form
      className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!payload) return;
        setSubmitting(true);
        try {
          await onCreate(payload);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <h4 className="text-sm font-bold text-white">{t('bookings.slots.createTitle')}</h4>
      <div role="radiogroup" className="flex gap-2">
        {(['recurrence', 'list'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={state.mode === mode}
            onClick={() => setState((current) => ({ ...current, mode }))}
            className={`${BUTTON_SECONDARY} ${state.mode === mode ? 'ring-2 ring-teal-400/60' : ''}`}
          >
            {mode === 'recurrence'
              ? t('bookings.slots.modeRecurrence')
              : t('bookings.slots.modeSingle')}
          </button>
        ))}
      </div>
      {state.mode === 'recurrence' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs text-white/70">{t('bookings.slots.startDate')}</span>
              <input
                type="date"
                value={state.startDate}
                onChange={(e) => setState({ ...state, startDate: e.target.value })}
                className={INPUT}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-white/70">{t('bookings.slots.endDate')}</span>
              <input
                type="date"
                value={state.endDate}
                onChange={(e) => setState({ ...state, endDate: e.target.value })}
                className={INPUT}
              />
            </label>
          </div>
          <fieldset>
            <legend className="text-xs text-white/70 mb-1">{t('bookings.slots.weekdays')}</legend>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={state.weekdays.includes(day)}
                  onClick={() => toggleWeekday(day)}
                  className={`min-h-11 min-w-11 rounded-xl text-xs font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
                    state.weekdays.includes(day)
                      ? 'bg-teal-500/25 text-teal-100'
                      : 'bg-white/5 text-white/70'
                  }`}
                >
                  {t(`bookings.weekdays.${day}`)}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block space-y-1">
            <span className="text-xs text-white/70">{t('bookings.slots.times')}</span>
            <input
              value={state.times}
              onChange={(e) => setState({ ...state, times: e.target.value })}
              className={INPUT}
            />
          </label>
        </>
      ) : (
        <label className="block space-y-1">
          <span className="text-xs text-white/70">{t('bookings.slots.singleDateTime')}</span>
          <input
            type="datetime-local"
            value={state.single}
            onChange={(e) => setState({ ...state, single: e.target.value })}
            className={INPUT}
          />
        </label>
      )}
      <label className="block space-y-1">
        <span className="text-xs text-white/70">{t('bookings.slots.capacityLabel')}</span>
        <input
          type="number"
          min={1}
          inputMode="numeric"
          value={state.capacity}
          onChange={(e) => setState({ ...state, capacity: e.target.value })}
          className={INPUT}
        />
      </label>
      <p className="text-xs text-white/60">{t('bookings.slots.timezoneNotice')}</p>
      <button type="submit" disabled={!payload || submitting} className={BUTTON_PRIMARY}>
        {t('bookings.slots.create')}
      </button>
    </form>
  );
}

=== src/domain/bookings/components/shared/ListState.tsx — ARQUIVO NOVO, conteúdo completo ===
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../../../../ui/components/Skeleton';

export function ListLoading({ label }: { label: string }) {
  return (
    <div role="status" className="space-y-2">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ListEmpty({ message }: { message: string }) {
  return <p className="py-6 text-center text-sm text-white/60">{message}</p>;
}

export function ListError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/25"
    >
      <AlertCircle size={16} className="text-red-400 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-xs text-red-200">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        <RefreshCw size={13} aria-hidden="true" />
        {t('bookings.partner.retry')}
      </button>
    </div>
  );
}

export const BUTTON_PRIMARY =
  'min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-sm font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';
export const BUTTON_SECONDARY =
  'min-h-11 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';
export const INPUT =
  'w-full min-h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';

=== src/domain/bookings/factory.ts — ARQUIVO NOVO, conteúdo completo ===
import { HttpBookingsAdapter } from './adapters/httpBookingsAdapter';
import type { BookingsApiPort } from './ports/bookingsApiPort';

export const bookingsApi: BookingsApiPort = new HttpBookingsAdapter();

=== src/domain/bookings/hooks/useOfferBookings.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { listOfferBookingsUseCase } from '../application/usecases/listOfferBookingsUseCase';
import { markNoShowUseCase } from '../application/usecases/markNoShowUseCase';
import type { BookingSummary } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

export function useOfferBookings(offerId: string) {
  const [data, setData] = useState<BookingSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (cursor: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const page = await listOfferBookingsUseCase(offerId, cursor);
        setData((current) => (cursor ? [...current, ...page.data] : page.data));
        setNextCursor(page.nextCursor);
      } catch (err: unknown) {
        setError(getBookingErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [offerId]
  );

  useEffect(() => {
    void load(null);
  }, [load]);

  const markNoShow = useCallback(async (bookingId: string) => {
    const updated = await markNoShowUseCase(bookingId);
    setData((current) =>
      current.map((item) => (item.id === bookingId ? { ...item, ...updated } : item))
    );
  }, []);

  return {
    data,
    loading,
    error,
    hasMore: nextCursor !== null,
    reload: () => load(null),
    loadMore: () => load(nextCursor),
    markNoShow,
  };
}

=== src/domain/bookings/hooks/usePartnerOffers.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { createOfferUseCase } from '../application/usecases/createOfferUseCase';
import { listPartnerOffersUseCase } from '../application/usecases/listPartnerOffersUseCase';
import { setOfferStatusUseCase } from '../application/usecases/setOfferStatusUseCase';
import { updateOfferUseCase } from '../application/usecases/updateOfferUseCase';
import type { CreateOfferPayload, OfferFields, OfferStatus, PartnerOffer } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

export function usePartnerOffers() {
  const [data, setData] = useState<PartnerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listPartnerOffersUseCase());
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const replace = useCallback((offer: PartnerOffer) => {
    setData((current) => {
      const exists = current.some((item) => item.id === offer.id);
      return exists
        ? current.map((item) => (item.id === offer.id ? offer : item))
        : [...current, offer];
    });
    return offer;
  }, []);

  const create = useCallback(
    async (payload: CreateOfferPayload) => replace(await createOfferUseCase(payload)),
    [replace]
  );
  const update = useCallback(
    async (offerId: string, payload: Partial<OfferFields>) =>
      replace(await updateOfferUseCase(offerId, payload)),
    [replace]
  );
  const setStatus = useCallback(
    async (offerId: string, status: Exclude<OfferStatus, 'draft'>) =>
      replace(await setOfferStatusUseCase(offerId, status)),
    [replace]
  );

  return { data, loading, error, reload, create, update, setStatus };
}

=== src/domain/bookings/hooks/usePartnerSlots.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { cancelSlotUseCase } from '../application/usecases/cancelSlotUseCase';
import { createSlotsUseCase } from '../application/usecases/createSlotsUseCase';
import { listPartnerSlotsUseCase } from '../application/usecases/listPartnerSlotsUseCase';
import type { CreateSlotsPayload, PartnerSlot } from '../types/bookings';
import { addDays } from '../utils/dates';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

/** Horários de uma semana (início em `weekStart`, domingo 00:00 em Fortaleza). */
export function usePartnerSlots(offerId: string, weekStart: Date) {
  const [data, setData] = useState<PartnerSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fromIso = weekStart.toISOString();
  const toIso = addDays(weekStart, 7).toISOString();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listPartnerSlotsUseCase(offerId, fromIso, toIso));
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [offerId, fromIso, toIso]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const create = useCallback(
    async (payload: CreateSlotsPayload) => {
      const created = await createSlotsUseCase(offerId, payload);
      await reload();
      return created;
    },
    [offerId, reload]
  );

  const cancel = useCallback(
    async (slotId: string) => {
      const result = await cancelSlotUseCase(offerId, slotId);
      await reload();
      return result;
    },
    [offerId, reload]
  );

  return { data, loading, error, reload, create, cancel };
}

=== src/domain/bookings/index.ts — ARQUIVO NOVO, conteúdo completo ===
// Componente público apenas para src/app/compositions (AGENTS.md §5.2 item 5).
export { PartnerOffersManager } from './components/partner/PartnerOffersManager';
export type { BookableGuideItem } from './types/bookings';

=== src/domain/bookings/ports/bookingsApiPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type {
  BookingSummary,
  CreateOfferPayload,
  CreateSlotsPayload,
  OfferFields,
  OfferStatus,
  Page,
  PartnerOffer,
  PartnerSlot,
} from '../types/bookings';

export interface BookingsApiPort {
  listPartnerOffers(): Promise<PartnerOffer[]>;
  createOffer(payload: CreateOfferPayload): Promise<PartnerOffer>;
  updateOffer(offerId: string, payload: Partial<OfferFields>): Promise<PartnerOffer>;
  setOfferStatus(offerId: string, status: Exclude<OfferStatus, 'draft'>): Promise<PartnerOffer>;
  listPartnerSlots(offerId: string, fromIso: string, toIso: string): Promise<PartnerSlot[]>;
  createSlots(offerId: string, payload: CreateSlotsPayload): Promise<PartnerSlot[]>;
  cancelSlot(offerId: string, slotId: string): Promise<{ canceledBookings: number }>;
  listOfferBookings(offerId: string, cursor?: string | null): Promise<Page<BookingSummary>>;
  markNoShow(bookingId: string): Promise<BookingSummary>;
}

=== src/domain/bookings/schemas/offerFormSchema.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';
import { parseReaisToMinor } from '../utils/money';

// As mensagens são chaves de tradução; o formulário mostra t(mensagem) (AGENTS.md §12.5).
const required = 'bookings.validation.required';
const tooLong = 'bookings.validation.tooLong';
const integer = 'bookings.validation.integer';

const optionalText = (max: number) => z.string().trim().max(max, tooLong);

export const offerFormSchema = z.object({
  kind: z.enum(['tour', 'private_entry']),
  title: z.object({
    'pt-BR': z.string().trim().min(1, required).max(120, tooLong),
    en: optionalText(120),
    fr: optionalText(120),
  }),
  description: z.object({
    'pt-BR': optionalText(5000),
    en: optionalText(5000),
    fr: optionalText(5000),
  }),
  priceOptions: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().trim().min(1, required).max(60, tooLong),
        amount: z
          .string()
          .refine(
            (value) => (parseReaisToMinor(value) ?? 0) > 0,
            'bookings.validation.priceInvalid'
          ),
      })
    )
    .min(1, 'bookings.validation.atLeastOnePrice')
    .max(10),
  durationMinutes: z.coerce.number().int(integer).min(15, integer).max(1440, integer),
  meetingPoint: optionalText(300),
  freeCancellationHoursBefore: z.coerce.number().int(integer).min(0, integer).max(720, integer),
  refundPercentAfterDeadline: z.enum(['0', '50', '100']),
  maxParticipantsPerBooking: z.coerce.number().int(integer).min(1, integer).max(50, integer),
  requiresParticipantNames: z.boolean(),
});

export type OfferFormInput = z.input<typeof offerFormSchema>;
export type OfferFormValues = z.output<typeof offerFormSchema>;

=== src/domain/bookings/types/bookings.ts — ARQUIVO NOVO, conteúdo completo ===
/** Espelho neutro dos DTOs de saída da API de reservas (server/interfaces/http/bookings). */
export type LocalizedText = { 'pt-BR': string; en?: string; fr?: string };

export type OfferKind = 'tour' | 'private_entry';
export type OfferStatus = 'draft' | 'published' | 'paused' | 'archived';
export type RefundPercent = 0 | 50 | 100;

export interface PriceOption {
  id: string;
  label: LocalizedText;
  unitAmountMinor: number;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface CancellationPolicy {
  freeCancellationHoursBefore: number;
  refundPercentAfterDeadline: RefundPercent;
}

export interface OfferFields {
  title: LocalizedText;
  description?: LocalizedText;
  pricing: { currency: 'BRL'; priceOptions: PriceOption[] };
  durationMinutes?: number;
  meetingPoint?: { address: string; instructions?: LocalizedText };
  cancellationPolicy: CancellationPolicy;
  maxParticipantsPerBooking: number;
  requiresParticipantNames: boolean;
}

export interface PartnerOffer extends OfferFields {
  id: string;
  guideItemId: string;
  kind: OfferKind;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferPayload extends OfferFields {
  guideItemId: string;
  kind: OfferKind;
}

export type SlotStatus = 'open' | 'closed' | 'canceled';

export interface PartnerSlot {
  id: string;
  startsAt: string;
  endsAt: string | null;
  capacityTotal: number;
  capacityReserved: number;
  capacitySold: number;
  status: SlotStatus;
}

export interface PublicSlot {
  id: string;
  startsAt: string;
  endsAt?: string;
  available: number;
}

export type CreateSlotsPayload =
  | { mode: 'list'; capacity: number; slots: Array<{ startsAt: string }> }
  | {
      mode: 'recurrence';
      capacity: number;
      startDate: string;
      endDate: string;
      weekdays: number[];
      times: string[];
    };

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'completed'
  | 'canceled'
  | 'refunded'
  | 'expired'
  | 'no_show'
  | 'disputed';

export interface BookingSummary {
  id: string;
  offerId: string;
  slotId: string;
  guideItemId: string;
  kind: OfferKind;
  status: BookingStatus;
  lines: Array<{ priceOptionId: string; quantity: number; unitAmountMinor: number }>;
  participantsCount: number;
  totalMinor: number;
  expiresAt: string | null;
  offer: {
    title: string;
    startsAt: string;
    durationMinutes: number | null;
    meetingPoint: string | null;
    cancellationPolicy: CancellationPolicy;
  };
  cancellation: {
    by: 'buyer' | 'partner' | 'system';
    refundPercent: RefundPercent;
    refundAmountMinor: number;
    at: string;
  } | null;
  createdAt: string;
  /** Só na visão do parceiro vendedor. */
  buyerId?: string;
  platformFeeMinor?: number;
}

export interface Page<T> {
  data: T[];
  nextCursor: string | null;
}

/** Item do guia do parceiro que pode virar oferta (passeio ou atração). */
export interface BookableGuideItem {
  id: string;
  name: string;
  category: string;
}

=== src/domain/bookings/utils/bookingErrorMessage.ts — ARQUIVO NOVO, conteúdo completo ===
import { i18n } from '../../../shared/i18n';

const KNOWN_CODES = [
  'VALIDATION_ERROR',
  'FORBIDDEN',
  'EMAIL_NOT_VERIFIED',
  'NOT_FOUND',
  'SLOT_UNAVAILABLE',
  'INSUFFICIENT_CAPACITY',
  'INVALID_TRANSITION',
  'LATE_PAYMENT_REJECTED',
  'KIND_NOT_AVAILABLE',
  'CANCELLATION_NOT_ALLOWED',
  'SELLER_ACCOUNT_NOT_ELIGIBLE',
  'INTERNAL_ERROR',
] as const;

/** Traduz o `code` estável do backend (AGENTS.md §12.5). */
export function getBookingErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  const known = (KNOWN_CODES as readonly string[]).includes(code) ? code : 'INTERNAL_ERROR';
  return i18n.t(`bookings.errors.${known}`);
}

=== src/domain/bookings/utils/bookingsFrontendUtils.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { buildSlotsPayload } from '../components/partner/SlotCreationForm';
import { fortalezaDateKey, fortalezaInputToIso, startOfFortalezaWeek } from './dates';
import { formatMinor, minorToReaisInput, parseReaisToMinor } from './money';
import { emptyOfferFormValues, offerFormToFields } from './offerFormMapping';

describe('dinheiro', () => {
  it('converte reais digitados em centavos inteiros', () => {
    expect(parseReaisToMinor('150,90')).toBe(15090);
    expect(parseReaisToMinor('150.9')).toBe(15090);
    expect(parseReaisToMinor('1.234,56')).toBe(123456);
    expect(parseReaisToMinor('R$ 80')).toBe(8000);
    expect(parseReaisToMinor('abc')).toBeNull();
    expect(parseReaisToMinor('')).toBeNull();
    expect(minorToReaisInput(15090)).toBe('150,90');
  });

  it('formata BRL no idioma pedido', () => {
    expect(formatMinor(15090, 'pt-BR')).toMatch(/R\$\s?150,90/);
    expect(formatMinor(15090, 'en')).toMatch(/R\$\s?150\.90/);
  });
});

describe('datas no fuso de Fortaleza', () => {
  it('converte o horário digitado em UTC e agrupa pelo dia local', () => {
    expect(fortalezaInputToIso('2026-11-02T08:00')).toBe('2026-11-02T11:00:00.000Z');
    expect(fortalezaDateKey('2026-11-03T01:30:00.000Z')).toBe('2026-11-02');
  });

  it('a semana começa no domingo 00:00 de Fortaleza', () => {
    // Quarta, 04/11/2026 10:00 local → domingo 01/11 00:00 local = 03:00Z.
    expect(startOfFortalezaWeek(new Date('2026-11-04T13:00:00.000Z')).toISOString()).toBe(
      '2026-11-01T03:00:00.000Z'
    );
  });
});

describe('formulário de oferta', () => {
  it('envia o preço em centavos e omite traduções vazias', () => {
    const values = emptyOfferFormValues('tour');
    values.title['pt-BR'] = 'Passeio';
    values.priceOptions = [{ id: 'adult', label: 'Adulto', amount: '150,90' }];
    const fields = offerFormToFields(values);
    expect(fields.pricing.priceOptions[0]?.unitAmountMinor).toBe(15090);
    expect(fields.title).toEqual({ 'pt-BR': 'Passeio' });
    expect(fields).not.toHaveProperty('description');
    expect(fields.cancellationPolicy).toEqual({
      freeCancellationHoursBefore: 24,
      refundPercentAfterDeadline: 50,
    });
  });
});

describe('criação de horários', () => {
  const base = {
    capacity: '8',
    startDate: '2026-11-02',
    endDate: '2026-11-30',
    times: '08:00, 14:30',
    single: '',
  };

  it('recorrência envia dias da semana e horários corretos', () => {
    expect(buildSlotsPayload({ ...base, mode: 'recurrence', weekdays: [5, 1] })).toEqual({
      mode: 'recurrence',
      capacity: 8,
      startDate: '2026-11-02',
      endDate: '2026-11-30',
      weekdays: [1, 5],
      times: ['08:00', '14:30'],
    });
  });

  it('horário inválido, sem dia da semana ou capacidade zero não monta o pedido', () => {
    expect(
      buildSlotsPayload({ ...base, mode: 'recurrence', weekdays: [1], times: '8h' })
    ).toBeNull();
    expect(buildSlotsPayload({ ...base, mode: 'recurrence', weekdays: [] })).toBeNull();
    expect(
      buildSlotsPayload({ ...base, mode: 'recurrence', weekdays: [1], capacity: '0' })
    ).toBeNull();
  });

  it('avulso converte a data local para UTC', () => {
    expect(
      buildSlotsPayload({ ...base, mode: 'list', weekdays: [], single: '2026-11-05T09:00' })
    ).toEqual({
      mode: 'list',
      capacity: 8,
      slots: [{ startsAt: '2026-11-05T12:00:00.000Z' }],
    });
  });
});

=== src/domain/bookings/utils/dates.ts — ARQUIVO NOVO, conteúdo completo ===
// Horário de passeio é sempre exibido no fuso do negócio (AGENTS.md §1 e §12.4).
const BUSINESS_TIME_ZONE = 'America/Fortaleza';
const FORTALEZA_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

export function formatSlotDateTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatSlotTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: BUSINESS_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatDayLabel(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date(iso));
}

/** Data local de Fortaleza (AAAA-MM-DD) de um instante; agrupa horários por dia. */
export function fortalezaDateKey(iso: string): string {
  return new Date(new Date(iso).getTime() - FORTALEZA_OFFSET_MS).toISOString().slice(0, 10);
}

/** Início (domingo 00:00 em Fortaleza) da semana que contém `reference`, em UTC. */
export function startOfFortalezaWeek(reference: Date): Date {
  const local = new Date(reference.getTime() - FORTALEZA_OFFSET_MS);
  const midnightLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  return new Date(midnightLocal - local.getUTCDay() * DAY_MS + FORTALEZA_OFFSET_MS);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Converte "AAAA-MM-DDTHH:MM" digitado (hora de Fortaleza) em ISO UTC. */
export function fortalezaInputToIso(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d, h, min] = match.map(Number) as [number, number, number, number, number, number];
  return new Date(Date.UTC(y, m - 1, d, h, min) + FORTALEZA_OFFSET_MS).toISOString();
}

=== src/domain/bookings/utils/money.ts — ARQUIVO NOVO, conteúdo completo ===
/** Formata centavos em BRL no idioma ativo (AGENTS.md §12.4). */
export function formatMinor(amountMinor: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(
    amountMinor / 100
  );
}

/**
 * Converte o valor digitado em reais ("150,90", "150.90", "1.234,56") em centavos inteiros.
 * Devolve null quando o texto não é um valor válido.
 */
export function parseReaisToMinor(input: string): number | null {
  const trimmed = input.trim().replace(/\s|R\$/g, '');
  if (
    !/^\d{1,3}([.,]?\d{3})*([.,]\d{1,2})?$/.test(trimmed) &&
    !/^\d+([.,]\d{1,2})?$/.test(trimmed)
  ) {
    return null;
  }
  const decimalMatch = /[.,](\d{1,2})$/.exec(trimmed);
  const integerPart = (decimalMatch ? trimmed.slice(0, decimalMatch.index) : trimmed).replace(
    /[.,]/g,
    ''
  );
  const decimals = decimalMatch ? decimalMatch[1]!.padEnd(2, '0') : '00';
  return Number(integerPart) * 100 + Number(decimals);
}

export function minorToReaisInput(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2).replace('.', ',');
}

=== src/domain/bookings/utils/offerFormMapping.ts — ARQUIVO NOVO, conteúdo completo ===
import type { OfferFormValues } from '../schemas/offerFormSchema';
import type { LocalizedText, OfferFields, PartnerOffer, RefundPercent } from '../types/bookings';
import { minorToReaisInput, parseReaisToMinor } from './money';

function toLocalized(value: { 'pt-BR': string; en: string; fr: string }): LocalizedText {
  return {
    'pt-BR': value['pt-BR'].trim(),
    ...(value.en.trim() ? { en: value.en.trim() } : {}),
    ...(value.fr.trim() ? { fr: value.fr.trim() } : {}),
  };
}

/** Converte o formulário (valores em reais digitados) no corpo da API (centavos inteiros). */
export function offerFormToFields(values: OfferFormValues): OfferFields {
  const description = toLocalized(values.description);
  return {
    title: toLocalized(values.title),
    ...(description['pt-BR'] ? { description } : {}),
    pricing: {
      currency: 'BRL',
      priceOptions: values.priceOptions.map((option) => ({
        id: option.id,
        label: { 'pt-BR': option.label.trim() },
        unitAmountMinor: parseReaisToMinor(option.amount) ?? 0,
      })),
    },
    durationMinutes: values.durationMinutes,
    ...(values.meetingPoint.trim()
      ? { meetingPoint: { address: values.meetingPoint.trim() } }
      : {}),
    cancellationPolicy: {
      freeCancellationHoursBefore: values.freeCancellationHoursBefore,
      refundPercentAfterDeadline: Number(values.refundPercentAfterDeadline) as RefundPercent,
    },
    maxParticipantsPerBooking: values.maxParticipantsPerBooking,
    requiresParticipantNames: values.requiresParticipantNames,
  };
}

export function offerToFormValues(offer: PartnerOffer): OfferFormValues {
  return {
    kind: offer.kind,
    title: { 'pt-BR': offer.title['pt-BR'], en: offer.title.en ?? '', fr: offer.title.fr ?? '' },
    description: {
      'pt-BR': offer.description?.['pt-BR'] ?? '',
      en: offer.description?.en ?? '',
      fr: offer.description?.fr ?? '',
    },
    priceOptions: offer.pricing.priceOptions.map((option) => ({
      id: option.id,
      label: option.label['pt-BR'],
      amount: minorToReaisInput(option.unitAmountMinor),
    })),
    durationMinutes: offer.durationMinutes ?? 60,
    meetingPoint: offer.meetingPoint?.address ?? '',
    freeCancellationHoursBefore: offer.cancellationPolicy.freeCancellationHoursBefore,
    refundPercentAfterDeadline: String(offer.cancellationPolicy.refundPercentAfterDeadline) as
      | '0'
      | '50'
      | '100',
    maxParticipantsPerBooking: offer.maxParticipantsPerBooking,
    requiresParticipantNames: offer.requiresParticipantNames,
  };
}

export function emptyOfferFormValues(kind: 'tour' | 'private_entry'): OfferFormValues {
  return {
    kind,
    title: { 'pt-BR': '', en: '', fr: '' },
    description: { 'pt-BR': '', en: '', fr: '' },
    priceOptions: [{ id: 'adult', label: '', amount: '' }],
    durationMinutes: 120,
    meetingPoint: '',
    freeCancellationHoursBefore: 24,
    refundPercentAfterDeadline: '50',
    maxParticipantsPerBooking: 8,
    requiresParticipantNames: false,
  };
}

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -55,6 +55,9 @@ export interface PartnerPanelProps {
   }) => React.ReactNode;
   renderEventTicketingManager?: (eventListingId: string) => React.ReactNode;
   planSubscriptionSlot?: React.ReactNode;
+  renderBookableOffersManager?: (
+    items: Array<{ id: string; name: string; category: string }>
+  ) => React.ReactNode;
 }
 
 export function PartnerPanel({
@@ -65,6 +68,7 @@ export function PartnerPanel({
   renderCheckoutModal,
   renderEventTicketingManager,
   planSubscriptionSlot,
+  renderBookableOffersManager,
 }: PartnerPanelProps) {
   const navigate = useNavigate();
 
@@ -247,25 +251,30 @@ export function PartnerPanel({
             </div>
           )
         ) : activeTab === 'items' ? (
-          <PartnerItemsTable
-            itemsList={itemsList}
-            loading={dataLoading}
-            onEditItem={(item) => handleEditItem(item)}
-            onToggleActive={handleToggleActive}
-            onCreateNew={() => {
-              const emptyForm = getEmptyFormData('');
-              setEditorFormData(emptyForm);
-              setCurrentStep(1);
-              setIsEditing({
-                id: '',
-                name: '',
-                description: '',
-                category: '',
-                image: '',
-                location: '',
-              });
-            }}
-          />
+          <>
+            <PartnerItemsTable
+              itemsList={itemsList}
+              loading={dataLoading}
+              onEditItem={(item) => handleEditItem(item)}
+              onToggleActive={handleToggleActive}
+              onCreateNew={() => {
+                const emptyForm = getEmptyFormData('');
+                setEditorFormData(emptyForm);
+                setCurrentStep(1);
+                setIsEditing({
+                  id: '',
+                  name: '',
+                  description: '',
+                  category: '',
+                  image: '',
+                  location: '',
+                });
+              }}
+            />
+            {renderBookableOffersManager?.(
+              itemsList.map((item) => ({ id: item.id, name: item.name, category: item.category }))
+            )}
+          </>
         ) : (
           <PartnerEventsTable
             eventsList={eventsList}

=== src/shared/i18n/bookingsResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos do domínio bookings (pt-BR é a fonte; en e fr têm as mesmas chaves, garantidas pelo tipo). */
export interface BookingsTranslation {
  partner: {
    sectionTitle: string;
    sectionDescription: string;
    noEligibleItems: string;
    newOffer: string;
    emptyOffers: string;
    loading: string;
    loadError: string;
    retry: string;
    publish: string;
    pause: string;
    archive: string;
    edit: string;
    manageSlots: string;
    viewBookings: string;
    confirmArchive: string;
    actionFailed: string;
    stripeRequired: string;
    fromPrice: string;
  };
  status: {
    draft: string;
    published: string;
    paused: string;
    archived: string;
  };
  kind: {
    tour: string;
    private_entry: string;
  };
  editor: {
    titleNew: string;
    titleEdit: string;
    languageTabs: string;
    titleLabel: string;
    descriptionLabel: string;
    optionalTranslation: string;
    pricingLegend: string;
    priceLabel: string;
    priceAmount: string;
    addPriceOption: string;
    removePriceOption: string;
    durationLabel: string;
    meetingPointLabel: string;
    policyLegend: string;
    freeHoursLabel: string;
    refundAfterLabel: string;
    refundNone: string;
    refundHalf: string;
    refundFull: string;
    maxParticipantsLabel: string;
    requireNamesLabel: string;
    save: string;
    cancel: string;
    saveFailed: string;
  };
  validation: {
    required: string;
    tooLong: string;
    priceInvalid: string;
    integer: string;
    atLeastOnePrice: string;
  };
  slots: {
    title: string;
    previousWeek: string;
    nextWeek: string;
    emptyWeek: string;
    capacity: string;
    createTitle: string;
    modeRecurrence: string;
    modeSingle: string;
    startDate: string;
    endDate: string;
    weekdays: string;
    times: string;
    singleDateTime: string;
    capacityLabel: string;
    create: string;
    created_one: string;
    created_other: string;
    createFailed: string;
    cancelSlot: string;
    confirmCancelSlot: string;
    canceled_one: string;
    canceled_other: string;
    statusClosed: string;
    statusCanceled: string;
    timezoneNotice: string;
  };
  weekdays: {
    '0': string;
    '1': string;
    '2': string;
    '3': string;
    '4': string;
    '5': string;
    '6': string;
  };
  bookingsList: {
    title: string;
    empty: string;
    participants_one: string;
    participants_other: string;
    markNoShow: string;
    loadMore: string;
    loadError: string;
  };
  bookingStatus: {
    pending_payment: string;
    confirmed: string;
    completed: string;
    canceled: string;
    refunded: string;
    expired: string;
    no_show: string;
    disputed: string;
  };
  errors: {
    VALIDATION_ERROR: string;
    FORBIDDEN: string;
    EMAIL_NOT_VERIFIED: string;
    NOT_FOUND: string;
    SLOT_UNAVAILABLE: string;
    INSUFFICIENT_CAPACITY: string;
    INVALID_TRANSITION: string;
    LATE_PAYMENT_REJECTED: string;
    KIND_NOT_AVAILABLE: string;
    CANCELLATION_NOT_ALLOWED: string;
    SELLER_ACCOUNT_NOT_ELIGIBLE: string;
    INTERNAL_ERROR: string;
  };
}

export const bookingsPtBR: BookingsTranslation = {
  partner: {
    sectionTitle: 'Reservas e horários',
    sectionDescription: 'Venda horários dos seus passeios e entradas das suas atrações.',
    noEligibleItems: 'Cadastre um passeio ou uma atração para vender reservas.',
    newOffer: 'Nova oferta',
    emptyOffers: 'Nenhuma oferta para este item.',
    loading: 'Carregando ofertas…',
    loadError: 'Não foi possível carregar as ofertas.',
    retry: 'Tentar novamente',
    publish: 'Publicar',
    pause: 'Pausar',
    archive: 'Arquivar',
    edit: 'Editar',
    manageSlots: 'Horários',
    viewBookings: 'Reservas',
    confirmArchive: 'Arquivar esta oferta? Ela sai do site e não pode ser reaberta.',
    actionFailed: 'Não foi possível concluir a ação.',
    stripeRequired: 'Para vender reservas, conclua a configuração financeira da sua conta.',
    fromPrice: 'a partir de {{amount}}',
  },
  status: {
    draft: 'Rascunho',
    published: 'Publicada',
    paused: 'Pausada',
    archived: 'Arquivada',
  },
  kind: {
    tour: 'Passeio',
    private_entry: 'Entrada de atração',
  },
  editor: {
    titleNew: 'Nova oferta',
    titleEdit: 'Editar oferta',
    languageTabs: 'Idioma do texto',
    titleLabel: 'Título',
    descriptionLabel: 'Descrição',
    optionalTranslation: 'Tradução opcional',
    pricingLegend: 'Preços',
    priceLabel: 'Nome da opção',
    priceAmount: 'Valor (R$)',
    addPriceOption: 'Adicionar opção de preço',
    removePriceOption: 'Remover opção de preço',
    durationLabel: 'Duração (minutos)',
    meetingPointLabel: 'Ponto de encontro',
    policyLegend: 'Política de cancelamento',
    freeHoursLabel: 'Cancelamento grátis até quantas horas antes',
    refundAfterLabel: 'Reembolso depois desse prazo',
    refundNone: 'Sem reembolso',
    refundHalf: '50%',
    refundFull: '100%',
    maxParticipantsLabel: 'Máximo de participantes por reserva',
    requireNamesLabel: 'Pedir o nome de cada participante',
    save: 'Salvar',
    cancel: 'Cancelar',
    saveFailed: 'Não foi possível salvar a oferta.',
  },
  validation: {
    required: 'Campo obrigatório.',
    tooLong: 'Texto longo demais.',
    priceInvalid: 'Informe um valor maior que zero.',
    integer: 'Informe um número inteiro.',
    atLeastOnePrice: 'Informe ao menos uma opção de preço.',
  },
  slots: {
    title: 'Horários',
    previousWeek: 'Semana anterior',
    nextWeek: 'Próxima semana',
    emptyWeek: 'Nenhum horário nesta semana.',
    capacity: '{{sold}} vendidas · {{reserved}} reservadas · {{free}} livres',
    createTitle: 'Criar horários',
    modeRecurrence: 'Recorrente',
    modeSingle: 'Avulso',
    startDate: 'De',
    endDate: 'Até',
    weekdays: 'Dias da semana',
    times: 'Horários (HH:MM, separados por vírgula)',
    singleDateTime: 'Data e hora',
    capacityLabel: 'Vagas por horário',
    create: 'Criar horários',
    created_one: '{{count}} horário criado.',
    created_other: '{{count}} horários criados.',
    createFailed: 'Não foi possível criar os horários.',
    cancelSlot: 'Cancelar horário',
    confirmCancelSlot:
      'Cancelar este horário? Todas as reservas pagas serão reembolsadas integralmente.',
    canceled_one: 'Horário cancelado. {{count}} reserva reembolsada.',
    canceled_other: 'Horário cancelado. {{count}} reservas reembolsadas.',
    statusClosed: 'Fechado',
    statusCanceled: 'Cancelado',
    timezoneNotice: 'Horários no fuso de Fortaleza (UTC−3).',
  },
  weekdays: {
    '0': 'Dom',
    '1': 'Seg',
    '2': 'Ter',
    '3': 'Qua',
    '4': 'Qui',
    '5': 'Sex',
    '6': 'Sáb',
  },
  bookingsList: {
    title: 'Reservas',
    empty: 'Nenhuma reserva ainda.',
    participants_one: '{{count}} participante',
    participants_other: '{{count}} participantes',
    markNoShow: 'Marcar não comparecimento',
    loadMore: 'Carregar mais',
    loadError: 'Não foi possível carregar as reservas.',
  },
  bookingStatus: {
    pending_payment: 'Aguardando pagamento',
    confirmed: 'Confirmada',
    completed: 'Concluída',
    canceled: 'Cancelada',
    refunded: 'Reembolsada',
    expired: 'Expirada',
    no_show: 'Não compareceu',
    disputed: 'Em disputa',
  },
  errors: {
    VALIDATION_ERROR: 'Dados inválidos. Revise e tente novamente.',
    FORBIDDEN: 'Você não tem permissão para esta ação.',
    EMAIL_NOT_VERIFIED: 'Confirme seu e-mail antes de reservar.',
    NOT_FOUND: 'Não encontrado.',
    SLOT_UNAVAILABLE: 'Este horário não está mais disponível.',
    INSUFFICIENT_CAPACITY: 'Não há vagas suficientes neste horário.',
    INVALID_TRANSITION: 'Esta mudança não é permitida agora.',
    LATE_PAYMENT_REJECTED: 'O pagamento chegou depois do prazo e será devolvido.',
    KIND_NOT_AVAILABLE: 'Este tipo de oferta ainda não está disponível.',
    CANCELLATION_NOT_ALLOWED: 'Esta reserva não pode ser cancelada.',
    SELLER_ACCOUNT_NOT_ELIGIBLE: 'O parceiro ainda não pode receber pagamentos online.',
    INTERNAL_ERROR: 'Algo deu errado. Tente novamente em instantes.',
  },
};

export const bookingsEn: BookingsTranslation = {
  partner: {
    sectionTitle: 'Bookings and time slots',
    sectionDescription: 'Sell time slots for your tours and entries to your attractions.',
    noEligibleItems: 'Add a tour or an attraction to sell bookings.',
    newOffer: 'New offer',
    emptyOffers: 'No offers for this item.',
    loading: 'Loading offers…',
    loadError: 'The offers could not be loaded.',
    retry: 'Try again',
    publish: 'Publish',
    pause: 'Pause',
    archive: 'Archive',
    edit: 'Edit',
    manageSlots: 'Time slots',
    viewBookings: 'Bookings',
    confirmArchive: 'Archive this offer? It leaves the site and cannot be reopened.',
    actionFailed: 'The action could not be completed.',
    stripeRequired: 'To sell bookings, finish your account payment setup.',
    fromPrice: 'from {{amount}}',
  },
  status: {
    draft: 'Draft',
    published: 'Published',
    paused: 'Paused',
    archived: 'Archived',
  },
  kind: {
    tour: 'Tour',
    private_entry: 'Attraction entry',
  },
  editor: {
    titleNew: 'New offer',
    titleEdit: 'Edit offer',
    languageTabs: 'Text language',
    titleLabel: 'Title',
    descriptionLabel: 'Description',
    optionalTranslation: 'Optional translation',
    pricingLegend: 'Prices',
    priceLabel: 'Option name',
    priceAmount: 'Price (R$)',
    addPriceOption: 'Add price option',
    removePriceOption: 'Remove price option',
    durationLabel: 'Duration (minutes)',
    meetingPointLabel: 'Meeting point',
    policyLegend: 'Cancellation policy',
    freeHoursLabel: 'Free cancellation up to how many hours before',
    refundAfterLabel: 'Refund after that deadline',
    refundNone: 'No refund',
    refundHalf: '50%',
    refundFull: '100%',
    maxParticipantsLabel: 'Maximum participants per booking',
    requireNamesLabel: 'Ask for each participant’s name',
    save: 'Save',
    cancel: 'Cancel',
    saveFailed: 'The offer could not be saved.',
  },
  validation: {
    required: 'Required field.',
    tooLong: 'Text is too long.',
    priceInvalid: 'Enter an amount greater than zero.',
    integer: 'Enter a whole number.',
    atLeastOnePrice: 'Add at least one price option.',
  },
  slots: {
    title: 'Time slots',
    previousWeek: 'Previous week',
    nextWeek: 'Next week',
    emptyWeek: 'No time slots this week.',
    capacity: '{{sold}} sold · {{reserved}} reserved · {{free}} free',
    createTitle: 'Create time slots',
    modeRecurrence: 'Recurring',
    modeSingle: 'Single',
    startDate: 'From',
    endDate: 'To',
    weekdays: 'Weekdays',
    times: 'Times (HH:MM, comma separated)',
    singleDateTime: 'Date and time',
    capacityLabel: 'Spots per time slot',
    create: 'Create time slots',
    created_one: '{{count}} time slot created.',
    created_other: '{{count}} time slots created.',
    createFailed: 'The time slots could not be created.',
    cancelSlot: 'Cancel time slot',
    confirmCancelSlot: 'Cancel this time slot? Every paid booking will be fully refunded.',
    canceled_one: 'Time slot canceled. {{count}} booking refunded.',
    canceled_other: 'Time slot canceled. {{count}} bookings refunded.',
    statusClosed: 'Closed',
    statusCanceled: 'Canceled',
    timezoneNotice: 'Times in Fortaleza time (UTC−3).',
  },
  weekdays: {
    '0': 'Sun',
    '1': 'Mon',
    '2': 'Tue',
    '3': 'Wed',
    '4': 'Thu',
    '5': 'Fri',
    '6': 'Sat',
  },
  bookingsList: {
    title: 'Bookings',
    empty: 'No bookings yet.',
    participants_one: '{{count}} participant',
    participants_other: '{{count}} participants',
    markNoShow: 'Mark as no-show',
    loadMore: 'Load more',
    loadError: 'The bookings could not be loaded.',
  },
  bookingStatus: {
    pending_payment: 'Awaiting payment',
    confirmed: 'Confirmed',
    completed: 'Completed',
    canceled: 'Canceled',
    refunded: 'Refunded',
    expired: 'Expired',
    no_show: 'No-show',
    disputed: 'Disputed',
  },
  errors: {
    VALIDATION_ERROR: 'Invalid data. Please review and try again.',
    FORBIDDEN: 'You are not allowed to do this.',
    EMAIL_NOT_VERIFIED: 'Verify your email before booking.',
    NOT_FOUND: 'Not found.',
    SLOT_UNAVAILABLE: 'This time slot is no longer available.',
    INSUFFICIENT_CAPACITY: 'Not enough spots left for this time slot.',
    INVALID_TRANSITION: 'This change is not allowed right now.',
    LATE_PAYMENT_REJECTED: 'The payment arrived after the deadline and will be refunded.',
    KIND_NOT_AVAILABLE: 'This kind of offer is not available yet.',
    CANCELLATION_NOT_ALLOWED: 'This booking cannot be canceled.',
    SELLER_ACCOUNT_NOT_ELIGIBLE: 'This partner cannot receive online payments yet.',
    INTERNAL_ERROR: 'Something went wrong. Please try again shortly.',
  },
};

export const bookingsFr: BookingsTranslation = {
  partner: {
    sectionTitle: 'Réservations et créneaux',
    sectionDescription:
      'Vendez des créneaux pour vos excursions et des entrées pour vos attractions.',
    noEligibleItems: 'Ajoutez une excursion ou une attraction pour vendre des réservations.',
    newOffer: 'Nouvelle offre',
    emptyOffers: 'Aucune offre pour cet élément.',
    loading: 'Chargement des offres…',
    loadError: 'Impossible de charger les offres.',
    retry: 'Réessayer',
    publish: 'Publier',
    pause: 'Mettre en pause',
    archive: 'Archiver',
    edit: 'Modifier',
    manageSlots: 'Créneaux',
    viewBookings: 'Réservations',
    confirmArchive: 'Archiver cette offre ? Elle quitte le site et ne pourra pas être rouverte.',
    actionFailed: 'L’action n’a pas pu aboutir.',
    stripeRequired:
      'Pour vendre des réservations, terminez la configuration financière de votre compte.',
    fromPrice: 'à partir de {{amount}}',
  },
  status: {
    draft: 'Brouillon',
    published: 'Publiée',
    paused: 'En pause',
    archived: 'Archivée',
  },
  kind: {
    tour: 'Excursion',
    private_entry: 'Entrée d’attraction',
  },
  editor: {
    titleNew: 'Nouvelle offre',
    titleEdit: 'Modifier l’offre',
    languageTabs: 'Langue du texte',
    titleLabel: 'Titre',
    descriptionLabel: 'Description',
    optionalTranslation: 'Traduction facultative',
    pricingLegend: 'Tarifs',
    priceLabel: 'Nom de l’option',
    priceAmount: 'Prix (R$)',
    addPriceOption: 'Ajouter une option de tarif',
    removePriceOption: 'Retirer l’option de tarif',
    durationLabel: 'Durée (minutes)',
    meetingPointLabel: 'Point de rendez-vous',
    policyLegend: 'Politique d’annulation',
    freeHoursLabel: 'Annulation gratuite jusqu’à combien d’heures avant',
    refundAfterLabel: 'Remboursement après ce délai',
    refundNone: 'Aucun remboursement',
    refundHalf: '50 %',
    refundFull: '100 %',
    maxParticipantsLabel: 'Nombre maximum de participants par réservation',
    requireNamesLabel: 'Demander le nom de chaque participant',
    save: 'Enregistrer',
    cancel: 'Annuler',
    saveFailed: 'Impossible d’enregistrer l’offre.',
  },
  validation: {
    required: 'Champ obligatoire.',
    tooLong: 'Texte trop long.',
    priceInvalid: 'Indiquez un montant supérieur à zéro.',
    integer: 'Indiquez un nombre entier.',
    atLeastOnePrice: 'Ajoutez au moins une option de tarif.',
  },
  slots: {
    title: 'Créneaux',
    previousWeek: 'Semaine précédente',
    nextWeek: 'Semaine suivante',
    emptyWeek: 'Aucun créneau cette semaine.',
    capacity: '{{sold}} vendues · {{reserved}} réservées · {{free}} libres',
    createTitle: 'Créer des créneaux',
    modeRecurrence: 'Récurrent',
    modeSingle: 'Ponctuel',
    startDate: 'Du',
    endDate: 'Au',
    weekdays: 'Jours de la semaine',
    times: 'Horaires (HH:MM, séparés par des virgules)',
    singleDateTime: 'Date et heure',
    capacityLabel: 'Places par créneau',
    create: 'Créer les créneaux',
    created_one: '{{count}} créneau créé.',
    created_other: '{{count}} créneaux créés.',
    createFailed: 'Impossible de créer les créneaux.',
    cancelSlot: 'Annuler le créneau',
    confirmCancelSlot:
      'Annuler ce créneau ? Toutes les réservations payées seront intégralement remboursées.',
    canceled_one: 'Créneau annulé. {{count}} réservation remboursée.',
    canceled_other: 'Créneau annulé. {{count}} réservations remboursées.',
    statusClosed: 'Fermé',
    statusCanceled: 'Annulé',
    timezoneNotice: 'Horaires à l’heure de Fortaleza (UTC−3).',
  },
  weekdays: {
    '0': 'Dim',
    '1': 'Lun',
    '2': 'Mar',
    '3': 'Mer',
    '4': 'Jeu',
    '5': 'Ven',
    '6': 'Sam',
  },
  bookingsList: {
    title: 'Réservations',
    empty: 'Aucune réservation pour l’instant.',
    participants_one: '{{count}} participant',
    participants_other: '{{count}} participants',
    markNoShow: 'Marquer comme absent',
    loadMore: 'Charger plus',
    loadError: 'Impossible de charger les réservations.',
  },
  bookingStatus: {
    pending_payment: 'En attente de paiement',
    confirmed: 'Confirmée',
    completed: 'Terminée',
    canceled: 'Annulée',
    refunded: 'Remboursée',
    expired: 'Expirée',
    no_show: 'Absent',
    disputed: 'En litige',
  },
  errors: {
    VALIDATION_ERROR: 'Données invalides. Vérifiez et réessayez.',
    FORBIDDEN: 'Vous n’avez pas l’autorisation pour cette action.',
    EMAIL_NOT_VERIFIED: 'Confirmez votre e-mail avant de réserver.',
    NOT_FOUND: 'Introuvable.',
    SLOT_UNAVAILABLE: 'Ce créneau n’est plus disponible.',
    INSUFFICIENT_CAPACITY: 'Il ne reste pas assez de places pour ce créneau.',
    INVALID_TRANSITION: 'Ce changement n’est pas autorisé pour le moment.',
    LATE_PAYMENT_REJECTED: 'Le paiement est arrivé après le délai et sera remboursé.',
    KIND_NOT_AVAILABLE: 'Ce type d’offre n’est pas encore disponible.',
    CANCELLATION_NOT_ALLOWED: 'Cette réservation ne peut pas être annulée.',
    SELLER_ACCOUNT_NOT_ELIGIBLE: 'Ce partenaire ne peut pas encore recevoir de paiements en ligne.',
    INTERNAL_ERROR: 'Un problème est survenu. Réessayez dans un instant.',
  },
};

=== src/shared/i18n/resources.ts — diff ===
@@ -1,4 +1,7 @@
+import { type BookingsTranslation, bookingsEn, bookingsFr, bookingsPtBR } from './bookingsResources';
+
 export interface TranslationResource {
+  bookings: BookingsTranslation;
   common: {
     language: string;
     locales: {
@@ -151,6 +154,7 @@ export interface TranslationResource {
   };
 }
 const ptBR: TranslationResource = {
+  bookings: bookingsPtBR,
   common: {
     language: 'Idioma',
     locales: {
@@ -332,6 +336,7 @@ const ptBR: TranslationResource = {
   },
 };
 const en: TranslationResource = {
+  bookings: bookingsEn,
   common: {
     language: 'Language',
     locales: {
@@ -511,6 +516,7 @@ const en: TranslationResource = {
   },
 };
 const fr: TranslationResource = {
+  bookings: bookingsFr,
   common: {
     language: 'Langue',
     locales: {

VERIFICAÇÃO (obrigatória):
- `npm run typecheck` sem erros; `npx biome lint .` com 0 erros.
- `npm test` → 117 arquivos, 717 testes.
- `npm run build` sem erros.
- Abrir a área do parceiro em `fr` e conferir que nenhum texto fica cortado.
Responda no formato do AGENTS.md §16.3.
~~~~
