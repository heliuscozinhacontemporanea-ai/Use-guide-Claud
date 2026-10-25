# Prompt 18.4b.2 — Taxas por produto, políticas de cancelamento e arrependimento (D14) · Parte 2 de 2 — frontend

> Lote 16, gerado do commit de referência `31e0772` da branch `claude/agents-md-v2`. Aplique depois do 18.4b.1. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4b.2 — Taxas por produto, políticas de cancelamento e arrependimento (D14) · Parte 2 de 2 — frontend

Telas do 18.4b.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8); os campos antigos saem direto e os dados de teste podem ser recriados.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e as remoções. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

Esta é a PARTE 2 de 2 do 18.4b (a parte 1 trouxe o backend e src/shared/utils/cancellationPolicy.ts).

O QUE MUDA:
1) Tipos do frontend: events (salesPolicy, DEFAULT_EVENT_SALES_POLICY com teste de paridade com o backend), ticketing (salesPolicySnapshot, serviceFeeMinor, paidAt) e bookings (a política é o identificador da plataforma).
2) Design system: src/ui/components/RadioCardGroup.tsx (rádios nativos em cartões) e src/shared/hooks/useCancellationPolicyOptions.ts (opções traduzidas; publicadas, só a atual e as mais flexíveis ficam habilitadas).
3) Editor de evento do parceiro: seção de política de cancelamento e de quem paga a taxa de serviço (só em evento pago). Ao abrir o editor, as regras de venda e o tipo de entrada são lidos do evento salvo junto com as sessões (corrige o editor, que abria evento pago como gratuito).
4) Editor de oferta: os campos de horas e percentual saem e entra a escolha entre as políticas da plataforma.
5) Compra de ingresso: EventTicketingPurchasePanel (795 linhas) dividido em useTicketCheckout, useEventSalesPolicy e componentes em ticketing/components/checkout/; antes do pagamento mostra a política, o arrependimento e a taxa de serviço destacada no resumo.
6) Carteira de ingressos: UserTicketsHistoryView (593 linhas) dividido em useTicketWalletActions, utils/ticketWalletRules.ts e componentes em ticketing/components/wallet/; o reembolso mostra o valor previsto num ConfirmDialog antes de pedir.
7) Reservas: a prévia do reembolso e o resumo da política usam as regras novas, inclusive o arrependimento.
8) Tema claro: textos de destaque com o token text-accent e campos com bg-surface; a aba de idioma do editor de oferta fica legível nos dois temas.
9) i18n: namespaces salesPolicy, ticketCheckout e ticketWallet nos 3 idiomas; chaves antigas de política do bookings saem. docs/arquitetura/debitos.md: B16 deixa de citar a carteira de ingressos.

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/shared/kernel/cancellationPolicy.parity.test.ts (criar)
- src/domain/bookings/components/buyer/MyBookingsView.tsx (alterar)
- src/domain/bookings/components/buyer/OfferPolicySummary.tsx (alterar)
- src/domain/bookings/components/buyer/buyerComponents.test.tsx (alterar)
- src/domain/bookings/components/partner/OfferTextFields.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOfferEditor.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOffersManager.tsx (alterar)
- src/domain/bookings/schemas/offerFormSchema.ts (alterar)
- src/domain/bookings/types/bookings.ts (alterar)
- src/domain/bookings/utils/bookingsFrontendUtils.test.ts (alterar)
- src/domain/bookings/utils/offerFormMapping.ts (alterar)
- src/domain/bookings/utils/refundPreview.ts (alterar)
- src/domain/events/index.ts (alterar)
- src/domain/events/types/event.ts (alterar)
- src/domain/guide/components/EventDetailModal.tsx (alterar)
- src/domain/partners/components/PartnerEventForm.tsx (alterar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/components/event/EventSalesPolicySection.tsx (criar)
- src/domain/partners/hooks/usePartnerContentActions.ts (alterar)
- src/domain/partners/hooks/usePartnerEventSessions.ts (alterar)
- src/domain/partners/types/partnerContent.ts (alterar)
- src/domain/ticketing/components/EventTicketingPurchasePanel.tsx (alterar)
- src/domain/ticketing/components/UserTicketsHistoryView.tsx (alterar)
- src/domain/ticketing/components/checkout/IssuedTicketsCard.tsx (criar)
- src/domain/ticketing/components/checkout/OccurrencePicker.tsx (criar)
- src/domain/ticketing/components/checkout/SalesPolicyNotice.tsx (criar)
- src/domain/ticketing/components/checkout/TicketBuyerForm.tsx (criar)
- src/domain/ticketing/components/checkout/TicketOrderPaymentStep.test.tsx (criar)
- src/domain/ticketing/components/checkout/TicketOrderPaymentStep.tsx (criar)
- src/domain/ticketing/components/checkout/TicketTypeList.tsx (criar)
- src/domain/ticketing/components/wallet/ResumePaymentCard.tsx (criar)
- src/domain/ticketing/components/wallet/TransferTicketForm.tsx (criar)
- src/domain/ticketing/components/wallet/WalletOrderCard.tsx (criar)
- src/domain/ticketing/components/wallet/WalletTicketCard.tsx (criar)
- src/domain/ticketing/hooks/useEventSalesPolicy.ts (criar)
- src/domain/ticketing/hooks/useTicketCheckout.ts (criar)
- src/domain/ticketing/hooks/useTicketWalletActions.ts (criar)
- src/domain/ticketing/types/ticketing.ts (alterar)
- src/domain/ticketing/utils/ticketWalletRules.test.ts (criar)
- src/domain/ticketing/utils/ticketWalletRules.ts (criar)
- src/shared/hooks/useCancellationPolicyOptions.ts (criar)
- src/shared/i18n/bookingsResources.ts (alterar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/i18n/salesPolicyResources.ts (criar)
- src/shared/i18n/ticketCheckoutResources.ts (criar)
- src/shared/i18n/ticketWalletResources.ts (criar)
- src/ui/components/RadioCardGroup.tsx (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/shared/kernel/cancellationPolicy.parity.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { DEFAULT_EVENT_SALES_POLICY as FRONTEND_DEFAULT } from '../../../src/domain/events/types/event';
import * as frontend from '../../../src/shared/utils/cancellationPolicy';
import { DEFAULT_EVENT_SALES_POLICY as BACKEND_DEFAULT } from '../../domain/events/types/eventTypes';
import * as backend from './cancellationPolicy';

const FAMILIES = ['event', 'booking', 'transfer'] as const;
const STARTS = '2026-12-31T22:00:00.000Z';
const HOURS = [0, 1, 23, 24, 47, 48, 72, 119, 120, 167, 168, 719, 720, 2000];
const PURCHASES = ['2026-10-01T12:00:00.000Z', '2026-12-28T12:00:00.000Z'];

describe('paridade das políticas de cancelamento frontend × backend', () => {
  it('mesmas listas e prazos', () => {
    expect(frontend.EVENT_CANCELLATION_POLICIES).toEqual(backend.EVENT_CANCELLATION_POLICIES);
    expect(frontend.BOOKING_CANCELLATION_POLICIES).toEqual(backend.BOOKING_CANCELLATION_POLICIES);
    expect(frontend.TRANSFER_CANCELLATION_POLICIES).toEqual(backend.TRANSFER_CANCELLATION_POLICIES);
    expect(frontend.WITHDRAWAL_DAYS).toBe(backend.WITHDRAWAL_DAYS);
    expect(frontend.WITHDRAWAL_MIN_HOURS_BEFORE_START).toBe(
      backend.WITHDRAWAL_MIN_HOURS_BEFORE_START
    );
  });

  it('mesmo padrão de regras de venda do evento', () => {
    expect(FRONTEND_DEFAULT).toEqual(BACKEND_DEFAULT);
  });

  it('mesmo reembolso e mesma regra de troca para cada política', () => {
    for (const family of FAMILIES) {
      const policies = backend.policiesOf(family);
      expect(frontend.policiesOf(family)).toEqual(policies);
      for (const policy of policies as backend.CancellationPolicyId[]) {
        for (const to of policies) {
          expect(frontend.canChangeCancellationPolicy(family, policy, to)).toBe(
            backend.canChangeCancellationPolicy(family, policy, to)
          );
        }
        for (const purchasedAt of PURCHASES) {
          for (const hours of HOURS) {
            const params = {
              family,
              policy,
              purchasedAt,
              startsAt: STARTS,
              now: new Date(new Date(STARTS).getTime() - hours * 3600_000),
              paidMinor: 10001,
              serviceFeeMinor: 300,
            };
            expect(frontend.calculateBuyerRefund(params)).toEqual(
              backend.calculateBuyerRefund(params)
            );
          }
        }
      }
    }
  });
});

=== src/domain/bookings/components/buyer/MyBookingsView.tsx — diff ===
@@ -55,12 +55,7 @@ export function MyBookingsView({ onBack }: { onBack: () => void }) {
 
   const requestCancel = (booking: BookingSummary) => {
     // Só para mostrar antes de confirmar; o valor devolvido é decidido pelo backend.
-    const preview = previewRefund({
-      policy: booking.offer.cancellationPolicy,
-      startsAt: booking.offer.startsAt,
-      totalMinor: booking.totalMinor,
-      now: new Date(),
-    });
+    const preview = previewRefund(booking, new Date());
     const amount = formatMinor(preview.refundAmountMinor, i18n.language);
     setConfirm({
       message:

=== src/domain/bookings/components/buyer/OfferPolicySummary.tsx — diff ===
@@ -6,6 +6,7 @@ import type { PublicOffer } from '../../types/bookings';
 export function OfferPolicySummary({ offer }: { offer: PublicOffer }) {
   const { t } = useTranslation();
   const policy = offer.cancellationPolicy;
+  const family = (offer.kind as string) === 'transfer' ? 'transfer' : 'booking';
   return (
     <ul className="space-y-1.5 text-xs text-white/70">
       {offer.durationMinutes ? (
@@ -22,13 +23,14 @@ export function OfferPolicySummary({ offer }: { offer: PublicOffer }) {
       ) : null}
       <li className="flex items-start gap-2">
         <ShieldCheck size={14} className="text-teal-300 shrink-0 mt-0.5" aria-hidden="true" />
-        {policy.freeCancellationHoursBefore > 0
-          ? t('bookings.buyer.policyFree', {
-              hours: policy.freeCancellationHoursBefore,
-              percent: policy.refundPercentAfterDeadline,
-            })
-          : t('bookings.buyer.policyNoFree', { percent: policy.refundPercentAfterDeadline })}
+        <span>
+          <span className="font-semibold">
+            {t(`salesPolicy.policies.${family}.${policy}.title`)}:
+          </span>{' '}
+          {t(`salesPolicy.policies.${family}.${policy}.description`)} {t('salesPolicy.noShow')}
+        </span>
       </li>
+      <li className="text-ink/70">{t('salesPolicy.withdrawalNoFee')}</li>
     </ul>
   );
 }

=== src/domain/bookings/components/buyer/buyerComponents.test.tsx — diff ===
@@ -103,7 +103,7 @@ describe('componentes de compra', () => {
       status: 'published',
       title: { 'pt-BR': 'Passeio de buggy', en: 'Buggy tour' },
       pricing: { currency: 'BRL', priceOptions: OPTIONS },
-      cancellationPolicy: { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 },
+      cancellationPolicy: 'moderate',
       maxParticipantsPerBooking: 6,
       requiresParticipantNames: false,
       updatedAt: '',
@@ -121,7 +121,10 @@ describe('componentes de compra', () => {
       />
     );
     expect(await screen.findByText('Buggy tour')).toBeTruthy();
-    expect(screen.getByText(/Free cancellation up to 24 h before/)).toBeTruthy();
+    expect(
+      screen.getByText(/Full refund up to 5 days before the start; 50% up to 24 h before/)
+    ).toBeTruthy();
+    expect(screen.getByText(/Right of withdrawal: full refund if/)).toBeTruthy();
     await i18n.changeLanguage('pt-BR');
   });
 });
@@ -158,32 +161,44 @@ describe('useBookingCheckout', () => {
 });
 
 describe('previewRefund', () => {
-  const policy = { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 as const };
   const startsAt = '2026-11-10T11:00:00.000Z';
-  it('mostra 100%, 50% e 0% conforme o momento', () => {
+  const booking = (
+    cancellationPolicy: 'moderate' | 'none',
+    createdAt = '2026-10-01T12:00:00.000Z'
+  ) => ({
+    kind: 'tour' as const,
+    totalMinor: 20000,
+    createdAt,
+    offer: {
+      title: 'Passeio',
+      startsAt,
+      durationMinutes: null,
+      meetingPoint: null,
+      cancellationPolicy,
+    },
+  });
+
+  it('segue a política gravada fora do arrependimento: 100%, 50% e 0%', () => {
+    expect(previewRefund(booking('moderate'), new Date('2026-11-04T11:00:00.000Z'))).toEqual({
+      refundPercent: 100,
+      refundAmountMinor: 20000,
+    });
+    expect(previewRefund(booking('moderate'), new Date('2026-11-08T11:00:00.000Z'))).toEqual({
+      refundPercent: 50,
+      refundAmountMinor: 10000,
+    });
+    expect(previewRefund(booking('moderate'), new Date('2026-11-10T00:00:00.000Z'))).toEqual({
+      refundPercent: 0,
+      refundAmountMinor: 0,
+    });
+  });
+
+  it('arrependimento devolve tudo mesmo sem reembolso na política', () => {
     expect(
-      previewRefund({
-        policy,
-        startsAt,
-        totalMinor: 20000,
-        now: new Date('2026-11-08T11:00:00.000Z'),
-      })
+      previewRefund(
+        booking('none', '2026-11-05T11:00:00.000Z'),
+        new Date('2026-11-06T11:00:00.000Z')
+      )
     ).toEqual({ refundPercent: 100, refundAmountMinor: 20000 });
-    expect(
-      previewRefund({
-        policy,
-        startsAt,
-        totalMinor: 20000,
-        now: new Date('2026-11-10T00:00:00.000Z'),
-      })
-    ).toEqual({ refundPercent: 50, refundAmountMinor: 10000 });
-    expect(
-      previewRefund({
-        policy,
-        startsAt,
-        totalMinor: 20000,
-        now: new Date('2026-11-10T12:00:00.000Z'),
-      })
-    ).toEqual({ refundPercent: 0, refundAmountMinor: 0 });
   });
 });

=== src/domain/bookings/components/partner/OfferTextFields.tsx — diff ===
@@ -32,7 +32,7 @@ export function OfferTextFields({ register, errors }: OfferTextFieldsProps) {
             aria-selected={language === code}
             onClick={() => setLanguage(code)}
             className={`min-h-11 px-3 rounded-xl text-xs font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
-              language === code ? 'bg-teal-500/20 text-teal-200' : 'bg-white/5 text-white/70'
+              language === code ? 'bg-accent-soft text-accent' : 'bg-surface text-ink/70'
             }`}
           >
             {t(`common.locales.${code === 'pt-BR' ? 'ptBR' : code}`)}

=== src/domain/bookings/components/partner/PartnerOfferEditor.tsx — diff ===
@@ -1,7 +1,9 @@
 import { zodResolver } from '@hookform/resolvers/zod';
 import { useState } from 'react';
-import { useForm } from 'react-hook-form';
+import { Controller, useForm } from 'react-hook-form';
 import { useTranslation } from 'react-i18next';
+import { useCancellationPolicyOptions } from '../../../../shared/hooks/useCancellationPolicyOptions';
+import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
 import {
   type OfferFormInput,
   type OfferFormValues,
@@ -17,6 +19,8 @@ import { OfferTextFields } from './OfferTextFields';
 interface PartnerOfferEditorProps {
   mode: 'create' | 'edit';
   defaultValues: OfferFormValues;
+  /** Política da oferta já publicada: só pode trocar por uma igual ou mais flexível (D14). */
+  publishedPolicy?: string;
   onSubmit: (fields: OfferFields, kind: OfferFormValues['kind']) => Promise<void>;
   onCancel: () => void;
 }
@@ -24,10 +28,13 @@ interface PartnerOfferEditorProps {
 export function PartnerOfferEditor({
   mode,
   defaultValues,
+  publishedPolicy,
   onSubmit,
   onCancel,
 }: PartnerOfferEditorProps) {
   const { t } = useTranslation();
+  // Translado ainda não é vendável (AVAILABLE_OFFER_KINDS); quando for, a família vem do tipo da oferta.
+  const policyOptions = useCancellationPolicyOptions('booking', publishedPolicy);
   const [submitError, setSubmitError] = useState<string | null>(null);
   const {
     register,
@@ -48,10 +55,7 @@ export function PartnerOfferEditor({
     }
   });
 
-  const numberField = (
-    name: 'durationMinutes' | 'freeCancellationHoursBefore' | 'maxParticipantsPerBooking',
-    label: string
-  ) => (
+  const numberField = (name: 'durationMinutes' | 'maxParticipantsPerBooking', label: string) => (
     <label className="block space-y-1">
       <span className="text-xs text-white/70">{label}</span>
       <input type="number" inputMode="numeric" {...register(name)} className={INPUT} />
@@ -78,20 +82,21 @@ export function PartnerOfferEditor({
         <span className="text-xs text-white/70">{t('bookings.editor.meetingPointLabel')}</span>
         <input {...register('meetingPoint')} className={INPUT} />
       </label>
-      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3">
-        <legend className="text-xs font-semibold text-white/70 mb-2">
-          {t('bookings.editor.policyLegend')}
-        </legend>
-        {numberField('freeCancellationHoursBefore', t('bookings.editor.freeHoursLabel'))}
-        <label className="block space-y-1">
-          <span className="text-xs text-white/70">{t('bookings.editor.refundAfterLabel')}</span>
-          <select {...register('refundPercentAfterDeadline')} className={INPUT}>
-            <option value="0">{t('bookings.editor.refundNone')}</option>
-            <option value="50">{t('bookings.editor.refundHalf')}</option>
-            <option value="100">{t('bookings.editor.refundFull')}</option>
-          </select>
-        </label>
-      </fieldset>
+      <Controller
+        control={control}
+        name="cancellationPolicy"
+        render={({ field }) => (
+          <RadioCardGroup
+            name={field.name}
+            legend={t('salesPolicy.policyLegend')}
+            hint={publishedPolicy ? t('salesPolicy.lockedHint') : undefined}
+            options={policyOptions}
+            value={field.value}
+            onChange={field.onChange}
+          />
+        )}
+      />
+      <p className="text-xs text-ink/70">{t('salesPolicy.withdrawalNoFee')}</p>
       <label className="flex items-center gap-3 min-h-11">
         <input
           type="checkbox"

=== src/domain/bookings/components/partner/PartnerOffersManager.tsx — diff ===
@@ -99,6 +99,9 @@ export function PartnerOffersManager({
       {view.type === 'editor' && (
         <PartnerOfferEditor
           mode={view.offer ? 'edit' : 'create'}
+          publishedPolicy={
+            view.offer && view.offer.status !== 'draft' ? view.offer.cancellationPolicy : undefined
+          }
           defaultValues={
             view.offer
               ? offerToFormValues(view.offer)

=== src/domain/bookings/schemas/offerFormSchema.ts — diff ===
@@ -1,4 +1,8 @@
 import { z } from 'zod';
+import {
+  BOOKING_CANCELLATION_POLICIES,
+  TRANSFER_CANCELLATION_POLICIES,
+} from '../../../shared/utils/cancellationPolicy';
 import { parseReaisToMinor } from '../utils/money';
 
 // As mensagens são chaves de tradução; o formulário mostra t(mensagem) (AGENTS.md §12.5).
@@ -37,8 +41,7 @@ export const offerFormSchema = z.object({
     .max(10),
   durationMinutes: z.coerce.number().int(integer).min(15, integer).max(1440, integer),
   meetingPoint: optionalText(300),
-  freeCancellationHoursBefore: z.coerce.number().int(integer).min(0, integer).max(720, integer),
-  refundPercentAfterDeadline: z.enum(['0', '50', '100']),
+  cancellationPolicy: z.enum([...BOOKING_CANCELLATION_POLICIES, ...TRANSFER_CANCELLATION_POLICIES]),
   maxParticipantsPerBooking: z.coerce.number().int(integer).min(1, integer).max(50, integer),
   requiresParticipantNames: z.boolean(),
 });

=== src/domain/bookings/types/bookings.ts — diff ===
@@ -1,9 +1,10 @@
+import type { BookingCancellationPolicy } from '../../../shared/utils/cancellationPolicy';
+
 /** Espelho neutro dos DTOs de saída da API de reservas (server/interfaces/http/bookings). */
 export type LocalizedText = { 'pt-BR': string; en?: string; fr?: string };
 
 export type OfferKind = 'tour' | 'private_entry';
 export type OfferStatus = 'draft' | 'published' | 'paused' | 'archived';
-export type RefundPercent = 0 | 50 | 100;
 
 export interface PriceOption {
   id: string;
@@ -13,18 +14,13 @@ export interface PriceOption {
   maxQuantity?: number;
 }
 
-export interface CancellationPolicy {
-  freeCancellationHoursBefore: number;
-  refundPercentAfterDeadline: RefundPercent;
-}
-
 export interface OfferFields {
   title: LocalizedText;
   description?: LocalizedText;
   pricing: { currency: 'BRL'; priceOptions: PriceOption[] };
   durationMinutes?: number;
   meetingPoint?: { address: string; instructions?: LocalizedText };
-  cancellationPolicy: CancellationPolicy;
+  cancellationPolicy: BookingCancellationPolicy;
   maxParticipantsPerBooking: number;
   requiresParticipantNames: boolean;
 }
@@ -99,11 +95,11 @@ export interface BookingSummary {
     startsAt: string;
     durationMinutes: number | null;
     meetingPoint: string | null;
-    cancellationPolicy: CancellationPolicy;
+    cancellationPolicy: BookingCancellationPolicy;
   };
   cancellation: {
     by: 'buyer' | 'partner' | 'system';
-    refundPercent: RefundPercent;
+    refundPercent: number;
     refundAmountMinor: number;
     at: string;
   } | null;
@@ -157,6 +153,6 @@ export interface BookingDetails extends BookingSummary {
 
 export interface CancelBookingResponse {
   status: BookingStatus;
-  refundPercent: RefundPercent;
+  refundPercent: number;
   refundAmountMinor: number;
 }

=== src/domain/bookings/utils/bookingsFrontendUtils.test.ts — diff ===
@@ -44,10 +44,7 @@ describe('formulário de oferta', () => {
     expect(fields.pricing.priceOptions[0]?.unitAmountMinor).toBe(15090);
     expect(fields.title).toEqual({ 'pt-BR': 'Passeio' });
     expect(fields).not.toHaveProperty('description');
-    expect(fields.cancellationPolicy).toEqual({
-      freeCancellationHoursBefore: 24,
-      refundPercentAfterDeadline: 50,
-    });
+    expect(fields.cancellationPolicy).toBe('flexible');
   });
 });

=== src/domain/bookings/utils/offerFormMapping.ts — diff ===
@@ -1,5 +1,5 @@
 import type { OfferFormValues } from '../schemas/offerFormSchema';
-import type { LocalizedText, OfferFields, PartnerOffer, RefundPercent } from '../types/bookings';
+import type { LocalizedText, OfferFields, PartnerOffer } from '../types/bookings';
 import { minorToReaisInput, parseReaisToMinor } from './money';
 
 function toLocalized(value: { 'pt-BR': string; en: string; fr: string }): LocalizedText {
@@ -28,10 +28,7 @@ export function offerFormToFields(values: OfferFormValues): OfferFields {
     ...(values.meetingPoint.trim()
       ? { meetingPoint: { address: values.meetingPoint.trim() } }
       : {}),
-    cancellationPolicy: {
-      freeCancellationHoursBefore: values.freeCancellationHoursBefore,
-      refundPercentAfterDeadline: Number(values.refundPercentAfterDeadline) as RefundPercent,
-    },
+    cancellationPolicy: values.cancellationPolicy,
     maxParticipantsPerBooking: values.maxParticipantsPerBooking,
     requiresParticipantNames: values.requiresParticipantNames,
   };
@@ -53,11 +50,7 @@ export function offerToFormValues(offer: PartnerOffer): OfferFormValues {
     })),
     durationMinutes: offer.durationMinutes ?? 60,
     meetingPoint: offer.meetingPoint?.address ?? '',
-    freeCancellationHoursBefore: offer.cancellationPolicy.freeCancellationHoursBefore,
-    refundPercentAfterDeadline: String(offer.cancellationPolicy.refundPercentAfterDeadline) as
-      | '0'
-      | '50'
-      | '100',
+    cancellationPolicy: offer.cancellationPolicy,
     maxParticipantsPerBooking: offer.maxParticipantsPerBooking,
     requiresParticipantNames: offer.requiresParticipantNames,
   };
@@ -71,8 +64,7 @@ export function emptyOfferFormValues(kind: 'tour' | 'private_entry'): OfferFormV
     priceOptions: [{ id: 'adult', label: '', amount: '' }],
     durationMinutes: 120,
     meetingPoint: '',
-    freeCancellationHoursBefore: 24,
-    refundPercentAfterDeadline: '50',
+    cancellationPolicy: 'flexible',
     maxParticipantsPerBooking: 8,
     requiresParticipantNames: false,
   };

=== src/domain/bookings/utils/refundPreview.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { calculateBuyerRefund } from '../../../shared/utils/cancellationPolicy';
import type { BookingSummary } from '../types/bookings';

/**
 * Mesma regra do backend (arrependimento e política gravada na compra), só para mostrar o valor antes de
 * cancelar. Quem decide o reembolso é o backend.
 */
export function previewRefund(
  booking: Pick<BookingSummary, 'kind' | 'offer' | 'totalMinor' | 'createdAt'>,
  now: Date
): { refundPercent: number; refundAmountMinor: number } {
  const refund = calculateBuyerRefund({
    family: (booking.kind as string) === 'transfer' ? 'transfer' : 'booking',
    policy: booking.offer.cancellationPolicy,
    purchasedAt: booking.createdAt,
    startsAt: booking.offer.startsAt,
    now,
    paidMinor: booking.totalMinor,
    serviceFeeMinor: 0,
  });
  return { refundPercent: refund.percent, refundAmountMinor: refund.refundMinor };
}

=== src/domain/events/index.ts — diff ===
@@ -22,9 +22,12 @@ export type {
   CreateEventOccurrenceInput,
   EventListing,
   EventOccurrence,
+  EventSalesPolicy,
+  ServiceFeeMode,
   UpdateEventListingInput,
 } from './types/event';
 export { CUSTOM_EVENT_CATEGORY, EVENT_CATEGORIES } from './constants/eventCategories';
+export { DEFAULT_EVENT_SALES_POLICY } from './types/event';
 export { saveEventSessionsUseCase } from './application/usecases/saveEventSessionsUseCase';
 export type { SaveEventSessionsInput } from './application/usecases/saveEventSessionsUseCase';
 export type {

=== src/domain/events/types/event.ts — diff ===
@@ -1,3 +1,5 @@
+import type { EventCancellationPolicy } from '../../../shared/utils/cancellationPolicy';
+
 export type EventListingStatus = 'draft' | 'published' | 'paused' | 'archived';
 
 export type EventVisibility = 'public' | 'unlisted' | 'private';
@@ -15,15 +17,24 @@ export interface EventLocation {
   longitude?: number;
 }
 
-export interface EventRefundPolicy {
-  allowBuyerCancellation: boolean;
-  buyerCancellationWindowHours?: number;
+export type ServiceFeeMode = 'pass_to_buyer' | 'absorb';
+
+/** Regras de venda do evento (D14): política da plataforma, taxa de serviço e transferência de ingresso. */
+export interface EventSalesPolicy {
+  cancellationPolicy: EventCancellationPolicy;
+  serviceFeeMode: ServiceFeeMode;
   allowTicketTransfer: boolean;
-  ticketTransferCutoffHours?: number;
-  enabled?: boolean;
-  cancellationWindowHours?: number;
+  ticketTransferCutoffHours: number;
 }
 
+/** Igual ao padrão do backend (server/domain/events/types/eventTypes.ts), com teste de paridade. */
+export const DEFAULT_EVENT_SALES_POLICY: EventSalesPolicy = {
+  cancellationPolicy: 'flexible',
+  serviceFeeMode: 'pass_to_buyer',
+  allowTicketTransfer: true,
+  ticketTransferCutoffHours: 4,
+};
+
 export interface EventListing {
   id: string;
   ownerId: string;
@@ -48,7 +59,7 @@ export interface EventListing {
   websiteLink?: string;
   instagramLink?: string;
   bookingLink?: string;
-  refundPolicy: EventRefundPolicy;
+  salesPolicy: EventSalesPolicy;
   maxTicketsPerUserPerOccurrence?: number;
   ageRestriction?: {
     minAge?: number;
@@ -117,7 +128,7 @@ export interface CreateEventListingInput {
   websiteLink?: string;
   instagramLink?: string;
   bookingLink?: string;
-  refundPolicy?: Partial<EventRefundPolicy>;
+  salesPolicy?: EventSalesPolicy;
   maxTicketsPerUserPerOccurrence?: number;
   entryType?: 'pago' | 'gratuito';
   date?: string;

=== src/domain/guide/components/EventDetailModal.tsx — diff ===
@@ -224,7 +224,6 @@ export function EventDetailModal({ item, onClose }: EventDetailModalProps) {
         <EventTicketingPurchasePanel
           eventId={item.id}
           eventTitle={item.name}
-          userId={user?.uid}
           userEmail={user?.email || undefined}
           userName={user?.displayName || undefined}
           onRequireLogin={openLoginModal}

=== src/domain/partners/components/PartnerEventForm.tsx — diff ===
@@ -7,6 +7,7 @@ import { EventBasicsSection } from './event/EventBasicsSection';
 import { EventContactSection } from './event/EventContactSection';
 import { EventEntrySection } from './event/EventEntrySection';
 import { EventPhotosSection } from './event/EventPhotosSection';
+import { EventSalesPolicySection } from './event/EventSalesPolicySection';
 
 interface PartnerEventFormProps {
   item: PartnerContentEditorState;
@@ -55,6 +56,7 @@ export function PartnerEventForm({
         onChange={onChange}
         renderEventTicketingManager={renderEventTicketingManager}
       />
+      {item.entryType === 'pago' && <EventSalesPolicySection item={item} onChange={onChange} />}
       <EventContactSection item={item} onChange={onChange} />
       <EventPhotosSection
         item={item}

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -100,8 +100,8 @@ export function PartnerPanel({
   >(undefined);
   useEditorScrollLock(Boolean(isEditing));
   const editingEventId = isEditing?.category === 'event' ? isEditing.id || undefined : undefined;
-  const eventSessions = usePartnerEventSessions(editingEventId, (sessions) =>
-    setIsEditing((current) => (current ? { ...current, sessions } : current))
+  const eventSessions = usePartnerEventSessions(editingEventId, (details) =>
+    setIsEditing((current) => (current ? { ...current, ...details } : current))
   );
 
   const [verifyingListing, setVerifyingListing] = React.useState<VerificationListingOption | null>(

=== src/domain/partners/components/event/EventSalesPolicySection.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCancellationPolicyOptions } from '../../../../shared/hooks/useCancellationPolicyOptions';
import type { EventCancellationPolicy } from '../../../../shared/utils/cancellationPolicy';
import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
import { DEFAULT_EVENT_SALES_POLICY, type ServiceFeeMode } from '../../../events';
import type { EventSectionProps } from './eventSectionProps';

/** Política de cancelamento da plataforma e quem paga a taxa de serviço (D14). */
export function EventSalesPolicySection({ item, onChange }: EventSectionProps) {
  const { t } = useTranslation();
  const policy = item.salesPolicy ?? DEFAULT_EVENT_SALES_POLICY;
  const policyOptions = useCancellationPolicyOptions('event', item.publishedCancellationPolicy);
  const update = (patch: Partial<typeof policy>) =>
    onChange({ ...item, salesPolicy: { ...policy, ...patch } });

  return (
    <div className="space-y-6 pt-4 border-t border-line">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-surface border border-line text-indigo-400">
          <ShieldCheck size={18} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-black text-ink uppercase tracking-widest">
          {t('salesPolicy.sectionTitle')}
        </h3>
      </div>
      <RadioCardGroup<string>
        name="event-cancellation-policy"
        legend={t('salesPolicy.policyLegend')}
        hint={item.publishedCancellationPolicy ? t('salesPolicy.lockedHint') : undefined}
        options={policyOptions}
        value={policy.cancellationPolicy}
        onChange={(value) => update({ cancellationPolicy: value as EventCancellationPolicy })}
      />
      <p className="text-xs text-ink/70">{t('salesPolicy.withdrawal')}</p>
      <RadioCardGroup<ServiceFeeMode>
        name="event-service-fee-mode"
        legend={t('salesPolicy.serviceFee.legend')}
        options={[
          {
            value: 'pass_to_buyer',
            title: t('salesPolicy.serviceFee.passToBuyer.title'),
            description: t('salesPolicy.serviceFee.passToBuyer.description'),
          },
          {
            value: 'absorb',
            title: t('salesPolicy.serviceFee.absorb.title'),
            description: t('salesPolicy.serviceFee.absorb.description'),
          },
        ]}
        value={policy.serviceFeeMode}
        onChange={(value) => update({ serviceFeeMode: value })}
      />
    </div>
  );
}

=== src/domain/partners/hooks/usePartnerContentActions.ts — diff ===
@@ -155,6 +155,7 @@ export function usePartnerContentActions({
           eventCategory: isEditing.eventCategory || 'geral',
           customCategory: isEditing.customCategory,
           entryType: parsedEvent.data.entryType,
+          ...(isEditing.salesPolicy ? { salesPolicy: isEditing.salesPolicy } : {}),
           establishmentId: isEditing.establishmentId,
           instagramLink: isEditing.instagramLink,
           websiteLink: isEditing.websiteLink,

=== src/domain/partners/hooks/usePartnerEventSessions.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useEffect, useState } from 'react';
import {
  type EventSessionsLoadState,
  getEventListingByIdUseCase,
  listEventOccurrencesUseCase,
} from '../../events';
import type { PartnerContentEditorState } from '../types/partnerContent';

export type LoadedEventDetails = Pick<
  PartnerContentEditorState,
  'sessions' | 'salesPolicy' | 'publishedCancellationPolicy' | 'entryType'
>;

/**
 * Lê as sessões salvas e as regras de venda do evento aberto no editor. Enquanto não estiverem prontas,
 * o evento não pode ser salvo: sem a lista real, a gravação trataria as sessões existentes como removidas.
 */
export function usePartnerEventSessions(
  eventId: string | undefined,
  onLoaded: (details: LoadedEventDetails) => void
) {
  const [loadState, setLoadState] = useState<EventSessionsLoadState>('idle');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: lê de novo só quando outro evento é aberto.
  useEffect(() => {
    setSavedIds([]);
    if (!eventId) {
      setLoadState('idle');
      return;
    }
    let active = true;
    setLoadState('loading');
    Promise.all([listEventOccurrencesUseCase(eventId), getEventListingByIdUseCase(eventId)])
      .then(([occurrences, listing]) => {
        if (!active) return;
        setSavedIds(occurrences.map((occurrence) => occurrence.id));
        onLoaded({
          sessions: occurrences.map((occurrence) => ({
            id: occurrence.id,
            startsAt: occurrence.startsAt,
            endsAt: occurrence.endsAt,
            capacity: occurrence.capacity,
          })),
          ...(listing
            ? {
                salesPolicy: listing.salesPolicy,
                entryType: listing.entryType,
                // Depois de publicar, a política só fica mais flexível (D14).
                publishedCancellationPolicy:
                  listing.status === 'draft' ? undefined : listing.salesPolicy.cancellationPolicy,
              }
            : {}),
        });
        setLoadState('ready');
      })
      .catch((error: unknown) => {
        console.error('[usePartnerEventSessions]', error);
        if (active) setLoadState('error');
      });
    return () => {
      active = false;
    };
  }, [eventId]);

  return { loadState, savedIds };
}

=== src/domain/partners/types/partnerContent.ts — diff ===
@@ -1,4 +1,4 @@
-import type { EventSessionDraft } from '../../events';
+import type { EventSalesPolicy, EventSessionDraft } from '../../events';
 export interface PartnerOperationalInfo {
   /** Passeio, translado e aluguel (decisão D9). */
   durationMinutes?: number;
@@ -72,6 +72,9 @@ export type PartnerContentEditorState = Omit<PartnerContentRecord, 'category'> &
   category: PartnerContentCategory | '';
   /** Sessões do evento em edição; as já salvas são lidas ao abrir o editor. */
   sessions?: EventSessionDraft[];
+  salesPolicy?: EventSalesPolicy;
+  /** Política do evento já publicado: só pode trocar por uma igual ou mais flexível (D14). */
+  publishedCancellationPolicy?: string;
 };
 
 export interface PartnerContentRecord {
@@ -147,6 +150,7 @@ export interface PartnerContentEventInput {
   tags?: string[];
   operationalInfo?: Record<string, unknown>;
   isActive?: boolean;
+  salesPolicy?: EventSalesPolicy;
   /** Sessões iniciais do evento novo; depois, as sessões são gravadas pelo domínio events. */
   occurrences?: Array<{ startsAt: string; endsAt: string; capacity: number }>;
 }

=== src/domain/ticketing/components/EventTicketingPurchasePanel.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { AlertCircle, Loader2, Sparkles, Ticket as TicketIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../ui/components/GlassCard';
import { formatMoneyMinor } from '../../../shared/utils/money';
import { useEventOccurrences } from '../../events';
import { useEventSalesPolicy } from '../hooks/useEventSalesPolicy';
import { useTicketCheckout } from '../hooks/useTicketCheckout';
import { usePublicTicketTypes } from '../hooks/useTicketTypes';
import { IssuedTicketsCard } from './checkout/IssuedTicketsCard';
import { OccurrencePicker } from './checkout/OccurrencePicker';
import { SalesPolicyNotice } from './checkout/SalesPolicyNotice';
import { TicketBuyerForm } from './checkout/TicketBuyerForm';
import { TicketOrderPaymentStep } from './checkout/TicketOrderPaymentStep';
import { TicketTypeList } from './checkout/TicketTypeList';

interface EventTicketingPurchasePanelProps {
  eventId?: string;
  occurrenceId?: string;
  eventTitle: string;
  userEmail?: string;
  userName?: string;
  onRequireLogin?: () => void;
  maxTicketsPerUser?: number;
  onOrderCompleted?: (orderId: string) => void;
}

export function EventTicketingPurchasePanel({
  eventId,
  occurrenceId: initialOccurrenceId,
  eventTitle,
  userEmail,
  userName,
  onRequireLogin,
  maxTicketsPerUser = 5,
  onOrderCompleted,
}: EventTicketingPurchasePanelProps) {
  const { t, i18n } = useTranslation();
  const { occurrences, loading: occurrencesLoading } = useEventOccurrences(
    !initialOccurrenceId && eventId ? eventId : undefined
  );
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(initialOccurrenceId || '');

  useEffect(() => {
    if (initialOccurrenceId) setSelectedOccurrenceId(initialOccurrenceId);
    else if (!selectedOccurrenceId && occurrences[0]) setSelectedOccurrenceId(occurrences[0].id);
  }, [initialOccurrenceId, occurrences, selectedOccurrenceId]);

  const occurrenceId = initialOccurrenceId || selectedOccurrenceId;
  const {
    ticketTypes,
    loading,
    error: loadError,
    reload,
  } = usePublicTicketTypes(occurrenceId || undefined);
  const salesPolicy = useEventSalesPolicy(eventId);
  const checkout = useTicketCheckout({
    occurrenceId,
    ticketTypes,
    maxTicketsPerUser,
    initialBuyer: { name: userName, email: userEmail },
    reloadTicketTypes: reload,
    onRequireLogin,
    onOrderCompleted,
  });
  const { order } = checkout;

  if ((loading || occurrencesLoading) && ticketTypes.length === 0) {
    return (
      <p
        role="status"
        className="p-4 rounded-2xl bg-surface border border-line flex items-center gap-3 text-ink/70 text-xs"
      >
        <Loader2 size={16} className="animate-spin text-teal-400" aria-hidden="true" />
        {t('ticketCheckout.loading')}
      </p>
    );
  }

  if (loadError) {
    return (
      <p
        role="alert"
        className="p-4 rounded-2xl bg-danger-soft border border-danger-line text-danger text-xs flex items-center gap-2"
      >
        <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
        {loadError}
      </p>
    );
  }

  if (ticketTypes.length === 0 && occurrences.length <= 1) return null;

  if (order?.status === 'paid') {
    return (
      <IssuedTicketsCard
        order={order}
        eventTitle={eventTitle}
        tickets={checkout.issuedTickets}
        onBuyMore={checkout.reset}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/80">
          <TicketIcon size={16} className="text-teal-400" aria-hidden="true" />
          {t('ticketCheckout.title')}
        </h4>
        <span className="text-xs text-ink/70">
          {t('ticketCheckout.limit', { count: checkout.effectiveMaxPerUser })}
        </span>
      </div>

      {!initialOccurrenceId && occurrences.length > 1 && !order && (
        <OccurrencePicker
          occurrences={occurrences}
          selectedId={selectedOccurrenceId}
          onSelect={(id) => {
            setSelectedOccurrenceId(id);
            checkout.clearQuantities();
          }}
        />
      )}

      {order ? (
        <TicketOrderPaymentStep order={order} checkout={checkout} />
      ) : (
        <>
          <TicketTypeList
            ticketTypes={ticketTypes}
            quantities={checkout.quantities}
            totalQuantity={checkout.totalQuantity}
            maxPerUser={checkout.effectiveMaxPerUser}
            onChange={checkout.changeQuantity}
          />

          {checkout.totalQuantity > 0 && (
            <GlassCard className="p-4 space-y-3">
              <TicketBuyerForm checkout={checkout} />
              {salesPolicy && !checkout.isAllFree && (
                <SalesPolicyNotice
                  policy={salesPolicy}
                  showServiceFeeNote={salesPolicy.serviceFeeMode === 'pass_to_buyer'}
                />
              )}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-line">
                <div>
                  <span className="text-xs text-ink/70 block">
                    {t('ticketCheckout.ticketCount', { count: checkout.totalQuantity })}
                  </span>
                  <span className="text-base font-black text-accent">
                    {checkout.isAllFree
                      ? t('ticketCheckout.free')
                      : formatMoneyMinor(checkout.estimatedSubtotalMinor, i18n.language)}
                  </span>
                  {!checkout.isAllFree && salesPolicy?.serviceFeeMode === 'pass_to_buyer' && (
                    <span className="text-xs text-ink/70 block">
                      {t('ticketCheckout.plusServiceFee')}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={checkout.submitting}
                  onClick={() => void checkout.reserve()}
                  className="px-5 min-h-11 rounded-xl bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  {checkout.submitting ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles size={16} aria-hidden="true" />
                  )}
                  {checkout.isAllFree
                    ? t('ticketCheckout.registerFree')
                    : t('ticketCheckout.reserve')}
                </button>
              </div>
            </GlassCard>
          )}
        </>
      )}

      {checkout.error && (
        <p
          role="alert"
          className="p-3 rounded-xl bg-danger-soft border border-danger-line text-danger text-xs flex items-center gap-2"
        >
          <AlertCircle size={15} className="shrink-0" aria-hidden="true" />
          {checkout.error}
        </p>
      )}
    </div>
  );
}

=== src/domain/ticketing/components/UserTicketsHistoryView.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Ticket as TicketIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDialogData } from '../../../ui/components/ConfirmDialog';
import { GlassCard } from '../../../ui/components/GlassCard';
import { formatMoneyMinor } from '../../../shared/utils/money';
import { cn } from '../../../shared/utils/cn';
import { useTicketWalletActions } from '../hooks/useTicketWalletActions';
import { useUserTicketsAndOrders } from '../hooks/useUserTickets';
import type { TicketOrder } from '../types/ticketing';
import {
  canRequestRefund,
  canTransferTicket,
  previewOrderRefundMinor,
} from '../utils/ticketWalletRules';
import { ResumePaymentCard } from './wallet/ResumePaymentCard';
import { TransferTicketForm } from './wallet/TransferTicketForm';
import { WalletOrderCard } from './wallet/WalletOrderCard';
import { WalletTicketCard } from './wallet/WalletTicketCard';

interface UserTicketsHistoryViewProps {
  onBack?: () => void;
}

const SQUARE_BUTTON =
  'w-11 h-11 rounded-xl bg-surface hover:bg-white/10 border border-line flex items-center justify-center text-ink/70 focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer';

function tabClass(active: boolean) {
  return cn(
    'min-h-11 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50',
    active ? 'bg-teal-400 text-slate-950' : 'bg-surface text-ink/70 hover:bg-white/10'
  );
}

export function UserTicketsHistoryView({ onBack }: UserTicketsHistoryViewProps = {}) {
  const { t, i18n } = useTranslation();
  const wallet = useUserTicketsAndOrders(true);
  const { tickets, orders, loading, error, reload } = wallet;
  const actions = useTicketWalletActions(wallet);
  const [activeTab, setActiveTab] = useState<'tickets' | 'orders'>('tickets');
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const now = new Date();

  const askRefund = (order: TicketOrder) => {
    // Só para mostrar antes de confirmar; o valor devolvido é decidido pelo backend.
    const amountMinor = previewOrderRefundMinor(order, now);
    const keepsServiceFee = (order.serviceFeeMinor ?? 0) > 0 && amountMinor < order.totalMinor;
    setConfirm({
      message: [
        t('ticketWallet.refundConfirm', {
          amount: formatMoneyMinor(amountMinor, i18n.language),
        }),
        keepsServiceFee ? t('salesPolicy.serviceFee.notRefundable') : '',
      ]
        .filter(Boolean)
        .join(' '),
      confirmLabel: t('ticketWallet.actions.refund'),
      onCancel: () => setConfirm(null),
      onConfirm: () => {
        setConfirm(null);
        void actions.requestRefund(order);
      },
    });
  };

  const isPendingAndActive = (order: TicketOrder) =>
    (order.status === 'pending_payment' || order.status === 'payment_failed') &&
    (!order.expiresAt || new Date(order.expiresAt).getTime() > now.getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label={t('ticketWallet.back')}
              className={SQUARE_BUTTON}
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            aria-pressed={activeTab === 'tickets'}
            onClick={() => setActiveTab('tickets')}
            className={tabClass(activeTab === 'tickets')}
          >
            {t('ticketWallet.tabs.tickets', { count: tickets.length })}
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
            className={tabClass(activeTab === 'orders')}
          >
            {t('ticketWallet.tabs.orders', { count: orders.length })}
          </button>
        </div>
        <button
          type="button"
          onClick={() => void reload()}
          aria-label={t('ticketWallet.refresh')}
          className={SQUARE_BUTTON}
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin text-teal-400' : ''}
            aria-hidden="true"
          />
        </button>
      </div>

      {actions.feedback && (
        <p
          role={actions.feedback.type === 'error' ? 'alert' : 'status'}
          className={cn(
            'p-3 rounded-xl border text-xs flex items-center gap-2',
            actions.feedback.type === 'success'
              ? 'bg-success-soft border-success-line text-success'
              : 'bg-danger-soft border-danger-line text-danger'
          )}
        >
          {actions.feedback.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
          )}
          {actions.feedback.message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger"
        >
          {error}
        </p>
      )}

      {loading && tickets.length === 0 && orders.length === 0 ? (
        <p role="status" className="p-8 flex items-center justify-center gap-2 text-ink/70 text-xs">
          <Loader2 size={18} className="animate-spin text-teal-400" aria-hidden="true" />
          {t('ticketWallet.loading')}
        </p>
      ) : activeTab === 'tickets' ? (
        tickets.length === 0 ? (
          <GlassCard className="p-6 text-center space-y-2">
            <TicketIcon size={28} className="mx-auto text-ink/60" aria-hidden="true" />
            <p className="text-sm font-bold text-ink/80">{t('ticketWallet.emptyTickets')}</p>
            <p className="text-xs text-ink/70">{t('ticketWallet.emptyTicketsHint')}</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tickets.map((ticket) => (
              <WalletTicketCard
                key={ticket.id}
                ticket={ticket}
                qrDataUrl={
                  actions.qrPreview?.ticketId === ticket.id ? actions.qrPreview.dataUrl : undefined
                }
                canTransfer={canTransferTicket(
                  ticket,
                  orders.find((order) => order.id === ticket.orderId),
                  now
                )}
                busy={actions.busy}
                onShowQr={() => void actions.showQr(ticket)}
                onReissueQr={() => void actions.reissueQr(ticket)}
                onTransfer={() => actions.setTransferTicket(ticket)}
              />
            ))}
          </div>
        )
      ) : orders.length === 0 ? (
        <GlassCard className="p-6 text-center space-y-2">
          <p className="text-sm font-bold text-ink/80">{t('ticketWallet.emptyOrders')}</p>
          <p className="text-xs text-ink/70">{t('ticketWallet.emptyOrdersHint')}</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <WalletOrderCard
              key={order.id}
              order={order}
              canResume={isPendingAndActive(order)}
              canRefund={canRequestRefund(order, tickets, now)}
              busy={actions.busy}
              onResume={() => void actions.resumePayment(order)}
              onRefund={() => askRefund(order)}
            />
          ))}
        </div>
      )}

      {actions.resumingOrder && (
        <ResumePaymentCard
          resuming={actions.resumingOrder}
          onClose={() => actions.setResumingOrder(null)}
          onError={(message) => actions.setFeedback({ type: 'error', message })}
          onPaid={async () => {
            actions.setResumingOrder(null);
            await reload();
            actions.setFeedback({ type: 'success', message: t('ticketWallet.feedback.paid') });
          }}
        />
      )}

      {actions.transferTicket && (
        <TransferTicketForm
          ticket={actions.transferTicket}
          busy={actions.busy}
          onSubmit={(recipient) => void actions.submitTransfer(recipient)}
          onCancel={() => actions.setTransferTicket(null)}
        />
      )}

      <ConfirmDialog data={confirm} />
    </div>
  );
}

=== src/domain/ticketing/components/checkout/IssuedTicketsCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { CheckCircle2, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import type { IssuedTicketView } from '../../hooks/useTicketCheckout';
import type { TicketOrder } from '../../types/ticketing';

interface IssuedTicketsCardProps {
  order: TicketOrder;
  eventTitle: string;
  tickets: IssuedTicketView[];
  onBuyMore: () => void;
}

export function IssuedTicketsCard({
  order,
  eventTitle,
  tickets,
  onBuyMore,
}: IssuedTicketsCardProps) {
  const { t } = useTranslation();
  return (
    <GlassCard className="p-5 space-y-4 border-accent-line">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-accent-soft border border-accent-line flex items-center justify-center text-accent">
          <CheckCircle2 size={22} aria-hidden="true" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-ink">
            {order.totalMinor === 0
              ? t('ticketCheckout.issued.freeTitle')
              : t('ticketCheckout.issued.paidTitle')}
          </h4>
          <p className="text-xs text-ink/70">
            {t('ticketCheckout.issued.order', { id: order.id.slice(0, 8), event: eventTitle })}
          </p>
        </div>
      </div>

      {tickets.length > 0 && (
        <ul className="space-y-3 pt-2">
          {tickets.map(({ ticket, qrDataUrl }) => (
            <li
              key={ticket.id}
              className="p-3.5 rounded-2xl bg-surface border border-line flex flex-col sm:flex-row items-center gap-4"
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  width={112}
                  height={112}
                  alt={t('ticketCheckout.issued.qrAlt', { id: ticket.id.slice(0, 8) })}
                  className="w-28 h-28 rounded-xl bg-white p-1.5 shrink-0"
                />
              ) : (
                <div className="w-28 h-28 rounded-xl bg-white/10 flex items-center justify-center text-accent">
                  <QrCode size={36} aria-hidden="true" />
                </div>
              )}
              <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
                <p className="text-xs font-bold text-accent uppercase tracking-wider">
                  {ticket.ticketTypeSnapshot?.name || t('ticketCheckout.issued.defaultType')}
                </p>
                <p className="text-sm font-bold text-ink break-words">{ticket.holderName}</p>
                <p className="text-xs text-ink/70 break-all">{ticket.holderEmail}</p>
                <p className="text-xs text-ink/70 font-mono">
                  {t('ticketCheckout.issued.ticketId', {
                    id: ticket.id.slice(0, 12),
                    version: ticket.qrVersion,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onBuyMore}
        className="w-full min-h-11 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-ink transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        {t('ticketCheckout.issued.buyMore')}
      </button>
    </GlassCard>
  );
}

=== src/domain/ticketing/components/checkout/OccurrencePicker.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { EventOccurrence } from '../../../events';
import { cn } from '../../../../shared/utils/cn';

interface OccurrencePickerProps {
  occurrences: EventOccurrence[];
  selectedId: string;
  onSelect: (occurrenceId: string) => void;
}

export function OccurrencePicker({ occurrences, selectedId, onSelect }: OccurrencePickerProps) {
  const { t, i18n } = useTranslation();
  const format = new Intl.DateTimeFormat(i18n.language, {
    timeZone: 'America/Fortaleza',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1"
      role="radiogroup"
      aria-label={t('ticketCheckout.sessionsLabel')}
    >
      {occurrences.map((occurrence) => (
        <button
          key={occurrence.id}
          type="button"
          role="radio"
          aria-checked={selectedId === occurrence.id}
          onClick={() => onSelect(occurrence.id)}
          className={cn(
            'min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50',
            selectedId === occurrence.id
              ? 'bg-teal-400 text-slate-950'
              : 'bg-surface text-ink/70 hover:bg-white/10'
          )}
        >
          <Calendar size={13} aria-hidden="true" />
          <span>{format.format(new Date(occurrence.startsAt))}</span>
        </button>
      ))}
    </div>
  );
}

=== src/domain/ticketing/components/checkout/SalesPolicyNotice.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TicketOrderSalesPolicySnapshot } from '../../types/ticketing';

interface SalesPolicyNoticeProps {
  policy: TicketOrderSalesPolicySnapshot;
  /** Depois de reservar, a política mostrada é a gravada no pedido. */
  applied?: boolean;
  showServiceFeeNote?: boolean;
}

/** Política de cancelamento e transferência exibida antes do pagamento (AGENTS.md §8.7). */
export function SalesPolicyNotice({ policy, applied, showServiceFeeNote }: SalesPolicyNoticeProps) {
  const { t } = useTranslation();
  const key = `salesPolicy.policies.event.${policy.cancellationPolicy}`;
  return (
    <div className="p-3 rounded-xl bg-surface border border-line space-y-1 text-xs text-ink/70">
      <p className="flex items-center gap-1.5 font-bold text-ink">
        <Info size={13} className="text-teal-400" aria-hidden="true" />
        {applied ? t('ticketCheckout.policy.appliedTitle') : t('ticketCheckout.policy.title')}
      </p>
      <p>
        <span className="font-semibold">{t(`${key}.title`)}:</span> {t(`${key}.description`)}{' '}
        {t('salesPolicy.noShow')}
      </p>
      <p>{t('salesPolicy.withdrawal')}</p>
      {showServiceFeeNote && <p>{t('salesPolicy.serviceFee.notRefundable')}</p>}
      <p>
        {policy.allowTicketTransfer
          ? t('ticketCheckout.policy.transferAllowed', { hours: policy.ticketTransferCutoffHours })
          : t('ticketCheckout.policy.transferDisabled')}
      </p>
    </div>
  );
}

=== src/domain/ticketing/components/checkout/TicketBuyerForm.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Tag, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TicketCheckoutState } from '../../hooks/useTicketCheckout';

const INPUT =
  'w-full min-h-11 px-3.5 rounded-xl bg-surface border border-line text-xs text-ink placeholder:text-ink/60 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus:border-teal-400';

interface TicketBuyerFormProps {
  checkout: TicketCheckoutState;
}

/** Comprador, titulares de cada ingresso e cupom. */
export function TicketBuyerForm({ checkout }: TicketBuyerFormProps) {
  const { t } = useTranslation();
  const { buyer, selectedItems, totalQuantity, holders, setHolder } = checkout;
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-ink/80 uppercase tracking-wider">
        {t('ticketCheckout.buyer.title')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input
          type="text"
          value={buyer.name}
          onChange={(event) => buyer.setName(event.target.value)}
          placeholder={t('ticketCheckout.buyer.name')}
          aria-label={t('ticketCheckout.buyer.name')}
          autoComplete="name"
          className={INPUT}
        />
        <input
          type="email"
          value={buyer.email}
          onChange={(event) => buyer.setEmail(event.target.value)}
          placeholder={t('ticketCheckout.buyer.email')}
          aria-label={t('ticketCheckout.buyer.email')}
          autoComplete="email"
          className={INPUT}
        />
      </div>

      {totalQuantity > 1 && (
        <div className="space-y-2 pt-2 border-t border-line">
          <p className="flex items-center gap-1.5 text-xs font-bold text-ink/80">
            <User size={13} className="text-teal-400" aria-hidden="true" />
            {t('ticketCheckout.holders.title', { count: totalQuantity })}
          </p>
          {selectedItems.flatMap(({ ticketType, quantity }) =>
            Array.from({ length: quantity }, (_, index) => {
              const key = `${ticketType.id}_${index}`;
              const holder = holders[key] || {
                name: index === 0 ? buyer.name : '',
                email: index === 0 ? buyer.email : '',
              };
              return (
                <fieldset
                  key={key}
                  className="p-2.5 pt-1 rounded-xl bg-surface border border-line space-y-2"
                >
                  <legend className="px-1 text-xs font-bold text-accent">
                    {t('ticketCheckout.holders.label', {
                      number: index + 1,
                      ticket: ticketType.name,
                    })}
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={holder.name}
                      onChange={(event) => setHolder(key, { ...holder, name: event.target.value })}
                      placeholder={t('ticketCheckout.holders.name')}
                      aria-label={t('ticketCheckout.holders.name')}
                      className={INPUT}
                    />
                    <input
                      type="email"
                      value={holder.email}
                      onChange={(event) => setHolder(key, { ...holder, email: event.target.value })}
                      placeholder={t('ticketCheckout.holders.email')}
                      aria-label={t('ticketCheckout.holders.email')}
                      className={INPUT}
                    />
                  </div>
                </fieldset>
              );
            })
          )}
        </div>
      )}

      {!checkout.isAllFree && (
        <div className="relative">
          <Tag
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/60"
            aria-hidden="true"
          />
          <input
            type="text"
            value={checkout.promoCode}
            onChange={(event) => checkout.setPromoCode(event.target.value)}
            placeholder={t('ticketCheckout.promoCode')}
            aria-label={t('ticketCheckout.promoCode')}
            className={`${INPUT} pl-9 uppercase`}
          />
        </div>
      )}
    </div>
  );
}

=== src/domain/ticketing/components/checkout/TicketOrderPaymentStep.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { TicketCheckoutState } from '../../hooks/useTicketCheckout';
import type { TicketOrder } from '../../types/ticketing';
import { TicketOrderPaymentStep } from './TicketOrderPaymentStep';

vi.mock('../../../payment', () => ({ StripePaymentElement: () => null }));

const ORDER = {
  id: 'ord_12345678',
  status: 'pending_payment',
  subtotalMinor: 10000,
  discountMinor: 0,
  serviceFeeMinor: 600,
  totalMinor: 10600,
  salesPolicySnapshot: {
    cancellationPolicy: 'moderate',
    serviceFeeMode: 'pass_to_buyer',
    allowTicketTransfer: true,
    ticketTransferCutoffHours: 4,
  },
} as TicketOrder;

const CHECKOUT = {
  countdown: { minutes: 9, seconds: 5, isExpired: false, isWarning: false, remainingMs: 545000 },
  clientSecret: 'cs_test',
  paymentProcessing: false,
  setError: vi.fn(),
  confirmPayment: vi.fn(),
  reset: vi.fn(),
} as unknown as TicketCheckoutState;

describe('TicketOrderPaymentStep', () => {
  afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('destaca a taxa de serviço e a política gravada antes do pagamento', async () => {
    await i18n.changeLanguage('fr');
    render(<TicketOrderPaymentStep order={ORDER} checkout={CHECKOUT} />);
    expect(screen.getByText('Frais de service')).toBeTruthy();
    expect(screen.getByText(/^6,00/)).toBeTruthy();
    expect(screen.getByText(/jusqu’à 7 jours avant le début/)).toBeTruthy();
    expect(screen.getByText(/ne sont remboursés qu’en cas de rétractation/)).toBeTruthy();
  });
});

=== src/domain/ticketing/components/checkout/TicketOrderPaymentStep.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Clock, Loader2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { StripePaymentElement } from '../../../payment';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { cn } from '../../../../shared/utils/cn';
import type { TicketCheckoutState } from '../../hooks/useTicketCheckout';
import type { TicketOrder } from '../../types/ticketing';
import { SalesPolicyNotice } from './SalesPolicyNotice';

interface TicketOrderPaymentStepProps {
  order: TicketOrder;
  checkout: TicketCheckoutState;
}

/** Reserva criada: resumo com a taxa de serviço destacada, prazo e pagamento (AGENTS.md §8.7). */
export function TicketOrderPaymentStep({ order, checkout }: TicketOrderPaymentStepProps) {
  const { t, i18n } = useTranslation();
  const money = (minor: number) => formatMoneyMinor(minor, i18n.language);
  const { countdown, clientSecret, paymentProcessing } = checkout;
  const clock = `${String(countdown.minutes).padStart(2, '0')}:${String(countdown.seconds).padStart(2, '0')}`;
  const serviceFeeMinor = order.serviceFeeMinor ?? 0;

  return (
    <GlassCard className="p-4 space-y-4 border-accent-line">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="text-xs font-bold text-accent uppercase tracking-wider">
            {t('ticketCheckout.payment.reservation', { id: order.id.slice(0, 8) })}
          </p>
          <p className="text-base font-black text-ink">
            {t('ticketCheckout.payment.total', { amount: money(order.totalMinor) })}
          </p>
        </div>
        <p
          role="timer"
          className={cn(
            'px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5',
            countdown.isExpired
              ? 'bg-danger-soft border-danger-line text-danger'
              : countdown.isWarning
                ? 'bg-warn-soft border-warn-line text-warn motion-safe:animate-pulse'
                : 'bg-accent-soft border-accent-line text-accent'
          )}
        >
          <Clock size={14} aria-hidden="true" />
          {countdown.isExpired
            ? t('ticketCheckout.payment.expired')
            : t('ticketCheckout.payment.remaining', { time: clock })}
        </p>
      </div>

      <dl className="p-3 rounded-xl bg-surface border border-line space-y-1.5 text-xs">
        <div className="flex justify-between text-ink/70">
          <dt>{t('ticketCheckout.payment.subtotal')}</dt>
          <dd>{money(order.subtotalMinor)}</dd>
        </div>
        {order.discountMinor > 0 && (
          <div className="flex justify-between text-success">
            <dt>{t('ticketCheckout.payment.discount')}</dt>
            <dd>- {money(order.discountMinor)}</dd>
          </div>
        )}
        {serviceFeeMinor > 0 && (
          <div className="flex justify-between text-ink/70">
            <dt>{t('salesPolicy.serviceFee.line')}</dt>
            <dd>{money(serviceFeeMinor)}</dd>
          </div>
        )}
        <div className="flex justify-between font-bold text-ink pt-1 border-t border-line">
          <dt>{t('ticketCheckout.payment.finalTotal')}</dt>
          <dd className="text-accent">{money(order.totalMinor)}</dd>
        </div>
      </dl>

      {order.salesPolicySnapshot && (
        <SalesPolicyNotice
          policy={order.salesPolicySnapshot}
          applied
          showServiceFeeNote={serviceFeeMinor > 0}
        />
      )}

      {paymentProcessing && (
        <p
          role="status"
          className="p-3.5 rounded-xl bg-accent-soft border border-accent-line text-xs text-accent flex items-center gap-2.5"
        >
          <Loader2 size={16} className="animate-spin shrink-0" aria-hidden="true" />
          {t('ticketCheckout.payment.processing')}
        </p>
      )}

      {clientSecret && !countdown.isExpired ? (
        <StripePaymentElement
          clientSecret={clientSecret}
          orderId={order.id}
          disabled={countdown.isExpired || paymentProcessing}
          submitLabel={t('ticketCheckout.payment.pay', { amount: money(order.totalMinor) })}
          onError={(message) => checkout.setError(message)}
          onSuccess={(paymentIntentId) => void checkout.confirmPayment(paymentIntentId)}
        />
      ) : countdown.isExpired ? (
        <button
          type="button"
          onClick={checkout.reset}
          className="w-full min-h-11 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-ink cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('ticketCheckout.payment.newReservation')}
        </button>
      ) : (
        <p
          role="status"
          className="py-6 flex items-center justify-center gap-2 text-xs text-ink/70"
        >
          <Loader2 size={16} className="animate-spin text-teal-400" aria-hidden="true" />
          {t('ticketCheckout.payment.loadingStripe')}
        </p>
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-ink/70">
        <ShieldCheck size={14} className="text-teal-400" aria-hidden="true" />
        {t('ticketCheckout.payment.secure')}
      </p>
    </GlassCard>
  );
}

=== src/domain/ticketing/components/checkout/TicketTypeList.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { PublicTicketTypeProjection } from '../../types/ticketing';

interface TicketTypeListProps {
  ticketTypes: PublicTicketTypeProjection[];
  quantities: Record<string, number>;
  totalQuantity: number;
  maxPerUser: number;
  onChange: (ticketType: PublicTicketTypeProjection, delta: number) => void;
}

const STEP_BUTTON =
  'w-11 h-11 rounded-xl disabled:opacity-40 border font-bold flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer';

export function TicketTypeList({
  ticketTypes,
  quantities,
  totalQuantity,
  maxPerUser,
  onChange,
}: TicketTypeListProps) {
  const { t, i18n } = useTranslation();
  const availability = (ticketType: PublicTicketTypeProjection) => {
    if (ticketType.status === 'sold_out') return t('ticketCheckout.status.soldOut');
    if (ticketType.status === 'not_started') return t('ticketCheckout.status.notStarted');
    if (ticketType.status === 'ended') return t('ticketCheckout.status.ended');
    return t('ticketCheckout.status.available', { count: ticketType.availableQuantity });
  };

  return (
    <ul className="space-y-2.5">
      {ticketTypes.map((ticketType) => {
        const quantity = quantities[ticketType.id] || 0;
        const isAvailable = ticketType.status === 'on_sale' && ticketType.availableQuantity > 0;
        return (
          <li
            key={ticketType.id}
            className="p-3.5 rounded-2xl bg-surface border border-line flex items-center justify-between gap-3"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-ink break-words">{ticketType.name}</span>
                <span className="text-xs font-black text-accent">
                  {ticketType.kind === 'free' || ticketType.priceMinor <= 0
                    ? t('ticketCheckout.free')
                    : formatMoneyMinor(ticketType.priceMinor, i18n.language)}
                </span>
              </div>
              {ticketType.description && (
                <p className="text-xs text-ink/70 line-clamp-2">{ticketType.description}</p>
              )}
              <p className="text-xs text-ink/70">{availability(ticketType)}</p>
            </div>

            {isAvailable ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onChange(ticketType, -1)}
                  disabled={quantity === 0}
                  aria-label={t('ticketCheckout.decrease', { name: ticketType.name })}
                  className={`${STEP_BUTTON} bg-surface border-line text-ink`}
                >
                  -
                </button>
                <span className="w-7 text-center text-sm font-bold text-ink" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onChange(ticketType, 1)}
                  disabled={
                    quantity >= ticketType.maxPerOrder ||
                    quantity >= ticketType.availableQuantity ||
                    totalQuantity >= maxPerUser
                  }
                  aria-label={t('ticketCheckout.increase', { name: ticketType.name })}
                  className={`${STEP_BUTTON} bg-accent-soft border-accent-line text-accent`}
                >
                  +
                </button>
              </div>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-surface text-ink/70 text-xs font-semibold">
                {t('ticketCheckout.unavailable')}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

=== src/domain/ticketing/components/wallet/ResumePaymentCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { StripePaymentElement } from '../../../payment';
import { confirmTicketOrderPaymentReturnUseCase } from '../../application/usecases/confirmTicketOrderPaymentReturnUseCase';
import type { ResumingOrder } from '../../hooks/useTicketWalletActions';

interface ResumePaymentCardProps {
  resuming: ResumingOrder;
  onClose: () => void;
  onError: (message: string) => void;
  onPaid: () => Promise<void>;
}

export function ResumePaymentCard({ resuming, onClose, onError, onPaid }: ResumePaymentCardProps) {
  const { t, i18n } = useTranslation();
  const amount = formatMoneyMinor(resuming.order.totalMinor, i18n.language);
  return (
    <GlassCard className="p-4 space-y-4 border-accent-line">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-ink">
            {t('ticketWallet.resume.title', { id: resuming.order.id.slice(0, 8) })}
          </h4>
          <p className="text-xs text-ink/70">{t('ticketCheckout.payment.total', { amount })}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 px-3 rounded-xl bg-surface hover:bg-white/10 text-xs text-ink/80 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('ticketWallet.resume.close')}
        </button>
      </div>
      <StripePaymentElement
        clientSecret={resuming.clientSecret}
        orderId={resuming.order.id}
        submitLabel={t('ticketCheckout.payment.pay', { amount })}
        onError={onError}
        onSuccess={async (paymentIntentId) => {
          // O webhook é a fonte da verdade (AGENTS.md §8.4); a confirmação no retorno só adianta a tela.
          await confirmTicketOrderPaymentReturnUseCase(resuming.order.id, {
            paymentIntentId: paymentIntentId || resuming.paymentIntentId,
          }).catch(() => undefined);
          await onPaid();
        }}
      />
    </GlassCard>
  );
}

=== src/domain/ticketing/components/wallet/TransferTicketForm.tsx — ARQUIVO NOVO, conteúdo completo ===
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import type { Ticket } from '../../types/ticketing';

const INPUT =
  'w-full min-h-11 px-3.5 rounded-xl bg-surface border border-line text-xs text-ink placeholder:text-ink/60 focus-visible:ring-2 focus-visible:ring-teal-400/50';

interface TransferTicketFormProps {
  ticket: Ticket;
  busy: boolean;
  onSubmit: (recipient: { email: string; name?: string }) => void;
  onCancel: () => void;
}

export function TransferTicketForm({ ticket, busy, onSubmit, onCancel }: TransferTicketFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    onSubmit({ email: email.trim(), name: name.trim() || undefined });
  };
  return (
    <GlassCard className="p-4 space-y-3 border-accent-line">
      <h4 className="text-sm font-bold text-ink">
        {t('ticketWallet.transfer.title', { id: ticket.id.slice(0, 8) })}
      </h4>
      <form onSubmit={submit} className="space-y-2.5">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('ticketWallet.transfer.name')}
          aria-label={t('ticketWallet.transfer.name')}
          className={INPUT}
        />
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t('ticketWallet.transfer.email')}
          aria-label={t('ticketWallet.transfer.email')}
          className={INPUT}
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 px-4 rounded-xl bg-surface text-xs font-bold text-ink/80 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="min-h-11 px-4 rounded-xl bg-teal-400 text-slate-950 text-xs font-black cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {t('ticketWallet.transfer.confirm')}
          </button>
        </div>
      </form>
    </GlassCard>
  );
}

=== src/domain/ticketing/components/wallet/WalletOrderCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Clock, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { TicketOrder } from '../../types/ticketing';

interface WalletOrderCardProps {
  order: TicketOrder;
  canResume: boolean;
  canRefund: boolean;
  busy: boolean;
  onResume: () => void;
  onRefund: () => void;
}

export function WalletOrderCard({
  order,
  canResume,
  canRefund,
  busy,
  onResume,
  onRefund,
}: WalletOrderCardProps) {
  const { t, i18n } = useTranslation();
  const dateFormat = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(i18n.language, { timeZone: 'America/Fortaleza', ...options });
  return (
    <GlassCard className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="space-y-1 min-w-0">
        <p className="text-xs font-bold text-ink">
          {t('ticketWallet.order', {
            id: order.id.slice(0, 8),
            amount: formatMoneyMinor(order.totalMinor, i18n.language),
          })}
        </p>
        <p className="text-xs text-ink/70">
          {dateFormat({ dateStyle: 'medium' }).format(new Date(order.createdAt))} •{' '}
          <span className="font-semibold text-accent">
            {t(`ticketWallet.orderStatus.${order.status}`, { defaultValue: order.status })}
          </span>
        </p>
        {order.expiresAt && order.status === 'pending_payment' && (
          <p className="text-xs text-warn flex items-center gap-1">
            <Clock size={12} aria-hidden="true" />
            {t('ticketWallet.reservedUntil', {
              time: dateFormat({ timeStyle: 'short' }).format(new Date(order.expiresAt)),
            })}
          </p>
        )}
      </div>

      {(canResume || canRefund) && (
        <div className="flex items-center gap-2 flex-wrap">
          {canResume && (
            <button
              type="button"
              disabled={busy}
              onClick={onResume}
              className="min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <Clock size={14} aria-hidden="true" />
              {t('ticketWallet.actions.resume')}
            </button>
          )}
          {canRefund && (
            <button
              type="button"
              disabled={busy}
              onClick={onRefund}
              className="min-h-11 px-3.5 rounded-xl bg-danger-soft border border-danger-line text-xs font-bold text-danger flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <RotateCcw size={14} aria-hidden="true" />
              {t('ticketWallet.actions.refund')}
            </button>
          )}
        </div>
      )}
    </GlassCard>
  );
}

=== src/domain/ticketing/components/wallet/WalletTicketCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { QrCode, RefreshCw, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { cn } from '../../../../shared/utils/cn';
import type { Ticket } from '../../types/ticketing';

interface WalletTicketCardProps {
  ticket: Ticket;
  qrDataUrl?: string;
  canTransfer: boolean;
  busy: boolean;
  onShowQr: () => void;
  onReissueQr: () => void;
  onTransfer: () => void;
}

const ACTION =
  'min-h-11 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function WalletTicketCard({
  ticket,
  qrDataUrl,
  canTransfer,
  busy,
  onShowQr,
  onReissueQr,
  onTransfer,
}: WalletTicketCardProps) {
  const { t, i18n } = useTranslation();
  const startsAt = ticket.eventSnapshot?.startsAt;
  return (
    <GlassCard className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">
            {ticket.ticketTypeSnapshot?.name || t('ticketCheckout.issued.defaultType')}
          </p>
          <h4 className="text-sm font-bold text-ink break-words">
            {ticket.eventSnapshot?.title || ticket.holderName}
          </h4>
          <p className="text-xs text-ink/70 break-all">
            {ticket.holderName} • {ticket.holderEmail}
          </p>
          {startsAt && (
            <p className="text-xs text-ink/70 mt-0.5">
              {t('ticketWallet.session', {
                date: new Intl.DateTimeFormat(i18n.language, {
                  timeZone: 'America/Fortaleza',
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(startsAt)),
              })}
            </p>
          )}
        </div>
        <span
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-bold shrink-0',
            ticket.status === 'issued'
              ? 'bg-accent-soft text-accent'
              : ticket.status === 'checked_in'
                ? 'bg-success-soft text-success'
                : 'bg-white/10 text-ink/70'
          )}
        >
          {t(`ticketWallet.ticketStatus.${ticket.status}`, { defaultValue: ticket.status })}
        </span>
      </div>

      {qrDataUrl && (
        <div className="p-3 rounded-xl bg-white flex flex-col items-center gap-2">
          <img
            src={qrDataUrl}
            width={160}
            height={160}
            alt={t('ticketCheckout.issued.qrAlt', { id: ticket.id.slice(0, 8) })}
            className="w-40 h-40"
          />
          <span className="text-xs font-mono text-slate-700">
            {t('ticketWallet.qrSigned', { version: ticket.qrVersion })}
          </span>
        </div>
      )}

      {(ticket.status === 'issued' || canTransfer) && (
        <div className="flex items-center gap-2 pt-2 border-t border-line flex-wrap">
          {ticket.status === 'issued' && (
            <button
              type="button"
              disabled={busy}
              onClick={onShowQr}
              className={cn(ACTION, 'flex-1 bg-surface hover:bg-white/10 text-ink')}
            >
              <QrCode size={14} className="text-teal-400" aria-hidden="true" />
              {t('ticketWallet.actions.showQr')}
            </button>
          )}
          {ticket.status === 'issued' && qrDataUrl && (
            <button
              type="button"
              disabled={busy}
              onClick={onReissueQr}
              className={cn(ACTION, 'bg-surface hover:bg-white/10 text-ink/80')}
            >
              <RefreshCw size={13} aria-hidden="true" />
              {t('ticketWallet.actions.reissueQr')}
            </button>
          )}
          {canTransfer && (
            <button
              type="button"
              onClick={onTransfer}
              className={cn(ACTION, 'flex-1 bg-accent-soft border border-accent-line text-accent')}
            >
              <Send size={14} aria-hidden="true" />
              {t('ticketWallet.actions.transfer')}
            </button>
          )}
        </div>
      )}
    </GlassCard>
  );
}

=== src/domain/ticketing/hooks/useEventSalesPolicy.ts — ARQUIVO NOVO, conteúdo completo ===
import { useEffect, useState } from 'react';
import { type EventSalesPolicy, getEventListingByIdUseCase } from '../../events';

/** Regras de venda do evento, exibidas antes da compra (AGENTS.md §8.7). */
export function useEventSalesPolicy(eventId: string | undefined) {
  const [salesPolicy, setSalesPolicy] = useState<EventSalesPolicy | null>(null);

  useEffect(() => {
    setSalesPolicy(null);
    if (!eventId) return;
    let active = true;
    getEventListingByIdUseCase(eventId)
      .then((listing) => {
        if (active) setSalesPolicy(listing?.salesPolicy ?? null);
      })
      .catch((error: unknown) => {
        // Sem a política, o aviso some e o resumo do pedido mostra a gravada na reserva.
        console.error('[useEventSalesPolicy]', error);
      });
    return () => {
      active = false;
    };
  }, [eventId]);

  return salesPolicy;
}

=== src/domain/ticketing/hooks/useTicketCheckout.ts — ARQUIVO NOVO, conteúdo completo ===
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../auth';
import { confirmTicketOrderPaymentReturnUseCase } from '../application/usecases/confirmTicketOrderPaymentReturnUseCase';
import { createTicketOrderPaymentIntentUseCase } from '../application/usecases/createTicketOrderPaymentIntentUseCase';
import { createTicketOrderUseCase } from '../application/usecases/createTicketOrderUseCase';
import { expireTicketOrderUseCase } from '../application/usecases/expireTicketOrderUseCase';
import { getTicketOrderUseCase } from '../application/usecases/getTicketOrderUseCase';
import type { PublicTicketTypeProjection, Ticket, TicketOrder } from '../types/ticketing';
import { useCheckoutCountdown } from './useCheckoutCountdown';

export interface IssuedTicketView {
  ticket: Ticket;
  rawQrToken?: string;
  qrDataUrl?: string;
}

export interface HolderDraft {
  name: string;
  email: string;
}

interface UseTicketCheckoutParams {
  occurrenceId: string;
  ticketTypes: PublicTicketTypeProjection[];
  maxTicketsPerUser: number;
  initialBuyer: { name?: string; email?: string };
  reloadTicketTypes: () => Promise<void> | void;
  onRequireLogin?: () => void;
  onOrderCompleted?: (orderId: string) => void;
}

async function withQrCodes(
  rawList: Array<{ ticket: Ticket; rawQrToken?: string }>
): Promise<IssuedTicketView[]> {
  return Promise.all(
    rawList.map(async (entry) => {
      try {
        const qrDataUrl = await QRCode.toDataURL(entry.rawQrToken || entry.ticket.id, {
          width: 220,
          margin: 1,
        });
        return { ...entry, qrDataUrl };
      } catch {
        return entry;
      }
    })
  );
}

/** Seleção, reserva, pagamento e emissão de ingressos de uma sessão. */
export function useTicketCheckout({
  occurrenceId,
  ticketTypes,
  maxTicketsPerUser,
  initialBuyer,
  reloadTicketTypes,
  onRequireLogin,
  onOrderCompleted,
}: UseTicketCheckoutParams) {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [buyerName, setBuyerName] = useState(initialBuyer.name || user?.displayName || '');
  const [buyerEmail, setBuyerEmail] = useState(initialBuyer.email || user?.email || '');
  const [holders, setHolders] = useState<Record<string, HolderDraft>>({});
  const [promoCode, setPromoCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TicketOrder | null>(null);
  const [serverNow, setServerNow] = useState(() => new Date().toISOString());
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [issuedTickets, setIssuedTickets] = useState<IssuedTicketView[]>([]);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const countdown = useCheckoutCountdown({
    expiresAt: order?.expiresAt || new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    serverNow,
  });

  useEffect(() => {
    if (!user) return;
    if (!buyerName && user.displayName) setBuyerName(user.displayName);
    if (!buyerEmail && user.email) setBuyerEmail(user.email);
  }, [user, buyerName, buyerEmail]);

  useEffect(() => {
    if (order?.status !== 'pending_payment' || !countdown.isExpired) return;
    const markExpired = () => setOrder((prev) => (prev ? { ...prev, status: 'expired' } : null));
    expireTicketOrderUseCase(order.id)
      .then(() => {
        markExpired();
        setClientSecret(null);
        setError(t('ticketCheckout.errors.expired'));
        void reloadTicketTypes();
      })
      .catch(markExpired);
  }, [order, countdown.isExpired, reloadTicketTypes, t]);

  const selectedItems = ticketTypes
    .map((ticketType) => ({ ticketType, quantity: quantities[ticketType.id] || 0 }))
    .filter((entry) => entry.quantity > 0);
  const totalQuantity = selectedItems.reduce((sum, entry) => sum + entry.quantity, 0);
  const estimatedSubtotalMinor = selectedItems.reduce(
    (sum, entry) => sum + entry.ticketType.priceMinor * entry.quantity,
    0
  );
  const isAllFree = selectedItems.length > 0 && estimatedSubtotalMinor === 0;
  const effectiveMaxPerUser = Math.min(Math.max(maxTicketsPerUser || 5, 1), 100);

  const changeQuantity = (ticketType: PublicTicketTypeProjection, delta: number) => {
    setQuantities((prev) => {
      const current = prev[ticketType.id] || 0;
      const next = Math.max(0, current + delta);
      const otherTotal = Object.entries(prev).reduce(
        (acc, [id, quantity]) => (id === ticketType.id ? acc : acc + quantity),
        0
      );
      if (next > 0 && next < ticketType.minPerOrder) {
        return {
          ...prev,
          [ticketType.id]:
            delta > 0 ? Math.min(ticketType.minPerOrder, effectiveMaxPerUser - otherTotal) : 0,
        };
      }
      const maxAllowed = Math.min(
        ticketType.maxPerOrder,
        ticketType.availableQuantity,
        Math.max(0, effectiveMaxPerUser - otherTotal)
      );
      return next > maxAllowed ? prev : { ...prev, [ticketType.id]: next };
    });
  };

  const finishWithTickets = async (
    orderId: string,
    tickets: Array<{ ticket: Ticket; rawQrToken?: string }>
  ) => {
    setIssuedTickets(await withQrCodes(tickets));
    await reloadTicketTypes();
    onOrderCompleted?.(orderId);
  };

  const reserve = async () => {
    if (!user) {
      if (onRequireLogin) onRequireLogin();
      else setError(t('ticketCheckout.errors.loginRequired'));
      return;
    }
    if (!occurrenceId) return setError(t('ticketCheckout.errors.selectSession'));
    if (selectedItems.length === 0) return setError(t('ticketCheckout.errors.selectTicket'));
    if (!buyerName.trim() || !buyerEmail.trim()) {
      return setError(t('ticketCheckout.errors.buyerRequired'));
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await createTicketOrderUseCase({
        occurrenceId,
        items: selectedItems.map(({ ticketType, quantity }) => ({
          ticketTypeId: ticketType.id,
          quantity,
          holders: Array.from({ length: quantity }, (_, index) => {
            const custom = holders[`${ticketType.id}_${index}`];
            return {
              name: custom?.name?.trim() || buyerName.trim(),
              email: custom?.email?.trim() || buyerEmail.trim(),
            };
          }),
        })),
        buyer: { name: buyerName.trim(), email: buyerEmail.trim() },
        ...(promoCode.trim() ? { promoCode: promoCode.trim().toUpperCase() } : {}),
        idempotencyKey: `ord_${occurrenceId}_${user.uid}_${crypto.randomUUID()}`,
      });
      setOrder(result.order);
      setServerNow(result.serverNow || new Date().toISOString());

      if (result.order.status === 'paid' || result.order.totalMinor === 0) {
        await finishWithTickets(result.order.id, result.issuedTickets);
        return;
      }

      const intent = await createTicketOrderPaymentIntentUseCase(result.order.id, {
        idempotencyKey: `pi_${result.order.id}_${crypto.randomUUID()}`,
      });
      if (intent.orderStatus === 'paid' || intent.status === 'succeeded') {
        const updated = await getTicketOrderUseCase(result.order.id);
        setOrder(updated.order);
        await finishWithTickets(
          result.order.id,
          updated.tickets.map((ticket) => ({ ticket }))
        );
      } else {
        setClientSecret(intent.clientSecret);
        setPaymentIntentId(intent.paymentIntentId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ticketCheckout.errors.createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmPayment = async (confirmedPaymentIntentId?: string) => {
    if (!order) return;
    setPaymentProcessing(true);
    setError(null);
    try {
      const target = confirmedPaymentIntentId || paymentIntentId || '';
      if (target) {
        await confirmTicketOrderPaymentReturnUseCase(order.id, { paymentIntentId: target });
      }
      const updated = await getTicketOrderUseCase(order.id);
      setOrder(updated.order);
      if (updated.order.status === 'paid') {
        await finishWithTickets(
          updated.order.id,
          updated.tickets.map((ticket) => ({ ticket }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ticketCheckout.errors.awaitingStripe'));
    } finally {
      setPaymentProcessing(false);
    }
  };

  const reset = () => {
    setOrder(null);
    setClientSecret(null);
    setPaymentIntentId(null);
    setIssuedTickets([]);
    setQuantities({});
    setError(null);
  };

  return {
    quantities,
    selectedItems,
    totalQuantity,
    estimatedSubtotalMinor,
    isAllFree,
    effectiveMaxPerUser,
    changeQuantity,
    clearQuantities: () => setQuantities({}),
    buyer: { name: buyerName, email: buyerEmail, setName: setBuyerName, setEmail: setBuyerEmail },
    holders,
    setHolder: (key: string, holder: HolderDraft) =>
      setHolders((prev) => ({ ...prev, [key]: holder })),
    promoCode,
    setPromoCode,
    submitting,
    error,
    setError,
    order,
    clientSecret,
    issuedTickets,
    paymentProcessing,
    countdown,
    reserve,
    confirmPayment,
    reset,
  };
}

export type TicketCheckoutState = ReturnType<typeof useTicketCheckout>;

=== src/domain/ticketing/hooks/useTicketWalletActions.ts — ARQUIVO NOVO, conteúdo completo ===
import QRCode from 'qrcode';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createTicketOrderPaymentIntentUseCase } from '../application/usecases/createTicketOrderPaymentIntentUseCase';
import type { Ticket, TicketOrder } from '../types/ticketing';
import type { useUserTicketsAndOrders } from './useUserTickets';

type WalletData = ReturnType<typeof useUserTicketsAndOrders>;

export interface WalletFeedback {
  type: 'success' | 'error';
  message: string;
}

export interface ResumingOrder {
  order: TicketOrder;
  clientSecret: string;
  paymentIntentId: string;
}

/** Ações da carteira: QR assinado, transferência, reembolso e retomada do pagamento. */
export function useTicketWalletActions(wallet: WalletData) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<WalletFeedback | null>(null);
  const [qrPreview, setQrPreview] = useState<{ ticketId: string; dataUrl: string } | null>(null);
  const [resumingOrder, setResumingOrder] = useState<ResumingOrder | null>(null);
  const [transferTicket, setTransferTicket] = useState<Ticket | null>(null);

  const run = async (action: () => Promise<void>, fallbackKey: string) => {
    setBusy(true);
    setFeedback(null);
    try {
      await action();
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : t(fallbackKey) });
    } finally {
      setBusy(false);
    }
  };

  const previewQr = async (ticketId: string, rawQrToken: string) => {
    const dataUrl = await QRCode.toDataURL(rawQrToken, { width: 240, margin: 1 });
    setQrPreview({ ticketId, dataUrl });
  };

  const showQr = (ticket: Ticket) =>
    run(async () => {
      const { rawQrToken } = await wallet.getSignedQrToken(ticket.id);
      await previewQr(ticket.id, rawQrToken);
    }, 'ticketWallet.errors.qr');

  const reissueQr = (ticket: Ticket) =>
    run(async () => {
      const { rawQrToken } = await wallet.reissueSignedQrToken(ticket.id);
      await previewQr(ticket.id, rawQrToken);
      setFeedback({ type: 'success', message: t('ticketWallet.feedback.qrReissued') });
    }, 'ticketWallet.errors.qrReissue');

  const submitTransfer = (recipient: { email: string; name?: string }) =>
    run(async () => {
      if (!transferTicket) return;
      await wallet.transferTicket(transferTicket.id, recipient.email, recipient.name);
      setTransferTicket(null);
      setFeedback({ type: 'success', message: t('ticketWallet.feedback.transferred') });
    }, 'ticketWallet.errors.transfer');

  const requestRefund = (order: TicketOrder) =>
    run(async () => {
      await wallet.requestRefund(order.id, 'buyer_wallet');
      setFeedback({ type: 'success', message: t('ticketWallet.feedback.refundRequested') });
    }, 'ticketWallet.errors.refund');

  const resumePayment = (order: TicketOrder) =>
    run(async () => {
      const intent = await createTicketOrderPaymentIntentUseCase(order.id, {
        idempotencyKey: `resume_${order.id}_${crypto.randomUUID()}`,
      });
      if (intent.orderStatus === 'paid' || intent.status === 'succeeded') {
        await wallet.reload();
        setFeedback({ type: 'success', message: t('ticketWallet.feedback.alreadyPaid') });
        return;
      }
      setResumingOrder({
        order,
        clientSecret: intent.clientSecret,
        paymentIntentId: intent.paymentIntentId,
      });
    }, 'ticketWallet.errors.resume');

  return {
    busy,
    feedback,
    setFeedback,
    qrPreview,
    showQr,
    reissueQr,
    transferTicket,
    setTransferTicket,
    submitTransfer,
    requestRefund,
    resumingOrder,
    setResumingOrder,
    resumePayment,
  };
}

export type TicketWalletActions = ReturnType<typeof useTicketWalletActions>;

=== src/domain/ticketing/types/ticketing.ts — diff ===
@@ -1,3 +1,5 @@
+import type { EventCancellationPolicy } from '../../../shared/utils/cancellationPolicy';
+
 export type MoneyMinor = number;
 
 export type TicketTypeKind = 'paid' | 'free';
@@ -80,13 +82,12 @@ export interface PublicTicketTypeProjection {
   sortOrder?: number;
 }
 
-export interface TicketOrderRefundPolicySnapshot {
-  enabled: boolean;
-  cancellationWindowHours?: number;
-  allowBuyerCancellation: boolean;
-  buyerCancellationWindowHours?: number;
+/** Regras de venda gravadas na compra (D14): valem mesmo que o evento mude depois. */
+export interface TicketOrderSalesPolicySnapshot {
+  cancellationPolicy: EventCancellationPolicy;
+  serviceFeeMode: 'pass_to_buyer' | 'absorb';
   allowTicketTransfer: boolean;
-  ticketTransferCutoffHours?: number;
+  ticketTransferCutoffHours: number;
 }
 
 export interface TicketOrder {
@@ -100,6 +101,8 @@ export interface TicketOrder {
   discountMinor: MoneyMinor;
   platformFeeMinor: MoneyMinor;
   paymentFeeMinor: MoneyMinor;
+  /** Taxa de serviço paga pelo comprador; só volta no arrependimento (D14). */
+  serviceFeeMinor: MoneyMinor;
   totalMinor: MoneyMinor;
   paymentId?: string;
   paymentIntentId?: string;
@@ -117,7 +120,8 @@ export interface TicketOrder {
     endsAt: string;
     locationName?: string;
   };
-  refundPolicySnapshot: TicketOrderRefundPolicySnapshot;
+  salesPolicySnapshot: TicketOrderSalesPolicySnapshot;
+  paidAt?: string;
   expiresAt?: string;
   idempotencyKey: string;
   createdAt: string;
@@ -133,6 +137,7 @@ export interface TicketOrderItem {
   discountMinor: MoneyMinor;
   allocatedPlatformFeeMinor: MoneyMinor;
   allocatedPaymentFeeMinor: MoneyMinor;
+  allocatedServiceFeeMinor: MoneyMinor;
   totalMinor: MoneyMinor;
   ticketTypeSnapshot: {
     name: string;

=== src/domain/ticketing/utils/ticketWalletRules.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import type { Ticket, TicketOrder } from '../types/ticketing';
import { canRequestRefund, canTransferTicket, previewOrderRefundMinor } from './ticketWalletRules';

const STARTS = '2026-12-20T22:00:00.000Z';

function order(overrides: Partial<TicketOrder> = {}): TicketOrder {
  return {
    id: 'ord_1',
    buyerId: 'u1',
    eventListingId: 'ev1',
    occurrenceId: 'occ1',
    status: 'paid',
    currency: 'BRL',
    subtotalMinor: 10000,
    discountMinor: 0,
    platformFeeMinor: 1000,
    paymentFeeMinor: 0,
    serviceFeeMinor: 600,
    totalMinor: 10600,
    buyerSnapshot: { name: 'Ana', email: 'ana@example.com' },
    eventSnapshot: { title: 'Show', startsAt: STARTS, endsAt: STARTS },
    salesPolicySnapshot: {
      cancellationPolicy: 'moderate',
      serviceFeeMode: 'pass_to_buyer',
      allowTicketTransfer: true,
      ticketTransferCutoffHours: 4,
    },
    paidAt: '2026-10-01T12:00:00.000Z',
    idempotencyKey: 'k',
    createdAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  };
}

const ticket = (status: Ticket['status']) =>
  ({ id: 't1', orderId: 'ord_1', status, eventSnapshot: { startsAt: STARTS } }) as Ticket;
const daysBefore = (days: number) => new Date(new Date(STARTS).getTime() - days * 86_400_000);

describe('regras da carteira de ingressos', () => {
  it('pela política, devolve só o valor do ingresso, sem a taxa de serviço', () => {
    expect(previewOrderRefundMinor(order(), daysBefore(10))).toBe(10000);
    expect(previewOrderRefundMinor(order(), daysBefore(3))).toBe(0);
  });

  it('no arrependimento devolve tudo, inclusive a taxa de serviço', () => {
    const recent = order({ paidAt: '2026-12-14T12:00:00.000Z' });
    expect(previewOrderRefundMinor(recent, daysBefore(3))).toBe(10600);
  });

  it('ingresso utilizado impede o reembolso; transferência respeita o prazo', () => {
    expect(canRequestRefund(order(), [ticket('checked_in')], daysBefore(10))).toBe(false);
    expect(canRequestRefund(order(), [ticket('issued')], daysBefore(10))).toBe(true);
    const lastHours = new Date(new Date(STARTS).getTime() - 2 * 3_600_000);
    expect(canTransferTicket(ticket('issued'), order(), lastHours)).toBe(false);
    expect(canTransferTicket(ticket('issued'), order(), daysBefore(1))).toBe(true);
  });
});

=== src/domain/ticketing/utils/ticketWalletRules.ts — ARQUIVO NOVO, conteúdo completo ===
import { calculateBuyerRefund } from '../../../shared/utils/cancellationPolicy';
import type { Ticket, TicketOrder } from '../types/ticketing';

const HOUR_MS = 60 * 60 * 1000;

/** Transferência pela regra gravada na compra; o backend confere de novo. */
export function canTransferTicket(ticket: Ticket, order: TicketOrder | undefined, now: Date) {
  if (ticket.status !== 'issued') return false;
  const policy = order?.salesPolicySnapshot;
  if (policy && !policy.allowTicketTransfer) return false;
  if (!ticket.eventSnapshot?.startsAt) return true;
  const hoursLeft = (new Date(ticket.eventSnapshot.startsAt).getTime() - now.getTime()) / HOUR_MS;
  return hoursLeft >= (policy?.ticketTransferCutoffHours ?? 4);
}

/**
 * Mesma conta do backend (arrependimento ou política do pedido), só para mostrar o valor antes de pedir.
 * A taxa de serviço só volta no arrependimento (D14).
 */
export function previewOrderRefundMinor(order: TicketOrder, now: Date): number {
  if (order.status !== 'paid' || !order.eventSnapshot?.startsAt || !order.salesPolicySnapshot) {
    return 0;
  }
  const serviceFeeMinor = order.serviceFeeMinor ?? 0;
  const refund = calculateBuyerRefund({
    family: 'event',
    policy: order.salesPolicySnapshot.cancellationPolicy,
    purchasedAt: order.paidAt ?? order.createdAt,
    startsAt: order.eventSnapshot.startsAt,
    now,
    paidMinor: order.totalMinor - serviceFeeMinor,
    serviceFeeMinor,
  });
  return refund.refundMinor + refund.serviceFeeRefundMinor;
}

export function canRequestRefund(order: TicketOrder, tickets: Ticket[], now: Date) {
  const orderTickets = tickets.filter((ticket) => ticket.orderId === order.id);
  if (orderTickets.some((ticket) => ticket.status === 'checked_in')) return false;
  return previewOrderRefundMinor(order, now) > 0;
}

=== src/shared/hooks/useCancellationPolicyOptions.ts — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import {
  type CancellationPolicyFamily,
  canChangeCancellationPolicy,
  policiesOf,
} from '../utils/cancellationPolicy';

/**
 * Opções de política da família, com título e descrição traduzidos. Com `publishedPolicy`, só ficam
 * habilitadas a atual e as mais flexíveis (D14).
 */
export function useCancellationPolicyOptions(
  family: CancellationPolicyFamily,
  publishedPolicy?: string
) {
  const { t } = useTranslation();
  return policiesOf(family).map((policy) => ({
    value: policy,
    title: t(`salesPolicy.policies.${family}.${policy}.title`),
    description: t(`salesPolicy.policies.${family}.${policy}.description`),
    disabled:
      publishedPolicy !== undefined &&
      !canChangeCancellationPolicy(family, publishedPolicy, policy),
  }));
}

=== src/shared/i18n/bookingsResources.ts — diff ===
@@ -7,8 +7,6 @@ export interface BookingsTranslation {
     retry: string;
     duration: string;
     meetingPoint: string;
-    policyFree: string;
-    policyNoFree: string;
     chooseSlot: string;
     noSlots: string;
     spotsLeft_one: string;
@@ -94,12 +92,6 @@ export interface BookingsTranslation {
     removePriceOption: string;
     durationLabel: string;
     meetingPointLabel: string;
-    policyLegend: string;
-    freeHoursLabel: string;
-    refundAfterLabel: string;
-    refundNone: string;
-    refundHalf: string;
-    refundFull: string;
     maxParticipantsLabel: string;
     requireNamesLabel: string;
     save: string;
@@ -192,10 +184,6 @@ export const bookingsPtBR: BookingsTranslation = {
     retry: 'Tentar novamente',
     duration: 'Duração: {{minutes}} min',
     meetingPoint: 'Ponto de encontro: {{address}}',
-    policyFree:
-      'Cancelamento grátis até {{hours}} h antes. Depois, reembolso de {{percent}}%. Após o início, sem reembolso.',
-    policyNoFree:
-      'Reembolso de {{percent}}% se cancelar antes do início. Após o início, sem reembolso.',
     chooseSlot: 'Escolha o horário',
     noSlots: 'Nenhum horário disponível nos próximos 30 dias.',
     spotsLeft_one: '{{count}} vaga',
@@ -284,12 +272,6 @@ export const bookingsPtBR: BookingsTranslation = {
     removePriceOption: 'Remover opção de preço',
     durationLabel: 'Duração (minutos)',
     meetingPointLabel: 'Ponto de encontro',
-    policyLegend: 'Política de cancelamento',
-    freeHoursLabel: 'Cancelamento grátis até quantas horas antes',
-    refundAfterLabel: 'Reembolso depois desse prazo',
-    refundNone: 'Sem reembolso',
-    refundHalf: '50%',
-    refundFull: '100%',
     maxParticipantsLabel: 'Máximo de participantes por reserva',
     requireNamesLabel: 'Pedir o nome de cada participante',
     save: 'Salvar',
@@ -383,9 +365,6 @@ export const bookingsEn: BookingsTranslation = {
     retry: 'Try again',
     duration: 'Duration: {{minutes}} min',
     meetingPoint: 'Meeting point: {{address}}',
-    policyFree:
-      'Free cancellation up to {{hours}} h before. After that, {{percent}}% refund. No refund after the start.',
-    policyNoFree: '{{percent}}% refund if you cancel before the start. No refund after the start.',
     chooseSlot: 'Choose a time',
     noSlots: 'No time slots available in the next 30 days.',
     spotsLeft_one: '{{count}} spot',
@@ -472,12 +451,6 @@ export const bookingsEn: BookingsTranslation = {
     removePriceOption: 'Remove price option',
     durationLabel: 'Duration (minutes)',
     meetingPointLabel: 'Meeting point',
-    policyLegend: 'Cancellation policy',
-    freeHoursLabel: 'Free cancellation up to how many hours before',
-    refundAfterLabel: 'Refund after that deadline',
-    refundNone: 'No refund',
-    refundHalf: '50%',
-    refundFull: '100%',
     maxParticipantsLabel: 'Maximum participants per booking',
     requireNamesLabel: 'Ask for each participant’s name',
     save: 'Save',
@@ -570,10 +543,6 @@ export const bookingsFr: BookingsTranslation = {
     retry: 'Réessayer',
     duration: 'Durée : {{minutes}} min',
     meetingPoint: 'Point de rendez-vous : {{address}}',
-    policyFree:
-      'Annulation gratuite jusqu’à {{hours}} h avant. Ensuite, remboursement de {{percent}} %. Aucun remboursement après le début.',
-    policyNoFree:
-      'Remboursement de {{percent}} % en cas d’annulation avant le début. Aucun remboursement après le début.',
     chooseSlot: 'Choisissez un créneau',
     noSlots: 'Aucun créneau disponible dans les 30 prochains jours.',
     spotsLeft_one: '{{count}} place',
@@ -664,12 +633,6 @@ export const bookingsFr: BookingsTranslation = {
     removePriceOption: 'Retirer l’option de tarif',
     durationLabel: 'Durée (minutes)',
     meetingPointLabel: 'Point de rendez-vous',
-    policyLegend: 'Politique d’annulation',
-    freeHoursLabel: 'Annulation gratuite jusqu’à combien d’heures avant',
-    refundAfterLabel: 'Remboursement après ce délai',
-    refundNone: 'Aucun remboursement',
-    refundHalf: '50 %',
-    refundFull: '100 %',
     maxParticipantsLabel: 'Nombre maximum de participants par réservation',
     requireNamesLabel: 'Demander le nom de chaque participant',
     save: 'Enregistrer',

=== src/shared/i18n/resources.ts — diff ===
@@ -28,6 +28,24 @@ import {
   partnersFr,
   partnersPtBR,
 } from './partnersResources';
+import {
+  type SalesPolicyTranslation,
+  salesPolicyEn,
+  salesPolicyFr,
+  salesPolicyPtBR,
+} from './salesPolicyResources';
+import {
+  type TicketCheckoutTranslation,
+  ticketCheckoutEn,
+  ticketCheckoutFr,
+  ticketCheckoutPtBR,
+} from './ticketCheckoutResources';
+import {
+  type TicketWalletTranslation,
+  ticketWalletEn,
+  ticketWalletFr,
+  ticketWalletPtBR,
+} from './ticketWalletResources';
 import {
   type VerificationTranslation,
   verificationEn,
@@ -41,6 +59,9 @@ export interface TranslationResource {
   listingPlan: ListingPlanTranslation;
   partners: PartnersTranslation;
   paymentAccounts: PaymentAccountsTranslation;
+  salesPolicy: SalesPolicyTranslation;
+  ticketCheckout: TicketCheckoutTranslation;
+  ticketWallet: TicketWalletTranslation;
   verification: VerificationTranslation;
   common: {
     language: string;
@@ -261,6 +282,9 @@ const ptBR: TranslationResource = {
   listingPlan: listingPlanPtBR,
   partners: partnersPtBR,
   paymentAccounts: paymentAccountsPtBR,
+  salesPolicy: salesPolicyPtBR,
+  ticketCheckout: ticketCheckoutPtBR,
+  ticketWallet: ticketWalletPtBR,
   verification: verificationPtBR,
   common: {
     language: 'Idioma',
@@ -531,6 +555,9 @@ const en: TranslationResource = {
   listingPlan: listingPlanEn,
   partners: partnersEn,
   paymentAccounts: paymentAccountsEn,
+  salesPolicy: salesPolicyEn,
+  ticketCheckout: ticketCheckoutEn,
+  ticketWallet: ticketWalletEn,
   verification: verificationEn,
   common: {
     language: 'Language',
@@ -795,6 +822,9 @@ const fr: TranslationResource = {
   listingPlan: listingPlanFr,
   partners: partnersFr,
   paymentAccounts: paymentAccountsFr,
+  salesPolicy: salesPolicyFr,
+  ticketCheckout: ticketCheckoutFr,
+  ticketWallet: ticketWalletFr,
   verification: verificationFr,
   common: {
     language: 'Langue',

=== src/shared/i18n/salesPolicyResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos das políticas de cancelamento e da taxa de serviço (D14). pt-BR é a fonte. */
interface PolicyText {
  title: string;
  description: string;
}

export interface SalesPolicyTranslation {
  policies: {
    event: Record<'flexible' | 'moderate' | 'strict' | 'none', PolicyText>;
    booking: Record<'flexible' | 'moderate' | 'strict' | 'none', PolicyText>;
    transfer: Record<'transfer_flexible' | 'transfer_standard', PolicyText>;
  };
  sectionTitle: string;
  policyLegend: string;
  lockedHint: string;
  withdrawal: string;
  withdrawalNoFee: string;
  noShow: string;
  serviceFee: {
    legend: string;
    passToBuyer: PolicyText;
    absorb: PolicyText;
    line: string;
    notRefundable: string;
  };
}

export const salesPolicyPtBR: SalesPolicyTranslation = {
  policies: {
    event: {
      flexible: { title: 'Flexível', description: 'Reembolso integral até 24 h antes do início.' },
      moderate: {
        title: 'Moderada',
        description: 'Reembolso integral até 7 dias antes do início.',
      },
      strict: { title: 'Rígida', description: 'Reembolso integral até 30 dias antes do início.' },
      none: {
        title: 'Sem reembolso',
        description: 'Sem reembolso fora do direito de arrependimento.',
      },
    },
    booking: {
      flexible: { title: 'Flexível', description: 'Reembolso integral até 24 h antes do início.' },
      moderate: {
        title: 'Moderada',
        description: 'Reembolso integral até 5 dias antes do início; 50% até 24 h antes.',
      },
      strict: { title: 'Rígida', description: 'Reembolso de 50% até 7 dias antes do início.' },
      none: {
        title: 'Sem reembolso',
        description: 'Sem reembolso fora do direito de arrependimento.',
      },
    },
    transfer: {
      transfer_flexible: {
        title: 'Translado flexível',
        description: 'Reembolso integral até 24 h antes da saída.',
      },
      transfer_standard: {
        title: 'Translado padrão',
        description: 'Reembolso de 95% até 24 h antes da saída.',
      },
    },
  },
  sectionTitle: 'Regras de venda',
  policyLegend: 'Política de cancelamento',
  lockedHint: 'Depois de publicar, só é possível trocar por uma política mais flexível.',
  withdrawal:
    'Direito de arrependimento: reembolso integral, inclusive a taxa de serviço, se cancelar em até 7 dias da compra e até 48 h antes do início.',
  withdrawalNoFee:
    'Direito de arrependimento: reembolso integral se cancelar em até 7 dias da compra e até 48 h antes do início.',
  noShow: 'Quem não comparece não tem reembolso.',
  serviceFee: {
    legend: 'Taxa de serviço',
    passToBuyer: {
      title: 'O comprador paga',
      description: 'Uma taxa de serviço por ingresso pago é somada ao preço do ingresso.',
    },
    absorb: {
      title: 'Eu absorvo',
      description: 'O comprador paga só o preço do ingresso, e a comissão da plataforma é maior.',
    },
    line: 'Taxa de serviço',
    notRefundable:
      'A taxa de serviço só é devolvida no direito de arrependimento ou se o organizador cancelar.',
  },
};

export const salesPolicyEn: SalesPolicyTranslation = {
  policies: {
    event: {
      flexible: { title: 'Flexible', description: 'Full refund up to 24 h before the start.' },
      moderate: { title: 'Moderate', description: 'Full refund up to 7 days before the start.' },
      strict: { title: 'Strict', description: 'Full refund up to 30 days before the start.' },
      none: { title: 'No refund', description: 'No refund outside the right of withdrawal.' },
    },
    booking: {
      flexible: { title: 'Flexible', description: 'Full refund up to 24 h before the start.' },
      moderate: {
        title: 'Moderate',
        description: 'Full refund up to 5 days before the start; 50% up to 24 h before.',
      },
      strict: { title: 'Strict', description: '50% refund up to 7 days before the start.' },
      none: { title: 'No refund', description: 'No refund outside the right of withdrawal.' },
    },
    transfer: {
      transfer_flexible: {
        title: 'Flexible transfer',
        description: 'Full refund up to 24 h before departure.',
      },
      transfer_standard: {
        title: 'Standard transfer',
        description: '95% refund up to 24 h before departure.',
      },
    },
  },
  sectionTitle: 'Sales rules',
  policyLegend: 'Cancellation policy',
  lockedHint: 'After publishing, you can only switch to a more flexible policy.',
  withdrawal:
    'Right of withdrawal: full refund, service fee included, if you cancel within 7 days of purchase and at least 48 h before the start.',
  withdrawalNoFee:
    'Right of withdrawal: full refund if you cancel within 7 days of purchase and at least 48 h before the start.',
  noShow: 'No-shows are not refunded.',
  serviceFee: {
    legend: 'Service fee',
    passToBuyer: {
      title: 'The buyer pays',
      description: 'A service fee per paid ticket is added to the ticket price.',
    },
    absorb: {
      title: 'I absorb it',
      description: 'The buyer pays only the ticket price, and the platform commission is higher.',
    },
    line: 'Service fee',
    notRefundable:
      'The service fee is only refunded under the right of withdrawal or if the organizer cancels.',
  },
};

export const salesPolicyFr: SalesPolicyTranslation = {
  policies: {
    event: {
      flexible: {
        title: 'Flexible',
        description: 'Remboursement intégral jusqu’à 24 h avant le début.',
      },
      moderate: {
        title: 'Modérée',
        description: 'Remboursement intégral jusqu’à 7 jours avant le début.',
      },
      strict: {
        title: 'Stricte',
        description: 'Remboursement intégral jusqu’à 30 jours avant le début.',
      },
      none: {
        title: 'Sans remboursement',
        description: 'Aucun remboursement en dehors du droit de rétractation.',
      },
    },
    booking: {
      flexible: {
        title: 'Flexible',
        description: 'Remboursement intégral jusqu’à 24 h avant le début.',
      },
      moderate: {
        title: 'Modérée',
        description:
          'Remboursement intégral jusqu’à 5 jours avant le début ; 50 % jusqu’à 24 h avant.',
      },
      strict: {
        title: 'Stricte',
        description: 'Remboursement de 50 % jusqu’à 7 jours avant le début.',
      },
      none: {
        title: 'Sans remboursement',
        description: 'Aucun remboursement en dehors du droit de rétractation.',
      },
    },
    transfer: {
      transfer_flexible: {
        title: 'Transfert flexible',
        description: 'Remboursement intégral jusqu’à 24 h avant le départ.',
      },
      transfer_standard: {
        title: 'Transfert standard',
        description: 'Remboursement de 95 % jusqu’à 24 h avant le départ.',
      },
    },
  },
  sectionTitle: 'Règles de vente',
  policyLegend: 'Politique d’annulation',
  lockedHint: 'Après la publication, vous ne pouvez passer qu’à une politique plus flexible.',
  withdrawal:
    'Droit de rétractation : remboursement intégral, frais de service compris, si vous annulez dans les 7 jours suivant l’achat et au moins 48 h avant le début.',
  withdrawalNoFee:
    'Droit de rétractation : remboursement intégral si vous annulez dans les 7 jours suivant l’achat et au moins 48 h avant le début.',
  noShow: 'Aucun remboursement en cas d’absence.',
  serviceFee: {
    legend: 'Frais de service',
    passToBuyer: {
      title: 'L’acheteur paie',
      description: 'Des frais de service par billet payant s’ajoutent au prix du billet.',
    },
    absorb: {
      title: 'Je les prends en charge',
      description:
        'L’acheteur ne paie que le prix du billet, et la commission de la plateforme est plus élevée.',
    },
    line: 'Frais de service',
    notRefundable:
      'Les frais de service ne sont remboursés qu’en cas de rétractation ou d’annulation par l’organisateur.',
  },
};

=== src/shared/i18n/ticketCheckoutResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos da compra de ingressos (painel do evento). pt-BR é a fonte. */
export interface TicketCheckoutTranslation {
  title: string;
  limit: string;
  loading: string;
  free: string;
  unavailable: string;
  decrease: string;
  increase: string;
  sessionsLabel: string;
  status: {
    soldOut: string;
    notStarted: string;
    ended: string;
    available_one: string;
    available_other: string;
  };
  buyer: { title: string; name: string; email: string };
  holders: { title: string; label: string; name: string; email: string };
  promoCode: string;
  policy: {
    title: string;
    appliedTitle: string;
    transferAllowed: string;
    transferDisabled: string;
  };
  ticketCount_one: string;
  ticketCount_other: string;
  plusServiceFee: string;
  registerFree: string;
  reserve: string;
  errors: {
    expired: string;
    loginRequired: string;
    selectSession: string;
    selectTicket: string;
    buyerRequired: string;
    createFailed: string;
    awaitingStripe: string;
  };
  issued: {
    freeTitle: string;
    paidTitle: string;
    order: string;
    qrAlt: string;
    defaultType: string;
    ticketId: string;
    buyMore: string;
  };
  payment: {
    reservation: string;
    total: string;
    expired: string;
    remaining: string;
    subtotal: string;
    discount: string;
    finalTotal: string;
    processing: string;
    pay: string;
    newReservation: string;
    loadingStripe: string;
    secure: string;
  };
}

export const ticketCheckoutPtBR: TicketCheckoutTranslation = {
  title: 'Ingressos e inscrições',
  limit: 'Até {{count}} por pessoa nesta sessão',
  loading: 'Carregando ingressos…',
  free: 'Gratuito',
  unavailable: 'Indisponível',
  decrease: 'Diminuir quantidade de {{name}}',
  increase: 'Aumentar quantidade de {{name}}',
  sessionsLabel: 'Sessões do evento',
  status: {
    soldOut: 'Esgotado',
    notStarted: 'Vendas em breve',
    ended: 'Vendas encerradas',
    available_one: '{{count}} disponível',
    available_other: '{{count}} disponíveis',
  },
  buyer: {
    title: 'Dados do comprador',
    name: 'Nome completo',
    email: 'E-mail para receber os ingressos',
  },
  holders: {
    title: 'Titulares dos ingressos ({{count}})',
    label: 'Titular {{number}} — {{ticket}}',
    name: 'Nome do titular',
    email: 'E-mail do titular',
  },
  promoCode: 'Cupom promocional (opcional)',
  policy: {
    title: 'Cancelamento e transferência',
    appliedTitle: 'Política aplicada a este pedido',
    transferAllowed: 'Transferência de titularidade permitida até {{hours}} h antes do início.',
    transferDisabled: 'Transferência de titularidade não habilitada para este evento.',
  },
  ticketCount_one: '{{count}} ingresso',
  ticketCount_other: '{{count}} ingressos',
  plusServiceFee: '+ taxa de serviço, mostrada antes do pagamento',
  registerFree: 'Inscrever-se gratuitamente',
  reserve: 'Reservar e pagar',
  errors: {
    expired: 'Sua reserva expirou. Selecione os ingressos novamente.',
    loginRequired: 'Entre na sua conta Use Guide para reservar ou comprar ingressos.',
    selectSession: 'Selecione uma sessão do evento.',
    selectTicket: 'Selecione ao menos 1 ingresso.',
    buyerRequired: 'Preencha o nome e o e-mail do comprador.',
    createFailed: 'Não foi possível criar o pedido de ingressos.',
    awaitingStripe: 'Pagamento enviado. Aguardando a confirmação final do Stripe.',
  },
  issued: {
    freeTitle: 'Inscrição confirmada!',
    paidTitle: 'Ingressos emitidos!',
    order: 'Pedido #{{id}} • {{event}}',
    qrAlt: 'QR Code do ingresso {{id}}',
    defaultType: 'Ingresso',
    ticketId: 'ID: {{id}} • QR v{{version}}',
    buyMore: 'Comprar mais ingressos',
  },
  payment: {
    reservation: 'Reserva #{{id}}',
    total: 'Total: {{amount}}',
    expired: 'Reserva expirada',
    remaining: 'Tempo restante: {{time}}',
    subtotal: 'Subtotal',
    discount: 'Desconto',
    finalTotal: 'Total',
    processing: 'Confirmando o pagamento e emitindo seus ingressos…',
    pay: 'Pagar {{amount}}',
    newReservation: 'Nova reserva',
    loadingStripe: 'Carregando o pagamento…',
    secure: 'Pagamento seguro pelo Stripe (cartão e Pix)',
  },
};

export const ticketCheckoutEn: TicketCheckoutTranslation = {
  title: 'Tickets and registration',
  limit: 'Up to {{count}} per person for this session',
  loading: 'Loading tickets…',
  free: 'Free',
  unavailable: 'Unavailable',
  decrease: 'Decrease quantity of {{name}}',
  increase: 'Increase quantity of {{name}}',
  sessionsLabel: 'Event sessions',
  status: {
    soldOut: 'Sold out',
    notStarted: 'Sales start soon',
    ended: 'Sales closed',
    available_one: '{{count}} available',
    available_other: '{{count}} available',
  },
  buyer: {
    title: 'Buyer details',
    name: 'Full name',
    email: 'Email to receive the tickets',
  },
  holders: {
    title: 'Ticket holders ({{count}})',
    label: 'Holder {{number}} — {{ticket}}',
    name: 'Holder name',
    email: 'Holder email',
  },
  promoCode: 'Promo code (optional)',
  policy: {
    title: 'Cancellation and transfer',
    appliedTitle: 'Policy applied to this order',
    transferAllowed: 'Ticket transfer allowed up to {{hours}} h before the start.',
    transferDisabled: 'Ticket transfer is not enabled for this event.',
  },
  ticketCount_one: '{{count}} ticket',
  ticketCount_other: '{{count}} tickets',
  plusServiceFee: '+ service fee, shown before payment',
  registerFree: 'Register for free',
  reserve: 'Reserve and pay',
  errors: {
    expired: 'Your reservation expired. Select the tickets again.',
    loginRequired: 'Sign in to your Use Guide account to reserve or buy tickets.',
    selectSession: 'Select an event session.',
    selectTicket: 'Select at least 1 ticket.',
    buyerRequired: 'Fill in the buyer name and email.',
    createFailed: 'Could not create the ticket order.',
    awaitingStripe: 'Payment sent. Waiting for Stripe’s final confirmation.',
  },
  issued: {
    freeTitle: 'Registration confirmed!',
    paidTitle: 'Tickets issued!',
    order: 'Order #{{id}} • {{event}}',
    qrAlt: 'QR code of ticket {{id}}',
    defaultType: 'Ticket',
    ticketId: 'ID: {{id}} • QR v{{version}}',
    buyMore: 'Buy more tickets',
  },
  payment: {
    reservation: 'Reservation #{{id}}',
    total: 'Total: {{amount}}',
    expired: 'Reservation expired',
    remaining: 'Time left: {{time}}',
    subtotal: 'Subtotal',
    discount: 'Discount',
    finalTotal: 'Total',
    processing: 'Confirming payment and issuing your tickets…',
    pay: 'Pay {{amount}}',
    newReservation: 'New reservation',
    loadingStripe: 'Loading payment…',
    secure: 'Secure payment by Stripe (card and Pix)',
  },
};

export const ticketCheckoutFr: TicketCheckoutTranslation = {
  title: 'Billets et inscriptions',
  limit: 'Jusqu’à {{count}} par personne pour cette séance',
  loading: 'Chargement des billets…',
  free: 'Gratuit',
  unavailable: 'Indisponible',
  decrease: 'Diminuer la quantité de {{name}}',
  increase: 'Augmenter la quantité de {{name}}',
  sessionsLabel: 'Séances de l’événement',
  status: {
    soldOut: 'Complet',
    notStarted: 'Ventes bientôt ouvertes',
    ended: 'Ventes terminées',
    available_one: '{{count}} disponible',
    available_other: '{{count}} disponibles',
  },
  buyer: {
    title: 'Coordonnées de l’acheteur',
    name: 'Nom complet',
    email: 'E-mail pour recevoir les billets',
  },
  holders: {
    title: 'Titulaires des billets ({{count}})',
    label: 'Titulaire {{number}} — {{ticket}}',
    name: 'Nom du titulaire',
    email: 'E-mail du titulaire',
  },
  promoCode: 'Code promo (facultatif)',
  policy: {
    title: 'Annulation et transfert',
    appliedTitle: 'Politique appliquée à cette commande',
    transferAllowed: 'Transfert du billet autorisé jusqu’à {{hours}} h avant le début.',
    transferDisabled: 'Le transfert de billet n’est pas activé pour cet événement.',
  },
  ticketCount_one: '{{count}} billet',
  ticketCount_other: '{{count}} billets',
  plusServiceFee: '+ frais de service, affichés avant le paiement',
  registerFree: 'S’inscrire gratuitement',
  reserve: 'Réserver et payer',
  errors: {
    expired: 'Votre réservation a expiré. Sélectionnez à nouveau les billets.',
    loginRequired: 'Connectez-vous à votre compte Use Guide pour réserver ou acheter des billets.',
    selectSession: 'Sélectionnez une séance de l’événement.',
    selectTicket: 'Sélectionnez au moins 1 billet.',
    buyerRequired: 'Renseignez le nom et l’e-mail de l’acheteur.',
    createFailed: 'Impossible de créer la commande de billets.',
    awaitingStripe: 'Paiement envoyé. En attente de la confirmation finale de Stripe.',
  },
  issued: {
    freeTitle: 'Inscription confirmée !',
    paidTitle: 'Billets émis !',
    order: 'Commande n° {{id}} • {{event}}',
    qrAlt: 'QR code du billet {{id}}',
    defaultType: 'Billet',
    ticketId: 'ID : {{id}} • QR v{{version}}',
    buyMore: 'Acheter d’autres billets',
  },
  payment: {
    reservation: 'Réservation n° {{id}}',
    total: 'Total : {{amount}}',
    expired: 'Réservation expirée',
    remaining: 'Temps restant : {{time}}',
    subtotal: 'Sous-total',
    discount: 'Réduction',
    finalTotal: 'Total',
    processing: 'Confirmation du paiement et émission de vos billets…',
    pay: 'Payer {{amount}}',
    newReservation: 'Nouvelle réservation',
    loadingStripe: 'Chargement du paiement…',
    secure: 'Paiement sécurisé par Stripe (carte et Pix)',
  },
};

=== src/shared/i18n/ticketWalletResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos da carteira de ingressos do comprador. pt-BR é a fonte. */
type TicketStatusKey =
  | 'reserved'
  | 'issued'
  | 'checked_in'
  | 'transferred'
  | 'refund_pending'
  | 'refunded'
  | 'canceled'
  | 'invalidated'
  | 'expired';
type OrderStatusKey =
  | 'pending_payment'
  | 'payment_processing'
  | 'paid'
  | 'payment_failed'
  | 'expired'
  | 'refund_pending'
  | 'partially_refunded'
  | 'refunded'
  | 'canceled'
  | 'disputed';

export interface TicketWalletTranslation {
  back: string;
  refresh: string;
  loading: string;
  tabs: { tickets: string; orders: string };
  emptyTickets: string;
  emptyTicketsHint: string;
  emptyOrders: string;
  emptyOrdersHint: string;
  session: string;
  qrSigned: string;
  order: string;
  reservedUntil: string;
  refundConfirm: string;
  actions: { showQr: string; reissueQr: string; transfer: string; resume: string; refund: string };
  ticketStatus: Record<TicketStatusKey, string>;
  orderStatus: Record<OrderStatusKey, string>;
  transfer: { title: string; name: string; email: string; confirm: string };
  resume: { title: string; close: string };
  feedback: {
    qrReissued: string;
    transferred: string;
    refundRequested: string;
    alreadyPaid: string;
    paid: string;
  };
  errors: { qr: string; qrReissue: string; transfer: string; refund: string; resume: string };
}

export const ticketWalletPtBR: TicketWalletTranslation = {
  back: 'Voltar',
  refresh: 'Atualizar ingressos e pedidos',
  loading: 'Carregando seus ingressos…',
  tabs: { tickets: 'Meus ingressos ({{count}})', orders: 'Pedidos ({{count}})' },
  emptyTickets: 'Nenhum ingresso encontrado',
  emptyTicketsHint: 'Os ingressos e inscrições da agenda aparecem aqui.',
  emptyOrders: 'Nenhum pedido registrado',
  emptyOrdersHint: 'Você ainda não fez pedidos de ingressos.',
  session: 'Sessão: {{date}}',
  qrSigned: 'QR assinado • v{{version}}',
  order: 'Pedido #{{id}} • {{amount}}',
  reservedUntil: 'Reserva válida até {{time}}',
  refundConfirm: 'Cancelar o pedido e receber {{amount}} de reembolso?',
  actions: {
    showQr: 'Ver QR',
    reissueQr: 'Novo QR',
    transfer: 'Transferir',
    resume: 'Continuar pagamento',
    refund: 'Cancelar e pedir reembolso',
  },
  ticketStatus: {
    reserved: 'Reservado',
    issued: 'Emitido',
    checked_in: 'Utilizado',
    transferred: 'Transferido',
    refund_pending: 'Reembolso em processamento',
    refunded: 'Reembolsado',
    canceled: 'Cancelado',
    invalidated: 'Inválido',
    expired: 'Expirado',
  },
  orderStatus: {
    pending_payment: 'Pagamento pendente',
    payment_processing: 'Pagamento em processamento',
    paid: 'Pago',
    payment_failed: 'Pagamento recusado',
    expired: 'Expirado',
    refund_pending: 'Reembolso em processamento',
    partially_refunded: 'Reembolsado em parte',
    refunded: 'Reembolsado',
    canceled: 'Cancelado',
    disputed: 'Em disputa',
  },
  transfer: {
    title: 'Transferir ingresso #{{id}}',
    name: 'Nome do novo titular',
    email: 'E-mail do novo titular',
    confirm: 'Confirmar transferência',
  },
  resume: { title: 'Concluir pagamento do pedido #{{id}}', close: 'Fechar' },
  feedback: {
    qrReissued: 'Novo QR Code emitido. O anterior deixou de valer.',
    transferred: 'Ingresso transferido. O novo titular recebeu um QR Code novo.',
    refundRequested: 'Reembolso solicitado. Você recebe pelo mesmo meio de pagamento.',
    alreadyPaid: 'Seu pagamento já estava confirmado. Ingressos atualizados.',
    paid: 'Pagamento confirmado e ingressos emitidos!',
  },
  errors: {
    qr: 'Não foi possível gerar o QR Code.',
    qrReissue: 'Não foi possível emitir um novo QR Code.',
    transfer: 'Não foi possível transferir o ingresso.',
    refund: 'Não foi possível pedir o reembolso.',
    resume: 'Não foi possível retomar o pagamento deste pedido.',
  },
};

export const ticketWalletEn: TicketWalletTranslation = {
  back: 'Back',
  refresh: 'Refresh tickets and orders',
  loading: 'Loading your tickets…',
  tabs: { tickets: 'My tickets ({{count}})', orders: 'Orders ({{count}})' },
  emptyTickets: 'No tickets found',
  emptyTicketsHint: 'Tickets and registrations from the agenda show up here.',
  emptyOrders: 'No orders yet',
  emptyOrdersHint: 'You have not ordered tickets yet.',
  session: 'Session: {{date}}',
  qrSigned: 'Signed QR • v{{version}}',
  order: 'Order #{{id}} • {{amount}}',
  reservedUntil: 'Reservation valid until {{time}}',
  refundConfirm: 'Cancel the order and get a {{amount}} refund?',
  actions: {
    showQr: 'Show QR',
    reissueQr: 'New QR',
    transfer: 'Transfer',
    resume: 'Continue payment',
    refund: 'Cancel and request refund',
  },
  ticketStatus: {
    reserved: 'Reserved',
    issued: 'Issued',
    checked_in: 'Used',
    transferred: 'Transferred',
    refund_pending: 'Refund in progress',
    refunded: 'Refunded',
    canceled: 'Canceled',
    invalidated: 'Invalid',
    expired: 'Expired',
  },
  orderStatus: {
    pending_payment: 'Payment pending',
    payment_processing: 'Payment processing',
    paid: 'Paid',
    payment_failed: 'Payment declined',
    expired: 'Expired',
    refund_pending: 'Refund in progress',
    partially_refunded: 'Partially refunded',
    refunded: 'Refunded',
    canceled: 'Canceled',
    disputed: 'Disputed',
  },
  transfer: {
    title: 'Transfer ticket #{{id}}',
    name: 'New holder name',
    email: 'New holder email',
    confirm: 'Confirm transfer',
  },
  resume: { title: 'Complete payment for order #{{id}}', close: 'Close' },
  feedback: {
    qrReissued: 'New QR code issued. The previous one is no longer valid.',
    transferred: 'Ticket transferred. The new holder received a new QR code.',
    refundRequested: 'Refund requested. You will receive it through the same payment method.',
    alreadyPaid: 'Your payment was already confirmed. Tickets updated.',
    paid: 'Payment confirmed and tickets issued!',
  },
  errors: {
    qr: 'Could not generate the QR code.',
    qrReissue: 'Could not issue a new QR code.',
    transfer: 'Could not transfer the ticket.',
    refund: 'Could not request the refund.',
    resume: 'Could not resume payment for this order.',
  },
};

export const ticketWalletFr: TicketWalletTranslation = {
  back: 'Retour',
  refresh: 'Actualiser les billets et commandes',
  loading: 'Chargement de vos billets…',
  tabs: { tickets: 'Mes billets ({{count}})', orders: 'Commandes ({{count}})' },
  emptyTickets: 'Aucun billet trouvé',
  emptyTicketsHint: 'Les billets et inscriptions de l’agenda apparaissent ici.',
  emptyOrders: 'Aucune commande',
  emptyOrdersHint: 'Vous n’avez pas encore commandé de billets.',
  session: 'Séance : {{date}}',
  qrSigned: 'QR signé • v{{version}}',
  order: 'Commande n° {{id}} • {{amount}}',
  reservedUntil: 'Réservation valable jusqu’à {{time}}',
  refundConfirm: 'Annuler la commande et recevoir un remboursement de {{amount}} ?',
  actions: {
    showQr: 'Voir le QR',
    reissueQr: 'Nouveau QR',
    transfer: 'Transférer',
    resume: 'Continuer le paiement',
    refund: 'Annuler et demander le remboursement',
  },
  ticketStatus: {
    reserved: 'Réservé',
    issued: 'Émis',
    checked_in: 'Utilisé',
    transferred: 'Transféré',
    refund_pending: 'Remboursement en cours',
    refunded: 'Remboursé',
    canceled: 'Annulé',
    invalidated: 'Invalide',
    expired: 'Expiré',
  },
  orderStatus: {
    pending_payment: 'Paiement en attente',
    payment_processing: 'Paiement en cours',
    paid: 'Payé',
    payment_failed: 'Paiement refusé',
    expired: 'Expiré',
    refund_pending: 'Remboursement en cours',
    partially_refunded: 'Remboursé en partie',
    refunded: 'Remboursé',
    canceled: 'Annulé',
    disputed: 'En litige',
  },
  transfer: {
    title: 'Transférer le billet n° {{id}}',
    name: 'Nom du nouveau titulaire',
    email: 'E-mail du nouveau titulaire',
    confirm: 'Confirmer le transfert',
  },
  resume: { title: 'Finaliser le paiement de la commande n° {{id}}', close: 'Fermer' },
  feedback: {
    qrReissued: 'Nouveau QR code émis. L’ancien n’est plus valable.',
    transferred: 'Billet transféré. Le nouveau titulaire a reçu un nouveau QR code.',
    refundRequested: 'Remboursement demandé. Vous le recevrez par le même moyen de paiement.',
    alreadyPaid: 'Votre paiement était déjà confirmé. Billets mis à jour.',
    paid: 'Paiement confirmé et billets émis !',
  },
  errors: {
    qr: 'Impossible de générer le QR code.',
    qrReissue: 'Impossible d’émettre un nouveau QR code.',
    transfer: 'Impossible de transférer le billet.',
    refund: 'Impossible de demander le remboursement.',
    resume: 'Impossible de reprendre le paiement de cette commande.',
  },
};

=== src/ui/components/RadioCardGroup.tsx — ARQUIVO NOVO, conteúdo completo ===
import { cn } from '../../shared/utils/cn';

export interface RadioCardOption<T extends string> {
  value: T;
  title: string;
  description?: string;
  disabled?: boolean;
}

interface RadioCardGroupProps<T extends string> {
  name: string;
  legend: string;
  hint?: string;
  options: RadioCardOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
}

/** Lista de opções em cartões com rádio nativo: teclado e leitor de tela funcionam sem código extra. */
export function RadioCardGroup<T extends string>({
  name,
  legend,
  hint,
  options,
  value,
  onChange,
}: RadioCardGroupProps<T>) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-ink/70 mb-2">{legend}</legend>
      {hint && <p className="text-xs text-ink/70">{hint}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex items-start gap-3 min-h-11 p-3 rounded-2xl border transition-colors',
                checked ? 'border-accent-line bg-accent-soft' : 'border-line bg-surface',
                option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-400/50'
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                disabled={option.disabled}
                onChange={() => onChange(option.value)}
                className="mt-1 w-4 h-4 accent-teal-400 shrink-0"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{option.title}</span>
                {option.description && (
                  <span className="block text-xs text-ink/70">{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/shared/kernel/cancellationPolicy.parity.test.ts src/domain/bookings/components/buyer/MyBookingsView.tsx src/domain/bookings/components/buyer/OfferPolicySummary.tsx src/domain/bookings/components/buyer/buyerComponents.test.tsx src/domain/bookings/components/partner/OfferTextFields.tsx src/domain/bookings/components/partner/PartnerOfferEditor.tsx src/domain/bookings/components/partner/PartnerOffersManager.tsx src/domain/bookings/schemas/offerFormSchema.ts src/domain/bookings/types/bookings.ts src/domain/bookings/utils/bookingsFrontendUtils.test.ts src/domain/bookings/utils/offerFormMapping.ts src/domain/bookings/utils/refundPreview.ts src/domain/events/index.ts src/domain/events/types/event.ts src/domain/guide/components/EventDetailModal.tsx src/domain/partners/components/PartnerEventForm.tsx src/domain/partners/components/PartnerPanel.tsx src/domain/partners/components/event/EventSalesPolicySection.tsx src/domain/partners/hooks/usePartnerContentActions.ts src/domain/partners/hooks/usePartnerEventSessions.ts src/domain/partners/types/partnerContent.ts src/domain/ticketing/components/EventTicketingPurchasePanel.tsx src/domain/ticketing/components/UserTicketsHistoryView.tsx src/domain/ticketing/components/checkout/IssuedTicketsCard.tsx src/domain/ticketing/components/checkout/OccurrencePicker.tsx src/domain/ticketing/components/checkout/SalesPolicyNotice.tsx src/domain/ticketing/components/checkout/TicketBuyerForm.tsx src/domain/ticketing/components/checkout/TicketOrderPaymentStep.test.tsx src/domain/ticketing/components/checkout/TicketOrderPaymentStep.tsx src/domain/ticketing/components/checkout/TicketTypeList.tsx src/domain/ticketing/components/wallet/ResumePaymentCard.tsx src/domain/ticketing/components/wallet/TransferTicketForm.tsx src/domain/ticketing/components/wallet/WalletOrderCard.tsx src/domain/ticketing/components/wallet/WalletTicketCard.tsx src/domain/ticketing/hooks/useEventSalesPolicy.ts src/domain/ticketing/hooks/useTicketCheckout.ts src/domain/ticketing/hooks/useTicketWalletActions.ts src/domain/ticketing/types/ticketing.ts src/domain/ticketing/utils/ticketWalletRules.test.ts src/domain/ticketing/utils/ticketWalletRules.ts src/shared/hooks/useCancellationPolicyOptions.ts src/shared/i18n/bookingsResources.ts src/shared/i18n/resources.ts src/shared/i18n/salesPolicyResources.ts src/shared/i18n/ticketCheckoutResources.ts src/shared/i18n/ticketWalletResources.ts src/ui/components/RadioCardGroup.tsx` (todos verdes). Não precisa rodar a suíte inteira.
- confira no AI Studio, em pt-BR e fr, nos temas claro e escuro: editor de evento pago (seção de política e taxa de serviço), editor de oferta, compra de ingresso (resumo com taxa de serviço) e Meus ingressos (cancelar mostra o valor do reembolso).

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
