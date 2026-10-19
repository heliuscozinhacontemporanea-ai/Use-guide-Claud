# Prompt 18.2 — Editor único de cadastro (parceiro e admin)

> Lote 12, gerado dos commits de referência `fbfbfe9` e `c2658aa` da branch `claude/agents-md-v2`. Aplique sobre o zip de 2026-10-19 (2º), que já tem o lote 11. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.2 — Editor único de cadastro (parceiro e admin)

Decisão D9 (editor único): o admin passa a editar hospedagens, restaurantes, atrações, passeios, translados, aluguéis e perfis de produtor com os mesmos campos e regras da inscrição do parceiro.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e os dois arquivos apagados. Não reescreva os arquivos do seu jeito e não acrescente funcionalidades.

O QUE MUDA:
1) src/domain/partners/components/ListingEditor.tsx (novo): o editor de cadastro sai do PartnerPanel e vira um componente com formulário (Steps 1–5 em modo editor), validação, upload das fotos e conversão com mapPartnerSubmissionToGuideItem. Quem usa decide onde gravar (onSave/onDelete). O editor não fecha mais ao clicar fora, o que descartava as edições.
2) useListingEditorValidation (novo): as regras da inscrição, seção por seção. Sem CPF/CNPJ (caso do admin), a identidade é validada por nome e descrição; o perfil de produtor não exige descrição nem foto. useEditorScrollLock (novo): trava a rolagem atrás dos editores.
3) PartnerPanel usa o ListingEditor. Os hooks do painel perdem o estado do editor antigo (editorFormData, errors, validate*, handleSaveItem). Apagar usePartnerContentEditor.ts.
4) Admin:
   - src/app/compositions/AdminPanelComposition.tsx (novo) monta o AdminDispatcher com o ListingEditor e grava pelos UseCases do guide; AppRouter e AppRoutes passam a usar a composição;
   - itens que não são dica abrem o editor de cadastro;
   - "Novo Registro" cria atração ou passeio, que são as categorias que o servidor permite ao admin;
   - "Nova dica" abre o editor próprio do admin, que fica só para dicas e eventos;
   - apagar AdminEditorOperationalInfo.tsx.
5) StandardCard: ícone Bike no mapa de ícones (o aluguel mostrava o ícone genérico).
6) docs/arquitetura/debitos.md: B17 atualizado e resolução "Editor único de cadastro — Prompt 18.2".
7) Testes novos: useListingEditorValidation.test.ts e AdminItemGrid.test.tsx.
8) Avisos do lint corrigidos nos arquivos tocados (regra: arquivo tocado sai sem avisos): dependências dos efeitos do AdminEditorModal e do usePartnerProfile, useConnection sem uso no AppRouter, parâmetros sem uso nos hooks do painel e imports de React sem uso. Os arquivos tocados ficam formatados pelo biome.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- server/domain/admin/schemas/adminPlanSchema.ts (alterar)
- src/app/AppRouter.tsx (alterar)
- src/app/compositions/AdminPanelComposition.tsx (criar)
- src/app/routes/AppRoutes.test.tsx (alterar)
- src/app/routes/AppRoutes.tsx (alterar)
- src/domain/admin/components/AdminDispatcher.tsx (alterar)
- src/domain/admin/components/AdminPanel.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminEditorModal.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminEditorOperationalInfo.tsx (apagar)
- src/domain/admin/components/subcomponents/AdminGuideView.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminItemGrid.test.tsx (criar)
- src/domain/admin/components/subcomponents/AdminItemGrid.tsx (alterar)
- src/domain/admin/index.ts (alterar)
- src/domain/guide/components/StandardCard.tsx (alterar)
- src/domain/partners/components/ListingEditor.tsx (criar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/hooks/useEditorScrollLock.ts (criar)
- src/domain/partners/hooks/useListingEditorValidation.test.ts (criar)
- src/domain/partners/hooks/useListingEditorValidation.ts (criar)
- src/domain/partners/hooks/usePartnerContentActions.ts (alterar)
- src/domain/partners/hooks/usePartnerContentEditor.ts (apagar)
- src/domain/partners/hooks/usePartnerItems.ts (alterar)
- src/domain/partners/hooks/usePartnerLayoutState.ts (alterar)
- src/domain/partners/hooks/usePartnerPanelActions.ts (alterar)
- src/domain/partners/hooks/usePartnerProfile.ts (alterar)
- src/domain/partners/index.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -13,7 +13,7 @@
 | B13 | `application/usecases/bookings/*` (horário cancelado, reembolso que falhou) | §8.7 (avisar o comprador) e §7.10 A09 (alerta ao admin) | médio — o comprador só descobre o cancelamento em "Minhas reservas" e a falha de reembolso fica só no log | `notifications` aceitar destinatário usuário e admin (hoje só `recipientPartnerId`) |
 | B14 | UX — itens da auditoria de 2026-10-12 que pedem decisão de produto | §11 (UX) e §15 item 4 | baixo a médio | (a) preferências de notificação do parceiro estão em "Sobre o app" (`content/components/AboutView.tsx`), deveriam ir para Configurações; (b) "Ver todos" da Explore abre a listagem sem a busca e os filtros aplicados (`GridView` não tem filtros); (c) modais de hospedagem e restaurante não têm botão de mapa (`mapLink`); (d) "Programa de Parceiros" aberto pelo menu não volta ao menu ao fechar |
 | B16 | textos fixos em pt-BR ainda em `user/components/AccountView.tsx`, `ticketing/components/UserTicketsHistoryView.tsx` e `CheckoutResultView.tsx`, `partners/components/PartnersModal.tsx`, `insights/components/ReportsView.tsx`, `guide/components/ExploreView.tsx` | §12.3 | médio para en/fr | traduzir tela a tela; o Prompt 16 traduziu menu, configurações, favoritos e portal do parceiro |
-| B17 | Painel do parceiro — itens da auditoria de 2026-10-12 ainda abertos | §11.8, §11.10, §12.4, §11.7, §13 | médio | seção de reservas aparece para hospedagem/restaurante; três critérios de "pronto para receber" (Prompt 17.2); parceiro não gerencia datas/capacidade do evento (editor único, Prompts 18–19); ingressos ocultos em evento novo sem aviso; relatórios bloqueados só na UI; quem já assina vê a compra de novo; erros de catálogo/notificações aparecem como lista vazia; excluir lote e "não compareceu" sem confirmação; clique fora do editor descarta edições; preço de plano com `'R$ ' +` (Prompt 17.1); datas exibidas sem fuso no gerenciador de ingressos; botões só com ícone sem nome; `PartnerItemForms.tsx` sem uso; `PartnerPanel.tsx` (592 linhas), `Step2ContactInfo.tsx` (516) e `Step5Media.tsx` (756) acima de 400 linhas, a dividir no editor único (Prompt 18.2) |
+| B17 | Painel do parceiro — itens da auditoria de 2026-10-12 ainda abertos | §11.8, §11.10, §12.4, §11.7, §13 | médio | seção de reservas aparece para hospedagem/restaurante; parceiro não gerencia datas/capacidade do evento (Prompt 18.2.1); ingressos ocultos em evento novo sem aviso; relatórios bloqueados só na UI; quem já assina vê a compra de novo; erros de catálogo/notificações aparecem como lista vazia; excluir lote e "não compareceu" sem confirmação; clique fora do editor de evento descarta edições; botões só com ícone sem nome no editor de evento; `PartnerItemForms.tsx` sem uso; `Step2ContactInfo.tsx` (516 linhas) e `Step5Media.tsx` (756) acima de 400 linhas |
 | B18 | Painel admin — itens da auditoria de 2026-10-12 ainda abertos | §6.2, §6.4, §8, §11.7, §11.8 | médio | preço de planos em reais (Prompt 17.1); preço de item gravado como texto; catálogo e planos lidos direto do Firestore (deveria ser API, com limite); relatórios em branco antes de carregar e média 0.0 sem avaliações; card de eventos conta rascunhos; duas entradas (`/admin` e `?admin=1`); visitante sem login redirecionado sem aviso; tabs sem `role="tablist"` |
 | B19 | Modelo de eventos guarda contato em dois lugares (`phone` no topo e `contact.phone`) | §13, §6.3 | baixo | unificar em `contact` quando o editor único (Prompt 18.2) tocar no evento |
 | B20 | `operationalInfoSchema` duplicado em `server/domain/guide/schemas/guideSchema.ts` e `server/domain/partners/schemas/partnerContentSchema.ts` | §5.3 | baixo — as duas cópias precisam mudar juntas | rotas de conteúdo do parceiro passarem a validar com o schema publicado pelo `guide` (Published Language) |
@@ -22,6 +22,7 @@
 
 | ID | Resolução |
 |---|---|
+| Editor único de cadastro — Prompt 18.2 | `ListingEditor` (partners) usado pelo painel do parceiro e pelo admin (composição `AdminPanelComposition`); o admin edita hospedagem, restaurante, atração, passeio, translado, aluguel e perfil de produtor com os mesmos campos da inscrição; o editor não fecha ao clicar fora; `PartnerPanel.tsx` abaixo de 400 linhas; datas no fuso de Fortaleza no gerenciador de ingressos (AI Studio, lote 9); três critérios de "pronto para receber" unificados (17.2); preço de plano por `Intl` (17.1) |
 | Categorias passeio, translado e aluguel na inscrição e no editor — Prompt 18.1 | formulário com campos próprios por categoria (`steps/details/`), validação no `step3Schema`, gravação em `operationalInfo`; editor do painel sem CPF/CNPJ e com categoria travada em item existente; campo de arquivo do cardápio removido |
 | Painéis parceiro/admin — Prompt 17 | plano pago abre o checkout; visualizações e relatório de evento corretos; portal rola; sessões de evento não duplicam e são removidas no servidor; "Suspender" grava `suspended` e bloqueia; selo do admin sem mexer no plano; excluir parceiro com confirmação; filtro e categoria de evento; avisos com seleção limpa; datas dos formulários de evento no fuso de Fortaleza |
 | B15 | Removido import de `database/factory` em `FavoritesList` (Prompt 16): o item usa os dados de `FavoriteItem` e navega para o detalhe via `useSideMenu` |

=== server/domain/admin/schemas/adminPlanSchema.ts — diff ===
@@ -1,6 +1,4 @@
 import { z } from 'zod';
- 
-
 
 export const updatePlanSchema = z
   .object({

=== src/app/AppRouter.tsx — diff ===
@@ -1,7 +1,7 @@
 import { AnimatePresence, motion } from 'motion/react';
 import { useEffect, useMemo, useRef, useState } from 'react';
 import { useLocation, useSearchParams } from 'react-router-dom';
-import { AdminDispatcher } from '../domain/admin/components/AdminDispatcher';
+import { AdminPanelComposition } from './compositions/AdminPanelComposition';
 import { LoginModal } from '../domain/auth/components/LoginModal';
 import { useAuthContext } from '../domain/auth/context/AuthContext';
 import { UserRole } from '../domain/auth/types/auth';
@@ -15,7 +15,6 @@ import { TipDetailModal } from '../domain/guide/components/TipDetailModal';
 import { TourDetailModal } from '../domain/guide/components/TourDetailModal';
 import { PartnersModal } from '../domain/partners';
 import { SearchOverlay } from '../domain/search';
-import { useConnection } from '../shared/hooks/useConnection';
 import { useScrollLock } from '../shared/hooks/useScrollLock';
 import { useLocalizedRouting, useSyncLocaleWithUrl } from '../shared/hooks/useLocalizedRouting';
 import { useSEO } from '../shared/hooks/useSEO';
@@ -40,7 +39,6 @@ export function AppRouter() {
   const { routeKey } = useLocalizedRouting();
   const isExplorePage = routeKey === 'explore';
   useSyncLocaleWithUrl();
-  const connection = useConnection();
   const [searchParams, setSearchParams] = useSearchParams();
   const { isLoginModalOpen, isLoginClosingBySwipe, closeLoginModal, openLoginModal } = useUI();
   const loginModalTab = useUIStore((state) => state.loginModalTab);
@@ -255,6 +253,7 @@ export function AppRouter() {
   const [isScrolled, setIsScrolled] = useState(false);
   const [isSearchSticky, setIsSearchSticky] = useState(false);
 
+  // biome-ignore lint/correctness/useExhaustiveDependencies: a busca fixa volta ao normal a cada troca de rota.
   useEffect(() => {
     setIsSearchSticky(false);
   }, [location.pathname]);
@@ -319,7 +318,7 @@ export function AppRouter() {
         )}
 
         {isAdminOpen ? (
-          <AdminDispatcher />
+          <AdminPanelComposition />
         ) : isPartnerPortalOpen ? (
           <PartnerPortalComposition />
         ) : (

=== src/app/compositions/AdminPanelComposition.tsx — ARQUIVO NOVO, conteúdo completo ===
import { AdminDispatcher, type AdminListingEditorProps } from '../../domain/admin';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import {
  createGuideItemUseCase,
  deleteGuideItemUseCase,
  type GuideCreateItemInput,
  type GuideItem,
  type GuideItemOperationalInfo,
  updateGuideItemUseCase,
} from '../../domain/guide';
import {
  ListingEditor,
  type PartnerContentItemInput,
  type PartnerContentRecord,
} from '../../domain/partners';

// Cadastros novos que o admin pode criar pelo editor do parceiro (o servidor permite só estes ao admin).
const ADMIN_LISTING_CATEGORIES = ['sight', 'tour'];

function toListingRecord(item: GuideItem): PartnerContentRecord {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    image: item.image,
    images: item.images,
    location: item.location,
    instagramLink: item.instagramLink,
    websiteLink: item.websiteLink,
    bookingLink: item.bookingLink,
    phone: item.phone,
    googleMapsLink: item.googleMapsLink,
    address: item.address,
    tags: item.tags,
    operationalInfo: item.operationalInfo,
  };
}

function toGuideInput(input: PartnerContentItemInput): GuideCreateItemInput {
  return {
    name: input.name,
    description: input.description,
    category: input.category,
    image: input.image,
    images: input.images,
    location: input.location,
    instagramLink: input.instagramLink,
    websiteLink: input.websiteLink,
    bookingLink: input.bookingLink,
    phone: input.phone,
    googleMapsLink: input.googleMapsLink,
    address: input.address,
    tags: input.tags,
    // Montado por buildOperationalInfo, com os mesmos campos de GuideItemOperationalInfo.
    operationalInfo: input.operationalInfo as GuideItemOperationalInfo | undefined,
  };
}

function AdminListingEditor({ item, onClose }: AdminListingEditorProps) {
  const { user } = useAuthContext();
  return (
    <ListingEditor
      item={item ? toListingRecord(item) : null}
      allowedCategoryIds={ADMIN_LISTING_CATEGORIES}
      currentUser={user}
      onSave={async (input, itemId) => {
        if (itemId) {
          await updateGuideItemUseCase(itemId, toGuideInput(input));
        } else {
          await createGuideItemUseCase(toGuideInput(input));
        }
      }}
      onDelete={deleteGuideItemUseCase}
      onClose={onClose}
    />
  );
}

/** Painel admin com o editor de cadastro do parceiro (editor único, decisão D9). */
export function AdminPanelComposition() {
  return <AdminDispatcher renderListingEditor={(props) => <AdminListingEditor {...props} />} />;
}

=== src/app/routes/AppRoutes.test.tsx — diff ===
@@ -14,8 +14,8 @@ vi.mock('../../domain/guide/components/GridView', () => ({
 vi.mock('../../domain/ticketing', () => ({
   CheckoutResultView: ({ orderId }: { orderId: string }) => <div>checkout-{orderId}</div>,
 }));
-vi.mock('../../domain/admin/components/AdminDispatcher', () => ({
-  AdminDispatcher: () => <div>admin</div>,
+vi.mock('../compositions/AdminPanelComposition', () => ({
+  AdminPanelComposition: () => <div>admin</div>,
 }));
 vi.mock('../../domain/auth/components/ResetPassword', () => ({
   ResetPassword: () => <div>reset</div>,

=== src/app/routes/AppRoutes.tsx — diff ===
@@ -1,6 +1,6 @@
 import type { ReactNode } from 'react';
 import { Route, Routes, type Location } from 'react-router-dom';
-import { AdminDispatcher } from '../../domain/admin/components/AdminDispatcher';
+import { AdminPanelComposition } from '../compositions/AdminPanelComposition';
 import { ResetPassword } from '../../domain/auth/components/ResetPassword';
 import type { GuideItem } from '../../domain/guide';
 import { ExploreView } from '../../domain/guide/components/ExploreView';
@@ -66,7 +66,7 @@ export function AppRoutes({ location, onSelectItem, onStickyChange }: AppRoutesP
         ))
       )}
       <Route path="/checkout/result" element={<CheckoutResultComposition />} />
-      <Route path="/admin" element={<AdminDispatcher />} />
+      <Route path="/admin" element={<AdminPanelComposition />} />
       <Route path="/reset-password" element={<ResetPassword />} />
       <Route path="*" element={<NotFoundView />} />
     </Routes>

=== src/domain/admin/components/AdminDispatcher.tsx — diff ===
@@ -2,7 +2,7 @@ import { ChevronLeft, RefreshCw, ShieldAlert } from 'lucide-react';
 import { useEffect } from 'react';
 import { useAuthContext } from '../../auth/context/AuthContext';
 import { UserRole } from '../../auth/types/auth';
-import { AdminPanel } from './AdminPanel';
+import { AdminPanel, type AdminPanelProps } from './AdminPanel';
 import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
 
 function RestrictedAdminAccess() {
@@ -12,12 +12,8 @@ function RestrictedAdminAccess() {
       <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
         <ShieldAlert size={32} />
       </div>
-      <h2 className="text-2xl font-display font-extrabold mb-2 text-white">
-        Acesso Restrito
-      </h2>
-      <p className="text-white/50 mb-8 max-w-xs">
-        Este portal é exclusivo para administradores.
-      </p>
+      <h2 className="text-2xl font-display font-extrabold mb-2 text-white">Acesso Restrito</h2>
+      <p className="text-white/50 mb-8 max-w-xs">Este portal é exclusivo para administradores.</p>
       <button
         type="button"
         onClick={() => goTo('explore')}
@@ -32,7 +28,7 @@ function RestrictedAdminAccess() {
   );
 }
 
-export function AdminDispatcher() {
+export function AdminDispatcher({ renderListingEditor }: AdminPanelProps = {}) {
   const { goTo } = useLocalizedRouting();
   const { user, loading } = useAuthContext();
 
@@ -45,10 +41,7 @@ export function AdminDispatcher() {
   if (loading) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-[#020508]">
-        <RefreshCw
-          className="animate-spin text-teal-500 mb-4"
-          size={32}
-        />
+        <RefreshCw className="animate-spin text-teal-500 mb-4" size={32} />
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
           Verificando Credenciais...
         </p>
@@ -64,5 +57,5 @@ export function AdminDispatcher() {
     return <RestrictedAdminAccess />;
   }
 
-  return <AdminPanel />;
+  return <AdminPanel renderListingEditor={renderListingEditor} />;
 }

=== src/domain/admin/components/AdminPanel.tsx — diff ===
@@ -1,4 +1,4 @@
-import { useMemo, useState } from 'react';
+import { type ReactNode, useMemo, useState } from 'react';
 import { UserRole } from '../../auth/types/auth';
 import { motion, AnimatePresence } from 'motion/react';
 import { useAuthContext } from '../../auth/context/AuthContext';
@@ -38,23 +38,45 @@ import { AdminNavigation, type AdminTabId } from './subcomponents/AdminNavigatio
 import { AdminStatsView } from './subcomponents/AdminStatsView';
 import { AdminPartnersView } from './subcomponents/AdminPartnersView';
 import { AdminGuideView } from './subcomponents/AdminGuideView';
-import {
-  ADMIN_CREATABLE_ITEM_CATEGORIES,
-  AdminEditorModal,
-  type AdminEditorSaveData,
-} from './subcomponents/AdminEditorModal';
+import { AdminEditorModal, type AdminEditorSaveData } from './subcomponents/AdminEditorModal';
 import { AdminPlansView } from './subcomponents/AdminPlansView';
 import { AdminNotificationsView } from './subcomponents/AdminNotificationsView';
 
-export { ADMIN_CREATABLE_ITEM_CATEGORIES };
+function newRecord(category: 'tips' | 'event'): GuideItem {
+  return {
+    id: '',
+    name: '',
+    description: '',
+    image: '',
+    images: [],
+    category,
+    location: 'Jericoacoara',
+  } as GuideItem;
+}
+
+export interface AdminListingEditorProps {
+  /** Cadastro a editar; `null` cria um novo. */
+  item: GuideItem | null;
+  onClose: () => void;
+}
 
-export function AdminPanel() {
+export interface AdminPanelProps {
+  /**
+   * Editor de cadastro (o mesmo do parceiro), montado pela composição do app. Dicas e eventos
+   * continuam no editor próprio do admin.
+   */
+  renderListingEditor?: (props: AdminListingEditorProps) => ReactNode;
+}
+
+export function AdminPanel({ renderListingEditor }: AdminPanelProps = {}) {
   const { goTo } = useLocalizedRouting();
   const { user, loading: userLoading } = useAuthContext();
   const { showToast, confirmAction } = useUI();
   const [activeTab, setActiveTab] = useState<AdminTabId>('reports');
   const [filter, setFilter] = useState<string>('all');
   const [isEditing, setIsEditing] = useState<GuideItem | null>(null);
+  // `null` abre o editor de cadastro para um item novo; `undefined` mantém fechado.
+  const [editingListing, setEditingListing] = useState<GuideItem | null | undefined>(undefined);
 
   const isAdminUser = user?.role === UserRole.ADMIN;
 
@@ -299,23 +321,27 @@ export function AdminPanel() {
                 dataError={dataError}
                 onRetry={retryCatalog}
                 onInitNew={() => {
-                  const initialCategory = activeTab === 'items' ? 'tips' : 'event';
-                  setIsEditing({
-                    id: '',
-                    name: '',
-                    description: '',
-                    image: '',
-                    images: [],
-                    category: initialCategory,
-                    location: 'Jericoacoara',
-                  } as GuideItem);
+                  if (activeTab === 'items' && renderListingEditor) {
+                    setEditingListing(null);
+                    return;
+                  }
+                  setIsEditing(newRecord(activeTab === 'items' ? 'tips' : 'event'));
                 }}
-                onEdit={(item) =>
+                onInitNewTip={
+                  activeTab === 'items' && renderListingEditor
+                    ? () => setIsEditing(newRecord('tips'))
+                    : undefined
+                }
+                onEdit={(item) => {
+                  if (activeTab === 'items' && item.category !== 'tips' && renderListingEditor) {
+                    setEditingListing(item);
+                    return;
+                  }
                   setIsEditing({
                     ...item,
                     images: item.images || (item.image ? [item.image] : []),
-                  })
-                }
+                  });
+                }}
                 onDelete={handleDelete}
               />
             )}
@@ -323,6 +349,14 @@ export function AdminPanel() {
         </AnimatePresence>
       </div>
 
+      <AnimatePresence>
+        {editingListing !== undefined &&
+          renderListingEditor?.({
+            item: editingListing,
+            onClose: () => setEditingListing(undefined),
+          })}
+      </AnimatePresence>
+
       <AnimatePresence>
         {isEditing && (
           <AdminEditorModal
@@ -355,4 +389,3 @@ export function AdminPanel() {
     </div>
   );
 }
-

=== src/domain/admin/components/subcomponents/AdminEditorModal.tsx — diff ===
@@ -16,15 +16,11 @@ import {
 import { AdminEditorBasicInfo } from './AdminEditorBasicInfo';
 import { AdminEditorGallery } from './AdminEditorGallery';
 import { AdminEditorLocation } from './AdminEditorLocation';
-import { AdminEditorOperationalInfo } from './AdminEditorOperationalInfo';
 import { AdminEditorEventFields } from './AdminEditorEventFields';
 import { AdminEditorActions } from './AdminEditorActions';
 
-export const ADMIN_CREATABLE_ITEM_CATEGORIES = [
-  'tips',
-  'tour',
-  'sight',
-] as const;
+// Atrações e passeios usam o editor de cadastro do parceiro (decisão D9); aqui ficam as dicas.
+export const ADMIN_CREATABLE_ITEM_CATEGORIES = ['tips'] as const;
 
 export type AdminEditorSaveData = GuideItem & {
   occurrences?: AdminGuideEditorSchemaValues['occurrences'];
@@ -76,7 +72,8 @@ export function AdminEditorModal({
   useEffect(() => {
     const defaultStart = isEditing?.date || new Date().toISOString();
     const defaultEnd =
-      isEditing?.endDate || new Date(new Date(defaultStart).getTime() + 3 * 3600 * 1000).toISOString();
+      isEditing?.endDate ||
+      new Date(new Date(defaultStart).getTime() + 3 * 3600 * 1000).toISOString();
 
     form.reset({
       name: isEditing?.name || '',
@@ -101,7 +98,7 @@ export function AdminEditorModal({
       bookingLink: isEditing?.bookingLink,
       operationalInfo: isEditing?.operationalInfo as Record<string, unknown> | undefined,
     });
-  }, [isEditing.id, activeTab, form]);
+  }, [isEditing, activeTab, form]);
 
   useEffect(() => {
     savedOccurrenceIdsRef.current = [];
@@ -205,7 +202,8 @@ export function AdminEditorModal({
           ...values,
           category: values.category as GuideItem['category'],
           date: firstOccurrence?.startsAt || values.date,
-          endDate: firstOccurrence?.endsAt || values.endDate || firstOccurrence?.startsAt || values.date,
+          endDate:
+            firstOccurrence?.endsAt || values.endDate || firstOccurrence?.startsAt || values.date,
           occurrences: values.occurrences,
           removedOccurrenceIds: savedOccurrenceIdsRef.current.filter((id) => !keptIds.has(id)),
         });
@@ -223,10 +221,7 @@ export function AdminEditorModal({
               firstError[0]?.endsAt?.message ||
               firstError[0]?.capacity?.message
             : undefined;
-      showToast(
-        String(nestedMessage ?? 'Verifique os campos do formulário.'),
-        'error'
-      );
+      showToast(String(nestedMessage ?? 'Verifique os campos do formulário.'), 'error');
     }
   );
 
@@ -343,10 +338,7 @@ export function AdminEditorModal({
                     availableCategories={availableCategories}
                   />
 
-                  <AdminEditorGallery
-                    isUploading={isUploading}
-                    onImageUpload={handleImageUpload}
-                  />
+                  <AdminEditorGallery isUploading={isUploading} onImageUpload={handleImageUpload} />
 
                   {activeTab === 'events' && (
                     <AdminEditorEventFields
@@ -356,8 +348,6 @@ export function AdminEditorModal({
                   )}
 
                   <AdminEditorLocation />
-
-                  {activeTab === 'items' && <AdminEditorOperationalInfo />}
                 </motion.div>
               )}
             </AnimatePresence>

=== src/domain/admin/components/subcomponents/AdminEditorOperationalInfo.tsx — APAGUE este arquivo ===

=== src/domain/admin/components/subcomponents/AdminGuideView.tsx — diff ===
@@ -1,4 +1,3 @@
-import React from 'react';
 import { GuideItem } from '../../../guide';
 import { ErrorState } from '../../../../ui/components/ErrorState';
 import { AdminItemGrid } from './AdminItemGrid';
@@ -19,6 +18,7 @@ interface AdminGuideViewProps {
   dataError: string | null;
   onRetry: () => void;
   onInitNew: () => void;
+  onInitNewTip?: () => void;
   onEdit: (item: GuideItem) => void;
   onDelete: (coll: string, id: string) => Promise<void>;
 }
@@ -33,6 +33,7 @@ export function AdminGuideView({
   dataError,
   onRetry,
   onInitNew,
+  onInitNewTip,
   onEdit,
   onDelete,
 }: AdminGuideViewProps) {
@@ -53,6 +54,7 @@ export function AdminGuideView({
       filteredItems={filteredItems}
       dataLoading={dataLoading}
       onInitNew={onInitNew}
+      onInitNewTip={onInitNewTip}
       onEdit={onEdit}
       onDelete={onDelete}
     />

=== src/domain/admin/components/subcomponents/AdminItemGrid.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminItemGrid } from './AdminItemGrid';

const baseProps = {
  categories: [{ id: 'all', label: 'Todos', color: '' }],
  filter: 'all',
  setFilter: vi.fn(),
  filteredItems: [],
  dataLoading: false,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

describe('AdminItemGrid', () => {
  it('na aba de itens mostra "Nova dica" separado do novo cadastro', () => {
    const onInitNew = vi.fn();
    const onInitNewTip = vi.fn();
    render(
      <AdminItemGrid
        {...baseProps}
        activeTab="items"
        onInitNew={onInitNew}
        onInitNewTip={onInitNewTip}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Nova dica/ }));
    expect(onInitNewTip).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /Novo Registro/ }));
    expect(onInitNew).toHaveBeenCalledTimes(1);
  });

  it('sem onInitNewTip (agenda) não mostra o botão de dica', () => {
    render(<AdminItemGrid {...baseProps} activeTab="events" onInitNew={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Nova dica/ })).toBeNull();
  });
});

=== src/domain/admin/components/subcomponents/AdminItemGrid.tsx — diff ===
@@ -1,4 +1,3 @@
-import React from 'react';
 import { motion, AnimatePresence } from 'motion/react';
 import { Plus, RefreshCw, Star, MapPin, Edit2, Trash2, Layers } from 'lucide-react';
 import { cn } from '../../../../shared/utils/cn';
@@ -18,6 +17,8 @@ interface AdminItemGridProps {
   filteredItems: GuideItem[];
   dataLoading: boolean;
   onInitNew: () => void;
+  /** Dicas usam o editor do admin; o botão principal abre o editor de cadastro. */
+  onInitNewTip?: () => void;
   onEdit: (item: GuideItem) => void;
   onDelete: (coll: string, id: string) => Promise<void>;
 }
@@ -30,6 +31,7 @@ export function AdminItemGrid({
   filteredItems,
   dataLoading,
   onInitNew,
+  onInitNewTip,
   onEdit,
   onDelete,
 }: AdminItemGridProps) {
@@ -44,6 +46,17 @@ export function AdminItemGrid({
         </h2>
 
         <div className="flex items-center gap-3">
+          {onInitNewTip && (
+            <button
+              type="button"
+              onClick={onInitNewTip}
+              className="min-h-[44px] flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
+              id="btn-add-new-tip"
+            >
+              <Plus size={16} strokeWidth={3} aria-hidden="true" />
+              Nova dica
+            </button>
+          )}
           <button
             type="button"
             onClick={onInitNew}

=== src/domain/admin/index.ts — diff ===
@@ -2,3 +2,5 @@ export * from './types/admin';
 export { getActiveSubscriptionPlansUseCase } from './application/usecases/getActiveSubscriptionPlansUseCase';
 export { getAllSubscriptionPlansUseCase } from './application/usecases/getAllSubscriptionPlansUseCase';
 export { updateSubscriptionPlanUseCase } from './application/usecases/updateSubscriptionPlanUseCase';
+export { AdminDispatcher } from './components/AdminDispatcher';
+export type { AdminListingEditorProps, AdminPanelProps } from './components/AdminPanel';

=== src/domain/guide/components/StandardCard.tsx — diff ===
@@ -1,5 +1,5 @@
-import React, { useState } from 'react';
-import { Star, Utensils, MapPin, Compass, Home, Info, Calendar } from 'lucide-react';
+import { useState } from 'react';
+import { Bike, Star, Utensils, MapPin, Compass, Home, Info, Calendar } from 'lucide-react';
 import { GlassCard } from '../../../ui/components/GlassCard';
 import { CATEGORIES } from '../../../shared/constants/categories';
 import { GuideItem } from '../types/guide';
@@ -14,7 +14,9 @@ interface StandardCardProps {
   className?: string;
 }
 
-const IconMap: Record<string, any> = {
+// Nomes de ícone usados em CATEGORIES (src/shared/constants/categories.ts).
+const IconMap: Record<string, typeof Info> = {
+  Bike,
   Utensils,
   MapPin,
   Compass,

=== src/domain/partners/components/ListingEditor.tsx — ARQUIVO NOVO, conteúdo completo ===
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import { useUI } from '../../../shared/stores/useUIStore';
import type { PhoneInputFieldRef } from '../../../ui/components/PhoneInputField';
import type { UserSession } from '../../auth';
import { getImageUploadErrorMessage, uploadImageUseCase } from '../../media';
import { getEmptyFormData, mapItemToFormData } from '../application/mappers/partnerFormMapper';
import { mapPartnerSubmissionToGuideItem } from '../application/mappers/partnerSubmissionToGuide';
import { INITIAL_FORM_DATA } from '../constants/formDefaults';
import { LISTING_CATEGORIES } from '../constants/listingCategories';
import { useEditorScrollLock } from '../hooks/useEditorScrollLock';
import { useListingEditorValidation } from '../hooks/useListingEditorValidation';
import { partnerSubmissionSchema } from '../schemas/partnerSchema';
import type { PartnerContentItemInput, PartnerContentRecord } from '../types/partnerContent';
import type { FormState } from '../types/partsForm';
import { Step1CompanyInfo } from './steps/Step1CompanyInfo';
import { Step2ContactInfo } from './steps/Step2ContactInfo';
import { Step3Details } from './steps/Step3Details';
import { Step4Additional } from './steps/Step4Additional';
import { Step5Media } from './steps/Step5Media';

export interface ListingEditorProps {
  /** Cadastro a editar; `null` cria um novo. */
  item: PartnerContentRecord | null;
  /** Categorias que podem ser escolhidas num cadastro novo (padrão: todas as do parceiro). */
  allowedCategoryIds?: string[];
  currentUser: UserSession | null;
  /** CPF/CNPJ da conta do parceiro; o admin edita sem ele. */
  cpfCnpj?: string;
  onSave: (input: PartnerContentItemInput, itemId: string | null) => Promise<void>;
  onDelete?: (itemId: string) => Promise<void>;
  onClose: () => void;
}

/**
 * Editor único de cadastro (decisão D9): mesmos campos e regras da inscrição, usado pelo painel do
 * parceiro e pelo painel admin. Quem chama decide onde gravar.
 */
export function ListingEditor({
  item,
  allowedCategoryIds,
  currentUser,
  cpfCnpj,
  onSave,
  onDelete,
  onClose,
}: ListingEditorProps) {
  const { showToast } = useUI();
  const [formData, setFormData] = useState<FormState>(() =>
    item ? mapItemToFormData(item, cpfCnpj) : { ...getEmptyFormData(''), cpfCnpj: cpfCnpj ?? '' }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { errors, setErrors, validateAll } = useListingEditorValidation(formData);
  const phoneRef = useRef<PhoneInputFieldRef | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categories = LISTING_CATEGORIES.filter(
    (category) => Boolean(item) || !allowedCategoryIds || allowedCategoryIds.includes(category.id)
  );

  const methods = useForm<FormState>({
    resolver: zodResolver(partnerSubmissionSchema) as unknown as Resolver<FormState>,
    defaultValues: INITIAL_FORM_DATA,
    mode: 'onChange',
  });

  useEffect(() => {
    methods.reset(formData, { keepDefaultValues: true });
  }, [formData, methods]);

  useEditorScrollLock(true);

  const handleSave = async () => {
    if (!validateAll(phoneRef.current?.validate() ?? true)) return;
    setIsSaving(true);
    try {
      const imageUrls = await Promise.all(
        formData.images.map(async (image) => {
          if (!image.file) return image.preview;
          return uploadImageUseCase(image.file, 'guia_local').catch((error: unknown) => {
            throw new Error(getImageUploadErrorMessage(error));
          });
        })
      );
      const input = mapPartnerSubmissionToGuideItem(
        formData,
        imageUrls.filter((url): url is string => Boolean(url))
      );
      await onSave(input, item?.id || null);
      showToast('Cadastro salvo.', 'success');
      onClose();
    } catch (error: unknown) {
      console.error('[ListingEditor.save]', error);
      showToast(
        error instanceof Error && error.message ? error.message : 'Não foi possível salvar.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item?.id || !onDelete) return;
    setIsSaving(true);
    try {
      await onDelete(item.id);
      showToast('Cadastro excluído.', 'success');
      onClose();
    } catch (error: unknown) {
      console.error('[ListingEditor.delete]', error);
      showToast('Não foi possível excluir o cadastro.', 'error');
    } finally {
      setIsSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const categoryLabel =
    LISTING_CATEGORIES.find((category) => category.id === formData.category)?.label ||
    'Selecione uma categoria';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ zIndex: Z_INDEX.modal }}
        className="fixed inset-0 flex overflow-y-auto no-scrollbar justify-center items-start pt-[7.5vh] pb-[7.5vh] px-4 bg-black/5 backdrop-blur-xl"
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="listing-editor-title"
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: 'calc(85vh - env(safe-area-inset-bottom))' }}
          className="w-full max-w-2xl glassmorphism-vibrant bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl relative z-10"
        >
          <div className="p-8 pb-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h3
                id="listing-editor-title"
                className="text-xl font-display font-black text-white tracking-tight"
              >
                {item?.id ? 'Editar cadastro' : 'Novo cadastro'}
              </h3>
              <p className="text-[10px] text-white/50 font-medium tracking-wide uppercase mt-0.5">
                Ficha única de cadastro • {categoryLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar editor"
              className="w-11 h-11 flex items-center justify-center bg-white/5 rounded-2xl text-white/50 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>

          <FormProvider {...methods}>
            <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12 no-scrollbar scroll-smooth">
              <div className="space-y-6">
                <Step1CompanyInfo
                  formData={formData}
                  setFormData={setFormData}
                  categories={categories}
                  mode="editor"
                  lockCategory={Boolean(item?.id)}
                />
              </div>

              {formData.category && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-12"
                >
                  <div className="space-y-6">
                    <Step2ContactInfo
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      phoneRef={phoneRef}
                      categories={categories}
                    />
                  </div>
                  <div className="space-y-6">
                    <Step3Details
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      categories={categories}
                    />
                  </div>
                  <div className="space-y-6">
                    <Step4Additional
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      categories={categories}
                    />
                  </div>
                  <div className="space-y-6">
                    <Step5Media
                      formData={formData}
                      setFormData={setFormData}
                      currentUser={currentUser}
                      categories={categories}
                      setCurrentStep={() => {}}
                      fileInputRef={fileInputRef}
                      hideReview={true}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </FormProvider>

          {formData.category && (
            <div className="p-8 border-t border-white/5 flex flex-row items-center gap-4 w-full flex-shrink-0">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="flex-1 min-h-[44px] py-4 rounded-2xl font-semibold tracking-wide text-[12px] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 bg-teal-500 text-black shadow-teal-500/20 disabled:cursor-not-allowed disabled:opacity-80 focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                {isSaving && <RefreshCw className="animate-spin" size={16} aria-hidden="true" />}
                Salvar
              </button>
              {item?.id && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSaving}
                  aria-label="Excluir cadastro"
                  className="w-12 h-12 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all flex-shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: Z_INDEX.modalNested }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="listing-delete-title"
              className="w-full max-w-xs bg-[#0A0C10] rounded-[2.5rem] border border-white/10 p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
                <Trash2 size={32} aria-hidden="true" />
              </div>
              <div>
                <h3
                  id="listing-delete-title"
                  className="text-lg font-display font-black text-white"
                >
                  Excluir {formData.businessName || 'cadastro'}?
                </h3>
                <p className="text-white/50 text-xs mt-2 leading-relaxed">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="w-full min-h-[44px] bg-rose-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-400 active:scale-95 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  {isSaving ? (
                    <RefreshCw className="animate-spin" size={14} aria-hidden="true" />
                  ) : (
                    <Trash2 size={14} aria-hidden="true" />
                  )}
                  Excluir
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full min-h-[44px] bg-white/5 text-white/50 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -1,32 +1,25 @@
 import { BarChart3, RefreshCw, Trash2, X } from 'lucide-react';
-import { zodResolver } from '@hookform/resolvers/zod';
 import { AnimatePresence, motion } from 'motion/react';
-import React, { useEffect, useRef } from 'react';
-import { FormProvider, useForm, type Resolver } from 'react-hook-form';
+import React, { useRef } from 'react';
 import { Z_INDEX } from '../../../shared/constants/zIndex';
 
 // Componentes estruturais e utilitários da UI
 import { BackgroundBlobs } from '../../../ui/components/BackgroundBlobs';
-import { PhoneInputFieldRef } from '../../../ui/components/PhoneInputField';
-import { INITIAL_FORM_DATA } from '../constants/formDefaults';
-import { getEmptyFormData, usePartnerPanelActions } from '../hooks/usePartnerPanelActions';
-import { partnerSubmissionSchema } from '../schemas/partnerSchema';
+import { createPartnerContentItemUseCase } from '../application/usecases/createPartnerContentItemUseCase';
+import { deletePartnerContentItemUseCase } from '../application/usecases/deletePartnerContentItemUseCase';
+import { updatePartnerContentItemUseCase } from '../application/usecases/updatePartnerContentItemUseCase';
+import { useEditorScrollLock } from '../hooks/useEditorScrollLock';
+import { usePartnerPanelActions } from '../hooks/usePartnerPanelActions';
 import { PartnerProfile, SubscriptionPlan } from '../types/partner';
 import type { PartnerContentRecord } from '../types/partnerContent';
-import type { FormState } from '../types/partsForm';
+import { ListingEditor } from './ListingEditor';
 import { PartnerEventForm } from './PartnerEventForm';
-import { Step1CompanyInfo } from './steps/Step1CompanyInfo';
-import { Step2ContactInfo } from './steps/Step2ContactInfo';
-import { Step3Details } from './steps/Step3Details';
-import { Step4Additional } from './steps/Step4Additional';
-import { Step5Media } from './steps/Step5Media';
 import { PartnerEventsTable } from './subcomponents/PartnerEventsTable';
 import { PartnerHeader } from './subcomponents/PartnerHeader';
 import { PartnerItemsTable } from './subcomponents/PartnerItemsTable';
 import { PartnerTabsNavigation } from './subcomponents/PartnerTabsNavigation';
 import { PlansModal } from './subcomponents/PlansModal';
 import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
-import { LISTING_CATEGORIES } from '../constants/listingCategories';
 
 export interface PartnerPanelProps {
   profile?: PartnerProfile;
@@ -80,11 +73,6 @@ export function PartnerPanel({
     isUploading,
     showDeleteConfirm,
     setShowDeleteConfirm,
-    setCurrentStep,
-    editorFormData,
-    setEditorFormData,
-    errors,
-    setErrors,
     dataLoading,
     isVerified,
     itemsList,
@@ -93,10 +81,14 @@ export function PartnerPanel({
     handleToggleActive,
     handleImageUpload,
     handleSaveEvent,
-    handleSaveItem,
-    handleEditItem,
   } = usePartnerPanelActions(profile);
 
+  // `null` abre o editor para um cadastro novo; `undefined` mantém fechado.
+  const [editingListing, setEditingListing] = React.useState<
+    PartnerContentRecord | null | undefined
+  >(undefined);
+  useEditorScrollLock(Boolean(isEditing));
+
   const [showPlansModal, setShowPlansModal] = React.useState(false);
   const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
   const [checkoutPlanInfo, setCheckoutPlanInfo] = React.useState({
@@ -118,54 +110,6 @@ export function PartnerPanel({
     }
   };
 
-  const phoneRef = useRef<PhoneInputFieldRef | null>(null);
-  const fileInputRefForEditor = useRef<HTMLInputElement | null>(null);
-
-  const editorMethods = useForm<FormState>({
-    resolver: zodResolver(partnerSubmissionSchema) as unknown as Resolver<FormState>,
-    defaultValues: INITIAL_FORM_DATA,
-    mode: 'onChange',
-  });
-
-  useEffect(() => {
-    if (editorFormData) {
-      editorMethods.reset(editorFormData, { keepDefaultValues: true });
-    }
-  }, [editorFormData, editorMethods]);
-
-  // Efeito estratégico para bloquear scroll do body e corrigir deslocamento de cabeçalho no mobile devido ao teclado
-  React.useEffect(() => {
-    if (isEditing) {
-      const originalStyle = window.getComputedStyle(document.body).overflow;
-      document.body.style.overflow = 'hidden';
-
-      const handleFocusOut = () => {
-        setTimeout(() => {
-          const activeEl = document.activeElement;
-          if (
-            activeEl &&
-            (activeEl.tagName === 'INPUT' ||
-              activeEl.tagName === 'TEXTAREA' ||
-              activeEl.getAttribute('contenteditable') === 'true')
-          ) {
-            return;
-          }
-          window.scrollTo({ top: 0, behavior: 'instant' });
-        }, 120);
-      };
-
-      document.addEventListener('focusout', handleFocusOut);
-
-      return () => {
-        document.body.style.overflow = originalStyle;
-        document.removeEventListener('focusout', handleFocusOut);
-        window.scrollTo({ top: 0, behavior: 'instant' });
-      };
-    }
-  }, [isEditing]);
-
-  const categories = LISTING_CATEGORIES;
-
   if (userLoading || profileStatus === 'loading') {
     return (
       <div className="min-h-screen flex items-center justify-center bg-slate-950">
@@ -196,7 +140,7 @@ export function PartnerPanel({
       <BackgroundBlobs />
 
       <div
-        className={`max-w-4xl mx-auto space-y-8 relative z-10 transition-all duration-300 ${isEditing ? 'opacity-0 scale-[0.98] pointer-events-none h-0 overflow-hidden' : 'opacity-100 scale-100'}`}
+        className={`max-w-4xl mx-auto space-y-8 relative z-10 transition-all duration-300 ${isEditing || editingListing !== undefined ? 'opacity-0 scale-[0.98] pointer-events-none h-0 overflow-hidden' : 'opacity-100 scale-100'}`}
       >
         <PartnerHeader
           partnerProfile={partnerProfile}
@@ -242,21 +186,9 @@ export function PartnerPanel({
             <PartnerItemsTable
               itemsList={itemsList}
               loading={dataLoading}
-              onEditItem={(item) => handleEditItem(item)}
+              onEditItem={(item) => setEditingListing(item)}
               onToggleActive={handleToggleActive}
-              onCreateNew={() => {
-                const emptyForm = getEmptyFormData('');
-                setEditorFormData(emptyForm);
-                setCurrentStep(1);
-                setIsEditing({
-                  id: '',
-                  name: '',
-                  description: '',
-                  category: '',
-                  image: '',
-                  location: '',
-                });
-              }}
+              onCreateNew={() => setEditingListing(null)}
             />
             {renderBookableOffersManager?.(
               itemsList.map((item) => ({ id: item.id, name: item.name, category: item.category }))
@@ -364,155 +296,28 @@ export function PartnerPanel({
             </motion.div>
           </motion.div>
         )}
+      </AnimatePresence>
 
-        {isEditing && isEditing.category !== 'event' && editorFormData && (
-          <motion.div
-            initial={{ opacity: 0 }}
-            animate={{ opacity: 1 }}
-            exit={{ opacity: 0 }}
-            onClick={(e) => {
-              if (e.target === e.currentTarget) {
-                setIsEditing(null);
-                setEditorFormData(null);
+      <AnimatePresence>
+        {editingListing !== undefined && (
+          <ListingEditor
+            item={editingListing}
+            currentUser={user}
+            cpfCnpj={partnerProfile?.cpfCnpj}
+            onSave={async (input, itemId) => {
+              if (itemId) {
+                await updatePartnerContentItemUseCase(itemId, input);
+              } else {
+                await createPartnerContentItemUseCase(input);
               }
             }}
-            style={{ zIndex: Z_INDEX.modal }}
-            className="fixed inset-0 flex overflow-y-auto no-scrollbar justify-center items-start pt-[7.5vh] pb-[7.5vh] px-4 bg-black/5 backdrop-blur-xl animate-fade-in"
-          >
-            <motion.div
-              initial={{ scale: 0.95, y: 15, opacity: 0 }}
-              animate={{ scale: 1, y: 0, opacity: 1 }}
-              exit={{ scale: 0.95, y: 15, opacity: 0 }}
-              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
-              style={{ height: 'calc(85vh - env(safe-area-inset-bottom))' }}
-              className="w-full max-w-2xl glassmorphism-vibrant bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl relative z-10"
-            >
-              <div className="p-8 pb-4 flex items-center justify-between flex-shrink-0">
-                <div>
-                  <h3 className="text-xl font-display font-black text-white tracking-tight">
-                    {isEditing.id ? 'Editar Estabelecimento' : 'Novo Estabelecimento'}
-                  </h3>
-                  <p className="text-[10px] text-white/50 font-medium tracking-wide uppercase mt-0.5">
-                    Ficha Única de Cadastro •{' '}
-                    {categories.find((c) => c.id === editorFormData.category)?.label ||
-                      'Selecione uma Categoria'}
-                  </p>
-                </div>
-                <button
-                  onClick={() => {
-                    setIsEditing(null);
-                    setEditorFormData(null);
-                  }}
-                  className="p-3 bg-white/5 rounded-2xl text-white/50 hover:bg-white/10 transition-colors"
-                >
-                  <X size={24} />
-                </button>
-              </div>
-
-              <FormProvider {...editorMethods}>
-                <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12 no-scrollbar scroll-smooth">
-                  <div className="space-y-6">
-                    <Step1CompanyInfo
-                      formData={editorFormData}
-                      setFormData={setEditorFormData}
-                      categories={categories}
-                      mode="editor"
-                      lockCategory={Boolean(isEditing?.id)}
-                    />
-                  </div>
-
-                  {editorFormData.category && (
-                    <motion.div
-                      initial={{ opacity: 0, y: 20 }}
-                      animate={{ opacity: 1, y: 0 }}
-                      transition={{ duration: 0.4 }}
-                      className="space-y-12"
-                    >
-                      <div className="space-y-6">
-                        <Step2ContactInfo
-                          formData={editorFormData}
-                          setFormData={setEditorFormData}
-                          errors={errors}
-                          setErrors={setErrors}
-                          phoneRef={phoneRef}
-                          categories={categories}
-                        />
-                      </div>
-
-                      <div className="space-y-6">
-                        <Step3Details
-                          formData={editorFormData}
-                          setFormData={setEditorFormData}
-                          errors={errors}
-                          setErrors={setErrors}
-                          categories={categories}
-                        />
-                      </div>
-
-                      <div className="space-y-6">
-                        <Step4Additional
-                          formData={editorFormData}
-                          setFormData={setEditorFormData}
-                          errors={errors}
-                          setErrors={setErrors}
-                          categories={categories}
-                        />
-                      </div>
-
-                      <div className="space-y-6">
-                        <Step5Media
-                          formData={editorFormData}
-                          setFormData={setEditorFormData}
-                          currentUser={user}
-                          categories={categories}
-                          setCurrentStep={() => {}}
-                          fileInputRef={fileInputRefForEditor}
-                          hideReview={true}
-                        />
-                      </div>
-                    </motion.div>
-                  )}
-                </div>
-              </FormProvider>
-
-              {editorFormData.category && (
-                <div className="p-8 border-t border-white/5 flex flex-row items-center gap-4 w-full flex-shrink-0">
-                  <button
-                    type="button"
-                    disabled={isLoading}
-                    onClick={async () => {
-                      await handleSaveItem(() => phoneRef.current?.validate() ?? true);
-                    }}
-                    className={`py-4 rounded-2xl font-semibold tracking-wide text-[12px] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 ${
-                      isEditing.id ? 'flex-1' : 'w-full'
-                    } bg-teal-500 text-black shadow-teal-500/20 ${
-                      isLoading
-                        ? 'cursor-not-allowed opacity-80'
-                        : 'hover:scale-[1.02] cursor-pointer'
-                    }`}
-                  >
-                    {isLoading && <RefreshCw className="animate-spin" size={16} />}
-                    Salvar
-                  </button>
-
-                  {isEditing.id && (
-                    <button
-                      type="button"
-                      onClick={() => setShowDeleteConfirm(true)}
-                      disabled={isLoading}
-                      className="py-4 px-4 aspect-square bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all flex-shrink-0"
-                    >
-                      <Trash2 size={16} />
-                    </button>
-                  )}
-                </div>
-              )}
-            </motion.div>
-          </motion.div>
+            onDelete={deletePartnerContentItemUseCase}
+            onClose={() => setEditingListing(undefined)}
+          />
         )}
       </AnimatePresence>
 
-      {/* Delete Confirmation Overlay */}
+      {/* Confirmação de exclusão de evento */}
       <AnimatePresence>
         {showDeleteConfirm && (
           <motion.div
@@ -532,9 +337,9 @@ export function PartnerPanel({
                 <Trash2 size={32} />
               </div>
               <div>
-                <h3 className="text-lg font-display font-black text-white">Excluir Item?</h3>
+                <h3 className="text-lg font-display font-black text-white">Excluir evento?</h3>
                 <p className="text-white/50 text-xs mt-2 leading-relaxed">
-                  Esta ação não poderá ser desfeita. Deseja realmente remover este item?
+                  Esta ação não poderá ser desfeita. Deseja realmente remover este evento?
                 </p>
               </div>
               <div className="flex flex-col gap-3">

=== src/domain/partners/hooks/useEditorScrollLock.ts — ARQUIVO NOVO, conteúdo completo ===
import { useEffect } from 'react';

/**
 * Trava a rolagem da página atrás de um editor aberto. No celular, o teclado desloca o cabeçalho;
 * ao sair de um campo, a página volta ao topo.
 */
export function useEditorScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    const handleFocusOut = () => {
      setTimeout(() => {
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.getAttribute('contenteditable') === 'true')
        ) {
          return;
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 120);
    };
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('focusout', handleFocusOut);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
  }, [active]);
}

=== src/domain/partners/hooks/useListingEditorValidation.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getEmptyFormData } from '../application/mappers/partnerFormMapper';
import type { FormState } from '../types/partsForm';
import { useListingEditorValidation } from './useListingEditorValidation';

function validTour(): FormState {
  return {
    ...getEmptyFormData('tour'),
    businessName: 'Passeio Lagoa do Paraíso',
    description: 'Roteiro de meio dia pelas lagoas.',
    region: 'Jericoacoara',
    phone: '88999999999',
    tourDurationHours: '4',
    meetingPoint: 'Praça principal',
    googleMaps: 'https://maps.google.com/?q=jericoacoara',
    images: [{ id: 'img-1', preview: 'https://img.example/1.jpg' }],
  };
}

function validate(formData: FormState): boolean {
  const { result } = renderHook(() => useListingEditorValidation(formData));
  let valid = false;
  act(() => {
    valid = result.current.validateAll(true);
  });
  return valid;
}

describe('useListingEditorValidation', () => {
  it('aceita um cadastro completo sem CPF/CNPJ (editor do admin)', () => {
    expect(validate(validTour())).toBe(true);
  });

  it('exige os campos da categoria e ao menos uma foto', () => {
    expect(validate({ ...validTour(), meetingPoint: '' })).toBe(false);
    expect(validate({ ...validTour(), images: [] })).toBe(false);
  });

  it('perfil de produtor não exige descrição nem foto', () => {
    expect(
      validate({
        ...getEmptyFormData('producer'),
        businessName: 'Produções Ceará',
        region: 'Jericoacoara',
        phone: '88999999999',
        googleMaps: 'https://maps.google.com/?q=jericoacoara',
      })
    ).toBe(true);
  });

  it('recusa quando o telefone é inválido', () => {
    const { result } = renderHook(() => useListingEditorValidation(validTour()));
    let valid = true;
    act(() => {
      valid = result.current.validateAll(false);
    });
    expect(valid).toBe(false);
  });
});

=== src/domain/partners/hooks/useListingEditorValidation.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useState } from 'react';
import { useUI } from '../../../shared/stores/useUIStore';
import { step1Schema, step2Schema, step3Schema, step4Schema } from '../schemas/partnerSchema';
import type { FormState } from '../types/partsForm';

export type ListingEditorErrors = { [key: string]: string };

type SectionSchema = typeof step2Schema | typeof step3Schema | typeof step4Schema;

function collectErrors(schema: SectionSchema, formData: FormState): ListingEditorErrors | null {
  const parsed = schema.safeParse(formData);
  if (parsed.success) return null;
  const errors: ListingEditorErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0]?.toString();
    if (field) errors[field] = issue.message;
  }
  return errors;
}

/**
 * Sem CPF/CNPJ no formulário (editor do admin), a identidade é validada só por nome e descrição;
 * o perfil de produtor não tem descrição obrigatória.
 */
function isIdentityValid(formData: FormState): boolean {
  if (!formData.category) return false;
  if (formData.cpfCnpj) return step1Schema.safeParse(formData).success;
  if (!formData.businessName?.trim()) return false;
  return formData.category === 'producer' || Boolean(formData.description?.trim());
}

/** Validação do editor de cadastro: as mesmas regras da inscrição, seção por seção. */
export function useListingEditorValidation(formData: FormState) {
  const { showToast } = useUI();
  const [errors, setErrors] = useState<ListingEditorErrors>({});

  const validateSection = useCallback(
    (schema: SectionSchema): boolean => {
      const found = collectErrors(schema, formData);
      setErrors(found ?? {});
      return found === null;
    },
    [formData]
  );

  const validateAll = useCallback(
    (phoneIsValid: boolean): boolean => {
      if (!isIdentityValid(formData)) {
        showToast('Preencha o nome e a descrição do cadastro.', 'error');
        return false;
      }
      if (!phoneIsValid || !validateSection(step2Schema)) {
        showToast('Verifique o telefone e os links em Contato e Localização.', 'error');
        return false;
      }
      if (!validateSection(step3Schema)) {
        showToast('Preencha as informações obrigatórias da categoria.', 'error');
        return false;
      }
      if (!validateSection(step4Schema)) {
        showToast('Preencha as regras em Operação e Regras.', 'error');
        return false;
      }
      if (formData.category !== 'producer' && formData.images.length === 0) {
        showToast('Adicione pelo menos uma foto.', 'error');
        return false;
      }
      return true;
    },
    [formData, showToast, validateSection]
  );

  return { errors, setErrors, validateAll };
}

=== src/domain/partners/hooks/usePartnerContentActions.ts — diff ===
@@ -1,24 +1,15 @@
 import { useCallback } from 'react';
 import { useUI } from '../../../shared/stores/useUIStore';
 import type { UserSession } from '../../auth';
-import { getImageUploadErrorMessage, uploadImageUseCase } from '../../media';
 import {
   createPartnerContentEventUseCase,
-  createPartnerContentItemUseCase,
   deletePartnerContentEventUseCase,
   deletePartnerContentItemUseCase,
   updatePartnerContentEventUseCase,
   updatePartnerContentItemUseCase,
 } from '../index';
-import { mapPartnerSubmissionToGuideItem } from '../application/mappers/partnerSubmissionToGuide';
 import { partnerEventFormSchema } from '../schemas/partnerEventFormSchema';
-import type { PartnerProfile } from '../types/partner';
-import type {
-  PartnerContentEditorState,
-  PartnerContentEventInput,
-  PartnerContentItemInput,
-} from '../types/partnerContent';
-import type { FormState, PartnerImage } from '../types/partsForm';
+import type { PartnerContentEditorState, PartnerContentEventInput } from '../types/partnerContent';
 
 function getErrorMessage(error: unknown, fallback: string): string {
   return error instanceof Error && error.message ? error.message : fallback;
@@ -30,28 +21,20 @@ function toPlainRecord(value: object): Record<string, unknown> {
 
 export interface UsePartnerContentActionsProps {
   user: UserSession | null;
-  partnerProfile?: PartnerProfile | null;
   activeTab: 'items' | 'events' | 'reports';
   isEditing: PartnerContentEditorState | null;
   setIsEditing: (item: PartnerContentEditorState | null) => void;
-  editorFormData: FormState | null;
-  setEditorFormData: (data: FormState | null) => void;
   setShowDeleteConfirm: (val: boolean) => void;
   setIsLoading: (val: boolean) => void;
-  validateAll: (phoneValidateFn: () => boolean) => boolean;
 }
 
 export function usePartnerContentActions({
   user,
-  partnerProfile,
   activeTab,
   isEditing,
   setIsEditing,
-  editorFormData,
-  setEditorFormData,
   setShowDeleteConfirm,
   setIsLoading,
-  validateAll,
 }: UsePartnerContentActionsProps) {
   const { showToast } = useUI();
 
@@ -176,75 +159,9 @@ export function usePartnerContentActions({
     }
   }, [isEditing, user?.uid, setIsLoading, setIsEditing, showToast]);
 
-  const handleSaveItem = useCallback(
-    async (phoneValidateFn: () => boolean) => {
-      if (!editorFormData || !user?.uid || !isEditing) return;
-      if (!validateAll(phoneValidateFn)) return;
-
-      if (!editorFormData.region?.trim()) {
-        showToast('A região é obrigatória.', 'error');
-        return;
-      }
-
-      setIsLoading(true);
-      const itemId = isEditing.id;
-      try {
-        const imageUrls = await Promise.all(
-          editorFormData.images.map(async (img: PartnerImage) => {
-            if (img.file) {
-              return await uploadImageUseCase(img.file, 'guia_local').catch((error: unknown) => {
-                throw new Error(getImageUploadErrorMessage(error));
-              });
-            }
-            return img.preview;
-          })
-        );
-
-        const validUrls = imageUrls.filter((url): url is string => Boolean(url));
-        if (validUrls.length === 0) {
-          showToast('Ao menos uma imagem é obrigatória.', 'error');
-          setIsLoading(false);
-          return;
-        }
-
-        // Mesma conversão da inscrição: o editor mostra e grava exatamente os campos do formulário.
-        const itemData: PartnerContentItemInput = mapPartnerSubmissionToGuideItem(
-          editorFormData,
-          validUrls
-        );
-
-        if (!itemId) {
-          await createPartnerContentItemUseCase(itemData);
-        } else {
-          await updatePartnerContentItemUseCase(itemId, itemData);
-        }
-
-        setIsEditing(null);
-        setEditorFormData(null);
-        showToast('Estabelecimento salvo com sucesso!', 'success');
-      } catch (e: unknown) {
-        console.error('Erro ao salvar item:', e);
-        showToast(getErrorMessage(e, 'Erro ao salvar item'), 'error');
-      } finally {
-        setIsLoading(false);
-      }
-    },
-    [
-      editorFormData,
-      user?.uid,
-      isEditing,
-      validateAll,
-      setIsLoading,
-      setIsEditing,
-      setEditorFormData,
-      showToast,
-    ]
-  );
-
   return {
     handleDelete,
     handleToggleActive,
     handleSaveEvent,
-    handleSaveItem,
   };
 }

=== src/domain/partners/hooks/usePartnerContentEditor.ts — APAGUE este arquivo ===

=== src/domain/partners/hooks/usePartnerItems.ts — diff ===
@@ -1,28 +1,17 @@
 import type { UserSession } from '../../auth';
-import type { PartnerProfile } from '../types/partner';
-import type { PartnerContentEditorState, PartnerContentRecord } from '../types/partnerContent';
-import type { FormState } from '../types/partsForm';
+import type { PartnerContentEditorState } from '../types/partnerContent';
 import { usePartnerContentActions } from './usePartnerContentActions';
 import { usePartnerContentCatalog } from './usePartnerContentCatalog';
-import { usePartnerContentEditor } from './usePartnerContentEditor';
 import { usePartnerContentMedia } from './usePartnerContentMedia';
 
 export interface UsePartnerItemsProps {
   user: UserSession | null;
   activeTab: 'items' | 'events' | 'reports';
-  setActiveTab?: (tab: 'items' | 'events' | 'reports') => void;
   isEditing: PartnerContentEditorState | null;
   setIsEditing: (item: PartnerContentEditorState | null) => void;
-  editorFormData: FormState | null;
-  setEditorFormData: (data: FormState | null) => void;
-  isVerified?: boolean;
-  partnerProfile?: PartnerProfile | null;
-  setCurrentStep: (step: number) => void;
-  setIsSelectingCategory: (val: boolean) => void;
   setShowDeleteConfirm: (val: boolean) => void;
   setIsLoading: (val: boolean) => void;
   setIsUploading: (val: boolean) => void;
-  validateAll: (phoneValidateFn: () => boolean) => boolean;
 }
 
 export function usePartnerItems({
@@ -30,15 +19,9 @@ export function usePartnerItems({
   activeTab,
   isEditing,
   setIsEditing,
-  editorFormData,
-  setEditorFormData,
-  partnerProfile,
-  setCurrentStep,
-  setIsSelectingCategory,
   setShowDeleteConfirm,
   setIsLoading,
   setIsUploading,
-  validateAll,
 }: UsePartnerItemsProps) {
   const {
     itemsList,
@@ -53,14 +36,6 @@ export function usePartnerItems({
     activeTab,
   });
 
-  const { handleInitNewItem, handleEditItem, handleCancelEdit } = usePartnerContentEditor({
-    setIsEditing,
-    setEditorFormData,
-    setCurrentStep,
-    setIsSelectingCategory,
-    partnerCpfCnpj: partnerProfile?.cpfCnpj,
-  });
-
   const { isUploading, handleImageUpload, handleRemoveImage, handleReorderImages } =
     usePartnerContentMedia({
       isEditing,
@@ -69,19 +44,14 @@ export function usePartnerItems({
       setIsUploading,
     });
 
-  const { handleDelete, handleToggleActive, handleSaveEvent, handleSaveItem } =
-    usePartnerContentActions({
-      user,
-      partnerProfile,
-      activeTab,
-      isEditing,
-      setIsEditing,
-      editorFormData,
-      setEditorFormData,
-      setShowDeleteConfirm,
-      setIsLoading,
-      validateAll,
-    });
+  const { handleDelete, handleToggleActive, handleSaveEvent } = usePartnerContentActions({
+    user,
+    activeTab,
+    isEditing,
+    setIsEditing,
+    setShowDeleteConfirm,
+    setIsLoading,
+  });
 
   return {
     itemsList,
@@ -98,9 +68,5 @@ export function usePartnerItems({
     handleRemoveImage,
     handleReorderImages,
     handleSaveEvent,
-    handleSaveItem,
-    handleInitNewItem,
-    handleEditItem,
-    handleCancelEdit,
   };
 }

=== src/domain/partners/hooks/usePartnerLayoutState.ts — diff ===
@@ -2,31 +2,16 @@ import { useState } from 'react';
 import type { PartnerContentEditorState } from '../types/partnerContent';
 
 export function usePartnerLayoutState() {
-  const [activeTab, setActiveTab] =
-    useState<'items' | 'events' | 'reports'>('items');
-
-  const [isSelectingCategory, setIsSelectingCategory] =
-    useState(false);
-
-  const [isEditing, setIsEditing] =
-    useState<PartnerContentEditorState | null>(null);
-
-  const [showDeleteConfirm, setShowDeleteConfirm] =
-    useState(false);
-
-  const [currentStep, setCurrentStep] =
-    useState(1);
+  const [activeTab, setActiveTab] = useState<'items' | 'events' | 'reports'>('items');
+  const [isEditing, setIsEditing] = useState<PartnerContentEditorState | null>(null);
+  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
 
   return {
     activeTab,
     setActiveTab,
-    isSelectingCategory,
-    setIsSelectingCategory,
     isEditing,
     setIsEditing,
     showDeleteConfirm,
     setShowDeleteConfirm,
-    currentStep,
-    setCurrentStep,
   };
 }

=== src/domain/partners/hooks/usePartnerPanelActions.ts — diff ===
@@ -1,15 +1,8 @@
 import { PartnerProfile } from '../types/partner';
 import { usePartnerLayoutState } from './usePartnerLayoutState';
 import { usePartnerProfile } from './usePartnerProfile';
-import {
-  getEmptyFormData,
-  mapItemToFormData,
-  isValidUrl,
-} from '../application/mappers/partnerFormMapper';
 import { usePartnerItems } from './usePartnerItems';
 
-export { getEmptyFormData, mapItemToFormData, isValidUrl };
-
 export function usePartnerPanelActions(profileData?: PartnerProfile) {
   const layout = usePartnerLayoutState();
 
@@ -18,19 +11,11 @@ export function usePartnerPanelActions(profileData?: PartnerProfile) {
   const items = usePartnerItems({
     user: profile.user,
     activeTab: layout.activeTab,
-    setActiveTab: layout.setActiveTab,
     isEditing: layout.isEditing,
     setIsEditing: layout.setIsEditing,
-    editorFormData: profile.editorFormData,
-    setEditorFormData: profile.setEditorFormData,
-    isVerified: profile.isVerified,
-    partnerProfile: profile.partnerProfile,
-    setCurrentStep: layout.setCurrentStep,
-    setIsSelectingCategory: layout.setIsSelectingCategory,
     setShowDeleteConfirm: layout.setShowDeleteConfirm,
     setIsLoading: profile.setIsLoading,
     setIsUploading: profile.setIsUploading,
-    validateAll: profile.validateAll,
   });
 
   return {
@@ -44,18 +29,11 @@ export function usePartnerPanelActions(profileData?: PartnerProfile) {
     setActiveTab: layout.setActiveTab,
     isEditing: layout.isEditing,
     setIsEditing: layout.setIsEditing,
-    isSelectingCategory: layout.isSelectingCategory,
     showDeleteConfirm: layout.showDeleteConfirm,
     setShowDeleteConfirm: layout.setShowDeleteConfirm,
-    currentStep: layout.currentStep,
-    setCurrentStep: layout.setCurrentStep,
 
     isLoading: profile.isLoading,
     isUploading: profile.isUploading,
-    editorFormData: profile.editorFormData,
-    setEditorFormData: profile.setEditorFormData,
-    errors: profile.errors,
-    setErrors: profile.setErrors,
 
     dataLoading: items.dataLoading,
     currentList: items.currentList,
@@ -66,8 +44,5 @@ export function usePartnerPanelActions(profileData?: PartnerProfile) {
     handleToggleActive: items.handleToggleActive,
     handleImageUpload: items.handleImageUpload,
     handleSaveEvent: items.handleSaveEvent,
-    handleSaveItem: items.handleSaveItem,
-    handleInitNewItem: items.handleInitNewItem,
-    handleEditItem: items.handleEditItem,
   };
 }

=== src/domain/partners/hooks/usePartnerProfile.ts — diff ===
@@ -1,22 +1,8 @@
-import { useState, useEffect, useRef } from 'react';
+import { useState, useEffect } from 'react';
 import { subscribeToPartnerProfileUseCase } from '../application/usecases/subscribeToPartnerProfileUseCase';
 import { subscribeToAuthStateUseCase, type UserSession } from '../../auth';
 import { getCurrentUserUseCase } from '../../user';
 import { PartnerProfile } from '../types/partner';
-import { FormState } from '../types/partsForm';
-import { isValidCpfCnpj } from '../../../shared/utils/documentValidator';
-import { useUI } from '../../../shared/stores/useUIStore';
-import {
-  getEmptyFormData,
-  mapItemToFormData,
-  isValidUrl,
-} from '../application/mappers/partnerFormMapper';
-import {
-  step1Schema,
-  step2Schema,
-  step3Schema,
-  step4Schema,
-} from '../schemas/partnerSchema';
 
 enum OperationType {
   CREATE = 'create',
@@ -73,8 +59,9 @@ export function usePartnerProfile(loadedProfile?: PartnerProfile) {
   const [userProfileData, setUserProfileData] =
     useState<Awaited<ReturnType<typeof getCurrentUserUseCase>>>(null);
 
+  const userId = user?.uid;
   useEffect(() => {
-    if (userLoading || !user) {
+    if (userLoading || !userId) {
       setUserProfileData(null);
       return;
     }
@@ -96,16 +83,12 @@ export function usePartnerProfile(loadedProfile?: PartnerProfile) {
     return () => {
       active = false;
     };
-  }, [user?.uid, userLoading]);
+  }, [userId, userLoading]);
 
-  const { showToast } = useUI();
   const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(
     loadedProfile || null
   );
 
-  const [editorFormData, setEditorFormData] = useState<FormState | null>(null);
-  const [errors, setErrors] = useState<{ [key: string]: string }>({});
-
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const [profileError, setProfileError] = useState<string | null>(null);
@@ -194,126 +177,17 @@ export function usePartnerProfile(loadedProfile?: PartnerProfile) {
     (!partnerProfile?.verifiedUntil || new Date(partnerProfile.verifiedUntil) > new Date())
   );
 
-  const isStep1Valid = (): boolean => {
-    if (!editorFormData?.category) return false;
-    if (editorFormData.cpfCnpj) {
-      return step1Schema.safeParse(editorFormData).success;
-    }
-    return Boolean(editorFormData.businessName?.trim() && editorFormData.description?.trim());
-  };
-
-  const validateStep2 = (phoneIsValid: boolean): boolean => {
-    if (!editorFormData) return false;
-    if (!phoneIsValid) {
-      return false;
-    }
-    const parsed = step2Schema.safeParse(editorFormData);
-    if (!parsed.success) {
-      const newErrors: { [key: string]: string } = {};
-      parsed.error.issues.forEach((issue) => {
-        const field = issue.path[0]?.toString();
-        if (field) {
-          newErrors[field] = issue.message;
-        }
-      });
-      setErrors(newErrors);
-      return false;
-    }
-    setErrors({});
-    return true;
-  };
-
-  const validateStep3 = (): boolean => {
-    if (!editorFormData) return false;
-    const parsed = step3Schema.safeParse(editorFormData);
-    if (!parsed.success) {
-      const newErrors: { [key: string]: string } = {};
-      parsed.error.issues.forEach((issue) => {
-        const field = issue.path[0]?.toString();
-        if (field) {
-          newErrors[field] = issue.message;
-        }
-      });
-      setErrors(newErrors);
-      return false;
-    }
-    setErrors({});
-    return true;
-  };
-
-  const validateStep4 = (): boolean => {
-    if (!editorFormData) return false;
-    const parsed = step4Schema.safeParse(editorFormData);
-    if (!parsed.success) {
-      const newErrors: { [key: string]: string } = {};
-      parsed.error.issues.forEach((issue) => {
-        const field = issue.path[0]?.toString();
-        if (field) {
-          newErrors[field] = issue.message;
-        }
-      });
-      setErrors(newErrors);
-      return false;
-    }
-    setErrors({});
-    return true;
-  };
-
-  const validateAll = (phoneValidateFn: () => boolean): boolean => {
-    if (!editorFormData) return false;
-    if (!isStep1Valid()) {
-      showToast(
-        'Por favor, preencha o Nome, Descrição e CPF/CNPJ na Identidade da Empresa.',
-        'error'
-      );
-      return false;
-    }
-    const phoneIsValid = phoneValidateFn();
-    if (!validateStep2(phoneIsValid)) {
-      showToast(
-        'Por favor, verifique se o telefone e os links informados em Contato e Localização estão corretos.',
-        'error'
-      );
-      return false;
-    }
-    if (!validateStep3()) {
-      showToast(
-        'Por favor, preencha todas as informações obrigatórias de Comodidades e Detalhes específicas do seu segmento.',
-        'error'
-      );
-      return false;
-    }
-    if (!validateStep4()) {
-      showToast('Por favor, preencha as regras em Operação e Regras.', 'error');
-      return false;
-    }
-    if (!editorFormData.images || editorFormData.images.length === 0) {
-      showToast('Por favor, adicione pelo menos uma foto para o estabelecimento.', 'error');
-      return false;
-    }
-    return true;
-  };
-
   return {
     user,
     userLoading,
     partnerProfile,
     setPartnerProfile,
     profileStatus,
-    editorFormData,
-    setEditorFormData,
-    errors,
-    setErrors,
     isLoading,
     setIsLoading,
     isUploading,
     setIsUploading,
     profileError,
     isVerified,
-    isStep1Valid,
-    validateStep2,
-    validateStep3,
-    validateStep4,
-    validateAll,
   };
 }

=== src/domain/partners/index.ts — diff ===
@@ -12,6 +12,7 @@ export { getPartnerProfileUseCase } from './application/usecases/getPartnerProfi
 export { subscribeToPartnerProfileUseCase } from './application/usecases/subscribeToPartnerProfileUseCase';
 export { updatePartnerStatusUseCase } from './application/usecases/updatePartnerStatusUseCase';
 export { updatePartnerVerificationUseCase } from './application/usecases/updatePartnerVerificationUseCase';
+export { ListingEditor, type ListingEditorProps } from './components/ListingEditor';
 export { PartnerEventForm } from './components/PartnerEventForm';
 export {
   LanguagesForm,
@@ -25,7 +26,6 @@ export { PartnersModal } from './components/PartnersModal';
 export { mapPartnerRegistrationPayload, usePartnerForm } from './hooks/usePartnerForm';
 export { usePartnerContentActions } from './hooks/usePartnerContentActions';
 export { usePartnerContentCatalog } from './hooks/usePartnerContentCatalog';
-export { usePartnerContentEditor } from './hooks/usePartnerContentEditor';
 export { usePartnerContentMedia } from './hooks/usePartnerContentMedia';
 export { usePartnerItems } from './hooks/usePartnerItems';
 export { usePartnerLayoutState } from './hooks/usePartnerLayoutState';
@@ -50,5 +50,6 @@ export type {
 export type {
   PartnerContentEventInput,
   PartnerContentItemInput,
+  PartnerContentRecord,
 } from './types/partnerContent';
 export type { FormState, OperatingDay, PartnerImage } from './types/partsForm';

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros), `npm test` → 141 arquivos, 792 testes, `npm run build`.
Responda no formato do AGENTS.md §16.3.
~~~~
