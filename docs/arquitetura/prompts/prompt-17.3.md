# Prompt 17.3 — Completa o lote 9

> Lote 10, gerado do commit de referência `3fd9a3f` da branch `claude/agents-md-v2`. É o primeiro do lote 10: aplique antes do 18. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 17.3 — Completa o lote 9

Comparação do zip de 2026-10-18: o 16.1 e o 17.2 vieram corretos; o 17 e o 17.1 vieram só em parte (vários arquivos ficaram na versão antiga). Este prompt devolve esses arquivos ao resultado esperado.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE. Não reescreva os arquivos do seu jeito, não mantenha a versão anterior de nenhum trecho e não acrescente funcionalidades. O resultado de cada arquivo deve ficar idêntico ao diff.

O QUE MUDA:
1) Admin, parceiros:
   - criar src/domain/admin/hooks/useAdminPartnerActions.ts;
   - "Conceder selo"/"Retirar selo" sem mexer no plano pago (decisão D8); o servidor decide tipo e validade, e a lista é recarregada;
   - status Suspenso; plano e validade visíveis; selo suspenso;
   - confirmações com o nome do parceiro;
   - botões de 44 px com nome acessível.
2) Editor de evento do admin:
   - não salva enquanto as sessões não carregaram (sem isso, uma falha de carregamento apagava todas as sessões existentes);
   - envia removedOccurrenceIds;
   - o filtro de categoria vale só para a aba de itens.
3) Avisos do admin: confirmação antes de enviar para todos os parceiros e estado vazio.
4) Relatórios: estatística de evento lida na coleção events (hoje lê items) e ErrorState com nova tentativa; sem leitura extra do documento.
5) Parceiro:
   - updatePartnerVerificationUseCase, port, adapter e schema enviam só { partnerId, isVerified };
   - tipo de verificação 'admin';
   - o perfil é recarregado ao fechar o checkout depois de um pagamento confirmado (onPlanPurchased);
   - subtítulo do plano e status da conta ("Em análise"/"Ativo") corretos.
6) Planos (17.1):
   - remover finiteNonNegativeNumber e roundCurrency, que sobraram;
   - o adapter usa priceMinor;
   - a data de cobrança é formatada no fuso America/Fortaleza.
7) Restaurar os testes de server/domain/partners/schemas/partnerSchema.test.ts e os comentários de porquê removidos em partnerSchema.ts e offerService.ts.

São mantidas (não desfaça): as datas no fuso de Fortaleza no gerenciador de ingressos, overflow-x-hidden no painel do parceiro e o teste da taxa da plataforma independente do ambiente.

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/domain/admin/schemas/adminPlanSchema.ts (alterar)
- server/domain/admin/services/adminPlansService.ts (alterar)
- server/domain/bookings/services/offerService.ts (alterar)
- server/domain/partners/schemas/partnerSchema.test.ts (alterar)
- server/domain/partners/schemas/partnerSchema.ts (alterar)
- src/domain/admin/adapters/firestoreAdminPlansAdapter.ts (alterar)
- src/domain/admin/components/AdminPanel.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminEditorModal.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminItemGrid.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminNotificationsView.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminPartnersView.tsx (alterar)
- src/domain/admin/hooks/useAdminPartnerActions.ts (criar)
- src/domain/admin/types/admin.ts (alterar)
- src/domain/insights/components/ReportsView.tsx (alterar)
- src/domain/partners/adapters/apiPartnerAdapter.ts (alterar)
- src/domain/partners/application/usecases/updatePartnerVerificationUseCase.test.ts (alterar)
- src/domain/partners/application/usecases/updatePartnerVerificationUseCase.ts (alterar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/components/subcomponents/PartnerHeader.tsx (alterar)
- src/domain/partners/ports/partnerPort.ts (alterar)
- src/domain/partners/schemas/partnerSchema.test.ts (alterar)
- src/domain/partners/schemas/partnerSchema.ts (alterar)
- src/domain/partners/types/partner.ts (alterar)
- src/domain/payment/utils/formatPlanAmount.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/domain/admin/schemas/adminPlanSchema.ts — diff ===
@@ -1,18 +1,5 @@
 import { z } from 'zod';
 
-const finiteNonNegativeNumber = z.preprocess(
-  (value) => {
-    if (typeof value === 'string') {
-      const normalized = value.trim();
-      if (!normalized) {
-        return undefined;
-      }
-      return Number(normalized);
-    }
-    return value;
-  },
-  z.number().finite().nonnegative()
-);
 
 export const updatePlanSchema = z
   .object({
@@ -29,4 +16,3 @@ export const updatePlanSchema = z
   });
 
 export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
-

=== server/domain/admin/services/adminPlansService.ts — diff ===
@@ -10,10 +10,6 @@ const BILLING_MONTHS_BY_PLAN: Partial<Record<SubscriptionPlan['id'], number>> =
   annual: 12,
 };
 
-function roundCurrency(value: number): number {
-  return Math.round(value * 100) / 100;
-}
-
 export class AdminPlansService {
   constructor(
     private readonly adminPlansPort: AdminPlansPort

=== server/domain/bookings/services/offerService.ts — diff ===
@@ -127,6 +127,7 @@ export class OfferService {
     return updated;
   }
 
+  /** `beforePublish` recebe a oferta antes de ela ficar pública e pode recusar lançando um erro. */
   async setOfferStatus(
     actor: BookingActor,
     offerId: string,

=== server/domain/partners/schemas/partnerSchema.test.ts — diff ===
@@ -1,24 +1,74 @@
 import { describe, expect, it } from 'vitest';
-import {
-  registerPartnerSchema,
-  verifyPartnerSchema,
-  activateTrialSchema,
-  updatePartnerStatusSchema,
-} from './partnerSchema';
+import { activateTrialSchema, registerPartnerSchema, verifyPartnerSchema } from './partnerSchema';
 
 describe('Partner Validation Schemas (Backend)', () => {
   describe('registerPartnerSchema', () => {
-    it('should validate complete partner registration data', () => {
+    it('should validate complete partner registration payload with valid CPF', () => {
       const result = registerPartnerSchema.safeParse({
         formData: {
           category: 'hotel',
-          cpfCnpj: '52998224725',
+          cpfCnpj: '123.456.789-09',
           termsAccepted: true,
         },
       });
       expect(result.success).toBe(true);
     });
 
+    it('should validate partner registration payload with valid numeric CNPJ', () => {
+      const result = registerPartnerSchema.safeParse({
+        formData: {
+          category: 'restaurant',
+          cpfCnpj: '00.000.000/0001-91',
+          termsAccepted: true,
+        },
+      });
+      expect(result.success).toBe(true);
+    });
+
+    it('should validate partner registration payload with valid alphanumeric CNPJ', () => {
+      const result = registerPartnerSchema.safeParse({
+        formData: {
+          category: 'sight',
+          cpfCnpj: '12.ABC.345/01DE-35',
+          termsAccepted: true,
+        },
+      });
+      expect(result.success).toBe(true);
+    });
+
+    it('should fail when termsAccepted is false', () => {
+      const result = registerPartnerSchema.safeParse({
+        formData: {
+          category: 'hotel',
+          cpfCnpj: '123.456.789-09',
+          termsAccepted: false,
+        },
+      });
+      expect(result.success).toBe(false);
+    });
+
+    it('should fail when cpfCnpj is invalid', () => {
+      const result = registerPartnerSchema.safeParse({
+        formData: {
+          category: 'hotel',
+          cpfCnpj: '123.456.789-00',
+          termsAccepted: true,
+        },
+      });
+      expect(result.success).toBe(false);
+    });
+
+    it('should fail when category is invalid', () => {
+      const result = registerPartnerSchema.safeParse({
+        formData: {
+          category: 'invalid_category',
+          cpfCnpj: '123.456.789-09',
+          termsAccepted: true,
+        },
+      });
+      expect(result.success).toBe(false);
+    });
+
     it('should fail when formData is missing', () => {
       const result = registerPartnerSchema.safeParse({});
       expect(result.success).toBe(false);
@@ -54,37 +104,14 @@ describe('Partner Validation Schemas (Backend)', () => {
   describe('activateTrialSchema', () => {
     it('should validate trial activation with required trimmed partnerId', () => {
       const result = activateTrialSchema.safeParse({
-        partnerId: '  partner_abc  ',
+        partnerId: 'partner_123',
       });
       expect(result.success).toBe(true);
-      if (result.success) {
-        expect(result.data.partnerId).toBe('partner_abc');
-      }
     });
 
-    it('should fail when partnerId is missing or empty', () => {
+    it('should fail when partnerId is empty or missing', () => {
       expect(activateTrialSchema.safeParse({}).success).toBe(false);
-      expect(activateTrialSchema.safeParse({ partnerId: '   ' }).success).toBe(false);
-    });
-  });
-
-  describe('updatePartnerStatusSchema', () => {
-    it('should validate valid status values', () => {
-      expect(
-        updatePartnerStatusSchema.safeParse({ partnerId: 'p1', status: 'active' }).success
-      ).toBe(true);
-      expect(
-        updatePartnerStatusSchema.safeParse({ partnerId: 'p1', status: 'pending' }).success
-      ).toBe(true);
-      expect(
-        updatePartnerStatusSchema.safeParse({ partnerId: 'p1', status: 'suspended' }).success
-      ).toBe(true);
-    });
-
-    it('should fail with invalid status value', () => {
-      expect(
-        updatePartnerStatusSchema.safeParse({ partnerId: 'p1', status: 'unknown' }).success
-      ).toBe(false);
+      expect(activateTrialSchema.safeParse({ partnerId: '  ' }).success).toBe(false);
     });
   });
 });

=== server/domain/partners/schemas/partnerSchema.ts — diff ===
@@ -21,6 +21,8 @@ export const registerPartnerSchema = z
   })
   .strict();
 
+// O admin só diz se concede ou retira o selo; tipo e validade são decididos no servidor
+// para nunca sobrescrever o plano pago do parceiro.
 export const verifyPartnerSchema = z
   .object({
     partnerId: z.string().trim().min(1, 'ID do parceiro é obrigatório'),

=== src/domain/admin/adapters/firestoreAdminPlansAdapter.ts — diff ===
@@ -47,7 +47,7 @@ export class FirestoreAdminPlansAdapter implements AdminPlansPort {
     planId: string,
     data: {
       name?: string;
-      price?: number;
+      priceMinor?: number;
       period?: string;
       description?: string;
       isActive?: boolean;

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
@@ -19,10 +14,8 @@ import {
   createAdminEventOccurrenceUseCase,
   deleteAdminEventListingUseCase,
   deleteAdminEventOccurrenceUseCase,
-  listEventOccurrencesUseCase,
   updateAdminEventListingUseCase,
   updateAdminEventOccurrenceUseCase,
-  EVENT_CATEGORIES,
 } from '../../events';
 import {
   createGuideItemUseCase,
@@ -38,8 +31,8 @@ import {
 } from '../application/mappers/adminGuideEditorMapper';
 import { useAdminGuideCatalog } from '../hooks/useAdminGuideCatalog';
 import { useAdminPartners } from '../hooks/useAdminPartners';
+import { useAdminPartnerActions } from '../hooks/useAdminPartnerActions';
 import { useAdminStats } from '../hooks/useAdminStats';
-import type { AdminPartnerSummary } from '../types/admin';
 
 import { AdminNavigation, type AdminTabId } from './subcomponents/AdminNavigation';
 import { AdminStatsView } from './subcomponents/AdminStatsView';
@@ -48,6 +41,7 @@ import { AdminGuideView } from './subcomponents/AdminGuideView';
 import {
   ADMIN_CREATABLE_ITEM_CATEGORIES,
   AdminEditorModal,
+  type AdminEditorSaveData,
 } from './subcomponents/AdminEditorModal';
 import { AdminPlansView } from './subcomponents/AdminPlansView';
 import { AdminNotificationsView } from './subcomponents/AdminNotificationsView';
@@ -88,36 +82,23 @@ export function AdminPanel() {
 
   const currentList = activeTab === 'events' ? eventsList : itemsList;
 
+  // O filtro de categoria só existe na aba de itens; na agenda todos os eventos aparecem.
   const filteredItems = useMemo(() => {
-    if (filter === 'all') return currentList;
-    if (activeTab === 'events') {
-      return (eventsList as GuideItem[]).filter(
-        (item) => (item.eventCategory || 'Outro').toLowerCase() === filter.toLowerCase()
-      );
-    }
-    return itemsList.filter((item) => item.category === filter);
-  }, [currentList, filter, activeTab, eventsList, itemsList]);
+    if (activeTab !== 'items' || filter === 'all') return currentList;
+    return currentList.filter((item) => item.category === filter);
+  }, [activeTab, currentList, filter]);
 
-  const categories = useMemo(() => {
-    if (activeTab === 'events') {
-      return [
-        { id: 'all', label: 'Todos', color: 'bg-white/10' },
-        ...EVENT_CATEGORIES.map((cat) => ({
-          id: cat.toLowerCase(),
-          label: cat,
-          color: 'bg-teal-500/10 text-teal-400',
-        })),
-      ];
-    }
-    return [
+  const categories = useMemo(
+    () => [
       { id: 'all', label: 'Todos', color: 'bg-white/10' },
       ...Object.values(CATEGORIES).map((c) => ({
         id: c.id,
         label: c.label,
         color: `${c.bgClass} ${c.colorClass}`,
       })),
-    ];
-  }, [activeTab]);
+    ],
+    []
+  );
 
   const handleDelete = async (coll: string, id: string) => {
     if (!(await confirmAction('Excluir permanentemente?'))) return;
@@ -127,59 +108,17 @@ export function AdminPanel() {
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
-    try {
-      await updatePartnerVerificationUseCase(partner.id, newVerified);
-      patchPartner(partner.id, { isVerified: newVerified });
-      showToast('Status de verificação atualizado com sucesso!', 'success');
-    } catch {
-      showToast('Erro ao atualizar verificação', 'error');
-    }
-  };
-
-  const handleToggleStatus = async (partner: AdminPartnerSummary) => {
-    const nextStatus = partner.status === 'active' ? 'suspended' : 'active';
-    const actionLabel =
-      partner.status === 'active'
-        ? 'Suspender o parceiro?'
-        : partner.status === 'suspended'
-        ? 'Reativar o parceiro?'
-        : 'Aprovar o cadastro do parceiro?';
-    if (!(await confirmAction(actionLabel))) return;
-    try {
-      await updatePartnerStatusUseCase(partner.id, nextStatus);
-      patchPartner(partner.id, { status: nextStatus });
-      showToast(
-        nextStatus === 'suspended'
-          ? 'Parceiro suspenso com sucesso.'
-          : 'Parceiro ativado com sucesso!',
-        'success'
-      );
-    } catch {
-      showToast('Erro ao atualizar status', 'error');
-    }
-  };
-
-  const handleDeletePartner = async (id: string) => {
-    if (!(await confirmAction('Excluir este parceiro permanentemente?'))) return;
-    try {
-      await deletePartnerProfileUseCase(id);
-      removePartner(id);
-      showToast('Parceiro excluído com sucesso.', 'success');
-    } catch {
-      showToast('Erro ao excluir parceiro.', 'error');
-    }
-  };
+  const { handleToggleVerification, handleToggleStatus, handleDeletePartner } =
+    useAdminPartnerActions({ reloadPartners: fetchPartners, patchPartner, removePartner });
 
-  const handleSaveRecord = async (editorData: GuideItem) => {
+  const handleSaveRecord = async (editorData: AdminEditorSaveData) => {
     try {
       if (activeTab === 'items') {
         if (editorData.id) {
@@ -193,30 +132,17 @@ export function AdminPanel() {
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
-            const existingOccurrences = await listEventOccurrencesUseCase(editorData.id);
-            const keptIds = new Set(rawOccurrences.map((occ) => occ.id).filter(Boolean));
-            for (const existingOcc of existingOccurrences) {
-              if (!keptIds.has(existingOcc.id)) {
-                await deleteAdminEventOccurrenceUseCase(editorData.id, existingOcc.id);
-              }
-            }
             for (const occ of rawOccurrences) {
               if (occ.id) {
                 await updateAdminEventOccurrenceUseCase(editorData.id, occ.id, {
@@ -248,6 +174,7 @@ export function AdminPanel() {
         }
       }
       setIsEditing(null);
+      showToast('Registro salvo.', 'success');
     } catch (error: unknown) {
       console.error('[AdminPanel.handleSaveRecord]', error);
       showToast(
@@ -324,13 +251,7 @@ export function AdminPanel() {
           </div>
         </motion.div>
 
-        <AdminNavigation
-          activeTab={activeTab}
-          onSelectTab={(tab) => {
-            setFilter('all');
-            setActiveTab(tab);
-          }}
-        />
+        <AdminNavigation activeTab={activeTab} onSelectTab={setActiveTab} />
 
         <AnimatePresence mode="wait">
           <motion.div
@@ -416,6 +337,7 @@ export function AdminPanel() {
               } else {
                 await deleteAdminEventListingUseCase(id);
               }
+              showToast('Registro excluído.', 'success');
             }}
           />
         )}

=== src/domain/admin/components/subcomponents/AdminEditorModal.tsx — diff ===
@@ -185,11 +185,21 @@ export function AdminEditorModal({
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
@@ -197,6 +207,7 @@ export function AdminEditorModal({
           date: firstOccurrence?.startsAt || values.date,
           endDate: firstOccurrence?.endsAt || values.endDate || firstOccurrence?.startsAt || values.date,
           occurrences: values.occurrences,
+          removedOccurrenceIds: savedOccurrenceIdsRef.current.filter((id) => !keptIds.has(id)),
         });
       } finally {
         setIsLoading(false);
@@ -226,7 +237,8 @@ export function AdminEditorModal({
       setIsEditing(null);
       setShowDeleteConfirm(false);
     } catch (err) {
-      console.error(err);
+      console.error('[AdminEditorModal] excluir', err);
+      showToast('Não foi possível excluir o registro.', 'error');
     } finally {
       setIsLoading(false);
     }

=== src/domain/admin/components/subcomponents/AdminItemGrid.tsx — diff ===
@@ -65,7 +65,7 @@ export function AdminItemGrid({
         </div>
       </div>
 
-      {(activeTab === 'items' || activeTab === 'events') && (
+      {activeTab === 'items' && (
         <div
           className="flex gap-2.5 pb-4 overflow-x-auto no-scrollbar -mx-4 px-4"
           id="categories-filter-bar"

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
@@ -137,26 +143,17 @@ export function AdminNotificationsView() {
     <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
       <GlassCard className="p-5 space-y-4">
         <div>
-          <div className="flex items-center justify-between mb-2">
-            <label className="text-[10px] uppercase text-white/50 block">Destinatário</label>
-            {recipientMode === 'multiple' && selectedPartnerIds.length > 0 && (
-              <button
-                type="button"
-                onClick={() => setValue('selectedPartnerIds', [], { shouldValidate: true })}
-                className="text-[10px] text-teal-400 hover:text-teal-300 font-bold tracking-wider uppercase cursor-pointer"
-              >
-                Limpar seleção ({selectedPartnerIds.length})
-              </button>
-            )}
-          </div>
+          <label className="text-[10px] uppercase text-white/50 mb-2 block">Destinatário</label>
           <div className="flex gap-2">
             {(['single', 'multiple', 'all'] as RecipientMode[]).map((mode) => (
               <button
                 key={mode}
                 type="button"
                 onClick={() => {
+                  // A seleção anterior não vale para o novo modo (ex: três marcados em "Vários" e
+                  // depois "Um parceiro" enviaria para os três).
                   setValue('recipientMode', mode, { shouldValidate: true });
-                  setValue('selectedPartnerIds', [], { shouldValidate: true });
+                  setValue('selectedPartnerIds', [], { shouldValidate: false });
                 }}
                 className={`flex-1 min-h-[44px] py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
                   recipientMode === mode
@@ -172,6 +169,9 @@ export function AdminNotificationsView() {
 
         {recipientMode !== 'all' && (
           <div className="max-h-40 overflow-y-auto space-y-1 no-scrollbar border border-white/5 rounded-xl p-2 bg-black/10">
+            {partners.length === 0 && (
+              <p className="p-2 text-xs text-white/60">Nenhum parceiro cadastrado ainda.</p>
+            )}
             {partners.map((partner) => (
               <label
                 key={partner.id}
@@ -217,7 +217,7 @@ export function AdminNotificationsView() {
 
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
-import { Users, CheckCircle, Clock, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
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
@@ -54,77 +79,84 @@ export function AdminPartnersView({
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
-                    ) : partner.status === 'suspended' ? (
-                      <div className="flex items-center gap-1 text-rose-400">
-                        <AlertCircle size={10} />
-                        <span className="text-[8px] font-black uppercase italic">Suspenso</span>
-                      </div>
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
-                {partner.status === 'active'
-                  ? 'Suspender'
-                  : partner.status === 'suspended'
+                {partner.status === 'suspended'
                   ? 'Reativar'
-                  : 'Aprovar'}
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
@@ -33,5 +33,6 @@ export interface AdminPartnerSummary {
   status: 'active' | 'pending' | 'suspended';
   isVerified: boolean;
   verifiedUntil: string | null;
-  verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
+  verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
+  isVerificationSuspended: boolean;
 }

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
-    _verifiedUntil?: string | null,
-    _verificationType?: PartnerVerificationType
-  ): Promise<void> {
+  async updatePartnerVerification(partnerId: string, isVerified: boolean): Promise<void> {
     const res = await firebaseApiFetch(
       '/api/partners/verify',
       {
@@ -119,10 +110,7 @@ export class ApiPartnerAdapter implements PartnerPort {
         headers: {
           'Content-Type': 'application/json',
         },
-        body: JSON.stringify({
-          partnerId,
-          isVerified,
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
-  verifiedUntil?: string | null,
-  verificationType?: PartnerVerificationType
+  isVerified: boolean
 ): Promise<void> {
-  updatePartnerVerificationSchema.parse({
-    partnerId,
-    isVerified,
-    ...(verifiedUntil !== undefined ? { verifiedUntil } : {}),
-    ...(verificationType !== undefined ? { verificationType } : {}),
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

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -51,13 +51,14 @@ export interface PartnerPanelProps {
     itemId: string;
     itemName: string;
     amountMinor: number;
-    onPaymentSuccess: () => Promise<void>;
+    onPaymentSuccess: () => void;
   }) => React.ReactNode;
   renderEventTicketingManager?: (eventListingId: string) => React.ReactNode;
   planSubscriptionSlot?: React.ReactNode;
   renderBookableOffersManager?: (
     items: Array<{ id: string; name: string; category: string }>
   ) => React.ReactNode;
+  /** Chamado ao fechar o checkout depois de um pagamento confirmado, para recarregar o perfil. */
   onPlanPurchased?: () => void;
 }
 
@@ -113,11 +114,17 @@ export function PartnerPanel({
     amountMinor: 0,
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
@@ -590,7 +597,7 @@ export function PartnerPanel({
 
       {renderCheckoutModal?.({
         isOpen: showCheckoutModal,
-        onClose: () => setShowCheckoutModal(false),
+        onClose: handleCheckoutClose,
         itemId: checkoutPlanInfo.itemId,
         itemName: checkoutPlanInfo.itemName,
         amountMinor: checkoutPlanInfo.amountMinor,

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
-    verifiedUntil?: string | null,
-    verificationType?: PartnerVerificationType
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
@@ -341,51 +341,8 @@ export const updatePartnerVerificationSchema = z
   .object({
     partnerId: z.string().min(1),
     isVerified: z.boolean(),
-    verifiedUntil: z
-      .string()
-      .datetime({
-        offset: true,
-      })
-      .nullable()
-      .optional(),
-    verificationType: z.enum(['trial', 'monthly', 'semi-annual', 'annual']).nullable().optional(),
   })
-  .superRefine((data, ctx) => {
-    if (data.isVerified && data.verifiedUntil === undefined && data.verificationType === undefined) {
-      return;
-    }
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
-    if (!data.isVerified && data.verifiedUntil !== null && data.verifiedUntil !== undefined) {
-      ctx.addIssue({
-        code: 'custom',
-        path: ['verifiedUntil'],
-        message: 'verifiedUntil deve ser null quando isVerified=false.',
-      });
-    }
-
-    if (!data.isVerified && data.verificationType !== null && data.verificationType !== undefined) {
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

=== src/domain/payment/utils/formatPlanAmount.ts — diff ===
@@ -6,5 +6,10 @@ export function formatPlanAmount(amountMinor: number, locale: string): string {
 }
 
 export function formatBillingDate(iso: string, locale: string): string {
-  return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date(iso));
+  return new Intl.DateTimeFormat(locale, {
+    timeZone: 'America/Fortaleza',
+    day: '2-digit',
+    month: 'long',
+    year: 'numeric',
+  }).format(new Date(iso));
 }

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros), `npm test` → 136 arquivos, 776 testes, `npm run build`.
Responda no formato do AGENTS.md §16.3.
~~~~
