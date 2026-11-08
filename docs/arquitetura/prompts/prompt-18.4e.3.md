# Prompt 18.4e.3 — Adiar e cancelar sessão de evento, e conta por evento (D14, D16)

> Lote 17, gerado do commit de referência `eac047f` da branch `claude/agents-md-v2`. Aplique depois do 18.4e.3.0. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4e.3 — Adiar e cancelar sessão de evento, e conta por evento (D14, D16)

Última parte das telas do parceiro (18.4e). Telas conferidas por prints e aprovadas em 2026-10-26.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Telas nos dois temas, com folha inferior no celular (§11.1, §11.11), e textos nos 3 idiomas (§12). Nenhuma dependência nova.

O QUE MUDA:
1) Domínio events (app): cancelPartnerEventOccurrenceUseCase e postponePartnerEventOccurrenceUseCase, chamando as rotas que já existem (POST /api/partners/events/:id/occurrences/:occurrenceId/cancel e /postpone).
2) Painel de ingressos: SessionActions com Adiar sessão e Cancelar sessão para a sessão escolhida (sessão adiada ou cancelada mostra só o status). OccurrenceCancelDialog: com pedidos pagos, reembolso integral com a taxa de serviço, multa de 20% com 24 h, caminho da força maior em Recebimentos › Dívidas e Adiar em vez de cancelar; motivo obrigatório. OccurrencePostponeDialog: nova data e hora de início (Fortaleza), mantendo a duração, e motivo; explica os 7 dias do comprador.
3) B26 nos ingressos: o aviso de conta financeira usa a conta do CNPJ do establishmentId do evento. Nova composição src/app/compositions/PartnerEventTicketingComposition.tsx monta o aviso (PaymentAccountNotice) e a aba Financeiro (PartnerStripeConnectPortal); o PartnerEventTicketingManager recebe accountNotice e financePanel por props e deixa de importar a tela de Recebimentos do domínio payment (AGENTS.md §5.2). Sai o hook usePartnerMerchantAccount.
4) Textos novos no namespace ticketSessions (src/shared/i18n/ticketSessionsResources.ts).
5) Lotes, barra de abas e container do painel nos tokens de tema.
6) docs/arquitetura/debitos.md: B26 resolvido; B31 atualizado.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- src/app/compositions/PartnerEventTicketingComposition.test.tsx (criar)
- src/app/compositions/PartnerEventTicketingComposition.tsx (criar)
- src/app/compositions/PartnerPortalComposition.test.tsx (alterar)
- src/app/compositions/PartnerPortalComposition.tsx (alterar)
- src/domain/events/adapters/httpEventsAdapter.ts (alterar)
- src/domain/events/application/usecases/cancelPartnerEventOccurrenceUseCase.ts (criar)
- src/domain/events/application/usecases/postponePartnerEventOccurrenceUseCase.ts (criar)
- src/domain/events/index.ts (alterar)
- src/domain/events/ports/eventsPort.ts (alterar)
- src/domain/ticketing/components/PartnerEventTicketingManager.test.tsx (alterar)
- src/domain/ticketing/components/PartnerEventTicketingManager.tsx (alterar)
- src/domain/ticketing/components/manager/LotsTab.tsx (alterar)
- src/domain/ticketing/components/manager/ManagerTabBar.tsx (alterar)
- src/domain/ticketing/components/manager/OccurrenceCancelDialog.tsx (criar)
- src/domain/ticketing/components/manager/OccurrencePostponeDialog.tsx (criar)
- src/domain/ticketing/components/manager/SessionActions.test.tsx (criar)
- src/domain/ticketing/components/manager/SessionActions.tsx (criar)
- src/domain/ticketing/components/manager/sessionButtons.ts (criar)
- src/domain/ticketing/hooks/usePartnerEventSales.ts (alterar)
- src/domain/ticketing/index.ts (alterar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/i18n/ticketSessionsResources.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -18,10 +18,9 @@
 | B20 | `operationalInfoSchema` duplicado em `server/domain/guide/schemas/guideSchema.ts` e `server/domain/partners/schemas/partnerContentSchema.ts` | §5.3 | baixo — as duas cópias precisam mudar juntas | rotas de conteúdo do parceiro passarem a validar com o schema publicado pelo `guide` (Published Language) |
 | B21 | `package-lock.json`: `npm audit --omit=dev` aponta 10 vulnerabilidades (1 crítica, 7 altas) em `firebase`, `@firebase/firestore`, `@grpc/grpc-js`, `gaxios`, `proxy-addr`, `uuid` e outras | §7.4 e §7.10 A06 (sem high/critical para merge) | alto — já existiam antes do Prompt 18.3.0a; a dependência nova (`@google-cloud/kms` 6.2.1) não acrescentou nenhuma | prompt próprio de atualização de dependências, testando cada salto de versão |
 | B25 | `src/index.css`: o tema claro ainda depende de sobrescritas globais com `!important` (`:root.light .text-white`, `.bg-white/5`, `.border-white/10`…) para as telas que usam cores fixas; `biome-ignore-all lint/complexity/noImportantStyles` no topo do arquivo | §11.1 (tokens, nunca `text-white` fixo em superfície que muda) e §13 (sem avisos) | médio — cor nova sem token pode sair ilegível no claro; as sobrescritas valem para o app todo | cada tela tocada passa a usar os tokens `--ug-*` (`text-ink`, `bg-surface`, `border-line`, `text-warn`…); quando nenhuma usar mais as classes fixas, as sobrescritas e o `biome-ignore-all` saem |
-| B26 | Aviso de conta financeira no painel de ingressos (`usePartnerMerchantAccount`): considera pronto quando **algum** CNPJ da conta está pronto para receber, não o CNPJ do evento. Nas reservas, resolvido no 18.4e.2 (aviso e botão de publicar por estabelecimento) | D14 (conta por documento) | baixo — só o aviso na tela; a venda e a publicação conferem a conta do CNPJ certo no backend (`assertListingCanSellUseCase` + `assertPaymentAccountReadyUseCase`) | Prompt 18.4e.3: aviso por evento; `PartnerEventTicketingManager` (1111 linhas) dividido ao tocar |
 | B28 | `bookings/components/partner/OfferTextFields.tsx` (abas pt-BR/en/fr com tradução à mão) e editor de evento do parceiro (texto só em português) | D5 e AGENTS.md §12.6 (editar no idioma ativo, tradução automática) | médio — visitante em inglês ou francês vê o português, e o parceiro digita traduções que a D5 proíbe | 19.1: `LocalizedText`, `MachineTranslationPort` e outbox; o editor mostra o idioma de Configurações e o salvo vira o original |
 | B30 | `server/domain/payment/services/saleClaimService.ts` e `server/interfaces/http/saleClaims/`: o reembolso decidido numa reclamação não muda o status do pedido de ingresso nem da reserva; e a abertura de reclamação não tem rate limit (o app ainda não tem rate limit com armazenamento compartilhado) | §11.8 (o comprador vê o estado real da compra) e §7.4 (rate limit em rotas de pagamento) | baixo — uma reclamação por venda e só do próprio comprador; a carteira mostra "pago" depois do reembolso até a tela do 18.4f mostrar o status da reclamação | 18.4f: a carteira e Minhas reservas mostram o status da reclamação; rate limit junto com o das outras rotas de pagamento |
-| B31 | `src/domain/ticketing/components/manager/*` (abas do painel de ingressos: lotes, vendas, participantes, check-in, reembolsos) e `hooks/useTicketLotForm.ts`, `hooks/useOfflineCheckIn.ts` | §12 (texto fixo em português, sem `useTranslation`) e §11.1 (cores fixas do tema escuro, `text-white`, `bg-black/40`) | médio — no tema claro dependem das sobrescritas globais (B25) e em `en`/`fr` aparecem em português | 19.x: chaves no namespace do ingresso e tokens `--ug-*`, aba por aba; a divisão do 18.4e.3.0 deixou cada aba num arquivo |
+| B31 | `src/domain/ticketing/components/manager/*` (abas do painel de ingressos: vendas, participantes, check-in, reembolsos; lotes e barra de abas já com tokens no 18.4e.3) e `hooks/useTicketLotForm.ts`, `hooks/useOfflineCheckIn.ts` | §12 (texto fixo em português, sem `useTranslation`) e §11.1 (cores fixas do tema escuro, `text-white`, `bg-black/40`) | médio — no tema claro dependem das sobrescritas globais (B25) e em `en`/`fr` aparecem em português | 19.x: chaves no namespace do ingresso e tokens `--ug-*`, aba por aba; a divisão do 18.4e.3.0 deixou cada aba num arquivo |
 
 ## Resolvidos
 
@@ -30,6 +29,7 @@
 | B22 | Prompt 18.4a (D14): cada CNPJ aprovado vende pela própria conta Stripe Express (`paymentAccounts/{accountKey}`, `accountKey` = índice cego do CNPJ); `verificationOwners` e o "documento de vendas da conta" saíram; a conta é criada com o CNPJ da verificação pré-preenchido para o Stripe conferir a empresa |
 | B27 | Prompt 18.4c (D14): a cobrança é feita na plataforma, sem destino (separate charges and transfers); o reembolso sai do saldo da plataforma e o repasse (`payoutEntries`) é recalculado pelo valor que o proprietário fica, com a taxa de serviço fora dele. |
 | B29 | Prompt 18.4d.1 (D16): reembolso depois do repasse vira dívida do CNPJ (`post_release_refund`) pela diferença; contestação perdida sem prova depois do repasse vira dívida (`dispute_lost`). Dívida vencida é descontada dos repasses seguintes e bloqueia novas vendas do CNPJ. |
+| B26 | Prompts 18.4e.2 e 18.4e.3: o aviso de conta financeira e o botão de publicar são por estabelecimento nas reservas e por evento nos ingressos (conta do CNPJ do `establishmentId`); o painel de ingressos deixou de importar a tela de Recebimentos de outro domínio (montada em `PartnerEventTicketingComposition`). |
 | B24 | Prompt 18.3b: excluir o estabelecimento cancela na hora a assinatura dele no Stripe (`planSubscriptions/{itemId}`); excluir a conta cancela todas as assinaturas vivas dela antes de apagar os planos |
 | B23 | Prompt 18.3.0b (D12, P0): a conta do parceiro deixou de ter documento — o cadastro envia só `termsAccepted`; `partners/{uid}.cpfCnpj`, `cpfCnpjClean` e a coleção `partnerDocumentKeys` saíram do código, das regras e dos testes (resolve também o débito do §7.7); o status `pending` da conta saiu (só `active` e `suspended`); CPF/CNPJ existe apenas, cifrado e com índice cego, na verificação de cada estabelecimento (18.3.0a); `PartnersModal` dividido (529 → 257 linhas), com as condições de cada etapa em `utils/signupStepGates.ts` |
 | Erro no modal de detalhe e métricas zeradas — Prompt 18.2.3 | decisão de 2026-10-19 (opção B): `/api/insights/track` aceita visitante sem login (o token só é anexado quando há usuário); cada item grava dois contadores por dia (`viewsSignedIn`, `viewsAnonymous`) em `interactionStats`, sem uid nem IP; repetição em 30 min não soma (guarda `interactionGuards` com chave HMAC de uid/IP e TTL em `expiresAt`); o relatório mostra o total e a divisão em percentual; `/api/insights/stats/:colecao/:id` exige login e checa o dono no backend (antes o cliente chamava sem token e recebia sempre zero); `ReportsView` dividido e traduzido (sai de B16); `trust proxy` com número de proxies de `TRUST_PROXY_HOPS` (§7.4); handler global de erros do `server.ts` deixou de devolver `err.message` (§7.10 A05); `src/shared/lib/insights.ts` (sem uso, `shared → domain`) removido |

=== src/app/compositions/PartnerEventTicketingComposition.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../shared/i18n';

const m = vi.hoisted(() => ({ listing: vi.fn(), accounts: vi.fn() }));
vi.mock('../../domain/events', () => ({ getEventListingByIdUseCase: m.listing }));
vi.mock('../../domain/payment', () => ({
  listPaymentAccountsUseCase: m.accounts,
  PartnerStripeConnectPortal: () => <div>portal</div>,
  PaymentAccountNotice: ({ message }: { message: string }) => <p>{message}</p>,
}));
vi.mock('../../domain/ticketing', () => ({
  PartnerEventTicketingManager: ({ accountNotice }: { accountNotice?: React.ReactNode }) => (
    <div>{accountNotice}</div>
  ),
}));

import { PartnerEventTicketingComposition } from './PartnerEventTicketingComposition';

describe('PartnerEventTicketingComposition (B26: conta do estabelecimento do evento)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
    m.listing.mockResolvedValue({ id: 'ev-1', establishmentId: 'bar-1' });
  });

  it('outro CNPJ pronto não libera o evento', async () => {
    m.accounts.mockResolvedValue([
      { accountKey: 'k1', itemIds: ['pousada-1'], account: { readyForSales: true } },
      { accountKey: 'k2', itemIds: ['bar-1'], account: { readyForSales: false } },
    ]);
    render(<PartnerEventTicketingComposition eventListingId="ev-1" />);
    expect(await screen.findByText(/Venda de ingressos pagos indisponível/)).toBeTruthy();
  });

  it('conta do estabelecimento do evento pronta: sem aviso', async () => {
    m.accounts.mockResolvedValue([
      { accountKey: 'k2', itemIds: ['bar-1'], account: { readyForSales: true } },
    ]);
    render(<PartnerEventTicketingComposition eventListingId="ev-1" />);
    await waitFor(() => expect(m.accounts).toHaveBeenCalled());
    expect(screen.queryByText(/Venda de ingressos pagos indisponível/)).toBeNull();
  });
});

=== src/app/compositions/PartnerEventTicketingComposition.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getEventListingByIdUseCase } from '../../domain/events';
import {
  listPaymentAccountsUseCase,
  PartnerStripeConnectPortal,
  PaymentAccountNotice,
} from '../../domain/payment';
import { PartnerEventTicketingManager } from '../../domain/ticketing';

/**
 * Painel de ingressos do parceiro com a conta financeira certa: o evento vende pela conta do CNPJ do
 * estabelecimento dele (D14), não por qualquer CNPJ pronto (B26).
 */
export function PartnerEventTicketingComposition({ eventListingId }: { eventListingId: string }) {
  const { t } = useTranslation();
  const [ready, setReady] = useState<boolean | null>(null);

  const loadStatus = useCallback(() => {
    let active = true;
    Promise.all([getEventListingByIdUseCase(eventListingId), listPaymentAccountsUseCase()])
      .then(([listing, accounts]) => {
        const establishmentId = listing?.establishmentId;
        const isReady = accounts.some(
          (entry) =>
            entry.account?.readyForSales === true &&
            !!establishmentId &&
            entry.itemIds.includes(establishmentId)
        );
        if (active) setReady(isReady);
      })
      .catch(() => {
        // Falha de rede não significa conta incompleta: não mostra o aviso por engano.
        if (active) setReady(null);
      });
    return () => {
      active = false;
    };
  }, [eventListingId]);

  useEffect(() => loadStatus(), [loadStatus]);

  return (
    <PartnerEventTicketingManager
      eventListingId={eventListingId}
      accountNotice={
        ready === false ? (
          <PaymentAccountNotice message={t('ticketSessions.accountNotice')} onClosed={loadStatus} />
        ) : null
      }
      financePanel={<PartnerStripeConnectPortal />}
    />
  );
}

=== src/app/compositions/PartnerPortalComposition.test.tsx — diff ===
@@ -27,7 +27,9 @@ vi.mock('../../domain/payment', () => ({
   PlanSubscriptionCard: () => null,
 }));
 vi.mock('../../domain/notifications', () => ({ NotificationBell: () => null }));
-vi.mock('../../domain/ticketing', () => ({ PartnerEventTicketingManager: () => null }));
+vi.mock('./PartnerEventTicketingComposition', () => ({
+  PartnerEventTicketingComposition: () => null,
+}));
 vi.mock('./PartnerBookingsComposition', () => ({ PartnerBookingsComposition: () => null }));
 
 function renderPortal() {

=== src/app/compositions/PartnerPortalComposition.tsx — diff ===
@@ -15,8 +15,8 @@ import {
   PlanSubscriptionCard,
 } from '../../domain/payment';
 import { PartnerBookingsComposition } from './PartnerBookingsComposition';
+import { PartnerEventTicketingComposition } from './PartnerEventTicketingComposition';
 import { NotificationBell } from '../../domain/notifications';
-import { PartnerEventTicketingManager } from '../../domain/ticketing';
 import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
 import { useUI } from '../../shared/stores/useUIStore';
 import { MessagePage } from '../../ui/components/MessagePage';
@@ -190,7 +190,7 @@ export function PartnerPortalComposition() {
       )}
       renderBookableOffersManager={(items) => <PartnerBookingsComposition items={items} />}
       renderEventTicketingManager={(eventListingId) => (
-        <PartnerEventTicketingManager eventListingId={eventListingId} />
+        <PartnerEventTicketingComposition eventListingId={eventListingId} />
       )}
       renderEventSessionsField={(props) => <EventSessionsField {...props} />}
     />

=== src/domain/events/adapters/httpEventsAdapter.ts — diff ===
@@ -136,6 +136,40 @@ export class HttpEventsAdapter implements EventsPort {
     return result.data;
   }
 
+  async cancelPartnerEventOccurrence(
+    eventListingId: string,
+    occurrenceId: string,
+    reason: string
+  ): Promise<void> {
+    const response = await firebaseApiFetch(
+      `/api/partners/events/${encodeURIComponent(eventListingId)}/occurrences/${encodeURIComponent(occurrenceId)}/cancel`,
+      {
+        method: 'POST',
+        headers: { 'Content-Type': 'application/json' },
+        body: JSON.stringify({ reason }),
+      },
+      { requireAuth: true, requireAppCheck: true }
+    );
+    await parseJsonOrThrow(response, 'Erro ao cancelar a sessão.');
+  }
+
+  async postponePartnerEventOccurrence(
+    eventListingId: string,
+    occurrenceId: string,
+    replacement: { startsAt: string; endsAt: string; reason: string }
+  ): Promise<void> {
+    const response = await firebaseApiFetch(
+      `/api/partners/events/${encodeURIComponent(eventListingId)}/occurrences/${encodeURIComponent(occurrenceId)}/postpone`,
+      {
+        method: 'POST',
+        headers: { 'Content-Type': 'application/json' },
+        body: JSON.stringify(replacement),
+      },
+      { requireAuth: true, requireAppCheck: true }
+    );
+    await parseJsonOrThrow(response, 'Erro ao adiar a sessão.');
+  }
+
   async deletePartnerEventOccurrence(eventListingId: string, occurrenceId: string): Promise<void> {
     const response = await firebaseApiFetch(
       `/api/partners/events/${encodeURIComponent(eventListingId)}/occurrences/${encodeURIComponent(occurrenceId)}`,

=== src/domain/events/application/usecases/cancelPartnerEventOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';

/** O backend reembolsa por inteiro os pedidos pagos e cobra a multa de 20% do CNPJ (D14). */
export async function cancelPartnerEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string,
  reason: string
): Promise<void> {
  return eventsAdapter.cancelPartnerEventOccurrence(eventListingId, occurrenceId, reason);
}

=== src/domain/events/application/usecases/postponePartnerEventOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';

/** Os ingressos valem na nova data; o comprador tem 7 dias para pedir reembolso integral (D16). */
export async function postponePartnerEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string,
  replacement: { startsAt: string; endsAt: string; reason: string }
): Promise<void> {
  return eventsAdapter.postponePartnerEventOccurrence(eventListingId, occurrenceId, replacement);
}

=== src/domain/events/index.ts — diff ===
@@ -1,4 +1,6 @@
 export { archiveAdminEventListingUseCase } from './application/usecases/archiveAdminEventListingUseCase';
+export { cancelPartnerEventOccurrenceUseCase } from './application/usecases/cancelPartnerEventOccurrenceUseCase';
+export { postponePartnerEventOccurrenceUseCase } from './application/usecases/postponePartnerEventOccurrenceUseCase';
 export { cancelAdminEventListingUseCase } from './application/usecases/cancelAdminEventListingUseCase';
 export { createAdminEventListingUseCase } from './application/usecases/createAdminEventListingUseCase';
 export { createAdminEventOccurrenceUseCase } from './application/usecases/createAdminEventOccurrenceUseCase';

=== src/domain/events/ports/eventsPort.ts — diff ===
@@ -25,6 +25,16 @@ export interface EventsPort {
     input: Partial<CreateEventOccurrenceInput>
   ): Promise<EventOccurrence>;
   deletePartnerEventOccurrence(eventListingId: string, occurrenceId: string): Promise<void>;
+  cancelPartnerEventOccurrence(
+    eventListingId: string,
+    occurrenceId: string,
+    reason: string
+  ): Promise<void>;
+  postponePartnerEventOccurrence(
+    eventListingId: string,
+    occurrenceId: string,
+    replacement: { startsAt: string; endsAt: string; reason: string }
+  ): Promise<void>;
 
   createAdminEventListing(
     input: CreateEventListingInput

=== src/domain/ticketing/components/PartnerEventTicketingManager.test.tsx — diff ===
@@ -9,7 +9,6 @@ vi.mock('../../events', () => ({
     loading: false,
   }),
 }));
-vi.mock('../../payment', () => ({ PartnerStripeConnectPortal: () => <div>portal</div> }));
 vi.mock('../hooks/useTicketTypes', () => ({
   useManagementTicketTypes: () => ({ ticketTypes: [], loading: false, reload: vi.fn() }),
 }));
@@ -23,7 +22,6 @@ vi.mock('../hooks/usePartnerEventSales', () => ({
     reload: vi.fn(),
     performCheckIn: vi.fn(),
   }),
-  usePartnerMerchantAccount: () => ({ status: { readyForSales: true } }),
 }));
 vi.mock('../utils/offlineCheckInStorage', () => ({
   getOfflineManifestBundle: vi.fn().mockResolvedValue(null),
@@ -37,7 +35,7 @@ import { PartnerEventTicketingManager } from './PartnerEventTicketingManager';
 
 describe('PartnerEventTicketingManager (divisão em abas, sem mudar comportamento)', () => {
   it('cada aba mostra o próprio conteúdo', async () => {
-    render(<PartnerEventTicketingManager eventListingId="ev-1" />);
+    render(<PartnerEventTicketingManager eventListingId="ev-1" financePanel={<div>portal</div>} />);
     expect(await screen.findByText('Novo Lote / Tipo de Ingresso')).toBeTruthy();
     fireEvent.click(screen.getByRole('button', { name: /Vendas/ }));
     expect(screen.getByText('Ingressos Pagos')).toBeTruthy();
@@ -55,7 +53,7 @@ describe('PartnerEventTicketingManager (divisão em abas, sem mudar comportament
     expect(screen.getByText('portal')).toBeTruthy();
   });
 
-  it('admin não vê a aba Financeiro', () => {
+  it('sem painel financeiro (admin), sem a aba Financeiro', () => {
     render(<PartnerEventTicketingManager eventListingId="ev-1" asAdmin />);
     expect(screen.queryByRole('button', { name: /Financeiro/ })).toBeNull();
   });

=== src/domain/ticketing/components/PartnerEventTicketingManager.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { type EventOccurrence, useEventOccurrences } from '../../events';
import { useOfflineCheckIn } from '../hooks/useOfflineCheckIn';
import { usePartnerEventSales } from '../hooks/usePartnerEventSales';
import { useTicketLotForm } from '../hooks/useTicketLotForm';
import { useManagementTicketTypes } from '../hooks/useTicketTypes';
import { AttendeesTab } from './manager/AttendeesTab';
import { CheckInTab } from './manager/CheckInTab';
import { LotsTab } from './manager/LotsTab';
import { ManagerTabBar } from './manager/ManagerTabBar';
import type { ManagerFeedback } from './manager/managerFeedback';
import type { ManagerTab } from './manager/managerTabs';
import { RefundsTab } from './manager/RefundsTab';
import { SalesTab } from './manager/SalesTab';
import { SessionActions } from './manager/SessionActions';

interface PartnerEventTicketingManagerProps {
  eventListingId: string;
  asAdmin?: boolean;
  /** Montado pela composição com a conta do CNPJ do estabelecimento do evento (D14). */
  accountNotice?: ReactNode;
  /** Recebimentos, montado pela composição; sem ele a aba Financeiro não aparece. */
  financePanel?: ReactNode;
}

export function PartnerEventTicketingManager({
  eventListingId,
  asAdmin = false,
  accountNotice,
  financePanel,
}: PartnerEventTicketingManagerProps) {
  const {
    occurrences,
    loading: occLoading,
    reload: reloadOccurrences,
  } = useEventOccurrences(eventListingId);
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ManagerTab>('lots');

  useEffect(() => {
    if (!selectedOccurrenceId && occurrences.length > 0 && occurrences[0]) {
      setSelectedOccurrenceId(occurrences[0].id);
    }
  }, [occurrences, selectedOccurrenceId]);

  const {
    ticketTypes,
    loading: lotsLoading,
    reload: reloadLots,
  } = useManagementTicketTypes(selectedOccurrenceId || undefined);

  const {
    analytics,
    orders,
    checkIns,
    refunds,
    loading: salesLoading,
    reload: reloadSales,
    performCheckIn,
  } = usePartnerEventSales(eventListingId, selectedOccurrenceId || undefined, asAdmin);

  const [feedback, setFeedback] = useState<ManagerFeedback | null>(null);

  const lotForm = useTicketLotForm({ selectedOccurrenceId, reloadLots, setFeedback });
  const checkIn = useOfflineCheckIn({
    eventListingId,
    selectedOccurrenceId,
    performCheckIn,
    reloadSales,
    setFeedback,
  });

  const selectedOccurrence = occurrences.find((occ) => occ.id === selectedOccurrenceId);
  const paidOrders = orders.filter(
    (order) =>
      order.occurrenceId === selectedOccurrenceId &&
      (order.status === 'paid' || order.status === 'partially_refunded')
  ).length;

  return (
    <div className="space-y-4">
      {accountNotice}

      {occurrences.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {occurrences.map((occ: EventOccurrence) => (
            <button
              key={occ.id}
              type="button"
              onClick={() => setSelectedOccurrenceId(occ.id)}
              className={`min-h-11 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedOccurrenceId === occ.id
                  ? 'bg-teal-400 text-slate-950'
                  : 'bg-surface border border-line text-ink/80 hover:bg-accent-soft'
              }`}
            >
              {new Date(occ.startsAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Fortaleza',
              })}{' '}
              • Cap: {occ.capacity}
            </button>
          ))}
        </div>
      )}

      <SessionActions
        eventListingId={eventListingId}
        occurrence={selectedOccurrence}
        paidOrders={paidOrders}
        onChanged={(message) => {
          setFeedback({ type: 'success', message });
          void reloadOccurrences();
          void reloadSales();
        }}
      />

      <ManagerTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showFinance={financePanel !== undefined}
        counts={{
          lots: ticketTypes.length,
          attendees: orders.length,
          checkIns: checkIns.length,
          refunds: refunds.length,
        }}
      />

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-success-soft border-success-line text-success'
              : 'bg-danger-soft border-danger-line text-danger'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={15} className="shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle size={15} className="shrink-0" aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {occLoading || lotsLoading || salesLoading ? (
        <div className="p-6 flex items-center justify-center gap-2 text-xs text-ink/70">
          <Loader2 size={16} className="animate-spin text-teal-400" />
          <span>Carregando dados operacionais...</span>
        </div>
      ) : activeTab === 'lots' ? (
        <LotsTab
          form={lotForm}
          ticketTypes={ticketTypes}
          selectedOccurrenceId={selectedOccurrenceId}
        />
      ) : activeTab === 'sales' ? (
        <SalesTab analytics={analytics} />
      ) : activeTab === 'attendees' ? (
        <AttendeesTab orders={orders} />
      ) : activeTab === 'checkin' ? (
        <CheckInTab
          checkIn={checkIn}
          checkIns={checkIns}
          selectedOccurrenceId={selectedOccurrenceId}
        />
      ) : activeTab === 'refunds' ? (
        <RefundsTab refunds={refunds} />
      ) : (
        financePanel
      )}
    </div>
  );
}

=== src/domain/ticketing/components/manager/LotsTab.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { Plus, Trash2 } from 'lucide-react';
import type { TicketLotForm } from '../../hooks/useTicketLotForm';
import { formatMoneyMinorBrl, type TicketType } from '../../types/ticketing';

export function LotsTab({
  form,
  ticketTypes,
  selectedOccurrenceId,
}: {
  form: TicketLotForm;
  ticketTypes: TicketType[];
  selectedOccurrenceId: string;
}) {
  const {
    newName,
    setNewName,
    newDescription,
    setNewDescription,
    newKind,
    setNewKind,
    newPriceReais,
    setNewPriceReais,
    newQuantity,
    setNewQuantity,
    newMinPerOrder,
    setNewMinPerOrder,
    newMaxPerOrder,
    setNewMaxPerOrder,
    newSalesStartsAt,
    setNewSalesStartsAt,
    newSalesEndsAt,
    setNewSalesEndsAt,
    newVisibility,
    setNewVisibility,
    newRequiresEligibility,
    setNewRequiresEligibility,
    newSortOrder,
    setNewSortOrder,
    creatingLot,
    handleCreateLot,
    handleDeleteLot,
    handleToggleLotPause,
  } = form;

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleCreateLot}
        className="p-4 rounded-2xl bg-surface border border-line space-y-3"
      >
        <div className="text-xs font-bold text-ink/80 uppercase tracking-wider">
          Novo Lote / Tipo de Ingresso
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome (ex: 1º Lote, VIP)"
            className="min-h-11 px-3 rounded-xl bg-surface border border-line text-xs text-ink placeholder:text-ink/60"
          />
          <select
            value={newKind}
            onChange={(e) => setNewKind(e.target.value as 'paid' | 'free')}
            className="min-h-11 px-3 rounded-xl bg-surface border border-line text-xs text-ink"
          >
            <option value="paid">Ingresso Pago</option>
            <option value="free">Inscrição Gratuita</option>
          </select>
          <input
            type="number"
            step="0.01"
            disabled={newKind === 'free'}
            value={newKind === 'free' ? '0' : newPriceReais}
            onChange={(e) => setNewPriceReais(e.target.value)}
            placeholder="Preço (R$)"
            className="min-h-11 px-3 rounded-xl bg-surface border border-line text-xs text-ink placeholder:text-ink/60 disabled:opacity-40"
          />
          <input
            type="number"
            min={1}
            required
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            placeholder="Quantidade total"
            className="min-h-11 px-3 rounded-xl bg-surface border border-line text-xs text-ink placeholder:text-ink/60"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Descrição do lote (opcional)"
            className="min-h-11 px-3 rounded-xl bg-surface border border-line text-xs text-ink placeholder:text-ink/60"
          />
          <select
            value={newVisibility}
            onChange={(e) => setNewVisibility(e.target.value as 'public' | 'hidden' | 'restricted')}
            className="min-h-11 px-3 rounded-xl bg-surface border border-line text-xs text-ink"
          >
            <option value="public">Visibilidade: Público</option>
            <option value="hidden">Visibilidade: Oculto</option>
            <option value="restricted">Visibilidade: Restrito</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              value={newMinPerOrder}
              onChange={(e) => setNewMinPerOrder(e.target.value)}
              placeholder="Mín/pedido"
              title="Mínimo por pedido"
              className="min-h-11 px-3 rounded-xl bg-surface border border-line text-xs text-ink placeholder:text-ink/60"
            />
            <input
              type="number"
              min={1}
              value={newMaxPerOrder}
              onChange={(e) => setNewMaxPerOrder(e.target.value)}
              placeholder="Máx/pedido"
              title="Máximo por pedido"
              className="min-h-11 px-3 rounded-xl bg-surface border border-line text-xs text-ink placeholder:text-ink/60"
            />
          </div>
          <input
            type="number"
            value={newSortOrder}
            onChange={(e) => setNewSortOrder(e.target.value)}
            placeholder="Ordem (0)"
            title="Ordem de exibição"
            className="min-h-11 px-3 rounded-xl bg-surface border border-line text-xs text-ink placeholder:text-ink/60"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
          <div>
            <label className="text-[11px] text-ink/70 block mb-1">Início das vendas</label>
            <input
              type="datetime-local"
              value={newSalesStartsAt}
              onChange={(e) => setNewSalesStartsAt(e.target.value)}
              className="w-full min-h-11 px-3 rounded-xl bg-surface border border-line text-xs text-ink"
            />
          </div>
          <div>
            <label className="text-[11px] text-ink/70 block mb-1">Fim das vendas</label>
            <input
              type="datetime-local"
              value={newSalesEndsAt}
              onChange={(e) => setNewSalesEndsAt(e.target.value)}
              className="w-full min-h-11 px-3 rounded-xl bg-surface border border-line text-xs text-ink"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-ink/80 pt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={newRequiresEligibility}
              onChange={(e) => setNewRequiresEligibility(e.target.checked)}
              className="w-4 h-4 accent-teal-400"
            />
            <span>Exige comprovante de meia-entrada/elegibilidade</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={creatingLot || !selectedOccurrenceId}
          className="press min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={15} />
          <span>Adicionar Lote</span>
        </button>
      </form>

      <div className="space-y-2">
        {ticketTypes.map((tt) => (
          <div
            key={tt.id}
            className="p-3.5 rounded-2xl bg-surface border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-ink">{tt.name}</span>
                <span className="text-xs font-black text-accent">
                  {formatMoneyMinorBrl(tt.priceMinor)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface border border-line text-[10px] font-bold text-ink/80 uppercase">
                  {tt.status}
                </span>
              </div>
              <div className="text-xs text-ink/70">
                Vendidos: {tt.soldCount} / {tt.quantity} • Reservados: {tt.reservedCount} • Mín{' '}
                {tt.minPerOrder} / Máx {tt.maxPerOrder}
              </div>
              {(tt.salesStartsAt || tt.salesEndsAt) && (
                <div className="text-[11px] text-ink/70">
                  Janela:{' '}
                  {tt.salesStartsAt
                    ? new Date(tt.salesStartsAt).toLocaleString('pt-BR', {
                        timeZone: 'America/Fortaleza',
                      })
                    : 'Imediato'}{' '}
                  até{' '}
                  {tt.salesEndsAt
                    ? new Date(tt.salesEndsAt).toLocaleString('pt-BR', {
                        timeZone: 'America/Fortaleza',
                      })
                    : 'Início da sessão'}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleToggleLotPause(tt.id, tt.status)}
                className="press min-h-11 px-3 rounded-xl bg-surface border border-line hover:bg-accent-soft text-xs font-bold text-ink cursor-pointer"
              >
                {tt.status === 'paused' ? 'Reativar' : 'Pausar'}
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteLot(tt.id)}
                aria-label={`Remover lote ${tt.name}`}
                className="press w-11 h-11 rounded-xl bg-danger-soft border border-danger-line text-danger flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

=== src/domain/ticketing/components/manager/ManagerTabBar.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { BarChart3, QrCode, RefreshCw, Ticket as TicketIcon, Users, Wallet } from 'lucide-react';
import type { ManagerTab } from './managerTabs';

export function ManagerTabBar({
  activeTab,
  setActiveTab,
  showFinance,
  counts,
}: {
  activeTab: ManagerTab;
  setActiveTab: (tab: ManagerTab) => void;
  showFinance: boolean;
  counts: { lots: number; attendees: number; checkIns: number; refunds: number };
}) {
  return (
    <div className="flex items-center gap-2 border-b border-line pb-2 overflow-x-auto">
      <button
        type="button"
        onClick={() => setActiveTab('lots')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'lots' ? 'bg-accent-soft text-accent' : 'text-ink/70 hover:text-ink'
        }`}
      >
        <TicketIcon size={14} />
        <span>Ingressos ({counts.lots})</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('sales')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'sales' ? 'bg-accent-soft text-accent' : 'text-ink/70 hover:text-ink'
        }`}
      >
        <BarChart3 size={14} />
        <span>Vendas</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('attendees')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'attendees' ? 'bg-accent-soft text-accent' : 'text-ink/70 hover:text-ink'
        }`}
      >
        <Users size={14} />
        <span>Participantes ({counts.attendees})</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('checkin')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'checkin' ? 'bg-accent-soft text-accent' : 'text-ink/70 hover:text-ink'
        }`}
      >
        <QrCode size={14} />
        <span>Check-in ({counts.checkIns})</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('refunds')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'refunds' ? 'bg-accent-soft text-accent' : 'text-ink/70 hover:text-ink'
        }`}
      >
        <RefreshCw size={14} />
        <span>Reembolsos ({counts.refunds})</span>
      </button>
      {showFinance && (
        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'finance' ? 'bg-accent-soft text-accent' : 'text-ink/70 hover:text-ink'
          }`}
        >
          <Wallet size={14} />
          <span>Financeiro</span>
        </button>
      )}
    </div>
  );
}

=== src/domain/ticketing/components/manager/OccurrenceCancelDialog.tsx — ARQUIVO NOVO, conteúdo completo ===
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { cancelPartnerEventOccurrenceUseCase, type EventOccurrence } from '../../../events';
import { BUTTON_DANGER, BUTTON_PRIMARY, BUTTON_SECONDARY, FIELD } from './sessionButtons';

const MIN_REASON = 3;
const MAX_REASON = 300;

/**
 * Cancelar com pedidos pagos gera multa de 20% para o CNPJ (D14); a tela mostra a multa e oferece
 * adiar primeiro, que não tem multa (D16, 4A).
 */
export function OccurrenceCancelDialog({
  eventListingId,
  occurrence,
  paidOrders,
  onClose,
  onDone,
  onPostponeInstead,
}: {
  eventListingId: string;
  occurrence: EventOccurrence | null;
  paidOrders: number;
  onClose: () => void;
  onDone: (message: string) => void;
  onPostponeInstead: (occurrence: EventOccurrence) => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (!occurrence) return;
    if (reason.trim().length < MIN_REASON)
      return setError(t('ticketSessions.cancelDialog.invalid'));
    setSending(true);
    setError(null);
    try {
      await cancelPartnerEventOccurrenceUseCase(eventListingId, occurrence.id, reason.trim());
      onDone(t('ticketSessions.cancelDialog.done'));
    } catch {
      setError(t('ticketSessions.failed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={occurrence !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('ticketSessions.cancelDialog.title')}
    >
      {occurrence && (
        <div className="space-y-4">
          {paidOrders > 0 ? (
            <>
              <p className="text-sm text-ink">
                {t('ticketSessions.cancelDialog.withSales', { count: paidOrders })}
              </p>
              <p className="flex items-start gap-2 p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                {t('ticketSessions.cancelDialog.penalty')}
              </p>
              <p className="text-xs text-ink/70">{t('ticketSessions.cancelDialog.forceMajeure')}</p>
            </>
          ) : (
            <p className="text-sm text-ink">{t('ticketSessions.cancelDialog.noSales')}</p>
          )}
          <div className="space-y-1.5">
            <label htmlFor={`${id}-reason`} className="text-xs font-bold text-ink">
              {t('ticketSessions.cancelDialog.reason')}
            </label>
            <textarea
              id={`${id}-reason`}
              value={reason}
              maxLength={MAX_REASON}
              rows={2}
              onChange={(event) => setReason(event.target.value)}
              aria-describedby={`${id}-reason-hint`}
              className={`${FIELD} py-2`}
            />
            <p id={`${id}-reason-hint`} className="text-[11px] text-ink/70">
              {t('ticketSessions.cancelDialog.reasonHint')}
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
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button type="button" onClick={onClose} className={BUTTON_SECONDARY}>
              {t('ticketSessions.cancelDialog.back')}
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => void confirm()}
              className={`${BUTTON_DANGER} flex items-center justify-center gap-2`}
            >
              {sending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              {t('ticketSessions.cancelDialog.confirm')}
            </button>
            {paidOrders > 0 && (
              <button
                type="button"
                onClick={() => onPostponeInstead(occurrence)}
                className={BUTTON_PRIMARY}
              >
                {t('ticketSessions.cancelDialog.postponeInstead')}
              </button>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}

=== src/domain/ticketing/components/manager/OccurrencePostponeDialog.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { businessDateTimeToIso } from '../../../../shared/utils/businessDateTime';
import { Dialog } from '../../../../ui/components/Dialog';
import { type EventOccurrence, postponePartnerEventOccurrenceUseCase } from '../../../events';
import { BUTTON_PRIMARY, FIELD } from './sessionButtons';

const MIN_REASON = 3;
const MAX_REASON = 300;

/** Adiar mantém a duração da sessão; o backend move os pedidos e o repasse para a nova data (D16). */
export function OccurrencePostponeDialog({
  eventListingId,
  occurrence,
  paidOrders,
  onClose,
  onDone,
}: {
  eventListingId: string;
  occurrence: EventOccurrence | null;
  paidOrders: number;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [when, setWhen] = useState('');
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!occurrence) return;
    const startsAt = businessDateTimeToIso(when);
    if (
      !startsAt ||
      new Date(startsAt).getTime() <= Date.now() ||
      reason.trim().length < MIN_REASON
    ) {
      return setError(t('ticketSessions.postponeDialog.invalid'));
    }
    const duration =
      new Date(occurrence.endsAt).getTime() - new Date(occurrence.startsAt).getTime();
    const endsAt = new Date(new Date(startsAt).getTime() + Math.max(0, duration)).toISOString();
    setSending(true);
    setError(null);
    try {
      await postponePartnerEventOccurrenceUseCase(eventListingId, occurrence.id, {
        startsAt,
        endsAt,
        reason: reason.trim(),
      });
      onDone(t('ticketSessions.postponeDialog.done', { count: paidOrders }));
    } catch {
      setError(t('ticketSessions.failed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={occurrence !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('ticketSessions.postponeDialog.title')}
      description={t('ticketSessions.postponeDialog.description')}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-when`} className="text-xs font-bold text-ink">
            {t('ticketSessions.postponeDialog.newStart')}
          </label>
          <input
            id={`${id}-when`}
            type="datetime-local"
            value={when}
            onChange={(event) => setWhen(event.target.value)}
            aria-describedby={`${id}-duration`}
            className={FIELD}
          />
          <p id={`${id}-duration`} className="text-[11px] text-ink/70">
            {t('ticketSessions.postponeDialog.durationKept')}
          </p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-reason`} className="text-xs font-bold text-ink">
            {t('ticketSessions.postponeDialog.reason')}
          </label>
          <textarea
            id={`${id}-reason`}
            value={reason}
            maxLength={MAX_REASON}
            rows={3}
            onChange={(event) => setReason(event.target.value)}
            aria-describedby={`${id}-reason-hint`}
            className={`${FIELD} py-2`}
          />
          <p id={`${id}-reason-hint`} className="text-[11px] text-ink/70">
            {t('ticketSessions.postponeDialog.reasonHint')}
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
          {t('ticketSessions.postponeDialog.submit')}
        </button>
      </form>
    </Dialog>
  );
}

=== src/domain/ticketing/components/manager/SessionActions.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ cancel: vi.fn(), postpone: vi.fn() }));
vi.mock('../../../events', () => ({
  cancelPartnerEventOccurrenceUseCase: m.cancel,
  postponePartnerEventOccurrenceUseCase: m.postpone,
}));

import { SessionActions } from './SessionActions';

const OCCURRENCE = {
  id: 'occ-1',
  eventListingId: 'ev-1',
  startsAt: '2099-12-20T22:00:00.000Z',
  endsAt: '2099-12-21T03:00:00.000Z',
  status: 'scheduled' as const,
  capacity: 100,
  createdAt: '',
  updatedAt: '',
};

describe('SessionActions (D14, D16)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('cancelar com pedidos pagos: multa, força maior, motivo obrigatório e adiar primeiro', async () => {
    const onChanged = vi.fn();
    m.cancel.mockResolvedValue(undefined);
    render(
      <SessionActions
        eventListingId="ev-1"
        occurrence={OCCURRENCE}
        paidOrders={4}
        onChanged={onChanged}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar sessão' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/4 pedidos pagos/)).toBeTruthy();
    expect(within(dialog).getByText(/multa de 20% do valor vendido/)).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Adiar em vez de cancelar' })).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar sessão' }));
    expect(await within(dialog).findByText('Informe o motivo do cancelamento.')).toBeTruthy();
    expect(m.cancel).not.toHaveBeenCalled();
    fireEvent.change(within(dialog).getByLabelText('Motivo do cancelamento'), {
      target: { value: 'Interdição da praia' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar sessão' }));
    await waitFor(() =>
      expect(m.cancel).toHaveBeenCalledWith('ev-1', 'occ-1', 'Interdição da praia')
    );
    expect(onChanged).toHaveBeenCalledWith('Sessão cancelada. Os reembolsos foram iniciados.');
  });

  it('adiar mantém a duração e converte a hora de Fortaleza', async () => {
    m.postpone.mockResolvedValue(undefined);
    render(
      <SessionActions
        eventListingId="ev-1"
        occurrence={OCCURRENCE}
        paidOrders={1}
        onChanged={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Adiar sessão' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Nova data e hora de início'), {
      target: { value: '2099-12-27T19:00' },
    });
    fireEvent.change(within(dialog).getByLabelText('Motivo'), { target: { value: 'Chuva forte' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Adiar sessão' }));
    await waitFor(() =>
      expect(m.postpone).toHaveBeenCalledWith('ev-1', 'occ-1', {
        startsAt: '2099-12-27T22:00:00.000Z',
        endsAt: '2099-12-28T03:00:00.000Z',
        reason: 'Chuva forte',
      })
    );
  });

  it('sessão adiada não mostra as ações, só o status', () => {
    render(
      <SessionActions
        eventListingId="ev-1"
        occurrence={{ ...OCCURRENCE, status: 'postponed' }}
        paidOrders={0}
        onChanged={vi.fn()}
      />
    );
    expect(screen.getByText('Sessão adiada')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Cancelar sessão' })).toBeNull();
  });
});

=== src/domain/ticketing/components/manager/SessionActions.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { EventOccurrence } from '../../../events';
import { OccurrenceCancelDialog } from './OccurrenceCancelDialog';
import { OccurrencePostponeDialog } from './OccurrencePostponeDialog';
import { BUTTON_SECONDARY } from './sessionButtons';

/** Adiar ou cancelar a sessão escolhida; sessão já adiada ou cancelada só mostra o status. */
export function SessionActions({
  eventListingId,
  occurrence,
  paidOrders,
  onChanged,
}: {
  eventListingId: string;
  occurrence: EventOccurrence | undefined;
  paidOrders: number;
  onChanged: (message: string) => void;
}) {
  const { t } = useTranslation();
  const [postponing, setPostponing] = useState<EventOccurrence | null>(null);
  const [canceling, setCanceling] = useState<EventOccurrence | null>(null);
  if (!occurrence) return null;

  const done = (message: string) => {
    setPostponing(null);
    setCanceling(null);
    onChanged(message);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {occurrence.status === 'scheduled' ? (
        <>
          <button
            type="button"
            onClick={() => setPostponing(occurrence)}
            className={BUTTON_SECONDARY}
          >
            {t('ticketSessions.postpone')}
          </button>
          <button
            type="button"
            onClick={() => setCanceling(occurrence)}
            className={BUTTON_SECONDARY}
          >
            {t('ticketSessions.cancel')}
          </button>
        </>
      ) : occurrence.status === 'postponed' || occurrence.status === 'canceled' ? (
        <span className="px-2.5 py-1 rounded-full border border-line bg-surface text-[11px] font-bold text-ink/80">
          {t(
            occurrence.status === 'postponed'
              ? 'ticketSessions.statusPostponed'
              : 'ticketSessions.statusCanceled'
          )}
        </span>
      ) : null}
      {/* As chaves recriam os formulários vazios para cada sessão. */}
      <OccurrencePostponeDialog
        key={`postpone-${postponing?.id ?? 'none'}`}
        eventListingId={eventListingId}
        occurrence={postponing}
        paidOrders={paidOrders}
        onClose={() => setPostponing(null)}
        onDone={done}
      />
      <OccurrenceCancelDialog
        key={`cancel-${canceling?.id ?? 'none'}`}
        eventListingId={eventListingId}
        occurrence={canceling}
        paidOrders={paidOrders}
        onClose={() => setCanceling(null)}
        onDone={done}
        onPostponeInstead={(selected) => {
          setCanceling(null);
          setPostponing(selected);
        }}
      />
    </div>
  );
}

=== src/domain/ticketing/components/manager/sessionButtons.ts — ARQUIVO NOVO, conteúdo completo ===
export const BUTTON_PRIMARY =
  'press min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50';
export const BUTTON_SECONDARY =
  'press min-h-11 px-4 rounded-xl bg-surface border border-line hover:bg-accent-soft text-ink text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400/50';
export const BUTTON_DANGER =
  'press min-h-11 px-4 rounded-xl bg-danger-soft border border-danger-line text-danger text-xs font-bold disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50';
export const FIELD =
  'w-full min-h-11 px-3 rounded-xl bg-surface border border-line text-sm text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50';

=== src/domain/ticketing/hooks/usePartnerEventSales.ts — diff ===
@@ -4,7 +4,6 @@ import { getEventSalesAnalyticsUseCase } from '../application/usecases/getEventS
 import { listEventCheckInsUseCase } from '../application/usecases/listEventCheckInsUseCase';
 import { listEventOrdersUseCase } from '../application/usecases/listEventOrdersUseCase';
 import { listEventRefundsUseCase } from '../application/usecases/listEventRefundsUseCase';
-import { listPaymentAccountsUseCase } from '../../payment';
 import type { EventCheckIn, EventSalesAnalytics, Refund, TicketOrder } from '../types/ticketing';
 
 export function usePartnerEventSales(
@@ -82,36 +81,3 @@ export function usePartnerEventSales(
     performCheckIn,
   };
 }
-
-/**
- * Aviso de conta financeira do painel de ingressos. Por enquanto basta um CNPJ da conta pronto para
- * receber; a venda confere a conta do estabelecimento do evento no backend (D14, débito B26).
- */
-export function usePartnerMerchantAccount(enabled = true) {
-  const [status, setStatus] = useState<{ readyForSales: boolean } | null>(null);
-  const [loading, setLoading] = useState(false);
-  const [error, setError] = useState<string | null>(null);
-
-  const reload = useCallback(async () => {
-    if (!enabled) return;
-    setLoading(true);
-    setError(null);
-    try {
-      const accounts = await listPaymentAccountsUseCase();
-      setStatus({ readyForSales: accounts.some((entry) => entry.account?.readyForSales) });
-    } catch (err) {
-      console.error('[usePartnerMerchantAccount]', err);
-      setError(
-        err instanceof Error ? err.message : 'Não foi possível carregar a conta financeira.'
-      );
-    } finally {
-      setLoading(false);
-    }
-  }, [enabled]);
-
-  useEffect(() => {
-    void reload();
-  }, [reload]);
-
-  return { status, loading, error, reload };
-}

=== src/domain/ticketing/index.ts — diff ===
@@ -31,10 +31,7 @@ export { useCheckoutCountdown } from './hooks/useCheckoutCountdown';
 
 export { useUserTicketsAndOrders } from './hooks/useUserTickets';
 
-export {
-  usePartnerEventSales,
-  usePartnerMerchantAccount,
-} from './hooks/usePartnerEventSales';
+export { usePartnerEventSales } from './hooks/usePartnerEventSales';
 
 export { CheckoutResultView } from './components/CheckoutResultView';
 export { UserTicketsHistoryView } from './components/UserTicketsHistoryView';

=== src/shared/i18n/resources.ts — diff ===
@@ -28,6 +28,12 @@ import {
   receivablesFr,
   receivablesPtBR,
 } from './receivablesResources';
+import {
+  type TicketSessionsTranslation,
+  ticketSessionsEn,
+  ticketSessionsFr,
+  ticketSessionsPtBR,
+} from './ticketSessionsResources';
 import {
   type PartnersTranslation,
   partnersEn,
@@ -67,6 +73,7 @@ export interface TranslationResource {
   partners: PartnersTranslation;
   paymentAccounts: PaymentAccountsTranslation;
   receivables: ReceivablesTranslation;
+  ticketSessions: TicketSessionsTranslation;
   salesPolicy: SalesPolicyTranslation;
   ticketCheckout: TicketCheckoutTranslation;
   ticketWallet: TicketWalletTranslation;
@@ -294,6 +301,7 @@ const ptBR: TranslationResource = {
   partners: partnersPtBR,
   paymentAccounts: paymentAccountsPtBR,
   receivables: receivablesPtBR,
+  ticketSessions: ticketSessionsPtBR,
   salesPolicy: salesPolicyPtBR,
   ticketCheckout: ticketCheckoutPtBR,
   ticketWallet: ticketWalletPtBR,
@@ -572,6 +580,7 @@ const en: TranslationResource = {
   partners: partnersEn,
   paymentAccounts: paymentAccountsEn,
   receivables: receivablesEn,
+  ticketSessions: ticketSessionsEn,
   salesPolicy: salesPolicyEn,
   ticketCheckout: ticketCheckoutEn,
   ticketWallet: ticketWalletEn,
@@ -844,6 +853,7 @@ const fr: TranslationResource = {
   partners: partnersFr,
   paymentAccounts: paymentAccountsFr,
   receivables: receivablesFr,
+  ticketSessions: ticketSessionsFr,
   salesPolicy: salesPolicyFr,
   ticketCheckout: ticketCheckoutFr,
   ticketWallet: ticketWalletFr,

=== src/shared/i18n/ticketSessionsResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos das ações de sessão do evento no painel do parceiro (D14, D16). pt-BR é a fonte. */
export interface TicketSessionsTranslation {
  postpone: string;
  cancel: string;
  statusPostponed: string;
  statusCanceled: string;
  accountNotice: string;
  postponeDialog: {
    title: string;
    description: string;
    newStart: string;
    durationKept: string;
    reason: string;
    reasonHint: string;
    submit: string;
    invalid: string;
    done_one: string;
    done_other: string;
  };
  cancelDialog: {
    title: string;
    noSales: string;
    withSales_one: string;
    withSales_other: string;
    penalty: string;
    forceMajeure: string;
    reason: string;
    reasonHint: string;
    postponeInstead: string;
    confirm: string;
    back: string;
    invalid: string;
    done: string;
  };
  failed: string;
}

export const ticketSessionsPtBR: TicketSessionsTranslation = {
  postpone: 'Adiar sessão',
  cancel: 'Cancelar sessão',
  statusPostponed: 'Sessão adiada',
  statusCanceled: 'Sessão cancelada',
  accountNotice:
    'Venda de ingressos pagos indisponível: conclua a configuração financeira do CNPJ do estabelecimento deste evento. Inscrições gratuitas funcionam normalmente.',
  postponeDialog: {
    title: 'Adiar sessão',
    description:
      'Os ingressos valem na nova data, sem multa para você. Cada comprador é avisado e tem 7 dias para pedir reembolso integral, com a taxa de serviço.',
    newStart: 'Nova data e hora de início',
    durationKept: 'A duração da sessão continua a mesma. Horário de Fortaleza (UTC−3).',
    reason: 'Motivo',
    reasonHint: 'Aparece no aviso aos compradores. De 3 a 300 caracteres.',
    submit: 'Adiar sessão',
    invalid: 'Informe uma data futura e o motivo.',
    done_one: 'Sessão adiada. {{count}} pedido vale na nova data.',
    done_other: 'Sessão adiada. {{count}} pedidos valem na nova data.',
  },
  cancelDialog: {
    title: 'Cancelar sessão',
    noSales: 'Esta sessão não tem ingressos pagos. Cancelar encerra as vendas dela.',
    withSales_one:
      'Esta sessão tem {{count}} pedido pago. Ele será reembolsado por inteiro, com a taxa de serviço.',
    withSales_other:
      'Esta sessão tem {{count}} pedidos pagos. Todos serão reembolsados por inteiro, com a taxa de serviço.',
    penalty:
      'Seu CNPJ paga multa de 20% do valor vendido, com 24 h para pagar em Recebimentos › Dívidas. Depois disso, a multa é descontada dos repasses e as vendas do CNPJ ficam pausadas.',
    forceMajeure:
      'Foi por força maior (ex.: vento ou interdição pelas autoridades)? Declare em Recebimentos › Dívidas antes do vencimento: a multa fica suspensa até a análise.',
    reason: 'Motivo do cancelamento',
    reasonHint: 'Aparece no aviso aos compradores. De 3 a 300 caracteres.',
    postponeInstead: 'Adiar em vez de cancelar',
    confirm: 'Cancelar sessão',
    back: 'Voltar',
    invalid: 'Informe o motivo do cancelamento.',
    done: 'Sessão cancelada. Os reembolsos foram iniciados.',
  },
  failed: 'Não foi possível concluir agora. Tente de novo.',
};

export const ticketSessionsEn: TicketSessionsTranslation = {
  postpone: 'Postpone session',
  cancel: 'Cancel session',
  statusPostponed: 'Session postponed',
  statusCanceled: 'Session canceled',
  accountNotice:
    'Paid ticket sales unavailable: finish the payment setup for the CNPJ of this event’s place. Free registrations work normally.',
  postponeDialog: {
    title: 'Postpone session',
    description:
      'Tickets stay valid on the new date, with no penalty for you. Each buyer is notified and has 7 days to ask for a full refund, service fee included.',
    newStart: 'New start date and time',
    durationKept: 'The session keeps the same duration. Fortaleza time (UTC−3).',
    reason: 'Reason',
    reasonHint: 'Shown in the notice to buyers. 3 to 300 characters.',
    submit: 'Postpone session',
    invalid: 'Enter a future date and the reason.',
    done_one: 'Session postponed. {{count}} order stays valid on the new date.',
    done_other: 'Session postponed. {{count}} orders stay valid on the new date.',
  },
  cancelDialog: {
    title: 'Cancel session',
    noSales: 'This session has no paid tickets. Canceling ends its sales.',
    withSales_one:
      'This session has {{count}} paid order. It will be fully refunded, service fee included.',
    withSales_other:
      'This session has {{count}} paid orders. All of them will be fully refunded, service fee included.',
    penalty:
      'Your CNPJ pays a penalty of 20% of the amount sold, with 24 h to pay under Payouts › Debts. After that, the penalty is deducted from payouts and the CNPJ’s sales are paused.',
    forceMajeure:
      'Was it force majeure (e.g. wind or closure by the authorities)? Declare it under Payouts › Debts before the due date: the penalty is suspended until the review.',
    reason: 'Cancellation reason',
    reasonHint: 'Shown in the notice to buyers. 3 to 300 characters.',
    postponeInstead: 'Postpone instead',
    confirm: 'Cancel session',
    back: 'Back',
    invalid: 'Enter the cancellation reason.',
    done: 'Session canceled. Refunds have started.',
  },
  failed: 'Could not complete this now. Please try again.',
};

export const ticketSessionsFr: TicketSessionsTranslation = {
  postpone: 'Reporter la séance',
  cancel: 'Annuler la séance',
  statusPostponed: 'Séance reportée',
  statusCanceled: 'Séance annulée',
  accountNotice:
    'Vente de billets payants indisponible : terminez la configuration financière du CNPJ de l’établissement de cet événement. Les inscriptions gratuites fonctionnent normalement.',
  postponeDialog: {
    title: 'Reporter la séance',
    description:
      'Les billets restent valables à la nouvelle date, sans pénalité pour vous. Chaque acheteur est prévenu et a 7 jours pour demander un remboursement intégral, frais de service compris.',
    newStart: 'Nouvelle date et heure de début',
    durationKept: 'La séance garde la même durée. Heure de Fortaleza (UTC−3).',
    reason: 'Motif',
    reasonHint: 'Visible dans l’avis aux acheteurs. De 3 à 300 caractères.',
    submit: 'Reporter la séance',
    invalid: 'Indiquez une date future et le motif.',
    done_one: 'Séance reportée. {{count}} commande reste valable à la nouvelle date.',
    done_other: 'Séance reportée. {{count}} commandes restent valables à la nouvelle date.',
  },
  cancelDialog: {
    title: 'Annuler la séance',
    noSales: 'Cette séance n’a aucun billet payé. L’annuler met fin à ses ventes.',
    withSales_one:
      'Cette séance a {{count}} commande payée. Elle sera remboursée intégralement, frais de service compris.',
    withSales_other:
      'Cette séance a {{count}} commandes payées. Toutes seront remboursées intégralement, frais de service compris.',
    penalty:
      'Votre CNPJ paie une pénalité de 20 % du montant vendu, avec 24 h pour payer dans Versements › Dettes. Ensuite, la pénalité est déduite des versements et les ventes du CNPJ sont suspendues.',
    forceMajeure:
      'C’était un cas de force majeure (ex. : vent ou fermeture par les autorités) ? Déclarez-le dans Versements › Dettes avant l’échéance : la pénalité est suspendue jusqu’à l’examen.',
    reason: 'Motif de l’annulation',
    reasonHint: 'Visible dans l’avis aux acheteurs. De 3 à 300 caractères.',
    postponeInstead: 'Reporter plutôt',
    confirm: 'Annuler la séance',
    back: 'Retour',
    invalid: 'Indiquez le motif de l’annulation.',
    done: 'Séance annulée. Les remboursements ont commencé.',
  },
  failed: 'Impossible de terminer maintenant. Réessayez.',
};

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/app/compositions/PartnerEventTicketingComposition.test.tsx src/app/compositions/PartnerEventTicketingComposition.tsx src/app/compositions/PartnerPortalComposition.test.tsx src/app/compositions/PartnerPortalComposition.tsx src/domain/events/adapters/httpEventsAdapter.ts src/domain/events/application/usecases/cancelPartnerEventOccurrenceUseCase.ts src/domain/events/application/usecases/postponePartnerEventOccurrenceUseCase.ts src/domain/events/index.ts src/domain/events/ports/eventsPort.ts src/domain/ticketing/components/PartnerEventTicketingManager.test.tsx src/domain/ticketing/components/PartnerEventTicketingManager.tsx src/domain/ticketing/components/manager/LotsTab.tsx src/domain/ticketing/components/manager/ManagerTabBar.tsx src/domain/ticketing/components/manager/OccurrenceCancelDialog.tsx src/domain/ticketing/components/manager/OccurrencePostponeDialog.tsx src/domain/ticketing/components/manager/SessionActions.test.tsx src/domain/ticketing/components/manager/SessionActions.tsx src/domain/ticketing/components/manager/sessionButtons.ts src/domain/ticketing/hooks/usePartnerEventSales.ts src/domain/ticketing/index.ts src/shared/i18n/resources.ts src/shared/i18n/ticketSessionsResources.ts` (todos verdes). Não precisa rodar a suíte inteira.
- abra o painel de ingressos de um evento nos temas claro e escuro: aviso por evento, Adiar sessão e Cancelar sessão.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
