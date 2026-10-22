# Prompt 18.3.0d — Correção do lote 13

> Gerado da diferença entre o zip do AI Studio de 2026-10-22 (importado em `467cd02`) e o commit de referência `996437c` da branch `claude/agents-md-v2`. Aplique ANTES do lote 14. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.3.0d — Correção do lote 13 (painéis do parceiro e do admin)

O backend, as regras, o A4 e as telas novas de verificação do lote 13 vieram certos. Ficaram de fora ou foram reescritos 7 arquivos do frontend e as decisões D11 e D12.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

CONTEXTO: o lote 13 (18.2.5, 18.3.0a, 18.3.0b, A4 e 18.3.0c) foi quase todo aplicado. Nestes arquivos, porém, o código foi reescrito por conta própria em vez de seguir o diff, e há regressões:
- PartnerPanel: a aba de relatórios perdeu a trava atual (ela só muda no 18.3.1), o teste de perfil vazio passou a usar outro status, as props do checkout foram renomeadas (planId em vez de itemId) e onPlanPurchased ficou desestruturado duas vezes;
- usePartnerProfile: status do perfil com outros nomes ('missing' e 'unauthenticated' em vez de 'empty') e papel do usuário resolvido dentro da escuta de login, fora do desenho da referência;
- usePartnerContentActions: casos de uso importados por caminho interno, handleDelete com outra assinatura e mensagens diferentes;
- AdminPanel e AdminEditorModal: perderam a lista ADMIN_CREATABLE_ITEM_CATEGORIES, as datas do evento calculadas pelas sessões (eventDateRangeFromSessions), o tipo EventSessionsLoadState, o toast do design system dentro do modal, a exclusão pelos casos de uso e a animação de saída do modal;
- PartnerPortalComposition: segue a renomeação das props do checkout;
- docs/arquitetura/decisoes.md: faltam as decisões D11 e D12;
- public/assets/aistudio/: cópias dos prompts colados foram salvas dentro de public/, que vai para o site publicado.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE. Não reescreva os arquivos do seu jeito e não mexa em nenhum outro arquivo. Os diffs partem do estado atual do projeto; o resultado tem de ficar idêntico à referência. Nenhuma dependência nova.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/decisoes.md (alterar)
- public/assets/aistudio/Paste_October_19__2026_-_10_47PM_363f219f (apagar)
- public/assets/aistudio/Paste_October_21__2026_-_3_20PM_ee930a4d (apagar)
- public/assets/aistudio/Paste_October_22__2026_-_3_09AM_e8dc1e8b (apagar)
- public/assets/aistudio/Paste_October_22__2026_-_9_13AM_1ebc5c2b (apagar)
- src/app/compositions/PartnerPortalComposition.tsx (alterar)
- src/domain/admin/components/AdminPanel.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminEditorModal.tsx (alterar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/hooks/usePartnerContentActions.ts (alterar)
- src/domain/partners/hooks/usePartnerProfile.test.ts (alterar)
- src/domain/partners/hooks/usePartnerProfile.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/decisoes.md — diff ===
@@ -20,6 +20,8 @@
 | D8 | Painel admin: selo, suspensão e planos | ✅ Aprovada | 2026-10-12 |
 | D9 | Parceiros com vários estabelecimentos e novas categorias | ✅ Aprovada | 2026-10-12 |
 | D10 | Idioma na primeira visita (navegador) | ✅ Aprovada | 2026-10-19 |
+| D11 | Plano "Use Guide Verificado", selo e destaque por estabelecimento | ✅ Aprovada | 2026-10-19 |
+| D12 | Verificação e documento por estabelecimento; venda só com verificação | ✅ Aprovada | 2026-10-19 |
 
 ---
 
@@ -118,3 +120,41 @@
 * **Persistência só por escolha explícita** (Configurações ou aviso). Mudança causada pela URL não é gravada. Hoje o app grava o idioma da URL, e quem entra por `/` fica preso em português.
 * Escolha feita por quem tem conta vai para `preferredLocale` pela API (escrita no backend, §6.1) e vale em todos os aparelhos e nos e-mails (§12.5).
 * **Depende de:** S12 (AGENTS.md §12.1 e §12.7).
+
+## D11 — Plano "Use Guide Verificado", selo e destaque por estabelecimento (2026-10-19)
+
+Detalha o item "Selo e plano por estabelecimento" da D9. Modelo de referência: Meta Verified para empresas (assinatura que libera o selo, mas só para quem passou por verificação).
+
+* **Dono do plano:** cada estabelecimento e o perfil de produtor (documentos em `items`). Estado do plano em `listingPlans/{itemId}` (só backend); o item recebe a cópia pública. Os campos de plano e selo saem de `partners/{uid}`, sem migração (§2.2 item 8).
+* **Selo:** aparece só com **plano ativo do estabelecimento** (pago, trial ou concedido pelo admin) **e estabelecimento verificado pelo admin** (D12). Ao tocar no selo, o app explica: "Responsável verificado pelo Use Guide · assinante do plano Use Guide Verificado".
+* **Plano e trial antes da verificação:** bloqueados (código `LISTING_PENDING_VERIFICATION`); avaliações, respostas e cadastro continuam liberados.
+* **Nome do plano:** "Use Guide Verificado" (períodos mensal, semestral e anual).
+* **Trial:** uma vez **por conta**, 7 dias; o parceiro escolhe o estabelecimento.
+* **Preço:** cheio por estabelecimento (catálogo atual), sem desconto por quantidade.
+* **Cobrança:** uma assinatura do Stripe por estabelecimento (`planSubscriptions/{itemId}`), um cliente Stripe por conta; metadata com `itemId` e `partnerId`. O Pix avulso também leva `itemId`.
+* **Eventos:** herdam o selo do estabelecimento ou do perfil de produtor ao qual pertencem (`establishmentId`).
+* **Admin:** concede ou retira o selo por estabelecimento, com as regras da D8.
+* **Expiração:** job diário desliga o selo vencido em itens e eventos; os cards públicos também conferem `verifiedUntil`. A folga de 2 dias da renovação no cartão continua.
+* **Benefícios:** avaliações e respostas **sempre liberadas**, com ou sem plano. As métricas (insights) de um estabelecimento exigem o plano daquele estabelecimento, conferido no backend.
+* **Destaque nas listas (opção C):** **3 vagas** "Destaque" no topo de cada lista (valor de configuração), em rodízio diário entre os estabelecimentos com plano ativo; o resto da lista em ordem orgânica (nota, avaliações), com assinantes e não assinantes juntos. A vaga paga é sempre identificada como "Destaque" (CDC art. 36).
+* **Prompts:** 18.3 (backend) e 18.3.1 (frontend).
+
+## D12 — Verificação e documento por estabelecimento (2026-10-19)
+
+Referências: Receita Federal (IN RFB nº 2.119/2022: cada estabelecimento tem CNPJ próprio, matriz ou filial), Google (verificação por local), Airbnb, Booking, GetYourGuide e Stripe (verificação em registro oficial antes de pagar o parceiro).
+
+* **Verificação por estabelecimento** (P0). O cadastro da conta deixa de pedir CPF/CNPJ; o status da conta fica só para suspensão. Cada estabelecimento nasce "aguardando verificação".
+* **Documento:** no cadastro de cada estabelecimento, o parceiro escolhe CPF ou CNPJ.
+  * **CNPJ:** 1 estabelecimento por CNPJ (filial usa o CNPJ da filial).
+  * **CPF** (P4, opção B): pode ter vários estabelecimentos; o admin confere o CPF uma vez, e os outros estabelecimentos com o mesmo CPF já nascem conferidos.
+  * **Perfil de produtor** (P6, opção A): usa o documento de um estabelecimento da mesma conta, fora da regra 1:1.
+* **Venda** (P1, opção A): exige estabelecimento verificado pelo admin **e** conta Stripe pronta.
+* **CPF não vende** (P3, opção A): vender exige CNPJ (MEI serve). Estabelecimento com CPF aparece no guia, pode ter plano e selo, mas não vende.
+* **Prova do CNPJ** (P2, opção A): o parceiro envia o PDF do Cartão CNPJ (Comprovante de Inscrição e de Situação Cadastral), e o admin confere na Receita antes de aprovar: situação "ATIVA" e nome compatível com o estabelecimento.
+* **Vínculo pessoa-empresa** (P5, opção A): o titular da conta precisa ser sócio ou administrador no Quadro de Sócios e Administradores (QSA) da Receita, ou o titular do MEI, e envia foto do documento de identidade (RG ou CNH). Gerente ou funcionário entra com autorização assinada por um sócio.
+* **Cadastur** (P7, opção A): campo opcional e informativo por enquanto.
+* **Proteção dos dados:**
+  * CPF, CNPJ de pessoa física (MEI) e documentos de identidade são classe Restrita (AGENTS.md §7.6). O número fica cifrado (AES-256-GCM com Cloud KMS) e a unicidade usa índice cego (HMAC), conforme §7.7. Isso resolve o débito de `partnerDocumentKeys/{cpfCnpj}` em texto puro.
+  * Os arquivos ficam em pasta privada do Storage, com nome gerado pelo servidor, e são apagados quando o estabelecimento ou a conta é excluído.
+* **Repasse** (P8, opção A): uma conta Stripe por documento, no Prompt 18.4. Até lá, só vende o estabelecimento cujo documento é o da conta Stripe do parceiro.
+* **Ordem** (P9): 18.3.0 (documento, criptografia e verificação por estabelecimento) → 18.3 (plano e selo, backend) → 18.3.1 (telas) → 18.4 (Stripe por documento) → 19.x (tradução).

=== public/assets/aistudio/Paste_October_19__2026_-_10_47PM_363f219f — APAGUE este arquivo ===

=== public/assets/aistudio/Paste_October_21__2026_-_3_20PM_ee930a4d — APAGUE este arquivo ===

=== public/assets/aistudio/Paste_October_22__2026_-_3_09AM_e8dc1e8b — APAGUE este arquivo ===

=== public/assets/aistudio/Paste_October_22__2026_-_9_13AM_1ebc5c2b — APAGUE este arquivo ===

=== src/app/compositions/PartnerPortalComposition.tsx — diff ===
@@ -153,16 +153,16 @@ export function PartnerPortalComposition() {
       renderCheckoutModal={({
         isOpen,
         onClose,
-        planId,
+        itemId,
         itemName,
         amountMinor,
         onPaymentSuccess,
       }) =>
-        isPaidPlanId(planId) ? (
+        isPaidPlanId(itemId) ? (
           <CheckoutModal
             isOpen={isOpen}
             onClose={onClose}
-            planId={planId}
+            planId={itemId}
             itemName={itemName}
             amountMinor={amountMinor}
             onPaymentSuccess={onPaymentSuccess}

=== src/domain/admin/components/AdminPanel.tsx — diff ===
@@ -347,25 +347,45 @@ export function AdminPanel({
         </AnimatePresence>
       </div>
 
-      {isEditing && (
-        <AdminEditorModal
-          isEditing={isEditing}
-          setIsEditing={setIsEditing}
-          activeTab={activeTab}
-          isAdminUser={isAdminUser}
-          onSave={handleSaveRecord}
-          onDeleteConfirm={(id) => handleDelete(activeTab === 'events' ? 'events' : 'items', id)}
-          showToast={showToast}
-          renderSessionsField={renderSessionsField}
-          renderTicketingManager={renderTicketingManager}
-        />
-      )}
+      <AnimatePresence>
+        {editingListing !== undefined &&
+          renderListingEditor?.({
+            item: editingListing,
+            onClose: () => setEditingListing(undefined),
+          })}
+      </AnimatePresence>
+
+      <AnimatePresence>
+        {isEditing && (
+          <AdminEditorModal
+            isEditing={isEditing}
+            setIsEditing={setIsEditing}
+            activeTab={activeTab as 'items' | 'events'}
+            isAdminUser={isAdminUser}
+            onSave={handleSaveRecord}
+            renderSessionsField={renderSessionsField}
+            renderTicketingManager={renderTicketingManager}
+            onDeleteConfirm={async (id) => {
+              if (activeTab === 'items') {
+                await deleteGuideItemUseCase(id);
+              } else {
+                await deleteAdminEventListingUseCase(id);
+              }
+              showToast('Registro excluído.', 'success');
+            }}
+          />
+        )}
+      </AnimatePresence>
 
-      {editingListing !== undefined &&
-        renderListingEditor?.({
-          item: editingListing,
-          onClose: () => setEditingListing(undefined),
-        })}
+      <style>{`
+        .no-scrollbar::-webkit-scrollbar {
+          display: none;
+        }
+        .no-scrollbar {
+          -ms-overflow-style: none;
+          scrollbar-width: none;
+        }
+      `}</style>
     </div>
   );
 }

=== src/domain/admin/components/subcomponents/AdminEditorModal.tsx — diff ===
@@ -4,38 +4,42 @@ import { FormProvider, useForm, type Resolver } from 'react-hook-form';
 import { motion, AnimatePresence } from 'motion/react';
 import { X, Trash2, RefreshCw } from 'lucide-react';
 import { CATEGORIES } from '../../../../shared/constants/categories';
-import { uploadImageUseCase, getImageUploadErrorMessage } from '../../../../domain/media';
+import { useUI } from '../../../../shared/stores/useUIStore';
 import { Z_INDEX } from '../../../../shared/constants/zIndex';
+import {
+  eventDateRangeFromSessions,
+  listEventOccurrencesUseCase,
+  validateEventSessions,
+  type EventSessionsLoadState,
+} from '../../../events';
+import type { GuideItem } from '../../../guide';
+import { getImageUploadErrorMessage, uploadImageUseCase } from '../../../media';
 import {
   adminGuideEditorFormSchema,
   type AdminGuideEditorSchemaValues,
 } from '../../schemas/adminGuideEditorFormSchema';
-import { listEventOccurrencesUseCase, validateEventSessions } from '../../../events';
-import type { GuideItem } from '../../../guide';
 import { AdminEditorBasicInfo } from './AdminEditorBasicInfo';
 import { AdminEditorGallery } from './AdminEditorGallery';
 import { AdminEditorLocation } from './AdminEditorLocation';
 import { AdminEditorEventFields, type AdminEventSlots } from './AdminEditorEventFields';
 import { AdminEditorActions } from './AdminEditorActions';
 
-export interface AdminEditorSaveData extends GuideItem {
-  occurrences?: Array<{
-    id?: string;
-    startsAt: string;
-    endsAt: string;
-    capacity: number;
-  }>;
+// Atrações e passeios usam o editor de cadastro do parceiro (decisão D9); aqui ficam as dicas.
+export const ADMIN_CREATABLE_ITEM_CATEGORIES = ['tips'] as const;
+
+export type AdminEditorSaveData = GuideItem & {
+  occurrences?: AdminGuideEditorSchemaValues['occurrences'];
+  /** Sessões que existiam quando o editor abriu (as ausentes de `occurrences` são apagadas). */
   savedOccurrenceIds?: string[];
-}
+};
 
 interface AdminEditorModalProps extends AdminEventSlots {
   isEditing: GuideItem;
   setIsEditing: (item: GuideItem | null) => void;
-  activeTab: string;
+  activeTab: 'items' | 'events';
   isAdminUser: boolean;
   onSave: (data: AdminEditorSaveData) => Promise<void>;
   onDeleteConfirm: (id: string) => Promise<void>;
-  showToast: (msg: string, type: 'success' | 'error') => void;
 }
 
 export function AdminEditorModal({
@@ -45,16 +49,14 @@ export function AdminEditorModal({
   isAdminUser,
   onSave,
   onDeleteConfirm,
-  showToast,
   renderSessionsField,
   renderTicketingManager,
 }: AdminEditorModalProps) {
+  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
-  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
-  const [occurrencesState, setOccurrencesState] = useState<'idle' | 'loading' | 'ready' | 'error'>(
-    'idle'
-  );
+  const { showToast } = useUI();
+  const [occurrencesState, setOccurrencesState] = useState<EventSessionsLoadState>('idle');
   const savedOccurrenceIdsRef = useRef<string[]>([]);
 
   const form = useForm<AdminGuideEditorSchemaValues>({
@@ -141,9 +143,15 @@ export function AdminEditorModal({
 
   const availableCategories =
     activeTab === 'items'
-      ? Object.values(CATEGORIES).filter((c) =>
-          isCreatingNew ? c.id === 'tips' : c.id !== 'event'
-        )
+      ? Object.values(CATEGORIES).filter((c) => {
+          if (c.id === 'event') return false;
+          if (isCreatingNew) {
+            return ADMIN_CREATABLE_ITEM_CATEGORIES.includes(
+              c.id as (typeof ADMIN_CREATABLE_ITEM_CATEGORIES)[number]
+            );
+          }
+          return true;
+        })
       : [{ id: 'event', label: CATEGORIES.event.label }];
 
   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
@@ -202,6 +210,7 @@ export function AdminEditorModal({
           ...isEditing,
           ...values,
           category: values.category as GuideItem['category'],
+          ...(activeTab === 'events' ? eventDateRangeFromSessions(sessions) : {}),
           occurrences: sessions,
           savedOccurrenceIds: savedOccurrenceIdsRef.current,
         });

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -1,5 +1,5 @@
 import { BarChart3, RefreshCw } from 'lucide-react';
-import { motion, AnimatePresence } from 'motion/react';
+import { AnimatePresence } from 'motion/react';
 import React, { useRef } from 'react';
 
 // Componentes estruturais e utilitários da UI
@@ -27,7 +27,6 @@ import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
 export interface PartnerPanelProps {
   profile?: PartnerProfile;
   subscriptionPlans?: SubscriptionPlan[];
-  onPlanPurchased?: () => void;
   renderReports?: (props: {
     partnerId: string;
     items: PartnerContentRecord[];
@@ -37,7 +36,7 @@ export interface PartnerPanelProps {
   renderCheckoutModal?: (props: {
     isOpen: boolean;
     onClose: () => void;
-    planId: string;
+    itemId: string;
     itemName: string;
     amountMinor: number;
     onPaymentSuccess: () => void;
@@ -49,12 +48,13 @@ export interface PartnerPanelProps {
   renderBookableOffersManager?: (
     items: Array<{ id: string; name: string; category: string }>
   ) => React.ReactNode;
+  /** Chamado ao fechar o checkout depois de um pagamento confirmado, para recarregar o perfil. */
+  onPlanPurchased?: () => void;
 }
 
 export function PartnerPanel({
   profile,
-  subscriptionPlans = [],
-  onPlanPurchased,
+  subscriptionPlans,
   renderReports,
   renderNotificationBell,
   renderCheckoutModal,
@@ -62,7 +62,7 @@ export function PartnerPanel({
   renderEventSessionsField,
   planSubscriptionSlot,
   renderBookableOffersManager,
-  onPlanPurchased: _onPlanPurchased,
+  onPlanPurchased,
 }: PartnerPanelProps) {
   const { goTo } = useLocalizedRouting();
 
@@ -76,6 +76,7 @@ export function PartnerPanel({
     isEditing,
     setIsEditing,
     isLoading,
+    isUploading,
     showDeleteConfirm,
     setShowDeleteConfirm,
     dataLoading,
@@ -86,7 +87,6 @@ export function PartnerPanel({
     handleToggleActive,
     handleImageUpload,
     handleSaveEvent,
-    isUploading,
   } = usePartnerPanelActions(profile);
 
   // `null` abre o editor para um cadastro novo; `undefined` mantém fechado.
@@ -134,29 +134,25 @@ export function PartnerPanel({
     );
   }
 
-  if (!user || !partnerProfile) {
+  if (!user || profileStatus === 'empty') {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
-        <h2 className="text-xl font-display font-bold text-white mb-4">Portal do Parceiro</h2>
-        <p className="text-white/50 text-xs mb-6 max-w-xs">
-          Faça login para gerenciar seu estabelecimento ou eventos.
+        <h2 className="text-2xl font-display font-extrabold mb-2 text-white">Acesso Restrito</h2>
+        <p className="text-white/50 mb-8 max-w-xs">
+          Este é o portal exclusivo para parceiros cadastrados.
         </p>
         <button
-          type="button"
           onClick={() => goTo('explore')}
-          className="px-6 py-3 rounded-2xl bg-teal-500 text-black font-black uppercase tracking-widest text-[10px]"
+          className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-semibold tracking-wide text-white"
         >
-          Voltar para Home
+          Voltar
         </button>
       </div>
     );
   }
 
   return (
-    <div
-      className="min-h-screen pt-12 pb-40 px-4 bg-[#020508] font-sans selection:bg-teal-500/30 relative overflow-hidden"
-      id="partner-panel-viewport"
-    >
+    <div className="min-h-screen pt-12 pb-40 px-4 bg-[#020508]/60 font-sans selection:bg-teal-500/30 relative overflow-x-hidden backdrop-blur-md">
       <BackgroundBlobs />
 
       <div
@@ -164,8 +160,8 @@ export function PartnerPanel({
       >
         <PartnerHeader
           partnerProfile={partnerProfile}
-          isVerified={isVerified}
           onNavigateBack={() => goTo('explore')}
+          isVerified={isVerified}
           onVerifyClick={() => setShowPlansModal(true)}
           notificationBell={renderNotificationBell?.(partnerProfile?.id || '')}
         />
@@ -178,78 +174,72 @@ export function PartnerPanel({
           isVerified={isVerified}
         />
 
-        <AnimatePresence mode="wait">
-          <motion.div
-            key={activeTab}
-            initial={{ opacity: 0, y: 15 }}
-            animate={{ opacity: 1, y: 0 }}
-            exit={{ opacity: 0, y: -15 }}
-            transition={{ duration: 0.25 }}
-            id="partner-tab-content"
-          >
-            {activeTab === 'items' ? (
-              <>
-                <PartnerItemsTable
-                  itemsList={itemsList}
-                  loading={dataLoading}
-                  onEditItem={(item) => setEditingListing(item)}
-                  onToggleActive={handleToggleActive}
-                  onCreateNew={() => setEditingListing(null)}
-                  verificationVersion={verificationVersion}
-                  onVerifyItem={(item) =>
-                    setVerifyingListing({ id: item.id, name: item.name, category: item.category })
-                  }
-                />
-                {renderBookableOffersManager?.(
-                  itemsList.map((item) => ({
-                    id: item.id,
-                    name: item.name,
-                    category: item.category,
-                  }))
-                )}
-              </>
-            ) : activeTab === 'events' ? (
-              <PartnerEventsTable
-                eventsList={eventsList}
-                loading={dataLoading}
-                onEditEvent={(event) => setIsEditing(event)}
-                onToggleActive={handleToggleActive}
-                onCreateNew={() =>
-                  setIsEditing({
-                    id: '',
-                    name: '',
-                    description: '',
-                    category: 'event',
-                    eventCategory: '',
-                    location: partnerProfile.region || 'Jericoacoara',
-                    googleMapsLink: '',
-                    image: '',
-                    images: [],
-                    operationalInfo: {},
-                    sessions: [newEventSessionDraft()],
-                  })
-                }
-              />
-            ) : (
-              renderReports?.({
-                partnerId: partnerProfile.id,
-                items: itemsList,
-                events: eventsList,
-              }) || (
-                <div className="py-20 text-center glassmorphism rounded-[3rem] p-10 border border-white/10">
-                  <BarChart3 className="mx-auto text-teal-400 mb-4" size={48} />
-                  <h3 className="text-white font-bold text-lg">Métricas e Relatórios</h3>
-                  <p className="text-white/50 text-xs mt-1">
-                    Visualize o desempenho dos seus anúncios em breve.
-                  </p>
-                </div>
-              )
+        {activeTab === 'reports' ? (
+          isVerified ? (
+            renderReports?.({ partnerId: user.uid, items: itemsList, events: eventsList })
+          ) : (
+            <div className="py-24 text-center glassmorphism rounded-[3rem] border border-white/10 p-12">
+              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
+                <BarChart3 size={40} />
+              </div>
+              <h3 className="text-xl font-display font-black text-white mb-2">
+                Relatórios Bloqueados
+              </h3>
+              <p className="text-white/50 text-sm max-w-xs mx-auto mb-8">
+                O acesso aos relatórios é exclusivo para parceiros com o selo de verificação ativo.
+              </p>
+              <button
+                type="button"
+                onClick={() => setShowPlansModal(true)}
+                className="px-8 py-4 bg-blue-500 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-400 transition-all cursor-pointer"
+              >
+                Ativar Verificação
+              </button>
+            </div>
+          )
+        ) : activeTab === 'items' ? (
+          <>
+            <PartnerItemsTable
+              itemsList={itemsList}
+              loading={dataLoading}
+              onEditItem={(item) => setEditingListing(item)}
+              onToggleActive={handleToggleActive}
+              onCreateNew={() => setEditingListing(null)}
+              verificationVersion={verificationVersion}
+              onVerifyItem={(item) =>
+                setVerifyingListing({ id: item.id, name: item.name, category: item.category })
+              }
+            />
+            {renderBookableOffersManager?.(
+              itemsList.map((item) => ({ id: item.id, name: item.name, category: item.category }))
             )}
-          </motion.div>
-        </AnimatePresence>
-
-        {renderEventTicketingManager && (
-          <div className="pt-6">{renderEventTicketingManager(partnerProfile.id)}</div>
+          </>
+        ) : (
+          <PartnerEventsTable
+            eventsList={eventsList}
+            loading={dataLoading}
+            onEditEvent={(item) =>
+              setIsEditing({
+                ...item,
+                images: item.images || (item.image ? [item.image] : []),
+              })
+            }
+            onToggleActive={handleToggleActive}
+            onCreateNew={() =>
+              setIsEditing({
+                id: '',
+                name: '',
+                description: '',
+                category: 'event',
+                location: '',
+                ownerId: user?.uid || '',
+                image: '',
+                images: [],
+                operationalInfo: {},
+                sessions: [newEventSessionDraft()],
+              })
+            }
+          />
         )}
       </div>
 
@@ -274,7 +264,7 @@ export function PartnerPanel({
             renderEventTicketingManager={renderEventTicketingManager}
             showDeleteConfirm={showDeleteConfirm}
             onRequestDelete={setShowDeleteConfirm}
-            onConfirmDelete={() => handleDelete(isEditing.id)}
+            onConfirmDelete={handleDelete}
           />
         )}
       </AnimatePresence>
@@ -315,26 +305,28 @@ export function PartnerPanel({
       <PlansModal
         isOpen={showPlansModal}
         onClose={() => setShowPlansModal(false)}
-        userId={user?.uid || ''}
+        userId={user.uid}
         partnerProfile={partnerProfile || undefined}
-        plans={subscriptionPlans}
-        onSelectPaidPlan={(planId, itemName, amountMinor) => {
-          setCheckoutPlanInfo({ itemId: planId, itemName, amountMinor });
+        plans={subscriptionPlans ?? []}
+        onSelectPaidPlan={(planId, planName, amountMinor) => {
+          setCheckoutPlanInfo({ itemId: planId, itemName: planName, amountMinor });
           setShowCheckoutModal(true);
         }}
       />
 
-      <AnimatePresence>
-        {showCheckoutModal &&
-          renderCheckoutModal?.({
-            isOpen: showCheckoutModal,
-            onClose: handleCheckoutClose,
-            planId: checkoutPlanInfo.itemId,
-            itemName: checkoutPlanInfo.itemName,
-            amountMinor: checkoutPlanInfo.amountMinor,
-            onPaymentSuccess: handleCheckoutSuccess,
-          })}
-      </AnimatePresence>
+      {renderCheckoutModal?.({
+        isOpen: showCheckoutModal,
+        onClose: handleCheckoutClose,
+        itemId: checkoutPlanInfo.itemId,
+        itemName: checkoutPlanInfo.itemName,
+        amountMinor: checkoutPlanInfo.amountMinor,
+        onPaymentSuccess: handleCheckoutSuccess,
+      })}
+
+      <style>{`
+        .glassmorphism { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); }
+        .no-scrollbar::-webkit-scrollbar { display: none; }
+      `}</style>
     </div>
   );
 }

=== src/domain/partners/hooks/usePartnerContentActions.ts — diff ===
@@ -1,23 +1,24 @@
 import { useCallback } from 'react';
 import { useUI } from '../../../shared/stores/useUIStore';
 import type { UserSession } from '../../auth';
+import {
+  createPartnerContentEventUseCase,
+  deletePartnerContentEventUseCase,
+  deletePartnerContentItemUseCase,
+  updatePartnerContentEventUseCase,
+  updatePartnerContentItemUseCase,
+} from '../index';
 import {
   type EventSessionsLoadState,
   eventDateRangeFromSessions,
   saveEventSessionsUseCase,
   validateEventSessions,
 } from '../../events';
-import { createPartnerContentEventUseCase } from '../application/usecases/createPartnerContentEventUseCase';
-import { deletePartnerContentEventUseCase } from '../application/usecases/deletePartnerContentEventUseCase';
-import { deletePartnerContentItemUseCase } from '../application/usecases/deletePartnerContentItemUseCase';
-import { updatePartnerContentEventUseCase } from '../application/usecases/updatePartnerContentEventUseCase';
-import { updatePartnerContentItemUseCase } from '../application/usecases/updatePartnerContentItemUseCase';
 import { partnerEventFormSchema } from '../schemas/partnerEventFormSchema';
 import type { PartnerContentEditorState, PartnerContentEventInput } from '../types/partnerContent';
 
 function getErrorMessage(error: unknown, fallback: string): string {
-  if (error instanceof Error && error.message) return error.message;
-  return fallback;
+  return error instanceof Error && error.message ? error.message : fallback;
 }
 
 function toPlainRecord(value: object): Record<string, unknown> {
@@ -36,7 +37,7 @@ export interface UsePartnerContentActionsProps {
   isEditing: PartnerContentEditorState | null;
   setIsEditing: (item: PartnerContentEditorState | null) => void;
   setShowDeleteConfirm: (val: boolean) => void;
-  setIsLoading: (loading: boolean) => void;
+  setIsLoading: (val: boolean) => void;
 }
 
 export function usePartnerContentActions({
@@ -49,46 +50,49 @@ export function usePartnerContentActions({
 }: UsePartnerContentActionsProps) {
   const { showToast } = useUI();
 
-  const handleDelete = useCallback(
-    async (id: string) => {
-      setIsLoading(true);
-      try {
-        if (activeTab === 'items') {
-          await deletePartnerContentItemUseCase(id);
-        } else {
-          await deletePartnerContentEventUseCase(id);
-        }
-        setShowDeleteConfirm(false);
-        setIsEditing(null);
-        showToast('Registro excluído com sucesso.', 'success');
-      } catch (error: unknown) {
-        console.error('Erro ao excluir item:', error);
-        showToast(getErrorMessage(error, 'Erro ao excluir registro'), 'error');
-      } finally {
-        setIsLoading(false);
+  const handleDelete = useCallback(async () => {
+    if (!isEditing?.id) return;
+
+    setIsLoading(true);
+    const coll = activeTab === 'items' ? 'items' : 'events';
+    try {
+      if (coll === 'items') {
+        await deletePartnerContentItemUseCase(isEditing.id);
+      } else {
+        await deletePartnerContentEventUseCase(isEditing.id);
       }
-    },
-    [activeTab, setIsLoading, setShowDeleteConfirm, setIsEditing, showToast]
-  );
+
+      setIsEditing(null);
+      setShowDeleteConfirm(false);
+      showToast('Item excluído com sucesso!', 'success');
+    } catch (error: unknown) {
+      console.error('Erro ao excluir:', error);
+      showToast(getErrorMessage(error, 'Erro ao excluir item'), 'error');
+    } finally {
+      setIsLoading(false);
+    }
+  }, [isEditing, activeTab, setIsLoading, setIsEditing, setShowDeleteConfirm, showToast]);
 
   const handleToggleActive = useCallback(
-    async (id: string, currentActive: boolean) => {
-      setIsLoading(true);
+    async (itemId: string, currentActiveState: boolean) => {
+      const coll = activeTab === 'items' ? 'items' : 'events';
       try {
-        if (activeTab === 'items') {
-          await updatePartnerContentItemUseCase(id, { isActive: !currentActive });
+        if (coll === 'items') {
+          await updatePartnerContentItemUseCase(itemId, {
+            isActive: !currentActiveState,
+          });
         } else {
-          await updatePartnerContentEventUseCase(id, { isActive: !currentActive });
+          await updatePartnerContentEventUseCase(itemId, {
+            isActive: !currentActiveState,
+          });
         }
-        showToast('Status atualizado.', 'success');
+        showToast(`Item ${!currentActiveState ? 'ativado' : 'desativado'} com sucesso!`, 'success');
       } catch (error: unknown) {
-        console.error('Erro ao alterar status:', error);
-        showToast(getErrorMessage(error, 'Erro ao alterar status'), 'error');
-      } finally {
-        setIsLoading(false);
+        console.error('Erro ao alternar status ativo:', error);
+        showToast(getErrorMessage(error, 'Erro ao atualizar status'), 'error');
       }
     },
-    [activeTab, setIsLoading, showToast]
+    [activeTab, showToast]
   );
 
   const handleSaveEvent = useCallback(

=== src/domain/partners/hooks/usePartnerProfile.test.ts — diff ===
@@ -112,7 +112,7 @@ describe('usePartnerProfile', () => {
     expect(result.current.profileStatus).toBe('ready');
   });
 
-  it('publicPartner NÃO contém verificationType, confirmando que esses dados continuam vindos do perfil carregado', async () => {
+  it('publicPartner NÃO contém cpfCnpj e verificationType, confirmando que esses dados continuam vindos do perfil carregado', async () => {
     const { result } = renderHook(() => usePartnerProfile(mockLoadedProfile));
 
     await act(async () => {

=== src/domain/partners/hooks/usePartnerProfile.ts — diff ===
@@ -1,143 +1,179 @@
 import { useState, useEffect } from 'react';
 import { subscribeToPartnerProfileUseCase } from '../application/usecases/subscribeToPartnerProfileUseCase';
-import { subscribeToAuthStateUseCase, UserRole, type UserSession } from '../../auth';
+import { subscribeToAuthStateUseCase, type UserSession } from '../../auth';
 import { getCurrentUserUseCase } from '../../user';
-import { PartnerProfile, PublicPartnerProfile } from '../types/partner';
+import { PartnerProfile } from '../types/partner';
 
-export type PartnerProfileStatus = 'loading' | 'ready' | 'missing' | 'unauthenticated';
+enum OperationType {
+  CREATE = 'create',
+  UPDATE = 'update',
+  DELETE = 'delete',
+  LIST = 'list',
+  GET = 'get',
+  WRITE = 'write',
+}
+
+interface FirestoreErrorInfo {
+  error: string;
+  operationType: OperationType;
+  path: string | null;
+  authInfo: {
+    userId?: string | null | undefined;
+    email?: string | null | undefined;
+    emailVerified?: boolean | null | undefined;
+    isAnonymous?: boolean | null | undefined;
+  };
+}
+
+function handleFirestoreError(
+  error: unknown,
+  operationType: OperationType,
+  path: string | null,
+  currentUser?: Pick<UserSession, 'uid'> | null
+): void {
+  const errInfo: FirestoreErrorInfo = {
+    error: error instanceof Error ? error.message : String(error),
+    authInfo: {
+      userId: currentUser?.uid,
+    },
+    operationType,
+    path,
+  };
+
+  console.error('Firestore Error [Domain Profile]:', JSON.stringify(errInfo));
+}
 
 export function usePartnerProfile(loadedProfile?: PartnerProfile) {
   const [user, setUser] = useState<UserSession | null>(null);
   const [userLoading, setUserLoading] = useState(true);
 
   useEffect(() => {
-    const unsubscribe = subscribeToAuthStateUseCase(async (currentUser) => {
-      if (!currentUser) {
-        setUser(null);
-        setUserLoading(false);
-        return;
-      }
-
-      try {
-        const userDoc = await getCurrentUserUseCase();
-        const role =
-          currentUser.role === UserRole.ADMIN
-            ? UserRole.ADMIN
-            : userDoc?.role === 'partner'
-              ? UserRole.PARTNER
-              : currentUser.role || UserRole.USER;
-        setUser({ ...currentUser, role });
-      } catch (err) {
-        console.error('Erro ao buscar role:', err);
-        setUser({ ...currentUser, role: currentUser.role || UserRole.USER });
-      } finally {
-        setUserLoading(false);
-      }
+    const unsubscribe = subscribeToAuthStateUseCase((session) => {
+      setUser(session);
+      setUserLoading(false);
     });
+
     return () => unsubscribe();
   }, []);
 
+  const [userProfileData, setUserProfileData] =
+    useState<Awaited<ReturnType<typeof getCurrentUserUseCase>>>(null);
+
+  const userId = user?.uid;
+  useEffect(() => {
+    if (userLoading || !userId) {
+      setUserProfileData(null);
+      return;
+    }
+
+    let active = true;
+
+    getCurrentUserUseCase()
+      .then((profile) => {
+        if (active) {
+          setUserProfileData(profile);
+        }
+      })
+      .catch((error) => {
+        if (active) {
+          console.error('[usePartnerProfile] Erro ao carregar perfil do usuário:', error);
+        }
+      });
+
+    return () => {
+      active = false;
+    };
+  }, [userId, userLoading]);
+
   const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(
-    loadedProfile ?? null
-  );
-  const [profileStatus, setProfileStatus] = useState<PartnerProfileStatus>(
-    loadedProfile ? 'ready' : 'loading'
+    loadedProfile || null
   );
-  const [profileError, setProfileError] = useState<string | null>(null);
 
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
-
-  const userId = user?.uid ?? null;
-  const userRole = user?.role ?? null;
+  const [profileError, setProfileError] = useState<string | null>(null);
+  const [profileStatus, setProfileStatus] = useState<'loading' | 'ready' | 'empty'>('loading');
 
   useEffect(() => {
-    if (userLoading) {
+    if (userLoading || !user) {
       return;
     }
 
-    if (!userId) {
-      setPartnerProfile(null);
-      setProfileError(null);
-      setProfileStatus('unauthenticated');
-      return;
-    }
+    const targetPartnerId = user.uid;
+    setProfileStatus('loading');
+    setProfileError(null);
 
-    if (userRole === UserRole.ADMIN && !loadedProfile) {
-      setProfileError(null);
-      setPartnerProfile({
-        id: userId,
-        businessName: 'Admin',
-        businessId: 'admin-virtual',
-        businesses: [],
-        isVerified: true,
-        verifiedUntil: null,
-        verificationType: 'admin',
-        isVerificationSuspended: false,
-        hasUsedTrial: false,
-        status: 'active',
-      });
-      setProfileStatus('ready');
-      return;
-    }
+    const path = `publicPartners/${targetPartnerId}`;
 
-    if (loadedProfile) {
-      setPartnerProfile(loadedProfile);
-      setProfileStatus('ready');
-    } else {
-      setProfileStatus('loading');
-    }
+    const unsubscribe = subscribeToPartnerProfileUseCase(
+      targetPartnerId,
+      (publicPartner) => {
+        if (!publicPartner) {
+          if (loadedProfile) {
+            setPartnerProfile(loadedProfile);
+            setProfileStatus('ready');
+            return;
+          }
 
-    const unsub = subscribeToPartnerProfileUseCase(
-      userId,
-      (publicProfile: PublicPartnerProfile | null) => {
-        setProfileError(null);
-        if (publicProfile) {
-          const primaryBusiness = publicProfile.businesses?.[0];
-          setPartnerProfile((prev) => {
-            const base = prev ?? loadedProfile;
-            return {
-              id: publicProfile.id,
-              businessName: primaryBusiness?.businessName ?? base?.businessName ?? '',
-              businessId: primaryBusiness?.businessId ?? base?.businessId ?? '',
-              businesses: publicProfile.businesses,
-              region: base?.region,
-              verificationType: base?.verificationType ?? null,
-              hasUsedTrial: base?.hasUsedTrial ?? false,
-              isVerified: publicProfile.isVerified,
-              verifiedUntil: publicProfile.verifiedUntil,
-              isVerificationSuspended: publicProfile.isVerificationSuspended,
-              status: publicProfile.status,
-            };
-          });
-          setProfileStatus('ready');
-        } else if (loadedProfile) {
-          setPartnerProfile(loadedProfile);
-          setProfileStatus('ready');
-        } else {
           setPartnerProfile(null);
-          setProfileStatus('missing');
+          setProfileStatus('empty');
+          return;
         }
+
+        const businesses = publicPartner.businesses ?? loadedProfile?.businesses ?? [];
+        const firstBusiness = businesses[0];
+
+        const partnerProfileData: PartnerProfile = {
+          ...(loadedProfile ?? {}),
+          id: targetPartnerId,
+          businessId: firstBusiness?.businessId ?? loadedProfile?.businessId ?? null,
+          businessName: firstBusiness?.businessName ?? loadedProfile?.businessName ?? '',
+          businesses,
+          firstName: userProfileData?.firstName ?? loadedProfile?.firstName ?? '',
+          lastName: userProfileData?.lastName ?? loadedProfile?.lastName ?? '',
+          email: userProfileData?.email ?? loadedProfile?.email ?? '',
+          phone: userProfileData?.phone ?? loadedProfile?.phone,
+          phoneDdi: loadedProfile?.phoneDdi,
+          instagram: loadedProfile?.instagram,
+          website: loadedProfile?.website,
+          bookingLinks: loadedProfile?.bookingLinks,
+          googleMaps: loadedProfile?.googleMaps,
+          address: loadedProfile?.address,
+          region: loadedProfile?.region,
+          images: loadedProfile?.images,
+          isVerified: publicPartner.isVerified,
+          verifiedUntil: publicPartner.verifiedUntil,
+          verificationType: loadedProfile?.verificationType ?? null,
+          isVerificationSuspended: publicPartner.isVerificationSuspended,
+          hasUsedTrial: loadedProfile?.hasUsedTrial ?? false,
+          status: publicPartner.status,
+        };
+
+        setPartnerProfile(partnerProfileData);
+        setProfileStatus('ready');
       },
       (error) => {
-        console.error('Firestore Error (partnerProfile):', error);
+        handleFirestoreError(error, OperationType.GET, path, user);
         setProfileError('Não foi possível carregar os dados do parceiro agora.');
+
         if (loadedProfile) {
           setPartnerProfile(loadedProfile);
           setProfileStatus('ready');
-        } else {
-          setProfileStatus('missing');
+          return;
         }
+
+        setPartnerProfile(null);
+        setProfileStatus('empty');
       }
     );
 
-    return () => unsub();
-  }, [userLoading, userId, userRole, loadedProfile]);
+    return () => unsubscribe();
+  }, [user, userLoading, loadedProfile, userProfileData]);
 
-  const isVerified = Boolean(
+  const isVerified = !!(
     partnerProfile?.isVerified &&
-      !partnerProfile?.isVerificationSuspended &&
-      (!partnerProfile?.verifiedUntil || new Date(partnerProfile.verifiedUntil) > new Date())
+    !partnerProfile?.isVerificationSuspended &&
+    (!partnerProfile?.verifiedUntil || new Date(partnerProfile.verifiedUntil) > new Date())
   );
 
   return {
@@ -146,11 +182,11 @@ export function usePartnerProfile(loadedProfile?: PartnerProfile) {
     partnerProfile,
     setPartnerProfile,
     profileStatus,
-    profileError,
     isLoading,
     setIsLoading,
     isUploading,
     setIsUploading,
+    profileError,
     isVerified,
   };
 }

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros), `npm test` → 168 arquivos, 904 testes, `npm run build`.
- no app: painel do parceiro → aba Cadastros mostra o selo de verificação em cada cadastro; aba Eventos cria e edita evento com sessões; painel admin → editar um evento e salvar (as datas do evento seguem as sessões); criar item novo só oferece a categoria Dicas.

Depois deste, siga com o lote 14 (18.3a, 18.3b e 18.3c), nesta ordem.

Responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
