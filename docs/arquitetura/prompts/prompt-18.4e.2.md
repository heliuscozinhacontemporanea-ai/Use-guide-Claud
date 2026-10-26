# Prompt 18.4e.2 — Horários de reserva: remarcar, aviso da multa e conta por estabelecimento (D14, D16)

> Lote 17, gerado do commit de referência `0c60e58` da branch `claude/agents-md-v2`. Aplique depois do 18.4e.1. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4e.2 — Horários de reserva: remarcar, aviso da multa e conta por estabelecimento (D14, D16)

Segunda parte das telas do parceiro (18.4e). Telas conferidas por prints e aprovadas em 2026-10-26.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Telas nos dois temas, com folha inferior no celular (§11.1, §11.11), e textos nos 3 idiomas (§12). Nenhuma dependência nova.

O QUE MUDA:
1) Horários de reserva (PartnerSlotsManager): cada horário aberto ganha Remarcar e Cancelar horário.
2) Remarcar (SlotRescheduleDialog): nova data e hora no fuso de Fortaleza e motivo de 3 a 300 caracteres; chama POST /api/partners/offers/:offerId/slots/:slotId/reschedule (rota do 18.4d.3b). Explica que não há multa e que o comprador tem 7 dias para cancelar com reembolso integral.
3) Cancelar (SlotCancelDialog, no lugar do ConfirmDialog): com vagas vendidas, mostra o reembolso integral, a multa de 20% com 24 h para pagar, o caminho da força maior em Recebimentos › Dívidas e oferece primeiro Remarcar em vez de cancelar; sem vendas, só fecha o horário.
4) B26 nas reservas: publicar oferta passa a depender da conta do CNPJ do próprio estabelecimento (canPublish por guideItemId, a partir dos itemIds de cada conta). A regra das categorias que vendem reservas sai do componente para src/domain/bookings/utils/offerKindByCategory.ts (isBookableCategory, exportada pelo index).
5) Aviso de conta financeira (PaymentAccountNotice, novo no domínio payment): uma linha com o texto e o botão Configurar recebimentos, que abre Recebimentos numa folha; PartnerStripeConnectPortal ganha o modo bare (sem cartão nem título). Substitui o cartão de Recebimentos que ficava dentro da lista de ofertas.
6) Telas de reserva tocadas passam para os tokens de tema (ListState, PartnerOfferRow, PartnerSlotsManager).
7) docs/arquitetura/debitos.md: B26 resolvido nas reservas; continua nos ingressos (18.4e.3).

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- src/app/compositions/PartnerBookingsComposition.test.tsx (criar)
- src/app/compositions/PartnerBookingsComposition.tsx (alterar)
- src/domain/bookings/adapters/httpBookingsAdapter.ts (alterar)
- src/domain/bookings/application/usecases/rescheduleSlotUseCase.ts (criar)
- src/domain/bookings/components/partner/PartnerOfferRow.test.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOfferRow.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOffersManager.test.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOffersManager.tsx (alterar)
- src/domain/bookings/components/partner/PartnerSlotsManager.tsx (alterar)
- src/domain/bookings/components/partner/SlotCancelDialog.tsx (criar)
- src/domain/bookings/components/partner/SlotRescheduleDialog.tsx (criar)
- src/domain/bookings/components/partner/slotDialogs.test.tsx (criar)
- src/domain/bookings/components/shared/ListState.tsx (alterar)
- src/domain/bookings/hooks/usePartnerSlots.ts (alterar)
- src/domain/bookings/index.ts (alterar)
- src/domain/bookings/ports/bookingsApiPort.ts (alterar)
- src/domain/bookings/utils/offerKindByCategory.ts (criar)
- src/domain/payment/components/PartnerStripeConnectPortal.tsx (alterar)
- src/domain/payment/components/PaymentAccountNotice.tsx (criar)
- src/domain/payment/index.ts (alterar)
- src/shared/i18n/bookingsResources.ts (alterar)
- src/shared/i18n/receivablesResources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -18,7 +18,7 @@
 | B20 | `operationalInfoSchema` duplicado em `server/domain/guide/schemas/guideSchema.ts` e `server/domain/partners/schemas/partnerContentSchema.ts` | §5.3 | baixo — as duas cópias precisam mudar juntas | rotas de conteúdo do parceiro passarem a validar com o schema publicado pelo `guide` (Published Language) |
 | B21 | `package-lock.json`: `npm audit --omit=dev` aponta 10 vulnerabilidades (1 crítica, 7 altas) em `firebase`, `@firebase/firestore`, `@grpc/grpc-js`, `gaxios`, `proxy-addr`, `uuid` e outras | §7.4 e §7.10 A06 (sem high/critical para merge) | alto — já existiam antes do Prompt 18.3.0a; a dependência nova (`@google-cloud/kms` 6.2.1) não acrescentou nenhuma | prompt próprio de atualização de dependências, testando cada salto de versão |
 | B25 | `src/index.css`: o tema claro ainda depende de sobrescritas globais com `!important` (`:root.light .text-white`, `.bg-white/5`, `.border-white/10`…) para as telas que usam cores fixas; `biome-ignore-all lint/complexity/noImportantStyles` no topo do arquivo | §11.1 (tokens, nunca `text-white` fixo em superfície que muda) e §13 (sem avisos) | médio — cor nova sem token pode sair ilegível no claro; as sobrescritas valem para o app todo | cada tela tocada passa a usar os tokens `--ug-*` (`text-ink`, `bg-surface`, `border-line`, `text-warn`…); quando nenhuma usar mais as classes fixas, as sobrescritas e o `biome-ignore-all` saem |
-| B26 | Avisos de conta financeira no painel de ingressos (`usePartnerMerchantAccount`) e de reservas (`PartnerBookingsComposition`): consideram pronto quando **algum** CNPJ da conta está pronto para receber, não o CNPJ do evento ou da oferta | D14 (conta por documento) | baixo — só o aviso na tela; a venda e a publicação conferem a conta do CNPJ certo no backend (`assertListingCanSellUseCase` + `assertPaymentAccountReadyUseCase`) | Prompt 18.4e: aviso por estabelecimento; `PartnerEventTicketingManager` (1111 linhas) dividido ao tocar |
+| B26 | Aviso de conta financeira no painel de ingressos (`usePartnerMerchantAccount`): considera pronto quando **algum** CNPJ da conta está pronto para receber, não o CNPJ do evento. Nas reservas, resolvido no 18.4e.2 (aviso e botão de publicar por estabelecimento) | D14 (conta por documento) | baixo — só o aviso na tela; a venda e a publicação conferem a conta do CNPJ certo no backend (`assertListingCanSellUseCase` + `assertPaymentAccountReadyUseCase`) | Prompt 18.4e.3: aviso por evento; `PartnerEventTicketingManager` (1111 linhas) dividido ao tocar |
 | B28 | `bookings/components/partner/OfferTextFields.tsx` (abas pt-BR/en/fr com tradução à mão) e editor de evento do parceiro (texto só em português) | D5 e AGENTS.md §12.6 (editar no idioma ativo, tradução automática) | médio — visitante em inglês ou francês vê o português, e o parceiro digita traduções que a D5 proíbe | 19.1: `LocalizedText`, `MachineTranslationPort` e outbox; o editor mostra o idioma de Configurações e o salvo vira o original |
 | B30 | `server/domain/payment/services/saleClaimService.ts` e `server/interfaces/http/saleClaims/`: o reembolso decidido numa reclamação não muda o status do pedido de ingresso nem da reserva; e a abertura de reclamação não tem rate limit (o app ainda não tem rate limit com armazenamento compartilhado) | §11.8 (o comprador vê o estado real da compra) e §7.4 (rate limit em rotas de pagamento) | baixo — uma reclamação por venda e só do próprio comprador; a carteira mostra "pago" depois do reembolso até a tela do 18.4f mostrar o status da reclamação | 18.4f: a carteira e Minhas reservas mostram o status da reclamação; rate limit junto com o das outras rotas de pagamento |

=== src/app/compositions/PartnerBookingsComposition.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../shared/i18n';

const m = vi.hoisted(() => ({ accounts: vi.fn(), manager: vi.fn() }));
vi.mock('../../domain/payment', () => ({
  listPaymentAccountsUseCase: m.accounts,
  PaymentAccountNotice: ({ message }: { message: string }) => (
    <div>
      {message}
      <span>portal</span>
    </div>
  ),
}));
vi.mock('../../domain/bookings', () => ({
  isBookableCategory: (category: string) => category === 'tour' || category === 'sight',
  PartnerOffersManager: (props: {
    canPublish: (id: string) => boolean;
    accountNotice?: React.ReactNode;
  }) => {
    m.manager(props);
    return <div>{props.accountNotice}</div>;
  },
}));

import { PartnerBookingsComposition } from './PartnerBookingsComposition';

const ITEMS = [
  { id: 'tour-1', name: 'Buggy', category: 'tour' },
  { id: 'tour-2', name: 'Lagoa', category: 'tour' },
  { id: 'rest-1', name: 'Restaurante', category: 'restaurant' },
];

describe('PartnerBookingsComposition (B26: conta por estabelecimento)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('publicar depende da conta do CNPJ de cada estabelecimento', async () => {
    m.accounts.mockResolvedValue([
      { accountKey: 'k1', itemIds: ['tour-1'], account: { readyForSales: true } },
      { accountKey: 'k2', itemIds: ['tour-2'], account: { readyForSales: false } },
    ]);
    render(<PartnerBookingsComposition items={ITEMS as never} />);
    expect(await screen.findByText(/Alguns estabelecimentos ainda não podem vender/)).toBeTruthy();
    const { canPublish } = m.manager.mock.calls.at(-1)?.[0] ?? {};
    expect(canPublish('tour-1')).toBe(true);
    expect(canPublish('tour-2')).toBe(false);
  });

  it('restaurante sem conta não gera aviso: só passeios e atrações vendem', async () => {
    m.accounts.mockResolvedValue([
      { accountKey: 'k1', itemIds: ['tour-1', 'tour-2'], account: { readyForSales: true } },
    ]);
    render(<PartnerBookingsComposition items={ITEMS as never} />);
    await waitFor(() => expect(m.accounts).toHaveBeenCalled());
    await waitFor(() => expect(m.manager.mock.calls.at(-1)?.[0].canPublish('tour-2')).toBe(true));
    expect(screen.queryByText('portal')).toBeNull();
  });
});

=== src/app/compositions/PartnerBookingsComposition.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type BookableGuideItem,
  isBookableCategory,
  PartnerOffersManager,
} from '../../domain/bookings';
import { listPaymentAccountsUseCase, PaymentAccountNotice } from '../../domain/payment';

type AccountState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'loaded'; readyItemIds: Set<string> };

/** Junta o gerenciador de reservas (bookings) e o onboarding financeiro (payment) na área do parceiro. */
export function PartnerBookingsComposition({ items }: { items: BookableGuideItem[] }) {
  const { t } = useTranslation();
  const [account, setAccount] = useState<AccountState>({ status: 'loading' });

  const loadStatus = useCallback(() => {
    let active = true;
    setAccount({ status: 'loading' });
    // Cada estabelecimento vende pela conta do CNPJ dele (D14): o aviso e o botão de publicar são por item.
    listPaymentAccountsUseCase()
      .then((accounts) => {
        const readyItemIds = new Set(
          accounts.filter((entry) => entry.account?.readyForSales).flatMap((entry) => entry.itemIds)
        );
        if (active) setAccount({ status: 'loaded', readyItemIds });
      })
      .catch(() => {
        // Falha de rede não significa conta incompleta: não mostra o onboarding por engano.
        if (active) setAccount({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => loadStatus(), [loadStatus]);

  const isReady = (itemId: string) =>
    account.status === 'loaded' && account.readyItemIds.has(itemId);
  const bookable = items.filter((item) => isBookableCategory(item.category));
  const notReady = account.status === 'loaded' ? bookable.filter((item) => !isReady(item.id)) : [];
  const noneReady = notReady.length === bookable.length;

  return (
    <PartnerOffersManager
      items={items}
      canPublish={isReady}
      accountNotice={
        notReady.length > 0 ? (
          <PaymentAccountNotice
            message={t(
              noneReady ? 'bookings.partner.stripeRequired' : 'bookings.partner.stripeRequiredSome'
            )}
            onClosed={loadStatus}
          />
        ) : account.status === 'error' ? (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-surface border border-line"
          >
            <p className="text-xs text-ink">{t('bookings.partner.accountStatusError')}</p>
            <button
              type="button"
              onClick={loadStatus}
              className="press min-h-11 px-4 rounded-xl border border-line text-xs font-bold text-ink hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {t('bookings.partner.retry')}
            </button>
          </div>
        ) : null
      }
    />
  );
}

=== src/domain/bookings/adapters/httpBookingsAdapter.ts — diff ===
@@ -76,6 +76,17 @@ export class HttpBookingsAdapter implements BookingsApiPort {
     );
   }
 
+  async rescheduleSlot(
+    offerId: string,
+    slotId: string,
+    change: { startsAt: string; reason: string }
+  ): Promise<{ rescheduledBookings: number }> {
+    return call(
+      `${offerPath(offerId)}/slots/${encodeURIComponent(slotId)}/reschedule`,
+      json('POST', change)
+    );
+  }
+
   async listOfferBookings(offerId: string, cursor?: string | null): Promise<Page<BookingSummary>> {
     const query = new URLSearchParams({ limit: '20', ...(cursor ? { cursor } : {}) });
     return call(`${offerPath(offerId)}/bookings?${query}`);

=== src/domain/bookings/application/usecases/rescheduleSlotUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';

/** Remarca o horário; as reservas valem na nova data e o comprador tem 7 dias para desistir (D16). */
export async function rescheduleSlotUseCase(
  offerId: string,
  slotId: string,
  change: { startsAt: string; reason: string }
): Promise<{ rescheduledBookings: number }> {
  return bookingsApi.rescheduleSlot(offerId, slotId, change);
}

=== src/domain/bookings/components/partner/PartnerOfferRow.test.tsx — diff ===
@@ -39,7 +39,11 @@ describe('PartnerOfferRow', () => {
     const onStatus = renderRow(false);
     const publish = screen.getByRole('button', { name: 'Publicar' });
     expect((publish as HTMLButtonElement).disabled).toBe(true);
-    expect(screen.getByText('Conclua a configuração financeira para publicar.')).toBeTruthy();
+    expect(
+      screen.getByText(
+        'Conclua a configuração financeira do CNPJ deste estabelecimento para publicar.'
+      )
+    ).toBeTruthy();
     fireEvent.click(publish);
     expect(onStatus).not.toHaveBeenCalled();
   });

=== src/domain/bookings/components/partner/PartnerOfferRow.tsx — diff ===
@@ -5,10 +5,10 @@ import { formatMinor } from '../../utils/money';
 import { BUTTON_SECONDARY } from '../shared/ListState';
 
 const STATUS_STYLE: Record<OfferStatus, string> = {
-  draft: 'bg-white/10 text-white/80',
-  published: 'bg-emerald-500/15 text-emerald-300',
-  paused: 'bg-amber-500/15 text-amber-200',
-  archived: 'bg-white/5 text-white/60',
+  draft: 'bg-surface border border-line text-ink/80',
+  published: 'bg-success-soft border border-success-line text-success',
+  paused: 'bg-warn-soft border border-warn-line text-warn',
+  archived: 'bg-surface border border-line text-ink/70',
 };
 
 interface PartnerOfferRowProps {
@@ -35,11 +35,11 @@ export function PartnerOfferRow({
   const archived = offer.status === 'archived';
 
   return (
-    <li className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
+    <li className="p-4 rounded-2xl bg-surface border border-line space-y-3">
       <div className="flex flex-wrap items-start justify-between gap-2">
         <div className="min-w-0">
-          <p className="text-sm font-bold text-white break-words">{offer.title['pt-BR']}</p>
-          <p className="text-xs text-white/60">
+          <p className="text-sm font-bold text-ink break-words">{offer.title['pt-BR']}</p>
+          <p className="text-xs text-ink/70">
             {t(`bookings.kind.${offer.kind}`)} ·{' '}
             {t('bookings.partner.fromPrice', { amount: formatMinor(fromMinor, i18n.language) })}
           </p>
@@ -96,7 +96,7 @@ export function PartnerOfferRow({
         </div>
       )}
       {!canPublish && offer.status !== 'published' && !archived && (
-        <p id={`publish-hint-${offer.id}`} className="text-[11px] text-amber-200">
+        <p id={`publish-hint-${offer.id}`} className="text-[11px] text-warn">
           {t('bookings.partner.publishNeedsStripe')}
         </p>
       )}

=== src/domain/bookings/components/partner/PartnerOffersManager.test.tsx — diff ===
@@ -1,4 +1,4 @@
-import { fireEvent, render, screen, waitFor } from '@testing-library/react';
+import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
 import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
 import { i18n } from '../../../../shared/i18n';
 import { PartnerOffersManager } from './PartnerOffersManager';
@@ -37,7 +37,7 @@ describe('PartnerOffersManager', () => {
     await i18n.changeLanguage('fr');
     render(
       <PartnerOffersManager
-        canPublish
+        canPublish={() => true}
         items={[{ id: 'r1', name: 'Restaurante', category: 'restaurant' }]}
       />
     );
@@ -59,7 +59,7 @@ describe('PartnerOffersManager', () => {
     }));
     render(
       <PartnerOffersManager
-        canPublish
+        canPublish={() => true}
         items={[{ id: 'item-1', name: 'Lagoa do Paraíso', category: 'tour' }]}
       />
     );
@@ -84,7 +84,7 @@ describe('PartnerOffersManager', () => {
 describe('PartnerSlotsManager', () => {
   beforeEach(() => vi.clearAllMocks());
 
-  it('cancelar horário só acontece depois da confirmação', async () => {
+  it('cancelar horário só acontece depois da confirmação, com o aviso da multa (D14)', async () => {
     vi.mocked(listPartnerSlotsUseCase).mockResolvedValue([
       {
         id: 'slot-1',
@@ -100,12 +100,9 @@ describe('PartnerSlotsManager', () => {
     render(<PartnerSlotsManager offerId="offer-1" />);
     fireEvent.click(await screen.findByRole('button', { name: 'Cancelar horário' }));
     expect(cancelSlotUseCase).not.toHaveBeenCalled();
-    expect(
-      screen.getByText(
-        'Cancelar este horário? Todas as reservas pagas serão reembolsadas integralmente.'
-      )
-    ).toBeTruthy();
-    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
+    expect(await screen.findByText(/multa de 20% do valor vendido/)).toBeTruthy();
+    const dialog = screen.getByRole('dialog');
+    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar horário' }));
     await waitFor(() => expect(cancelSlotUseCase).toHaveBeenCalledWith('offer-1', 'slot-1'));
     expect(await screen.findByText('Horário cancelado. 3 reservas reembolsadas.')).toBeTruthy();
   });

=== src/domain/bookings/components/partner/PartnerOffersManager.tsx — diff ===
@@ -12,12 +12,7 @@ import { PartnerBookingsList } from './PartnerBookingsList';
 import { PartnerOfferEditor } from './PartnerOfferEditor';
 import { PartnerOfferRow } from './PartnerOfferRow';
 import { PartnerSlotsManager } from './PartnerSlotsManager';
-
-// Fase 1 (decisão D3): passeio vende horários; atração vende entradas.
-const KIND_BY_CATEGORY: Record<string, PartnerOffer['kind']> = {
-  tour: 'tour',
-  sight: 'private_entry',
-};
+import { isBookableCategory, offerKindForCategory } from '../../utils/offerKindByCategory';
 
 type View =
   | { type: 'list' }
@@ -28,8 +23,8 @@ interface PartnerOffersManagerProps {
   items: BookableGuideItem[];
   /** Aviso montado pela composição quando a conta financeira ainda não está habilitada. */
   accountNotice?: ReactNode;
-  /** Publicar só com a conta financeira pronta; o servidor confere de novo. */
-  canPublish: boolean;
+  /** Publicar só com a conta do CNPJ do estabelecimento pronta (D14); o servidor confere de novo. */
+  canPublish: (guideItemId: string) => boolean;
 }
 
 export function PartnerOffersManager({
@@ -43,7 +38,7 @@ export function PartnerOffersManager({
   const [busyId, setBusyId] = useState<string | null>(null);
   const [actionError, setActionError] = useState<string | null>(null);
   const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
-  const eligible = items.filter((item) => KIND_BY_CATEGORY[item.category]);
+  const eligible = items.filter((item) => isBookableCategory(item.category));
 
   const changeStatus = async (offer: PartnerOffer, status: Exclude<OfferStatus, 'draft'>) => {
     setBusyId(offer.id);
@@ -105,7 +100,7 @@ export function PartnerOffersManager({
           defaultValues={
             view.offer
               ? offerToFormValues(view.offer)
-              : emptyOfferFormValues(KIND_BY_CATEGORY[view.item.category] ?? 'tour')
+              : emptyOfferFormValues(offerKindForCategory(view.item.category) ?? 'tour')
           }
           onCancel={() => setView({ type: 'list' })}
           onSubmit={async (fields, kind) => {
@@ -165,7 +160,7 @@ export function PartnerOffersManager({
                           key={offer.id}
                           offer={offer}
                           busy={busyId === offer.id}
-                          canPublish={canPublish}
+                          canPublish={canPublish(item.id)}
                           onEdit={() => setView({ type: 'editor', item, offer })}
                           onSlots={() => setView({ type: 'slots', offer })}
                           onBookings={() => setView({ type: 'bookings', offer })}

=== src/domain/bookings/components/partner/PartnerSlotsManager.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { SlotCancelDialog } from './SlotCancelDialog';
import { SlotCreationForm } from './SlotCreationForm';
import { SlotRescheduleDialog } from './SlotRescheduleDialog';

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
  const { data, loading, error, reload, create, cancel, reschedule } = usePartnerSlots(
    offerId,
    weekStart
  );
  const [canceling, setCanceling] = useState<PartnerSlot | null>(null);
  const [rescheduling, setRescheduling] = useState<PartnerSlot | null>(null);
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

  const confirmCancel = async (slot: PartnerSlot) => {
    setCanceling(null);
    try {
      const result = await cancel(slot.id);
      setNotice(t('bookings.slots.canceled', { count: result.canceledBookings }));
    } catch (err: unknown) {
      setNotice(getBookingErrorMessage(err));
    }
  };

  const submitReschedule = async (
    slot: PartnerSlot,
    change: { startsAt: string; reason: string }
  ) => {
    const result = await reschedule(slot.id, change);
    setRescheduling(null);
    setNotice(t('bookings.slots.rescheduled', { count: result.rescheduledBookings }));
  };

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
        <p className="text-sm font-semibold text-ink">
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
        <p role="status" className="text-xs text-accent">
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
            <h4 className="text-xs font-bold uppercase tracking-wide text-ink/70">
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
                    className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-surface border border-line"
                  >
                    <div>
                      <p className="text-sm font-bold text-ink">
                        {formatSlotTime(slot.startsAt, i18n.language)}
                      </p>
                      <p className="text-xs text-ink/70">
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
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setRescheduling(slot)}
                          className={BUTTON_SECONDARY}
                        >
                          {t('bookings.slots.reschedule')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCanceling(slot)}
                          className={BUTTON_SECONDARY}
                        >
                          {t('bookings.slots.cancelSlot')}
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      <SlotCreationForm onCreate={handleCreate} />
      <SlotCancelDialog
        slot={canceling}
        onClose={() => setCanceling(null)}
        onConfirm={(slot) => void confirmCancel(slot)}
        onReschedule={(slot) => {
          setCanceling(null);
          setRescheduling(slot);
        }}
      />
      {/* A chave recria o formulário vazio para cada horário. */}
      <SlotRescheduleDialog
        key={rescheduling?.id ?? 'none'}
        slot={rescheduling}
        onClose={() => setRescheduling(null)}
        onSubmit={submitReschedule}
      />
    </section>
  );
}

=== src/domain/bookings/components/partner/SlotCancelDialog.tsx — ARQUIVO NOVO, conteúdo completo ===
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import type { PartnerSlot } from '../../types/bookings';
import { formatSlotDateTime } from '../../utils/dates';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../shared/ListState';

const BUTTON_DANGER =
  'press min-h-11 px-4 rounded-xl bg-danger-soft border border-danger-line text-danger text-xs font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50';

/**
 * Cancelar com vagas vendidas gera multa de 20% para o CNPJ (D14); a tela mostra a multa e oferece
 * remarcar primeiro, que não tem multa (D16, 4A).
 */
export function SlotCancelDialog({
  slot,
  onClose,
  onConfirm,
  onReschedule,
}: {
  slot: PartnerSlot | null;
  onClose: () => void;
  onConfirm: (slot: PartnerSlot) => void;
  onReschedule: (slot: PartnerSlot) => void;
}) {
  const { t, i18n } = useTranslation();
  const sold = slot?.capacitySold ?? 0;

  return (
    <Dialog
      open={slot !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('bookings.slots.cancelTitle')}
      description={slot ? formatSlotDateTime(slot.startsAt, i18n.language) : undefined}
    >
      {slot && (
        <div className="space-y-4">
          {sold > 0 ? (
            <>
              <p className="text-sm text-ink">
                {t('bookings.slots.cancelWithSales', { count: sold })}
              </p>
              <p className="flex items-start gap-2 p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                {t('bookings.slots.cancelPenalty')}
              </p>
              <p className="text-xs text-ink/70">{t('bookings.slots.cancelForceMajeure')}</p>
            </>
          ) : (
            <p className="text-sm text-ink">{t('bookings.slots.cancelNoSales')}</p>
          )}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button type="button" onClick={onClose} className={BUTTON_SECONDARY}>
              {t('bookings.slots.back')}
            </button>
            <button type="button" onClick={() => onConfirm(slot)} className={BUTTON_DANGER}>
              {t('bookings.slots.cancelAnyway')}
            </button>
            {sold > 0 && (
              <button type="button" onClick={() => onReschedule(slot)} className={BUTTON_PRIMARY}>
                {t('bookings.slots.rescheduleInstead')}
              </button>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}

=== src/domain/bookings/components/partner/SlotRescheduleDialog.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import type { PartnerSlot } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { formatSlotDateTime, fortalezaInputToIso } from '../../utils/dates';
import { BUTTON_PRIMARY, INPUT } from '../shared/ListState';

const MIN_REASON = 3;
const MAX_REASON = 300;

export function SlotRescheduleDialog({
  slot,
  onClose,
  onSubmit,
}: {
  slot: PartnerSlot | null;
  onClose: () => void;
  onSubmit: (slot: PartnerSlot, change: { startsAt: string; reason: string }) => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const [when, setWhen] = useState('');
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!slot) return;
    const startsAt = fortalezaInputToIso(when);
    if (
      !startsAt ||
      new Date(startsAt).getTime() <= Date.now() ||
      reason.trim().length < MIN_REASON
    ) {
      return setError(t('bookings.slots.rescheduleInvalid'));
    }
    setSending(true);
    setError(null);
    try {
      await onSubmit(slot, { startsAt, reason: reason.trim() });
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={slot !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('bookings.slots.rescheduleTitle')}
      description={t('bookings.slots.rescheduleDescription')}
    >
      {slot && (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <p className="text-xs font-bold text-ink/80">
            {formatSlotDateTime(slot.startsAt, i18n.language)}
          </p>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-when`} className="text-xs font-bold text-ink">
              {t('bookings.slots.newDateTime')}
            </label>
            <input
              id={`${id}-when`}
              type="datetime-local"
              value={when}
              onChange={(event) => setWhen(event.target.value)}
              aria-describedby={`${id}-tz`}
              className={INPUT}
            />
            <p id={`${id}-tz`} className="text-[11px] text-ink/70">
              {t('bookings.slots.timezoneNotice')}
            </p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-reason`} className="text-xs font-bold text-ink">
              {t('bookings.slots.rescheduleReason')}
            </label>
            <textarea
              id={`${id}-reason`}
              value={reason}
              maxLength={MAX_REASON}
              rows={3}
              onChange={(event) => setReason(event.target.value)}
              aria-describedby={`${id}-reason-hint`}
              className={`${INPUT} py-2`}
            />
            <p id={`${id}-reason-hint`} className="text-[11px] text-ink/70">
              {t('bookings.slots.rescheduleReasonHint')}
            </p>
          </div>
          {error && (
            <p
              role="alert"
              className="p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={sending}
            className={`${BUTTON_PRIMARY} w-full flex items-center justify-center gap-2`}
          >
            {sending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {t('bookings.slots.rescheduleSubmit')}
          </button>
        </form>
      )}
    </Dialog>
  );
}

=== src/domain/bookings/components/partner/slotDialogs.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerSlot } from '../../types/bookings';
import { SlotCancelDialog } from './SlotCancelDialog';
import { SlotRescheduleDialog } from './SlotRescheduleDialog';

const SLOT: PartnerSlot = {
  id: 'slot-1',
  startsAt: '2099-11-10T11:00:00.000Z',
  endsAt: null,
  capacityTotal: 8,
  capacityReserved: 0,
  capacitySold: 3,
  status: 'open',
};

describe('cancelar e remarcar horário (D14, D16)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('com vagas vendidas: mostra a multa, a força maior e oferece remarcar', () => {
    const onReschedule = vi.fn();
    const onConfirm = vi.fn();
    render(
      <SlotCancelDialog
        slot={SLOT}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        onReschedule={onReschedule}
      />
    );
    expect(screen.getByText(/3 vagas vendidas/)).toBeTruthy();
    expect(screen.getByText(/multa de 20% do valor vendido/)).toBeTruthy();
    expect(screen.getByText(/força maior/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remarcar em vez de cancelar' }));
    expect(onReschedule).toHaveBeenCalledWith(SLOT);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar horário' }));
    expect(onConfirm).toHaveBeenCalledWith(SLOT);
  });

  it('sem vendas: sem multa e sem sugestão de remarcar', () => {
    render(
      <SlotCancelDialog
        slot={{ ...SLOT, capacitySold: 0 }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        onReschedule={vi.fn()}
      />
    );
    expect(screen.queryByText(/multa/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Remarcar em vez de cancelar' })).toBeNull();
  });

  it('remarcar: hora de Fortaleza vira UTC; data passada ou sem motivo é recusada', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<SlotRescheduleDialog slot={SLOT} onClose={vi.fn()} onSubmit={onSubmit} />);
    const when = screen.getByLabelText('Nova data e hora');
    fireEvent.change(when, { target: { value: '2020-01-01T10:00' } });
    fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'Mar agitado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Remarcar horário' }));
    expect(await screen.findByText('Informe uma data futura e o motivo.')).toBeTruthy();
    fireEvent.change(when, { target: { value: '2099-11-12T09:30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Remarcar horário' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(SLOT, {
        startsAt: '2099-11-12T12:30:00.000Z',
        reason: 'Mar agitado',
      })
    );
  });
});

=== src/domain/bookings/components/shared/ListState.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
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
  return <p className="py-6 text-center text-sm text-ink/70">{message}</p>;
}

export function ListError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-danger-soft border border-danger-line"
    >
      <AlertCircle size={16} className="text-danger shrink-0" aria-hidden="true" />
      <p className="flex-1 text-xs text-danger">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="press min-h-11 px-3 rounded-lg bg-surface border border-line hover:bg-accent-soft text-ink text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        <RefreshCw size={13} aria-hidden="true" />
        {t('bookings.partner.retry')}
      </button>
    </div>
  );
}

export const BUTTON_PRIMARY =
  'press min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-sm font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';
export const BUTTON_SECONDARY =
  'press min-h-11 px-3 rounded-xl bg-surface border border-line hover:bg-accent-soft text-ink text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';
export const INPUT =
  'w-full min-h-11 px-3 rounded-xl bg-surface border border-line text-sm text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';

=== src/domain/bookings/hooks/usePartnerSlots.ts — diff ===
@@ -2,6 +2,7 @@ import { useCallback, useEffect, useState } from 'react';
 import { cancelSlotUseCase } from '../application/usecases/cancelSlotUseCase';
 import { createSlotsUseCase } from '../application/usecases/createSlotsUseCase';
 import { listPartnerSlotsUseCase } from '../application/usecases/listPartnerSlotsUseCase';
+import { rescheduleSlotUseCase } from '../application/usecases/rescheduleSlotUseCase';
 import type { CreateSlotsPayload, PartnerSlot } from '../types/bookings';
 import { addDays } from '../utils/dates';
 import { getBookingErrorMessage } from '../utils/bookingErrorMessage';
@@ -48,5 +49,14 @@ export function usePartnerSlots(offerId: string, weekStart: Date) {
     [offerId, reload]
   );
 
-  return { data, loading, error, reload, create, cancel };
+  const reschedule = useCallback(
+    async (slotId: string, change: { startsAt: string; reason: string }) => {
+      const result = await rescheduleSlotUseCase(offerId, slotId, change);
+      await reload();
+      return result;
+    },
+    [offerId, reload]
+  );
+
+  return { data, loading, error, reload, create, cancel, reschedule };
 }

=== src/domain/bookings/index.ts — diff ===
@@ -4,4 +4,5 @@ export { BookingResultView } from './components/buyer/BookingResultView';
 export { MyBookingsView } from './components/buyer/MyBookingsView';
 export type { PaymentElementSlotProps, RenderPaymentElement } from './components/buyer/types';
 export { PartnerOffersManager } from './components/partner/PartnerOffersManager';
+export { isBookableCategory } from './utils/offerKindByCategory';
 export type { BookableGuideItem } from './types/bookings';

=== src/domain/bookings/ports/bookingsApiPort.ts — diff ===
@@ -22,6 +22,11 @@ export interface BookingsApiPort {
   listPartnerSlots(offerId: string, fromIso: string, toIso: string): Promise<PartnerSlot[]>;
   createSlots(offerId: string, payload: CreateSlotsPayload): Promise<PartnerSlot[]>;
   cancelSlot(offerId: string, slotId: string): Promise<{ canceledBookings: number }>;
+  rescheduleSlot(
+    offerId: string,
+    slotId: string,
+    change: { startsAt: string; reason: string }
+  ): Promise<{ rescheduledBookings: number }>;
   listOfferBookings(offerId: string, cursor?: string | null): Promise<Page<BookingSummary>>;
   markNoShow(bookingId: string): Promise<BookingSummary>;

=== src/domain/bookings/utils/offerKindByCategory.ts — ARQUIVO NOVO, conteúdo completo ===
import type { PartnerOffer } from '../types/bookings';

// Fase 1 (decisão D3): passeio vende horários; atração vende entradas.
const KIND_BY_CATEGORY: Record<string, PartnerOffer['kind']> = {
  tour: 'tour',
  sight: 'private_entry',
};

export function offerKindForCategory(category: string): PartnerOffer['kind'] | undefined {
  return KIND_BY_CATEGORY[category];
}

/** Só passeios e atrações vendem reservas na fase 1. */
export function isBookableCategory(category: string): boolean {
  return offerKindForCategory(category) !== undefined;
}

=== src/domain/payment/components/PartnerStripeConnectPortal.tsx — diff ===
@@ -1,5 +1,5 @@
 import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
-import { useCallback, useEffect, useState } from 'react';
+import { type ReactNode, useCallback, useEffect, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { GlassCard } from '../../../ui/components/GlassCard';
 import { getPartnerTermsUseCase } from '../application/usecases/getPartnerTermsUseCase';
@@ -15,7 +15,16 @@ import { PayoutStatement } from './receivables/PayoutStatement';
 import { type ReceivablesTab, ReceivablesTabs } from './receivables/ReceivablesTabs';
 
 /** Recebimentos do parceiro: conta Stripe por CNPJ (D14), extrato por venda e dívidas (D16). */
-export function PartnerStripeConnectPortal() {
+function Frame({ bare, children }: { bare: boolean; children: ReactNode }) {
+  return bare ? (
+    <div className="space-y-4">{children}</div>
+  ) : (
+    <GlassCard className="p-5 space-y-4">{children}</GlassCard>
+  );
+}
+
+/** `bare`: sem cartão nem título, para abrir dentro de uma folha que já tem os dois. */
+export function PartnerStripeConnectPortal({ bare = false }: { bare?: boolean } = {}) {
   const { t } = useTranslation();
   const [accounts, setAccounts] = useState<PartnerPaymentAccount[] | null>(null);
   const [error, setError] = useState<string | null>(null);
@@ -49,26 +58,31 @@ export function PartnerStripeConnectPortal() {
   }, [load]);
 
   const open = accounts?.find((entry) => entry.accountKey === openKey) ?? null;
+  const refreshButton = (
+    <button
+      type="button"
+      onClick={() => {
+        void load();
+        void debtsState.reload();
+      }}
+      aria-label={t('paymentAccounts.refresh')}
+      className="press w-11 h-11 shrink-0 rounded-xl border border-line text-ink flex items-center justify-center hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-teal-400/50"
+    >
+      <RefreshCw size={16} aria-hidden="true" />
+    </button>
+  );
 
   return (
-    <GlassCard className="p-5 space-y-4">
-      <div className="flex items-start justify-between gap-3">
-        <div className="space-y-1">
-          <h4 className="text-sm font-bold text-ink">{t('paymentAccounts.title')}</h4>
-          <p className="text-xs text-ink/70">{t('paymentAccounts.subtitle')}</p>
+    <Frame bare={bare}>
+      {!bare && (
+        <div className="flex items-start justify-between gap-3">
+          <div className="space-y-1">
+            <h4 className="text-sm font-bold text-ink">{t('paymentAccounts.title')}</h4>
+            <p className="text-xs text-ink/70">{t('paymentAccounts.subtitle')}</p>
+          </div>
+          {refreshButton}
         </div>
-        <button
-          type="button"
-          onClick={() => {
-            void load();
-            void debtsState.reload();
-          }}
-          aria-label={t('paymentAccounts.refresh')}
-          className="press w-11 h-11 shrink-0 rounded-xl border border-line text-ink flex items-center justify-center hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-teal-400/50"
-        >
-          <RefreshCw size={16} aria-hidden="true" />
-        </button>
-      </div>
+      )}
 
       {blocked && (
         <p
@@ -80,7 +94,13 @@ export function PartnerStripeConnectPortal() {
         </p>
       )}
 
-      {!open && <ReceivablesTabs value={tab} onChange={setTab} pendingDebts={pendingDebts} />}
+      {!open && (
+        <div className="flex items-start justify-between gap-2">
+          <ReceivablesTabs value={tab} onChange={setTab} pendingDebts={pendingDebts} />
+          {/* Na folha o título é dela: o botão de atualizar sobe para a linha das abas. */}
+          {bare && refreshButton}
+        </div>
+      )}
 
       {terms && !open && tab === 'accounts' && (
         <PartnerTermsCard terms={terms} onAccepted={setTerms} />
@@ -131,6 +151,6 @@ export function PartnerStripeConnectPortal() {
           {t('paymentAccounts.empty')}
         </p>
       )}
-    </GlassCard>
+    </Frame>
   );
 }

=== src/domain/payment/components/PaymentAccountNotice.tsx — ARQUIVO NOVO, conteúdo completo ===
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../ui/components/Dialog';
import { PartnerStripeConnectPortal } from './PartnerStripeConnectPortal';

/**
 * Aviso de uma linha para telas de venda: a configuração financeira abre numa folha, em vez de um
 * cartão de Recebimentos dentro da lista (planos de cor empilhados).
 */
export function PaymentAccountNotice({
  message,
  onClosed,
}: {
  message: string;
  /** Ao fechar a folha, a tela de venda relê o status das contas. */
  onClosed?: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-warn-soft border border-warn-line">
        <AlertTriangle size={16} className="shrink-0 text-warn" aria-hidden="true" />
        <p className="flex-1 min-w-[12rem] text-xs text-warn">{message}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="press min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('receivables.notice.open')}
        </button>
      </div>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) onClosed?.();
        }}
        title={t('paymentAccounts.title')}
        description={t('paymentAccounts.subtitle')}
        className="sm:max-w-2xl"
      >
        <PartnerStripeConnectPortal bare />
      </Dialog>
    </>
  );
}

=== src/domain/payment/index.ts — diff ===
@@ -2,6 +2,7 @@ export { CheckoutModal } from './components/CheckoutModal';
 export { PlanSubscriptionCard } from './components/PlanSubscriptionCard';
 export { StripePaymentElement } from './adapters/ui/StripePaymentElement';
 export { PartnerStripeConnectPortal } from './components/PartnerStripeConnectPortal';
+export { PaymentAccountNotice } from './components/PaymentAccountNotice';
 export { confirmPlanPaymentReturnUseCase } from './application/usecases/confirmPlanPaymentReturnUseCase';
 export { createPlanPaymentIntentUseCase } from './application/usecases/createPlanPaymentIntentUseCase';
 export { listPaymentAccountsUseCase } from './application/usecases/listPaymentAccountsUseCase';

=== src/shared/i18n/bookingsResources.ts — diff ===
@@ -65,6 +65,7 @@ export interface BookingsTranslation {
     actionFailed: string;
     stripeRequired: string;
     publishNeedsStripe: string;
+    stripeRequiredSome: string;
     accountStatusError: string;
     fromPrice: string;
   };
@@ -125,12 +126,30 @@ export interface BookingsTranslation {
     created_other: string;
     createFailed: string;
     cancelSlot: string;
-    confirmCancelSlot: string;
     canceled_one: string;
     canceled_other: string;
     statusClosed: string;
     statusCanceled: string;
     timezoneNotice: string;
+    reschedule: string;
+    rescheduleTitle: string;
+    rescheduleDescription: string;
+    newDateTime: string;
+    rescheduleReason: string;
+    rescheduleReasonHint: string;
+    rescheduleSubmit: string;
+    rescheduled_one: string;
+    rescheduled_other: string;
+    rescheduleInvalid: string;
+    cancelTitle: string;
+    cancelNoSales: string;
+    cancelWithSales_one: string;
+    cancelWithSales_other: string;
+    cancelPenalty: string;
+    cancelForceMajeure: string;
+    rescheduleInstead: string;
+    cancelAnyway: string;
+    back: string;
   };
   weekdays: {
     '0': string;
@@ -245,7 +264,10 @@ export const bookingsPtBR: BookingsTranslation = {
     confirmArchive: 'Arquivar esta oferta? Ela sai do site e não pode ser reaberta.',
     actionFailed: 'Não foi possível concluir a ação.',
     stripeRequired: 'Para vender reservas, conclua a configuração financeira da sua conta.',
-    publishNeedsStripe: 'Conclua a configuração financeira para publicar.',
+    publishNeedsStripe:
+      'Conclua a configuração financeira do CNPJ deste estabelecimento para publicar.',
+    stripeRequiredSome:
+      'Alguns estabelecimentos ainda não podem vender: conclua a configuração financeira do CNPJ de cada um em Recebimentos.',
     accountStatusError: 'Não foi possível verificar sua conta financeira agora.',
     fromPrice: 'a partir de {{amount}}',
   },
@@ -306,13 +328,36 @@ export const bookingsPtBR: BookingsTranslation = {
     created_other: '{{count}} horários criados.',
     createFailed: 'Não foi possível criar os horários.',
     cancelSlot: 'Cancelar horário',
-    confirmCancelSlot:
-      'Cancelar este horário? Todas as reservas pagas serão reembolsadas integralmente.',
     canceled_one: 'Horário cancelado. {{count}} reserva reembolsada.',
     canceled_other: 'Horário cancelado. {{count}} reservas reembolsadas.',
     statusClosed: 'Fechado',
     statusCanceled: 'Cancelado',
     timezoneNotice: 'Horários no fuso de Fortaleza (UTC−3).',
+    reschedule: 'Remarcar',
+    rescheduleTitle: 'Remarcar horário',
+    rescheduleDescription:
+      'As reservas valem na nova data, sem multa para você. Cada comprador é avisado e tem 7 dias para cancelar com reembolso integral.',
+    newDateTime: 'Nova data e hora',
+    rescheduleReason: 'Motivo',
+    rescheduleReasonHint: 'Aparece para os compradores. De 3 a 300 caracteres.',
+    rescheduleSubmit: 'Remarcar horário',
+    rescheduled_one: 'Horário remarcado. {{count}} reserva vale na nova data.',
+    rescheduled_other: 'Horário remarcado. {{count}} reservas valem na nova data.',
+    rescheduleInvalid: 'Informe uma data futura e o motivo.',
+    cancelTitle: 'Cancelar horário',
+    cancelNoSales:
+      'Este horário não tem reservas pagas. Cancelar fecha o horário para novas reservas.',
+    cancelWithSales_one:
+      'Este horário tem {{count}} vaga vendida. A reserva paga será reembolsada por inteiro.',
+    cancelWithSales_other:
+      'Este horário tem {{count}} vagas vendidas. As reservas pagas serão reembolsadas por inteiro.',
+    cancelPenalty:
+      'Seu CNPJ paga multa de 20% do valor vendido, com 24 h para pagar em Recebimentos › Dívidas. Depois disso, a multa é descontada dos repasses e as vendas do CNPJ ficam pausadas.',
+    cancelForceMajeure:
+      'Foi por força maior (ex.: vento ou mar acima do limite)? Declare em Recebimentos › Dívidas antes do vencimento: a multa fica suspensa até a análise.',
+    rescheduleInstead: 'Remarcar em vez de cancelar',
+    cancelAnyway: 'Cancelar horário',
+    back: 'Voltar',
   },
   weekdays: {
     '0': 'Dom',
@@ -425,7 +470,9 @@ export const bookingsEn: BookingsTranslation = {
     confirmArchive: 'Archive this offer? It leaves the site and cannot be reopened.',
     actionFailed: 'The action could not be completed.',
     stripeRequired: 'To sell bookings, finish your account payment setup.',
-    publishNeedsStripe: 'Finish your payment setup to publish.',
+    publishNeedsStripe: 'Finish the payment setup for this place’s CNPJ to publish.',
+    stripeRequiredSome:
+      'Some places can’t sell yet: finish the payment setup for each one’s CNPJ under Payouts.',
     accountStatusError: 'We couldn’t check your payment account right now.',
     fromPrice: 'from {{amount}}',
   },
@@ -486,12 +533,35 @@ export const bookingsEn: BookingsTranslation = {
     created_other: '{{count}} time slots created.',
     createFailed: 'The time slots could not be created.',
     cancelSlot: 'Cancel time slot',
-    confirmCancelSlot: 'Cancel this time slot? Every paid booking will be fully refunded.',
     canceled_one: 'Time slot canceled. {{count}} booking refunded.',
     canceled_other: 'Time slot canceled. {{count}} bookings refunded.',
     statusClosed: 'Closed',
     statusCanceled: 'Canceled',
     timezoneNotice: 'Times in Fortaleza time (UTC−3).',
+    reschedule: 'Reschedule',
+    rescheduleTitle: 'Reschedule time slot',
+    rescheduleDescription:
+      'Bookings stay valid on the new date, with no penalty for you. Each buyer is notified and has 7 days to cancel for a full refund.',
+    newDateTime: 'New date and time',
+    rescheduleReason: 'Reason',
+    rescheduleReasonHint: 'Shown to buyers. 3 to 300 characters.',
+    rescheduleSubmit: 'Reschedule time slot',
+    rescheduled_one: 'Time slot rescheduled. {{count}} booking stays valid on the new date.',
+    rescheduled_other: 'Time slot rescheduled. {{count}} bookings stay valid on the new date.',
+    rescheduleInvalid: 'Enter a future date and the reason.',
+    cancelTitle: 'Cancel time slot',
+    cancelNoSales: 'This time slot has no paid bookings. Canceling closes it to new bookings.',
+    cancelWithSales_one:
+      'This time slot has {{count}} sold spot. The paid booking will be fully refunded.',
+    cancelWithSales_other:
+      'This time slot has {{count}} sold spots. Paid bookings will be fully refunded.',
+    cancelPenalty:
+      'Your CNPJ pays a penalty of 20% of the amount sold, with 24 h to pay under Payouts › Debts. After that, the penalty is deducted from payouts and the CNPJ’s sales are paused.',
+    cancelForceMajeure:
+      'Was it force majeure (e.g. wind or sea above the limit)? Declare it under Payouts › Debts before the due date: the penalty is suspended until the review.',
+    rescheduleInstead: 'Reschedule instead',
+    cancelAnyway: 'Cancel time slot',
+    back: 'Back',
   },
   weekdays: {
     '0': 'Sun',
@@ -608,7 +678,10 @@ export const bookingsFr: BookingsTranslation = {
     actionFailed: 'L’action n’a pas pu aboutir.',
     stripeRequired:
       'Pour vendre des réservations, terminez la configuration financière de votre compte.',
-    publishNeedsStripe: 'Terminez la configuration financière pour publier.',
+    publishNeedsStripe:
+      'Terminez la configuration financière du CNPJ de cet établissement pour publier.',
+    stripeRequiredSome:
+      'Certains établissements ne peuvent pas encore vendre : terminez la configuration financière du CNPJ de chacun dans Versements.',
     accountStatusError: 'Impossible de vérifier votre compte financier pour le moment.',
     fromPrice: 'à partir de {{amount}}',
   },
@@ -669,13 +742,37 @@ export const bookingsFr: BookingsTranslation = {
     created_other: '{{count}} créneaux créés.',
     createFailed: 'Impossible de créer les créneaux.',
     cancelSlot: 'Annuler le créneau',
-    confirmCancelSlot:
-      'Annuler ce créneau ? Toutes les réservations payées seront intégralement remboursées.',
     canceled_one: 'Créneau annulé. {{count}} réservation remboursée.',
     canceled_other: 'Créneau annulé. {{count}} réservations remboursées.',
     statusClosed: 'Fermé',
     statusCanceled: 'Annulé',
     timezoneNotice: 'Horaires à l’heure de Fortaleza (UTC−3).',
+    reschedule: 'Reprogrammer',
+    rescheduleTitle: 'Reprogrammer le créneau',
+    rescheduleDescription:
+      'Les réservations restent valables à la nouvelle date, sans pénalité pour vous. Chaque acheteur est prévenu et a 7 jours pour annuler avec un remboursement intégral.',
+    newDateTime: 'Nouvelle date et heure',
+    rescheduleReason: 'Motif',
+    rescheduleReasonHint: 'Visible par les acheteurs. De 3 à 300 caractères.',
+    rescheduleSubmit: 'Reprogrammer le créneau',
+    rescheduled_one: 'Créneau reprogrammé. {{count}} réservation reste valable à la nouvelle date.',
+    rescheduled_other:
+      'Créneau reprogrammé. {{count}} réservations restent valables à la nouvelle date.',
+    rescheduleInvalid: 'Indiquez une date future et le motif.',
+    cancelTitle: 'Annuler le créneau',
+    cancelNoSales:
+      'Ce créneau n’a aucune réservation payée. L’annuler le ferme aux nouvelles réservations.',
+    cancelWithSales_one:
+      'Ce créneau a {{count}} place vendue. La réservation payée sera remboursée intégralement.',
+    cancelWithSales_other:
+      'Ce créneau a {{count}} places vendues. Les réservations payées seront remboursées intégralement.',
+    cancelPenalty:
+      'Votre CNPJ paie une pénalité de 20 % du montant vendu, avec 24 h pour payer dans Versements › Dettes. Ensuite, la pénalité est déduite des versements et les ventes du CNPJ sont suspendues.',
+    cancelForceMajeure:
+      'C’était un cas de force majeure (ex. : vent ou mer au-dessus de la limite) ? Déclarez-le dans Versements › Dettes avant l’échéance : la pénalité est suspendue jusqu’à l’examen.',
+    rescheduleInstead: 'Reprogrammer plutôt',
+    cancelAnyway: 'Annuler le créneau',
+    back: 'Retour',
   },
   weekdays: {
     '0': 'Dim',

=== src/shared/i18n/receivablesResources.ts — diff ===
@@ -2,6 +2,7 @@
 export interface ReceivablesTranslation {
   tabs: { label: string; accounts: string; statement: string; debts: string };
   blockedBanner: string;
+  notice: { open: string };
   statement: {
     title: string;
     hint: string;
@@ -99,6 +100,7 @@ export const receivablesPtBR: ReceivablesTranslation = {
     statement: 'Extrato',
     debts: 'Dívidas',
   },
+  notice: { open: 'Configurar recebimentos' },
   blockedBanner:
     'Vendas pausadas: um CNPJ seu tem dívida vencida. Pague em Dívidas para voltar a vender; enquanto isso, os repasses pendentes quitam a dívida.',
   statement: {
@@ -193,6 +195,7 @@ export const receivablesPtBR: ReceivablesTranslation = {
 
 export const receivablesEn: ReceivablesTranslation = {
   tabs: { label: 'Payout sections', accounts: 'Accounts', statement: 'Statement', debts: 'Debts' },
+  notice: { open: 'Set up payouts' },
   blockedBanner:
     'Sales paused: one of your CNPJs has an overdue debt. Pay it under Debts to sell again; meanwhile, pending payouts settle the debt.',
   statement: {
@@ -292,6 +295,7 @@ export const receivablesFr: ReceivablesTranslation = {
     statement: 'Relevé',
     debts: 'Dettes',
   },
+  notice: { open: 'Configurer les versements' },
   blockedBanner:
     'Ventes suspendues : l’un de vos CNPJ a une dette échue. Payez-la dans Dettes pour vendre à nouveau ; en attendant, les versements en attente règlent la dette.',
   statement: {

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/app/compositions/PartnerBookingsComposition.test.tsx src/app/compositions/PartnerBookingsComposition.tsx src/domain/bookings/adapters/httpBookingsAdapter.ts src/domain/bookings/application/usecases/rescheduleSlotUseCase.ts src/domain/bookings/components/partner/PartnerOfferRow.test.tsx src/domain/bookings/components/partner/PartnerOfferRow.tsx src/domain/bookings/components/partner/PartnerOffersManager.test.tsx src/domain/bookings/components/partner/PartnerOffersManager.tsx src/domain/bookings/components/partner/PartnerSlotsManager.tsx src/domain/bookings/components/partner/SlotCancelDialog.tsx src/domain/bookings/components/partner/SlotRescheduleDialog.tsx src/domain/bookings/components/partner/slotDialogs.test.tsx src/domain/bookings/components/shared/ListState.tsx src/domain/bookings/hooks/usePartnerSlots.ts src/domain/bookings/index.ts src/domain/bookings/ports/bookingsApiPort.ts src/domain/bookings/utils/offerKindByCategory.ts src/domain/payment/components/PartnerStripeConnectPortal.tsx src/domain/payment/components/PaymentAccountNotice.tsx src/domain/payment/index.ts src/shared/i18n/bookingsResources.ts src/shared/i18n/receivablesResources.ts` (todos verdes). Não precisa rodar a suíte inteira.
- abra Reservas e horários no painel do parceiro, nos temas claro e escuro: aviso por estabelecimento, Remarcar e Cancelar horário.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
