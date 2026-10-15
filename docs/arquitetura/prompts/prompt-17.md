# Prompt 17 — Correções urgentes dos painéis do parceiro e do admin

> Lote 9, gerado do commit de referência `d8125a7` da branch `claude/agents-md-v2`. Aplique depois do Prompt 16.1, na ordem 16.1 → 17 → 17.1 → 17.2. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 17 — Correções urgentes dos painéis do parceiro e do admin

Auditoria dos painéis (2026-10-12) e decisões D8: plano pago não abria o checkout, visualizações sempre 0, portal sem rolagem, sessões de evento duplicadas no admin, "Suspender" gravava pendente, selo do admin sobrescrevia o plano pago.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

O QUE MUDA:
1) Parceiro: plano pago abre o checkout; sucesso visível e perfil recarregado ao fechar; visualizações contam o tipo 'view'; relatório de evento consulta 'events'; erro do relatório com nova tentativa; portal volta a rolar; status da conta com rótulo correto; parceiro suspenso vê aviso.
2) Admin: editor de evento carrega as sessões reais (salvar não duplica; remover apaga no servidor); categoria do evento selecionável; datas no fuso de Fortaleza.
3) Selo pelo admin (D8): o cliente envia só { partnerId, isVerified }; o servidor decide e preserva o plano pago; novo tipo de verificação 'admin'.
4) Suspender grava 'suspended' e o parceiro suspenso perde o papel de parceiro no servidor.
5) Excluir parceiro com confirmação; mensagens de sucesso; filtro da aba Guia não vaza para a Agenda; Avisos limpa a seleção ao trocar o destinatário e confirma envio para todos.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- docs/arquitetura/decisoes.md (alterar)
- server/application/usecases/applyPartnerVerification.ts (criar)
- server/application/usecases/getAdminPartnersUseCase.test.ts (alterar)
- server/application/usecases/getAdminPartnersUseCase.ts (alterar)
- server/application/usecases/resolveGuideUserContextApplicationUseCase.test.ts (criar)
- server/application/usecases/resolveGuideUserContextApplicationUseCase.ts (alterar)
- server/application/usecases/setPartnerVerificationByAdminApplicationUseCase.test.ts (criar)
- server/application/usecases/setPartnerVerificationByAdminApplicationUseCase.ts (criar)
- server/application/usecases/verifyPartnerApplicationUseCase.ts (alterar)
- server/domain/events/adapters/firestoreEventAdapter.ts (alterar)
- server/domain/events/ports/eventsPort.ts (alterar)
- server/domain/events/services/eventsService.ts (alterar)
- server/domain/events/usecases/updateEventsOwnerVerificationUseCase.ts (alterar)
- server/domain/guide/types/guideTypes.ts (alterar)
- server/domain/insights/adapters/firebaseAdminInsightsAdapter.ts (alterar)
- server/domain/partners/controllers/partnerController.ts (alterar)
- server/domain/partners/dtos/VerifyPartnerDTO.ts (alterar)
- server/domain/partners/index.ts (alterar)
- server/domain/partners/mappers/partnerMapper.ts (alterar)
- server/domain/partners/schemas/partnerSchema.test.ts (alterar)
- server/domain/partners/schemas/partnerSchema.ts (alterar)
- server/domain/partners/types/partnerTypes.ts (alterar)
- server/domain/partners/utils/adminVerification.test.ts (criar)
- server/domain/partners/utils/adminVerification.ts (criar)
- src/app/AppRouter.tsx (alterar)
- src/app/compositions/PartnerPortalComposition.test.tsx (alterar)
- src/app/compositions/PartnerPortalComposition.tsx (alterar)
- src/domain/admin/components/AdminPanel.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminEditorEventFields.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminEditorModal.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminNotificationsView.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminPartnersView.tsx (alterar)
- src/domain/admin/hooks/useAdminPartnerActions.ts (criar)
- src/domain/admin/types/admin.ts (alterar)
- src/domain/events/constants/eventCategories.ts (criar)
- src/domain/events/index.ts (alterar)
- src/domain/guide/adapters/firebaseGuideCatalogAdapter.ts (alterar)
- src/domain/guide/types/guide.ts (alterar)
- src/domain/insights/components/ReportsView.tsx (alterar)
- src/domain/partners/adapters/apiPartnerAdapter.ts (alterar)
- src/domain/partners/application/usecases/updatePartnerVerificationUseCase.test.ts (alterar)
- src/domain/partners/application/usecases/updatePartnerVerificationUseCase.ts (alterar)
- src/domain/partners/components/PartnerEventForm.tsx (alterar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/components/subcomponents/PartnerHeader.tsx (alterar)
- src/domain/partners/components/subcomponents/PlansModal.tsx (alterar)
- src/domain/partners/ports/partnerPort.ts (alterar)
- src/domain/partners/schemas/partnerSchema.test.ts (alterar)
- src/domain/partners/schemas/partnerSchema.ts (alterar)
- src/domain/partners/types/partner.ts (alterar)
- src/domain/partners/types/partnerContent.ts (alterar)
- src/domain/partners/utils/dateTime.test.ts (apagar)
- src/domain/partners/utils/dateTime.ts (apagar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/utils/businessDateTime.test.ts (criar)
- src/shared/utils/businessDateTime.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -13,11 +13,14 @@
 | B13 | `application/usecases/bookings/*` (horário cancelado, reembolso que falhou) | §8.7 (avisar o comprador) e §7.10 A09 (alerta ao admin) | médio — o comprador só descobre o cancelamento em "Minhas reservas" e a falha de reembolso fica só no log | `notifications` aceitar destinatário usuário e admin (hoje só `recipientPartnerId`) |
 | B14 | UX — itens da auditoria de 2026-10-12 que pedem decisão de produto | §11 (UX) e §15 item 4 | baixo a médio | (a) preferências de notificação do parceiro estão em "Sobre o app" (`content/components/AboutView.tsx`), deveriam ir para Configurações; (b) "Ver todos" da Explore abre a listagem sem a busca e os filtros aplicados (`GridView` não tem filtros); (c) modais de hospedagem e restaurante não têm botão de mapa (`mapLink`); (d) "Programa de Parceiros" aberto pelo menu não volta ao menu ao fechar |
 | B16 | textos fixos em pt-BR ainda em `user/components/AccountView.tsx`, `ticketing/components/UserTicketsHistoryView.tsx` e `CheckoutResultView.tsx`, `partners/components/PartnersModal.tsx`, `insights/components/ReportsView.tsx`, `guide/components/ExploreView.tsx` | §12.3 | médio para en/fr | traduzir tela a tela; o Prompt 16 traduziu menu, configurações, favoritos e portal do parceiro |
+| B17 | Painel do parceiro — itens da auditoria de 2026-10-12 ainda abertos | §11.8, §11.10, §12.4, §11.7 | médio | passeio não salva (aguarda decisão sobre a categoria passeio); seção de reservas aparece para hospedagem/restaurante; três critérios de "pronto para receber" (Prompt 17.2); parceiro não gerencia datas/capacidade do evento (editor único, Prompts 18–19); ingressos ocultos em evento novo sem aviso; relatórios bloqueados só na UI; quem já assina vê a compra de novo; erros de catálogo/notificações aparecem como lista vazia; excluir lote e "não compareceu" sem confirmação; clique fora do editor descarta edições; preço de plano com `'R$ ' +` (Prompt 17.1); datas exibidas sem fuso no gerenciador de ingressos; botões só com ícone sem nome; `PartnerItemForms.tsx` sem uso |
+| B18 | Painel admin — itens da auditoria de 2026-10-12 ainda abertos | §6.2, §6.4, §8, §11.7, §11.8 | médio | preço de planos em reais (Prompt 17.1); preço de item gravado como texto; catálogo e planos lidos direto do Firestore (deveria ser API, com limite); relatórios em branco antes de carregar e média 0.0 sem avaliações; card de eventos conta rascunhos; duas entradas (`/admin` e `?admin=1`); visitante sem login redirecionado sem aviso; tabs sem `role="tablist"` |
 
 ## Resolvidos
 
 | ID | Resolução |
 |---|---|
+| Painéis parceiro/admin — Prompt 17 | plano pago abre o checkout; visualizações e relatório de evento corretos; portal rola; sessões de evento não duplicam e são removidas no servidor; "Suspender" grava `suspended` e bloqueia; selo do admin sem mexer no plano; excluir parceiro com confirmação; filtro e categoria de evento; avisos com seleção limpa; datas dos formulários de evento no fuso de Fortaleza |
 | B15 | Removido import de `database/factory` em `FavoritesList` (Prompt 16): o item usa os dados de `FavoriteItem` e navega para o detalhe via `useSideMenu` |
 | Menu lateral em `src/ui/layouts` importando domínios (§3.4.3) | Prompt 16: virou composição em `src/app/menu/SideMenu.tsx`; `SidebarLayout` continua em `src/ui` sem conhecer domínios |
 | B6 | Script `backfillPartnerDocumentKeys` removido (prompt 4.1): migração de transição desnecessária antes do lançamento |

=== docs/arquitetura/decisoes.md — diff ===
@@ -76,3 +76,12 @@
 * **Decisão:** o HTML das rotas de conteúdo passa pelo Cloud Run (`serverSeoService`) com cache na CDN do Hosting (`Cache-Control: public, max-age=0, s-maxage=300`). Arquivos estáticos continuam servidos direto pelo Hosting. `min-instances=1` no Cloud Run.
 * `sitemap.xml` gerado dinamicamente pelo backend a partir do catálogo publicado.
 * **Prompt:** 8.
+
+## D8 — Painel admin: selo, suspensão e planos (2026-10-12)
+
+* **Selo pelo admin:** o admin só concede ou retira o selo; o servidor decide tipo e validade. Com plano pago ou trial em vigor, o plano nunca é alterado: retirar o selo marca `isVerificationSuspended`, conceder desfaz a suspensão. Sem plano, o admin concede o selo `verificationType: 'admin'` por um ano. Renovação de plano mantém uma suspensão feita pelo admin.
+* **Suspender:** grava `status: 'suspended'` e bloqueia o parceiro: perde o papel de parceiro no servidor (itens e eventos) e o portal mostra "conta suspensa". "Reativar" volta para `active`; "Aprovar" leva `pending` → `active`.
+* **Preço dos planos em centavos inteiros** (sem migração; dados de teste recriados).
+* **Oferta de reserva só é publicada com o Stripe do parceiro pronto** (bloqueio no servidor e botão desabilitado com explicação).
+* **Editor único** de item e evento para parceiro e admin (Prompts 18–19).
+* **Prompt:** 17, 17.1, 17.2, 18, 19.

=== server/application/usecases/applyPartnerVerification.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  type PartnerProfileDocument,
  type PartnerVerificationData,
  updatePartnerVerificationProfileUseCase,
} from '../../domain/partners';
import { updateOwnerVerificationUseCase } from '../../domain/guide';
import { updateEventsOwnerVerificationUseCase } from '../../domain/events';

/** Grava o selo no parceiro e replica nos itens e eventos dele; desfaz no parceiro se a réplica falhar. */
export async function applyPartnerVerification(
  partnerId: string,
  verification: PartnerVerificationData,
  previous: PartnerProfileDocument
): Promise<void> {
  await updatePartnerVerificationProfileUseCase(partnerId, verification);

  try {
    await updateOwnerVerificationUseCase(partnerId, verification);
    await updateEventsOwnerVerificationUseCase(partnerId, verification);
  } catch (error) {
    try {
      await updatePartnerVerificationProfileUseCase(partnerId, {
        isVerified: previous.isVerified,
        verifiedUntil: previous.verifiedUntil,
        verificationType: previous.verificationType,
        isVerificationSuspended: previous.isVerificationSuspended,
      });
    } catch (rollbackError) {
      console.error('[applyPartnerVerification] Falha no rollback do Partner:', rollbackError);
    }

    throw error;
  }
}

=== server/application/usecases/getAdminPartnersUseCase.test.ts — diff ===
@@ -101,6 +101,7 @@ describe('getAdminPartnersUseCase (anti-N+1)', () => {
         'email',
         'firstName',
         'id',
+        'isVerificationSuspended',
         'isVerified',
         'lastName',
         'status',

=== server/application/usecases/getAdminPartnersUseCase.ts — diff ===
@@ -13,6 +13,7 @@ export interface AdminPartnerSummaryDTO {
   isVerified: boolean;
   verifiedUntil: string | null;
   verificationType: PartnerProfileDTO['verificationType'];
+  isVerificationSuspended: boolean;
 }
 
 export async function getAdminPartnersUseCase(): Promise<AdminPartnerSummaryDTO[]> {
@@ -36,6 +37,7 @@ export async function getAdminPartnersUseCase(): Promise<AdminPartnerSummaryDTO[
       isVerified: partner.isVerified,
       verifiedUntil: partner.verifiedUntil,
       verificationType: partner.verificationType,
+      isVerificationSuspended: partner.isVerificationSuspended,
     };
   });
 }

=== server/application/usecases/resolveGuideUserContextApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/users', () => ({ getUserAuthorizationSnapshotUseCase: vi.fn() }));
vi.mock('../../domain/partners', () => ({ getPartnerProfileUseCase: vi.fn() }));

import { getPartnerProfileUseCase } from '../../domain/partners';
import { getUserAuthorizationSnapshotUseCase } from '../../domain/users';
import { resolveGuideUserContextApplicationUseCase } from './resolveGuideUserContextApplicationUseCase';

describe('resolveGuideUserContextApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('admin não consulta o perfil', async () => {
    const ctx = await resolveGuideUserContextApplicationUseCase({ uid: 'a', admin: true });
    expect(ctx.role).toBe('admin');
    expect(getUserAuthorizationSnapshotUseCase).not.toHaveBeenCalled();
  });

  it('parceiro ativo mantém o papel de parceiro', async () => {
    vi.mocked(getUserAuthorizationSnapshotUseCase).mockResolvedValue({ role: 'partner' });
    vi.mocked(getPartnerProfileUseCase).mockResolvedValue({ status: 'active' } as never);
    const ctx = await resolveGuideUserContextApplicationUseCase({ uid: 'p1' });
    expect(ctx.role).toBe('partner');
  });

  it('parceiro suspenso vira usuário comum e perde o acesso de parceiro', async () => {
    vi.mocked(getUserAuthorizationSnapshotUseCase).mockResolvedValue({ role: 'partner' });
    vi.mocked(getPartnerProfileUseCase).mockResolvedValue({ status: 'suspended' } as never);
    const ctx = await resolveGuideUserContextApplicationUseCase({ uid: 'p1' });
    expect(ctx.role).toBe('user');
  });

  it('usuário comum não consulta o cadastro de parceiro', async () => {
    vi.mocked(getUserAuthorizationSnapshotUseCase).mockResolvedValue({ role: 'user' });
    const ctx = await resolveGuideUserContextApplicationUseCase({ uid: 'u1' });
    expect(ctx.role).toBe('user');
    expect(getPartnerProfileUseCase).not.toHaveBeenCalled();
  });
});

=== server/application/usecases/resolveGuideUserContextApplicationUseCase.ts — diff ===
@@ -1,4 +1,5 @@
 import { AuthenticatedUserContext } from '../security/authenticatedUserContext';
+import { getPartnerProfileUseCase } from '../../domain/partners';
 import { getUserAuthorizationSnapshotUseCase } from '../../domain/users';
 
 export async function resolveGuideUserContextApplicationUseCase(user: {
@@ -16,10 +17,20 @@ export async function resolveGuideUserContextApplicationUseCase(user: {
   }
 
   const snapshot = await getUserAuthorizationSnapshotUseCase(user.uid);
+  let role = snapshot.role;
+
+  // Parceiro suspenso pelo admin perde os poderes de parceiro (itens, eventos) até ser reativado.
+  if (role === 'partner') {
+    const partner = await getPartnerProfileUseCase(user.uid);
+    if (partner?.status === 'suspended') {
+      role = 'user';
+    }
+  }
+
   return {
     uid: user.uid,
     email: user.email,
     admin: false,
-    role: snapshot.role,
+    role,
   };
 }

=== server/application/usecases/setPartnerVerificationByAdminApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/partners', async () => {
  const actual = await vi.importActual<
    typeof import('../../domain/partners/utils/adminVerification')
  >('../../domain/partners/utils/adminVerification');
  return {
    getPartnerProfileUseCase: vi.fn(),
    resolveAdminVerification: actual.resolveAdminVerification,
    PartnerDomainError: class PartnerDomainError extends Error {},
  };
});
vi.mock('./applyPartnerVerification', () => ({ applyPartnerVerification: vi.fn() }));

import { getPartnerProfileUseCase } from '../../domain/partners';
import { applyPartnerVerification } from './applyPartnerVerification';
import { setPartnerVerificationByAdminApplicationUseCase } from './setPartnerVerificationByAdminApplicationUseCase';

describe('setPartnerVerificationByAdminApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('com plano anual em vigor, retirar o selo mantém tipo e validade do plano', async () => {
    const previous = {
      id: 'p1',
      isVerified: true,
      verifiedUntil: '2027-06-01T00:00:00.000Z',
      verificationType: 'annual',
      isVerificationSuspended: false,
    };
    vi.mocked(getPartnerProfileUseCase).mockResolvedValue(previous as never);

    await setPartnerVerificationByAdminApplicationUseCase(
      'p1',
      false,
      new Date('2026-10-12T00:00:00.000Z')
    );

    expect(applyPartnerVerification).toHaveBeenCalledWith(
      'p1',
      {
        isVerified: true,
        verifiedUntil: '2027-06-01T00:00:00.000Z',
        verificationType: 'annual',
        isVerificationSuspended: true,
      },
      previous
    );
  });

  it('parceiro inexistente: não grava nada', async () => {
    vi.mocked(getPartnerProfileUseCase).mockResolvedValue(null);
    await expect(setPartnerVerificationByAdminApplicationUseCase('x', true)).rejects.toThrow();
    expect(applyPartnerVerification).not.toHaveBeenCalled();
  });
});

=== server/application/usecases/setPartnerVerificationByAdminApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  getPartnerProfileUseCase,
  PartnerDomainError,
  resolveAdminVerification,
} from '../../domain/partners';
import { applyPartnerVerification } from './applyPartnerVerification';

/** Admin concede ou retira o selo sem alterar o plano pago do parceiro. */
export async function setPartnerVerificationByAdminApplicationUseCase(
  partnerId: string,
  grant: boolean,
  now: Date = new Date()
): Promise<void> {
  const previous = await getPartnerProfileUseCase(partnerId);
  if (!previous) {
    throw new PartnerDomainError('NOT_FOUND', 'Perfil de parceiro não encontrado');
  }

  const next = resolveAdminVerification(
    {
      isVerified: previous.isVerified,
      verifiedUntil: previous.verifiedUntil,
      verificationType: previous.verificationType,
      isVerificationSuspended: previous.isVerificationSuspended,
    },
    grant,
    now
  );

  await applyPartnerVerification(partnerId, next, previous);
}

=== server/application/usecases/verifyPartnerApplicationUseCase.ts — diff ===
@@ -1,11 +1,8 @@
-import {
-  getPartnerProfileUseCase,
-  updatePartnerVerificationProfileUseCase,
-} from '../../domain/partners';
-import { updateOwnerVerificationUseCase } from '../../domain/guide';
-import { updateEventsOwnerVerificationUseCase } from '../../domain/events';
+import { getPartnerProfileUseCase } from '../../domain/partners';
 import type { PartnerVerificationType } from '../../domain/partners';
+import { applyPartnerVerification } from './applyPartnerVerification';
 
+/** Selo vindo de plano (pagamento ou renovação). Uma suspensão do selo feita pelo admin é mantida. */
 export async function verifyPartnerApplicationUseCase(
   partnerId: string,
   isVerified: boolean,
@@ -18,33 +15,14 @@ export async function verifyPartnerApplicationUseCase(
     throw new Error('Perfil de parceiro não encontrado.');
   }
 
-  const verification = {
-    isVerified,
-    verifiedUntil,
-    verificationType,
-    isVerificationSuspended: false,
-  };
-
-  await updatePartnerVerificationProfileUseCase(partnerId, verification);
-
-  try {
-    await updateOwnerVerificationUseCase(partnerId, verification);
-    await updateEventsOwnerVerificationUseCase(partnerId, verification);
-  } catch (error) {
-    try {
-      await updatePartnerVerificationProfileUseCase(partnerId, {
-        isVerified: previous.isVerified,
-        verifiedUntil: previous.verifiedUntil,
-        verificationType: previous.verificationType,
-        isVerificationSuspended: previous.isVerificationSuspended,
-      });
-    } catch (rollbackError) {
-      console.error(
-        '[verifyPartnerApplicationUseCase] Falha no rollback do Partner:',
-        rollbackError
-      );
-    }
-
-    throw error;
-  }
+  await applyPartnerVerification(
+    partnerId,
+    {
+      isVerified,
+      verifiedUntil,
+      verificationType,
+      isVerificationSuspended: isVerified ? previous.isVerificationSuspended : false,
+    },
+    previous
+  );
 }

=== server/domain/events/adapters/firestoreEventAdapter.ts — diff ===
@@ -85,7 +85,7 @@ export class FirestoreEventAdapter implements EventsPort {
     verification: {
       isVerified: boolean;
       verifiedUntil: string | null;
-      verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
+      verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
       isVerificationSuspended: boolean;
     }
   ): Promise<void> {

=== server/domain/events/ports/eventsPort.ts — diff ===
@@ -22,7 +22,7 @@ export interface EventsPort {
     verification: {
       isVerified: boolean;
       verifiedUntil: string | null;
-      verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
+      verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
       isVerificationSuspended: boolean;
     }
   ): Promise<void>;

=== server/domain/events/services/eventsService.ts — diff ===
@@ -587,7 +587,7 @@ export class EventsService {
     verification: {
       isVerified: boolean;
       verifiedUntil: string | null;
-      verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
+      verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
       isVerificationSuspended: boolean;
     }
   ): Promise<void> {

=== server/domain/events/usecases/updateEventsOwnerVerificationUseCase.ts — diff ===
@@ -5,7 +5,7 @@ export async function updateEventsOwnerVerificationUseCase(
   verification: {
     isVerified: boolean;
     verifiedUntil: string | null;
-    verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
+    verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
     isVerificationSuspended: boolean;
   }
 ): Promise<void> {

=== server/domain/guide/types/guideTypes.ts — diff ===
@@ -1,4 +1,4 @@
-export type GuideVerificationType = 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
+export type GuideVerificationType = 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
 
 export type GuideItemCategory = 'restaurant' | 'sight' | 'tour' | 'tips' | 'hotel';

=== server/domain/insights/adapters/firebaseAdminInsightsAdapter.ts — diff ===
@@ -1,8 +1,25 @@
 import { InsightsRepositoryPort, CreateInteractionData } from '../ports/insightsRepositoryPort';
-import { ItemStats } from '../types/interaction';
+import type { InteractionType, ItemStats } from '../types/interaction';
 import { adminDb } from '../../../infrastructure/firebase/adminClient';
 import { FieldValue } from 'firebase-admin/firestore';
 
+// O tipo gravado é singular ('view'); o contador da resposta é 'views'.
+const STAT_COUNTER: Record<InteractionType, 'views' | 'whatsapp_click' | 'share' | 'favorite'> = {
+  view: 'views',
+  whatsapp_click: 'whatsapp_click',
+  share: 'share',
+  favorite: 'favorite',
+};
+
+/** Dia no fuso do negócio, para o gráfico dos últimos 7 dias não depender do fuso do servidor. */
+function formatBusinessDay(date: Date): string {
+  return date.toLocaleDateString('pt-BR', {
+    day: '2-digit',
+    month: '2-digit',
+    timeZone: 'America/Fortaleza',
+  });
+}
+
 export class FirebaseAdminInsightsAdapter implements InsightsRepositoryPort {
   async recordInteraction(data: CreateInteractionData): Promise<void> {
     await adminDb.collection('interactions').add({
@@ -34,14 +51,15 @@ export class FirebaseAdminInsightsAdapter implements InsightsRepositoryPort {
     for (let i = 6; i >= 0; i--) {
       const d = new Date();
       d.setDate(d.getDate() - i);
-      const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
+      const dateStr = formatBusinessDay(d);
       last7Days[dateStr] = 0;
     }
 
     snapshot.forEach((doc) => {
       const docData = doc.data();
-      if (docData.type in stats) {
-        (stats as Record<string, any>)[docData.type]++;
+      const counter = STAT_COUNTER[docData.type as InteractionType];
+      if (counter) {
+        stats[counter] += 1;
       }
 
       if (docData.type === 'view' && docData.timestamp) {
@@ -54,7 +72,7 @@ export class FirebaseAdminInsightsAdapter implements InsightsRepositoryPort {
           dateVal = new Date(docData.timestamp);
         }
 
-        const date = dateVal.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
+        const date = formatBusinessDay(dateVal);
         if (date in last7Days && typeof last7Days[date] === 'number') {
           last7Days[date] += 1;
         }

=== server/domain/partners/controllers/partnerController.ts — diff ===
@@ -1,7 +1,7 @@
 import { Response } from 'express';
 import { activatePartnerTrialApplicationUseCase } from '../../../application/usecases/activatePartnerTrialApplicationUseCase';
 import { registerPartnerApplicationUseCase } from '../../../application/usecases/registerPartnerApplicationUseCase';
-import { verifyPartnerApplicationUseCase } from '../../../application/usecases/verifyPartnerApplicationUseCase';
+import { setPartnerVerificationByAdminApplicationUseCase } from '../../../application/usecases/setPartnerVerificationByAdminApplicationUseCase';
 import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
 import { RegisterPartnerDTO } from '../dtos/RegisterPartnerDTO';
 import { VerifyPartnerDTO } from '../dtos/VerifyPartnerDTO';
@@ -93,12 +93,7 @@ export class PartnerController {
       }
 
       const dto = VerifyPartnerDTO.fromValidatedInput(parsed.data);
-      await verifyPartnerApplicationUseCase(
-        dto.partnerId,
-        dto.isVerified,
-        dto.verifiedUntil,
-        dto.verificationType
-      );
+      await setPartnerVerificationByAdminApplicationUseCase(dto.partnerId, dto.isVerified);
       return res
         .status(200)
         .json({ status: 'success', message: 'Selo de verificação atualizado com sucesso' });

=== server/domain/partners/dtos/VerifyPartnerDTO.ts — diff ===
@@ -1,20 +1,12 @@
-import type { PartnerVerificationType } from '../types/partnerTypes';
 import type { VerifyPartnerInput } from '../schemas/partnerSchema';
 
 export class VerifyPartnerDTO {
   private constructor(
     public readonly partnerId: string,
-    public readonly isVerified: boolean,
-    public readonly verifiedUntil: string | null,
-    public readonly verificationType: PartnerVerificationType
+    public readonly isVerified: boolean
   ) {}
 
   static fromValidatedInput(input: VerifyPartnerInput): VerifyPartnerDTO {
-    return new VerifyPartnerDTO(
-      input.partnerId,
-      Boolean(input.isVerified),
-      input.verifiedUntil ?? null,
-      (input.verificationType as PartnerVerificationType) ?? null
-    );
+    return new VerifyPartnerDTO(input.partnerId, input.isVerified);
   }
 }

=== server/domain/partners/index.ts — diff ===
@@ -27,3 +27,4 @@ export type {
 } from './types/partnerTypes';
 
 export { PartnerDomainError } from './errors/partnerDomainError';
+export { hasActivePlanVerification, resolveAdminVerification } from './utils/adminVerification';

=== server/domain/partners/mappers/partnerMapper.ts — diff ===
@@ -33,7 +33,13 @@ function toPartnerVerificationType(value: unknown): PartnerVerificationType {
     return null;
   }
 
-  if (value === 'trial' || value === 'monthly' || value === 'semi-annual' || value === 'annual') {
+  if (
+    value === 'trial' ||
+    value === 'monthly' ||
+    value === 'semi-annual' ||
+    value === 'annual' ||
+    value === 'admin'
+  ) {
     return value;
   }

=== server/domain/partners/schemas/partnerSchema.test.ts — diff ===
@@ -76,72 +76,31 @@ describe('Partner Validation Schemas (Backend)', () => {
   });
 
   describe('verifyPartnerSchema', () => {
-    it('should validate partner verification when isVerified is true with valid until and type', () => {
-      const result = verifyPartnerSchema.safeParse({
-        partnerId: 'partner_abc',
-        isVerified: true,
-        verifiedUntil: '2026-12-31T23:59:59.000Z',
-        verificationType: 'annual',
-      });
-      expect(result.success).toBe(true);
+    it('aceita só a decisão do admin (conceder ou retirar o selo)', () => {
+      expect(verifyPartnerSchema.safeParse({ partnerId: 'p1', isVerified: true }).success).toBe(
+        true
+      );
+      expect(verifyPartnerSchema.safeParse({ partnerId: 'p1', isVerified: false }).success).toBe(
+        true
+      );
     });
 
-    it('should validate partner verification when isVerified is false with null verifiedUntil', () => {
+    it('rejeita tipo e validade vindos do cliente: o servidor decide e preserva o plano pago', () => {
       const result = verifyPartnerSchema.safeParse({
-        partnerId: 'partner_abc',
-        isVerified: false,
-        verifiedUntil: null,
-        verificationType: null,
-      });
-      expect(result.success).toBe(true);
-    });
-
-    it('should fail when isVerified is true but verifiedUntil is missing or null', () => {
-      const result = verifyPartnerSchema.safeParse({
-        partnerId: 'partner_abc',
+        partnerId: 'p1',
         isVerified: true,
-        verifiedUntil: null,
-        verificationType: 'annual',
-      });
-      expect(result.success).toBe(false);
-    });
-
-    it('should fail when isVerified is false but verifiedUntil is provided', () => {
-      const result = verifyPartnerSchema.safeParse({
-        partnerId: 'partner_abc',
-        isVerified: false,
         verifiedUntil: '2026-12-31T23:59:59.000Z',
-        verificationType: null,
-      });
-      expect(result.success).toBe(false);
-    });
-
-    it('should fail when isVerified is false but verificationType is provided', () => {
-      const result = verifyPartnerSchema.safeParse({
-        partnerId: 'partner_abc',
-        isVerified: false,
-        verifiedUntil: null,
         verificationType: 'annual',
       });
       expect(result.success).toBe(false);
-      if (!result.success) {
-        expect(result.error.issues[0]?.message).toBe(
-          'verificationType deve ser null quando isVerified=false.'
-        );
-      }
     });
 
-    it('should fail when partnerId is empty', () => {
-      const result = verifyPartnerSchema.safeParse({
-        partnerId: '   ',
-        isVerified: true,
-        verifiedUntil: '2026-12-31T23:59:59.000Z',
-        verificationType: 'annual',
-      });
-      expect(result.success).toBe(false);
+    it('rejeita parceiro sem ID', () => {
+      expect(verifyPartnerSchema.safeParse({ partnerId: ' ', isVerified: true }).success).toBe(
+        false
+      );
     });
   });
-
   describe('activateTrialSchema', () => {
     it('should validate trial activation with required trimmed partnerId', () => {
       const result = activateTrialSchema.safeParse({

=== server/domain/partners/schemas/partnerSchema.ts — diff ===
@@ -21,51 +21,14 @@ export const registerPartnerSchema = z
   })
   .strict();
 
+// O admin só diz se concede ou retira o selo; tipo e validade são decididos no servidor
+// para nunca sobrescrever o plano pago do parceiro.
 export const verifyPartnerSchema = z
   .object({
     partnerId: z.string().trim().min(1, 'ID do parceiro é obrigatório'),
     isVerified: z.boolean(),
-    verifiedUntil: z
-      .string()
-      .datetime({
-        offset: true,
-      })
-      .nullable(),
-    verificationType: z.enum(['trial', 'monthly', 'semi-annual', 'annual']).nullable(),
   })
-  .strict()
-  .superRefine((data, ctx) => {
-    if (data.isVerified) {
-      if (!data.verifiedUntil) {
-        ctx.addIssue({
-          code: 'custom',
-          path: ['verifiedUntil'],
-          message: 'verifiedUntil é obrigatório quando o parceiro está verificado.',
-        });
-      }
-      if (!data.verificationType) {
-        ctx.addIssue({
-          code: 'custom',
-          path: ['verificationType'],
-          message: 'verificationType é obrigatório quando o parceiro está verificado.',
-        });
-      }
-    }
-    if (!data.isVerified && data.verifiedUntil !== null) {
-      ctx.addIssue({
-        code: 'custom',
-        path: ['verifiedUntil'],
-        message: 'verifiedUntil deve ser null quando isVerified=false.',
-      });
-    }
-    if (!data.isVerified && data.verificationType !== null) {
-      ctx.addIssue({
-        code: 'custom',
-        path: ['verificationType'],
-        message: 'verificationType deve ser null quando isVerified=false.',
-      });
-    }
-  });
+  .strict();
 
 export const activateTrialSchema = z
   .object({

=== server/domain/partners/types/partnerTypes.ts — diff ===
@@ -2,7 +2,14 @@ export type PartnerStatus = 'active' | 'pending' | 'suspended';
 
 export type PartnerCategory = 'sight' | 'hotel' | 'restaurant' | 'event';
 
-export type PartnerVerificationType = 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
+/** `admin`: selo concedido pelo admin, sem plano pago. */
+export type PartnerVerificationType =
+  | 'trial'
+  | 'monthly'
+  | 'semi-annual'
+  | 'annual'
+  | 'admin'
+  | null;
 
 export type PartnerBusinessType = 'item' | 'event';

=== server/domain/partners/utils/adminVerification.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import type { PartnerVerificationData } from '../types/partnerTypes';
import { resolveAdminVerification } from './adminVerification';

const NOW = new Date('2026-10-12T12:00:00.000Z');
const NONE: PartnerVerificationData = {
  isVerified: false,
  verifiedUntil: null,
  verificationType: null,
  isVerificationSuspended: false,
};
const PAID: PartnerVerificationData = {
  isVerified: true,
  verifiedUntil: '2027-04-12T12:00:00.000Z',
  verificationType: 'semi-annual',
  isVerificationSuspended: false,
};

describe('resolveAdminVerification', () => {
  it('conceder sem plano: selo do admin por um ano', () => {
    expect(resolveAdminVerification(NONE, true, NOW)).toEqual({
      isVerified: true,
      verifiedUntil: '2027-10-12T12:00:00.000Z',
      verificationType: 'admin',
      isVerificationSuspended: false,
    });
  });

  it('conceder com plano pago em vigor: o plano fica igual', () => {
    expect(resolveAdminVerification(PAID, true, NOW)).toEqual(PAID);
  });

  it('retirar com plano pago em vigor: só suspende o selo, sem tocar no plano', () => {
    expect(resolveAdminVerification(PAID, false, NOW)).toEqual({
      ...PAID,
      isVerificationSuspended: true,
    });
  });

  it('conceder de novo depois de suspender: o selo volta e o plano continua', () => {
    const suspended = { ...PAID, isVerificationSuspended: true };
    expect(resolveAdminVerification(suspended, true, NOW)).toEqual(PAID);
  });

  it('retirar selo do admin: remove por completo', () => {
    const adminSeal = resolveAdminVerification(NONE, true, NOW);
    expect(resolveAdminVerification(adminSeal, false, NOW)).toEqual(NONE);
  });

  it('plano vencido não conta como plano em vigor', () => {
    const expired = { ...PAID, verifiedUntil: '2026-01-01T00:00:00.000Z' };
    expect(resolveAdminVerification(expired, true, NOW).verificationType).toBe('admin');
  });
});

=== server/domain/partners/utils/adminVerification.ts — ARQUIVO NOVO, conteúdo completo ===
import type { PartnerVerificationData } from '../types/partnerTypes';

const ADMIN_VERIFICATION_DAYS = 365;
const DAY_MS = 86_400_000;

function isFuture(iso: string | null, now: Date): boolean {
  return Boolean(iso) && new Date(iso as string).getTime() > now.getTime();
}

/** Plano pago ou trial em vigor: o admin nunca altera tipo nem validade dele. */
export function hasActivePlanVerification(current: PartnerVerificationData, now: Date): boolean {
  return (
    current.isVerified &&
    current.verificationType !== null &&
    current.verificationType !== 'admin' &&
    isFuture(current.verifiedUntil, now)
  );
}

/**
 * Selo concedido ou retirado pelo admin. Com plano em vigor, só liga ou desliga a suspensão do
 * selo, preservando o plano; sem plano, concede o selo `admin` por um ano ou o remove.
 */
export function resolveAdminVerification(
  current: PartnerVerificationData,
  grant: boolean,
  now: Date
): PartnerVerificationData {
  if (hasActivePlanVerification(current, now)) {
    return { ...current, isVerificationSuspended: !grant };
  }
  if (!grant) {
    return {
      isVerified: false,
      verifiedUntil: null,
      verificationType: null,
      isVerificationSuspended: false,
    };
  }
  if (
    current.isVerified &&
    current.verificationType === 'admin' &&
    isFuture(current.verifiedUntil, now)
  ) {
    return { ...current, isVerificationSuspended: false };
  }
  return {
    isVerified: true,
    verifiedUntil: new Date(now.getTime() + ADMIN_VERIFICATION_DAYS * DAY_MS).toISOString(),
    verificationType: 'admin',
    isVerificationSuspended: false,
  };
}

=== src/app/AppRouter.tsx — diff ===
@@ -209,7 +209,6 @@ export function AppRouter() {
   useScrollLock(isMenuOpen);
   useScrollLock(isSearchOpen);
   useScrollLock(isPartnersOpen);
-  useScrollLock(isPartnerPortalOpen);
   useScrollLock(!!selectedItem);
   useScrollLock(isLoginModalOpen && !isMenuOpen);

=== src/app/compositions/PartnerPortalComposition.test.tsx — diff ===
@@ -61,3 +61,18 @@ describe('PartnerPortalComposition', () => {
     expect(screen.getByRole('button', { name: 'Voltar ao início' })).toBeTruthy();
   });
 });
+
+describe('PartnerPortalComposition — parceiro suspenso', () => {
+  it('mostra o aviso de suspensão em vez do painel', async () => {
+    const { getPartnerProfileUseCase } = await import('../../domain/partners');
+    vi.mocked(getPartnerProfileUseCase).mockResolvedValue({
+      id: 'p1',
+      status: 'suspended',
+    } as never);
+    authState.value = { user: { uid: 'p1', role: UserRole.PARTNER }, loading: false };
+    await i18n.changeLanguage('pt-BR');
+    renderPortal();
+    expect(await screen.findByText('Conta de parceiro suspensa')).toBeTruthy();
+    expect(screen.queryByText('partner-panel')).toBeNull();
+  });
+});

=== src/app/compositions/PartnerPortalComposition.tsx — diff ===
@@ -25,6 +25,7 @@ export function PartnerPortalComposition() {
   const [profileLoading, setProfileLoading] = useState(true);
   const [profileError, setProfileError] = useState<string | null>(null);
   const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
+  const [profileVersion, setProfileVersion] = useState(0);
 
   useEffect(() => {
     let active = true;
@@ -58,7 +59,8 @@ export function PartnerPortalComposition() {
     }
 
     let active = true;
-    setProfileLoading(true);
+    // Recarga depois da compra de plano: mantém o painel na tela em vez do carregamento inicial.
+    setProfileLoading(profileVersion === 0);
     setProfileError(null);
 
     getPartnerProfileUseCase(user.uid)
@@ -90,7 +92,7 @@ export function PartnerPortalComposition() {
     return () => {
       active = false;
     };
-  }, [user, loading]);
+  }, [user, loading, profileVersion]);
 
   if (loading || profileLoading) {
     return (
@@ -112,6 +114,18 @@ export function PartnerPortalComposition() {
     );
   }
 
+  if (profile?.status === 'suspended') {
+    return (
+      <MessagePage
+        icon={ShieldAlert}
+        title={t('pages.partnerSuspendedTitle')}
+        description={t('pages.partnerSuspended')}
+        actionLabel={t('pages.backHome')}
+        onAction={() => goTo('explore')}
+      />
+    );
+  }
+
   // O portal esconde o cabeçalho e a navegação; a ação leva de volta ao guia.
   if (profileError || !profile) {
     return (
@@ -127,7 +141,9 @@ export function PartnerPortalComposition() {
 
   return (
     <PartnerPanel
+      key={profileVersion}
       profile={profile}
+      onPlanPurchased={() => setProfileVersion((version) => version + 1)}
       subscriptionPlans={plans}
       renderReports={({ partnerId, items, events }) => (
         <ReportsView partnerId={partnerId} items={items} events={events} />

=== src/domain/admin/components/AdminPanel.tsx — diff ===
@@ -6,11 +6,6 @@ import { ChevronLeft, RefreshCw, X } from 'lucide-react';
 import { useUI } from '../../../shared/stores/useUIStore';
 import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
 
-import {
-  deletePartnerProfileUseCase,
-  updatePartnerStatusUseCase,
-  updatePartnerVerificationUseCase,
-} from '../../partners';
 import { BackgroundBlobs } from '../../../ui/components/BackgroundBlobs';
 import { ErrorState } from '../../../ui/components/ErrorState';
 import { CATEGORIES } from '../../../shared/constants/categories';
@@ -18,6 +13,7 @@ import {
   createAdminEventListingUseCase,
   createAdminEventOccurrenceUseCase,
   deleteAdminEventListingUseCase,
+  deleteAdminEventOccurrenceUseCase,
   updateAdminEventListingUseCase,
   updateAdminEventOccurrenceUseCase,
 } from '../../events';
@@ -35,8 +31,8 @@ import {
 } from '../application/mappers/adminGuideEditorMapper';
 import { useAdminGuideCatalog } from '../hooks/useAdminGuideCatalog';
 import { useAdminPartners } from '../hooks/useAdminPartners';
+import { useAdminPartnerActions } from '../hooks/useAdminPartnerActions';
 import { useAdminStats } from '../hooks/useAdminStats';
-import type { AdminPartnerSummary } from '../types/admin';
 
 import { AdminNavigation, type AdminTabId } from './subcomponents/AdminNavigation';
 import { AdminStatsView } from './subcomponents/AdminStatsView';
@@ -45,6 +41,7 @@ import { AdminGuideView } from './subcomponents/AdminGuideView';
 import {
   ADMIN_CREATABLE_ITEM_CATEGORIES,
   AdminEditorModal,
+  type AdminEditorSaveData,
 } from './subcomponents/AdminEditorModal';
 import { AdminPlansView } from './subcomponents/AdminPlansView';
 import { AdminNotificationsView } from './subcomponents/AdminNotificationsView';
@@ -85,10 +82,11 @@ export function AdminPanel() {
 
   const currentList = activeTab === 'events' ? eventsList : itemsList;
 
+  // O filtro de categoria só existe na aba de itens; na agenda todos os eventos aparecem.
   const filteredItems = useMemo(() => {
-    if (filter === 'all') return currentList;
+    if (activeTab !== 'items' || filter === 'all') return currentList;
     return currentList.filter((item) => item.category === filter);
-  }, [currentList, filter]);
+  }, [activeTab, currentList, filter]);
 
   const categories = useMemo(
     () => [
@@ -110,46 +108,17 @@ export function AdminPanel() {
       } else if (coll === 'events') {
         await deleteAdminEventListingUseCase(id);
       }
+      showToast('Registro excluído.', 'success');
     } catch (error) {
       console.error(`Erro ao deletar em ${coll}/${id}:`, error);
       showToast('Não foi possível excluir o registro.', 'error');
     }
   };
 
-  const handleToggleVerification = async (partner: AdminPartnerSummary) => {
-    if (!(await confirmAction('Alterar status de verificação do parceiro?'))) return;
-    const newVerified = !partner.isVerified;
-    const verifiedUntil = new Date();
-    verifiedUntil.setFullYear(verifiedUntil.getFullYear() + 1);
-    const verifiedUntilIso = newVerified ? verifiedUntil.toISOString() : null;
-    const verificationType = newVerified ? ('annual' as const) : null;
-
-    try {
-      await updatePartnerVerificationUseCase(
-        partner.id,
-        newVerified,
-        verifiedUntilIso,
-        verificationType
-      );
-      patchPartner(partner.id, { isVerified: newVerified });
-      showToast('Status de verificação atualizado com sucesso!', 'success');
-    } catch {
-      showToast('Erro ao atualizar verificação', 'error');
-    }
-  };
-
-  const handleToggleStatus = async (partner: AdminPartnerSummary) => {
-    if (!(await confirmAction('Alterar status do parceiro?'))) return;
-    const newStatus = partner.status === 'active' ? 'pending' : 'active';
-    try {
-      await updatePartnerStatusUseCase(partner.id, newStatus);
-      patchPartner(partner.id, { status: newStatus });
-    } catch {
-      showToast('Erro ao atualizar status', 'error');
-    }
-  };
+  const { handleToggleVerification, handleToggleStatus, handleDeletePartner } =
+    useAdminPartnerActions({ reloadPartners: fetchPartners, patchPartner, removePartner });
 
-  const handleSaveRecord = async (editorData: GuideItem) => {
+  const handleSaveRecord = async (editorData: AdminEditorSaveData) => {
     try {
       if (activeTab === 'items') {
         if (editorData.id) {
@@ -163,22 +132,16 @@ export function AdminPanel() {
           endDate: editorData.endDate || editorData.date,
           eventCategory: editorData.eventCategory || 'geral',
         };
-        const rawOccurrences = (
-          editorData as GuideItem & {
-            occurrences?: Array<{
-              id?: string;
-              startsAt: string;
-              endsAt: string;
-              capacity: number;
-            }>;
-          }
-        ).occurrences;
+        const rawOccurrences = editorData.occurrences;
 
         if (editorData.id) {
           await updateAdminEventListingUseCase(
             editorData.id,
             toGuideEventUpdateInput(normalizedEventData)
           );
+          for (const occurrenceId of editorData.removedOccurrenceIds ?? []) {
+            await deleteAdminEventOccurrenceUseCase(editorData.id, occurrenceId);
+          }
           if (Array.isArray(rawOccurrences)) {
             for (const occ of rawOccurrences) {
               if (occ.id) {
@@ -211,6 +174,7 @@ export function AdminPanel() {
         }
       }
       setIsEditing(null);
+      showToast('Registro salvo.', 'success');
     } catch (error: unknown) {
       console.error('[AdminPanel.handleSaveRecord]', error);
       showToast(
@@ -317,10 +281,7 @@ export function AdminPanel() {
                   isLoading={partnersLoading}
                   onToggleVerification={handleToggleVerification}
                   onToggleStatus={handleToggleStatus}
-                  onDeletePartner={async (id) => {
-                    await deletePartnerProfileUseCase(id);
-                    removePartner(id);
-                  }}
+                  onDeletePartner={handleDeletePartner}
                 />
               )
             ) : activeTab === 'plans' ? (
@@ -376,6 +337,7 @@ export function AdminPanel() {
               } else {
                 await deleteAdminEventListingUseCase(id);
               }
+              showToast('Registro excluído.', 'success');
             }}
           />
         )}

=== src/domain/admin/components/subcomponents/AdminEditorEventFields.tsx — diff ===
@@ -1,11 +1,23 @@
 import React from 'react';
 import { useFieldArray, useFormContext } from 'react-hook-form';
 import { Plus, Trash2 } from 'lucide-react';
-import { isoToLocalDateTime, localDateTimeToIso } from '../../../partners/utils/dateTime';
+import {
+  businessDateTimeToIso,
+  isoToBusinessDateTime,
+} from '../../../../shared/utils/businessDateTime';
+import { CUSTOM_EVENT_CATEGORY, EVENT_CATEGORIES } from '../../../events';
 import { PartnerEventTicketingManager } from '../../../ticketing';
 import type { AdminGuideEditorSchemaValues } from '../../schemas/adminGuideEditorFormSchema';
 
-export function AdminEditorEventFields({ eventListingId }: { eventListingId?: string }) {
+interface AdminEditorEventFieldsProps {
+  eventListingId?: string;
+  occurrencesState: 'idle' | 'loading' | 'ready' | 'error';
+}
+
+export function AdminEditorEventFields({
+  eventListingId,
+  occurrencesState,
+}: AdminEditorEventFieldsProps) {
   const { control, register, setValue, watch } = useFormContext<AdminGuideEditorSchemaValues>();
   const { fields, append, remove } = useFieldArray({
     control,
@@ -13,9 +25,59 @@ export function AdminEditorEventFields({ eventListingId }: { eventListingId?: st
   });
 
   const occurrences = watch('occurrences') || [];
+  const eventCategory = watch('eventCategory') || '';
 
   return (
     <div className="space-y-4" id="event-occurrences-section">
+      <div className="space-y-1.5 px-2">
+        <label
+          htmlFor="admin-event-category"
+          className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/50"
+        >
+          Categoria do Evento
+        </label>
+        <select
+          id="admin-event-category"
+          value={eventCategory}
+          onChange={(e) => {
+            setValue('eventCategory', e.target.value, { shouldDirty: true });
+            if (e.target.value !== CUSTOM_EVENT_CATEGORY) {
+              setValue('customCategory', '', { shouldDirty: true });
+            }
+          }}
+          className="w-full min-h-[44px] bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
+        >
+          <option value="">Selecione uma categoria...</option>
+          {EVENT_CATEGORIES.map((cat) => (
+            <option key={cat} value={cat}>
+              {cat}
+            </option>
+          ))}
+        </select>
+        {eventCategory === CUSTOM_EVENT_CATEGORY && (
+          <input
+            type="text"
+            aria-label="Nome da categoria"
+            placeholder="Nome da categoria"
+            maxLength={200}
+            {...register('customCategory')}
+            className="w-full min-h-[44px] bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
+          />
+        )}
+      </div>
+
+      {occurrencesState === 'loading' && (
+        <p role="status" className="px-2 text-xs text-white/60">
+          Carregando as sessões do evento...
+        </p>
+      )}
+      {occurrencesState === 'error' && (
+        <p role="alert" className="px-2 text-xs text-rose-300">
+          Não foi possível carregar as sessões deste evento. Feche e abra o editor de novo antes de
+          salvar.
+        </p>
+      )}
+      <p className="px-2 text-[11px] text-white/60">Horários no fuso de Fortaleza (UTC−3).</p>
       <div className="flex items-center justify-between px-2">
         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/50">
           Ocorrências do Evento
@@ -68,9 +130,9 @@ export function AdminEditorEventFields({ eventListingId }: { eventListingId?: st
                 </label>
                 <input
                   type="datetime-local"
-                  value={isoToLocalDateTime(occ?.startsAt)}
+                  value={isoToBusinessDateTime(occ?.startsAt)}
                   onChange={(e) => {
-                    const iso = localDateTimeToIso(e.target.value);
+                    const iso = businessDateTimeToIso(e.target.value);
                     setValue(`occurrences.${index}.startsAt`, iso, {
                       shouldDirty: true,
                       shouldValidate: true,
@@ -89,9 +151,9 @@ export function AdminEditorEventFields({ eventListingId }: { eventListingId?: st
                 </label>
                 <input
                   type="datetime-local"
-                  value={isoToLocalDateTime(occ?.endsAt)}
+                  value={isoToBusinessDateTime(occ?.endsAt)}
                   onChange={(e) => {
-                    const iso = localDateTimeToIso(e.target.value);
+                    const iso = businessDateTimeToIso(e.target.value);
                     setValue(`occurrences.${index}.endsAt`, iso, {
                       shouldDirty: true,
                       shouldValidate: true,

=== src/domain/admin/components/subcomponents/AdminEditorModal.tsx — diff ===
@@ -1,4 +1,4 @@
-import React, { useEffect, useState } from 'react';
+import React, { useEffect, useRef, useState } from 'react';
 import { zodResolver } from '@hookform/resolvers/zod';
 import { FormProvider, useForm, type Resolver } from 'react-hook-form';
 import { motion, AnimatePresence } from 'motion/react';
@@ -6,6 +6,7 @@ import { X, Trash2, RefreshCw } from 'lucide-react';
 import { CATEGORIES } from '../../../../shared/constants/categories';
 import { useUI } from '../../../../shared/stores/useUIStore';
 import { Z_INDEX } from '../../../../shared/constants/zIndex';
+import { listEventOccurrencesUseCase } from '../../../events';
 import type { GuideItem } from '../../../guide';
 import { getImageUploadErrorMessage, uploadImageUseCase } from '../../../media';
 import {
@@ -25,12 +26,20 @@ export const ADMIN_CREATABLE_ITEM_CATEGORIES = [
   'sight',
 ] as const;
 
+export type AdminEditorSaveData = GuideItem & {
+  occurrences?: AdminGuideEditorSchemaValues['occurrences'];
+  /** Sessões salvas que o admin removeu no editor e devem ser apagadas no servidor. */
+  removedOccurrenceIds?: string[];
+};
+
+type OccurrencesLoadState = 'idle' | 'loading' | 'ready' | 'error';
+
 interface AdminEditorModalProps {
   isEditing: GuideItem;
   setIsEditing: (item: GuideItem | null) => void;
   activeTab: 'items' | 'events';
   isAdminUser: boolean;
-  onSave: (data: GuideItem & { occurrences?: AdminGuideEditorSchemaValues['occurrences'] }) => Promise<void>;
+  onSave: (data: AdminEditorSaveData) => Promise<void>;
   onDeleteConfirm: (id: string) => Promise<void>;
 }
 
@@ -46,6 +55,8 @@ export function AdminEditorModal({
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const { showToast } = useUI();
+  const [occurrencesState, setOccurrencesState] = useState<OccurrencesLoadState>('idle');
+  const savedOccurrenceIdsRef = useRef<string[]>([]);
 
   const form = useForm<AdminGuideEditorSchemaValues>({
     resolver: zodResolver(
@@ -76,15 +87,10 @@ export function AdminEditorModal({
       images: isEditing?.images || [],
       date: isEditing?.date,
       endDate: isEditing?.endDate,
+      // Evento novo começa com uma sessão; as sessões de um evento salvo vêm do servidor (efeito abaixo).
       occurrences:
-        activeTab === 'events'
-          ? [
-              {
-                startsAt: defaultStart,
-                endsAt: defaultEnd,
-                capacity: 100,
-              },
-            ]
+        activeTab === 'events' && !isEditing?.id
+          ? [{ startsAt: defaultStart, endsAt: defaultEnd, capacity: 100 }]
           : [],
       eventCategory: isEditing?.eventCategory,
       customCategory: isEditing?.customCategory,
@@ -97,6 +103,40 @@ export function AdminEditorModal({
     });
   }, [isEditing.id, activeTab, form]);
 
+  useEffect(() => {
+    savedOccurrenceIdsRef.current = [];
+    if (activeTab !== 'events' || !isEditing.id) {
+      setOccurrencesState('idle');
+      return;
+    }
+    let active = true;
+    setOccurrencesState('loading');
+    listEventOccurrencesUseCase(isEditing.id)
+      .then((list) => {
+        if (!active) return;
+        savedOccurrenceIdsRef.current = list.map((occ) => occ.id);
+        form.setValue(
+          'occurrences',
+          list.map((occ) => ({
+            id: occ.id,
+            startsAt: occ.startsAt,
+            endsAt: occ.endsAt,
+            capacity: occ.capacity,
+            salesStartsAt: occ.salesStartsAt,
+            salesEndsAt: occ.salesEndsAt,
+          }))
+        );
+        setOccurrencesState('ready');
+      })
+      .catch((error: unknown) => {
+        console.error('[AdminEditorModal] sessões', error);
+        if (active) setOccurrencesState('error');
+      });
+    return () => {
+      active = false;
+    };
+  }, [isEditing.id, activeTab, form]);
+
   const isCreatingNew = !isEditing?.id;
 
   const availableCategories =
@@ -145,11 +185,21 @@ export function AdminEditorModal({
     }
   };
 
+  // Sem a lista real de sessões, salvar trataria as sessões existentes como removidas.
+  const occurrencesBlocked = occurrencesState === 'loading' || occurrencesState === 'error';
+
   const handleSaveWrapper = form.handleSubmit(
     async (values) => {
+      if (occurrencesBlocked) {
+        showToast('Aguarde o carregamento das sessões do evento antes de salvar.', 'error');
+        return;
+      }
       setIsLoading(true);
       try {
         const firstOccurrence = values.occurrences?.[0];
+        const keptIds = new Set(
+          (values.occurrences ?? []).map((occ) => occ.id).filter((id): id is string => Boolean(id))
+        );
         await onSave({
           ...isEditing,
           ...values,
@@ -157,6 +207,7 @@ export function AdminEditorModal({
           date: firstOccurrence?.startsAt || values.date,
           endDate: firstOccurrence?.endsAt || values.endDate || firstOccurrence?.startsAt || values.date,
           occurrences: values.occurrences,
+          removedOccurrenceIds: savedOccurrenceIdsRef.current.filter((id) => !keptIds.has(id)),
         });
       } finally {
         setIsLoading(false);
@@ -186,7 +237,8 @@ export function AdminEditorModal({
       setIsEditing(null);
       setShowDeleteConfirm(false);
     } catch (err) {
-      console.error(err);
+      console.error('[AdminEditorModal] excluir', err);
+      showToast('Não foi possível excluir o registro.', 'error');
     } finally {
       setIsLoading(false);
     }
@@ -297,7 +349,10 @@ export function AdminEditorModal({
                   />
 
                   {activeTab === 'events' && (
-                    <AdminEditorEventFields eventListingId={isEditing.id || undefined} />
+                    <AdminEditorEventFields
+                      eventListingId={isEditing.id || undefined}
+                      occurrencesState={occurrencesState}
+                    />
                   )}
 
                   <AdminEditorLocation />

=== src/domain/admin/components/subcomponents/AdminNotificationsView.tsx — diff ===
@@ -20,7 +20,7 @@ interface PartnerOption {
 type RecipientMode = AdminNotificationFormValues['recipientMode'];
 
 export function AdminNotificationsView() {
-  const { showToast } = useUI();
+  const { showToast, confirmAction } = useUI();
   const [partners, setPartners] = useState<PartnerOption[]>([]);
   const [isLoadingPartners, setIsLoadingPartners] = useState(true);
   const [partnersError, setPartnersError] = useState<string | null>(null);
@@ -85,6 +85,12 @@ export function AdminNotificationsView() {
   };
 
   const onSubmit = async (values: AdminNotificationFormValues) => {
+    if (
+      values.recipientMode === 'all' &&
+      !(await confirmAction(`Enviar este aviso para todos os ${partners.length} parceiros?`))
+    ) {
+      return;
+    }
     try {
       await sendAdminNotificationUseCase({
         recipientIds: values.recipientMode === 'all' ? 'all' : values.selectedPartnerIds,
@@ -143,7 +149,12 @@ export function AdminNotificationsView() {
               <button
                 key={mode}
                 type="button"
-                onClick={() => setValue('recipientMode', mode, { shouldValidate: true })}
+                onClick={() => {
+                  // A seleção anterior não vale para o novo modo (ex: três marcados em "Vários" e
+                  // depois "Um parceiro" enviaria para os três).
+                  setValue('recipientMode', mode, { shouldValidate: true });
+                  setValue('selectedPartnerIds', [], { shouldValidate: false });
+                }}
                 className={`flex-1 min-h-[44px] py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
                   recipientMode === mode
                     ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
@@ -158,6 +169,9 @@ export function AdminNotificationsView() {
 
         {recipientMode !== 'all' && (
           <div className="max-h-40 overflow-y-auto space-y-1 no-scrollbar border border-white/5 rounded-xl p-2 bg-black/10">
+            {partners.length === 0 && (
+              <p className="p-2 text-xs text-white/60">Nenhum parceiro cadastrado ainda.</p>
+            )}
             {partners.map((partner) => (
               <label
                 key={partner.id}
@@ -203,7 +217,7 @@ export function AdminNotificationsView() {
 
         <button
           type="submit"
-          disabled={isSubmitting}
+          disabled={isSubmitting || partners.length === 0}
           aria-label="Enviar notificação"
           className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 bg-teal-500 text-black hover:bg-teal-400 transition-colors rounded-xl text-xs font-bold uppercase tracking-wide disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
         >

=== src/domain/admin/components/subcomponents/AdminPartnersView.tsx — diff ===
@@ -1,15 +1,40 @@
 import React from 'react';
-import { Users, CheckCircle, Clock, Trash2, RefreshCw } from 'lucide-react';
+import { Users, CheckCircle, Clock, Trash2, RefreshCw, Ban } from 'lucide-react';
 import { cn } from '../../../../shared/utils/cn';
 import { VerifiedBadge } from '../../../../ui/components/VerifiedBadge';
 import { AdminPartnerSummary } from '../../types/admin';
 
+const STATUS_BADGE: Record<
+  AdminPartnerSummary['status'],
+  { label: string; className: string; icon: typeof Clock }
+> = {
+  active: { label: 'Cadastro Ativo', className: 'text-emerald-400', icon: CheckCircle },
+  pending: { label: 'Pendente', className: 'text-amber-500', icon: Clock },
+  suspended: { label: 'Suspenso', className: 'text-rose-400', icon: Ban },
+};
+
+const PLAN_LABEL: Record<NonNullable<AdminPartnerSummary['verificationType']>, string> = {
+  trial: 'Teste grátis',
+  monthly: 'Plano mensal',
+  'semi-annual': 'Plano semestral',
+  annual: 'Plano anual',
+  admin: 'Selo concedido pelo admin',
+};
+
+/** Selo visível para o público: verificado e não suspenso pelo admin. */
+function hasVisibleSeal(partner: AdminPartnerSummary): boolean {
+  return partner.isVerified && !partner.isVerificationSuspended;
+}
+
+const ROW_BUTTON =
+  'flex-1 sm:flex-none min-h-[44px] px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50';
+
 interface AdminPartnersViewProps {
   partners: AdminPartnerSummary[];
   isLoading: boolean;
   onToggleVerification: (partner: AdminPartnerSummary) => Promise<void>;
   onToggleStatus: (partner: AdminPartnerSummary) => Promise<void>;
-  onDeletePartner: (id: string) => Promise<void>;
+  onDeletePartner: (partner: AdminPartnerSummary) => Promise<void>;
 }
 
 export function AdminPartnersView({
@@ -54,68 +79,84 @@ export function AdminPartnersView({
                 <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                   {partner.firstName} {partner.lastName} • {partner.email}
                 </p>
-                <div className="flex items-center gap-3 mt-2">
+                <div className="flex flex-wrap items-center gap-3 mt-2">
                   <span className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] font-black uppercase text-white/50 border border-white/10">
                     Cat: {partner.category}
                   </span>
-                  <div className="flex items-center gap-1.5">
-                    {partner.status === 'active' ? (
-                      <div className="flex items-center gap-1 text-emerald-400">
-                        <CheckCircle size={10} />
+                  {(() => {
+                    const badge = STATUS_BADGE[partner.status];
+                    const StatusIcon = badge.icon;
+                    return (
+                      <div className={cn('flex items-center gap-1', badge.className)}>
+                        <StatusIcon size={10} aria-hidden="true" />
                         <span className="text-[8px] font-black uppercase italic">
-                          Cadastro Ativo
+                          {badge.label}
                         </span>
                       </div>
-                    ) : (
-                      <div className="flex items-center gap-1 text-amber-500">
-                        <Clock size={10} />
-                        <span className="text-[8px] font-black uppercase italic">Pendente</span>
-                      </div>
-                    )}
-                    {partner.isVerified && (
-                      <div className="flex items-center gap-1 text-blue-400 ml-2">
-                        <VerifiedBadge size="sm" />
-                        <span className="text-[8px] font-black uppercase italic">Verificado</span>
-                      </div>
-                    )}
-                  </div>
+                    );
+                  })()}
+                  {hasVisibleSeal(partner) && (
+                    <div className="flex items-center gap-1 text-blue-400">
+                      <VerifiedBadge size="sm" />
+                      <span className="text-[8px] font-black uppercase italic">Verificado</span>
+                    </div>
+                  )}
+                  {partner.isVerified && partner.verificationType && (
+                    <span className="text-[8px] font-black uppercase text-white/60">
+                      {PLAN_LABEL[partner.verificationType]}
+                      {partner.verifiedUntil &&
+                        ` até ${new Intl.DateTimeFormat('pt-BR', {
+                          timeZone: 'America/Fortaleza',
+                          dateStyle: 'short',
+                        }).format(new Date(partner.verifiedUntil))}`}
+                      {partner.isVerificationSuspended && ' · selo suspenso'}
+                    </span>
+                  )}
                 </div>
               </div>
             </div>
 
             <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
               <button
+                type="button"
                 onClick={() => onToggleVerification(partner)}
                 className={cn(
-                  'flex-1 sm:flex-none px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
-                  partner.isVerified
-                    ? 'bg-blue-500 text-black font-black'
-                    : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-black'
+                  ROW_BUTTON,
+                  hasVisibleSeal(partner)
+                    ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-black'
+                    : 'bg-blue-500 text-black'
                 )}
                 id={`btn-verify-${partner.id}`}
               >
-                {partner.isVerified ? 'Verificado' : 'Verificar'}
+                {hasVisibleSeal(partner) ? 'Retirar selo' : 'Conceder selo'}
               </button>
 
               <button
+                type="button"
                 onClick={() => onToggleStatus(partner)}
                 className={cn(
-                  'flex-1 sm:flex-none px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
-                  partner.status === 'active'
-                    ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black'
-                    : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black'
+                  ROW_BUTTON,
+                  partner.status === 'suspended'
+                    ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black'
+                    : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black'
                 )}
                 id={`btn-status-${partner.id}`}
               >
-                {partner.status === 'active' ? 'Suspender' : 'Ativar'}
+                {partner.status === 'suspended'
+                  ? 'Reativar'
+                  : partner.status === 'pending'
+                    ? 'Aprovar'
+                    : 'Suspender'}
               </button>
 
               <button
-                onClick={() => onDeletePartner(partner.id)}
-                className="p-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10"
+                type="button"
+                onClick={() => onDeletePartner(partner)}
+                aria-label={`Excluir parceiro ${partner.businessName}`}
+                className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                 id={`btn-delete-${partner.id}`}
               >
-                <Trash2 size={16} />
+                <Trash2 size={16} aria-hidden="true" />
               </button>
             </div>
           </div>

=== src/domain/admin/hooks/useAdminPartnerActions.ts — ARQUIVO NOVO, conteúdo completo ===
import { useUI } from '../../../shared/stores/useUIStore';
import {
  deletePartnerProfileUseCase,
  updatePartnerStatusUseCase,
  updatePartnerVerificationUseCase,
} from '../../partners';
import type { AdminPartnerSummary } from '../types/admin';

interface UseAdminPartnerActionsParams {
  reloadPartners: () => Promise<void>;
  patchPartner: (id: string, patch: Partial<AdminPartnerSummary>) => void;
  removePartner: (id: string) => void;
}

export function useAdminPartnerActions({
  reloadPartners,
  patchPartner,
  removePartner,
}: UseAdminPartnerActionsParams) {
  const { showToast, confirmAction } = useUI();

  const handleToggleVerification = async (partner: AdminPartnerSummary) => {
    const hasSeal = partner.isVerified && !partner.isVerificationSuspended;
    const message = hasSeal
      ? `Retirar o selo de verificação de ${partner.businessName}? Um plano pago em vigor é mantido; só o selo deixa de aparecer.`
      : `Conceder o selo de verificação a ${partner.businessName}? Um plano pago em vigor não é alterado.`;
    if (!(await confirmAction(message))) return;
    try {
      await updatePartnerVerificationUseCase(partner.id, !hasSeal);
      showToast(hasSeal ? 'Selo retirado.' : 'Selo concedido.', 'success');
      // Tipo e validade do selo são decididos pelo servidor; a lista é recarregada para refleti-los.
      await reloadPartners();
    } catch {
      showToast('Erro ao atualizar verificação', 'error');
    }
  };

  const handleToggleStatus = async (partner: AdminPartnerSummary) => {
    const newStatus = partner.status === 'active' ? 'suspended' : 'active';
    const message =
      newStatus === 'suspended'
        ? `Suspender ${partner.businessName}? O parceiro perde o acesso ao painel e não pode alterar itens, eventos, ofertas nem vender até ser reativado.`
        : `Ativar ${partner.businessName}? O parceiro volta a ter acesso ao painel.`;
    if (!(await confirmAction(message))) return;
    try {
      await updatePartnerStatusUseCase(partner.id, newStatus);
      patchPartner(partner.id, { status: newStatus });
      showToast(newStatus === 'suspended' ? 'Parceiro suspenso.' : 'Parceiro ativado.', 'success');
    } catch {
      showToast('Erro ao atualizar status', 'error');
    }
  };

  const handleDeletePartner = async (partner: AdminPartnerSummary) => {
    if (
      !(await confirmAction(
        `Excluir o parceiro ${partner.businessName}? O cadastro de parceiro é apagado e não pode ser recuperado.`
      ))
    ) {
      return;
    }
    try {
      await deletePartnerProfileUseCase(partner.id);
      removePartner(partner.id);
      showToast('Parceiro excluído.', 'success');
    } catch (error) {
      console.error('[AdminPanel.handleDeletePartner]', error);
      showToast('Não foi possível excluir o parceiro.', 'error');
    }
  };

  return { handleToggleVerification, handleToggleStatus, handleDeletePartner };
}

=== src/domain/admin/types/admin.ts — diff ===
@@ -31,5 +31,6 @@ export interface AdminPartnerSummary {
   status: 'active' | 'pending' | 'suspended';
   isVerified: boolean;
   verifiedUntil: string | null;
-  verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
+  verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
+  isVerificationSuspended: boolean;
 }

=== src/domain/events/constants/eventCategories.ts — ARQUIVO NOVO, conteúdo completo ===
/** Categorias de evento oferecidas no cadastro (parceiro e admin). "Outro" pede o nome em `customCategory`. */
export const EVENT_CATEGORIES = [
  'Festa',
  'Show',
  'Feira',
  'Festival',
  'Competição',
  'Corrida',
  'Torneio',
  'Outro',
] as const;

export const CUSTOM_EVENT_CATEGORY = 'Outro';

=== src/domain/events/index.ts — diff ===
@@ -24,3 +24,4 @@ export type {
   EventOccurrence,
   UpdateEventListingInput,
 } from './types/event';
+export { CUSTOM_EVENT_CATEGORY, EVENT_CATEGORIES } from './constants/eventCategories';

=== src/domain/guide/adapters/firebaseGuideCatalogAdapter.ts — diff ===
@@ -45,7 +45,8 @@ export function mapGuideItem(record: Record<string, unknown>): GuideItem {
       record.verificationType === 'trial' ||
       record.verificationType === 'monthly' ||
       record.verificationType === 'semi-annual' ||
-      record.verificationType === 'annual'
+      record.verificationType === 'annual' ||
+      record.verificationType === 'admin'
         ? record.verificationType
         : null,
     isVerificationSuspended:

=== src/domain/guide/types/guide.ts — diff ===
@@ -71,7 +71,7 @@ export interface GuideItem {
   isVerified?: boolean;
   verifiedUntil?: string | null;
   isVerificationSuspended?: boolean;
-  verificationType?: 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
+  verificationType?: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
   operationalInfo?: GuideItemOperationalInfo;
   isActive?: boolean;
   date?: string;

=== src/domain/insights/components/ReportsView.tsx — diff ===
@@ -1,5 +1,4 @@
 import React, { useState, useEffect } from 'react';
-import { getDocumentUseCase } from '../../database';
 import {
   BarChart,
   Bar,
@@ -28,6 +27,7 @@ import { getReviewsUseCase, respondToReviewUseCase } from '../../reviews';
 import { GuideItem } from '../../guide';
 import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
 import { useUI } from '../../../shared/stores/useUIStore';
+import { ErrorState } from '../../../ui/components/ErrorState';
 
 interface InteractionHistory {
   date: string;
@@ -80,6 +80,7 @@ export function ReportsView({ items, events }: ReportsViewProps) {
   const [replyText, setReplyText] = useState('');
   const [replyingTo, setReplyingTo] = useState<string | null>(null);
   const [showAllPending, setShowAllPending] = useState(false);
+  const [loadError, setLoadError] = useState(false);
 
   useEffect(() => {
     if (selectedEntity) {
@@ -89,10 +90,9 @@ export function ReportsView({ items, events }: ReportsViewProps) {
 
   const loadReports = async (itemId: string, type: 'items' | 'events') => {
     setLoading(true);
+    setLoadError(false);
     try {
-      await getDocumentUseCase(type, itemId);
-
-      const realStats = await getItemStatsUseCase(itemId);
+      const realStats = await getItemStatsUseCase(itemId, type);
 
       const statsData = {
         views: realStats?.views || 0,
@@ -108,6 +108,7 @@ export function ReportsView({ items, events }: ReportsViewProps) {
       setReviews(reviewsPage.items as PartnerReview[]);
     } catch (error) {
       console.error('[loadReports Error]:', error);
+      setLoadError(true);
     } finally {
       setLoading(false);
     }
@@ -236,6 +237,11 @@ export function ReportsView({ items, events }: ReportsViewProps) {
         <div className="py-20 text-center">
           <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
         </div>
+      ) : loadError && selectedEntity ? (
+        <ErrorState
+          message="Não foi possível carregar o relatório deste item."
+          onRetry={() => loadReports(selectedEntity.id, selectedEntity.type)}
+        />
       ) : (
         <motion.div
           initial={{ opacity: 0, y: 20 }}

=== src/domain/partners/adapters/apiPartnerAdapter.ts — diff ===
@@ -1,10 +1,6 @@
 import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
 import { PartnerPort } from '../ports/partnerPort';
-import {
-  PartnerProfile,
-  PartnerRegistrationPayload,
-  PartnerVerificationType,
-} from '../types/partner';
+import { PartnerProfile, PartnerRegistrationPayload } from '../types/partner';
 
 export class ApiPartnerAdapter implements PartnerPort {
   async registerPartner(payload: PartnerRegistrationPayload): Promise<void> {
@@ -106,12 +102,7 @@ export class ApiPartnerAdapter implements PartnerPort {
     }
   }
 
-  async updatePartnerVerification(
-    partnerId: string,
-    isVerified: boolean,
-    verifiedUntil: string | null,
-    verificationType: PartnerVerificationType
-  ): Promise<void> {
+  async updatePartnerVerification(partnerId: string, isVerified: boolean): Promise<void> {
     const res = await firebaseApiFetch(
       '/api/partners/verify',
       {
@@ -119,12 +110,7 @@ export class ApiPartnerAdapter implements PartnerPort {
         headers: {
           'Content-Type': 'application/json',
         },
-        body: JSON.stringify({
-          partnerId,
-          isVerified,
-          verifiedUntil,
-          verificationType,
-        }),
+        body: JSON.stringify({ partnerId, isVerified }),
       },
       { requireAuth: true }
     );

=== src/domain/partners/application/usecases/updatePartnerVerificationUseCase.test.ts — diff ===
@@ -16,109 +16,16 @@ describe('updatePartnerVerificationUseCase', () => {
     vi.clearAllMocks();
   });
 
-  it('aceita verificationType=trial', async () => {
-    await updatePartnerVerificationUseCase(
-      'partner-1',
-      true,
-      '2027-01-01T00:00:00.000Z',
-      'trial'
-    );
+  it('envia só a decisão do admin (conceder ou retirar o selo)', async () => {
+    await updatePartnerVerificationUseCase('partner-1', true);
+    expect(updatePartnerVerification).toHaveBeenCalledWith('partner-1', true);
 
-    expect(updatePartnerVerification).toHaveBeenCalledWith(
-      'partner-1',
-      true,
-      '2027-01-01T00:00:00.000Z',
-      'trial'
-    );
+    await updatePartnerVerificationUseCase('partner-1', false);
+    expect(updatePartnerVerification).toHaveBeenLastCalledWith('partner-1', false);
   });
 
-  it('aceita verificationType=monthly', async () => {
-    await updatePartnerVerificationUseCase(
-      'partner-1',
-      true,
-      '2027-01-01T00:00:00.000Z',
-      'monthly'
-    );
-
-    expect(updatePartnerVerification).toHaveBeenCalledWith(
-      'partner-1',
-      true,
-      '2027-01-01T00:00:00.000Z',
-      'monthly'
-    );
-  });
-
-  it('aceita verificationType=semi-annual', async () => {
-    await updatePartnerVerificationUseCase(
-      'partner-1',
-      true,
-      '2027-01-01T00:00:00.000Z',
-      'semi-annual'
-    );
-
-    expect(updatePartnerVerification).toHaveBeenCalledWith(
-      'partner-1',
-      true,
-      '2027-01-01T00:00:00.000Z',
-      'semi-annual'
-    );
-  });
-
-  it('aceita verificationType=annual', async () => {
-    await updatePartnerVerificationUseCase(
-      'partner-1',
-      true,
-      '2027-01-01T00:00:00.000Z',
-      'annual'
-    );
-
-    expect(updatePartnerVerification).toHaveBeenCalledWith(
-      'partner-1',
-      true,
-      '2027-01-01T00:00:00.000Z',
-      'annual'
-    );
-  });
-
-  it('aceita estado não verificado somente com verificationType=null', async () => {
-    await updatePartnerVerificationUseCase(
-      'partner-1',
-      false,
-      null,
-      null
-    );
-
-    expect(updatePartnerVerification).toHaveBeenCalledWith(
-      'partner-1',
-      false,
-      null,
-      null
-    );
-  });
-
-  it('rejeita estado não verificado com verificationType preenchido', async () => {
-    await expect(
-      updatePartnerVerificationUseCase(
-        'partner-1',
-        false,
-        null,
-        'annual'
-      )
-    ).rejects.toThrow(
-      'verificationType deve ser null quando isVerified=false.'
-    );
-
+  it('rejeita parceiro sem ID', async () => {
+    await expect(updatePartnerVerificationUseCase('', true)).rejects.toThrow();
     expect(updatePartnerVerification).not.toHaveBeenCalled();
   });
-
-  it('rejeita verificationType inválido', async () => {
-    await expect(
-      updatePartnerVerificationUseCase(
-        'partner-1',
-        true,
-        '2027-01-01T00:00:00.000Z',
-        'weekly' as never
-      )
-    ).rejects.toThrow();
-  });
 });

=== src/domain/partners/application/usecases/updatePartnerVerificationUseCase.ts — diff ===
@@ -1,24 +1,11 @@
 import { updatePartnerVerificationSchema } from '../../schemas/partnerSchema';
 import { partnerAdapter } from '../../factory';
-import type { PartnerVerificationType } from '../../types/partner';
 
+/** Admin concede ou retira o selo; o servidor preserva o plano pago do parceiro. */
 export async function updatePartnerVerificationUseCase(
   partnerId: string,
-  isVerified: boolean,
-  verifiedUntil: string | null = null,
-  verificationType: PartnerVerificationType = null
+  isVerified: boolean
 ): Promise<void> {
-  updatePartnerVerificationSchema.parse({
-    partnerId,
-    isVerified,
-    verifiedUntil,
-    verificationType,
-  });
-
-  return partnerAdapter.updatePartnerVerification(
-    partnerId,
-    isVerified,
-    verifiedUntil,
-    verificationType
-  );
+  updatePartnerVerificationSchema.parse({ partnerId, isVerified });
+  return partnerAdapter.updatePartnerVerification(partnerId, isVerified);
 }

=== src/domain/partners/components/PartnerEventForm.tsx — diff ===
@@ -24,18 +24,9 @@ import {
 } from '../schemas/partnerEventFormSchema';
 import type { PartnerBusiness, PartnerCategory } from '../types/partner';
 import type { PartnerContentEditorState } from '../types/partnerContent';
-import { isoToLocalDateTime, localDateTimeToIso } from '../utils/dateTime';
-
-const EVENT_CATEGORIES = [
-  'Festa',
-  'Show',
-  'Feira',
-  'Festival',
-  'Competição',
-  'Corrida',
-  'Torneio',
-  'Outro',
-];
+import { businessDateTimeToIso, isoToBusinessDateTime } from '../../../shared/utils/businessDateTime';
+import { EVENT_CATEGORIES } from '../../events';
+
 
 function RegionDropdown({
   value,
@@ -363,8 +354,8 @@ export function PartnerEventForm({
             </label>
             <input
               type="datetime-local"
-              value={isoToLocalDateTime(item.date)}
-              onChange={(e) => updateField('date', localDateTimeToIso(e.target.value))}
+              value={isoToBusinessDateTime(item.date)}
+              onChange={(e) => updateField('date', businessDateTimeToIso(e.target.value))}
               className="w-[85%] bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
             />
           </div>
@@ -375,8 +366,8 @@ export function PartnerEventForm({
             </label>
             <input
               type="datetime-local"
-              value={isoToLocalDateTime(item.endDate)}
-              onChange={(e) => updateField('endDate', localDateTimeToIso(e.target.value))}
+              value={isoToBusinessDateTime(item.endDate)}
+              onChange={(e) => updateField('endDate', businessDateTimeToIso(e.target.value))}
               className="w-[85%] bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
             />
           </div>

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -51,13 +51,15 @@ export interface PartnerPanelProps {
     itemId: string;
     itemName: string;
     amount: number;
-    onPaymentSuccess: () => Promise<void>;
+    onPaymentSuccess: () => void;
   }) => React.ReactNode;
   renderEventTicketingManager?: (eventListingId: string) => React.ReactNode;
   planSubscriptionSlot?: React.ReactNode;
   renderBookableOffersManager?: (
     items: Array<{ id: string; name: string; category: string }>
   ) => React.ReactNode;
+  /** Chamado ao fechar o checkout depois de um pagamento confirmado, para recarregar o perfil. */
+  onPlanPurchased?: () => void;
 }
 
 export function PartnerPanel({
@@ -69,6 +71,7 @@ export function PartnerPanel({
   renderEventTicketingManager,
   planSubscriptionSlot,
   renderBookableOffersManager,
+  onPlanPurchased,
 }: PartnerPanelProps) {
   const { goTo } = useLocalizedRouting();
 
@@ -111,11 +114,17 @@ export function PartnerPanel({
     amount: 0,
   });
 
-  const handleCheckoutSuccess = async () => {
+  // O modal mostra a própria tela de sucesso; o perfil é recarregado quando o parceiro fecha.
+  const planPurchasedRef = useRef(false);
+  const handleCheckoutSuccess = () => {
+    planPurchasedRef.current = true;
+  };
+  const handleCheckoutClose = () => {
     setShowCheckoutModal(false);
-    console.info(
-      '[Checkout Success] Pagamento concluído. O status e a verificação serão sincronizados automaticamente pelo servidor/webhook.'
-    );
+    if (planPurchasedRef.current) {
+      planPurchasedRef.current = false;
+      onPlanPurchased?.();
+    }
   };
 
   const phoneRef = useRef<PhoneInputFieldRef | null>(null);
@@ -588,7 +597,7 @@ export function PartnerPanel({
 
       {renderCheckoutModal?.({
         isOpen: showCheckoutModal,
-        onClose: () => setShowCheckoutModal(false),
+        onClose: handleCheckoutClose,
         itemId: checkoutPlanInfo.itemId,
         itemName: checkoutPlanInfo.itemName,
         amount: checkoutPlanInfo.amount,

=== src/domain/partners/components/subcomponents/PartnerHeader.tsx — diff ===
@@ -3,6 +3,7 @@ import { motion } from 'motion/react';
 import React from 'react';
 import { VerifiedBadge } from '../../../../ui/components/VerifiedBadge';
 import { PartnerProfile } from '../../types/partner';
+import { cn } from '../../../../shared/utils/cn';
 
 interface PartnerHeaderProps {
   partnerProfile: PartnerProfile | null;
@@ -12,16 +13,17 @@ interface PartnerHeaderProps {
   notificationBell?: React.ReactNode;
 }
 
-const getPlanName = (type: string | null | undefined): string => {
-  if (!type) return 'Trial';
-  const val = type.toLowerCase();
-  if (val === 'trial') return 'Trial';
-  if (val === 'mensal') return 'Mensal';
-  if (val === 'semestral') return 'Semestral';
-  if (val === 'anual') return 'Anual';
-  return type.charAt(0).toUpperCase() + type.slice(1);
+const PLAN_SUBTITLE: Record<string, string> = {
+  trial: 'Teste grátis',
+  monthly: 'Assinante plano “Mensal”',
+  'semi-annual': 'Assinante plano “Semestral”',
+  annual: 'Assinante plano “Anual”',
+  admin: 'Selo concedido pela equipe Use Guide',
 };
 
+const getPlanSubtitle = (type: string | null | undefined): string =>
+  (type && PLAN_SUBTITLE[type]) || 'Selo de empresa verificada';
+
 export function PartnerHeader({
   partnerProfile,
   onNavigateBack,
@@ -64,9 +66,15 @@ export function PartnerHeader({
               Status da Conta
             </div>
             <div className="flex items-center gap-2 mt-1">
-              <div className="w-2 h-2 rounded-full bg-emerald-500" />
+              <div
+                className={cn(
+                  'w-2 h-2 rounded-full',
+                  partnerProfile?.status === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'
+                )}
+                aria-hidden="true"
+              />
               <span className="text-[10px] font-semibold text-white">
-                {partnerProfile?.status || 'Ativo'}
+                {partnerProfile?.status === 'pending' ? 'Em análise' : 'Ativo'}
               </span>
             </div>
           </div>
@@ -92,7 +100,7 @@ export function PartnerHeader({
                   Sua empresa é verificada
                 </span>
                 <p className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest mt-1">
-                  Assinante plano “{getPlanName(partnerProfile?.verificationType)}”
+                  {getPlanSubtitle(partnerProfile?.verificationType)}
                 </p>
               </div>
             </>

=== src/domain/partners/components/subcomponents/PlansModal.tsx — diff ===
@@ -106,7 +106,7 @@ export function PlansModal({
       const activeOption = plans.find((p) => p.id === selectedPlan);
       if (activeOption) {
         onSelectPaidPlan(
-          `partner_verification_${activeOption.id}`,
+          activeOption.id,
           `Selo de Empresa Verificada - ${activeOption.name}`,
           activeOption.price
         );

=== src/domain/partners/ports/partnerPort.ts — diff ===
@@ -1,8 +1,4 @@
-import {
-  PartnerProfile,
-  PartnerRegistrationPayload,
-  PartnerVerificationType,
-} from '../types/partner';
+import { PartnerProfile, PartnerRegistrationPayload } from '../types/partner';
 
 export interface PartnerPort {
   registerPartner(payload: PartnerRegistrationPayload): Promise<void>;
@@ -10,11 +6,6 @@ export interface PartnerPort {
   getPartnerProfile(partnerId: string): Promise<PartnerProfile | null>;
   getAllPartners(): Promise<PartnerProfile[]>;
   updatePartnerStatus(partnerId: string, status: 'active' | 'pending' | 'suspended'): Promise<void>;
-  updatePartnerVerification(
-    partnerId: string,
-    isVerified: boolean,
-    verifiedUntil: string | null,
-    verificationType: PartnerVerificationType
-  ): Promise<void>;
+  updatePartnerVerification(partnerId: string, isVerified: boolean): Promise<void>;
   deletePartnerProfile(partnerId: string): Promise<void>;
 }

=== src/domain/partners/schemas/partnerSchema.test.ts — diff ===
@@ -240,61 +240,18 @@ describe('Partner Validation Schemas (Frontend)', () => {
       expect(result.data?.status).toBe('suspended');
     });
 
-    it('deve validar updatePartnerVerificationSchema quando verificado e com tipo válido', () => {
-      const result = updatePartnerVerificationSchema.safeParse({
-        partnerId: 'partner-123',
-        isVerified: true,
-        verifiedUntil: '2027-01-01T00:00:00.000Z',
-        verificationType: 'annual',
-      });
-      expect(result.success).toBe(true);
-    });
-
-    it('updatePartnerVerificationSchema: deve falhar quando isVerified=true sem verifiedUntil ou sem verificationType', () => {
-      const missingDate = updatePartnerVerificationSchema.safeParse({
-        partnerId: 'partner-123',
-        isVerified: true,
-        verifiedUntil: null,
-        verificationType: 'monthly',
-      });
-      expect(missingDate.success).toBe(false);
-
-      const missingType = updatePartnerVerificationSchema.safeParse({
-        partnerId: 'partner-123',
-        isVerified: true,
-        verifiedUntil: '2027-01-01T00:00:00.000Z',
-        verificationType: null,
-      });
-      expect(missingType.success).toBe(false);
-    });
-
-    it('updatePartnerVerificationSchema: deve falhar quando isVerified=false com verifiedUntil diferente de null', () => {
-      const invalidNotVerified = updatePartnerVerificationSchema.safeParse({
-        partnerId: 'partner-123',
-        isVerified: false,
-        verifiedUntil: '2027-01-01T00:00:00.000Z',
-        verificationType: null,
-      });
-      expect(invalidNotVerified.success).toBe(false);
-
-      const validNotVerified = updatePartnerVerificationSchema.safeParse({
-        partnerId: 'partner-123',
-        isVerified: false,
-        verifiedUntil: null,
-        verificationType: null,
-      });
-      expect(validNotVerified.success).toBe(true);
-    });
-
-    it('updatePartnerVerificationSchema: deve rejeitar verificationType quando isVerified=false', () => {
-      const result = updatePartnerVerificationSchema.safeParse({
-        partnerId: 'partner-123',
-        isVerified: false,
-        verifiedUntil: null,
-        verificationType: 'annual',
-      });
-
-      expect(result.success).toBe(false);
+    it('updatePartnerVerificationSchema aceita só partnerId e isVerified', () => {
+      expect(
+        updatePartnerVerificationSchema.safeParse({ partnerId: 'partner-123', isVerified: true })
+          .success
+      ).toBe(true);
+      expect(
+        updatePartnerVerificationSchema.safeParse({
+          partnerId: 'partner-123',
+          isVerified: true,
+          verificationType: 'annual',
+        }).success
+      ).toBe(false);
     });
   });
 });

=== src/domain/partners/schemas/partnerSchema.ts — diff ===
@@ -341,47 +341,8 @@ export const updatePartnerVerificationSchema = z
   .object({
     partnerId: z.string().min(1),
     isVerified: z.boolean(),
-    verifiedUntil: z
-      .string()
-      .datetime({
-        offset: true,
-      })
-      .nullable(),
-    verificationType: z.enum(['trial', 'monthly', 'semi-annual', 'annual']).nullable(),
   })
-  .superRefine((data, ctx) => {
-    if (data.isVerified && !data.verifiedUntil) {
-      ctx.addIssue({
-        code: 'custom',
-        path: ['verifiedUntil'],
-        message: 'verifiedUntil é obrigatório quando isVerified=true.',
-      });
-    }
-
-    if (data.isVerified && !data.verificationType) {
-      ctx.addIssue({
-        code: 'custom',
-        path: ['verificationType'],
-        message: 'verificationType é obrigatório quando isVerified=true.',
-      });
-    }
-
-    if (!data.isVerified && data.verifiedUntil !== null) {
-      ctx.addIssue({
-        code: 'custom',
-        path: ['verifiedUntil'],
-        message: 'verifiedUntil deve ser null quando isVerified=false.',
-      });
-    }
-
-    if (!data.isVerified && data.verificationType !== null) {
-      ctx.addIssue({
-        code: 'custom',
-        path: ['verificationType'],
-        message: 'verificationType deve ser null quando isVerified=false.',
-      });
-    }
-  });
+  .strict();
 
 export type PartnerSubmissionInput = z.infer<typeof partnerSubmissionSchema>;
 export type UpdatePartnerStatusInput = z.infer<typeof updatePartnerStatusSchema>;

=== src/domain/partners/types/partner.ts — diff ===
@@ -64,7 +64,13 @@ export interface PartnerSubmissionData {
   sightPrice?: string;
 }
 
-export type PartnerVerificationType = 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
+export type PartnerVerificationType =
+  | 'trial'
+  | 'monthly'
+  | 'semi-annual'
+  | 'annual'
+  | 'admin'
+  | null;
 
 export interface PartnerProfile {
   id: string;

=== src/domain/partners/types/partnerContent.ts — diff ===
@@ -74,7 +74,7 @@ export interface PartnerContentRecord {
   isVerified?: boolean;
   verifiedUntil?: string | null;
   isVerificationSuspended?: boolean;
-  verificationType?: 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
+  verificationType?: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
   operationalInfo?: PartnerOperationalInfo;
   isActive?: boolean;
   date?: string;

=== src/domain/partners/utils/dateTime.test.ts — APAGUE este arquivo ===

=== src/domain/partners/utils/dateTime.ts — APAGUE este arquivo ===

=== src/shared/i18n/resources.ts — diff ===
@@ -157,6 +157,8 @@ export interface TranslationResource {
     partnerOnly: string;
     partnerProfileNotFound: string;
     partnerProfileLoadError: string;
+    partnerSuspendedTitle: string;
+    partnerSuspended: string;
   };
   settings: {
     title: string;
@@ -361,6 +363,8 @@ const ptBR: TranslationResource = {
     partnerOnly: 'Este painel é exclusivo para parceiros cadastrados.',
     partnerProfileNotFound: 'Não encontramos o seu cadastro de parceiro.',
     partnerProfileLoadError: 'Não foi possível carregar o seu cadastro de parceiro.',
+    partnerSuspendedTitle: 'Conta de parceiro suspensa',
+    partnerSuspended: 'Seu acesso ao painel foi suspenso pela equipe do Use Guide. Fale com o suporte para saber como reativar.',
   },
   settings: {
     title: 'Configurações',
@@ -568,6 +572,8 @@ const en: TranslationResource = {
     partnerOnly: 'This dashboard is only for registered partners.',
     partnerProfileNotFound: 'We couldn’t find your partner registration.',
     partnerProfileLoadError: 'We couldn’t load your partner registration.',
+    partnerSuspendedTitle: 'Partner account suspended',
+    partnerSuspended: 'Your dashboard access was suspended by the Use Guide team. Contact support to find out how to reactivate it.',
   },
   settings: {
     title: 'Settings',
@@ -780,6 +786,8 @@ const fr: TranslationResource = {
     partnerOnly: 'Ce tableau de bord est réservé aux partenaires inscrits.',
     partnerProfileNotFound: 'Nous n’avons pas trouvé votre inscription de partenaire.',
     partnerProfileLoadError: 'Impossible de charger votre inscription de partenaire.',
+    partnerSuspendedTitle: 'Compte partenaire suspendu',
+    partnerSuspended: 'Votre accès au tableau de bord a été suspendu par l’équipe Use Guide. Contactez le support pour savoir comment le réactiver.',
   },
   settings: {
     title: 'Paramètres',

=== src/shared/utils/businessDateTime.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { businessDateTimeToIso, isoToBusinessDateTime } from './businessDateTime';

describe('data e hora no fuso do negócio', () => {
  it('14:30 em Fortaleza é 17:30 UTC, qualquer que seja o fuso do navegador', () => {
    expect(businessDateTimeToIso('2026-10-10T14:30')).toBe('2026-10-10T17:30:00.000Z');
  });

  it('mostra no campo a hora de Fortaleza', () => {
    expect(isoToBusinessDateTime('2026-10-10T17:30:00.000Z')).toBe('2026-10-10T14:30');
    expect(isoToBusinessDateTime('2026-10-11T01:00:00.000Z')).toBe('2026-10-10T22:00');
  });

  it('ida e volta preservam o valor digitado', () => {
    expect(isoToBusinessDateTime(businessDateTimeToIso('2026-12-31T23:59'))).toBe(
      '2026-12-31T23:59'
    );
  });

  it('vazio ou inválido vira string vazia', () => {
    expect(businessDateTimeToIso('')).toBe('');
    expect(businessDateTimeToIso('10/10/2026')).toBe('');
    expect(isoToBusinessDateTime('')).toBe('');
    expect(isoToBusinessDateTime(undefined)).toBe('');
    expect(isoToBusinessDateTime('não é data')).toBe('');
  });
});

=== src/shared/utils/businessDateTime.ts — ARQUIVO NOVO, conteúdo completo ===
// Fortaleza é UTC−3 fixo, sem horário de verão (AGENTS.md §1): campos de data e hora dos
// formulários mostram e recebem a hora do negócio, qualquer que seja o fuso do navegador.
const BUSINESS_OFFSET_MS = 3 * 60 * 60 * 1000;
const INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** "AAAA-MM-DDTHH:MM" digitado em hora de Fortaleza → ISO UTC; vazio se inválido. */
export function businessDateTimeToIso(value: string): string {
  const match = INPUT_PATTERN.exec(value);
  if (!match) {
    return '';
  }
  const [, y, m, d, h, min] = match.map(Number) as [number, number, number, number, number, number];
  return new Date(Date.UTC(y, m - 1, d, h, min) + BUSINESS_OFFSET_MS).toISOString();
}

/** ISO → "AAAA-MM-DDTHH:MM" em hora de Fortaleza, para `<input type="datetime-local">`. */
export function isoToBusinessDateTime(value?: string): string {
  if (!value) {
    return '';
  }
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return '';
  }
  return new Date(time - BUSINESS_OFFSET_MS).toISOString().slice(0, 16);
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck` sem erros; `npx biome lint .` com 0 erros.
- `npm test` → 132 arquivos, 767 testes.
- `npm run build` sem erros.

Responda no formato do AGENTS.md §16.3.
~~~~
