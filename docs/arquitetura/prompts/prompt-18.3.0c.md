# Prompt 18.3.0c — Telas de verificação por estabelecimento

> Lote 13, gerado do commits de referência `3e75156` e `3406b93` da branch `claude/agents-md-v2`. Aplique depois do A4. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.3.0c — Telas de verificação por estabelecimento (D12)

Decisão D12 (2026-10-19). Usa o backend do 18.3.0a.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint (AGENTS.md §13). Nenhuma dependência nova.

DECISÃO D12 (docs/arquitetura/decisoes.md): cada estabelecimento é verificado pelo admin; só verificado com CNPJ vende. O backend já existe (18.3.0a); este prompt faz as telas.

O QUE MUDA:
1) Backend: a fila do admin (GET /api/listing-verifications) passa por um caso de uso de aplicação novo, listListingVerificationsApplicationUseCase:
   - completa cada linha com o nome e a categoria do estabelecimento e o nome do dono (sem e-mail);
   - tira da fila os perfis de produtor vinculados, que seguem o estabelecimento de origem.
2) Domínio media (frontend): uploadVerificationFileUseCase envia o arquivo para POST /api/media/verification-files e recebe só o fileId (sem URL).
3) Domínio partners (frontend):
   - tipos, port, adapter HTTP e 5 casos de uso (get, submit, list, review, readFile);
   - schema do formulário com mensagens em chaves de tradução;
   - hooks useListingVerification (envia só os arquivos que a escolha exige) e useVerificationQueue;
   - components/verification/: selo de status em cada cadastro do painel, diálogo de envio (CPF ou CNPJ, vínculo, arquivos, Cadastur; o perfil de produtor escolhe um estabelecimento da conta), painel de status com documento mascarado, fila do admin (filtro por status, abrir arquivos privados, aprovar com confirmação, recusar com motivo).
4) Painel do parceiro: selo em cada cadastro (PartnerItemsTable) e diálogo (PartnerPanel). Fim da inscrição (Step6Success): próximo passo aponta para a verificação.
5) Painel admin: aba Verificações, montada pela composição (AdminPanelComposition → renderVerificationQueue). O domínio admin não importa o partners (§5.3).
6) i18n: src/shared/i18n/verificationResources.ts e partnersResources.ts nos 3 idiomas, registrados em resources.ts; erros traduzidos pelo code (§12.5); datas no fuso America/Fortaleza.
7) Ajustes vistos no preview:
   - ConfirmDialog (src/ui) ganha tone 'positive' (botão verde) e confirmLabel; Cancelar/Confirmar traduzidos (common.cancel, common.confirm); confirmAction(message, options) no useUIStore;
   - aprovar verificação usa o tom positivo e o rótulo "Aprovar";
   - Step6Success traduzido, com a verificação como primeiro dos próximos passos;
   - PartnerItemsTable: o cartão deixa de ser role="button"; um botão "Editar {{nome}}" cobre o cartão e o selo e o interruptor ficam por cima (sem botão dentro de botão, §11.7).

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/application/usecases/listingVerification/listListingVerificationsApplicationUseCase.test.ts (criar)
- server/application/usecases/listingVerification/listListingVerificationsApplicationUseCase.ts (criar)
- server/interfaces/http/listingVerifications/listingVerificationController.test.ts (alterar)
- server/interfaces/http/listingVerifications/listingVerificationController.ts (alterar)
- src/app/compositions/AdminPanelComposition.tsx (alterar)
- src/domain/admin/components/AdminPanel.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminNavigation.tsx (alterar)
- src/domain/media/adapters/apiVerificationFileAdapter.ts (criar)
- src/domain/media/application/usecases/uploadVerificationFileUseCase.ts (criar)
- src/domain/media/factory.ts (alterar)
- src/domain/media/index.ts (alterar)
- src/domain/media/ports/verificationFilePort.ts (criar)
- src/domain/partners/adapters/apiListingVerificationAdapter.test.ts (criar)
- src/domain/partners/adapters/apiListingVerificationAdapter.ts (criar)
- src/domain/partners/application/usecases/getListingVerificationUseCase.ts (criar)
- src/domain/partners/application/usecases/listListingVerificationsUseCase.ts (criar)
- src/domain/partners/application/usecases/readVerificationFileUseCase.ts (criar)
- src/domain/partners/application/usecases/reviewListingVerificationUseCase.ts (criar)
- src/domain/partners/application/usecases/submitListingVerificationUseCase.ts (criar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/components/steps/Step6Success.tsx (alterar)
- src/domain/partners/components/subcomponents/PartnerItemsTable.test.tsx (criar)
- src/domain/partners/components/subcomponents/PartnerItemsTable.tsx (alterar)
- src/domain/partners/components/verification/DocumentVerificationForm.tsx (criar)
- src/domain/partners/components/verification/LinkedVerificationForm.tsx (criar)
- src/domain/partners/components/verification/ListingVerificationDialog.test.tsx (criar)
- src/domain/partners/components/verification/ListingVerificationDialog.tsx (criar)
- src/domain/partners/components/verification/ListingVerificationQueue.tsx (criar)
- src/domain/partners/components/verification/VerificationFileField.tsx (criar)
- src/domain/partners/components/verification/VerificationQueueCard.test.tsx (criar)
- src/domain/partners/components/verification/VerificationQueueCard.tsx (criar)
- src/domain/partners/components/verification/VerificationRadioGroup.tsx (criar)
- src/domain/partners/components/verification/VerificationStatusChip.tsx (criar)
- src/domain/partners/components/verification/VerificationStatusPanel.tsx (criar)
- src/domain/partners/components/verification/verificationListingOption.ts (criar)
- src/domain/partners/components/verification/verificationStatusStyle.ts (criar)
- src/domain/partners/factory.ts (alterar)
- src/domain/partners/hooks/useListingVerification.test.ts (criar)
- src/domain/partners/hooks/useListingVerification.ts (criar)
- src/domain/partners/hooks/useVerificationQueue.ts (criar)
- src/domain/partners/index.ts (alterar)
- src/domain/partners/ports/listingVerificationPort.ts (criar)
- src/domain/partners/schemas/listingVerificationFormSchema.test.ts (criar)
- src/domain/partners/schemas/listingVerificationFormSchema.ts (criar)
- src/domain/partners/types/listingVerification.ts (criar)
- src/domain/partners/utils/verificationErrorMessage.ts (criar)
- src/shared/i18n/partnersResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/i18n/verificationResources.ts (criar)
- src/shared/stores/useUIStore.ts (alterar)
- src/ui/components/ConfirmDialog.tsx (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/application/usecases/listingVerification/listListingVerificationsApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ list: vi.fn(), getItem: vi.fn(), profiles: vi.fn() }));

vi.mock('../../../domain/guide', () => ({ getItemByIdUseCase: mocks.getItem }));
vi.mock('../../../domain/users', () => ({ getUserProfilesBatchUseCase: mocks.profiles }));
vi.mock('../../../domain/partners', () => ({ listListingVerificationsUseCase: mocks.list }));

import { listListingVerificationsApplicationUseCase } from './listListingVerificationsApplicationUseCase';

const admin = { uid: 'admin-1', admin: true };

describe('listListingVerificationsApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('completa cada linha com o nome do estabelecimento e do dono, sem e-mail nem perfis vinculados', async () => {
    mocks.list.mockResolvedValue({
      data: [
        { itemId: 'item-1', ownerId: 'owner-1', mode: 'document', status: 'pending' },
        { itemId: 'item-3', ownerId: 'owner-1', mode: 'linked', status: 'pending' },
      ],
      nextCursor: 'item-1',
    });
    mocks.getItem.mockResolvedValue({ id: 'item-1', name: 'Pousada Sol', category: 'hotel' });
    mocks.profiles.mockResolvedValue({
      'owner-1': { firstName: 'Ana', lastName: 'Silva', email: 'ana@exemplo.com' },
    });

    const page = await listListingVerificationsApplicationUseCase(admin, 'pending', 20, null);

    expect(mocks.profiles).toHaveBeenCalledWith(['owner-1']);
    expect(page.nextCursor).toBe('item-1');
    expect(page.data).toHaveLength(1);
    expect(mocks.getItem).toHaveBeenCalledTimes(1);
    expect(page.data[0]).toMatchObject({
      listingName: 'Pousada Sol',
      listingCategory: 'hotel',
      ownerName: 'Ana Silva',
    });
    expect(JSON.stringify(page)).not.toContain('ana@exemplo.com');
  });

  it('fila vazia não consulta guia nem usuários', async () => {
    mocks.list.mockResolvedValue({ data: [], nextCursor: null });
    await expect(
      listListingVerificationsApplicationUseCase(admin, 'pending', 20, null)
    ).resolves.toEqual({ data: [], nextCursor: null });
    expect(mocks.getItem).not.toHaveBeenCalled();
    expect(mocks.profiles).not.toHaveBeenCalled();
  });
});

=== server/application/usecases/listingVerification/listListingVerificationsApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getItemByIdUseCase } from '../../../domain/guide';
import {
  type ListingVerificationStatus,
  type ListingVerificationView,
  listListingVerificationsUseCase,
} from '../../../domain/partners';
import { getUserProfilesBatchUseCase } from '../../../domain/users';

/** Linha da fila do admin: a verificação com o nome do estabelecimento e de quem enviou. */
export interface ListingVerificationQueueEntry extends ListingVerificationView {
  listingName: string;
  listingCategory: string;
  ownerName: string;
}

export async function listListingVerificationsApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  status: ListingVerificationStatus,
  limit: number,
  cursor: string | null
): Promise<{ data: ListingVerificationQueueEntry[]; nextCursor: string | null }> {
  const page = await listListingVerificationsUseCase(actor, status, limit, cursor);
  // Perfil de produtor vinculado não tem documento próprio: segue o estabelecimento de origem.
  const reviewable = page.data.filter((view) => view.mode === 'document');
  if (reviewable.length === 0) return { data: [], nextCursor: page.nextCursor };

  const [items, owners] = await Promise.all([
    Promise.all(reviewable.map((view) => getItemByIdUseCase(view.itemId))),
    getUserProfilesBatchUseCase([...new Set(reviewable.map((view) => view.ownerId))]),
  ]);

  return {
    data: reviewable.map((view, index) => {
      const item = items[index];
      const owner = owners[view.ownerId];
      return {
        ...view,
        listingName: typeof item?.name === 'string' ? item.name : '',
        listingCategory: String(item?.category ?? ''),
        ownerName: [owner?.firstName, owner?.lastName].filter(Boolean).join(' '),
      };
    }),
    nextCursor: page.nextCursor,
  };
}

=== server/interfaces/http/listingVerifications/listingVerificationController.test.ts — diff ===
@@ -30,13 +30,18 @@ vi.mock(
     readListingVerificationFileApplicationUseCase: mocks.readFile,
   })
 );
+vi.mock(
+  '../../../application/usecases/listingVerification/listListingVerificationsApplicationUseCase',
+  () => ({
+    listListingVerificationsApplicationUseCase: mocks.list,
+  })
+);
 vi.mock('../../../domain/partners', async () => {
   const { ListingVerificationError } = await import(
     '../../../domain/partners/errors/listingVerificationError'
   );
   return {
     ListingVerificationError,
-    listListingVerificationsUseCase: mocks.list,
     reviewListingVerificationUseCase: mocks.review,
   };
 });

=== server/interfaces/http/listingVerifications/listingVerificationController.ts — diff ===
@@ -1,10 +1,10 @@
 import type { Response } from 'express';
 import { getListingVerificationApplicationUseCase } from '../../../application/usecases/listingVerification/getListingVerificationApplicationUseCase';
+import { listListingVerificationsApplicationUseCase } from '../../../application/usecases/listingVerification/listListingVerificationsApplicationUseCase';
 import { readListingVerificationFileApplicationUseCase } from '../../../application/usecases/listingVerification/readListingVerificationFileApplicationUseCase';
 import { submitListingVerificationApplicationUseCase } from '../../../application/usecases/listingVerification/submitListingVerificationApplicationUseCase';
 import {
   ListingVerificationError,
-  listListingVerificationsUseCase,
   reviewListingVerificationUseCase,
 } from '../../../domain/partners';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
@@ -79,7 +79,7 @@ export class ListingVerificationController {
     const query = ListListingVerificationsQuerySchema.safeParse(req.query);
     if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Filtro inválido.');
     try {
-      const page = await listListingVerificationsUseCase(
+      const page = await listListingVerificationsApplicationUseCase(
         actor,
         query.data.status,
         query.data.limit,

=== src/app/compositions/AdminPanelComposition.tsx — diff ===
@@ -11,6 +11,7 @@ import {
 } from '../../domain/guide';
 import {
   ListingEditor,
+  ListingVerificationQueue,
   type PartnerContentItemInput,
   type PartnerContentRecord,
 } from '../../domain/partners';
@@ -80,13 +81,14 @@ function AdminListingEditor({ item, onClose }: AdminListingEditorProps) {
 }
 
 /**
- * Painel admin com os editores compartilhados: cadastro (o mesmo do parceiro, decisão D9), sessões do
- * evento e gerenciador de ingressos.
+ * Painel admin com os editores compartilhados: cadastro (o mesmo do parceiro, decisão D9), fila de
+ * verificação dos estabelecimentos (D12), sessões do evento e gerenciador de ingressos.
  */
 export function AdminPanelComposition() {
   return (
     <AdminDispatcher
       renderListingEditor={(props) => <AdminListingEditor {...props} />}
+      renderVerificationQueue={() => <ListingVerificationQueue />}
       renderSessionsField={(props) => <EventSessionsField {...props} />}
       renderTicketingManager={(eventListingId) => (
         <PartnerEventTicketingManager eventListingId={eventListingId} asAdmin />

=== src/domain/admin/components/AdminPanel.tsx — diff ===
@@ -65,10 +65,13 @@ export interface AdminPanelProps extends AdminEventSlots {
    * continuam no editor próprio do admin.
    */
   renderListingEditor?: (props: AdminListingEditorProps) => ReactNode;
+  /** Fila de verificação dos estabelecimentos (domínio partners), montada pela composição. */
+  renderVerificationQueue?: () => ReactNode;
 }
 
 export function AdminPanel({
   renderListingEditor,
+  renderVerificationQueue,
   renderSessionsField,
   renderTicketingManager,
 }: AdminPanelProps = {}) {
@@ -262,7 +265,11 @@ export function AdminPanel({
           </div>
         </motion.div>
 
-        <AdminNavigation activeTab={activeTab} onSelectTab={setActiveTab} />
+        <AdminNavigation
+          activeTab={activeTab}
+          onSelectTab={setActiveTab}
+          showVerifications={Boolean(renderVerificationQueue)}
+        />
 
         <AnimatePresence mode="wait">
           <motion.div
@@ -295,6 +302,8 @@ export function AdminPanel({
                   onDeletePartner={handleDeletePartner}
                 />
               )
+            ) : activeTab === 'verifications' ? (
+              renderVerificationQueue?.()
             ) : activeTab === 'plans' ? (
               <AdminPlansView />
             ) : activeTab === 'notifications' ? (

=== src/domain/admin/components/subcomponents/AdminNavigation.tsx — diff ===
@@ -1,13 +1,23 @@
-import React from 'react';
+
 import { motion } from 'motion/react';
-import { Award, Bell, Calendar, Database, Layers, Users } from 'lucide-react';
+import { Award, Bell, Calendar, Database, Layers, ShieldCheck, Users } from 'lucide-react';
+import { useTranslation } from 'react-i18next';
 import { cn } from '../../../../shared/utils/cn';
 
-export type AdminTabId = 'items' | 'events' | 'reports' | 'partners' | 'plans' | 'notifications';
+export type AdminTabId =
+  | 'items'
+  | 'events'
+  | 'reports'
+  | 'partners'
+  | 'verifications'
+  | 'plans'
+  | 'notifications';
 
 interface AdminNavigationProps {
   activeTab: AdminTabId;
   onSelectTab: (tab: AdminTabId) => void;
+  /** A fila de verificação vem de outro domínio; a aba só aparece quando a composição a monta. */
+  showVerifications?: boolean;
 }
 
 const ADMIN_TABS = [
@@ -25,6 +35,13 @@ const ADMIN_TABS = [
     color: 'bg-indigo-500',
     shadow: 'shadow-indigo-500/40',
   },
+  {
+    id: 'verifications' as const,
+    label: '',
+    icon: ShieldCheck,
+    color: 'bg-emerald-500',
+    shadow: 'shadow-emerald-500/40',
+  },
   {
     id: 'items' as const,
     label: 'Guia Local',
@@ -55,7 +72,15 @@ const ADMIN_TABS = [
   },
 ];
 
-export function AdminNavigation({ activeTab, onSelectTab }: AdminNavigationProps) {
+export function AdminNavigation({
+  activeTab,
+  onSelectTab,
+  showVerifications = false,
+}: AdminNavigationProps) {
+  const { t } = useTranslation();
+  const tabs = ADMIN_TABS.filter((tab) => tab.id !== 'verifications' || showVerifications).map(
+    (tab) => (tab.id === 'verifications' ? { ...tab, label: t('verification.admin.tab') } : tab)
+  );
   return (
     <motion.div
       initial={{ opacity: 0, scale: 0.95 }}
@@ -63,7 +88,7 @@ export function AdminNavigation({ activeTab, onSelectTab }: AdminNavigationProps
       className="flex gap-2 p-2 glassmorphism rounded-[2rem] sticky top-20 z-50 shadow-2xl"
       id="admin-navigation-tabs"
     >
-      {ADMIN_TABS.map((tab) => (
+      {tabs.map((tab) => (
         <button
           key={tab.id}
           type="button"

=== src/domain/media/adapters/apiVerificationFileAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { VerificationFilePort } from '../ports/verificationFilePort';

// Mesmo limite do servidor (MAX_IMAGE_BYTES); a checagem aqui só evita enviar 6 MB à toa.
const MAX_FILE_BYTES = 6 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('INVALID_DOCUMENT_FILE'));
    reader.onerror = () => reject(new Error('INVALID_DOCUMENT_FILE'));
    reader.readAsDataURL(file);
  });
}

export class ApiVerificationFileAdapter implements VerificationFilePort {
  async uploadVerificationFile(file: File): Promise<{ fileId: string }> {
    if (file.size > MAX_FILE_BYTES) throw new Error('IMAGE_TOO_LARGE');
    // O tipo real é conferido no servidor pelo conteúdo; aqui só barra o que nem é documento.
    if (!ACCEPTED_TYPES.includes(file.type)) throw new Error('INVALID_DOCUMENT_FILE');
    const fileBase64 = await readAsDataUrl(file);
    const response = await firebaseApiFetch(
      '/api/media/verification-files',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64 }),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof data?.error?.code === 'string' ? data.error.code : 'UPLOAD_FAILED');
    }
    return { fileId: String(data.fileId) };
  }
}

=== src/domain/media/application/usecases/uploadVerificationFileUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { verificationFileAdapter } from '../../factory';

export async function uploadVerificationFileUseCase(file: File): Promise<{ fileId: string }> {
  return verificationFileAdapter.uploadVerificationFile(file);
}

=== src/domain/media/factory.ts — diff ===
@@ -5,3 +5,7 @@ import { ImageUploadPort } from './ports/imageUploadPort';
 
 export const profileMediaAdapter: ProfileMediaPort = new ApiProfileMediaAdapter();
 export const imageUploadAdapter: ImageUploadPort = new ApiImageUploadAdapter();
+import { ApiVerificationFileAdapter } from './adapters/apiVerificationFileAdapter';
+import type { VerificationFilePort } from './ports/verificationFilePort';
+
+export const verificationFileAdapter: VerificationFilePort = new ApiVerificationFileAdapter();

=== src/domain/media/index.ts — diff ===
@@ -1,5 +1,6 @@
 export { getImageUploadErrorMessage } from './utils/imageUploadErrorMessage';
 export { uploadImageUseCase } from './application/usecases/uploadImageUseCase';
+export { uploadVerificationFileUseCase } from './application/usecases/uploadVerificationFileUseCase';
 export { uploadProfilePhotoUseCase } from './application/usecases/uploadProfilePhotoUseCase';
 export type { ImageUploadFolder, ImageUploadPort } from './ports/imageUploadPort';
 export type { ProfileMediaPort } from './ports/profileMediaPort';

=== src/domain/media/ports/verificationFilePort.ts — ARQUIVO NOVO, conteúdo completo ===
/** Documento de verificação: privado, sem URL. O backend devolve só o identificador do arquivo. */
export interface VerificationFilePort {
  uploadVerificationFile(file: File): Promise<{ fileId: string }>;
}

=== src/domain/partners/adapters/apiListingVerificationAdapter.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.hoisted(() => vi.fn());
vi.mock('../../../shared/infrastructure/firebase/firebaseApiFetch', () => ({
  firebaseApiFetch: fetchMock,
}));

import { ApiListingVerificationAdapter } from './apiListingVerificationAdapter';

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

describe('ApiListingVerificationAdapter', () => {
  const adapter = new ApiListingVerificationAdapter();
  beforeEach(() => fetchMock.mockReset());

  it('envia a verificação por PUT com autenticação e App Check', async () => {
    fetchMock.mockResolvedValue(ok({ data: { itemId: 'item-1', status: 'pending' } }));
    await adapter.submit('item-1', { mode: 'linked', sourceItemId: 'item-2' });
    const [path, init, options] = fetchMock.mock.calls[0] ?? [];
    expect(path).toBe('/api/listing-verifications/item-1');
    expect(init).toMatchObject({ method: 'PUT' });
    expect(options).toEqual({ requireAuth: true, requireAppCheck: true });
  });

  it('lista a fila com status, limite e cursor na query', async () => {
    fetchMock.mockResolvedValue(ok({ data: [], nextCursor: null }));
    await adapter.list('rejected', 'item-9');
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      '/api/listing-verifications?status=rejected&limit=20&cursor=item-9'
    );
  });

  it('lança o code estável do erro', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'NOT_PENDING' } }), { status: 409 })
    );
    await expect(adapter.review('item-1', 'approve', null)).rejects.toThrow('NOT_PENDING');
  });
});

=== src/domain/partners/adapters/apiListingVerificationAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { ListingVerificationPort } from '../ports/listingVerificationPort';
import type {
  ListingVerificationQueuePage,
  ListingVerificationStatus,
  ListingVerificationView,
  SubmitListingVerificationPayload,
  VerificationDecision,
  VerificationFileKind,
} from '../types/listingVerification';

const OPTIONS = { requireAuth: true, requireAppCheck: true } as const;
const QUEUE_PAGE_SIZE = 20;

const itemPath = (itemId: string) => `/api/listing-verifications/${encodeURIComponent(itemId)}`;

async function fail(response: Response): Promise<never> {
  const data = await response.json().catch(() => ({}));
  throw new Error(typeof data?.error?.code === 'string' ? data.error.code : 'INTERNAL_ERROR');
}

/** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
async function call<T>(path: string, init: RequestInit = { method: 'GET' }): Promise<T> {
  const response = await firebaseApiFetch(path, init, OPTIONS);
  if (!response.ok) return fail(response);
  return (await response.json()) as T;
}

function json(method: 'PUT' | 'POST', body: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

export class ApiListingVerificationAdapter implements ListingVerificationPort {
  async get(itemId: string): Promise<ListingVerificationView> {
    return (await call<{ data: ListingVerificationView }>(itemPath(itemId))).data;
  }

  async submit(
    itemId: string,
    payload: SubmitListingVerificationPayload
  ): Promise<ListingVerificationView> {
    return (await call<{ data: ListingVerificationView }>(itemPath(itemId), json('PUT', payload)))
      .data;
  }

  async list(
    status: ListingVerificationStatus,
    cursor: string | null
  ): Promise<ListingVerificationQueuePage> {
    const query = new URLSearchParams({ status, limit: String(QUEUE_PAGE_SIZE) });
    if (cursor) query.set('cursor', cursor);
    return call(`/api/listing-verifications?${query.toString()}`);
  }

  async review(
    itemId: string,
    decision: VerificationDecision,
    reason: string | null
  ): Promise<ListingVerificationView> {
    const body = reason ? { decision, reason } : { decision };
    return (
      await call<{ data: ListingVerificationView }>(
        `${itemPath(itemId)}/review`,
        json('POST', body)
      )
    ).data;
  }

  async readFile(itemId: string, kind: VerificationFileKind): Promise<Blob> {
    const response = await firebaseApiFetch(`${itemPath(itemId)}/files/${kind}`, {}, OPTIONS);
    if (!response.ok) return fail(response);
    return response.blob();
  }
}

=== src/domain/partners/application/usecases/getListingVerificationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingVerificationAdapter } from '../../factory';
import type { ListingVerificationView } from '../../types/listingVerification';

export function getListingVerificationUseCase(itemId: string): Promise<ListingVerificationView> {
  return listingVerificationAdapter.get(itemId);
}

=== src/domain/partners/application/usecases/listListingVerificationsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingVerificationAdapter } from '../../factory';
import type {
  ListingVerificationQueuePage,
  ListingVerificationStatus,
} from '../../types/listingVerification';

export function listListingVerificationsUseCase(
  status: ListingVerificationStatus,
  cursor: string | null
): Promise<ListingVerificationQueuePage> {
  return listingVerificationAdapter.list(status, cursor);
}

=== src/domain/partners/application/usecases/readVerificationFileUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingVerificationAdapter } from '../../factory';
import type { VerificationFileKind } from '../../types/listingVerification';

export function readVerificationFileUseCase(
  itemId: string,
  kind: VerificationFileKind
): Promise<Blob> {
  return listingVerificationAdapter.readFile(itemId, kind);
}

=== src/domain/partners/application/usecases/reviewListingVerificationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingVerificationAdapter } from '../../factory';
import type {
  ListingVerificationView,
  VerificationDecision,
} from '../../types/listingVerification';

export function reviewListingVerificationUseCase(
  itemId: string,
  decision: VerificationDecision,
  reason: string | null
): Promise<ListingVerificationView> {
  return listingVerificationAdapter.review(itemId, decision, reason);
}

=== src/domain/partners/application/usecases/submitListingVerificationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingVerificationAdapter } from '../../factory';
import type {
  ListingVerificationView,
  SubmitListingVerificationPayload,
} from '../../types/listingVerification';

export function submitListingVerificationUseCase(
  itemId: string,
  payload: SubmitListingVerificationPayload
): Promise<ListingVerificationView> {
  return listingVerificationAdapter.submit(itemId, payload);
}

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -19,6 +19,8 @@ import { PartnerEventsTable } from './subcomponents/PartnerEventsTable';
 import { PartnerHeader } from './subcomponents/PartnerHeader';
 import { PartnerItemsTable } from './subcomponents/PartnerItemsTable';
 import { PartnerTabsNavigation } from './subcomponents/PartnerTabsNavigation';
+import { ListingVerificationDialog } from './verification/ListingVerificationDialog';
+import type { VerificationListingOption } from './verification/verificationListingOption';
 import { PlansModal } from './subcomponents/PlansModal';
 import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
 
@@ -97,6 +99,12 @@ export function PartnerPanel({
     setIsEditing((current) => (current ? { ...current, sessions } : current))
   );
 
+  const [verifyingListing, setVerifyingListing] = React.useState<VerificationListingOption | null>(
+    null
+  );
+  // Troca a chave dos selos de verificação para relerem o status depois de um envio.
+  const [verificationVersion, setVerificationVersion] = React.useState(0);
+
   const [showPlansModal, setShowPlansModal] = React.useState(false);
   const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
   const [checkoutPlanInfo, setCheckoutPlanInfo] = React.useState({
@@ -197,6 +205,10 @@ export function PartnerPanel({
               onEditItem={(item) => setEditingListing(item)}
               onToggleActive={handleToggleActive}
               onCreateNew={() => setEditingListing(null)}
+              verificationVersion={verificationVersion}
+              onVerifyItem={(item) =>
+                setVerifyingListing({ id: item.id, name: item.name, category: item.category })
+              }
             />
             {renderBookableOffersManager?.(
               itemsList.map((item) => ({ id: item.id, name: item.name, category: item.category }))
@@ -275,6 +287,21 @@ export function PartnerPanel({
         )}
       </AnimatePresence>
 
+      {verifyingListing && (
+        <ListingVerificationDialog
+          listing={verifyingListing}
+          accountListings={itemsList.map((item) => ({
+            id: item.id,
+            name: item.name,
+            category: item.category,
+          }))}
+          onClose={() => {
+            setVerifyingListing(null);
+            setVerificationVersion((version) => version + 1);
+          }}
+        />
+      )}
+
       <PlansModal
         isOpen={showPlansModal}
         onClose={() => setShowPlansModal(false)}

=== src/domain/partners/components/steps/Step6Success.tsx — diff ===
@@ -1,6 +1,6 @@
-import React from 'react';
 import { motion } from 'motion/react';
-import { CheckCircle2, Rocket } from 'lucide-react';
+import { CheckCircle2, Rocket, ShieldCheck } from 'lucide-react';
+import { Trans, useTranslation } from 'react-i18next';
 
 interface Step6SuccessProps {
   businessName: string;
@@ -8,7 +8,11 @@ interface Step6SuccessProps {
   onAccessPanel: () => void;
 }
 
+const STEPS = ['photos', 'manage'] as const;
+
 export function Step6Success({ businessName, onClose, onAccessPanel }: Step6SuccessProps) {
+  const { t } = useTranslation();
+
   return (
     <div
       className="flex flex-col items-center justify-center py-6 text-center space-y-8"
@@ -16,11 +20,12 @@ export function Step6Success({ businessName, onClose, onAccessPanel }: Step6Succ
     >
       <div className="relative">
         <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
-          <CheckCircle2 size={48} />
+          <CheckCircle2 size={48} aria-hidden="true" />
         </div>
         <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
+          aria-hidden="true"
           className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold"
         >
           🚀
@@ -29,25 +34,35 @@ export function Step6Success({ businessName, onClose, onAccessPanel }: Step6Succ
       <div className="space-y-4">
         <div className="space-y-2">
           <h3 className="text-2xl font-black text-white uppercase tracking-tight">
-            Cadastro Concluído!
+            {t('partners.signupSuccess.title')}
           </h3>
           <p className="text-white/50 text-sm max-w-[280px] mx-auto leading-relaxed">
-            Parabéns! Sua empresa <span className="text-white font-bold">{businessName}</span> foi
-            registrada com sucesso e já está{' '}
-            <span className="text-emerald-400 font-bold uppercase">Ativa</span> no Use Guide.
+            <Trans
+              i18nKey="partners.signupSuccess.message"
+              values={{ name: businessName }}
+              components={{
+                name: <span className="text-white font-bold" />,
+                active: <span className="text-emerald-400 font-bold uppercase" />,
+              }}
+            />
           </p>
         </div>
         <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left space-y-2">
-          <p className="text-[10px] font-black uppercase text-indigo-400">Próximos Passos</p>
-          <ul className="space-y-1.5">
-            {[
-              'Acesse seu Painel do Parceiro agora',
-              'Complete seu perfil com fotos',
-              'Gerencie seus itens e eventos',
-            ].map((tip, i) => (
-              <li key={i} className="flex items-center gap-2 text-[10px] text-white/60 font-bold">
-                <div className="w-1 h-1 rounded-full bg-emerald-400" />
-                {tip}
+          <p className="text-[10px] font-black uppercase text-indigo-400">
+            {t('partners.signupSuccess.nextStepsTitle')}
+          </p>
+          <ul className="space-y-2">
+            <li className="flex items-start gap-2 text-xs text-white/80 font-semibold">
+              <ShieldCheck size={14} className="text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
+              {t('partners.signupSuccess.steps.verify')}
+            </li>
+            {STEPS.map((step) => (
+              <li
+                key={step}
+                className="flex items-center gap-2 text-[10px] text-white/60 font-bold"
+              >
+                <div className="w-1 h-1 rounded-full bg-emerald-400 ml-1.5 mr-1" />
+                {t(`partners.signupSuccess.steps.${step}`)}
               </li>
             ))}
           </ul>
@@ -56,19 +71,19 @@ export function Step6Success({ businessName, onClose, onAccessPanel }: Step6Succ
           <button
             type="button"
             onClick={onAccessPanel}
-            className="w-full py-5 rounded-[2rem] bg-indigo-500 text-white font-black uppercase tracking-widest text-[11px] hover:bg-indigo-400 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
+            className="w-full py-5 rounded-[2rem] bg-indigo-500 text-white font-black uppercase tracking-widest text-[11px] hover:bg-indigo-400 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
             id="success-access-panel-btn"
           >
-            <Rocket size={16} />
-            Acessar Painel do Parceiro
+            <Rocket size={16} aria-hidden="true" />
+            {t('partners.signupSuccess.accessPanel')}
           </button>
           <button
             type="button"
             onClick={onClose}
-            className="w-full py-4 rounded-[2rem] bg-white/5 border border-white/10 text-white/50 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
+            className="w-full py-4 rounded-[2rem] bg-white/5 border border-white/10 text-white/50 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
             id="success-back-home-btn"
           >
-            Voltar para Home
+            {t('partners.signupSuccess.backHome')}
           </button>
         </div>
       </div>

=== src/domain/partners/components/subcomponents/PartnerItemsTable.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerContentRecord } from '../../types/partnerContent';

vi.mock('../verification/VerificationStatusChip', () => ({
  VerificationStatusChip: ({ onOpen }: { onOpen: () => void }) => (
    <button type="button" onClick={onOpen}>
      selo
    </button>
  ),
}));

import { PartnerItemsTable } from './PartnerItemsTable';

const item = {
  id: 'item-1',
  name: 'Pousada Sol',
  category: 'hotel',
  description: '',
  image: '',
  location: 'jeri',
  isActive: true,
} as PartnerContentRecord;

function renderTable() {
  const props = {
    onEditItem: vi.fn(),
    onToggleActive: vi.fn().mockResolvedValue(undefined),
    onVerifyItem: vi.fn(),
  };
  render(
    <PartnerItemsTable
      itemsList={[item]}
      loading={false}
      onCreateNew={vi.fn()}
      verificationVersion={0}
      {...props}
    />
  );
  return props;
}

describe('PartnerItemsTable', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('cartão sem botão dentro de botão: editar, selo e interruptor são irmãos', () => {
    const props = renderTable();
    const edit = screen.getByRole('button', { name: 'Editar Pousada Sol' });
    expect(edit.querySelector('button')).toBeNull();
    expect(screen.getByRole('switch').closest('[role="button"]')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'selo' }));
    expect(props.onVerifyItem).toHaveBeenCalledWith(item);
    expect(props.onEditItem).not.toHaveBeenCalled();

    fireEvent.click(edit);
    expect(props.onEditItem).toHaveBeenCalledWith(item);
  });

  it('interruptor ativa ou desativa sem abrir o editor', () => {
    const props = renderTable();
    fireEvent.click(screen.getByRole('switch'));
    expect(props.onToggleActive).toHaveBeenCalledWith('item-1', true);
    expect(props.onEditItem).not.toHaveBeenCalled();
  });
});

=== src/domain/partners/components/subcomponents/PartnerItemsTable.tsx — diff ===
@@ -1,9 +1,10 @@
-import React from 'react';
 import { Plus, MapPin, Edit2, RefreshCw } from 'lucide-react';
 import { motion } from 'motion/react';
+import { useTranslation } from 'react-i18next';
 import type { PartnerContentRecord } from '../../types/partnerContent';
 import { cn } from '../../../../shared/utils/cn';
 import { VerifiedBadge } from '../../../../ui/components/VerifiedBadge';
+import { VerificationStatusChip } from '../verification/VerificationStatusChip';
 
 interface PartnerItemsTableProps {
   itemsList: PartnerContentRecord[];
@@ -11,6 +12,9 @@ interface PartnerItemsTableProps {
   onEditItem: (item: PartnerContentRecord) => void;
   onToggleActive: (itemId: string, currentActiveState: boolean) => Promise<void>;
   onCreateNew: () => void;
+  /** Muda depois de um envio de verificação, para os selos relerem o status. */
+  verificationVersion: number;
+  onVerifyItem: (item: PartnerContentRecord) => void;
 }
 
 export function PartnerItemsTable({
@@ -19,7 +23,10 @@ export function PartnerItemsTable({
   onEditItem,
   onToggleActive,
   onCreateNew,
+  verificationVersion,
+  onVerifyItem,
 }: PartnerItemsTableProps) {
+  const { t } = useTranslation();
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
@@ -47,20 +54,22 @@ export function PartnerItemsTable({
           itemsList.map((item) => (
             <motion.div
               key={item.id}
-              role="button"
-              tabIndex={0}
-              onClick={() => onEditItem(item)}
-              onKeyDown={(event) => {
-                if (event.key === 'Enter' || event.key === ' ') {
-                  event.preventDefault();
-                  onEditItem(item);
-                }
-              }}
               whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
-              whileTap={{ scale: 0.95 }}
-              className="group relative bg-white/5 border border-white/10 glassmorphism-vibrant rounded-3xl p-4 pr-16 flex items-center gap-4 cursor-pointer active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
+              className="group relative bg-white/5 border border-white/10 glassmorphism-vibrant rounded-3xl p-4 pr-16 flex items-center gap-4 transition-all duration-300"
             >
-              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
+              {/* Cobre o cartão inteiro e vem antes no DOM: o selo e o interruptor, posicionados
+                  depois, ficam por cima sem um botão dentro do outro. */}
+              <button
+                type="button"
+                onClick={() => onEditItem(item)}
+                aria-label={t('partners.items.edit', { name: item.name })}
+                className="absolute inset-0 rounded-3xl flex items-end justify-end p-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
+              >
+                <span className="p-2 rounded-xl bg-white/5 text-white/50 group-hover:text-teal-400 group-hover:bg-teal-400/10 transition-all">
+                  <Edit2 size={13} aria-hidden="true" />
+                </span>
+              </button>
+              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 pointer-events-none">
                 <img
                   src={item.image}
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
@@ -99,6 +108,16 @@ export function PartnerItemsTable({
                     </span>
                   )}
                 </div>
+                {item.id && (
+                  <div className="mt-2 relative w-fit">
+                    <VerificationStatusChip
+                      key={`${item.id}-${verificationVersion}`}
+                      itemId={item.id}
+                      name={item.name}
+                      onOpen={() => onVerifyItem(item)}
+                    />
+                  </div>
+                )}
               </div>
 
               <button
@@ -110,13 +129,12 @@ export function PartnerItemsTable({
                     ? `Desativar estabelecimento ${item.name}`
                     : `Ativar estabelecimento ${item.name}`
                 }
-                onClick={async (event) => {
-                  event.stopPropagation();
+                onClick={async () => {
                   if (item.id) {
                     await onToggleActive(item.id, item.isActive !== false);
                   }
                 }}
-                className="absolute top-2 right-2 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl focus-visible:ring-2 focus-visible:ring-teal-400/50"
+                className="absolute top-2 right-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl focus-visible:ring-2 focus-visible:ring-teal-400/50"
               >
                 <span
                   className={cn(
@@ -132,10 +150,6 @@ export function PartnerItemsTable({
                   />
                 </span>
               </button>
-
-              <div className="absolute bottom-4 right-4 p-2 rounded-xl bg-white/5 text-white/50 group-hover:text-teal-400 group-hover:bg-teal-400/10 transition-all">
-                <Edit2 size={13} />
-              </div>
             </motion.div>
           ))
         )}

=== src/domain/partners/components/verification/DocumentVerificationForm.tsx — ARQUIVO NOVO, conteúdo completo ===
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { maskCpfCnpj } from '../../../../shared/utils/documentValidator';
import { cn } from '../../../../shared/utils/cn';
import {
  type DocumentVerificationFormValues,
  documentVerificationFormSchema,
  EMPTY_DOCUMENT_VERIFICATION_FORM,
} from '../../schemas/listingVerificationFormSchema';
import { VerificationFileField } from './VerificationFileField';
import { VerificationRadioGroup } from './VerificationRadioGroup';

interface DocumentVerificationFormProps {
  submitting: boolean;
  onSubmit: (values: DocumentVerificationFormValues) => Promise<void>;
}

const INPUT =
  'w-full min-h-[44px] bg-white/5 border rounded-2xl px-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function DocumentVerificationForm({ submitting, onSubmit }: DocumentVerificationFormProps) {
  const { t } = useTranslation();
  const documentId = useId();
  const cadasturId = useId();
  const { control, register, handleSubmit, watch, setValue, formState } =
    useForm<DocumentVerificationFormValues>({
      resolver: zodResolver(documentVerificationFormSchema),
      defaultValues: EMPTY_DOCUMENT_VERIFICATION_FORM,
    });
  const documentType = watch('documentType');
  const holderRole = watch('holderRole');
  const errors = formState.errors;
  const errorText = (message?: string) => (message ? t(message) : undefined);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Controller
        control={control}
        name="documentType"
        render={({ field }) => (
          <VerificationRadioGroup
            legend={t('verification.form.documentType')}
            name={field.name}
            value={field.value}
            options={[
              { value: 'cnpj', label: t('verification.form.cnpj') },
              { value: 'cpf', label: t('verification.form.cpf') },
            ]}
            onChange={(value) => {
              field.onChange(value);
              setValue('document', '');
            }}
          />
        )}
      />
      <p className="text-xs text-white/60">{t('verification.form.cnpjHint')}</p>

      <div className="space-y-1.5">
        <label htmlFor={documentId} className="block text-xs font-semibold text-white/80">
          {t('verification.form.document')}
        </label>
        <input
          id={documentId}
          inputMode="numeric"
          autoComplete="off"
          maxLength={documentType === 'cnpj' ? 18 : 14}
          className={cn(INPUT, errors.document ? 'border-rose-500/50' : 'border-white/10')}
          {...register('document', {
            onChange: (event) => setValue('document', maskCpfCnpj(event.target.value)),
          })}
        />
        {errors.document && (
          <p className="text-xs text-rose-300">{errorText(errors.document.message)}</p>
        )}
      </div>

      <Controller
        control={control}
        name="holderRole"
        render={({ field }) => (
          <VerificationRadioGroup
            legend={t('verification.form.holderRole')}
            name={field.name}
            value={field.value}
            error={errorText(errors.holderRole?.message)}
            options={[
              { value: 'owner', label: t('verification.form.owner') },
              { value: 'representative', label: t('verification.form.representative') },
            ]}
            onChange={field.onChange}
          />
        )}
      />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-white/80">{t('verification.form.filesTitle')}</h4>
        <p className="text-xs text-white/60">{t('verification.form.fileHint')}</p>
        {documentType === 'cnpj' && (
          <Controller
            control={control}
            name="cnpjCard"
            render={({ field }) => (
              <VerificationFileField
                label={t('verification.files.cnpjCard')}
                file={field.value}
                error={errorText(errors.cnpjCard?.message)}
                onChange={field.onChange}
              />
            )}
          />
        )}
        <Controller
          control={control}
          name="identity"
          render={({ field }) => (
            <VerificationFileField
              label={t('verification.files.identity')}
              file={field.value}
              error={errorText(errors.identity?.message)}
              onChange={field.onChange}
            />
          )}
        />
        {documentType === 'cpf' && (
          <p className="text-xs text-white/60">{t('verification.form.cpfReuseHint')}</p>
        )}
        {holderRole === 'representative' && (
          <Controller
            control={control}
            name="authorization"
            render={({ field }) => (
              <VerificationFileField
                label={t('verification.files.authorization')}
                file={field.value}
                error={errorText(errors.authorization?.message)}
                onChange={field.onChange}
              />
            )}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={cadasturId} className="block text-xs font-semibold text-white/80">
          {t('verification.form.cadastur')}
        </label>
        <input
          id={cadasturId}
          maxLength={30}
          autoComplete="off"
          className={cn(INPUT, 'border-white/10')}
          {...register('cadastur')}
        />
        <p className="text-xs text-white/60">{t('verification.form.cadasturHint')}</p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-teal-500 text-black text-xs font-bold hover:bg-teal-400 disabled:opacity-60 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        {submitting ? t('verification.form.submitting') : t('verification.form.submit')}
      </button>
    </form>
  );
}

=== src/domain/partners/components/verification/LinkedVerificationForm.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { VerificationListingOption } from './verificationListingOption';

interface LinkedVerificationFormProps {
  sources: VerificationListingOption[];
  initialSourceId: string | null;
  submitting: boolean;
  onSubmit: (sourceItemId: string) => Promise<void>;
}

export function LinkedVerificationForm({
  sources,
  initialSourceId,
  submitting,
  onSubmit,
}: LinkedVerificationFormProps) {
  const { t } = useTranslation();
  const selectId = useId();
  const [sourceId, setSourceId] = useState(initialSourceId ?? '');
  const [error, setError] = useState<string | null>(null);

  if (sources.length === 0) {
    return <p className="text-sm text-white/70">{t('verification.form.noSource')}</p>;
  }

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!sourceId) {
          setError(t('verification.validation.sourceRequired'));
          return;
        }
        setError(null);
        await onSubmit(sourceId);
      }}
    >
      <p className="text-sm text-white/70">{t('verification.form.linkedText')}</p>
      <div className="space-y-1.5">
        <label htmlFor={selectId} className="block text-xs font-semibold text-white/80">
          {t('verification.form.source')}
        </label>
        <select
          id={selectId}
          value={sourceId}
          onChange={(event) => setSourceId(event.target.value)}
          className="w-full min-h-[44px] bg-white/5 border border-white/10 rounded-2xl px-4 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <option value="">{t('verification.form.sourcePlaceholder')}</option>
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-300">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-teal-500 text-black text-xs font-bold hover:bg-teal-400 disabled:opacity-60 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        {submitting ? t('verification.form.submitting') : t('verification.form.submit')}
      </button>
    </form>
  );
}

=== src/domain/partners/components/verification/ListingVerificationDialog.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../../../media', () => ({ uploadVerificationFileUseCase: vi.fn() }));
vi.mock('../../application/usecases/getListingVerificationUseCase', () => ({
  getListingVerificationUseCase: mocks.get,
}));
vi.mock('../../application/usecases/submitListingVerificationUseCase', () => ({
  submitListingVerificationUseCase: vi.fn(),
}));

import { ListingVerificationDialog } from './ListingVerificationDialog';

const base = { ownerId: 'owner-1', sourceItemId: null, filesSent: [], maskedDocument: null };
const pousada = { id: 'item-1', name: 'Pousada Sol', category: 'hotel' };
const produtor = { id: 'item-3', name: 'Sol Produções', category: 'producer' };

describe('ListingVerificationDialog', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('estabelecimento sem envio mostra o formulário de documento', async () => {
    mocks.get.mockResolvedValue({
      ...base,
      itemId: 'item-1',
      mode: 'document',
      status: 'not_submitted',
    });
    render(
      <ListingVerificationDialog listing={pousada} accountListings={[pousada]} onClose={vi.fn()} />
    );
    expect(await screen.findByLabelText('Número do documento')).toBeInTheDocument();
  });

  it('perfil de produtor escolhe um estabelecimento da conta, nunca outro perfil', async () => {
    mocks.get.mockResolvedValue({
      ...base,
      itemId: 'item-3',
      mode: 'linked',
      status: 'not_submitted',
    });
    render(
      <ListingVerificationDialog
        listing={produtor}
        accountListings={[pousada, produtor]}
        onClose={vi.fn()}
      />
    );
    const select = await screen.findByLabelText('Estabelecimento de origem');
    const options = Array.from((select as HTMLSelectElement).options).map((option) => option.text);
    expect(options).toEqual(['Selecione', 'Pousada Sol']);
  });

  it('em análise mostra só o status, com o documento mascarado', async () => {
    mocks.get.mockResolvedValue({
      ...base,
      itemId: 'item-1',
      mode: 'document',
      status: 'pending',
      documentType: 'cnpj',
      maskedDocument: '**.***.***/0001-81',
    });
    render(
      <ListingVerificationDialog listing={pousada} accountListings={[pousada]} onClose={vi.fn()} />
    );
    expect(await screen.findByText('Documento: **.***.***/0001-81')).toBeInTheDocument();
    expect(screen.queryByLabelText('Número do documento')).not.toBeInTheDocument();
  });
});

=== src/domain/partners/components/verification/ListingVerificationDialog.tsx — ARQUIVO NOVO, conteúdo completo ===
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { Dialog } from '../../../../ui/components/Dialog';
import { useListingVerification } from '../../hooks/useListingVerification';
import type { DocumentVerificationFormValues } from '../../schemas/listingVerificationFormSchema';
import { DocumentVerificationForm } from './DocumentVerificationForm';
import { LinkedVerificationForm } from './LinkedVerificationForm';
import { VerificationStatusPanel } from './VerificationStatusPanel';
import type { VerificationListingOption } from './verificationListingOption';

const PRODUCER_CATEGORY = 'producer';

interface ListingVerificationDialogProps {
  listing: VerificationListingOption;
  /** Outros cadastros da conta: o perfil de produtor escolhe um deles como origem do documento. */
  accountListings: VerificationListingOption[];
  onClose: () => void;
}

export function ListingVerificationDialog({
  listing,
  accountListings,
  onClose,
}: ListingVerificationDialogProps) {
  const { t } = useTranslation();
  const { showToast } = useUI();
  const { data, loading, error, submitting, reload, submitDocument, submitLinked } =
    useListingVerification(listing.id);
  const isProducer = listing.category === PRODUCER_CATEGORY;
  // Em análise ou aprovada com CNPJ não há o que reenviar; CPF aprovado ainda pode trocar para CNPJ.
  const canSubmit =
    data !== null &&
    (data.status === 'not_submitted' ||
      data.status === 'rejected' ||
      (data.status === 'approved' && data.documentType === 'cpf' && !isProducer));

  const send = async (action: () => Promise<unknown>) => {
    try {
      await action();
      showToast(t('verification.form.sent'), 'success');
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : t('verification.errors.INTERNAL_ERROR'),
        'error'
      );
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t('verification.dialog.title')}
      description={listing.name}
      className="max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <div className="space-y-5 pt-2">
        <p className="text-xs text-white/70 leading-relaxed">{t('verification.dialog.intro')}</p>

        {loading ? (
          <p role="status" className="text-sm text-white/60">
            {t('verification.dialog.loading')}
          </p>
        ) : error ? (
          <div className="space-y-3">
            <p className="text-sm text-rose-300">{error}</p>
            <button
              type="button"
              onClick={() => void reload()}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 rounded-2xl border border-white/10 text-xs text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <RefreshCw size={14} aria-hidden="true" />
              {t('verification.dialog.retry')}
            </button>
          </div>
        ) : (
          data && (
            <>
              <VerificationStatusPanel view={data} />
              {canSubmit &&
                (isProducer ? (
                  <LinkedVerificationForm
                    sources={accountListings.filter(
                      (option) => option.id !== listing.id && option.category !== PRODUCER_CATEGORY
                    )}
                    initialSourceId={data.sourceItemId}
                    submitting={submitting}
                    onSubmit={(sourceItemId) => send(() => submitLinked(sourceItemId))}
                  />
                ) : (
                  <DocumentVerificationForm
                    submitting={submitting}
                    onSubmit={(values: DocumentVerificationFormValues) =>
                      send(() => submitDocument(values))
                    }
                  />
                ))}
            </>
          )
        )}
      </div>
    </Dialog>
  );
}

=== src/domain/partners/components/verification/ListingVerificationQueue.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { ErrorState } from '../../../../ui/components/ErrorState';
import { Skeleton } from '../../../../ui/components/Skeleton';
import { useVerificationQueue } from '../../hooks/useVerificationQueue';
import type { ListingVerificationStatus } from '../../types/listingVerification';
import { VerificationQueueCard } from './VerificationQueueCard';

const FILTERS: ListingVerificationStatus[] = ['pending', 'approved', 'rejected'];

/** Fila de verificação do admin (D12); montada no painel admin pela composição do app. */
export function ListingVerificationQueue() {
  const { t } = useTranslation();
  const queue = useVerificationQueue();

  return (
    <section className="space-y-6" aria-labelledby="verification-queue-title">
      <h2 id="verification-queue-title" className="text-xl font-display font-bold text-white/80">
        {t('verification.admin.title')}
      </h2>

      <div
        role="group"
        aria-label={t('verification.admin.filterLabel')}
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={queue.status === status}
            onClick={() => queue.setStatus(status)}
            className={cn(
              'min-h-[44px] px-4 rounded-2xl text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50',
              queue.status === status
                ? 'bg-teal-500 text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            )}
          >
            {t(`verification.admin.filters.${status}`)}
          </button>
        ))}
      </div>

      {queue.error ? (
        <ErrorState message={queue.error} onRetry={() => void queue.reload()} />
      ) : queue.loading && queue.data.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      ) : queue.data.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/60 border-2 border-dashed border-white/5 rounded-3xl">
          {t('verification.admin.empty')}
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {queue.data.map((entry) => (
            <VerificationQueueCard
              key={entry.itemId}
              entry={entry}
              onReview={(decision, reason) => queue.review(entry.itemId, decision, reason)}
              onOpenFile={(kind) => queue.openFile(entry.itemId, kind)}
            />
          ))}
        </div>
      )}

      {queue.hasMore && !queue.error && (
        <button
          type="button"
          disabled={queue.loading}
          onClick={() => void queue.loadMore()}
          className="min-h-[44px] w-full rounded-2xl border border-white/10 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('verification.admin.loadMore')}
        </button>
      )}
    </section>
  );
}

=== src/domain/partners/components/verification/VerificationFileField.tsx — ARQUIVO NOVO, conteúdo completo ===
import { FileUp } from 'lucide-react';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';

interface VerificationFileFieldProps {
  label: string;
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}

export function VerificationFileField({
  label,
  file,
  error,
  onChange,
}: VerificationFileFieldProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-xs font-semibold text-white/80">
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'w-full min-h-[44px] flex items-center gap-2 px-4 rounded-2xl border bg-white/5 text-xs text-white/80 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50',
          error ? 'border-rose-500/50' : 'border-white/10'
        )}
      >
        <FileUp size={14} aria-hidden="true" />
        <span className="truncate">
          {file
            ? t('verification.form.fileSelected', { name: file.name })
            : t('verification.form.chooseFile')}
        </span>
        {file && (
          <span className="ml-auto text-teal-300 shrink-0">
            {t('verification.form.replaceFile')}
          </span>
        )}
      </button>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  );
}

=== src/domain/partners/components/verification/VerificationQueueCard.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { useUIStore } from '../../../../shared/stores/useUIStore';
import type { ListingVerificationQueueEntry } from '../../types/listingVerification';
import { VerificationQueueCard } from './VerificationQueueCard';

const entry: ListingVerificationQueueEntry = {
  itemId: 'item-1',
  ownerId: 'owner-1',
  mode: 'document',
  sourceItemId: null,
  status: 'pending',
  documentType: 'cnpj',
  maskedDocument: '**.***.***/0001-81',
  holderRole: 'representative',
  cadastur: null,
  rejectionReason: null,
  submittedAt: '2026-10-19T15:00:00.000Z',
  reviewedAt: null,
  filesSent: ['cnpjCard', 'identity'],
  listingName: 'Pousada Sol',
  listingCategory: 'hotel',
  ownerName: 'Ana Silva',
};

describe('VerificationQueueCard', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra dados mascarados, data no fuso de Fortaleza e os arquivos enviados', () => {
    render(<VerificationQueueCard entry={entry} onReview={vi.fn()} onOpenFile={vi.fn()} />);
    expect(screen.getByText('**.***.***/0001-81')).toBeInTheDocument();
    expect(screen.getByText('Enviado em 19/10/2026, 12:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cartão CNPJ/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Autorização/ })).not.toBeInTheDocument();
  });

  it('recusa só com motivo de pelo menos 5 caracteres', async () => {
    const onReview = vi.fn().mockResolvedValue(undefined);
    render(<VerificationQueueCard entry={entry} onReview={onReview} onOpenFile={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Recusar' }));
    const confirm = screen.getByRole('button', { name: 'Confirmar recusa' });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Motivo da recusa'), {
      target: { value: 'Cartão ilegível' },
    });
    fireEvent.click(confirm);
    await waitFor(() => expect(onReview).toHaveBeenCalledWith('reject', 'Cartão ilegível'));
  });

  it('aprovação passa pela confirmação', async () => {
    const onReview = vi.fn().mockResolvedValue(undefined);
    const confirmAction = vi.fn().mockResolvedValue(false);
    useUIStore.setState({ confirmAction });
    render(<VerificationQueueCard entry={entry} onReview={onReview} onOpenFile={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Aprovar' }));
    await waitFor(() =>
      expect(confirmAction).toHaveBeenCalledWith(
        expect.stringContaining('Aprovar a verificação?'),
        {
          tone: 'positive',
          confirmLabel: 'Aprovar',
        }
      )
    );
    expect(onReview).not.toHaveBeenCalled();
  });
});

=== src/domain/partners/components/verification/VerificationQueueCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Check, FileText, X } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { GlassCard } from '../../../../ui/components/GlassCard';
import type {
  ListingVerificationQueueEntry,
  VerificationFileKind,
} from '../../types/listingVerification';

const MIN_REASON = 5;
const BUTTON =
  'min-h-[44px] inline-flex items-center gap-2 px-4 rounded-2xl text-xs font-semibold transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50';

interface VerificationQueueCardProps {
  entry: ListingVerificationQueueEntry;
  onReview: (decision: 'approve' | 'reject', reason: string | null) => Promise<void>;
  onOpenFile: (kind: VerificationFileKind) => Promise<void>;
}

export function VerificationQueueCard({ entry, onReview, onOpenFile }: VerificationQueueCardProps) {
  const { t, i18n } = useTranslation();
  const { showToast, confirmAction } = useUI();
  const reasonId = useId();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Fortaleza',
    }).format(new Date(iso));

  const review = async (decision: 'approve' | 'reject') => {
    setBusy(true);
    try {
      await onReview(decision, decision === 'reject' ? reason.trim() : null);
      showToast(
        t(decision === 'approve' ? 'verification.admin.approved' : 'verification.admin.rejected'),
        'success'
      );
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : t('verification.errors.INTERNAL_ERROR'),
        'error'
      );
      setBusy(false);
    }
  };

  const openFile = async (kind: VerificationFileKind) => {
    try {
      await onOpenFile(kind);
    } catch {
      showToast(t('verification.admin.fileError'), 'error');
    }
  };

  return (
    <GlassCard className="p-5 space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white">{entry.listingName || entry.itemId}</h3>
        <p className="text-xs text-white/70">
          {t('verification.admin.sentBy', {
            name: entry.ownerName || t('verification.admin.ownerUnknown'),
          })}
        </p>
        {entry.submittedAt && (
          <p className="text-xs text-white/60">
            {t('verification.admin.submittedAt', { date: formatDate(entry.submittedAt) })}
          </p>
        )}
        {entry.reviewedAt && (
          <p className="text-xs text-white/60">
            {t('verification.admin.reviewedAt', { date: formatDate(entry.reviewedAt) })}
          </p>
        )}
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/80">
        <div>
          <dt className="sr-only">{t('verification.form.documentType')}</dt>
          <dd>
            {entry.documentType ? t(`verification.form.${entry.documentType}`) : ''}{' '}
            <span className="font-mono">{entry.maskedDocument}</span>
          </dd>
        </div>
        {entry.holderRole && (
          <div>
            <dt className="sr-only">{t('verification.form.holderRole')}</dt>
            <dd>
              {t(
                entry.holderRole === 'owner'
                  ? 'verification.admin.holderOwner'
                  : 'verification.admin.holderRepresentative'
              )}
            </dd>
          </div>
        )}
        {entry.cadastur && (
          <div>
            <dt className="sr-only">{t('verification.form.cadastur')}</dt>
            <dd>{t('verification.admin.cadastur', { number: entry.cadastur })}</dd>
          </div>
        )}
        {entry.rejectionReason && (
          <div className="sm:col-span-2">
            <dt className="sr-only">{t('verification.admin.rejectReason')}</dt>
            <dd>{t('verification.admin.reason', { reason: entry.rejectionReason })}</dd>
          </div>
        )}
      </dl>

      {entry.filesSent.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entry.filesSent.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => void openFile(kind)}
              className={`${BUTTON} border border-white/10 bg-white/5 text-white hover:bg-white/10`}
            >
              <FileText size={14} aria-hidden="true" />
              {t('verification.admin.openFile', { file: t(`verification.files.${kind}`) })}
            </button>
          ))}
        </div>
      )}

      {entry.status === 'pending' &&
        (rejecting ? (
          <div className="space-y-2">
            <label htmlFor={reasonId} className="block text-xs font-semibold text-white/80">
              {t('verification.admin.rejectReason')}
            </label>
            <textarea
              id={reasonId}
              value={reason}
              maxLength={500}
              rows={3}
              onChange={(event) => setReason(event.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 resize-none"
            />
            <p className="text-xs text-white/60">{t('verification.admin.rejectReasonHint')}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || reason.trim().length < MIN_REASON}
                onClick={() => void review('reject')}
                className={`${BUTTON} bg-rose-500 text-white hover:bg-rose-400`}
              >
                {t('verification.admin.confirmReject')}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setRejecting(false)}
                className={`${BUTTON} border border-white/10 text-white hover:bg-white/10`}
              >
                {t('verification.admin.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                if (
                  await confirmAction(t('verification.admin.approveConfirm'), {
                    tone: 'positive',
                    confirmLabel: t('verification.admin.approve'),
                  })
                ) {
                  await review('approve');
                }
              }}
              className={`${BUTTON} bg-emerald-500 text-black hover:bg-emerald-400`}
            >
              <Check size={14} aria-hidden="true" />
              {t('verification.admin.approve')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setRejecting(true)}
              className={`${BUTTON} border border-rose-500/30 text-rose-300 hover:bg-rose-500/10`}
            >
              <X size={14} aria-hidden="true" />
              {t('verification.admin.reject')}
            </button>
          </div>
        ))}
    </GlassCard>
  );
}

=== src/domain/partners/components/verification/VerificationRadioGroup.tsx — ARQUIVO NOVO, conteúdo completo ===
import { cn } from '../../../../shared/utils/cn';

interface VerificationRadioGroupProps<T extends string> {
  legend: string;
  name: string;
  value: T | '';
  options: Array<{ value: T; label: string }>;
  error?: string;
  onChange: (value: T) => void;
}

export function VerificationRadioGroup<T extends string>({
  legend,
  name,
  value,
  options,
  error,
  onChange,
}: VerificationRadioGroupProps<T>) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-white/80 mb-2">{legend}</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-400/50',
              value === option.value
                ? 'border-teal-400/60 bg-teal-400/10 text-white'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="accent-teal-400"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </fieldset>
  );
}

=== src/domain/partners/components/verification/VerificationStatusChip.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { useListingVerification } from '../../hooks/useListingVerification';
import { VERIFICATION_STATUS_STYLE } from './verificationStatusStyle';

interface VerificationStatusChipProps {
  itemId: string;
  name: string;
  onOpen: () => void;
}

export function VerificationStatusChip({ itemId, name, onOpen }: VerificationStatusChipProps) {
  const { t } = useTranslation();
  const { data, loading } = useListingVerification(itemId);
  const status = data?.status ?? 'not_submitted';
  const label = t(`verification.status.${status}`);

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={loading}
      aria-label={t('verification.chipLabel', { name, status: label })}
      className={cn(
        'min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-xl border text-[10px] font-semibold transition-colors hover:bg-white/10 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50',
        VERIFICATION_STATUS_STYLE[status]
      )}
    >
      <ShieldCheck size={12} aria-hidden="true" />
      {label}
    </button>
  );
}

=== src/domain/partners/components/verification/VerificationStatusPanel.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import type { ListingVerificationView } from '../../types/listingVerification';
import { VERIFICATION_STATUS_STYLE } from './verificationStatusStyle';

interface VerificationStatusPanelProps {
  view: ListingVerificationView;
}

function statusMessages(
  view: ListingVerificationView,
  t: (key: string, values?: Record<string, string>) => string
): string[] {
  if (view.status === 'pending') return [t('verification.panel.pending')];
  if (view.status === 'rejected') {
    return [
      t('verification.panel.rejected', { reason: view.rejectionReason ?? '' }),
      t('verification.panel.resubmit'),
    ];
  }
  if (view.status === 'approved') {
    return [
      t(
        view.documentType === 'cpf'
          ? 'verification.panel.approvedCpf'
          : 'verification.panel.approved'
      ),
    ];
  }
  return [];
}

export function VerificationStatusPanel({ view }: VerificationStatusPanelProps) {
  const { t } = useTranslation();
  const messages = statusMessages(view, t);
  if (messages.length === 0) return null;

  return (
    <div
      role="status"
      className={cn(
        'rounded-2xl border p-4 space-y-1 text-sm',
        VERIFICATION_STATUS_STYLE[view.status]
      )}
    >
      <p className="font-semibold">{t(`verification.status.${view.status}`)}</p>
      {messages.map((message) => (
        <p key={message} className="text-white/80">
          {message}
        </p>
      ))}
      {view.maskedDocument && (
        <p className="text-white/70 text-xs">
          {t('verification.panel.document', { document: view.maskedDocument })}
        </p>
      )}
    </div>
  );
}

=== src/domain/partners/components/verification/verificationListingOption.ts — ARQUIVO NOVO, conteúdo completo ===
/** Estabelecimento como o diálogo de verificação precisa: id, nome e categoria. */
export interface VerificationListingOption {
  id: string;
  name: string;
  category: string;
}

=== src/domain/partners/components/verification/verificationStatusStyle.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ListingVerificationView } from '../../types/listingVerification';

export const VERIFICATION_STATUS_STYLE: Record<ListingVerificationView['status'], string> = {
  not_submitted: 'bg-white/5 text-white/70 border-white/10',
  pending: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};

=== src/domain/partners/factory.ts — diff ===
@@ -5,3 +5,8 @@ import { PartnerContentPort } from './ports/partnerContentPort';
 
 export const partnerAdapter: PartnerPort = new ApiPartnerAdapter();
 export const partnerContentAdapter: PartnerContentPort = new ApiPartnerContentAdapter();
+import { ApiListingVerificationAdapter } from './adapters/apiListingVerificationAdapter';
+import type { ListingVerificationPort } from './ports/listingVerificationPort';
+
+export const listingVerificationAdapter: ListingVerificationPort =
+  new ApiListingVerificationAdapter();

=== src/domain/partners/hooks/useListingVerification.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { EMPTY_DOCUMENT_VERIFICATION_FORM } from '../schemas/listingVerificationFormSchema';

const mocks = vi.hoisted(() => ({ get: vi.fn(), submit: vi.fn(), upload: vi.fn() }));

vi.mock('../../media', () => ({ uploadVerificationFileUseCase: mocks.upload }));
vi.mock('../application/usecases/getListingVerificationUseCase', () => ({
  getListingVerificationUseCase: mocks.get,
}));
vi.mock('../application/usecases/submitListingVerificationUseCase', () => ({
  submitListingVerificationUseCase: mocks.submit,
}));

import { useListingVerification } from './useListingVerification';

const file = (name: string) => new File(['x'], name, { type: 'application/pdf' });

describe('useListingVerification', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
    mocks.get.mockResolvedValue({ itemId: 'item-1', status: 'not_submitted' });
    mocks.submit.mockResolvedValue({ itemId: 'item-1', status: 'pending' });
    mocks.upload.mockImplementation(async (f: File) => ({ fileId: `verification/u/${f.name}` }));
  });

  it('envia só os arquivos que a escolha exige', async () => {
    const { result } = renderHook(() => useListingVerification('item-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.submitDocument({
        ...EMPTY_DOCUMENT_VERIFICATION_FORM,
        documentType: 'cpf',
        document: '529.982.247-25',
        holderRole: 'owner',
        identity: file('id.pdf'),
        // Sobras de uma escolha anterior (CNPJ e representante) não saem do navegador.
        cnpjCard: file('card.pdf'),
        authorization: file('auth.pdf'),
      });
    });

    expect(mocks.upload).toHaveBeenCalledTimes(1);
    expect(mocks.submit).toHaveBeenCalledWith('item-1', {
      mode: 'document',
      documentType: 'cpf',
      document: '529.982.247-25',
      holderRole: 'owner',
      files: { identity: 'verification/u/id.pdf' },
      cadastur: null,
    });
    expect(result.current.data?.status).toBe('pending');
  });

  it('traduz o código de erro do backend', async () => {
    mocks.submit.mockRejectedValue(new Error('CNPJ_ALREADY_USED'));
    const { result } = renderHook(() => useListingVerification('item-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.submitLinked('item-2')).rejects.toThrow(
      'Este CNPJ já está em outro estabelecimento.'
    );
  });
});

=== src/domain/partners/hooks/useListingVerification.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { uploadVerificationFileUseCase } from '../../media';
import { getListingVerificationUseCase } from '../application/usecases/getListingVerificationUseCase';
import { submitListingVerificationUseCase } from '../application/usecases/submitListingVerificationUseCase';
import type { DocumentVerificationFormValues } from '../schemas/listingVerificationFormSchema';
import type { ListingVerificationView, VerificationFileKind } from '../types/listingVerification';
import { getVerificationErrorMessage } from '../utils/verificationErrorMessage';

const FILE_KINDS: VerificationFileKind[] = ['identity', 'cnpjCard', 'authorization'];

/** Só os arquivos que a escolha atual exige saem do navegador (minimização, AGENTS.md §7.5). */
function filesToSend(values: DocumentVerificationFormValues): Array<[VerificationFileKind, File]> {
  return FILE_KINDS.flatMap((kind): Array<[VerificationFileKind, File]> => {
    const file = values[kind];
    if (!file) return [];
    if (kind === 'cnpjCard' && values.documentType !== 'cnpj') return [];
    if (kind === 'authorization' && values.holderRole !== 'representative') return [];
    return [[kind, file]];
  });
}

export function useListingVerification(itemId: string) {
  const [data, setData] = useState<ListingVerificationView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getListingVerificationUseCase(itemId));
    } catch (err: unknown) {
      setError(getVerificationErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const run = useCallback(async (send: () => Promise<ListingVerificationView>) => {
    setSubmitting(true);
    try {
      const view = await send();
      setData(view);
      return view;
    } catch (err: unknown) {
      throw new Error(getVerificationErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, []);

  const submitDocument = useCallback(
    (values: DocumentVerificationFormValues) =>
      run(async () => {
        const files: Partial<Record<VerificationFileKind, string>> = {};
        for (const [kind, file] of filesToSend(values)) {
          files[kind] = (await uploadVerificationFileUseCase(file)).fileId;
        }
        return submitListingVerificationUseCase(itemId, {
          mode: 'document',
          documentType: values.documentType,
          document: values.document,
          holderRole: values.holderRole || undefined,
          files,
          cadastur: values.cadastur || null,
        });
      }),
    [itemId, run]
  );

  const submitLinked = useCallback(
    (sourceItemId: string) =>
      run(() => submitListingVerificationUseCase(itemId, { mode: 'linked', sourceItemId })),
    [itemId, run]
  );

  return { data, loading, error, submitting, reload, submitDocument, submitLinked };
}

=== src/domain/partners/hooks/useVerificationQueue.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { listListingVerificationsUseCase } from '../application/usecases/listListingVerificationsUseCase';
import { readVerificationFileUseCase } from '../application/usecases/readVerificationFileUseCase';
import { reviewListingVerificationUseCase } from '../application/usecases/reviewListingVerificationUseCase';
import type {
  ListingVerificationQueueEntry,
  ListingVerificationStatus,
  VerificationFileKind,
} from '../types/listingVerification';
import { getVerificationErrorMessage } from '../utils/verificationErrorMessage';

// Tempo para a aba nova carregar o arquivo antes de liberar a URL temporária.
const OBJECT_URL_TTL_MS = 60_000;

export function useVerificationQueue() {
  const [status, setStatus] = useState<ListingVerificationStatus>('pending');
  const [data, setData] = useState<ListingVerificationQueueEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (cursor: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const page = await listListingVerificationsUseCase(status, cursor);
        setData((current) => (cursor ? [...current, ...page.data] : page.data));
        setNextCursor(page.nextCursor);
      } catch (err: unknown) {
        setError(getVerificationErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [status]
  );

  useEffect(() => {
    void load(null);
  }, [load]);

  const review = useCallback(
    async (itemId: string, decision: 'approve' | 'reject', reason: string | null) => {
      try {
        await reviewListingVerificationUseCase(itemId, decision, reason);
      } catch (err: unknown) {
        throw new Error(getVerificationErrorMessage(err));
      }
      // Revisada, a verificação sai da lista atual.
      setData((current) => current.filter((entry) => entry.itemId !== itemId));
    },
    []
  );

  const openFile = useCallback(async (itemId: string, kind: VerificationFileKind) => {
    const blob = await readVerificationFileUseCase(itemId, kind);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_TTL_MS);
  }, []);

  return {
    status,
    setStatus,
    data,
    loading,
    error,
    hasMore: nextCursor !== null,
    reload: () => load(null),
    loadMore: () => load(nextCursor),
    review,
    openFile,
  };
}

=== src/domain/partners/index.ts — diff ===
@@ -13,6 +13,7 @@ export { subscribeToPartnerProfileUseCase } from './application/usecases/subscri
 export { updatePartnerStatusUseCase } from './application/usecases/updatePartnerStatusUseCase';
 export { updatePartnerVerificationUseCase } from './application/usecases/updatePartnerVerificationUseCase';
 export { ListingEditor, type ListingEditorProps } from './components/ListingEditor';
+export { ListingVerificationQueue } from './components/verification/ListingVerificationQueue';
 export { PartnerEventForm } from './components/PartnerEventForm';
 export {
   LanguagesForm,

=== src/domain/partners/ports/listingVerificationPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type {
  ListingVerificationQueuePage,
  ListingVerificationStatus,
  ListingVerificationView,
  SubmitListingVerificationPayload,
  VerificationDecision,
  VerificationFileKind,
} from '../types/listingVerification';

export interface ListingVerificationPort {
  get(itemId: string): Promise<ListingVerificationView>;
  submit(
    itemId: string,
    payload: SubmitListingVerificationPayload
  ): Promise<ListingVerificationView>;
  list(
    status: ListingVerificationStatus,
    cursor: string | null
  ): Promise<ListingVerificationQueuePage>;
  review(
    itemId: string,
    decision: VerificationDecision,
    reason: string | null
  ): Promise<ListingVerificationView>;
  /** Arquivo privado lido pelo admin; nunca vira URL pública. */
  readFile(itemId: string, kind: VerificationFileKind): Promise<Blob>;
}

=== src/domain/partners/schemas/listingVerificationFormSchema.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import {
  documentVerificationFormSchema,
  EMPTY_DOCUMENT_VERIFICATION_FORM,
} from './listingVerificationFormSchema';

const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
const messages = (values: object) => {
  const result = documentVerificationFormSchema.safeParse({
    ...EMPTY_DOCUMENT_VERIFICATION_FORM,
    ...values,
  });
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe('documentVerificationFormSchema (D12)', () => {
  it('CNPJ exige Cartão CNPJ, identidade e vínculo', () => {
    expect(messages({ document: '11.222.333/0001-81' })).toEqual([
      'verification.validation.holderRoleRequired',
      'verification.validation.identityRequired',
      'verification.validation.cnpjCardRequired',
    ]);
    expect(
      messages({
        document: '11.222.333/0001-81',
        holderRole: 'owner',
        identity: file,
        cnpjCard: file,
      })
    ).toEqual([]);
  });

  it('representante precisa da autorização de um sócio', () => {
    expect(
      messages({
        document: '11.222.333/0001-81',
        holderRole: 'representative',
        identity: file,
        cnpjCard: file,
      })
    ).toEqual(['verification.validation.authorizationRequired']);
  });

  it('CPF não exige Cartão CNPJ e deixa a identidade para o servidor (CPF já conferido)', () => {
    expect(
      messages({ documentType: 'cpf', document: '529.982.247-25', holderRole: 'owner' })
    ).toEqual([]);
  });

  it('recusa documento inválido com a mensagem do tipo escolhido', () => {
    expect(
      messages({ documentType: 'cpf', document: '111.111.111-11', holderRole: 'owner' })
    ).toEqual(['verification.validation.documentInvalidCpf']);
  });
});

=== src/domain/partners/schemas/listingVerificationFormSchema.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';
import { isValidCNPJ, isValidCPF } from '../../../shared/utils/documentValidator';

const optionalFile = z.custom<File | null>((value) => value === null || value instanceof File);

/** Mensagens são chaves de tradução (AGENTS.md §12.5): o formulário exibe `t(message)`. */
export const documentVerificationFormSchema = z
  .object({
    documentType: z.enum(['cpf', 'cnpj']),
    document: z.string().trim(),
    holderRole: z.enum(['owner', 'representative', '']),
    cadastur: z.string().trim().max(30),
    identity: optionalFile,
    cnpjCard: optionalFile,
    authorization: optionalFile,
  })
  .superRefine((data, ctx) => {
    const isCnpj = data.documentType === 'cnpj';
    const validDocument = isCnpj ? isValidCNPJ(data.document) : isValidCPF(data.document);
    if (!validDocument) {
      ctx.addIssue({
        code: 'custom',
        path: ['document'],
        message: isCnpj
          ? 'verification.validation.documentInvalidCnpj'
          : 'verification.validation.documentInvalidCpf',
      });
    }
    if (!data.holderRole) {
      ctx.addIssue({
        code: 'custom',
        path: ['holderRole'],
        message: 'verification.validation.holderRoleRequired',
      });
    }
    // CPF já conferido em outro estabelecimento da conta dispensa a identidade; o servidor decide.
    if (isCnpj && !data.identity) {
      ctx.addIssue({
        code: 'custom',
        path: ['identity'],
        message: 'verification.validation.identityRequired',
      });
    }
    if (isCnpj && !data.cnpjCard) {
      ctx.addIssue({
        code: 'custom',
        path: ['cnpjCard'],
        message: 'verification.validation.cnpjCardRequired',
      });
    }
    if (data.holderRole === 'representative' && !data.authorization) {
      ctx.addIssue({
        code: 'custom',
        path: ['authorization'],
        message: 'verification.validation.authorizationRequired',
      });
    }
  });

export type DocumentVerificationFormValues = z.infer<typeof documentVerificationFormSchema>;

export const EMPTY_DOCUMENT_VERIFICATION_FORM: DocumentVerificationFormValues = {
  documentType: 'cnpj',
  document: '',
  holderRole: '',
  cadastur: '',
  identity: null,
  cnpjCard: null,
  authorization: null,
};

=== src/domain/partners/types/listingVerification.ts — ARQUIVO NOVO, conteúdo completo ===
export type ListingDocumentType = 'cpf' | 'cnpj';
export type ListingVerificationStatus = 'pending' | 'approved' | 'rejected';
/** `owner`: sócio, administrador ou titular do MEI; `representative`: gerente com autorização de um sócio. */
export type ListingHolderRole = 'owner' | 'representative';
export type VerificationFileKind = 'cnpjCard' | 'identity' | 'authorization';
export type VerificationDecision = 'approve' | 'reject';

/** O que a API devolve: nunca o número do documento, só a forma mascarada (AGENTS.md §7.6). */
export interface ListingVerificationView {
  itemId: string;
  ownerId: string;
  mode: 'document' | 'linked';
  sourceItemId: string | null;
  status: ListingVerificationStatus | 'not_submitted';
  documentType: ListingDocumentType | null;
  maskedDocument: string | null;
  holderRole: ListingHolderRole | null;
  cadastur: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  filesSent: VerificationFileKind[];
}

export interface ListingVerificationQueueEntry extends ListingVerificationView {
  listingName: string;
  listingCategory: string;
  ownerName: string;
}

export type SubmitListingVerificationPayload =
  | {
      mode: 'document';
      documentType: ListingDocumentType;
      document: string;
      holderRole?: ListingHolderRole;
      files?: Partial<Record<VerificationFileKind, string>>;
      cadastur?: string | null;
    }
  | { mode: 'linked'; sourceItemId: string };

export interface ListingVerificationQueuePage {
  data: ListingVerificationQueueEntry[];
  nextCursor: string | null;
}

=== src/domain/partners/utils/verificationErrorMessage.ts — ARQUIVO NOVO, conteúdo completo ===
import { i18n } from '../../../shared/i18n';

const KNOWN_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'DOCUMENT_IN_USE',
  'CNPJ_ALREADY_USED',
  'ALREADY_VERIFIED',
  'NOT_PENDING',
  'CRYPTO_UNAVAILABLE',
  'INVALID_DOCUMENT_FILE',
  'IMAGE_TOO_LARGE',
  'STORAGE_UNAVAILABLE',
  'INTERNAL_ERROR',
] as const;

/** Traduz o `code` estável do backend (AGENTS.md §12.5). */
export function getVerificationErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  const known = (KNOWN_CODES as readonly string[]).includes(code) ? code : 'INTERNAL_ERROR';
  return i18n.t(`verification.errors.${known}`);
}

=== src/shared/i18n/partnersResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos do domínio partners (pt-BR é a fonte; en e fr têm as mesmas chaves, garantidas pelo tipo). */
export interface PartnersTranslation {
  signupSuccess: {
    title: string;
    /** `<name>` e `<active>` viram destaque pelo componente `<Trans>`. */
    message: string;
    nextStepsTitle: string;
    steps: {
      verify: string;
      photos: string;
      manage: string;
    };
    accessPanel: string;
    backHome: string;
  };
  items: {
    edit: string;
  };
}

export const partnersPtBR: PartnersTranslation = {
  signupSuccess: {
    title: 'Cadastro concluído!',
    message:
      'Parabéns! Sua empresa <name>{{name}}</name> foi registrada e já está <active>ativa</active> no Use Guide.',
    nextStepsTitle: 'Próximos passos',
    steps: {
      verify: 'Envie a verificação do estabelecimento no painel: ela libera o selo e as vendas',
      photos: 'Complete o cadastro com fotos',
      manage: 'Gerencie seus estabelecimentos e eventos',
    },
    accessPanel: 'Acessar painel do parceiro',
    backHome: 'Voltar para o início',
  },
  items: {
    edit: 'Editar {{name}}',
  },
};

export const partnersEn: PartnersTranslation = {
  signupSuccess: {
    title: 'Sign-up complete!',
    message:
      'Congratulations! Your business <name>{{name}}</name> is registered and already <active>active</active> on Use Guide.',
    nextStepsTitle: 'Next steps',
    steps: {
      verify: 'Send the business verification from the panel: it unlocks the badge and sales',
      photos: 'Add photos to your listing',
      manage: 'Manage your businesses and events',
    },
    accessPanel: 'Open partner panel',
    backHome: 'Back to home',
  },
  items: {
    edit: 'Edit {{name}}',
  },
};

export const partnersFr: PartnersTranslation = {
  signupSuccess: {
    title: 'Inscription terminée !',
    message:
      'Félicitations ! Votre entreprise <name>{{name}}</name> est enregistrée et déjà <active>active</active> sur Use Guide.',
    nextStepsTitle: 'Prochaines étapes',
    steps: {
      verify:
        'Envoyez la vérification de l’établissement depuis le panneau : elle débloque le badge et les ventes',
      photos: 'Ajoutez des photos à votre fiche',
      manage: 'Gérez vos établissements et événements',
    },
    accessPanel: 'Ouvrir le panneau partenaire',
    backHome: 'Retour à l’accueil',
  },
  items: {
    edit: 'Modifier {{name}}',
  },
};

=== src/shared/i18n/resources.ts — diff ===
@@ -10,12 +10,28 @@ import {
   insightsFr,
   insightsPtBR,
 } from './insightsResources';
+import {
+  type PartnersTranslation,
+  partnersEn,
+  partnersFr,
+  partnersPtBR,
+} from './partnersResources';
+import {
+  type VerificationTranslation,
+  verificationEn,
+  verificationFr,
+  verificationPtBR,
+} from './verificationResources';
 
 export interface TranslationResource {
   bookings: BookingsTranslation;
   insights: InsightsTranslation;
+  partners: PartnersTranslation;
+  verification: VerificationTranslation;
   common: {
     language: string;
+    cancel: string;
+    confirm: string;
     locales: {
       ptBR: string;
       en: string;
@@ -207,8 +223,12 @@ export interface TranslationResource {
 const ptBR: TranslationResource = {
   bookings: bookingsPtBR,
   insights: insightsPtBR,
+  partners: partnersPtBR,
+  verification: verificationPtBR,
   common: {
     language: 'Idioma',
+    cancel: 'Cancelar',
+    confirm: 'Confirmar',
     locales: {
       ptBR: 'Português (Brasil)',
       en: 'English',
@@ -449,8 +469,12 @@ const ptBR: TranslationResource = {
 const en: TranslationResource = {
   bookings: bookingsEn,
   insights: insightsEn,
+  partners: partnersEn,
+  verification: verificationEn,
   common: {
     language: 'Language',
+    cancel: 'Cancel',
+    confirm: 'Confirm',
     locales: {
       ptBR: 'Português (Brasil)',
       en: 'English',
@@ -687,8 +711,12 @@ const en: TranslationResource = {
 const fr: TranslationResource = {
   bookings: bookingsFr,
   insights: insightsFr,
+  partners: partnersFr,
+  verification: verificationFr,
   common: {
     language: 'Langue',
+    cancel: 'Annuler',
+    confirm: 'Confirmer',
     locales: {
       ptBR: 'Português (Brasil)',
       en: 'English',

=== src/shared/i18n/verificationResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos da verificação por estabelecimento (D12). pt-BR é a fonte; en e fr têm as mesmas chaves. */
export interface VerificationTranslation {
  status: {
    not_submitted: string;
    pending: string;
    approved: string;
    rejected: string;
  };
  chipLabel: string;
  dialog: {
    title: string;
    intro: string;
    close: string;
    loading: string;
    retry: string;
  };
  panel: {
    pending: string;
    approved: string;
    approvedCpf: string;
    rejected: string;
    document: string;
    resubmit: string;
  };
  form: {
    documentType: string;
    cpf: string;
    cnpj: string;
    cnpjHint: string;
    document: string;
    holderRole: string;
    owner: string;
    representative: string;
    filesTitle: string;
    fileHint: string;
    chooseFile: string;
    replaceFile: string;
    fileSelected: string;
    cpfReuseHint: string;
    cadastur: string;
    cadasturHint: string;
    submit: string;
    submitting: string;
    sent: string;
    linkedText: string;
    source: string;
    sourcePlaceholder: string;
    noSource: string;
  };
  files: {
    cnpjCard: string;
    identity: string;
    authorization: string;
  };
  validation: {
    documentInvalidCpf: string;
    documentInvalidCnpj: string;
    holderRoleRequired: string;
    identityRequired: string;
    cnpjCardRequired: string;
    authorizationRequired: string;
    sourceRequired: string;
  };
  admin: {
    tab: string;
    title: string;
    filterLabel: string;
    filters: {
      pending: string;
      approved: string;
      rejected: string;
    };
    empty: string;
    loadMore: string;
    ownerUnknown: string;
    sentBy: string;
    submittedAt: string;
    reviewedAt: string;
    holderOwner: string;
    holderRepresentative: string;
    cadastur: string;
    reason: string;
    openFile: string;
    fileError: string;
    approve: string;
    approveConfirm: string;
    approved: string;
    reject: string;
    rejectReason: string;
    rejectReasonHint: string;
    confirmReject: string;
    cancel: string;
    rejected: string;
  };
  errors: {
    VALIDATION_ERROR: string;
    UNAUTHENTICATED: string;
    FORBIDDEN: string;
    NOT_FOUND: string;
    DOCUMENT_IN_USE: string;
    CNPJ_ALREADY_USED: string;
    ALREADY_VERIFIED: string;
    NOT_PENDING: string;
    CRYPTO_UNAVAILABLE: string;
    INVALID_DOCUMENT_FILE: string;
    IMAGE_TOO_LARGE: string;
    STORAGE_UNAVAILABLE: string;
    INTERNAL_ERROR: string;
  };
}

export const verificationPtBR: VerificationTranslation = {
  status: {
    not_submitted: 'Verificar estabelecimento',
    pending: 'Verificação em análise',
    approved: 'Verificado pelo Use Guide',
    rejected: 'Verificação recusada',
  },
  chipLabel: 'Verificação de {{name}}: {{status}}',
  dialog: {
    title: 'Verificação do estabelecimento',
    intro:
      'O Use Guide confere cada estabelecimento antes de liberar o selo e as vendas. O número do documento fica cifrado e só aparece mascarado.',
    close: 'Fechar',
    loading: 'Carregando a verificação...',
    retry: 'Tentar novamente',
  },
  panel: {
    pending: 'Recebemos os documentos. Acompanhe aqui o resultado da análise.',
    approved: 'Estabelecimento verificado.',
    approvedCpf:
      'Estabelecimento verificado com CPF. Para vender ingressos, passeios ou reservas é preciso CNPJ (MEI serve).',
    rejected: 'A verificação foi recusada. Motivo: {{reason}}',
    document: 'Documento: {{document}}',
    resubmit: 'Corrija os dados e envie de novo.',
  },
  form: {
    documentType: 'Documento do estabelecimento',
    cpf: 'CPF',
    cnpj: 'CNPJ',
    cnpjHint: 'Para vender ingressos, passeios ou reservas é preciso CNPJ (MEI serve).',
    document: 'Número do documento',
    holderRole: 'Seu vínculo com o documento',
    owner: 'Sou o titular, sócio ou administrador',
    representative: 'Sou representante (gerente ou funcionário)',
    filesTitle: 'Arquivos',
    fileHint: 'JPEG, PNG, WebP ou PDF, até 6 MB.',
    chooseFile: 'Escolher arquivo',
    replaceFile: 'Trocar arquivo',
    fileSelected: 'Selecionado: {{name}}',
    cpfReuseHint:
      'Se este CPF já foi conferido em outro estabelecimento da sua conta, não é preciso enviar a identidade de novo.',
    cadastur: 'Cadastur (opcional)',
    cadasturHint: 'Número do registro no Ministério do Turismo, se tiver.',
    submit: 'Enviar para verificação',
    submitting: 'Enviando...',
    sent: 'Verificação enviada.',
    linkedText:
      'O perfil de produtor usa o documento de um dos seus estabelecimentos e segue a verificação dele.',
    source: 'Estabelecimento de origem',
    sourcePlaceholder: 'Selecione',
    noSource: 'Cadastre um estabelecimento antes de verificar o perfil de produtor.',
  },
  files: {
    cnpjCard: 'Cartão CNPJ emitido pela Receita Federal',
    identity: 'Documento de identidade com foto (RG ou CNH)',
    authorization: 'Autorização assinada por um sócio',
  },
  validation: {
    documentInvalidCpf: 'CPF inválido.',
    documentInvalidCnpj: 'CNPJ inválido.',
    holderRoleRequired: 'Informe seu vínculo com o documento.',
    identityRequired: 'Envie o documento de identidade.',
    cnpjCardRequired: 'Envie o Cartão CNPJ.',
    authorizationRequired: 'Envie a autorização assinada por um sócio.',
    sourceRequired: 'Escolha um estabelecimento.',
  },
  admin: {
    tab: 'Verificações',
    title: 'Verificação de estabelecimentos',
    filterLabel: 'Filtrar verificações',
    filters: {
      pending: 'Em análise',
      approved: 'Aprovadas',
      rejected: 'Recusadas',
    },
    empty: 'Nenhuma verificação nesta lista.',
    loadMore: 'Carregar mais',
    ownerUnknown: 'Conta sem nome',
    sentBy: 'Enviado por {{name}}',
    submittedAt: 'Enviado em {{date}}',
    reviewedAt: 'Revisado em {{date}}',
    holderOwner: 'Titular, sócio ou administrador',
    holderRepresentative: 'Representante',
    cadastur: 'Cadastur: {{number}}',
    reason: 'Motivo: {{reason}}',
    openFile: 'Abrir: {{file}}',
    fileError: 'Não foi possível abrir o arquivo.',
    approve: 'Aprovar',
    approveConfirm:
      'Aprovar a verificação? Confira o Cartão CNPJ na Receita, o vínculo da pessoa com a empresa (QSA ou MEI) e a identidade. Com CNPJ aprovado, o estabelecimento pode vender.',
    approved: 'Verificação aprovada.',
    reject: 'Recusar',
    rejectReason: 'Motivo da recusa',
    rejectReasonHint: 'O parceiro vê este texto. Use pelo menos 5 caracteres.',
    confirmReject: 'Confirmar recusa',
    cancel: 'Cancelar',
    rejected: 'Verificação recusada.',
  },
  errors: {
    VALIDATION_ERROR: 'Confira os dados e os arquivos da verificação.',
    UNAUTHENTICATED: 'Entre de novo na sua conta para continuar.',
    FORBIDDEN: 'Você não tem acesso a esta verificação.',
    NOT_FOUND: 'Estabelecimento não encontrado.',
    DOCUMENT_IN_USE: 'Este documento já está em outra conta.',
    CNPJ_ALREADY_USED:
      'Este CNPJ já está em outro estabelecimento. Filiais usam o CNPJ da própria filial.',
    ALREADY_VERIFIED: 'Este estabelecimento já está verificado com este documento.',
    NOT_PENDING: 'Esta verificação já foi revisada.',
    CRYPTO_UNAVAILABLE: 'A verificação está indisponível no momento. Tente mais tarde.',
    INVALID_DOCUMENT_FILE: 'Arquivo não aceito. Envie JPEG, PNG, WebP ou PDF.',
    IMAGE_TOO_LARGE: 'O arquivo passa de 6 MB. Escolha um arquivo menor.',
    STORAGE_UNAVAILABLE: 'O armazenamento está indisponível. Tente novamente em instantes.',
    INTERNAL_ERROR: 'Não foi possível concluir a verificação. Tente novamente.',
  },
};

export const verificationEn: VerificationTranslation = {
  status: {
    not_submitted: 'Verify business',
    pending: 'Verification under review',
    approved: 'Verified by Use Guide',
    rejected: 'Verification declined',
  },
  chipLabel: 'Verification of {{name}}: {{status}}',
  dialog: {
    title: 'Business verification',
    intro:
      'Use Guide checks each business before granting the badge and enabling sales. The document number is encrypted and only shown masked.',
    close: 'Close',
    loading: 'Loading the verification...',
    retry: 'Try again',
  },
  panel: {
    pending: 'We received the documents. Follow the review result here.',
    approved: 'Business verified.',
    approvedCpf:
      'Business verified with a CPF. Selling tickets, tours or bookings requires a CNPJ (MEI works).',
    rejected: 'The verification was declined. Reason: {{reason}}',
    document: 'Document: {{document}}',
    resubmit: 'Fix the details and send it again.',
  },
  form: {
    documentType: 'Business document',
    cpf: 'CPF',
    cnpj: 'CNPJ',
    cnpjHint: 'Selling tickets, tours or bookings requires a CNPJ (MEI works).',
    document: 'Document number',
    holderRole: 'Your link to the document',
    owner: 'I am the holder, partner or director',
    representative: 'I am a representative (manager or employee)',
    filesTitle: 'Files',
    fileHint: 'JPEG, PNG, WebP or PDF, up to 6 MB.',
    chooseFile: 'Choose file',
    replaceFile: 'Replace file',
    fileSelected: 'Selected: {{name}}',
    cpfReuseHint:
      'If this CPF was already checked for another business in your account, you do not need to send the ID again.',
    cadastur: 'Cadastur (optional)',
    cadasturHint: 'Registration number at the Ministry of Tourism, if you have one.',
    submit: 'Send for verification',
    submitting: 'Sending...',
    sent: 'Verification sent.',
    linkedText:
      "The producer profile uses the document of one of your businesses and follows that business's verification.",
    source: 'Source business',
    sourcePlaceholder: 'Select',
    noSource: 'Add a business before verifying the producer profile.',
  },
  files: {
    cnpjCard: 'CNPJ card issued by the Federal Revenue',
    identity: 'Photo ID (RG or driver’s license)',
    authorization: 'Authorization signed by a partner',
  },
  validation: {
    documentInvalidCpf: 'Invalid CPF.',
    documentInvalidCnpj: 'Invalid CNPJ.',
    holderRoleRequired: 'Tell us your link to the document.',
    identityRequired: 'Upload the photo ID.',
    cnpjCardRequired: 'Upload the CNPJ card.',
    authorizationRequired: 'Upload the authorization signed by a partner.',
    sourceRequired: 'Choose a business.',
  },
  admin: {
    tab: 'Verifications',
    title: 'Business verification',
    filterLabel: 'Filter verifications',
    filters: {
      pending: 'Under review',
      approved: 'Approved',
      rejected: 'Declined',
    },
    empty: 'No verifications in this list.',
    loadMore: 'Load more',
    ownerUnknown: 'Unnamed account',
    sentBy: 'Sent by {{name}}',
    submittedAt: 'Sent on {{date}}',
    reviewedAt: 'Reviewed on {{date}}',
    holderOwner: 'Holder, partner or director',
    holderRepresentative: 'Representative',
    cadastur: 'Cadastur: {{number}}',
    reason: 'Reason: {{reason}}',
    openFile: 'Open: {{file}}',
    fileError: 'The file could not be opened.',
    approve: 'Approve',
    approveConfirm:
      'Approve the verification? Check the CNPJ card at the Federal Revenue, the person’s link to the company (QSA or MEI) and the ID. With an approved CNPJ, the business can sell.',
    approved: 'Verification approved.',
    reject: 'Decline',
    rejectReason: 'Reason for declining',
    rejectReasonHint: 'The partner sees this text. Use at least 5 characters.',
    confirmReject: 'Confirm decline',
    cancel: 'Cancel',
    rejected: 'Verification declined.',
  },
  errors: {
    VALIDATION_ERROR: 'Check the verification details and files.',
    UNAUTHENTICATED: 'Sign in again to continue.',
    FORBIDDEN: 'You do not have access to this verification.',
    NOT_FOUND: 'Business not found.',
    DOCUMENT_IN_USE: 'This document belongs to another account.',
    CNPJ_ALREADY_USED: 'This CNPJ is used by another business. Branches use their own CNPJ.',
    ALREADY_VERIFIED: 'This business is already verified with this document.',
    NOT_PENDING: 'This verification was already reviewed.',
    CRYPTO_UNAVAILABLE: 'Verification is unavailable right now. Please try later.',
    INVALID_DOCUMENT_FILE: 'File not accepted. Upload JPEG, PNG, WebP or PDF.',
    IMAGE_TOO_LARGE: 'The file is larger than 6 MB. Choose a smaller file.',
    STORAGE_UNAVAILABLE: 'Storage is unavailable. Please try again shortly.',
    INTERNAL_ERROR: 'The verification could not be completed. Please try again.',
  },
};

export const verificationFr: VerificationTranslation = {
  status: {
    not_submitted: 'Vérifier l’établissement',
    pending: 'Vérification en cours',
    approved: 'Vérifié par Use Guide',
    rejected: 'Vérification refusée',
  },
  chipLabel: 'Vérification de {{name}} : {{status}}',
  dialog: {
    title: 'Vérification de l’établissement',
    intro:
      'Use Guide contrôle chaque établissement avant d’accorder le badge et d’ouvrir les ventes. Le numéro du document est chiffré et n’apparaît que masqué.',
    close: 'Fermer',
    loading: 'Chargement de la vérification...',
    retry: 'Réessayer',
  },
  panel: {
    pending: 'Nous avons reçu les documents. Suivez ici le résultat de l’analyse.',
    approved: 'Établissement vérifié.',
    approvedCpf:
      'Établissement vérifié avec un CPF. Pour vendre des billets, des excursions ou des réservations, un CNPJ est nécessaire (le MEI convient).',
    rejected: 'La vérification a été refusée. Motif : {{reason}}',
    document: 'Document : {{document}}',
    resubmit: 'Corrigez les informations et renvoyez-les.',
  },
  form: {
    documentType: 'Document de l’établissement',
    cpf: 'CPF',
    cnpj: 'CNPJ',
    cnpjHint:
      'Pour vendre des billets, des excursions ou des réservations, un CNPJ est nécessaire (le MEI convient).',
    document: 'Numéro du document',
    holderRole: 'Votre lien avec le document',
    owner: 'Je suis le titulaire, associé ou dirigeant',
    representative: 'Je suis un représentant (gérant ou employé)',
    filesTitle: 'Fichiers',
    fileHint: 'JPEG, PNG, WebP ou PDF, 6 Mo maximum.',
    chooseFile: 'Choisir un fichier',
    replaceFile: 'Remplacer le fichier',
    fileSelected: 'Sélectionné : {{name}}',
    cpfReuseHint:
      'Si ce CPF a déjà été contrôlé pour un autre établissement de votre compte, inutile de renvoyer la pièce d’identité.',
    cadastur: 'Cadastur (facultatif)',
    cadasturHint: 'Numéro d’enregistrement au ministère du Tourisme, si vous en avez un.',
    submit: 'Envoyer pour vérification',
    submitting: 'Envoi...',
    sent: 'Vérification envoyée.',
    linkedText:
      'Le profil de producteur utilise le document de l’un de vos établissements et suit sa vérification.',
    source: 'Établissement d’origine',
    sourcePlaceholder: 'Sélectionner',
    noSource: 'Ajoutez un établissement avant de vérifier le profil de producteur.',
  },
  files: {
    cnpjCard: 'Carte CNPJ délivrée par la Receita Federal',
    identity: 'Pièce d’identité avec photo (RG ou permis de conduire)',
    authorization: 'Autorisation signée par un associé',
  },
  validation: {
    documentInvalidCpf: 'CPF invalide.',
    documentInvalidCnpj: 'CNPJ invalide.',
    holderRoleRequired: 'Indiquez votre lien avec le document.',
    identityRequired: 'Envoyez la pièce d’identité.',
    cnpjCardRequired: 'Envoyez la carte CNPJ.',
    authorizationRequired: 'Envoyez l’autorisation signée par un associé.',
    sourceRequired: 'Choisissez un établissement.',
  },
  admin: {
    tab: 'Vérifications',
    title: 'Vérification des établissements',
    filterLabel: 'Filtrer les vérifications',
    filters: {
      pending: 'En cours',
      approved: 'Approuvées',
      rejected: 'Refusées',
    },
    empty: 'Aucune vérification dans cette liste.',
    loadMore: 'Charger plus',
    ownerUnknown: 'Compte sans nom',
    sentBy: 'Envoyé par {{name}}',
    submittedAt: 'Envoyé le {{date}}',
    reviewedAt: 'Revu le {{date}}',
    holderOwner: 'Titulaire, associé ou dirigeant',
    holderRepresentative: 'Représentant',
    cadastur: 'Cadastur : {{number}}',
    reason: 'Motif : {{reason}}',
    openFile: 'Ouvrir : {{file}}',
    fileError: 'Impossible d’ouvrir le fichier.',
    approve: 'Approuver',
    approveConfirm:
      'Approuver la vérification ? Contrôlez la carte CNPJ auprès de la Receita, le lien de la personne avec l’entreprise (QSA ou MEI) et la pièce d’identité. Avec un CNPJ approuvé, l’établissement peut vendre.',
    approved: 'Vérification approuvée.',
    reject: 'Refuser',
    rejectReason: 'Motif du refus',
    rejectReasonHint: 'Le partenaire voit ce texte. 5 caractères minimum.',
    confirmReject: 'Confirmer le refus',
    cancel: 'Annuler',
    rejected: 'Vérification refusée.',
  },
  errors: {
    VALIDATION_ERROR: 'Vérifiez les informations et les fichiers.',
    UNAUTHENTICATED: 'Reconnectez-vous pour continuer.',
    FORBIDDEN: 'Vous n’avez pas accès à cette vérification.',
    NOT_FOUND: 'Établissement introuvable.',
    DOCUMENT_IN_USE: 'Ce document appartient à un autre compte.',
    CNPJ_ALREADY_USED:
      'Ce CNPJ est déjà utilisé par un autre établissement. Les filiales utilisent leur propre CNPJ.',
    ALREADY_VERIFIED: 'Cet établissement est déjà vérifié avec ce document.',
    NOT_PENDING: 'Cette vérification a déjà été revue.',
    CRYPTO_UNAVAILABLE: 'La vérification est indisponible pour le moment. Réessayez plus tard.',
    INVALID_DOCUMENT_FILE: 'Fichier refusé. Envoyez un JPEG, PNG, WebP ou PDF.',
    IMAGE_TOO_LARGE: 'Le fichier dépasse 6 Mo. Choisissez un fichier plus léger.',
    STORAGE_UNAVAILABLE: 'Le stockage est indisponible. Réessayez dans un instant.',
    INTERNAL_ERROR: 'Impossible de finaliser la vérification. Réessayez.',
  },
};

=== src/shared/stores/useUIStore.ts — diff ===
@@ -1,6 +1,6 @@
 import { create } from 'zustand';
 import { toast } from 'sonner';
-import { ConfirmDialogData } from '../../ui/components/ConfirmDialog';
+import type { ConfirmDialogData, ConfirmDialogTone } from '../../ui/components/ConfirmDialog';
 
 export type ToastType = 'success' | 'error' | 'info';
 export type LoginModalTab = 'login' | 'forgot';
@@ -16,7 +16,10 @@ export interface UIState {
   closeLoginModal: () => void;
   setLoginClosingBySwipe: (val: boolean) => void;
   showToast: (message: string, type?: ToastType) => void;
-  confirmAction: (message: string) => Promise<boolean>;
+  confirmAction: (
+    message: string,
+    options?: { tone?: ConfirmDialogTone; confirmLabel?: string }
+  ) => Promise<boolean>;
   closeConfirmDialog: () => void;
 }
 
@@ -41,18 +44,18 @@ export const useUIStore = create<UIState>((set) => ({
       case 'error':
         toast.error(message);
         break;
-      case 'info':
       default:
         toast.info(message);
         break;
     }
   },
 
-  confirmAction: (message: string): Promise<boolean> => {
+  confirmAction: (message, options) => {
     return new Promise((resolve) => {
       set({
         confirmDialog: {
           message,
+          ...options,
           onConfirm: () => {
             set({ confirmDialog: null });
             resolve(true);

=== src/ui/components/ConfirmDialog.tsx — diff ===
@@ -1,12 +1,20 @@
 import * as RadixDialog from '@radix-ui/react-dialog';
-import { AlertTriangle } from 'lucide-react';
+import { AlertTriangle, CheckCircle2 } from 'lucide-react';
+import { useTranslation } from 'react-i18next';
+import { cn } from '../../shared/utils/cn';
 import { GlassCard } from './GlassCard';
 import { Z_INDEX } from '../../shared/constants/zIndex';
 
+/** `danger` (padrão) para excluir ou cancelar; `positive` para aprovar ou liberar algo. */
+export type ConfirmDialogTone = 'danger' | 'positive';
+
 export interface ConfirmDialogData {
   message: string;
   onConfirm: () => void;
   onCancel: () => void;
+  tone?: ConfirmDialogTone;
+  /** Rótulo do botão de confirmar; o padrão é "Confirmar". */
+  confirmLabel?: string;
 }
 
 interface ConfirmDialogProps {
@@ -14,6 +22,9 @@ interface ConfirmDialogProps {
 }
 
 export function ConfirmDialog({ data }: ConfirmDialogProps) {
+  const { t } = useTranslation();
+  const positive = data?.tone === 'positive';
+  const Icon = positive ? CheckCircle2 : AlertTriangle;
   return (
     <RadixDialog.Root
       open={!!data}
@@ -31,24 +42,33 @@ export function ConfirmDialog({ data }: ConfirmDialogProps) {
           style={{ zIndex: Z_INDEX.modalNested }}
         >
           <GlassCard className="p-6 flex flex-col items-center text-center gap-4">
-            <AlertTriangle size={28} className="text-amber-400" />
+            <Icon
+              size={28}
+              className={positive ? 'text-emerald-400' : 'text-amber-400'}
+              aria-hidden="true"
+            />
             <RadixDialog.Title className="text-sm font-medium text-white/90 leading-relaxed">
               {data?.message}
             </RadixDialog.Title>
             <div className="flex gap-3 w-full">
               <button
+                type="button"
                 onClick={data?.onCancel}
-                aria-label="Cancelar"
                 className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wide hover:bg-white/15 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
               >
-                Cancelar
+                {t('common.cancel')}
               </button>
               <button
+                type="button"
                 onClick={data?.onConfirm}
-                aria-label="Confirmar"
-                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-rose-500/80 text-white text-xs font-bold uppercase tracking-wide hover:bg-rose-500 transition-colors focus-visible:ring-2 focus-visible:ring-rose-400/50 focus-visible:outline-none"
+                className={cn(
+                  'flex-1 min-h-[44px] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors focus-visible:ring-2 focus-visible:outline-none',
+                  positive
+                    ? 'bg-emerald-500 text-black hover:bg-emerald-400 focus-visible:ring-emerald-400/50'
+                    : 'bg-rose-500/80 text-white hover:bg-rose-500 focus-visible:ring-rose-400/50'
+                )}
               >
-                Confirmar
+                {data?.confirmLabel ?? t('common.confirm')}
               </button>
             </div>
           </GlassCard>

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm test` → 168 arquivos, 904 testes, `npm run build`;
- no app: painel do parceiro → um cadastro → selo "Verificar estabelecimento" → enviar com CNPJ e arquivos de teste; painel admin → aba Verificações → abrir os arquivos, aprovar ou recusar. Repita em `fr` para ver se o texto não corta.

Antes de testar no AI Studio, confirme no painel Secrets: FIELD_ENCRYPTION_DEV_KEY e PII_BLIND_INDEX_KEY (18.3.0a).

Responda no formato do AGENTS.md §16.3.
~~~~
