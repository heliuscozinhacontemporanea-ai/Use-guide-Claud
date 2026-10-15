# Prompt 16.1 — Ajustes do lote 7/8

> Lote 9, gerado do commit de referência `6022c0b` da branch `claude/agents-md-v2`. É o primeiro do lote 9: aplique antes do 17. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 16.1 — Ajustes do lote 7/8

Comparação do zip de 2026-10-14 com a referência: a padronização das Functions (checkExpiringPlans pelo backend) foi aceita; estes ajustes corrigem o que saiu do escopo.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

O QUE MUDA (somente isto; não altere outros arquivos):
1) docs/arquitetura/solicitacoes-agents.md volta ao texto aprovado: a tabela e o detalhe de S1–S8 tinham sido reescritos com conteúdo que não corresponde às solicitações reais.
2) functions/package.json volta a declarar firebase-admin: é peer dependency do firebase-functions e continua no functions/package-lock.json; sem ela o `npm ci` do deploy falha por lockfile fora de sincronia.
3) A taxa da plataforma é lida em um único lugar (server/shared/kernel/platformFee.ts, §2.2.3). Sem valor configurado, vale 10%. Valor inválido falha na chamada (§2.2.4) em vez de cobrar 10% sem ninguém ter configurado. O teste de ticketing não altera mais process.env.
4) A fachada server/domain/payment/index.ts não exporta ports internos (TransactionRepositoryPort etc., §5.2); ninguém os importa por ela.
5) FavoritesList repassa só { id, category } (é tudo o que a composição usa: o detalhe é lido do catálogo pela URL), sem `any` nem `as GuideItem` (§14).

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/solicitacoes-agents.md (alterar)
- functions/package.json (alterar)
- server/application/usecases/bookings/createBookingApplicationUseCase.ts (alterar)
- server/domain/payment/index.ts (alterar)
- server/domain/ticketing/services/ticketingService.test.ts (alterar)
- server/domain/ticketing/services/ticketingService.ts (alterar)
- server/shared/kernel/platformFee.test.ts (criar)
- server/shared/kernel/platformFee.ts (criar)
- src/domain/favorites/components/FavoritesList.test.tsx (alterar)
- src/domain/favorites/components/FavoritesList.tsx (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/solicitacoes-agents.md — diff ===
@@ -1,22 +1,92 @@
-# Solicitações de Alteração ao AGENTS.md
+# Solicitações de alteração do AGENTS.md
 
-| ID | Seção | Resumo | Status |
+> O AGENTS.md só muda com autorização explícita do responsável do produto. Cada item abaixo diz **o que** mudaria, **por quê** e o texto proposto.
+> Resposta de 2026-10-10: aprovadas S1, S2, S3, S4, S5, S7 e S8 (aplicadas pelo prompt A1). S6 não aprovada.
+> Resposta de 2026-10-12: aprovada S9 (aplicada pelo prompt A2).
+
+| # | Seção | Motivo | Status |
 |---|---|---|---|
-| S1 | §3.2 | Permitir `react-router-dom` e outras bibliotecas | ✅ Aprovada em 2026-10-10 (prompt A1) |
-| S2 | §5.4 | Escala fixa de z-index | ✅ Aprovada em 2026-10-10 (prompt A1) |
-| S3 | §8.1 | Leituras no frontend via Firestore Client SDK | ✅ Aprovada em 2026-10-10 (prompt A1) |
-| S4 | §11.10 | Proibido hardcoding de dados aparentando ser reais | ✅ Aprovada em 2026-10-10 (prompt A1) |
-| S5 | §12.5 | Idiomas suportados e chaves de tradução | ✅ Aprovada em 2026-10-10 (prompt A1) |
+| S1 | §0 ou §15 (nova regra) | Formalizar que o AGENTS.md só muda com sua autorização | ✅ Aprovada em 2026-10-10 (prompt A1) |
+| S2 | §2 (nova regra) | Formalizar "sem código legado ou de transição antes do lançamento" | ✅ Aprovada em 2026-10-10 (prompt A1) |
+| S3 | §10.1 | Conflita com S2 antes do lançamento | ✅ Aprovada em 2026-10-10 (prompt A1) |
+| S4 | §8.2 | Erro factual nos nomes dos planos + decisão D2 | ✅ Aprovada em 2026-10-10 (prompt A1) |
+| S5 | §6.1 | Decisão D4 (upload pelo backend) | ✅ Aprovada em 2026-10-10 (prompt A1) |
 | S6 | §12.6 | Decisão D5 está em aberto; o texto atual não diz isso | ❌ Não aprovada (2026-10-10) — texto atual mantido |
 | S7 | §12.7 | Decisões D6 (URLs por idioma) e D7 (SEO no Cloud Run) | ✅ Aprovada em 2026-10-10 (prompt A1) |
 | S8 | §15 | Referenciar o registro de decisões aprovadas | ✅ Aprovada em 2026-10-10 (prompt A1) |
-| S9 | §13 | O texto cita agregadores de UseCases que o prompt 15 eliminou | ⏳ Aguardando sua decisão |
+| S9 | §13 | O texto cita agregadores de UseCases que o prompt 15 eliminou | ✅ Aprovada em 2026-10-12 (prompt A2) |
 
 ---
 
+## S1 — Alterações no AGENTS.md exigem autorização
+
+**Por quê:** você pediu que o AGENTS.md não seja alterado livremente. Hoje essa regra só existe na nossa conversa; o agente do AI Studio não a conhece e pode editar o arquivo ao executar um prompt.
+
+**Texto proposto** (novo item no início do §15):
+
+> * O AGENTS.md NÃO DEVE ser alterado por nenhum agente sem autorização explícita do responsável do produto. Para propor uma mudança, o agente DEVE descrever o texto atual, o texto proposto e o motivo, e aguardar a autorização antes de editar.
+
+## S2 — Sem código legado ou de transição antes do lançamento
+
+**Por quê:** o app está em produção, mas ainda não foi liberado para usuários. Não há dados reais a preservar, então compatibilidade com dados antigos, migrações e caminhos duplicados só aumentam a superfície de erro.
+
+**Texto proposto** (novo item 8 no §2.2):
+
+> 8. Enquanto o app não for liberado para usuários, NÃO DEVE ser criado código de compatibilidade com dados ou versões anteriores (leitura de formatos antigos, rotas duplicadas, scripts de migração, segredos ou hashes legados). Mudanças de modelo de dados são feitas diretamente, e os dados de teste podem ser recriados. Esta regra deixa de valer na data de liberação, registrada em `docs/arquitetura/decisoes.md`.
+
+## S3 — §10.1: compatibilidade com o frontend publicado
+
+**Por quê:** o texto atual exige manter compatibilidade com o frontend já publicado em toda mudança de contrato. Antes do lançamento isso gera código de transição, o que contradiz a S2.
+
+**Texto atual:**
+> * Mudança incompatível de contrato DEVE manter compatibilidade com o frontend publicado até o deploy simultâneo (Hosting e Cloud Run não sobem atomicamente).
+
+**Texto proposto:**
+> * Após a liberação para usuários, mudança incompatível de contrato DEVE manter compatibilidade com o frontend publicado até o deploy simultâneo (Hosting e Cloud Run não sobem atomicamente). Antes da liberação, vale o §2.2 item 8.
+
+## S4 — §8.2: planos do parceiro
+
+**Por quê:** o texto atual cita "mensal/trimestral/semestral", mas os planos reais no código são `monthly`, `semi-annual` e `annual` (não existe trimestral). Além disso, a decisão D2 já definiu o modelo.
+
+**Texto atual:**
+> | Plano do parceiro (mensal/trimestral/semestral) | **Stripe Billing (Subscriptions)** é o alvo. O pagamento avulso por PaymentIntent atual é débito registrado: não há renovação automática nem cobrança recorrente |
+
+**Texto proposto:**
+> | Plano do parceiro (`monthly`, `semi-annual`, `annual`) | **Stripe Billing (Subscriptions)** no cartão, com renovação automática (decisão D2). Alternativa: pagamento único por Pix, sem renovação, concedendo exatamente a duração do plano |
+
+## S5 — §6.1: upload de arquivos
+
+**Por quê:** a decisão D4 definiu o upload pelo backend para o Firebase Storage. O texto atual ainda admite "URL assinada" como alternativa e trata o Cloudinary como débito aceito.
+
+**Texto proposto:**
+> * Upload de arquivo também é escrita: DEVE passar pelo backend (`POST /api/media/images`), que valida, remove metadados e grava no Firebase Storage (decisão D4). Upload direto do navegador para qualquer provedor é proibido.
+
+## S6 — §12.6: tradução automática (D5 em aberto)
+
+**Por quê:** a D5 está em aberto, e o texto atual não proíbe a implementação enquanto você não decide. Sem essa linha, o agente do AI Studio pode implementar a tradução por conta própria.
+
+**Texto proposto** (substitui o início do item "Tradução automática"):
+> * **Tradução automática** de conteúdo de parceiros (ex: com Gemini via `@google/genai`) é a decisão **D5, em aberto**: até a aprovação, NÃO implementar nenhuma chamada de tradução automática. Se adotada, …(mantém o restante do texto atual)
+
+## S7 — §12.7: URLs por idioma e SEO
+
+**Por quê:** as decisões D6 e D7 foram aprovadas. O texto atual deixa a estratégia de URL "em aberto" e descreve como fato que o SEO do servidor não roda em produção, o que deixará de ser verdade após o prompt 8.
+
+**Texto proposto** (substitui o 1º e o 3º itens do §12.7):
+> * Cada idioma indexável DEVE ter URL própria (decisão D6): português na raiz, `en` e `fr` em pastas com slugs traduzidos (`/eventos`, `/en/events`, `/fr/evenements`). A fonte única do mapa é `src/shared/i18n/localizedRoutes.ts`, espelhada em `server/shared/kernel/localizedRoutes.ts` com teste de paridade. A URL tem prioridade sobre o idioma salvo no navegador.
+>
+> * O HTML das rotas de conteúdo DEVE passar pelo Cloud Run (`serverSeoService`), com cache na CDN do Hosting (`s-maxage=300`) e `sitemap.xml` dinâmico (decisão D7). A home `/` é servida estática pelo Hosting: seus metadados e `hreflang` ficam no `index.html`.
+
+## S8 — §15: registro de decisões
+
+**Por quê:** sem a referência, o agente do AI Studio não sabe que existem decisões já aprovadas (D1–D7) nem que a D5 está em aberto.
+
+**Texto proposto** (novo item no §15):
+> * Decisões já aprovadas estão em `docs/arquitetura/decisoes.md` e DEVEM ser seguidas sem nova consulta. Decisão marcada como **em aberto** NÃO pode ser implementada.
+
 ## S9 — §13: agregadores de UseCases já eliminados
 
-**Por quê:** o prompt 15 dividiu todos os agregadores em um UseCase por arquivo. O §13 ainda diz que `eventUseCases.ts`, `ticketingUseCases.ts` e `paymentUseCases.ts` existem e são débito. Um agente que leia isso pode procurar esses arquivos ou recriá-los.
+**Por quê:** o prompt 15 dividiu todos os arquivos agregadores em um UseCase por arquivo. O §13 ainda diz que `eventUseCases.ts`, `ticketingUseCases.ts` e `paymentUseCases.ts` existem e são débito. Um agente que leia isso pode procurar esses arquivos ou recriá-los.
 
 **Texto atual:**
 > * **Um UseCase por arquivo** (`createBookingUseCase.ts`). Arquivos agregadores existentes (`eventUseCases.ts`, `ticketingUseCases.ts`, `paymentUseCases.ts`) são débito: novos UseCases não entram neles.

=== functions/package.json — diff ===
@@ -7,6 +7,7 @@
     "deploy": "firebase deploy --only functions"
   },
   "dependencies": {
+    "firebase-admin": "^14.5.0",
     "firebase-functions": "^7.4.0"
   },
   "devDependencies": {

=== server/application/usecases/bookings/createBookingApplicationUseCase.ts — diff ===
@@ -5,6 +5,7 @@ import {
   createPendingBookingUseCase,
 } from '../../../domain/bookings';
 import { createMarketplacePaymentIntentUseCase } from '../../../domain/payment';
+import { resolvePlatformFeePercent } from '../../../shared/kernel/platformFee';
 
 export interface BookingBuyer {
   uid: string;
@@ -29,9 +30,7 @@ export async function createBookingApplicationUseCase(
   if (!buyer.emailVerified) {
     throw new BookingDomainError('EMAIL_NOT_VERIFIED', 'Confirme seu e-mail antes de reservar.');
   }
-  const rawFee = process.env.USE_GUIDE_PLATFORM_FEE_PERCENT;
-  const parsedFee = rawFee ? Number(String(rawFee).replace('%', '').trim()) : 10;
-  const platformFeePercent = Number.isFinite(parsedFee) ? parsedFee : 10;
+  const platformFeePercent = resolvePlatformFeePercent();
   const booking = await createPendingBookingUseCase(
     { uid: buyer.uid, admin: buyer.admin },
     input,

=== server/domain/payment/index.ts — diff ===
@@ -46,8 +46,3 @@ export type {
   RefundPaymentResult,
   VerifiedWebhookEvent,
 } from './ports/paymentGatewayPort';
-export type {
-  TransactionRecord,
-  TransactionRepositoryPort,
-  WebhookEventClaimResult,
-} from './ports/transactionRepositoryPort';

=== server/domain/ticketing/services/ticketingService.test.ts — diff ===
@@ -171,8 +171,6 @@ describe('TicketingService', () => {
       }),
     };
 
-    process.env.USE_GUIDE_PLATFORM_FEE_PERCENT = '10';
-
     service = new TicketingService(mockPort, mockQrTokenPort);
   });

=== server/domain/ticketing/services/ticketingService.ts — diff ===
@@ -16,6 +16,7 @@ import {
 } from '../errors/ticketingDomainError';
 import type { TicketQrTokenPort } from '../ports/ticketQrTokenPort';
 import type { TicketingPort } from '../ports/ticketingPort';
+import { resolvePlatformFeePercent } from '../../../shared/kernel/platformFee';
 import {
   assertMoneyMinor,
   canTransitionOrderStatus,
@@ -639,9 +640,7 @@ export class TicketingService {
     }
 
     const netSubtotalMinor = Math.max(0, subtotalMinor - discountMinor);
-    const rawFee = process.env.USE_GUIDE_PLATFORM_FEE_PERCENT;
-    const parsedFee = rawFee ? Number(String(rawFee).replace('%', '').trim()) : 10;
-    const feePercent = Number.isFinite(parsedFee) ? parsedFee : 10;
+    const feePercent = resolvePlatformFeePercent();
     const platformFeeMinor =
       netSubtotalMinor > 0 && feePercent > 0
         ? Math.round((netSubtotalMinor * feePercent) / 100)

=== server/shared/kernel/platformFee.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { resolvePlatformFeePercent } from './platformFee';

describe('resolvePlatformFeePercent', () => {
  it('usa 10% quando a variável não está configurada', () => {
    expect(resolvePlatformFeePercent(undefined)).toBe(10);
    expect(resolvePlatformFeePercent('')).toBe(10);
  });

  it('aceita o número com ou sem o símbolo de porcentagem', () => {
    expect(resolvePlatformFeePercent('12')).toBe(12);
    expect(resolvePlatformFeePercent(' 7.5% ')).toBe(7.5);
    expect(resolvePlatformFeePercent('0')).toBe(0);
  });

  it('falha com valor inválido em vez de cobrar uma taxa padrão', () => {
    expect(() => resolvePlatformFeePercent('dez')).toThrow('USE_GUIDE_PLATFORM_FEE_PERCENT');
    expect(() => resolvePlatformFeePercent('150')).toThrow();
    expect(() => resolvePlatformFeePercent('-1')).toThrow();
  });
});

=== server/shared/kernel/platformFee.ts — ARQUIVO NOVO, conteúdo completo ===
const DEFAULT_PLATFORM_FEE_PERCENT = 10;

/**
 * Taxa da plataforma (AGENTS.md §8.1), lida de `USE_GUIDE_PLATFORM_FEE_PERCENT`.
 * Sem valor configurado vale o padrão de 10%; valor inválido falha na chamada (§2.2.4)
 * em vez de cobrar uma taxa que ninguém configurou.
 */
export function resolvePlatformFeePercent(
  raw: string | undefined = process.env.USE_GUIDE_PLATFORM_FEE_PERCENT
): number {
  const trimmed = (raw ?? '').replace('%', '').trim();
  if (trimmed === '') return DEFAULT_PLATFORM_FEE_PERCENT;
  const percent = Number(trimmed);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new Error('USE_GUIDE_PLATFORM_FEE_PERCENT deve ser um número entre 0 e 100.');
  }
  return percent;
}

=== src/domain/favorites/components/FavoritesList.test.tsx — diff ===
@@ -58,13 +58,7 @@ describe('FavoritesList', () => {
     expect(screen.getByText('Passeio Lagoa do Paraíso')).toBeTruthy();
     fireEvent.click(screen.getByText('Passeio Lagoa do Paraíso'));
 
-    expect(onSelectItem).toHaveBeenCalledWith(
-      expect.objectContaining({
-        id: 'item-123',
-        category: 'tour',
-        name: 'Passeio Lagoa do Paraíso',
-      })
-    );
+    expect(onSelectItem).toHaveBeenCalledWith({ id: 'item-123', category: 'tour' });
   });
 
   it('chama removeFavoriteItem ao clicar no botão de remover', () => {

=== src/domain/favorites/components/FavoritesList.tsx — diff ===
@@ -4,12 +4,16 @@ import { useTranslation } from 'react-i18next';
 import { Heart, ChevronLeft, MapPin, Star, Trash2 } from 'lucide-react';
 import { useFavorites } from '../hooks/useFavorites';
 import { FavoriteItem } from '../types/favorite';
-import { GuideItem } from '../../guide';
 import { Skeleton } from '../../../ui/components/Skeleton';
 
+export interface FavoriteSelection {
+  id: string;
+  category: string;
+}
+
 interface FavoritesListProps {
   onBack: () => void;
-  onSelectItem?: ((item: GuideItem) => void) | undefined;
+  onSelectItem?: ((item: FavoriteSelection) => void) | undefined;
 }
 
 export function FavoritesList({ onBack, onSelectItem }: FavoritesListProps) {
@@ -18,18 +22,10 @@ export function FavoritesList({ onBack, onSelectItem }: FavoritesListProps) {
 
   const handleCardClick = (fav: FavoriteItem) => {
     if (!onSelectItem) return;
+    // A composição só precisa do id e da categoria: o detalhe é lido do catálogo pela URL.
     const category =
-      fav.itemCollection === 'events' ? 'event' : (fav.itemDetails?.category || 'sight');
-    onSelectItem({
-      id: fav.itemId,
-      category,
-      name: fav.itemDetails?.name || '',
-      description: fav.itemDetails?.description || '',
-      image: fav.itemDetails?.image || '',
-      location: (fav.itemDetails?.location as any) || 'jeri',
-      ownerId: fav.partnerId || '',
-      rating: fav.itemDetails?.rating,
-    } as GuideItem);
+      fav.itemCollection === 'events' ? 'event' : fav.itemDetails?.category || 'sight';
+    onSelectItem({ id: fav.itemId, category });
   };
 
   return (

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros), `npm test` → 129 arquivos, 764 testes, `npm run build`.
Responda no formato do AGENTS.md §16.3.
~~~~
