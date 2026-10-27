# Prompt 20.5 — Denúncia de resposta e aba Moderação (D19)

> Lote 17, gerado dos commits de referência `423dc03`, `216d5cf` e `2dabeed` da branch `claude/agents-md-v2`. Aplique depois do 20.4. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 20.5 — Denúncia de resposta e aba Moderação

Telas aprovadas em 2026-10-27 (prints reais). Recurso novo com coleção só de backend, rota autenticada e fila do admin (D19).

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e os apagados. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

O QUE MUDA (D19):
1) Backend (server/domain/reviews): coleção `reviewReports`, só de backend (regra `allow read, write: if false`, com teste). O autor da avaliação denuncia a resposta do estabelecimento (POST /api/review-reports) com motivo fechado (offensive, fraud, personal_data, other) e relato opcional de até 500 caracteres. Uma denúncia por resposta (ID com hash do texto), no máximo 5 por pessoa em 24 h (contadas no Firestore), prazo de análise de 3 dias. GET /api/review-reports/mine devolve o status das próprias denúncias.
2) Admin: GET /api/admin/review-reports (fila paginada, sem quem denunciou) e POST /api/admin/review-reports/:reportId/decision com outcome `upheld` (remove a resposta, na mesma transação, se ainda for o texto denunciado) ou `dismissed` (mantém). Log de auditoria na decisão. Erros com `code` estável (§10.2). A exclusão de conta passa a apagar também as denúncias da pessoa.
3) Frontend: "Denunciar resposta" no menu "…" de Minhas avaliações (só quando há resposta e não há denúncia aberta ou recusada), folha com os motivos e o status da denúncia no cartão. Aba nova Moderação no painel do admin (slot renderModerationQueue), com Remover resposta (com confirmação) e Manter resposta.
4) Minhas avaliações agrupadas pelo dia da avaliação (o ano só quando não é o atual) e confirmação de excluir com título "Excluir esta avaliação?" e o texto "A ação é definitiva e não poderá ser recuperada.".
5) docs: débito B34 (backend antigo de avaliações).

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- firestore.indexes.json (alterar)
- firestore.rules (alterar)
- firestore.rules.security.test.ts (alterar)
- server.ts (alterar)
- server/domain/reviews/adapters/firestoreReviewReportAdapter.ts (criar)
- server/domain/reviews/adapters/inMemoryReviewReportAdapter.ts (criar)
- server/domain/reviews/controllers/reviewReportController.test.ts (criar)
- server/domain/reviews/controllers/reviewReportController.ts (criar)
- server/domain/reviews/errors/reviewReportError.ts (criar)
- server/domain/reviews/factory.ts (alterar)
- server/domain/reviews/index.ts (alterar)
- server/domain/reviews/ports/reviewReportPort.ts (criar)
- server/domain/reviews/routes/reviewReportRoutes.ts (criar)
- server/domain/reviews/schemas/reviewReportSchemas.ts (criar)
- server/domain/reviews/services/reviewReportService.test.ts (criar)
- server/domain/reviews/services/reviewReportService.ts (criar)
- server/domain/reviews/types/reviewReport.ts (criar)
- server/domain/reviews/usecases/decideReviewReportUseCase.ts (criar)
- server/domain/reviews/usecases/deleteReviewsByUserUseCase.ts (alterar)
- server/domain/reviews/usecases/listMyReviewReportsUseCase.ts (criar)
- server/domain/reviews/usecases/listOpenReviewReportsUseCase.ts (criar)
- server/domain/reviews/usecases/reportReviewResponseUseCase.ts (criar)
- server/domain/reviews/utils/reviewReportId.ts (criar)
- src/app/compositions/AdminPanelComposition.tsx (alterar)
- src/domain/admin/components/AdminPanel.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminNavigation.tsx (alterar)
- src/domain/reviews/adapters/httpReviewReportAdapter.ts (criar)
- src/domain/reviews/application/usecases/decideReviewReportUseCase.ts (criar)
- src/domain/reviews/application/usecases/listMyReviewReportsUseCase.ts (criar)
- src/domain/reviews/application/usecases/listOpenReviewReportsUseCase.ts (criar)
- src/domain/reviews/application/usecases/reportReviewResponseUseCase.ts (criar)
- src/domain/reviews/components/mine/MyReviewCard.tsx (alterar)
- src/domain/reviews/components/mine/MyReviewsView.test.tsx (alterar)
- src/domain/reviews/components/mine/MyReviewsView.tsx (alterar)
- src/domain/reviews/components/mine/ReportResponseSheet.tsx (criar)
- src/domain/reviews/components/moderation/ReviewModerationQueue.test.tsx (criar)
- src/domain/reviews/components/moderation/ReviewModerationQueue.tsx (criar)
- src/domain/reviews/factory.ts (alterar)
- src/domain/reviews/hooks/useMyReviewReports.ts (criar)
- src/domain/reviews/hooks/useReviewModerationQueue.ts (criar)
- src/domain/reviews/index.ts (alterar)
- src/domain/reviews/ports/reviewReportApiPort.ts (criar)
- src/domain/reviews/types/reviewReport.ts (criar)
- src/shared/i18n/profileResources.ts (alterar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/i18n/reviewReportsResources.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -23,6 +23,7 @@
 | B31 | `src/domain/ticketing/components/manager/*` (abas do painel de ingressos: vendas, participantes, check-in, reembolsos; lotes e barra de abas já com tokens no 18.4e.3) e `hooks/useTicketLotForm.ts`, `hooks/useOfflineCheckIn.ts` | §12 (texto fixo em português, sem `useTranslation`) e §11.1 (cores fixas do tema escuro, `text-white`, `bg-black/40`) | médio — no tema claro dependem das sobrescritas globais (B25) e em `en`/`fr` aparecem em português | 19.x: chaves no namespace do ingresso e tokens `--ug-*`, aba por aba; a divisão do 18.4e.3.0 deixou cada aba num arquivo |
 | B32 | `src/domain/admin/components/AdminPanel.tsx`, `AdminDispatcher.tsx`, `subcomponents/*` (abas Relatórios, Parceiros, Guia Local, Agenda, Planos e Avisos, navegação e acesso negado) | §12 (texto fixo em português) e §11.1 (cores fixas do tema escuro, `bg-[#020508]`, `text-white/50`) | médio — painel só de admin, mas no tema claro depende das sobrescritas globais (B25) e em `en`/`fr` aparece em português | 19.x: namespace `admin` e tokens `--ug-*`; as abas Verificações e Financeiro já seguem o padrão |
 | B33 | telas ainda não levadas ao visual D17 (cerca de 15 arquivos com `Intl.DateTimeFormat` próprio no fuso de Fortaleza e botões com classes escritas à mão) | §13 (um lugar só para cada regra) e §11.1 | baixo — o comportamento está certo, mas cada tela repete a mesma formatação e o mesmo botão | ao levar cada tela ao visual D17, usar `src/ui/styles/controls.ts`, `src/ui/components/ListState.tsx` e `formatBusiness*` de `src/shared/utils/businessDateTime.ts` (20.2) |
+| B34 | `server/domain/reviews/controllers/reviewController.ts` e `adapters/firestoreReviewAdapter.ts` (avaliar, responder, excluir) | §10.2 (devolve `err.message` e erro sem `code`) e §9.4 (nota do lugar recalculada fora de transação ao excluir) | médio — mensagem interna pode vazar ao cliente e duas exclusões ao mesmo tempo podem deixar a nota errada | erros tipados com `code` estável como em `reviewReportError.ts`, e recálculo da nota na mesma transação da exclusão; a denúncia (20.5) já segue o padrão novo |
 
 ## Resolvidos

=== firestore.indexes.json — diff ===
@@ -429,6 +429,34 @@
           "order": "DESCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "reviewReports",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "reporterUid",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "createdAt",
+          "order": "DESCENDING"
+        }
+      ]
+    },
+    {
+      "collectionGroup": "reviewReports",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "status",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "createdAt",
+          "order": "ASCENDING"
+        }
+      ]
     }
   ],
   "fieldOverrides": [

=== firestore.rules — diff ===
@@ -115,6 +115,10 @@ service cloud.firestore {
       allow read: if true;
       allow write: if false;
     }
+    // Denúncias de resposta (D19): só o backend lê e grava; quem denunciou não é exposto.
+    match /reviewReports/{reportId} {
+      allow read, write: if false;
+    }
     match /partners/{partnerId} {
       allow read:
         if isAuthenticated() &&

=== firestore.rules.security.test.ts — diff ===
@@ -391,6 +391,15 @@ describe('Firestore Rules — Security Suite', () => {
       }
     });
 
+    it('denúncia de resposta (D19): reviewReports negado até para o autor e admin', async () => {
+      const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
+      const authorDb = testEnv.authenticatedContext('user-1').firestore();
+      for (const db of [adminDb, authorDb]) {
+        await assertFails(getDoc(doc(db, 'reviewReports/items_x_user-1__abc')));
+        await assertFails(setDoc(doc(db, 'reviewReports/items_x_user-1__abc'), { reporterUid: 'user-1' }));
+      }
+    });
+
     it('plano (D11): listingPlans negado até para o dono e admin', async () => {
       const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
       const ownerDb = testEnv.authenticatedContext('partner-1').firestore();

=== server.ts — diff ===
@@ -15,6 +15,10 @@ import ticketingRouter, {
 } from './server/domain/ticketing/routes/ticketingRoutes';
 import { TicketingController } from './server/domain/ticketing/controllers/ticketingController';
 import reviewRouter from './server/domain/reviews/routes/reviewRoutes';
+import {
+  adminReviewReportRouter,
+  reviewReportRouter,
+} from './server/domain/reviews/routes/reviewReportRoutes';
 import insightsRouter from './server/domain/insights/routes/insightsRoutes';
 import adminRouter from './server/domain/admin/routes/adminRoutes';
 import favoriteRouter from './server/domain/favorites/routes/favoriteRoutes';
@@ -219,6 +223,8 @@ async function startServer() {
   app.use('/api/admin/events', adminTicketingEventsRouter);
   app.use('/api/ticketing', ticketingRouter);
   app.use('/api/reviews', reviewRouter);
+  app.use('/api/review-reports', reviewReportRouter);
+  app.use('/api/admin/review-reports', adminReviewReportRouter);
   app.use('/api/insights/stats', listingStatsRouter);
   app.use('/api/insights', insightsRouter);
   app.use('/api/admin', adminRouter);

=== server/domain/reviews/adapters/firestoreReviewReportAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { getEventListingByIdUseCase } from '../../events';
import { getItemByIdUseCase } from '../../guide';
import type { ReviewReportRepositoryPort } from '../ports/reviewReportPort';
import type { ReviewForReport, ReviewReport } from '../types/reviewReport';

const REPORTS = 'reviewReports';
const REVIEWS = 'reviews';
const DELETE_BATCH = 400;

/** Coleção só de backend (`allow read, write: if false`, AGENTS.md §6.2). */
export class FirestoreReviewReportAdapter implements ReviewReportRepositoryPort {
  async getReview(reviewId: string): Promise<ReviewForReport | null> {
    const snapshot = await adminDb.collection(REVIEWS).doc(reviewId).get();
    if (!snapshot.exists) return null;
    const data = snapshot.data() ?? {};
    return {
      id: snapshot.id,
      userId: String(data.userId ?? ''),
      itemId: String(data.itemId ?? ''),
      itemCollection: data.itemCollection === 'events' ? 'events' : 'items',
      rating: typeof data.rating === 'number' ? data.rating : 0,
      comment: typeof data.comment === 'string' ? data.comment : '',
      partnerResponse: typeof data.partnerResponse === 'string' ? data.partnerResponse : null,
      responderId: typeof data.responderId === 'string' ? data.responderId : null,
    };
  }

  async placeNameOf(itemId: string, itemCollection: 'items' | 'events'): Promise<string | null> {
    if (itemCollection === 'events') {
      const event = await getEventListingByIdUseCase(itemId);
      return event?.title || event?.name || null;
    }
    return (await getItemByIdUseCase(itemId))?.name || null;
  }

  async countByReporterSince(reporterUid: string, sinceIso: string): Promise<number> {
    const snapshot = await adminDb
      .collection(REPORTS)
      .where('reporterUid', '==', reporterUid)
      .where('createdAt', '>=', sinceIso)
      .count()
      .get();
    return snapshot.data().count;
  }

  async createIfAbsent(report: ReviewReport): Promise<{ report: ReviewReport; created: boolean }> {
    const ref = adminDb.collection(REPORTS).doc(report.id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (snapshot.exists) return { report: snapshot.data() as ReviewReport, created: false };
      tx.set(ref, report);
      return { report, created: true };
    });
  }

  async listByReporter(reporterUid: string, limit: number): Promise<ReviewReport[]> {
    const snapshot = await adminDb
      .collection(REPORTS)
      .where('reporterUid', '==', reporterUid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as ReviewReport);
  }

  async listOpen(limit: number, cursor?: string): Promise<ReviewReport[]> {
    let query = adminDb
      .collection(REPORTS)
      .where('status', '==', 'open')
      .orderBy('createdAt', 'asc')
      .limit(limit);
    if (cursor) {
      const last = await adminDb.collection(REPORTS).doc(cursor).get();
      if (last.exists) query = query.startAfter(last);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as ReviewReport);
  }

  async decide(
    id: string,
    change: (current: ReviewReport) => ReviewReport,
    removeResponse: boolean
  ): Promise<ReviewReport | null> {
    const ref = adminDb.collection(REPORTS).doc(id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (!snapshot.exists) return null;
      const current = snapshot.data() as ReviewReport;
      const reviewRef = adminDb.collection(REVIEWS).doc(current.reviewId);
      const review = removeResponse ? await tx.get(reviewRef) : null;
      const next = change(current);
      // Só remove se a resposta ainda é a denunciada: uma resposta nova não passou pela análise.
      const sameResponse =
        review?.exists === true &&
        typeof review.data()?.partnerResponse === 'string' &&
        String(review.data()?.partnerResponse).trim() === current.responseText;
      if (sameResponse) {
        tx.update(reviewRef, {
          partnerResponse: FieldValue.delete(),
          respondedAt: FieldValue.delete(),
          responderId: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      const saved = removeResponse ? { ...next, responseRemoved: sameResponse } : next;
      tx.set(ref, saved);
      return saved;
    });
  }

  async deleteByReporter(reporterUid: string): Promise<void> {
    for (;;) {
      const snapshot = await adminDb
        .collection(REPORTS)
        .where('reporterUid', '==', reporterUid)
        .limit(DELETE_BATCH)
        .get();
      if (snapshot.empty) return;
      const batch = adminDb.batch();
      for (const doc of snapshot.docs) batch.delete(doc.ref);
      await batch.commit();
    }
  }
}

=== server/domain/reviews/adapters/inMemoryReviewReportAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ReviewReportRepositoryPort } from '../ports/reviewReportPort';
import type { ReviewForReport, ReviewReport } from '../types/reviewReport';

/** Só para testes: o mesmo contrato do adapter do Firestore, em memória. */
export class InMemoryReviewReportAdapter implements ReviewReportRepositoryPort {
  readonly reviews = new Map<string, ReviewForReport>();
  readonly reports = new Map<string, ReviewReport>();

  async getReview(reviewId: string) {
    return this.reviews.get(reviewId) ?? null;
  }

  async placeNameOf() {
    return 'Restaurante Tamarindo';
  }

  async countByReporterSince(reporterUid: string, sinceIso: string) {
    return [...this.reports.values()].filter(
      (report) => report.reporterUid === reporterUid && report.createdAt >= sinceIso
    ).length;
  }

  async createIfAbsent(report: ReviewReport) {
    const existing = this.reports.get(report.id);
    if (existing) return { report: existing, created: false };
    this.reports.set(report.id, report);
    return { report, created: true };
  }

  async listByReporter(reporterUid: string, limit: number) {
    return [...this.reports.values()]
      .filter((report) => report.reporterUid === reporterUid)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async listOpen(limit: number) {
    return [...this.reports.values()]
      .filter((report) => report.status === 'open')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(0, limit);
  }

  async decide(
    id: string,
    change: (current: ReviewReport) => ReviewReport,
    removeResponse: boolean
  ) {
    const current = this.reports.get(id);
    if (!current) return null;
    const next = change(current);
    const review = this.reviews.get(current.reviewId);
    const sameResponse = removeResponse && review?.partnerResponse?.trim() === current.responseText;
    if (sameResponse && review) {
      this.reviews.set(review.id, { ...review, partnerResponse: null, responderId: null });
    }
    const saved = removeResponse ? { ...next, responseRemoved: sameResponse } : next;
    this.reports.set(id, saved);
    return saved;
  }

  async deleteByReporter(reporterUid: string) {
    for (const [id, report] of this.reports) {
      if (report.reporterUid === reporterUid) this.reports.delete(id);
    }
  }
}

=== server/domain/reviews/controllers/reviewReportController.test.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ report: vi.fn(), mine: vi.fn(), open: vi.fn(), decide: vi.fn() }));
vi.mock('../usecases/reportReviewResponseUseCase', () => ({
  reportReviewResponseUseCase: m.report,
}));
vi.mock('../usecases/listMyReviewReportsUseCase', () => ({ listMyReviewReportsUseCase: m.mine }));
vi.mock('../usecases/listOpenReviewReportsUseCase', () => ({
  listOpenReviewReportsUseCase: m.open,
}));
vi.mock('../usecases/decideReviewReportUseCase', () => ({ decideReviewReportUseCase: m.decide }));

import { ReviewReportError } from '../errors/reviewReportError';
import { ReviewReportController } from './reviewReportController';

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}
const AUTHOR = { uid: 'u1', admin: false, emailVerified: true, authTime: 0 };
const ADMIN = { uid: 'admin-1', admin: true, emailVerified: true, authTime: 0 };
const request = (overrides: Partial<AuthenticatedRequest>) =>
  ({
    query: {},
    body: {},
    params: {},
    user: AUTHOR,
    ...overrides,
  }) as never as AuthenticatedRequest;

describe('ReviewReportController (D19)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('denunciar: sem login 401; motivo fora da lista ou campo extra 400; uid vem do token', async () => {
    const anonymous = response();
    await ReviewReportController.report(
      request({ user: undefined }),
      anonymous as unknown as Response
    );
    expect(anonymous.status).toHaveBeenCalledWith(401);
    for (const body of [
      { reviewId: 'r1', reason: 'spam' },
      { reviewId: 'r1', reason: 'offensive', reporterUid: 'outra' },
    ]) {
      const res = response();
      await ReviewReportController.report(request({ body }), res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    }
    m.report.mockResolvedValue({ id: 'x', status: 'open' });
    const ok = response();
    await ReviewReportController.report(
      request({ body: { reviewId: 'r1', reason: 'offensive' } }),
      ok as unknown as Response
    );
    expect(m.report).toHaveBeenCalledWith('u1', {
      reviewId: 'r1',
      reason: 'offensive',
      details: undefined,
    });
    expect(ok.status).toHaveBeenCalledWith(201);
  });

  it('erro do domínio sai com o código estável', async () => {
    m.report.mockRejectedValue(new ReviewReportError('REPORT_LIMIT_REACHED', 'Limite.'));
    const res = response();
    await ReviewReportController.report(
      request({ body: { reviewId: 'r1', reason: 'other' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'REPORT_LIMIT_REACHED', message: 'Limite.' },
    });
  });

  it('fila e decisão só para admin; a fila não mostra quem denunciou', async () => {
    const denied = response();
    await ReviewReportController.listOpen(request({}), denied as unknown as Response);
    expect(denied.status).toHaveBeenCalledWith(403);
    m.open.mockResolvedValue([
      { id: 'rep1', reporterUid: 'u1', responseText: 'x', status: 'open' },
    ]);
    const res = response();
    await ReviewReportController.listOpen(request({ user: ADMIN }), res as unknown as Response);
    const payload = res.json.mock.calls[0]?.[0];
    expect(payload.data[0]).not.toHaveProperty('reporterUid');
    const notAdmin = response();
    await ReviewReportController.decide(
      request({ params: { reportId: 'rep1' }, body: { outcome: 'upheld' } }),
      notAdmin as unknown as Response
    );
    expect(notAdmin.status).toHaveBeenCalledWith(403);
    m.decide.mockResolvedValue({ id: 'rep1', status: 'upheld', responseRemoved: true });
    const decided = response();
    await ReviewReportController.decide(
      request({ user: ADMIN, params: { reportId: 'rep1' }, body: { outcome: 'upheld' } }),
      decided as unknown as Response
    );
    expect(m.decide).toHaveBeenCalledWith('admin-1', 'rep1', 'upheld');
    expect(decided.status).toHaveBeenCalledWith(200);
  });
});

=== server/domain/reviews/controllers/reviewReportController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { ReviewReportError } from '../errors/reviewReportError';
import {
  DecideReviewReportSchema,
  ListReviewReportsQuerySchema,
  ReportReviewResponseSchema,
  ReviewReportParamsSchema,
} from '../schemas/reviewReportSchemas';
import { decideReviewReportUseCase } from '../usecases/decideReviewReportUseCase';
import { listMyReviewReportsUseCase } from '../usecases/listMyReviewReportsUseCase';
import { listOpenReviewReportsUseCase } from '../usecases/listOpenReviewReportsUseCase';
import { reportReviewResponseUseCase } from '../usecases/reportReviewResponseUseCase';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof ReviewReportError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[ReviewReportController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível concluir a operação.');
}

export class ReviewReportController {
  static async report(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const body = ReportReviewResponseSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Denúncia inválida.');
    try {
      const report = await reportReviewResponseUseCase(req.user.uid, {
        ...body.data,
        details: body.data.details || undefined,
      });
      return res.status(201).json({ data: report });
    } catch (error) {
      return handleError(res, error, 'report');
    }
  }

  static async listMine(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      return res.status(200).json({ data: await listMyReviewReportsUseCase(req.user.uid) });
    } catch (error) {
      return handleError(res, error, 'listMine');
    }
  }

  static async listOpen(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const query = ListReviewReportsQuerySchema.safeParse(req.query);
    if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Consulta inválida.');
    try {
      const reports = await listOpenReviewReportsUseCase(query.data.limit, query.data.cursor);
      const last = reports.at(-1);
      // Quem denunciou não sai nem para o admin: a fila não precisa saber (D19, AGENTS.md §7.9).
      const data = reports.map(
        ({ reporterUid: _reporter, decidedBy: _admin, ...report }) => report
      );
      return res.status(200).json({
        data,
        nextCursor: last && reports.length === query.data.limit ? last.id : null,
      });
    } catch (error) {
      return handleError(res, error, 'listOpen');
    }
  }

  static async decide(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const params = ReviewReportParamsSchema.safeParse(req.params);
    const body = DecideReviewReportSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Decisão inválida.');
    }
    try {
      const report = await decideReviewReportUseCase(
        req.user.uid,
        params.data.reportId,
        body.data.outcome
      );
      console.info('[audit] review_report_decided', {
        reportId: report.id,
        adminUid: req.user.uid,
        outcome: body.data.outcome,
        responseRemoved: report.responseRemoved === true,
      });
      return res.status(200).json({
        data: {
          id: report.id,
          status: report.status,
          responseRemoved: report.responseRemoved === true,
        },
      });
    } catch (error) {
      return handleError(res, error, 'decide');
    }
  }
}

=== server/domain/reviews/errors/reviewReportError.ts — ARQUIVO NOVO, conteúdo completo ===
export type ReviewReportErrorCode =
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'NO_RESPONSE_TO_REPORT'
  | 'ALREADY_REPORTED'
  | 'ALREADY_DECIDED'
  | 'REPORT_LIMIT_REACHED';

const STATUS: Record<ReviewReportErrorCode, number> = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  NO_RESPONSE_TO_REPORT: 422,
  ALREADY_REPORTED: 409,
  ALREADY_DECIDED: 409,
  REPORT_LIMIT_REACHED: 429,
};

export class ReviewReportError extends Error {
  readonly statusCode: number;

  constructor(
    public readonly code: ReviewReportErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'ReviewReportError';
    this.statusCode = STATUS[code];
  }
}

=== server/domain/reviews/factory.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { FirestoreReviewAdapter } from './adapters/firestoreReviewAdapter';
import { FirestoreReviewReportAdapter } from './adapters/firestoreReviewReportAdapter';
import { ReviewNotificationAdapter } from './adapters/reviewNotificationAdapter';
import { ReviewReportService } from './services/reviewReportService';
import { ReviewService } from './services/reviewService';

const reviewAdapter = new FirestoreReviewAdapter();
const reviewNotificationAdapter = new ReviewNotificationAdapter();

export const reviewService = new ReviewService(reviewAdapter, reviewNotificationAdapter);
export const reviewReportService = new ReviewReportService(new FirestoreReviewReportAdapter());

=== server/domain/reviews/index.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
export { deleteReviewsByUserUseCase } from './usecases/deleteReviewsByUserUseCase';
export { getReviewsStatsUseCase } from './usecases/getReviewsStatsUseCase';
export { reportReviewResponseUseCase } from './usecases/reportReviewResponseUseCase';
export { listMyReviewReportsUseCase } from './usecases/listMyReviewReportsUseCase';
export { listOpenReviewReportsUseCase } from './usecases/listOpenReviewReportsUseCase';
export { decideReviewReportUseCase } from './usecases/decideReviewReportUseCase';
export { ReviewReportError } from './errors/reviewReportError';
export { REVIEW_REPORT_REASONS } from './types/reviewReport';
export type { MyReviewReport, ReviewReport, ReviewReportOutcome } from './types/reviewReport';

=== server/domain/reviews/ports/reviewReportPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ReviewForReport, ReviewReport } from '../types/reviewReport';

export interface ReviewReportRepositoryPort {
  getReview(reviewId: string): Promise<ReviewForReport | null>;
  placeNameOf(itemId: string, itemCollection: 'items' | 'events'): Promise<string | null>;
  countByReporterSince(reporterUid: string, sinceIso: string): Promise<number>;
  /** Grava se ainda não existe; devolve o que ficou gravado e se foi agora. */
  createIfAbsent(report: ReviewReport): Promise<{ report: ReviewReport; created: boolean }>;
  listByReporter(reporterUid: string, limit: number): Promise<ReviewReport[]>;
  listOpen(limit: number, cursor?: string): Promise<ReviewReport[]>;
  /**
   * Aplica a decisão numa transação: `change` devolve o novo estado (ou lança); com `removeResponse`,
   * a resposta sai da avaliação se ainda for o texto denunciado.
   */
  decide(
    id: string,
    change: (current: ReviewReport) => ReviewReport,
    removeResponse: boolean
  ): Promise<ReviewReport | null>;
  deleteByReporter(reporterUid: string): Promise<void>;
}

=== server/domain/reviews/routes/reviewReportRoutes.ts — ARQUIVO NOVO, conteúdo completo ===
import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { ReviewReportController } from '../controllers/reviewReportController';

export const reviewReportRouter = Router();
reviewReportRouter.post('/', verifyAuthToken, ReviewReportController.report);
reviewReportRouter.get('/mine', verifyAuthToken, ReviewReportController.listMine);

export const adminReviewReportRouter = Router();
adminReviewReportRouter.get('/', verifyAuthToken, ReviewReportController.listOpen);
adminReviewReportRouter.post('/:reportId/decision', verifyAuthToken, ReviewReportController.decide);

=== server/domain/reviews/schemas/reviewReportSchemas.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';
import { REVIEW_REPORT_REASONS } from '../types/reviewReport';

const ID = z
  .string()
  .min(1)
  .max(300)
  .regex(/^[\w-]+$/);

export const ReportReviewResponseSchema = z
  .object({
    reviewId: ID,
    reason: z.enum(REVIEW_REPORT_REASONS),
    details: z.string().trim().max(500).optional(),
  })
  .strict();

export const ReviewReportParamsSchema = z.object({ reportId: ID }).strict();

export const ListReviewReportsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    cursor: ID.optional(),
  })
  .strict();

export const DecideReviewReportSchema = z
  .object({ outcome: z.enum(['upheld', 'dismissed']) })
  .strict();

=== server/domain/reviews/services/reviewReportService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { InMemoryReviewReportAdapter } from '../adapters/inMemoryReviewReportAdapter';
import type { ReviewForReport } from '../types/reviewReport';
import { REVIEW_REPORTS_PER_DAY, ReviewReportService } from './reviewReportService';

const NOW = new Date('2026-10-27T12:00:00.000Z');
const REVIEW: ReviewForReport = {
  id: 'items_tamarindo_u1',
  userId: 'u1',
  itemId: 'tamarindo',
  itemCollection: 'items',
  rating: 2,
  comment: 'Demorou muito.',
  partnerResponse: 'Mentira sua, você nem veio.',
  responderId: 'partner-1',
};

function setup() {
  const repo = new InMemoryReviewReportAdapter();
  repo.reviews.set(REVIEW.id, REVIEW);
  return { repo, service: new ReviewReportService(repo, () => NOW) };
}

describe('denúncia de resposta (D19)', () => {
  it('o autor denuncia; prazo de 3 dias e cópia do que foi denunciado', async () => {
    const { repo, service } = setup();
    const mine = await service.report('u1', {
      reviewId: REVIEW.id,
      reason: 'offensive',
      details: ' ofensivo ',
    });
    expect(mine).toMatchObject({ status: 'open', decideBy: '2026-10-30T12:00:00.000Z' });
    const saved = repo.reports.get(mine.id);
    expect(saved).toMatchObject({
      reporterUid: 'u1',
      details: 'ofensivo',
      responseText: REVIEW.partnerResponse,
      placeName: 'Restaurante Tamarindo',
    });
  });

  it('outra pessoa, avaliação sem resposta ou inexistente são recusadas', async () => {
    const { repo, service } = setup();
    await expect(
      service.report('u2', { reviewId: REVIEW.id, reason: 'fraud' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    repo.reviews.set('r2', { ...REVIEW, id: 'r2', partnerResponse: '  ' });
    await expect(service.report('u1', { reviewId: 'r2', reason: 'fraud' })).rejects.toMatchObject({
      code: 'NO_RESPONSE_TO_REPORT',
    });
    await expect(service.report('u1', { reviewId: 'nada', reason: 'fraud' })).rejects.toMatchObject(
      { code: 'NOT_FOUND' }
    );
  });

  it('a mesma resposta só uma vez; resposta nova pode ser denunciada de novo', async () => {
    const { repo, service } = setup();
    await service.report('u1', { reviewId: REVIEW.id, reason: 'offensive' });
    await expect(
      service.report('u1', { reviewId: REVIEW.id, reason: 'other' })
    ).rejects.toMatchObject({ code: 'ALREADY_REPORTED' });
    repo.reviews.set(REVIEW.id, { ...REVIEW, partnerResponse: 'Outra resposta ofensiva.' });
    await expect(
      service.report('u1', { reviewId: REVIEW.id, reason: 'offensive' })
    ).resolves.toMatchObject({ status: 'open' });
  });

  it('limite de denúncias por dia', async () => {
    const { repo, service } = setup();
    for (let i = 0; i < REVIEW_REPORTS_PER_DAY; i += 1) {
      repo.reviews.set(`r${i}`, { ...REVIEW, id: `r${i}` });
      await service.report('u1', { reviewId: `r${i}`, reason: 'other' });
    }
    await expect(
      service.report('u1', { reviewId: REVIEW.id, reason: 'other' })
    ).rejects.toMatchObject({ code: 'REPORT_LIMIT_REACHED' });
  });

  it('aceita remove a resposta se ainda é a mesma; decidir de novo é recusado', async () => {
    const { repo, service } = setup();
    const mine = await service.report('u1', { reviewId: REVIEW.id, reason: 'offensive' });
    const decided = await service.decide('admin-1', mine.id, 'upheld');
    expect(decided).toMatchObject({
      status: 'upheld',
      decidedBy: 'admin-1',
      responseRemoved: true,
    });
    expect(repo.reviews.get(REVIEW.id)?.partnerResponse).toBeNull();
    await expect(service.decide('admin-1', mine.id, 'dismissed')).rejects.toMatchObject({
      code: 'ALREADY_DECIDED',
    });
  });

  it('resposta trocada antes da decisão não é removida; recusada mantém a resposta', async () => {
    const { repo, service } = setup();
    const first = await service.report('u1', { reviewId: REVIEW.id, reason: 'offensive' });
    repo.reviews.set(REVIEW.id, { ...REVIEW, partnerResponse: 'Pedimos desculpas.' });
    expect(await service.decide('admin-1', first.id, 'upheld')).toMatchObject({
      responseRemoved: false,
    });
    expect(repo.reviews.get(REVIEW.id)?.partnerResponse).toBe('Pedimos desculpas.');
    const second = await service.report('u1', { reviewId: REVIEW.id, reason: 'other' });
    expect(await service.decide('admin-1', second.id, 'dismissed')).toMatchObject({
      status: 'dismissed',
    });
    expect(repo.reviews.get(REVIEW.id)?.partnerResponse).toBe('Pedimos desculpas.');
  });

  it('exclusão de conta apaga as denúncias da pessoa', async () => {
    const { repo, service } = setup();
    await service.report('u1', { reviewId: REVIEW.id, reason: 'offensive' });
    await service.deleteByReporter('u1');
    expect(repo.reports.size).toBe(0);
  });
});

=== server/domain/reviews/services/reviewReportService.ts — ARQUIVO NOVO, conteúdo completo ===
import { ReviewReportError } from '../errors/reviewReportError';
import type { ReviewReportRepositoryPort } from '../ports/reviewReportPort';
import type {
  MyReviewReport,
  ReviewReport,
  ReviewReportOutcome,
  ReviewReportReason,
} from '../types/reviewReport';
import { buildReviewReportId } from '../utils/reviewReportId';

const DAY_MS = 86_400_000;
/** Prazo de análise mostrado ao autor (D19). */
export const REVIEW_REPORT_DECISION_DAYS = 3;
/** Limite de denúncias por pessoa em 24 h, contado no Firestore (o Cloud Run não guarda estado). */
export const REVIEW_REPORTS_PER_DAY = 5;

export interface ReportReviewResponseInput {
  reviewId: string;
  reason: ReviewReportReason;
  details?: string;
}

/** Denúncia da resposta do estabelecimento pelo autor da avaliação e decisão do admin (D19). */
export class ReviewReportService {
  constructor(
    private readonly repository: ReviewReportRepositoryPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async report(reporterUid: string, input: ReportReviewResponseInput): Promise<MyReviewReport> {
    const review = await this.repository.getReview(input.reviewId);
    if (!review) throw new ReviewReportError('NOT_FOUND', 'Avaliação não encontrada.');
    // Só o autor denuncia por aqui (Minhas avaliações); a página pública não tem esse botão.
    if (review.userId !== reporterUid) {
      throw new ReviewReportError(
        'FORBIDDEN',
        'Só o autor da avaliação pode denunciar a resposta.'
      );
    }
    const responseText = review.partnerResponse?.trim();
    if (!responseText) {
      throw new ReviewReportError('NO_RESPONSE_TO_REPORT', 'Esta avaliação não tem resposta.');
    }
    const now = this.now();
    const recent = await this.repository.countByReporterSince(
      reporterUid,
      new Date(now.getTime() - DAY_MS).toISOString()
    );
    if (recent >= REVIEW_REPORTS_PER_DAY) {
      throw new ReviewReportError('REPORT_LIMIT_REACHED', 'Limite de denúncias por dia atingido.');
    }
    const details = input.details?.trim();
    const report: ReviewReport = {
      id: buildReviewReportId(review.id, responseText),
      reviewId: review.id,
      reporterUid,
      reason: input.reason,
      ...(details ? { details: details.slice(0, 500) } : {}),
      status: 'open',
      responseText,
      responderId: review.responderId,
      reviewRating: review.rating,
      reviewComment: review.comment,
      itemId: review.itemId,
      itemCollection: review.itemCollection,
      placeName: await this.repository.placeNameOf(review.itemId, review.itemCollection),
      createdAt: now.toISOString(),
      decideBy: new Date(now.getTime() + REVIEW_REPORT_DECISION_DAYS * DAY_MS).toISOString(),
    };
    const saved = await this.repository.createIfAbsent(report);
    if (!saved.created) {
      throw new ReviewReportError('ALREADY_REPORTED', 'Você já denunciou esta resposta.');
    }
    return toMine(saved.report);
  }

  async listMine(reporterUid: string): Promise<MyReviewReport[]> {
    return (await this.repository.listByReporter(reporterUid, 100)).map(toMine);
  }

  listOpen(limit: number, cursor?: string): Promise<ReviewReport[]> {
    return this.repository.listOpen(limit, cursor);
  }

  async decide(
    adminUid: string,
    reportId: string,
    outcome: ReviewReportOutcome
  ): Promise<ReviewReport> {
    const decided = await this.repository.decide(
      reportId,
      (current) => {
        if (current.status !== 'open') {
          throw new ReviewReportError('ALREADY_DECIDED', 'Esta denúncia já foi decidida.');
        }
        return {
          ...current,
          status: outcome,
          decidedAt: this.now().toISOString(),
          decidedBy: adminUid,
        };
      },
      outcome === 'upheld'
    );
    if (!decided) throw new ReviewReportError('NOT_FOUND', 'Denúncia não encontrada.');
    return decided;
  }

  deleteByReporter(reporterUid: string): Promise<void> {
    return this.repository.deleteByReporter(reporterUid);
  }
}

function toMine(report: ReviewReport): MyReviewReport {
  return {
    id: report.id,
    reviewId: report.reviewId,
    status: report.status,
    createdAt: report.createdAt,
    decideBy: report.decideBy,
  };
}

=== server/domain/reviews/types/reviewReport.ts — ARQUIVO NOVO, conteúdo completo ===
/** Motivos fechados da denúncia de resposta (D19). */
export const REVIEW_REPORT_REASONS = ['offensive', 'fraud', 'personal_data', 'other'] as const;
export type ReviewReportReason = (typeof REVIEW_REPORT_REASONS)[number];

export type ReviewReportStatus = 'open' | 'upheld' | 'dismissed';
export type ReviewReportOutcome = 'upheld' | 'dismissed';

/**
 * Denúncia da resposta de um estabelecimento, feita pelo autor da avaliação. Coleção só de backend:
 * `reporterUid` e `details` não saem para o estabelecimento (D19).
 */
export interface ReviewReport {
  id: string;
  reviewId: string;
  reporterUid: string;
  reason: ReviewReportReason;
  details?: string;
  status: ReviewReportStatus;
  /** Cópia do que foi denunciado, para o admin decidir mesmo se a resposta mudar. */
  responseText: string;
  responderId: string | null;
  reviewRating: number;
  reviewComment: string;
  itemId: string;
  itemCollection: 'items' | 'events';
  placeName: string | null;
  createdAt: string;
  decideBy: string;
  decidedAt?: string;
  decidedBy?: string;
  /** Aceita: a resposta saiu da avaliação (só quando ainda era a mesma denunciada). */
  responseRemoved?: boolean;
}

/** O que o autor vê no próprio cartão: sem dados de quem decidiu. */
export interface MyReviewReport {
  id: string;
  reviewId: string;
  status: ReviewReportStatus;
  createdAt: string;
  decideBy: string;
}

export interface ReviewForReport {
  id: string;
  userId: string;
  itemId: string;
  itemCollection: 'items' | 'events';
  rating: number;
  comment: string;
  partnerResponse: string | null;
  responderId: string | null;
}

=== server/domain/reviews/usecases/decideReviewReportUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { reviewReportService } from '../factory';
import type { ReviewReport, ReviewReportOutcome } from '../types/reviewReport';

/** Aceita remove a resposta denunciada; recusada mantém (D19). */
export function decideReviewReportUseCase(
  adminUid: string,
  reportId: string,
  outcome: ReviewReportOutcome
): Promise<ReviewReport> {
  return reviewReportService.decide(adminUid, reportId, outcome);
}

=== server/domain/reviews/usecases/deleteReviewsByUserUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { reviewReportService, reviewService } from '../factory';

/** Exclusão de conta (LGPD, AGENTS.md §7.5): as avaliações e as denúncias feitas pela pessoa. */
export async function deleteReviewsByUserUseCase(uid: string): Promise<void> {
  await reviewService.deleteReviewsByUser(uid);
  await reviewReportService.deleteByReporter(uid);
}

=== server/domain/reviews/usecases/listMyReviewReportsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { reviewReportService } from '../factory';
import type { MyReviewReport } from '../types/reviewReport';

export function listMyReviewReportsUseCase(reporterUid: string): Promise<MyReviewReport[]> {
  return reviewReportService.listMine(reporterUid);
}

=== server/domain/reviews/usecases/listOpenReviewReportsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { reviewReportService } from '../factory';
import type { ReviewReport } from '../types/reviewReport';

/** Fila de Moderação do admin: denúncias abertas, as mais antigas primeiro. */
export function listOpenReviewReportsUseCase(
  limit: number,
  cursor?: string
): Promise<ReviewReport[]> {
  return reviewReportService.listOpen(limit, cursor);
}

=== server/domain/reviews/usecases/reportReviewResponseUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { reviewReportService } from '../factory';
import type { ReportReviewResponseInput } from '../services/reviewReportService';
import type { MyReviewReport } from '../types/reviewReport';

/** O autor da avaliação denuncia a resposta do estabelecimento (D19). */
export function reportReviewResponseUseCase(
  reporterUid: string,
  input: ReportReviewResponseInput
): Promise<MyReviewReport> {
  return reviewReportService.report(reporterUid, input);
}

=== server/domain/reviews/utils/reviewReportId.ts — ARQUIVO NOVO, conteúdo completo ===
import { createHash } from 'node:crypto';

/**
 * Uma denúncia por resposta: o ID junta a avaliação e o hash do texto denunciado. Se o
 * estabelecimento trocar a resposta, a nova pode ser denunciada de novo.
 */
export function buildReviewReportId(reviewId: string, responseText: string): string {
  const hash = createHash('sha256').update(responseText.trim()).digest('hex').slice(0, 16);
  return `${reviewId}__${hash}`;
}

=== src/app/compositions/AdminPanelComposition.tsx — diff ===
@@ -17,6 +17,7 @@ import {
   type PartnerContentRecord,
 } from '../../domain/partners';
 import { AdminFinanceQueues } from '../../domain/payment';
+import { ReviewModerationQueue } from '../../domain/reviews';
 import { PartnerEventTicketingManager } from '../../domain/ticketing';
 
 // Cadastros novos que o admin pode criar pelo editor do parceiro (o servidor permite só estes ao admin).
@@ -84,7 +85,7 @@ function AdminListingEditor({ item, onClose }: AdminListingEditorProps) {
 
 /**
  * Painel admin com os editores compartilhados: cadastro (o mesmo do parceiro, decisão D9), fila de
- * verificação dos estabelecimentos (D12), selo por estabelecimento (D11), filas financeiras (D16), sessões do evento e
+ * verificação dos estabelecimentos (D12), selo por estabelecimento (D11), filas financeiras (D16), denúncias de respostas (D19), sessões do evento e
  * gerenciador de ingressos.
  */
 export function AdminPanelComposition() {
@@ -94,6 +95,7 @@ export function AdminPanelComposition() {
       renderVerificationQueue={() => <ListingVerificationQueue />}
       renderListingSeal={(item) => <AdminListingSealControl itemId={item.id} name={item.name} />}
       renderFinanceQueues={() => <AdminFinanceQueues />}
+      renderModerationQueue={() => <ReviewModerationQueue />}
       renderSessionsField={(props) => <EventSessionsField {...props} />}
       renderTicketingManager={(eventListingId) => (
         <PartnerEventTicketingManager eventListingId={eventListingId} asAdmin />

=== src/domain/admin/components/AdminPanel.tsx — diff ===
@@ -71,6 +71,8 @@ export interface AdminPanelProps extends AdminEventSlots {
   renderListingSeal?: (item: GuideItem) => ReactNode;
   /** Filas financeiras (D16, domínio payment), montadas pela composição. */
   renderFinanceQueues?: () => ReactNode;
+  /** Fila de denúncias de respostas (D19, domínio reviews), montada pela composição. */
+  renderModerationQueue?: () => ReactNode;
 }
 
 export function AdminPanel({
@@ -78,6 +80,7 @@ export function AdminPanel({
   renderVerificationQueue,
   renderListingSeal,
   renderFinanceQueues,
+  renderModerationQueue,
   renderSessionsField,
   renderTicketingManager,
 }: AdminPanelProps = {}) {
@@ -256,6 +259,7 @@ export function AdminPanel({
           onSelectTab={setActiveTab}
           showVerifications={Boolean(renderVerificationQueue)}
           showFinance={Boolean(renderFinanceQueues)}
+          showModeration={Boolean(renderModerationQueue)}
         />
 
         <AnimatePresence mode="wait">
@@ -292,6 +296,8 @@ export function AdminPanel({
               renderVerificationQueue?.()
             ) : activeTab === 'finance' ? (
               renderFinanceQueues?.()
+            ) : activeTab === 'moderation' ? (
+              renderModerationQueue?.()
             ) : activeTab === 'plans' ? (
               <AdminPlansView />
             ) : activeTab === 'notifications' ? (

=== src/domain/admin/components/subcomponents/AdminNavigation.tsx — diff ===
@@ -4,6 +4,7 @@ import {
   Bell,
   Calendar,
   Database,
+  Flag,
   Landmark,
   Layers,
   ShieldCheck,
@@ -19,6 +20,7 @@ export type AdminTabId =
   | 'partners'
   | 'verifications'
   | 'finance'
+  | 'moderation'
   | 'plans'
   | 'notifications';
 
@@ -29,6 +31,8 @@ interface AdminNavigationProps {
   showVerifications?: boolean;
   /** As filas financeiras vêm do payment; a aba só aparece quando a composição as monta. */
   showFinance?: boolean;
+  /** A fila de denúncias vem do reviews (D19); a aba só aparece quando a composição a monta. */
+  showModeration?: boolean;
 }
 
 const ADMIN_TABS = [
@@ -60,6 +64,13 @@ const ADMIN_TABS = [
     color: 'bg-cyan-400',
     shadow: 'shadow-cyan-400/40',
   },
+  {
+    id: 'moderation' as const,
+    label: '',
+    icon: Flag,
+    color: 'bg-rose-400',
+    shadow: 'shadow-rose-400/40',
+  },
   {
     id: 'items' as const,
     label: 'Guia Local',
@@ -95,15 +106,19 @@ export function AdminNavigation({
   onSelectTab,
   showVerifications = false,
   showFinance = false,
+  showModeration = false,
 }: AdminNavigationProps) {
   const { t } = useTranslation();
-  const shown = { verifications: showVerifications, finance: showFinance } as Partial<
-    Record<AdminTabId, boolean>
-  >;
+  const shown = {
+    verifications: showVerifications,
+    finance: showFinance,
+    moderation: showModeration,
+  } as Partial<Record<AdminTabId, boolean>>;
   // Abas de outros domínios têm rótulo traduzido; as demais ainda são texto fixo (débito B32).
   const labels: Partial<Record<AdminTabId, string>> = {
     verifications: t('verification.admin.tab'),
     finance: t('adminFinance.title'),
+    moderation: t('reviewReports.admin.tab'),
   };
   const tabs = ADMIN_TABS.filter((tab) => shown[tab.id] ?? true).map((tab) =>
     labels[tab.id] ? { ...tab, label: labels[tab.id] as string } : tab

=== src/domain/reviews/adapters/httpReviewReportAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { ReviewReportApiPort } from '../ports/reviewReportApiPort';
import type {
  ModerationPage,
  MyReviewReport,
  ReviewReportOutcome,
  ReviewReportReason,
} from '../types/reviewReport';

const API_OPTIONS = { requireAuth: true, requireAppCheck: true } as const;

/** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
async function readJsonOrThrow<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data?.error?.code === 'string' ? data.error.code : 'INTERNAL_ERROR');
  }
  return data as T;
}

function postJson(path: string, body: unknown) {
  return firebaseApiFetch(
    path,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    API_OPTIONS
  );
}

export class HttpReviewReportAdapter implements ReviewReportApiPort {
  async report(input: {
    reviewId: string;
    reason: ReviewReportReason;
    details?: string;
  }): Promise<MyReviewReport> {
    const response = await postJson('/api/review-reports', input);
    return (await readJsonOrThrow<{ data: MyReviewReport }>(response)).data;
  }

  async listMine(): Promise<MyReviewReport[]> {
    const response = await firebaseApiFetch(
      '/api/review-reports/mine',
      { method: 'GET' },
      API_OPTIONS
    );
    return (await readJsonOrThrow<{ data: MyReviewReport[] }>(response)).data;
  }

  async listOpen(cursor?: string | null): Promise<ModerationPage> {
    const params = new URLSearchParams({ limit: '30' });
    if (cursor) params.set('cursor', cursor);
    const response = await firebaseApiFetch(
      `/api/admin/review-reports?${params.toString()}`,
      { method: 'GET' },
      API_OPTIONS
    );
    return readJsonOrThrow<ModerationPage>(response);
  }

  async decide(reportId: string, outcome: ReviewReportOutcome): Promise<void> {
    const response = await postJson(
      `/api/admin/review-reports/${encodeURIComponent(reportId)}/decision`,
      { outcome }
    );
    await readJsonOrThrow<unknown>(response);
  }
}

=== src/domain/reviews/application/usecases/decideReviewReportUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';
import { reviewReportApi } from '../../factory';
import type { ReviewReportOutcome } from '../../types/reviewReport';

const schema = z.object({
  reportId: z.string().trim().min(1),
  outcome: z.enum(['upheld', 'dismissed']),
});

export function decideReviewReportUseCase(
  reportId: string,
  outcome: ReviewReportOutcome
): Promise<void> {
  const data = schema.parse({ reportId, outcome });
  return reviewReportApi.decide(data.reportId, data.outcome);
}

=== src/domain/reviews/application/usecases/listMyReviewReportsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { reviewReportApi } from '../../factory';
import type { MyReviewReport } from '../../types/reviewReport';

export function listMyReviewReportsUseCase(): Promise<MyReviewReport[]> {
  return reviewReportApi.listMine();
}

=== src/domain/reviews/application/usecases/listOpenReviewReportsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { reviewReportApi } from '../../factory';
import type { ModerationPage } from '../../types/reviewReport';

/** Fila de Moderação do admin, paginada por cursor. */
export function listOpenReviewReportsUseCase(cursor?: string | null): Promise<ModerationPage> {
  return reviewReportApi.listOpen(cursor);
}

=== src/domain/reviews/application/usecases/reportReviewResponseUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';
import { reviewReportApi } from '../../factory';
import { REVIEW_REPORT_REASONS, type MyReviewReport } from '../../types/reviewReport';

const schema = z
  .object({
    reviewId: z.string().trim().min(1),
    reason: z.enum(REVIEW_REPORT_REASONS),
    details: z.string().trim().max(500).optional(),
  })
  .strict();

/** Denuncia a resposta do estabelecimento; quem decide é o admin (D19). */
export function reportReviewResponseUseCase(input: {
  reviewId: string;
  reason: string;
  details?: string;
}): Promise<MyReviewReport> {
  const data = schema.parse(input);
  return reviewReportApi.report({ ...data, details: data.details || undefined });
}

=== src/domain/reviews/components/mine/MyReviewCard.tsx — diff ===
@@ -1,10 +1,8 @@
 import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
 import type { ReactNode } from 'react';
 import { useTranslation } from 'react-i18next';
-import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';
 import { DropdownMenu, type DropdownMenuItem } from '../../../../ui/components/DropdownMenu';
 import type { FirestoreReview } from '../../types/review';
-import { reviewDateToIso } from '../../utils/reviewDateToIso';
 import { StarRating } from '../StarRating';
 
 interface MyReviewCardProps {
@@ -18,7 +16,7 @@ interface MyReviewCardProps {
   footer?: ReactNode;
 }
 
-/** Uma avaliação da própria pessoa (D19): lugar, nota, texto, resposta e o menu "…". */
+/** Uma avaliação da própria pessoa (D19): lugar, nota, texto, resposta e o menu "…". A data fica no título do grupo. */
 export function MyReviewCard({
   review,
   title,
@@ -27,9 +25,7 @@ export function MyReviewCard({
   extraMenuItems = [],
   footer,
 }: MyReviewCardProps) {
-  const { t, i18n } = useTranslation();
-  const createdAt = reviewDateToIso(review.createdAt);
-  const date = createdAt ? formatBusinessDay(createdAt, i18n.language) : '';
+  const { t } = useTranslation();
   return (
     <li className="p-4 rounded-[20px] bg-surface border border-line">
       <div className="flex items-start gap-3">
@@ -37,9 +33,9 @@ export function MyReviewCard({
           <p className="text-[15px] font-semibold text-ink leading-snug break-words">{title}</p>
           <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
             <StarRating rating={review.rating} />
-            <span className="text-[13px] text-ink/70">
-              {review.verifiedAttendance ? t('myReviews.verified', { date }) : date}
-            </span>
+            {review.verifiedAttendance && (
+              <span className="text-[13px] text-ink/70">{t('myReviews.verified')}</span>
+            )}
           </div>
         </div>
         <DropdownMenu

=== src/domain/reviews/components/mine/MyReviewsView.test.tsx — diff ===
@@ -5,6 +5,14 @@ import type { MyReviewsSource } from '../../hooks/useMyReviews';
 import type { FirestoreReview } from '../../types/review';
 import { MyReviewsView } from './MyReviewsView';
 
+const r = vi.hoisted(() => ({ mine: vi.fn(), report: vi.fn() }));
+vi.mock('../../application/usecases/listMyReviewReportsUseCase', () => ({
+  listMyReviewReportsUseCase: r.mine,
+}));
+vi.mock('../../application/usecases/reportReviewResponseUseCase', () => ({
+  reportReviewResponseUseCase: r.report,
+}));
+
 const REVIEW: FirestoreReview = {
   id: 'items_tamarindo_u1',
   itemId: 'tamarindo',
@@ -39,6 +47,8 @@ function openMenu() {
 
 describe('Minhas avaliações', () => {
   beforeEach(async () => {
+    vi.clearAllMocks();
+    r.mine.mockResolvedValue([]);
     await i18n.changeLanguage('pt-BR');
   });
 
@@ -51,11 +61,29 @@ describe('Minhas avaliações', () => {
       />
     );
     expect(screen.getByText('Restaurante Tamarindo')).toBeTruthy();
-    expect(screen.getByText(/Experiência verificada/)).toBeTruthy();
+    expect(screen.getByText('Experiência verificada')).toBeTruthy();
+    expect(screen.getByRole('heading', { name: '12 de outubro' })).toBeTruthy();
     expect(screen.getByText('Resposta do estabelecimento')).toBeTruthy();
     expect(screen.getByRole('img', { name: '5 de 5 estrelas' })).toBeTruthy();
   });
 
+  it('agrupa pelo dia da avaliação, com o ano só quando não é o atual', () => {
+    const older = { ...REVIEW, id: 'r2', createdAt: '2025-06-23T15:00:00.000Z' };
+    const sameDay = { ...REVIEW, id: 'r3', createdAt: '2026-10-12T20:00:00.000Z' };
+    vi.useFakeTimers({ toFake: ['Date'] });
+    vi.setSystemTime(new Date('2026-10-27T12:00:00.000Z'));
+    render(
+      <MyReviewsView
+        source={source([sameDay, REVIEW, older])}
+        onBack={vi.fn()}
+        titleOf={() => 'Tamarindo'}
+      />
+    );
+    vi.useRealTimers();
+    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
+    expect(headings).toEqual(['12 de outubro', '23 de junho de 2025']);
+  });
+
   it('lugar fora do guia mostra o aviso no lugar do nome', () => {
     render(<MyReviewsView source={source([REVIEW])} onBack={vi.fn()} titleOf={() => undefined} />);
     expect(screen.getByText('Lugar fora do guia')).toBeTruthy();
@@ -66,6 +94,8 @@ describe('Minhas avaliações', () => {
     render(<MyReviewsView source={src} onBack={vi.fn()} titleOf={() => 'Tamarindo'} />);
     openMenu();
     fireEvent.click(await screen.findByRole('menuitem', { name: /Excluir/ }));
+    expect(screen.getByText('Excluir esta avaliação?')).toBeTruthy();
+    expect(screen.getByText('A ação é definitiva e não poderá ser recuperada.')).toBeTruthy();
     expect(src.remove).not.toHaveBeenCalled();
     fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
     await waitFor(() => expect(src.remove).toHaveBeenCalledWith(REVIEW.id));
@@ -95,4 +125,57 @@ describe('Minhas avaliações', () => {
     expect(await screen.findByText('Escreva um comentário sobre sua experiência.')).toBeTruthy();
     expect(src.save).not.toHaveBeenCalled();
   });
+
+  it('denunciar a resposta: motivo obrigatório, envia e mostra o status no cartão', async () => {
+    r.report.mockResolvedValue({
+      id: 'rep1',
+      reviewId: REVIEW.id,
+      status: 'open',
+      createdAt: '2026-10-27T12:00:00.000Z',
+      decideBy: '2026-10-30T12:00:00.000Z',
+    });
+    render(
+      <MyReviewsView source={source([REVIEW])} onBack={vi.fn()} titleOf={() => 'Tamarindo'} />
+    );
+    openMenu();
+    fireEvent.click(await screen.findByRole('menuitem', { name: /Denunciar resposta/ }));
+    const submit = screen.getByRole('button', { name: 'Enviar denúncia' });
+    expect((submit as HTMLButtonElement).disabled).toBe(true);
+    fireEvent.click(screen.getByRole('radio', { name: 'Fraude ou golpe' }));
+    fireEvent.click(submit);
+    await waitFor(() =>
+      expect(r.report).toHaveBeenCalledWith({
+        reviewId: REVIEW.id,
+        reason: 'fraud',
+        details: undefined,
+      })
+    );
+    expect(await screen.findByText(/Denúncia em análise/)).toBeTruthy();
+  });
+
+  it('sem resposta do estabelecimento ou com denúncia aberta, não oferece denunciar', async () => {
+    r.mine.mockResolvedValue([
+      {
+        id: 'rep1',
+        reviewId: REVIEW.id,
+        status: 'open',
+        createdAt: '2026-10-27T12:00:00.000Z',
+        decideBy: '2026-10-30T12:00:00.000Z',
+      },
+    ]);
+    render(
+      <MyReviewsView
+        source={source([REVIEW, { ...REVIEW, id: 'r2', partnerResponse: null }])}
+        onBack={vi.fn()}
+        titleOf={() => 'Tamarindo'}
+      />
+    );
+    expect(await screen.findByText(/Denúncia em análise/)).toBeTruthy();
+    for (const trigger of screen.getAllByRole('button', { name: 'Mais opções' })) {
+      fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' });
+      expect(await screen.findByRole('menuitem', { name: /Editar/ })).toBeTruthy();
+      expect(screen.queryByRole('menuitem', { name: /Denunciar resposta/ })).toBeNull();
+      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
+    }
+  });
 });

=== src/domain/reviews/components/mine/MyReviewsView.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { Flag } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { formatBusinessDate, formatBusinessDay } from '../../../../shared/utils/businessDateTime';
import { reviewDateToIso } from '../../utils/reviewDateToIso';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useMyReviewReports } from '../../hooks/useMyReviewReports';
import type { MyReviewsSource } from '../../hooks/useMyReviews';
import type { MyReviewReport } from '../../types/reviewReport';
import type { FirestoreReview } from '../../types/review';
import { EditReviewSheet } from './EditReviewSheet';
import { MyReviewCard } from './MyReviewCard';
import { ReportResponseSheet } from './ReportResponseSheet';

interface MyReviewsViewProps {
  source: MyReviewsSource;
  onBack: () => void;
  /** Nome do lugar ou evento, vindo do guia pela composição; `undefined` se não está mais no guia. */
  titleOf: (review: FirestoreReview) => string | undefined;
}

const REPORT_TONE = { open: 'warn', upheld: 'success', dismissed: 'muted' } as const;

/** Minhas avaliações (D19): um cartão por avaliação; editar, denunciar a resposta e excluir no menu "…". */
export function MyReviewsView({ source, onBack, titleOf }: MyReviewsViewProps) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, hasMore, reload, loadMore, remove, save } = source;
  const reports = useMyReviewReports();
  const [editing, setEditing] = useState<FirestoreReview | null>(null);
  const [reporting, setReporting] = useState<FirestoreReview | null>(null);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const title = (review: FirestoreReview) => titleOf(review) ?? t('myReviews.unknownPlace');

  // Denúncia aberta ou recusada para a resposta atual: o backend recusaria outra igual.
  const canReport = (review: FirestoreReview, latest?: MyReviewReport) =>
    Boolean(review.partnerResponse) && (!latest || latest.status === 'upheld');

  const reportFooter = (latest?: MyReviewReport) =>
    latest && (
      <StatusText tone={REPORT_TONE[latest.status]}>
        {t(`reviewReports.status.${latest.status}`, {
          date: formatBusinessDay(latest.decideBy, i18n.language),
        })}
      </StatusText>
    );

  // Agrupa pelo dia da avaliação, como as outras listas (ex.: "26 de agosto"); o ano só aparece
  // quando não é o atual.
  const yearOf = (iso: string) => formatBusinessDate(iso, 'en', { year: 'numeric' });
  const currentYear = yearOf(new Date().toISOString());
  const dayLabel = (review: FirestoreReview) => {
    const iso = reviewDateToIso(review.createdAt);
    if (!iso) return '';
    const sameYear = yearOf(iso) === currentYear;
    return formatBusinessDate(iso, i18n.language, {
      day: 'numeric',
      month: 'long',
      ...(sameYear ? {} : { year: 'numeric' }),
    });
  };
  const groups: { label: string; reviews: FirestoreReview[] }[] = [];
  for (const review of data) {
    const label = dayLabel(review);
    const last = groups.at(-1);
    if (last && last.label === label) last.reviews.push(review);
    else groups.push({ label, reviews: [review] });
  }

  const askDelete = (review: FirestoreReview) =>
    setConfirm({
      title: t('myReviews.deleteTitle'),
      message: t('myReviews.deleteMessage'),
      confirmLabel: t('myReviews.delete'),
      onCancel: () => setConfirm(null),
      onConfirm: async () => {
        setConfirm(null);
        try {
          await remove(review.id);
          setNotice({ tone: 'ok', text: t('myReviews.deleted') });
        } catch {
          setNotice({ tone: 'error', text: t('myReviews.errors.delete') });
        }
      },
    });

  return (
    <section className="w-full space-y-5">
      <div className="flex items-center gap-2">
        <BackButton label={t('myReviews.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('myReviews.title')}</h2>
      </div>
      {notice && (
        <p
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={notice.tone === 'error' ? 'text-sm text-danger' : 'text-sm text-accent'}
        >
          {notice.text}
        </p>
      )}
      {error && <ListError message={error} onRetry={() => void reload()} />}
      {!error && !loading && data.length === 0 && <ListEmpty message={t('myReviews.empty')} />}
      {groups.map((group) => (
        <section key={group.label || 'sem-data'} className="space-y-2">
          {group.label && (
            <h3 className="text-[13px] font-semibold text-ink/70 px-1">{group.label}</h3>
          )}
          <ul className="space-y-3">
            {group.reviews.map((review) => {
              const latest = reports.latestFor(review.id);
              return (
                <MyReviewCard
                  key={review.id}
                  review={review}
                  title={title(review)}
                  onEdit={() => {
                    setNotice(null);
                    setEditing(review);
                  }}
                  onDelete={() => askDelete(review)}
                  extraMenuItems={
                    canReport(review, latest)
                      ? [
                          {
                            label: t('reviewReports.action'),
                            icon: <Flag size={16} aria-hidden="true" />,
                            onClick: () => {
                              setNotice(null);
                              setReporting(review);
                            },
                          },
                        ]
                      : []
                  }
                  footer={reportFooter(latest)}
                />
              );
            })}
          </ul>
        </section>
      ))}
      {loading && <ListLoading label={t('myReviews.loading')} />}
      {!loading && hasMore && (
        <button type="button" onClick={() => void loadMore()} className={BUTTON_SECONDARY}>
          {t('myReviews.loadMore')}
        </button>
      )}
      {editing && (
        <EditReviewSheet
          review={editing}
          title={title(editing)}
          onClose={() => setEditing(null)}
          onSave={async (rating, comment) => {
            try {
              await save(editing, rating, comment);
              setEditing(null);
              setNotice({ tone: 'ok', text: t('myReviews.saved') });
            } catch {
              setEditing(null);
              setNotice({ tone: 'error', text: t('myReviews.errors.save') });
            }
          }}
        />
      )}
      {reporting && (
        <ReportResponseSheet
          place={title(reporting)}
          onClose={() => setReporting(null)}
          onSubmit={async (reason, details) => {
            await reports.report(reporting.id, reason, details);
            setReporting(null);
            setNotice({ tone: 'ok', text: t('reviewReports.sent') });
          }}
        />
      )}
      <ConfirmDialog data={confirm} />
    </section>
  );
}

=== src/domain/reviews/components/mine/ReportResponseSheet.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
import { BUTTON_PRIMARY, INPUT } from '../../../../ui/styles/controls';
import { REVIEW_REPORT_REASONS, type ReviewReportReason } from '../../types/reviewReport';

interface ReportResponseSheetProps {
  place: string;
  onClose: () => void;
  /** Lança com o código do backend em caso de erro. */
  onSubmit: (reason: ReviewReportReason, details?: string) => Promise<void>;
}

const KNOWN_ERRORS = ['REPORT_LIMIT_REACHED', 'ALREADY_REPORTED', 'NO_RESPONSE_TO_REPORT'];

/** Folha para denunciar a resposta do estabelecimento (D19). */
export function ReportResponseSheet({ place, onClose, onSubmit }: ReportResponseSheetProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<ReviewReportReason | undefined>(undefined);
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!reason) return;
    setSending(true);
    setError(null);
    try {
      await onSubmit(reason, details.trim() || undefined);
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : '';
      setError(
        t(
          KNOWN_ERRORS.includes(code)
            ? `reviewReports.errors.${code}`
            : 'reviewReports.errors.generic'
        )
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t('reviewReports.sheet.title')}
      description={t('reviewReports.sheet.description', { place })}
    >
      <div className="space-y-4">
        <RadioCardGroup
          name="review-report-reason"
          legend={t('reviewReports.sheet.reasonLegend')}
          value={reason}
          onChange={setReason}
          options={REVIEW_REPORT_REASONS.map((value) => ({
            value,
            title: t(`reviewReports.reasons.${value}`),
          }))}
        />
        <label className="block">
          <span className="sr-only">{t('reviewReports.sheet.detailsLabel')}</span>
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder={t('reviewReports.sheet.detailsLabel')}
            className={`${INPUT} min-h-20 py-2.5 placeholder:text-ink/50`}
          />
        </label>
        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={!reason || sending}
          onClick={() => void submit()}
          className={`${BUTTON_PRIMARY} w-full min-h-12`}
        >
          {sending ? t('reviewReports.sheet.sending') : t('reviewReports.sheet.submit')}
        </button>
      </div>
    </Dialog>
  );
}

=== src/domain/reviews/components/moderation/ReviewModerationQueue.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { ReviewModerationQueue } from './ReviewModerationQueue';

const m = vi.hoisted(() => ({ list: vi.fn(), decide: vi.fn() }));
vi.mock('../../application/usecases/listOpenReviewReportsUseCase', () => ({
  listOpenReviewReportsUseCase: m.list,
}));
vi.mock('../../application/usecases/decideReviewReportUseCase', () => ({
  decideReviewReportUseCase: m.decide,
}));

const REPORT = {
  id: 'rep1',
  reviewId: 'items_tamarindo_u1',
  reason: 'offensive',
  details: 'Me chamou de mentirosa.',
  status: 'open',
  responseText: 'Mentira sua.',
  reviewRating: 2,
  reviewComment: 'Demorou muito.',
  itemId: 'tamarindo',
  itemCollection: 'items',
  placeName: 'Restaurante Tamarindo',
  createdAt: '2026-10-27T12:00:00.000Z',
  decideBy: '2026-10-30T12:00:00.000Z',
};

describe('aba Moderação (D19)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    m.list.mockResolvedValue({ data: [REPORT], nextCursor: null });
    m.decide.mockResolvedValue(undefined);
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra o lugar, a avaliação, a resposta denunciada, o motivo e o relato', async () => {
    render(<ReviewModerationQueue />);
    expect(await screen.findByText('Restaurante Tamarindo')).toBeTruthy();
    expect(screen.getByText('Mentira sua.')).toBeTruthy();
    expect(screen.getByText('Motivo: Ofensiva ou desrespeitosa')).toBeTruthy();
    expect(screen.getByText('Relato: Me chamou de mentirosa.')).toBeTruthy();
  });

  it('remover pede confirmação; manter decide direto; a denúncia sai da fila', async () => {
    render(<ReviewModerationQueue />);
    fireEvent.click(await screen.findByRole('button', { name: 'Remover resposta' }));
    expect(m.decide).not.toHaveBeenCalled();
    const buttons = screen.getAllByRole('button', { name: 'Remover resposta' });
    fireEvent.click(buttons[buttons.length - 1] as HTMLElement);
    await waitFor(() => expect(m.decide).toHaveBeenCalledWith('rep1', 'upheld'));
    expect(await screen.findByText('Resposta removida.')).toBeTruthy();
    expect(screen.queryByText('Mentira sua.')).toBeNull();
  });
});

=== src/domain/reviews/components/moderation/ReviewModerationQueue.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_DANGER, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useReviewModerationQueue } from '../../hooks/useReviewModerationQueue';
import type { ModerationReviewReport, ReviewReportOutcome } from '../../types/reviewReport';
import { StarRating } from '../StarRating';

/** Aba Moderação do admin (D19): denúncias de respostas, as mais antigas primeiro. */
export function ReviewModerationQueue() {
  const { t, i18n } = useTranslation();
  const queue = useReviewModerationQueue();
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const decide = async (report: ModerationReviewReport, outcome: ReviewReportOutcome) => {
    setBusy(report.id);
    setNotice(null);
    try {
      await queue.decide(report.id, outcome);
      setNotice({
        tone: 'ok',
        text: t(
          outcome === 'upheld' ? 'reviewReports.admin.upheld' : 'reviewReports.admin.dismissed'
        ),
      });
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : '';
      setNotice({
        tone: 'error',
        text: t(
          code === 'ALREADY_DECIDED'
            ? 'reviewReports.admin.errors.ALREADY_DECIDED'
            : 'reviewReports.admin.errors.decide'
        ),
      });
    } finally {
      setBusy(null);
    }
  };

  const askUphold = (report: ModerationReviewReport) =>
    setConfirm({
      message: t('reviewReports.admin.upholdConfirm'),
      confirmLabel: t('reviewReports.admin.uphold'),
      onCancel: () => setConfirm(null),
      onConfirm: () => {
        setConfirm(null);
        void decide(report, 'upheld');
      },
    });

  return (
    <section className="space-y-4">
      <h2 className="text-[22px] font-display font-bold text-ink">
        {t('reviewReports.admin.title')}
      </h2>
      {notice && (
        <p
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={notice.tone === 'error' ? 'text-sm text-danger' : 'text-sm text-accent'}
        >
          {notice.text}
        </p>
      )}
      {queue.error && (
        <ListError
          message={t('reviewReports.admin.errors.load')}
          onRetry={() => void queue.reload()}
        />
      )}
      {!queue.error && !queue.loading && queue.data.length === 0 && (
        <ListEmpty message={t('reviewReports.admin.empty')} />
      )}
      {queue.data.length > 0 && (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {queue.data.map((report) => (
            <li
              key={report.id}
              className="p-4 rounded-[20px] bg-surface border border-line space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[15px] font-semibold text-ink break-words">
                  {report.placeName ?? t('reviewReports.admin.unknownPlace')}
                </p>
                <StatusText tone="warn">
                  {t('reviewReports.admin.decideBy', {
                    date: formatBusinessDay(report.decideBy, i18n.language),
                  })}
                </StatusText>
              </div>
              <div>
                <p className="flex items-center gap-2 text-[13px] text-ink/70">
                  {t('reviewReports.admin.review', { rating: report.reviewRating })}
                  <StarRating rating={report.reviewRating} size={12} />
                </p>
                <p className="text-sm text-ink/80 break-words">{report.reviewComment}</p>
              </div>
              <div className="p-3 rounded-2xl bg-danger-soft border border-danger-line">
                <p className="text-[13px] font-semibold text-ink">
                  {t('reviewReports.admin.response')}
                </p>
                <p className="text-[13px] text-ink/80 break-words">{report.responseText}</p>
              </div>
              <p className="text-[13px] text-ink/80">
                {t('reviewReports.admin.reason', {
                  reason: t(`reviewReports.reasons.${report.reason}`),
                })}
              </p>
              {report.details && (
                <p className="text-[13px] text-ink/70 break-words">
                  {t('reviewReports.admin.details', { details: report.details })}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                <TextButton
                  disabled={busy === report.id}
                  onClick={() => void decide(report, 'dismissed')}
                >
                  {t('reviewReports.admin.dismiss')}
                </TextButton>
                <button
                  type="button"
                  disabled={busy === report.id}
                  onClick={() => askUphold(report)}
                  className={BUTTON_DANGER}
                >
                  {t('reviewReports.admin.uphold')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {queue.loading && <ListLoading label={t('reviewReports.admin.loading')} />}
      {!queue.loading && queue.hasMore && (
        <button type="button" onClick={() => void queue.loadMore()} className={BUTTON_SECONDARY}>
          {t('reviewReports.admin.loadMore')}
        </button>
      )}
      <ConfirmDialog data={confirm} />
    </section>
  );
}

=== src/domain/reviews/factory.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { FirestoreReviewAdapter } from './adapters/firestoreReviewAdapter';
import { HttpReviewReportAdapter } from './adapters/httpReviewReportAdapter';
import type { ReviewPort } from './ports/reviewPort';
import type { ReviewReportApiPort } from './ports/reviewReportApiPort';

export const reviewAdapter: ReviewPort = new FirestoreReviewAdapter();
export const reviewReportApi: ReviewReportApiPort = new HttpReviewReportAdapter();

=== src/domain/reviews/hooks/useMyReviewReports.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { listMyReviewReportsUseCase } from '../application/usecases/listMyReviewReportsUseCase';
import { reportReviewResponseUseCase } from '../application/usecases/reportReviewResponseUseCase';
import type { MyReviewReport, ReviewReportReason } from '../types/reviewReport';

/** Denúncias da própria pessoa, a mais recente de cada avaliação, para o status no cartão. */
export function useMyReviewReports() {
  const [reports, setReports] = useState<MyReviewReport[]>([]);

  useEffect(() => {
    let active = true;
    listMyReviewReportsUseCase()
      .then((data) => {
        if (active) setReports(data);
      })
      // Sem a lista, o cartão só não mostra o status; a denúncia repetida o backend recusa.
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const latestFor = useCallback(
    (reviewId: string) =>
      reports
        .filter((report) => report.reviewId === reviewId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0],
    [reports]
  );

  const report = useCallback(
    async (reviewId: string, reason: ReviewReportReason, details?: string) => {
      const created = await reportReviewResponseUseCase({ reviewId, reason, details });
      setReports((current) => [created, ...current]);
    },
    []
  );

  return { latestFor, report };
}

=== src/domain/reviews/hooks/useReviewModerationQueue.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { decideReviewReportUseCase } from '../application/usecases/decideReviewReportUseCase';
import { listOpenReviewReportsUseCase } from '../application/usecases/listOpenReviewReportsUseCase';
import type { ModerationReviewReport, ReviewReportOutcome } from '../types/reviewReport';

/** Fila de denúncias abertas do admin; decidir tira a denúncia da fila. */
export function useReviewModerationQueue() {
  const [data, setData] = useState<ModerationReviewReport[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (cursor: string | null) => {
    setLoading(true);
    setError(false);
    try {
      const page = await listOpenReviewReportsUseCase(cursor);
      setData((current) => (cursor ? [...current, ...page.data] : page.data));
      setNextCursor(page.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(null);
  }, [load]);

  const decide = useCallback(async (reportId: string, outcome: ReviewReportOutcome) => {
    await decideReviewReportUseCase(reportId, outcome);
    setData((current) => current.filter((report) => report.id !== reportId));
  }, []);

  return {
    data,
    loading,
    error,
    hasMore: nextCursor !== null,
    reload: () => load(null),
    loadMore: () => load(nextCursor),
    decide,
  };
}

=== src/domain/reviews/index.ts — diff ===
@@ -16,6 +16,7 @@ export { listMyReviewsUseCase } from './application/usecases/listMyReviewsUseCas
 export { deleteReviewUseCase } from './application/usecases/deleteReviewUseCase';
 // Componente público apenas para src/app/compositions (AGENTS.md §5.2 item 5).
 export { MyReviewsView } from './components/mine/MyReviewsView';
+export { ReviewModerationQueue } from './components/moderation/ReviewModerationQueue';
 export { ReviewSection } from './components/ReviewSection';
 export { ReviewCard } from './components/ReviewCard';
 export { ReviewForm } from './components/ReviewForm';

=== src/domain/reviews/ports/reviewReportApiPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type {
  ModerationPage,
  MyReviewReport,
  ReviewReportOutcome,
  ReviewReportReason,
} from '../types/reviewReport';

export interface ReviewReportApiPort {
  report(input: {
    reviewId: string;
    reason: ReviewReportReason;
    details?: string;
  }): Promise<MyReviewReport>;
  listMine(): Promise<MyReviewReport[]>;
  listOpen(cursor?: string | null): Promise<ModerationPage>;
  decide(reportId: string, outcome: ReviewReportOutcome): Promise<void>;
}

=== src/domain/reviews/types/reviewReport.ts — ARQUIVO NOVO, conteúdo completo ===
/** Espelho dos tipos de denúncia do backend (D19). */
export const REVIEW_REPORT_REASONS = ['offensive', 'fraud', 'personal_data', 'other'] as const;
export type ReviewReportReason = (typeof REVIEW_REPORT_REASONS)[number];
export type ReviewReportStatus = 'open' | 'upheld' | 'dismissed';
export type ReviewReportOutcome = 'upheld' | 'dismissed';

export interface MyReviewReport {
  id: string;
  reviewId: string;
  status: ReviewReportStatus;
  createdAt: string;
  decideBy: string;
}

/** Linha da fila de Moderação: sem quem denunciou (o backend não envia). */
export interface ModerationReviewReport {
  id: string;
  reviewId: string;
  reason: ReviewReportReason;
  details?: string;
  status: ReviewReportStatus;
  responseText: string;
  reviewRating: number;
  reviewComment: string;
  itemId: string;
  itemCollection: 'items' | 'events';
  placeName: string | null;
  createdAt: string;
  decideBy: string;
}

export interface ModerationPage {
  data: ModerationReviewReport[];
  nextCursor: string | null;
}

=== src/shared/i18n/profileResources.ts — diff ===
@@ -35,7 +35,8 @@ export interface MyReviewsTranslation {
   moreOptions: string;
   edit: string;
   delete: string;
-  deleteConfirm: string;
+  deleteTitle: string;
+  deleteMessage: string;
   deleted: string;
   editTitle: string;
   ratingLabel: string;
@@ -123,7 +124,7 @@ export const myReviewsPtBR: MyReviewsTranslation = {
   loading: 'Carregando suas avaliações…',
   empty: 'Você ainda não avaliou nenhum lugar.',
   loadMore: 'Ver mais',
-  verified: 'Experiência verificada · {{date}}',
+  verified: 'Experiência verificada',
   stars: '{{value}} de 5 estrelas',
   rateWith_one: 'Dar {{count}} estrela',
   rateWith_other: 'Dar {{count}} estrelas',
@@ -132,7 +133,8 @@ export const myReviewsPtBR: MyReviewsTranslation = {
   moreOptions: 'Mais opções',
   edit: 'Editar',
   delete: 'Excluir',
-  deleteConfirm: 'Excluir esta avaliação? Ela sai da página do lugar e não pode ser recuperada.',
+  deleteTitle: 'Excluir esta avaliação?',
+  deleteMessage: 'A ação é definitiva e não poderá ser recuperada.',
   deleted: 'Avaliação excluída.',
   editTitle: 'Editar avaliação',
   ratingLabel: 'Sua nota',
@@ -156,7 +158,7 @@ export const myReviewsEn: MyReviewsTranslation = {
   loading: 'Loading your reviews…',
   empty: 'You have not reviewed any place yet.',
   loadMore: 'Show more',
-  verified: 'Verified experience · {{date}}',
+  verified: 'Verified experience',
   stars: '{{value}} out of 5 stars',
   rateWith_one: 'Give {{count}} star',
   rateWith_other: 'Give {{count}} stars',
@@ -165,7 +167,8 @@ export const myReviewsEn: MyReviewsTranslation = {
   moreOptions: 'More options',
   edit: 'Edit',
   delete: 'Delete',
-  deleteConfirm: 'Delete this review? It leaves the place page and cannot be recovered.',
+  deleteTitle: 'Delete this review?',
+  deleteMessage: 'This is permanent and cannot be undone.',
   deleted: 'Review deleted.',
   editTitle: 'Edit review',
   ratingLabel: 'Your rating',
@@ -189,7 +192,7 @@ export const myReviewsFr: MyReviewsTranslation = {
   loading: 'Chargement de vos avis…',
   empty: 'Vous n’avez encore évalué aucun lieu.',
   loadMore: 'Voir plus',
-  verified: 'Expérience vérifiée · {{date}}',
+  verified: 'Expérience vérifiée',
   stars: '{{value}} sur 5 étoiles',
   rateWith_one: 'Donner {{count}} étoile',
   rateWith_other: 'Donner {{count}} étoiles',
@@ -198,8 +201,8 @@ export const myReviewsFr: MyReviewsTranslation = {
   moreOptions: 'Plus d’options',
   edit: 'Modifier',
   delete: 'Supprimer',
-  deleteConfirm:
-    'Supprimer cet avis ? Il disparaît de la page du lieu et ne peut pas être récupéré.',
+  deleteTitle: 'Supprimer cet avis ?',
+  deleteMessage: 'L’action est définitive et ne pourra pas être annulée.',
   deleted: 'Avis supprimé.',
   editTitle: 'Modifier l’avis',
   ratingLabel: 'Votre note',

=== src/shared/i18n/resources.ts — diff ===
@@ -56,6 +56,12 @@ import {
   profileFr,
   profilePtBR,
 } from './profileResources';
+import {
+  type ReviewReportsTranslation,
+  reviewReportsEn,
+  reviewReportsFr,
+  reviewReportsPtBR,
+} from './reviewReportsResources';
 import {
   type TicketSessionsTranslation,
   ticketSessionsEn,
@@ -105,6 +111,7 @@ export interface TranslationResource {
   purchases: PurchasesTranslation;
   profile: ProfileTranslation;
   myReviews: MyReviewsTranslation;
+  reviewReports: ReviewReportsTranslation;
   adminFinance: AdminFinanceTranslation;
   ticketSessions: TicketSessionsTranslation;
   salesPolicy: SalesPolicyTranslation;
@@ -332,6 +339,7 @@ const ptBR: TranslationResource = {
   purchases: purchasesPtBR,
   profile: profilePtBR,
   myReviews: myReviewsPtBR,
+  reviewReports: reviewReportsPtBR,
   adminFinance: adminFinancePtBR,
   ticketSessions: ticketSessionsPtBR,
   salesPolicy: salesPolicyPtBR,
@@ -615,6 +623,7 @@ const en: TranslationResource = {
   purchases: purchasesEn,
   profile: profileEn,
   myReviews: myReviewsEn,
+  reviewReports: reviewReportsEn,
   adminFinance: adminFinanceEn,
   ticketSessions: ticketSessionsEn,
   salesPolicy: salesPolicyEn,
@@ -892,6 +901,7 @@ const fr: TranslationResource = {
   purchases: purchasesFr,
   profile: profileFr,
   myReviews: myReviewsFr,
+  reviewReports: reviewReportsFr,
   adminFinance: adminFinanceFr,
   ticketSessions: ticketSessionsFr,
   salesPolicy: salesPolicyFr,

=== src/shared/i18n/reviewReportsResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos da denúncia de resposta e da aba Moderação (D19). pt-BR é a fonte. */
type Reasons = { offensive: string; fraud: string; personal_data: string; other: string };

export interface ReviewReportsTranslation {
  action: string;
  sheet: {
    title: string;
    description: string;
    reasonLegend: string;
    detailsLabel: string;
    submit: string;
    sending: string;
  };
  reasons: Reasons;
  status: { open: string; upheld: string; dismissed: string };
  sent: string;
  errors: {
    REPORT_LIMIT_REACHED: string;
    ALREADY_REPORTED: string;
    NO_RESPONSE_TO_REPORT: string;
    generic: string;
  };
  admin: {
    tab: string;
    title: string;
    loading: string;
    empty: string;
    unknownPlace: string;
    review: string;
    response: string;
    reason: string;
    details: string;
    decideBy: string;
    uphold: string;
    dismiss: string;
    upholdConfirm: string;
    upheld: string;
    dismissed: string;
    loadMore: string;
    errors: { load: string; decide: string; ALREADY_DECIDED: string };
  };
}

export const reviewReportsPtBR: ReviewReportsTranslation = {
  action: 'Denunciar resposta',
  sheet: {
    title: 'Denunciar resposta',
    description:
      '{{place}}. A equipe do Use Guide analisa e responde em até 3 dias. O estabelecimento não fica sabendo quem denunciou.',
    reasonLegend: 'Motivo',
    detailsLabel: 'Conte o que aconteceu (opcional)',
    submit: 'Enviar denúncia',
    sending: 'Enviando…',
  },
  reasons: {
    offensive: 'Ofensiva ou desrespeitosa',
    fraud: 'Fraude ou golpe',
    personal_data: 'Expõe dados pessoais',
    other: 'Outro motivo',
  },
  status: {
    open: 'Denúncia em análise · resposta até {{date}}',
    upheld: 'Denúncia aceita: a resposta foi removida',
    dismissed: 'Denúncia analisada: a resposta foi mantida',
  },
  sent: 'Denúncia enviada. O resultado aparece aqui no cartão.',
  errors: {
    REPORT_LIMIT_REACHED: 'Você já enviou muitas denúncias hoje. Tente de novo amanhã.',
    ALREADY_REPORTED: 'Você já denunciou esta resposta.',
    NO_RESPONSE_TO_REPORT: 'Esta avaliação não tem mais resposta.',
    generic: 'Não foi possível enviar a denúncia.',
  },
  admin: {
    tab: 'Moderação',
    title: 'Denúncias de respostas',
    loading: 'Carregando denúncias…',
    empty: 'Nenhuma denúncia para analisar.',
    unknownPlace: 'Lugar fora do guia',
    review: 'Avaliação · {{rating}} de 5',
    response: 'Resposta denunciada',
    reason: 'Motivo: {{reason}}',
    details: 'Relato: {{details}}',
    decideBy: 'Responder até {{date}}',
    uphold: 'Remover resposta',
    dismiss: 'Manter resposta',
    upholdConfirm: 'Remover a resposta do estabelecimento? A avaliação continua publicada.',
    upheld: 'Resposta removida.',
    dismissed: 'Denúncia recusada; a resposta continua.',
    loadMore: 'Ver mais',
    errors: {
      load: 'Não foi possível carregar as denúncias.',
      decide: 'Não foi possível registrar a decisão.',
      ALREADY_DECIDED: 'Esta denúncia já foi decidida.',
    },
  },
};

export const reviewReportsEn: ReviewReportsTranslation = {
  action: 'Report response',
  sheet: {
    title: 'Report response',
    description:
      '{{place}}. The Use Guide team reviews it and replies within 3 days. The business does not find out who reported it.',
    reasonLegend: 'Reason',
    detailsLabel: 'Tell us what happened (optional)',
    submit: 'Send report',
    sending: 'Sending…',
  },
  reasons: {
    offensive: 'Offensive or disrespectful',
    fraud: 'Fraud or scam',
    personal_data: 'Exposes personal data',
    other: 'Other reason',
  },
  status: {
    open: 'Report under review · answer by {{date}}',
    upheld: 'Report accepted: the response was removed',
    dismissed: 'Report reviewed: the response was kept',
  },
  sent: 'Report sent. The result shows up here on the card.',
  errors: {
    REPORT_LIMIT_REACHED: 'You have sent too many reports today. Try again tomorrow.',
    ALREADY_REPORTED: 'You have already reported this response.',
    NO_RESPONSE_TO_REPORT: 'This review no longer has a response.',
    generic: 'Could not send the report.',
  },
  admin: {
    tab: 'Moderation',
    title: 'Reported responses',
    loading: 'Loading reports…',
    empty: 'No reports to review.',
    unknownPlace: 'Place no longer in the guide',
    review: 'Review · {{rating}} out of 5',
    response: 'Reported response',
    reason: 'Reason: {{reason}}',
    details: 'Details: {{details}}',
    decideBy: 'Answer by {{date}}',
    uphold: 'Remove response',
    dismiss: 'Keep response',
    upholdConfirm: 'Remove the business response? The review stays published.',
    upheld: 'Response removed.',
    dismissed: 'Report dismissed; the response stays.',
    loadMore: 'Show more',
    errors: {
      load: 'Could not load the reports.',
      decide: 'Could not record the decision.',
      ALREADY_DECIDED: 'This report has already been decided.',
    },
  },
};

export const reviewReportsFr: ReviewReportsTranslation = {
  action: 'Signaler la réponse',
  sheet: {
    title: 'Signaler la réponse',
    description:
      '{{place}}. L’équipe Use Guide l’examine et répond sous 3 jours. L’établissement ne sait pas qui l’a signalée.',
    reasonLegend: 'Motif',
    detailsLabel: 'Racontez ce qui s’est passé (facultatif)',
    submit: 'Envoyer le signalement',
    sending: 'Envoi…',
  },
  reasons: {
    offensive: 'Offensante ou irrespectueuse',
    fraud: 'Fraude ou arnaque',
    personal_data: 'Expose des données personnelles',
    other: 'Autre motif',
  },
  status: {
    open: 'Signalement en cours d’examen · réponse avant le {{date}}',
    upheld: 'Signalement accepté : la réponse a été retirée',
    dismissed: 'Signalement examiné : la réponse a été conservée',
  },
  sent: 'Signalement envoyé. Le résultat apparaît ici sur la carte.',
  errors: {
    REPORT_LIMIT_REACHED: 'Vous avez envoyé trop de signalements aujourd’hui. Réessayez demain.',
    ALREADY_REPORTED: 'Vous avez déjà signalé cette réponse.',
    NO_RESPONSE_TO_REPORT: 'Cet avis n’a plus de réponse.',
    generic: 'Impossible d’envoyer le signalement.',
  },
  admin: {
    tab: 'Modération',
    title: 'Réponses signalées',
    loading: 'Chargement des signalements…',
    empty: 'Aucun signalement à examiner.',
    unknownPlace: 'Lieu absent du guide',
    review: 'Avis · {{rating}} sur 5',
    response: 'Réponse signalée',
    reason: 'Motif : {{reason}}',
    details: 'Récit : {{details}}',
    decideBy: 'Répondre avant le {{date}}',
    uphold: 'Retirer la réponse',
    dismiss: 'Conserver la réponse',
    upholdConfirm: 'Retirer la réponse de l’établissement ? L’avis reste publié.',
    upheld: 'Réponse retirée.',
    dismissed: 'Signalement refusé ; la réponse reste.',
    loadMore: 'Voir plus',
    errors: {
      load: 'Impossible de charger les signalements.',
      decide: 'Impossible d’enregistrer la décision.',
      ALREADY_DECIDED: 'Ce signalement a déjà été traité.',
    },
  },
};

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`, `npm run test:rules` (firestore.rules mudou);
- testes ligados aos arquivos deste prompt: `npx vitest related --run firestore.rules.security.test.ts server.ts server/domain/reviews/adapters/firestoreReviewReportAdapter.ts server/domain/reviews/adapters/inMemoryReviewReportAdapter.ts server/domain/reviews/controllers/reviewReportController.test.ts server/domain/reviews/controllers/reviewReportController.ts server/domain/reviews/errors/reviewReportError.ts server/domain/reviews/factory.ts server/domain/reviews/index.ts server/domain/reviews/ports/reviewReportPort.ts server/domain/reviews/routes/reviewReportRoutes.ts server/domain/reviews/schemas/reviewReportSchemas.ts server/domain/reviews/services/reviewReportService.test.ts server/domain/reviews/services/reviewReportService.ts server/domain/reviews/types/reviewReport.ts server/domain/reviews/usecases/decideReviewReportUseCase.ts server/domain/reviews/usecases/deleteReviewsByUserUseCase.ts server/domain/reviews/usecases/listMyReviewReportsUseCase.ts server/domain/reviews/usecases/listOpenReviewReportsUseCase.ts server/domain/reviews/usecases/reportReviewResponseUseCase.ts server/domain/reviews/utils/reviewReportId.ts src/app/compositions/AdminPanelComposition.tsx src/domain/admin/components/AdminPanel.tsx src/domain/admin/components/subcomponents/AdminNavigation.tsx src/domain/reviews/adapters/httpReviewReportAdapter.ts src/domain/reviews/application/usecases/decideReviewReportUseCase.ts src/domain/reviews/application/usecases/listMyReviewReportsUseCase.ts src/domain/reviews/application/usecases/listOpenReviewReportsUseCase.ts src/domain/reviews/application/usecases/reportReviewResponseUseCase.ts src/domain/reviews/components/mine/MyReviewCard.tsx src/domain/reviews/components/mine/MyReviewsView.test.tsx src/domain/reviews/components/mine/MyReviewsView.tsx src/domain/reviews/components/mine/ReportResponseSheet.tsx src/domain/reviews/components/moderation/ReviewModerationQueue.test.tsx src/domain/reviews/components/moderation/ReviewModerationQueue.tsx src/domain/reviews/factory.ts src/domain/reviews/hooks/useMyReviewReports.ts src/domain/reviews/hooks/useReviewModerationQueue.ts src/domain/reviews/index.ts src/domain/reviews/ports/reviewReportApiPort.ts src/domain/reviews/types/reviewReport.ts src/shared/i18n/profileResources.ts src/shared/i18n/resources.ts src/shared/i18n/reviewReportsResources.ts` (todos verdes). Não precisa rodar a suíte inteira.
- em Minhas avaliações, numa avaliação com resposta: menu "…" › Denunciar resposta › escolha um motivo › Enviar; o cartão passa a mostrar "Denúncia em análise". No painel do admin, aba Moderação: a denúncia aparece; Remover resposta pede confirmação e tira a resposta da avaliação.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique as regras do Firestore: `firebase deploy --only firestore:rules` (coleção `reviewReports` fechada para o navegador).
2. Publique os índices do Firestore: `firebase deploy --only firestore:indexes` (dois índices novos de `reviewReports`: `reporterUid` + `createdAt` decrescente e `status` + `createdAt` crescente). Sem eles, denunciar e a aba Moderação retornam erro.
