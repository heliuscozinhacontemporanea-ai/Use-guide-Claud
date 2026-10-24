# Prompt 18.3.1b — Selo do admin por estabelecimento, explicação do selo e "Destaque" nas listas

> Lote 15, gerado do commit de referência `37fe44f` da branch `claude/agents-md-v2`. Aplique depois do 18.3.1a. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.3.1b — Selo do admin por estabelecimento, explicação do selo e "Destaque" (D11)

Última parte das telas da D11.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e as remoções. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

DECISÃO D11 (docs/arquitetura/decisoes.md): o selo é de cada estabelecimento; ao tocar no selo, o app explica "Responsável verificado pelo Use Guide · assinante do plano Use Guide Verificado"; 3 vagas "Destaque" no topo de cada lista, em rodízio diário, e o resto da lista em ordem orgânica (nota, avaliações), com assinantes e não assinantes juntos.

O QUE MUDA:
1) Admin:
   - o selo sai da conta do parceiro: AdminPartnersView sem o botão e as etiquetas de selo, useAdminPartnerActions sem handleToggleVerification, AdminPartnerSummary sem os campos de selo;
   - cada cadastro do grid de itens (exceto dicas) ganha o controle de selo pelo slot renderListingSeal, montado pela AdminPanelComposition; o clique no controle não abre o editor.
2) Domínio partners: setSeal no port e no adapter (PUT /api/listing-plans/:itemId/seal { grant }), setListingSealUseCase e o componente AdminListingSealControl (estado do plano, conceder ou retirar com confirmação). Saem updatePartnerVerificationUseCase (+ teste), updatePartnerVerificationSchema e updatePartnerVerification do port e do adapter da conta.
3) Design system: VerifiedSealButton (o selo vira botão de 44 px que abre a explicação num Popover acima dos modais); Popover aceita zIndex.
4) Domínio guide:
   - os 6 modais de detalhe usam o VerifiedSealButton;
   - utils/listingSeal.ts (isListingSealVisible) confere também a validade do selo nos cards e modais;
   - o catálogo passa a ler featuredListings (leitura pública, já com regra e teste) e utils/featuredOrdering.ts põe as vagas do dia no topo; o resto da lista por nota e avaliações (eventos seguem a data). Sai a ordenação que colocava os verificados primeiro;
   - StandardCard mostra o rótulo "Destaque" na vaga paga;
   - ExploreView dividido (568 → 115 linhas): hooks/usePullToRefresh.ts, hooks/useExploreSections.ts, components/explore/ (ExploreSection, PullRefreshIndicator, exploreSections.ts), sem mudar o visual.
5) i18n: common.seal e common.featured; textos do selo do admin em listingPlanResources.ts; os 3 idiomas.

ARQUIVOS (crie, altere ou apague exatamente estes):
- src/app/compositions/AdminPanelComposition.tsx (alterar)
- src/domain/admin/components/AdminPanel.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminGuideView.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminItemGrid.test.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminItemGrid.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminPartnersView.tsx (alterar)
- src/domain/admin/hooks/useAdminPartnerActions.ts (alterar)
- src/domain/admin/types/admin.ts (alterar)
- src/domain/guide/adapters/firebaseGuideCatalogAdapter.test.ts (alterar)
- src/domain/guide/adapters/firebaseGuideCatalogAdapter.ts (alterar)
- src/domain/guide/components/AttractionDetailModal.tsx (alterar)
- src/domain/guide/components/EventDetailModal.tsx (alterar)
- src/domain/guide/components/ExploreView.tsx (alterar)
- src/domain/guide/components/GridView.tsx (alterar)
- src/domain/guide/components/ItemDetailModal.tsx (alterar)
- src/domain/guide/components/RestaurantDetailModal.tsx (alterar)
- src/domain/guide/components/StandardCard.tsx (alterar)
- src/domain/guide/components/StayDetailModal.tsx (alterar)
- src/domain/guide/components/TourDetailModal.tsx (alterar)
- src/domain/guide/components/explore/ExploreSection.tsx (criar)
- src/domain/guide/components/explore/PullRefreshIndicator.tsx (criar)
- src/domain/guide/components/explore/exploreSections.ts (criar)
- src/domain/guide/hooks/useExploreSections.ts (criar)
- src/domain/guide/hooks/useGuideCatalog.ts (alterar)
- src/domain/guide/hooks/usePullToRefresh.ts (criar)
- src/domain/guide/ports/guideCatalogPort.ts (alterar)
- src/domain/guide/stores/useGuideCatalogStore.ts (alterar)
- src/domain/guide/types/featuredListing.ts (criar)
- src/domain/guide/utils/featuredOrdering.test.ts (criar)
- src/domain/guide/utils/featuredOrdering.ts (criar)
- src/domain/guide/utils/listingSeal.test.ts (criar)
- src/domain/guide/utils/listingSeal.ts (criar)
- src/domain/partners/adapters/apiListingPlanAdapter.test.ts (alterar)
- src/domain/partners/adapters/apiListingPlanAdapter.ts (alterar)
- src/domain/partners/adapters/apiPartnerAdapter.ts (alterar)
- src/domain/partners/application/usecases/setListingSealUseCase.ts (criar)
- src/domain/partners/application/usecases/updatePartnerVerificationUseCase.test.ts (apagar)
- src/domain/partners/application/usecases/updatePartnerVerificationUseCase.ts (apagar)
- src/domain/partners/components/plan/AdminListingSealControl.test.tsx (criar)
- src/domain/partners/components/plan/AdminListingSealControl.tsx (criar)
- src/domain/partners/index.ts (alterar)
- src/domain/partners/ports/listingPlanPort.ts (alterar)
- src/domain/partners/ports/partnerPort.ts (alterar)
- src/domain/partners/schemas/partnerSchema.test.ts (alterar)
- src/domain/partners/schemas/partnerSchema.ts (alterar)
- src/shared/i18n/listingPlanResources.ts (alterar)
- src/shared/i18n/resources.ts (alterar)
- src/ui/components/Popover.tsx (alterar)
- src/ui/components/VerifiedSealButton.test.tsx (criar)
- src/ui/components/VerifiedSealButton.tsx (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== src/app/compositions/AdminPanelComposition.tsx — diff ===
@@ -10,6 +10,7 @@ import {
   updateGuideItemUseCase,
 } from '../../domain/guide';
 import {
+  AdminListingSealControl,
   ListingEditor,
   ListingVerificationQueue,
   type PartnerContentItemInput,
@@ -82,13 +83,14 @@ function AdminListingEditor({ item, onClose }: AdminListingEditorProps) {
 
 /**
  * Painel admin com os editores compartilhados: cadastro (o mesmo do parceiro, decisão D9), fila de
- * verificação dos estabelecimentos (D12), sessões do evento e gerenciador de ingressos.
+ * verificação dos estabelecimentos (D12), selo por estabelecimento (D11), sessões do evento e gerenciador de ingressos.
  */
 export function AdminPanelComposition() {
   return (
     <AdminDispatcher
       renderListingEditor={(props) => <AdminListingEditor {...props} />}
       renderVerificationQueue={() => <ListingVerificationQueue />}
+      renderListingSeal={(item) => <AdminListingSealControl itemId={item.id} name={item.name} />}
       renderSessionsField={(props) => <EventSessionsField {...props} />}
       renderTicketingManager={(eventListingId) => (
         <PartnerEventTicketingManager eventListingId={eventListingId} asAdmin />

=== src/domain/admin/components/AdminPanel.tsx — diff ===
@@ -67,11 +67,14 @@ export interface AdminPanelProps extends AdminEventSlots {
   renderListingEditor?: (props: AdminListingEditorProps) => ReactNode;
   /** Fila de verificação dos estabelecimentos (domínio partners), montada pela composição. */
   renderVerificationQueue?: () => ReactNode;
+  /** Selo de cada estabelecimento (D11, domínio partners), montado pela composição. */
+  renderListingSeal?: (item: GuideItem) => ReactNode;
 }
 
 export function AdminPanel({
   renderListingEditor,
   renderVerificationQueue,
+  renderListingSeal,
   renderSessionsField,
   renderTicketingManager,
 }: AdminPanelProps = {}) {
@@ -143,8 +146,10 @@ export function AdminPanel({
     }
   };
 
-  const { handleToggleVerification, handleToggleStatus, handleDeletePartner } =
-    useAdminPartnerActions({ reloadPartners: fetchPartners, patchPartner, removePartner });
+  const { handleToggleStatus, handleDeletePartner } = useAdminPartnerActions({
+    patchPartner,
+    removePartner,
+  });
 
   const handleSaveRecord = async (editorData: AdminEditorSaveData) => {
     try {
@@ -297,7 +302,6 @@ export function AdminPanel({
                 <AdminPartnersView
                   partners={partners}
                   isLoading={partnersLoading}
-                  onToggleVerification={handleToggleVerification}
                   onToggleStatus={handleToggleStatus}
                   onDeletePartner={handleDeletePartner}
                 />
@@ -341,6 +345,7 @@ export function AdminPanel({
                   });
                 }}
                 onDelete={handleDelete}
+                renderListingSeal={activeTab === 'items' ? renderListingSeal : undefined}
               />
             )}
           </motion.div>

=== src/domain/admin/components/subcomponents/AdminGuideView.tsx — diff ===
@@ -1,3 +1,4 @@
+import type { ReactNode } from 'react';
 import { GuideItem } from '../../../guide';
 import { ErrorState } from '../../../../ui/components/ErrorState';
 import { AdminItemGrid } from './AdminItemGrid';
@@ -21,6 +22,7 @@ interface AdminGuideViewProps {
   onInitNewTip?: () => void;
   onEdit: (item: GuideItem) => void;
   onDelete: (coll: string, id: string) => Promise<void>;
+  renderListingSeal?: (item: GuideItem) => ReactNode;
 }
 
 export function AdminGuideView({
@@ -36,6 +38,7 @@ export function AdminGuideView({
   onInitNewTip,
   onEdit,
   onDelete,
+  renderListingSeal,
 }: AdminGuideViewProps) {
   if (dataError) {
     return (
@@ -57,6 +60,7 @@ export function AdminGuideView({
       onInitNewTip={onInitNewTip}
       onEdit={onEdit}
       onDelete={onDelete}
+      renderListingSeal={renderListingSeal}
     />
   );
 }

=== src/domain/admin/components/subcomponents/AdminItemGrid.test.tsx — diff ===
@@ -34,4 +34,32 @@ describe('AdminItemGrid', () => {
     render(<AdminItemGrid {...baseProps} activeTab="events" onInitNew={vi.fn()} />);
     expect(screen.queryByRole('button', { name: /Nova dica/ })).toBeNull();
   });
+
+  it('selo do estabelecimento abre sem disparar o editor; dicas não têm selo (D11)', () => {
+    const onEdit = vi.fn();
+    const items = [
+      {
+        id: 'item-1',
+        name: 'Pousada Sol',
+        category: 'hotel',
+        description: '',
+        image: '',
+        location: 'jeri',
+      },
+      { id: 'tip-1', name: 'Dica', category: 'tips', description: '', image: '', location: 'jeri' },
+    ];
+    render(
+      <AdminItemGrid
+        {...baseProps}
+        activeTab="items"
+        onInitNew={vi.fn()}
+        filteredItems={items as never}
+        onEdit={onEdit}
+        renderListingSeal={(item) => <button type="button">{`selo ${item.name}`}</button>}
+      />
+    );
+    fireEvent.click(screen.getByRole('button', { name: 'selo Pousada Sol' }));
+    expect(onEdit).not.toHaveBeenCalled();
+    expect(screen.queryByRole('button', { name: 'selo Dica' })).toBeNull();
+  });
 });

=== src/domain/admin/components/subcomponents/AdminItemGrid.tsx — diff ===
@@ -1,3 +1,4 @@
+import type { ReactNode } from 'react';
 import { motion, AnimatePresence } from 'motion/react';
 import { Plus, RefreshCw, Star, MapPin, Edit2, Trash2, Layers } from 'lucide-react';
 import { cn } from '../../../../shared/utils/cn';
@@ -21,6 +22,8 @@ interface AdminItemGridProps {
   onInitNewTip?: () => void;
   onEdit: (item: GuideItem) => void;
   onDelete: (coll: string, id: string) => Promise<void>;
+  /** Selo do estabelecimento (D11); dicas não têm plano. */
+  renderListingSeal?: (item: GuideItem) => ReactNode;
 }
 
 export function AdminItemGrid({
@@ -34,6 +37,7 @@ export function AdminItemGrid({
   onInitNewTip,
   onEdit,
   onDelete,
+  renderListingSeal,
 }: AdminItemGridProps) {
   return (
     <div className="space-y-6" id="items-grid-viewport">
@@ -213,6 +217,16 @@ export function AdminItemGrid({
                           </button>
                         </div>
                       </div>
+                      {renderListingSeal && item.category !== 'tips' && (
+                        // O cartão abre o editor: clique e teclado do selo não sobem até ele.
+                        <div
+                          className="mt-2"
+                          onClick={(event) => event.stopPropagation()}
+                          onKeyDown={(event) => event.stopPropagation()}
+                        >
+                          {renderListingSeal(item)}
+                        </div>
+                      )}
                     </div>
                   </div>
                 </motion.div>

=== src/domain/admin/components/subcomponents/AdminPartnersView.tsx — diff ===
@@ -1,6 +1,5 @@
 import { Users, CheckCircle, Clock, Trash2, RefreshCw, Ban } from 'lucide-react';
 import { cn } from '../../../../shared/utils/cn';
-import { VerifiedBadge } from '../../../../ui/components/VerifiedBadge';
 import { AdminPartnerSummary } from '../../types/admin';
 
 const STATUS_BADGE: Record<
@@ -11,26 +10,12 @@ const STATUS_BADGE: Record<
   suspended: { label: 'Suspenso', className: 'text-rose-400', icon: Ban },
 };
 
-const PLAN_LABEL: Record<NonNullable<AdminPartnerSummary['verificationType']>, string> = {
-  trial: 'Teste grátis',
-  monthly: 'Plano mensal',
-  'semi-annual': 'Plano semestral',
-  annual: 'Plano anual',
-  admin: 'Selo concedido pelo admin',
-};
-
-/** Selo visível para o público: verificado e não suspenso pelo admin. */
-function hasVisibleSeal(partner: AdminPartnerSummary): boolean {
-  return partner.isVerified && !partner.isVerificationSuspended;
-}
-
 const ROW_BUTTON =
   'flex-1 sm:flex-none min-h-[44px] px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50';
 
 interface AdminPartnersViewProps {
   partners: AdminPartnerSummary[];
   isLoading: boolean;
-  onToggleVerification: (partner: AdminPartnerSummary) => Promise<void>;
   onToggleStatus: (partner: AdminPartnerSummary) => Promise<void>;
   onDeletePartner: (partner: AdminPartnerSummary) => Promise<void>;
 }
@@ -38,7 +23,6 @@ interface AdminPartnersViewProps {
 export function AdminPartnersView({
   partners,
   isLoading,
-  onToggleVerification,
   onToggleStatus,
   onDeletePartner,
 }: AdminPartnersViewProps) {
@@ -95,42 +79,11 @@ export function AdminPartnersView({
                       </div>
                     );
                   })()}
-                  {hasVisibleSeal(partner) && (
-                    <div className="flex items-center gap-1 text-blue-400">
-                      <VerifiedBadge size="sm" />
-                      <span className="text-[8px] font-black uppercase italic">Verificado</span>
-                    </div>
-                  )}
-                  {partner.isVerified && partner.verificationType && (
-                    <span className="text-[8px] font-black uppercase text-white/60">
-                      {PLAN_LABEL[partner.verificationType]}
-                      {partner.verifiedUntil &&
-                        ` até ${new Intl.DateTimeFormat('pt-BR', {
-                          timeZone: 'America/Fortaleza',
-                          dateStyle: 'short',
-                        }).format(new Date(partner.verifiedUntil))}`}
-                      {partner.isVerificationSuspended && ' · selo suspenso'}
-                    </span>
-                  )}
                 </div>
               </div>
             </div>
 
             <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
-              <button
-                type="button"
-                onClick={() => onToggleVerification(partner)}
-                className={cn(
-                  ROW_BUTTON,
-                  hasVisibleSeal(partner)
-                    ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-black'
-                    : 'bg-blue-500 text-black'
-                )}
-                id={`btn-verify-${partner.id}`}
-              >
-                {hasVisibleSeal(partner) ? 'Retirar selo' : 'Conceder selo'}
-              </button>
-
               <button
                 type="button"
                 onClick={() => onToggleStatus(partner)}

=== src/domain/admin/hooks/useAdminPartnerActions.ts — diff ===
@@ -1,40 +1,18 @@
 import { useUI } from '../../../shared/stores/useUIStore';
-import {
-  deletePartnerProfileUseCase,
-  updatePartnerStatusUseCase,
-  updatePartnerVerificationUseCase,
-} from '../../partners';
+import { deletePartnerProfileUseCase, updatePartnerStatusUseCase } from '../../partners';
 import type { AdminPartnerSummary } from '../types/admin';
 
 interface UseAdminPartnerActionsParams {
-  reloadPartners: () => Promise<void>;
   patchPartner: (id: string, patch: Partial<AdminPartnerSummary>) => void;
   removePartner: (id: string) => void;
 }
 
 export function useAdminPartnerActions({
-  reloadPartners,
   patchPartner,
   removePartner,
 }: UseAdminPartnerActionsParams) {
   const { showToast, confirmAction } = useUI();
 
-  const handleToggleVerification = async (partner: AdminPartnerSummary) => {
-    const hasSeal = partner.isVerified && !partner.isVerificationSuspended;
-    const message = hasSeal
-      ? `Retirar o selo de verificação de ${partner.businessName}? Um plano pago em vigor é mantido; só o selo deixa de aparecer.`
-      : `Conceder o selo de verificação a ${partner.businessName}? Um plano pago em vigor não é alterado.`;
-    if (!(await confirmAction(message))) return;
-    try {
-      await updatePartnerVerificationUseCase(partner.id, !hasSeal);
-      showToast(hasSeal ? 'Selo retirado.' : 'Selo concedido.', 'success');
-      // Tipo e validade do selo são decididos pelo servidor; a lista é recarregada para refleti-los.
-      await reloadPartners();
-    } catch {
-      showToast('Erro ao atualizar verificação', 'error');
-    }
-  };
-
   const handleToggleStatus = async (partner: AdminPartnerSummary) => {
     const newStatus = partner.status === 'active' ? 'suspended' : 'active';
     const message =
@@ -69,5 +47,5 @@ export function useAdminPartnerActions({
     }
   };
 
-  return { handleToggleVerification, handleToggleStatus, handleDeletePartner };
+  return { handleToggleStatus, handleDeletePartner };
 }

=== src/domain/admin/types/admin.ts — diff ===
@@ -31,8 +31,4 @@ export interface AdminPartnerSummary {
   email: string;
   listingsCount: number;
   status: 'active' | 'suspended';
-  isVerified: boolean;
-  verifiedUntil: string | null;
-  verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
-  isVerificationSuspended: boolean;
 }

=== src/domain/guide/adapters/firebaseGuideCatalogAdapter.test.ts — diff ===
@@ -1,5 +1,5 @@
 import { describe, expect, it, vi } from 'vitest';
-import { isActiveEvent, mapGuideItem } from './firebaseGuideCatalogAdapter';
+import { isActiveEvent, mapGuideItem, toFeaturedListings } from './firebaseGuideCatalogAdapter';
 
 describe('isActiveEvent', () => {
   it('rejeita evento sem data', () => {
@@ -156,3 +156,16 @@ describe('FirebaseGuideCatalogAdapter realtime', () => {
     expect(unsubscribeEvents).toHaveBeenCalledTimes(1);
   });
 });
+
+describe('toFeaturedListings (D11)', () => {
+  it('monta as vagas por lista e ignora registro malformado', () => {
+    expect(
+      toFeaturedListings([
+        { list: 'hotel', listingIds: ['h1', 'h2', 3] },
+        { list: 'events', listingIds: ['e1'] },
+        { listingIds: ['x'] },
+        { list: 'tour', listingIds: 'nao-e-lista' },
+      ])
+    ).toEqual({ hotel: ['h1', 'h2'], events: ['e1'] });
+  });
+});

=== src/domain/guide/adapters/firebaseGuideCatalogAdapter.ts — diff ===
@@ -1,4 +1,5 @@
 import { subscribeToCollectionUseCase } from '../../database';
+import type { FeaturedListings } from '../types/featuredListing';
 import { GuideCatalogPort, GuideCatalogSnapshot } from '../ports/guideCatalogPort';
 import { GuideItem } from '../types/guide';
 
@@ -86,6 +87,22 @@ export function isActiveEvent(event: GuideItem): boolean {
   return end >= Date.now();
 }
 
+// Uma projeção por lista (7 hoje); o limite só protege a escuta (AGENTS.md §6.4).
+const FEATURED_LISTS_LIMIT = 20;
+
+export function toFeaturedListings(
+  records: Array<{ list?: string; listingIds?: unknown }>
+): FeaturedListings {
+  const featured: FeaturedListings = {};
+  for (const record of records) {
+    if (typeof record.list !== 'string' || !Array.isArray(record.listingIds)) continue;
+    featured[record.list as keyof FeaturedListings] = record.listingIds.filter(
+      (id): id is string => typeof id === 'string'
+    );
+  }
+  return featured;
+}
+
 export class FirebaseGuideCatalogAdapter implements GuideCatalogPort {
   subscribe(
     onUpdate: (snapshot: GuideCatalogSnapshot) => void,
@@ -93,11 +110,13 @@ export class FirebaseGuideCatalogAdapter implements GuideCatalogPort {
   ): () => void {
     let items: GuideItem[] = [];
     let events: GuideItem[] = [];
+    let featured: FeaturedListings = {};
 
     const emit = () => {
       onUpdate({
         items,
         events,
+        featured,
       });
     };
 
@@ -138,9 +157,30 @@ export class FirebaseGuideCatalogAdapter implements GuideCatalogPort {
       ]
     );
 
+    // Destaque é complemento da lista: se a leitura falhar, o catálogo segue sem as vagas.
+    const unsubscribeFeatured = subscribeToCollectionUseCase<{
+      list?: string;
+      listingIds?: unknown;
+    }>(
+      'featuredListings',
+      (records) => {
+        featured = toFeaturedListings(records);
+        emit();
+      },
+      (error) => {
+        console.error('[FirebaseGuideCatalogAdapter.featured]', error);
+        featured = {};
+        emit();
+      },
+      undefined,
+      undefined,
+      FEATURED_LISTS_LIMIT
+    );
+
     return () => {
       unsubscribeItems();
       unsubscribeEvents();
+      unsubscribeFeatured();
     };
   }
 }

=== src/domain/guide/components/AttractionDetailModal.tsx — diff ===
@@ -1,4 +1,5 @@
 import React, { useState, useEffect } from 'react';
+import { isListingSealVisible } from '../utils/listingSeal';
 import { motion } from 'motion/react';
 import { X, Star, MapPin, ExternalLink } from 'lucide-react';
 import { GlassCard } from '../../../ui/components/GlassCard';
@@ -9,7 +10,7 @@ import { GuideItem } from '../types/guide';
 import { ReviewSection } from '../../reviews';
 import { optimizeImage } from '../../../shared/utils/formatters';
 import { cn } from '../../../shared/utils/cn';
-import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
+import { VerifiedSealButton } from '../../../ui/components/VerifiedSealButton';
 import { trackInteractionUseCase as trackInteraction } from '../../insights';
 import { FavoriteButton } from '../../favorites/components/FavoriteButton';
 import { ShareButton } from '../../../ui/components/ShareButton';
@@ -157,7 +158,7 @@ export function AttractionDetailModal({ item, onClose, bookingPanel }: Attractio
           <div className="space-y-1 font-display">
             <h2 className="text-3xl font-display font-black text-white leading-tight flex items-center gap-2 flex-wrap mb-1">
               {item.name}
-              {item.isVerified && !item.isVerificationSuspended && <VerifiedBadge size="md" />}
+              {isListingSealVisible(item) && <VerifiedSealButton size="md" />}
             </h2>
             <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
               <MapPin size={16} />

=== src/domain/guide/components/EventDetailModal.tsx — diff ===
@@ -1,4 +1,5 @@
-import React, { useState, useEffect } from 'react';
+import { useState, useEffect } from 'react';
+import { isListingSealVisible } from '../utils/listingSeal';
 import { motion } from 'motion/react';
 import { X, Star, MapPin, Calendar, MessageCircle } from 'lucide-react';
 import { GlassCard } from '../../../ui/components/GlassCard';
@@ -11,7 +12,7 @@ import { useAuthContext } from '../../auth/context/AuthContext';
 import { useUI } from '../../../shared/stores/useUIStore';
 import { optimizeImage } from '../../../shared/utils/formatters';
 import { cn } from '../../../shared/utils/cn';
-import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
+import { VerifiedSealButton } from '../../../ui/components/VerifiedSealButton';
 import { trackInteractionUseCase as trackInteraction } from '../../insights';
 import { FavoriteButton } from '../../favorites/components/FavoriteButton';
 import { ShareButton } from '../../../ui/components/ShareButton';
@@ -169,7 +170,7 @@ export function EventDetailModal({ item, onClose }: EventDetailModalProps) {
           <div className="space-y-1 font-display">
             <h2 className="text-3xl font-display font-black text-white leading-tight flex items-center gap-2 flex-wrap mb-1">
               {item.name}
-              {item.isVerified && !item.isVerificationSuspended && <VerifiedBadge size="md" />}
+              {isListingSealVisible(item) && <VerifiedSealButton size="md" />}
             </h2>
             <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
               <MapPin size={16} />
@@ -246,8 +247,8 @@ export function EventDetailModal({ item, onClose }: EventDetailModalProps) {
               )}
           </div>
           <p className="text-xs text-white/60">
-            Somente participantes com ingresso emitido e check-in realizado podem avaliar a sessão do
-            evento após sua conclusão.
+            Somente participantes com ingresso emitido e check-in realizado podem avaliar a sessão
+            do evento após sua conclusão.
           </p>
         </GlassCard>
         <div className="h-20" />

=== src/domain/guide/components/ExploreView.tsx — diff ===
@@ -1,16 +1,15 @@
-import { useState, useMemo, useEffect, useRef } from 'react';
+import { Search } from 'lucide-react';
+import { useMemo, useState } from 'react';
 import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
-import { SectionTitle } from './SectionTitle';
-import { StandardCard } from './StandardCard';
 import { LiveConditions } from '../../climawind/components/LiveConditions';
-import { Skeleton } from '../../../ui/components/Skeleton';
-import { ErrorState } from '../../../ui/components/ErrorState';
-import { GuideItem } from '../types/guide';
+import { FilterBar } from '../../search';
+import { useExploreSections } from '../hooks/useExploreSections';
 import { useGuideCatalog } from '../hooks/useGuideCatalog';
-import { cn } from '../../../shared/utils/cn';
-import { Search } from 'lucide-react';
-import { FilterBar, filterItemsList } from '../../search';
-import { Z_INDEX } from '../../../shared/constants/zIndex';
+import { usePullToRefresh } from '../hooks/usePullToRefresh';
+import type { GuideItem } from '../types/guide';
+import { ExploreSection } from './explore/ExploreSection';
+import { EXPLORE_SECTIONS } from './explore/exploreSections';
+import { PullRefreshIndicator } from './explore/PullRefreshIndicator';
 
 interface ExploreViewProps {
   onSelectItem: (item: GuideItem) => void;
@@ -19,195 +18,25 @@ interface ExploreViewProps {
 
 export function ExploreView({ onSelectItem, onStickyChange }: ExploreViewProps) {
   const { goTo } = useLocalizedRouting();
-  const { items: dbItems, events: dbEvents, loading, error, retry } = useGuideCatalog();
+  const { items, events, featured, loading, error, retry } = useGuideCatalog();
+  const { pullDistance, isPulling, isRefreshing } = usePullToRefresh();
 
   const [searchQuery, setSearchQuery] = useState('');
-
-  // Estados e refs para o Pull-to-Refresh
-  const [pullDistance, setPullDistance] = useState(0);
-  const [isPulling, setIsPulling] = useState(false);
-  const [isRefreshing, setIsRefreshing] = useState(false);
-
-  const startYRef = useRef<number | null>(null);
-  const startXRef = useRef<number | null>(null);
-  const isPullingRef = useRef(false);
-  const isMouseActiveRef = useRef(false);
-
-  useEffect(() => {
-    const scrollContainer = document.querySelector('.overflow-y-auto');
-    if (!scrollContainer) return;
-
-    const handleStart = (clientY: number, clientX: number, isMouse: boolean) => {
-      if (isRefreshing) return;
-      if (
-        document.documentElement.classList.contains('scroll-locked') ||
-        (scrollContainer as HTMLElement).style.overflowY === 'hidden'
-      )
-        return;
-
-      // Só inicia se estiver no topo absoluto da rolagem (scrollTop <= 0)
-      if (scrollContainer.scrollTop <= 0) {
-        startYRef.current = clientY;
-        startXRef.current = clientX;
-        isPullingRef.current = true;
-        isMouseActiveRef.current = isMouse;
-      }
-    };
-
-    const handleMove = (clientY: number, clientX: number, e: TouchEvent | MouseEvent) => {
-      if (!isPullingRef.current || isRefreshing) return;
-      if (startYRef.current === null || startXRef.current === null) return;
-
-      const deltaY = clientY - startYRef.current;
-      const deltaX = clientX - startXRef.current;
-
-      // Se mover horizontalmente mais do que verticalmente, cancela o puxão
-      // Isso evita acidentes ao arrastar carrosséis de banners
-      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
-        isPullingRef.current = false;
-        setIsPulling(false);
-        setPullDistance(0);
-        return;
-      }
-
-      if (deltaY > 0) {
-        if (scrollContainer.scrollTop <= 0) {
-          if (e.cancelable) {
-            e.preventDefault();
-          }
-          // Resistência elástica amortecida
-          const distance = Math.min(deltaY * 0.42, 120);
-          setPullDistance(distance);
-          setIsPulling(true);
-        }
-      } else {
-        setPullDistance(0);
-        setIsPulling(false);
-      }
-    };
-
-    const handleEnd = () => {
-      if (!isPullingRef.current || isRefreshing) return;
-      isPullingRef.current = false;
-      isMouseActiveRef.current = false;
-
-      const threshold = 76; // Círculo se forma por completo com 76px de puxão
-      if (pullDistance >= threshold) {
-        // Dispara o reload um pouco depois para o sumiço visual terminar
-        setTimeout(() => {
-          window.location.reload();
-        }, 150);
-
-        // Zera o estado para o círculo sumir instantaneamente com transição elástica ao soltar
-        setPullDistance(0);
-        setIsPulling(false);
-        setIsRefreshing(false);
-      } else {
-        // Retorno elástico suave à posição inicial
-        const current = pullDistance;
-        const duration = 200;
-        const startTime = performance.now();
-
-        const animateBack = (time: number) => {
-          const elapsed = time - startTime;
-          const pct = Math.min(elapsed / duration, 1);
-          const ease = 1 - Math.pow(1 - pct, 3); // ease-out cubic
-          const val = current * (1 - ease);
-
-          if (pct < 1) {
-            setPullDistance(val);
-            requestAnimationFrame(animateBack);
-          } else {
-            setPullDistance(0);
-            setIsPulling(false);
-          }
-        };
-        requestAnimationFrame(animateBack);
-      }
-    };
-
-    const onTouchStart = (e: TouchEvent) => {
-      const touch = e.touches[0];
-      if (!touch) return;
-      handleStart(touch.clientY, touch.clientX, false);
-    };
-
-    const onTouchMove = (e: TouchEvent) => {
-      const touch = e.touches[0];
-      if (!touch) return;
-      handleMove(touch.clientY, touch.clientX, e);
-    };
-
-    const onTouchEnd = () => {
-      handleEnd();
-    };
-
-    const onMouseDown = (e: MouseEvent) => {
-      if (e.button !== 0) return; // Apenas clique esquerdo
-      handleStart(e.clientY, e.clientX, true);
-    };
-
-    const onMouseMove = (e: MouseEvent) => {
-      if (!isMouseActiveRef.current) return;
-      handleMove(e.clientY, e.clientX, e);
-    };
-
-    const onMouseUp = () => {
-      if (isMouseActiveRef.current) {
-        handleEnd();
-      }
-    };
-
-    scrollContainer.addEventListener('touchstart', onTouchStart as any, { passive: true });
-    scrollContainer.addEventListener('touchmove', onTouchMove as any, { passive: false });
-    scrollContainer.addEventListener('touchend', onTouchEnd as any, { passive: true });
-
-    scrollContainer.addEventListener('mousedown', onMouseDown as any, { passive: true });
-    window.addEventListener('mousemove', onMouseMove as any, { passive: false });
-    window.addEventListener('mouseup', onMouseUp as any, { passive: true });
-
-    return () => {
-      scrollContainer.removeEventListener('touchstart', onTouchStart as any);
-      scrollContainer.removeEventListener('touchmove', onTouchMove as any);
-      scrollContainer.removeEventListener('touchend', onTouchEnd as any);
-
-      scrollContainer.removeEventListener('mousedown', onMouseDown as any);
-      window.removeEventListener('mousemove', onMouseMove as any);
-      window.removeEventListener('mouseup', onMouseUp as any);
-    };
-  }, [pullDistance, isRefreshing]);
-
   const [appliedRegions, setAppliedRegions] = useState<string[]>([]);
   const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
 
-  const sections = useMemo(() => {
-    const filterByCategory = (dbData: GuideItem[], category: GuideItem['category']) => {
-      if (appliedCategories.length > 0 && !appliedCategories.includes(category)) {
-        return [];
-      }
-      const filtered = filterItemsList(dbData, searchQuery, appliedRegions);
-      return filtered
-        .filter((item) => item.category === category)
-        .sort((a, b) => {
-          const isAVerified = !!(a.isVerified && !a.isVerificationSuspended);
-          const isBVerified = !!(b.isVerified && !b.isVerificationSuspended);
-          if (isAVerified === isBVerified) return 0;
-          return isAVerified ? -1 : 1;
-        })
-        .slice(0, 10);
-    };
-
-    return {
-      events: filterByCategory(dbEvents, 'event'),
-      hotels: filterByCategory(dbItems, 'hotel'),
-      restaurants: filterByCategory(dbItems, 'restaurant'),
-      tours: filterByCategory(dbItems, 'tour'),
-      transfers: filterByCategory(dbItems, 'transfer'),
-      rentals: filterByCategory(dbItems, 'rental'),
-      sights: filterByCategory(dbItems, 'sight'),
-      tips: filterByCategory(dbItems, 'tips'),
-    };
-  }, [searchQuery, appliedRegions, appliedCategories, dbEvents, dbItems]);
+  const sectionFor = useExploreSections({
+    items,
+    events,
+    featured,
+    searchQuery,
+    appliedRegions,
+    appliedCategories,
+  });
+  const sections = useMemo(
+    () => EXPLORE_SECTIONS.map((config) => ({ config, ...sectionFor(config.category) })),
+    [sectionFor]
+  );
 
   const transformStyle =
     pullDistance > 0
@@ -219,78 +48,15 @@ export function ExploreView({ onSelectItem, onStickyChange }: ExploreViewProps)
 
   const hasActiveFiltersOrSearch =
     searchQuery.trim().length > 0 || appliedRegions.length > 0 || appliedCategories.length > 0;
-  const hasAnyResults =
-    sections.events.length > 0 ||
-    sections.hotels.length > 0 ||
-    sections.restaurants.length > 0 ||
-    sections.tours.length > 0 ||
-    sections.transfers.length > 0 ||
-    sections.rentals.length > 0 ||
-    sections.sights.length > 0 ||
-    sections.tips.length > 0;
+  const hasAnyResults = sections.some((section) => section.items.length > 0);
 
   return (
     <>
-      {(pullDistance >= 20 || isRefreshing) && (
-        <div
-          className="fixed left-0 right-0 pointer-events-none select-none flex justify-center"
-          style={{
-            zIndex: Z_INDEX.toast,
-            top: isRefreshing ? '84px' : `${54 + pullDistance * 0.45}px`,
-            opacity: isRefreshing ? 1 : Math.min((pullDistance - 20) / 36, 1),
-            transform: `scale(${isRefreshing ? 1 : Math.min(0.5 + (pullDistance / 76) * 0.5, 1)})`,
-            transition: isPulling
-              ? 'none'
-              : 'top 200ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 200ms, transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
-          }}
-        >
-          <div
-            className={cn(
-              'w-11 h-11 rounded-full backdrop-blur-xl flex items-center justify-center relative transition-all duration-300',
-              pullDistance >= 76
-                ? 'bg-white/25 border border-white/40 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
-                : 'bg-white/10 border border-white/20 shadow-md'
-            )}
-            style={{
-              maskImage: 'radial-gradient(circle, transparent 52%, black 53%)',
-              WebkitMaskImage: 'radial-gradient(circle, transparent 52%, black 53%)',
-            }}
-          >
-            <svg
-              className={cn(
-                'w-8 h-8 transform -rotate-90 origin-center absolute',
-                isRefreshing && 'animate-spin'
-              )}
-              viewBox="0 0 36 36"
-            >
-              <circle
-                cx="18"
-                cy="18"
-                r="13"
-                fill="none"
-                className="stroke-white/5"
-                strokeWidth="2.5"
-              />
-              <circle
-                cx="18"
-                cy="18"
-                r="13"
-                fill="none"
-                className={cn(
-                  'transition-all duration-300',
-                  pullDistance >= 76
-                    ? 'stroke-indigo-400 drop-shadow-[0_0_6px_rgba(129,140,248,0.9)]'
-                    : 'stroke-indigo-300/70'
-                )}
-                strokeWidth="2.5"
-                strokeDasharray={isRefreshing ? '22 60' : '81.68'} // 2 * pi * r = 2 * 3.14159 * 13 ≈ 81.68
-                strokeDashoffset={isRefreshing ? 0 : 81.68 - 81.68 * Math.min(pullDistance / 76, 1)}
-                strokeLinecap="round"
-              />
-            </svg>
-          </div>
-        </div>
-      )}
+      <PullRefreshIndicator
+        pullDistance={pullDistance}
+        isPulling={isPulling}
+        isRefreshing={isRefreshing}
+      />
 
       <div className="space-y-4 pb-32 relative z-10" style={transformStyle}>
         <div className="px-10 mb-1 mt-0">
@@ -308,242 +74,26 @@ export function ExploreView({ onSelectItem, onStickyChange }: ExploreViewProps)
           onStickyChange={onStickyChange}
         />
 
-        {(appliedCategories.length === 0 || appliedCategories.includes('event')) &&
-          (!hasActiveFiltersOrSearch || sections.events.length > 0) && (
-            <>
-              <SectionTitle title="Próximos Eventos" onSeeAll={() => goTo('events')} />
-              <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
-                {error ? (
-                  <ErrorState message={error} onRetry={retry} />
-                ) : loading ? (
-                  [1, 2, 3].map((i) => (
-                    <div key={i} className="min-w-[90vw] md:min-w-[700px] snap-center">
-                      <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
-                    </div>
-                  ))
-                ) : (
-                  sections.events
-                    .slice(0, 10)
-                    .map((item) => (
-                      <StandardCard
-                        key={item.id}
-                        item={item}
-                        variant="banner"
-                        onClick={() => onSelectItem(item)}
-                      />
-                    ))
-                )}
-                {!loading && !error && sections.events.length === 0 && (
-                  <div className="flex-1 text-center py-12 text-white/50 font-medium">
-                    Nenhum evento agendado.
-                  </div>
-                )}
-              </div>
-            </>
-          )}
-
-        {(appliedCategories.length === 0 || appliedCategories.includes('restaurant')) &&
-          (!hasActiveFiltersOrSearch || sections.restaurants.length > 0) && (
-            <>
-              <SectionTitle title="Sabores Locais" onSeeAll={() => goTo('restaurants')} />
-              <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
-                {error ? (
-                  <ErrorState message={error} onRetry={retry} />
-                ) : loading ? (
-                  [1, 2, 3].map((i) => (
-                    <div key={i} className="min-w-[280px] snap-center">
-                      <Skeleton className="aspect-square w-full rounded-3xl" />
-                    </div>
-                  ))
-                ) : (
-                  sections.restaurants
-                    .slice(0, 10)
-                    .map((item) => (
-                      <StandardCard
-                        key={item.id}
-                        item={item}
-                        variant="square"
-                        onClick={() => onSelectItem(item)}
-                      />
-                    ))
-                )}
-              </div>
-            </>
-          )}
-
-        {(appliedCategories.length === 0 || appliedCategories.includes('hotel')) &&
-          (!hasActiveFiltersOrSearch || sections.hotels.length > 0) && (
-            <>
-              <SectionTitle title="Hospedagem" onSeeAll={() => goTo('stays')} />
-              <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
-                {error ? (
-                  <ErrorState message={error} onRetry={retry} />
-                ) : loading ? (
-                  [1, 2, 3].map((i) => (
-                    <div key={i} className="min-w-[280px] snap-center">
-                      <Skeleton className="aspect-[3/4] w-full rounded-3xl" />
-                    </div>
-                  ))
-                ) : (
-                  sections.hotels
-                    .slice(0, 10)
-                    .map((item) => (
-                      <StandardCard
-                        key={item.id}
-                        item={item}
-                        variant="portrait"
-                        onClick={() => onSelectItem(item)}
-                      />
-                    ))
-                )}
-              </div>
-            </>
-          )}
-
-        {(appliedCategories.length === 0 || appliedCategories.includes('tour')) &&
-          (!hasActiveFiltersOrSearch || sections.tours.length > 0) && (
-            <>
-              <SectionTitle title="Aventura & Passeios" onSeeAll={() => goTo('tours')} />
-              <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
-                {error ? (
-                  <ErrorState message={error} onRetry={retry} />
-                ) : loading ? (
-                  [1, 2, 3].map((i) => (
-                    <div key={i} className="min-w-[300px] snap-center">
-                      <Skeleton className="aspect-video w-full rounded-3xl" />
-                    </div>
-                  ))
-                ) : (
-                  sections.tours
-                    .slice(0, 10)
-                    .map((item) => (
-                      <StandardCard
-                        key={item.id}
-                        item={item}
-                        variant="landscape"
-                        onClick={() => onSelectItem(item)}
-                      />
-                    ))
-                )}
-              </div>
-            </>
-          )}
-
-        {(appliedCategories.length === 0 || appliedCategories.includes('transfer')) &&
-          (!hasActiveFiltersOrSearch || sections.transfers.length > 0) && (
-            <>
-              <SectionTitle title="Translados & Transporte" onSeeAll={() => goTo('transfers')} />
-              <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
-                {error ? (
-                  <ErrorState message={error} onRetry={retry} />
-                ) : loading ? (
-                  [1, 2, 3].map((i) => (
-                    <div key={i} className="min-w-[300px] snap-center">
-                      <Skeleton className="aspect-video w-full rounded-3xl" />
-                    </div>
-                  ))
-                ) : (
-                  sections.transfers
-                    .slice(0, 10)
-                    .map((item) => (
-                      <StandardCard
-                        key={item.id}
-                        item={item}
-                        variant="landscape"
-                        onClick={() => onSelectItem(item)}
-                      />
-                    ))
-                )}
-              </div>
-            </>
-          )}
-
-        {(appliedCategories.length === 0 || appliedCategories.includes('rental')) &&
-          (!hasActiveFiltersOrSearch || sections.rentals.length > 0) && (
-            <>
-              <SectionTitle title="Aluguéis" onSeeAll={() => goTo('rentals')} />
-              <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
-                {error ? (
-                  <ErrorState message={error} onRetry={retry} />
-                ) : loading ? (
-                  [1, 2, 3].map((i) => (
-                    <div key={i} className="min-w-[300px] snap-center">
-                      <Skeleton className="aspect-video w-full rounded-3xl" />
-                    </div>
-                  ))
-                ) : (
-                  sections.rentals
-                    .slice(0, 10)
-                    .map((item) => (
-                      <StandardCard
-                        key={item.id}
-                        item={item}
-                        variant="landscape"
-                        onClick={() => onSelectItem(item)}
-                      />
-                    ))
-                )}
-              </div>
-            </>
-          )}
-
-        {(appliedCategories.length === 0 || appliedCategories.includes('sight')) &&
-          (!hasActiveFiltersOrSearch || sections.sights.length > 0) && (
-            <>
-              <SectionTitle title="Atrações" onSeeAll={() => goTo('attractions')} />
-              <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
-                {error ? (
-                  <ErrorState message={error} onRetry={retry} />
-                ) : loading ? (
-                  [1, 2, 3].map((i) => (
-                    <div key={i} className="min-w-[280px] snap-center">
-                      <Skeleton className="aspect-square w-full rounded-full" />
-                    </div>
-                  ))
-                ) : (
-                  sections.sights
-                    .slice(0, 10)
-                    .map((item) => (
-                      <StandardCard
-                        key={item.id}
-                        item={item}
-                        variant="square"
-                        onClick={() => onSelectItem(item)}
-                      />
-                    ))
-                )}
-              </div>
-            </>
-          )}
-
-        {(appliedCategories.length === 0 || appliedCategories.includes('tips')) &&
-          (!hasActiveFiltersOrSearch || sections.tips.length > 0) && (
-            <>
-              <SectionTitle title="Guia Prático" onSeeAll={() => goTo('guide')} />
-              <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
-                {error ? (
-                  <ErrorState message={error} onRetry={retry} />
-                ) : loading ? (
-                  [1, 2, 3].map((i) => (
-                    <div key={i} className="min-w-[280px] snap-center">
-                      <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
-                    </div>
-                  ))
-                ) : (
-                  sections.tips
-                    .slice(0, 10)
-                    .map((item) => (
-                      <StandardCard
-                        key={item.id}
-                        item={item}
-                        variant="landscape"
-                        onClick={() => onSelectItem(item)}
-                      />
-                    ))
-                )}
-              </div>
-            </>
-          )}
+        {sections.map(({ config, items: sectionItems, featuredIds }) =>
+          (appliedCategories.length === 0 || appliedCategories.includes(config.category)) &&
+          (!hasActiveFiltersOrSearch || sectionItems.length > 0) ? (
+            <ExploreSection
+              key={config.category}
+              title={config.title}
+              onSeeAll={() => goTo(config.route)}
+              items={sectionItems}
+              featuredIds={featuredIds}
+              variant={config.variant}
+              skeletonWrapClassName={config.skeletonWrapClassName}
+              skeletonClassName={config.skeletonClassName}
+              loading={loading}
+              error={error}
+              onRetry={retry}
+              onSelectItem={onSelectItem}
+              emptyMessage={config.emptyMessage}
+            />
+          ) : null
+        )}
 
         {hasActiveFiltersOrSearch && !hasAnyResults && !loading && !error && (
           <div className="mx-10 py-12 px-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center text-center shadow-lg animate-fade-in">

=== src/domain/guide/components/GridView.tsx — diff ===
@@ -3,7 +3,8 @@ import { StandardCard } from './StandardCard';
 import { GridItemSkeleton, Skeleton } from '../../../ui/components/Skeleton';
 import { GuideItem } from '../types/guide';
 import { useGuideCatalog } from '../hooks/useGuideCatalog';
-import { cn } from '../../../shared/utils/cn';
+import { featuredListKeyOf } from '../types/featuredListing';
+import { orderWithFeatured } from '../utils/featuredOrdering';
 
 interface GridViewProps {
   category: GuideItem['category'];
@@ -11,20 +12,21 @@ interface GridViewProps {
 }
 
 export function GridView({ category, onSelectItem }: GridViewProps) {
-  const { events: dbEvents, items: dbItems, loading } = useGuideCatalog();
+  const { events: dbEvents, items: dbItems, featured, loading } = useGuideCatalog();
 
-  const items = useMemo(() => {
+  const { items, featuredIds } = useMemo(() => {
     const rawItems =
       category === 'event'
         ? dbEvents
         : dbItems.filter((item: GuideItem) => item.category === category);
-    return [...rawItems].sort((a, b) => {
-      const isAVerified = !!(a.isVerified && !a.isVerificationSuspended);
-      const isBVerified = !!(b.isVerified && !b.isVerificationSuspended);
-      if (isAVerified === isBVerified) return 0;
-      return isAVerified ? -1 : 1;
-    });
-  }, [category, dbEvents, dbItems]);
+    const listKey = featuredListKeyOf(category);
+    // Eventos seguem a ordem de data do catálogo; as outras listas, nota e avaliações (D11).
+    return orderWithFeatured(
+      rawItems,
+      listKey ? featured[listKey] : [],
+      category === 'event' ? () => 0 : undefined
+    );
+  }, [category, dbEvents, dbItems, featured]);
 
   return (
     <div className="px-6 pb-32 relative z-10 pt-4">
@@ -44,6 +46,7 @@ export function GridView({ category, onSelectItem }: GridViewProps) {
                 variant={category === 'sight' ? 'square' : 'horizontal'}
                 className="min-w-0 w-full"
                 onClick={() => onSelectItem(item)}
+                featured={featuredIds.has(item.id)}
               />
             ))}
         {!loading && items.length === 0 && (

=== src/domain/guide/components/ItemDetailModal.tsx — diff ===
@@ -1,11 +1,11 @@
-import React, { useState, useEffect } from 'react';
+import { useState, useEffect } from 'react';
+import { isListingSealVisible } from '../utils/listingSeal';
 import { motion, AnimatePresence } from 'motion/react';
 import {
   X,
   Star,
   MapPin,
   Compass,
-  Utensils,
   ExternalLink,
   MessageCircle,
   Clock,
@@ -19,7 +19,7 @@ import { GuideItem } from '../types/guide';
 import { ReviewSection } from '../../reviews';
 import { optimizeImage } from '../../../shared/utils/formatters';
 import { cn } from '../../../shared/utils/cn';
-import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
+import { VerifiedSealButton } from '../../../ui/components/VerifiedSealButton';
 import { trackInteractionUseCase as trackInteraction } from '../../insights';
 import { FavoriteButton } from '../../favorites/components/FavoriteButton';
 import { ShareButton } from '../../../ui/components/ShareButton';
@@ -215,7 +215,7 @@ export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
           <div className="space-y-1 font-display">
             <h2 className="text-3xl font-display font-black leading-tight text-white mb-1 flex items-center gap-2 flex-wrap">
               {item.name}
-              {item.isVerified && !item.isVerificationSuspended && <VerifiedBadge size="md" />}
+              {isListingSealVisible(item) && <VerifiedSealButton size="md" />}
             </h2>
             <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
               <MapPin size={16} />

=== src/domain/guide/components/RestaurantDetailModal.tsx — diff ===
@@ -1,4 +1,5 @@
-import React, { useState, useEffect } from 'react';
+import { useState, useEffect } from 'react';
+import { isListingSealVisible } from '../utils/listingSeal';
 import { motion } from 'motion/react';
 import { X, Star, MapPin, Utensils, MessageCircle } from 'lucide-react';
 import { GlassCard } from '../../../ui/components/GlassCard';
@@ -9,7 +10,7 @@ import { GuideItem } from '../types/guide';
 import { ReviewSection } from '../../reviews';
 import { optimizeImage } from '../../../shared/utils/formatters';
 import { cn } from '../../../shared/utils/cn';
-import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
+import { VerifiedSealButton } from '../../../ui/components/VerifiedSealButton';
 import { trackInteractionUseCase as trackInteraction } from '../../insights';
 import { FavoriteButton } from '../../favorites/components/FavoriteButton';
 import { ShareButton } from '../../../ui/components/ShareButton';
@@ -156,7 +157,7 @@ export function RestaurantDetailModal({ item, onClose }: RestaurantDetailModalPr
           <div className="space-y-1 font-display">
             <h2 className="text-3xl font-display font-black text-white leading-tight flex items-center gap-2 flex-wrap mb-1">
               {item.name}
-              {item.isVerified && !item.isVerificationSuspended && <VerifiedBadge size="md" />}
+              {isListingSealVisible(item) && <VerifiedSealButton size="md" />}
             </h2>
             <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
               <MapPin size={16} />

=== src/domain/guide/components/StandardCard.tsx — diff ===
@@ -1,4 +1,6 @@
 import { useState } from 'react';
+import { useTranslation } from 'react-i18next';
+import { isListingSealVisible } from '../utils/listingSeal';
 import { Bike, Star, Utensils, MapPin, Compass, Home, Info, Calendar } from 'lucide-react';
 import { GlassCard } from '../../../ui/components/GlassCard';
 import { CATEGORIES } from '../../../shared/constants/categories';
@@ -12,6 +14,8 @@ interface StandardCardProps {
   variant?: 'square' | 'portrait' | 'landscape' | 'video' | 'circle' | 'horizontal' | 'banner';
   onClick: () => void;
   className?: string;
+  /** Vaga paga do dia (D11): sempre identificada como "Destaque" (CDC art. 36). */
+  featured?: boolean;
 }
 
 // Nomes de ícone usados em CATEGORIES (src/shared/constants/categories.ts).
@@ -27,7 +31,14 @@ const IconMap: Record<string, typeof Info> = {
 
 import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
 
-export function StandardCard({ item, variant = 'square', onClick, className }: StandardCardProps) {
+export function StandardCard({
+  item,
+  variant = 'square',
+  onClick,
+  className,
+  featured = false,
+}: StandardCardProps) {
+  const { t } = useTranslation();
   const [imageError, setImageError] = useState(false);
   const cat = CATEGORIES[item.category];
 
@@ -99,7 +110,13 @@ export function StandardCard({ item, variant = 'square', onClick, className }: S
         )}
 
         {/* Badges Overlay */}
-        <div className="absolute top-3 left-3 z-20"></div>
+        <div className="absolute top-3 left-3 z-20">
+          {featured && (
+            <span className="px-2 py-1 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg">
+              {t('common.featured')}
+            </span>
+          )}
+        </div>
 
         <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
           {item.rating && item.rating > 0 ? (
@@ -166,7 +183,7 @@ export function StandardCard({ item, variant = 'square', onClick, className }: S
                 )}
               >
                 {item.name}
-                {item.isVerified && !item.isVerificationSuspended && <VerifiedBadge size="sm" />}
+                {isListingSealVisible(item) && <VerifiedBadge size="sm" />}
               </h4>
             </div>
           </div>

=== src/domain/guide/components/StayDetailModal.tsx — diff ===
@@ -1,4 +1,5 @@
-import React, { useState, useEffect } from 'react';
+import { useState, useEffect } from 'react';
+import { isListingSealVisible } from '../utils/listingSeal';
 import { motion } from 'motion/react';
 import { X, Star, MapPin, MessageCircle } from 'lucide-react';
 import { GlassCard } from '../../../ui/components/GlassCard';
@@ -9,7 +10,7 @@ import { GuideItem } from '../types/guide';
 import { ReviewSection } from '../../reviews';
 import { optimizeImage } from '../../../shared/utils/formatters';
 import { cn } from '../../../shared/utils/cn';
-import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
+import { VerifiedSealButton } from '../../../ui/components/VerifiedSealButton';
 import { trackInteractionUseCase as trackInteraction } from '../../insights';
 import { FavoriteButton } from '../../favorites/components/FavoriteButton';
 import { ShareButton } from '../../../ui/components/ShareButton';
@@ -156,7 +157,7 @@ export function StayDetailModal({ item, onClose }: StayDetailModalProps) {
           <div className="space-y-1 font-display">
             <h2 className="text-3xl font-display font-black text-white leading-tight flex items-center gap-2 flex-wrap mb-1">
               {item.name}
-              {item.isVerified && !item.isVerificationSuspended && <VerifiedBadge size="md" />}
+              {isListingSealVisible(item) && <VerifiedSealButton size="md" />}
             </h2>
             <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
               <MapPin size={16} />

=== src/domain/guide/components/TourDetailModal.tsx — diff ===
@@ -1,4 +1,5 @@
 import React, { useState, useEffect } from 'react';
+import { isListingSealVisible } from '../utils/listingSeal';
 import { motion } from 'motion/react';
 import { X, Star, MapPin, MessageCircle } from 'lucide-react';
 import { GlassCard } from '../../../ui/components/GlassCard';
@@ -9,7 +10,7 @@ import { GuideItem } from '../types/guide';
 import { ReviewSection } from '../../reviews';
 import { optimizeImage } from '../../../shared/utils/formatters';
 import { cn } from '../../../shared/utils/cn';
-import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
+import { VerifiedSealButton } from '../../../ui/components/VerifiedSealButton';
 import { trackInteractionUseCase as trackInteraction } from '../../insights';
 import { FavoriteButton } from '../../favorites/components/FavoriteButton';
 import { ShareButton } from '../../../ui/components/ShareButton';
@@ -158,7 +159,7 @@ export function TourDetailModal({ item, onClose, bookingPanel }: TourDetailModal
           <div className="space-y-1 font-display">
             <h2 className="text-3xl font-display font-black text-white leading-tight flex items-center gap-2 flex-wrap mb-1">
               {item.name}
-              {item.isVerified && !item.isVerificationSuspended && <VerifiedBadge size="md" />}
+              {isListingSealVisible(item) && <VerifiedSealButton size="md" />}
             </h2>
             <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
               <MapPin size={16} />

=== src/domain/guide/components/explore/ExploreSection.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ErrorState } from '../../../../ui/components/ErrorState';
import { Skeleton } from '../../../../ui/components/Skeleton';
import type { GuideItem } from '../../types/guide';
import { SectionTitle } from '../SectionTitle';
import { StandardCard } from '../StandardCard';

export type ExploreCardVariant = 'square' | 'portrait' | 'landscape' | 'banner';

interface ExploreSectionProps {
  title: string;
  onSeeAll: () => void;
  items: GuideItem[];
  featuredIds: ReadonlySet<string>;
  variant: ExploreCardVariant;
  skeletonWrapClassName: string;
  skeletonClassName: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectItem: (item: GuideItem) => void;
  emptyMessage?: string;
}

/** Carrossel de uma categoria na home; as vagas "Destaque" vêm primeiro (D11). */
export function ExploreSection({
  title,
  onSeeAll,
  items,
  featuredIds,
  variant,
  skeletonWrapClassName,
  skeletonClassName,
  loading,
  error,
  onRetry,
  onSelectItem,
  emptyMessage,
}: ExploreSectionProps) {
  return (
    <>
      <SectionTitle title={title} onSeeAll={onSeeAll} />
      <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
        {error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className={skeletonWrapClassName}>
              <Skeleton className={skeletonClassName} />
            </div>
          ))
        ) : (
          items.map((item) => (
            <StandardCard
              key={item.id}
              item={item}
              variant={variant}
              onClick={() => onSelectItem(item)}
              featured={featuredIds.has(item.id)}
            />
          ))
        )}
        {emptyMessage && !loading && !error && items.length === 0 && (
          <div className="flex-1 text-center py-12 text-white/50 font-medium">{emptyMessage}</div>
        )}
      </div>
    </>
  );
}

=== src/domain/guide/components/explore/PullRefreshIndicator.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Z_INDEX } from '../../../../shared/constants/zIndex';
import { cn } from '../../../../shared/utils/cn';
import { PULL_REFRESH_THRESHOLD } from '../../hooks/usePullToRefresh';

interface PullRefreshIndicatorProps {
  pullDistance: number;
  isPulling: boolean;
  isRefreshing: boolean;
}

export function PullRefreshIndicator({
  pullDistance,
  isPulling,
  isRefreshing,
}: PullRefreshIndicatorProps) {
  if (pullDistance < 20 && !isRefreshing) return null;
  return (
    <div
      className="fixed left-0 right-0 pointer-events-none select-none flex justify-center"
      style={{
        zIndex: Z_INDEX.toast,
        top: isRefreshing ? '84px' : `${54 + pullDistance * 0.45}px`,
        opacity: isRefreshing ? 1 : Math.min((pullDistance - 20) / 36, 1),
        transform: `scale(${isRefreshing ? 1 : Math.min(0.5 + (pullDistance / PULL_REFRESH_THRESHOLD) * 0.5, 1)})`,
        transition: isPulling
          ? 'none'
          : 'top 200ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 200ms, transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      <div
        className={cn(
          'w-11 h-11 rounded-full backdrop-blur-xl flex items-center justify-center relative transition-all duration-300',
          pullDistance >= PULL_REFRESH_THRESHOLD
            ? 'bg-white/25 border border-white/40 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
            : 'bg-white/10 border border-white/20 shadow-md'
        )}
        style={{
          maskImage: 'radial-gradient(circle, transparent 52%, black 53%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 52%, black 53%)',
        }}
      >
        <svg
          className={cn(
            'w-8 h-8 transform -rotate-90 origin-center absolute',
            isRefreshing && 'animate-spin'
          )}
          viewBox="0 0 36 36"
        >
          <circle cx="18" cy="18" r="13" fill="none" className="stroke-white/5" strokeWidth="2.5" />
          <circle
            cx="18"
            cy="18"
            r="13"
            fill="none"
            className={cn(
              'transition-all duration-300',
              pullDistance >= PULL_REFRESH_THRESHOLD
                ? 'stroke-indigo-400 drop-shadow-[0_0_6px_rgba(129,140,248,0.9)]'
                : 'stroke-indigo-300/70'
            )}
            strokeWidth="2.5"
            strokeDasharray={isRefreshing ? '22 60' : '81.68'} // 2 * pi * r = 2 * 3.14159 * 13 ≈ 81.68
            strokeDashoffset={
              isRefreshing ? 0 : 81.68 - 81.68 * Math.min(pullDistance / PULL_REFRESH_THRESHOLD, 1)
            }
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

=== src/domain/guide/components/explore/exploreSections.ts — ARQUIVO NOVO, conteúdo completo ===
import type { RouteKey } from '../../../../shared/i18n/localizedRoutes';
import type { GuideItem } from '../../types/guide';
import type { ExploreCardVariant } from './ExploreSection';

export interface ExploreSectionConfig {
  category: GuideItem['category'];
  title: string;
  route: RouteKey;
  variant: ExploreCardVariant;
  skeletonWrapClassName: string;
  skeletonClassName: string;
  emptyMessage?: string;
}

// TODO: títulos ainda em pt-BR fixo (débito B16); entram no namespace do guia na tradução da home.
export const EXPLORE_SECTIONS: readonly ExploreSectionConfig[] = [
  {
    category: 'event',
    title: 'Próximos Eventos',
    route: 'events',
    variant: 'banner',
    skeletonWrapClassName: 'min-w-[90vw] md:min-w-[700px] snap-center',
    skeletonClassName: 'aspect-[4/3] w-full rounded-3xl',
    emptyMessage: 'Nenhum evento agendado.',
  },
  {
    category: 'restaurant',
    title: 'Sabores Locais',
    route: 'restaurants',
    variant: 'square',
    skeletonWrapClassName: 'min-w-[280px] snap-center',
    skeletonClassName: 'aspect-square w-full rounded-3xl',
  },
  {
    category: 'hotel',
    title: 'Hospedagem',
    route: 'stays',
    variant: 'portrait',
    skeletonWrapClassName: 'min-w-[280px] snap-center',
    skeletonClassName: 'aspect-[3/4] w-full rounded-3xl',
  },
  {
    category: 'tour',
    title: 'Aventura & Passeios',
    route: 'tours',
    variant: 'landscape',
    skeletonWrapClassName: 'min-w-[300px] snap-center',
    skeletonClassName: 'aspect-video w-full rounded-3xl',
  },
  {
    category: 'transfer',
    title: 'Translados & Transporte',
    route: 'transfers',
    variant: 'landscape',
    skeletonWrapClassName: 'min-w-[300px] snap-center',
    skeletonClassName: 'aspect-video w-full rounded-3xl',
  },
  {
    category: 'rental',
    title: 'Aluguéis',
    route: 'rentals',
    variant: 'landscape',
    skeletonWrapClassName: 'min-w-[300px] snap-center',
    skeletonClassName: 'aspect-video w-full rounded-3xl',
  },
  {
    category: 'sight',
    title: 'Atrações',
    route: 'attractions',
    variant: 'square',
    skeletonWrapClassName: 'min-w-[280px] snap-center',
    skeletonClassName: 'aspect-square w-full rounded-full',
  },
  {
    category: 'tips',
    title: 'Guia Prático',
    route: 'guide',
    variant: 'landscape',
    skeletonWrapClassName: 'min-w-[280px] snap-center',
    skeletonClassName: 'aspect-[4/3] w-full rounded-2xl',
  },
];

=== src/domain/guide/hooks/useExploreSections.ts — ARQUIVO NOVO, conteúdo completo ===
import { useMemo } from 'react';
import { filterItemsList } from '../../search';
import { featuredListKeyOf, type FeaturedListings } from '../types/featuredListing';
import type { GuideItem } from '../types/guide';
import { type OrderedListing, orderWithFeatured } from '../utils/featuredOrdering';

const SECTION_SIZE = 10;

interface ExploreSectionsInput {
  items: GuideItem[];
  events: GuideItem[];
  featured: FeaturedListings;
  searchQuery: string;
  appliedRegions: string[];
  appliedCategories: string[];
}

/** Itens de cada carrossel da home: filtro, vagas "Destaque" no topo e no máximo 10 (D11). */
export function useExploreSections({
  items,
  events,
  featured,
  searchQuery,
  appliedRegions,
  appliedCategories,
}: ExploreSectionsInput) {
  return useMemo(() => {
    const sectionFor = (category: GuideItem['category']): OrderedListing => {
      if (appliedCategories.length > 0 && !appliedCategories.includes(category)) {
        return { items: [], featuredIds: new Set() };
      }
      const source = category === 'event' ? events : items;
      const filtered = filterItemsList(source, searchQuery, appliedRegions).filter(
        (item) => item.category === category
      );
      const listKey = featuredListKeyOf(category);
      // Eventos seguem a ordem de data do catálogo; as outras listas, nota e avaliações.
      const ordered = orderWithFeatured(
        filtered,
        listKey ? featured[listKey] : [],
        category === 'event' ? () => 0 : undefined
      );
      return { ...ordered, items: ordered.items.slice(0, SECTION_SIZE) };
    };
    return sectionFor;
  }, [items, events, featured, searchQuery, appliedRegions, appliedCategories]);
}

=== src/domain/guide/hooks/useGuideCatalog.ts — diff ===
@@ -4,6 +4,7 @@ import { useGuideCatalogStore } from '../stores/useGuideCatalogStore';
 export function useGuideCatalog() {
   const items = useGuideCatalogStore((state) => state.items);
   const events = useGuideCatalogStore((state) => state.events);
+  const featured = useGuideCatalogStore((state) => state.featured);
   const loading = useGuideCatalogStore((state) => state.loading);
   const error = useGuideCatalogStore((state) => state.error);
   const retry = useGuideCatalogStore((state) => state.retry);
@@ -16,6 +17,7 @@ export function useGuideCatalog() {
   return {
     items,
     events,
+    featured,
     loading,
     error,
     retry,

=== src/domain/guide/hooks/usePullToRefresh.ts — ARQUIVO NOVO, conteúdo completo ===
import { useEffect, useRef, useState } from 'react';

// O círculo se forma por completo com 76 px de puxão.
export const PULL_REFRESH_THRESHOLD = 76;

/** Puxar para atualizar no topo da rolagem (toque e mouse). Recarrega a página ao soltar. */
export function usePullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef<number | null>(null);
  const startXRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const isMouseActiveRef = useRef(false);

  useEffect(() => {
    const scrollContainer = document.querySelector<HTMLElement>('.overflow-y-auto');
    if (!scrollContainer) return;

    const handleStart = (clientY: number, clientX: number, isMouse: boolean) => {
      if (isRefreshing) return;
      if (
        document.documentElement.classList.contains('scroll-locked') ||
        scrollContainer.style.overflowY === 'hidden'
      )
        return;

      // Só inicia se estiver no topo absoluto da rolagem (scrollTop <= 0)
      if (scrollContainer.scrollTop <= 0) {
        startYRef.current = clientY;
        startXRef.current = clientX;
        isPullingRef.current = true;
        isMouseActiveRef.current = isMouse;
      }
    };

    const handleMove = (clientY: number, clientX: number, e: TouchEvent | MouseEvent) => {
      if (!isPullingRef.current || isRefreshing) return;
      if (startYRef.current === null || startXRef.current === null) return;

      const deltaY = clientY - startYRef.current;
      const deltaX = clientX - startXRef.current;

      // Se mover horizontalmente mais do que verticalmente, cancela o puxão
      // Isso evita acidentes ao arrastar carrosséis de banners
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        isPullingRef.current = false;
        setIsPulling(false);
        setPullDistance(0);
        return;
      }

      if (deltaY > 0) {
        if (scrollContainer.scrollTop <= 0) {
          if (e.cancelable) {
            e.preventDefault();
          }
          // Resistência elástica amortecida
          const distance = Math.min(deltaY * 0.42, 120);
          setPullDistance(distance);
          setIsPulling(true);
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    };

    const handleEnd = () => {
      if (!isPullingRef.current || isRefreshing) return;
      isPullingRef.current = false;
      isMouseActiveRef.current = false;

      if (pullDistance >= PULL_REFRESH_THRESHOLD) {
        // Dispara o reload um pouco depois para o sumiço visual terminar
        setTimeout(() => {
          window.location.reload();
        }, 150);

        // Zera o estado para o círculo sumir instantaneamente com transição elástica ao soltar
        setPullDistance(0);
        setIsPulling(false);
        setIsRefreshing(false);
      } else {
        // Retorno elástico suave à posição inicial
        const current = pullDistance;
        const duration = 200;
        const startTime = performance.now();

        const animateBack = (time: number) => {
          const elapsed = time - startTime;
          const pct = Math.min(elapsed / duration, 1);
          const ease = 1 - (1 - pct) ** 3; // ease-out cubic
          const val = current * (1 - ease);

          if (pct < 1) {
            setPullDistance(val);
            requestAnimationFrame(animateBack);
          } else {
            setPullDistance(0);
            setIsPulling(false);
          }
        };
        requestAnimationFrame(animateBack);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      handleStart(touch.clientY, touch.clientX, false);
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      handleMove(touch.clientY, touch.clientX, e);
    };

    const onTouchEnd = () => {
      handleEnd();
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Apenas clique esquerdo
      handleStart(e.clientY, e.clientX, true);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseActiveRef.current) return;
      handleMove(e.clientY, e.clientX, e);
    };

    const onMouseUp = () => {
      if (isMouseActiveRef.current) {
        handleEnd();
      }
    };

    scrollContainer.addEventListener('touchstart', onTouchStart, { passive: true });
    scrollContainer.addEventListener('touchmove', onTouchMove, { passive: false });
    scrollContainer.addEventListener('touchend', onTouchEnd, { passive: true });

    scrollContainer.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp, { passive: true });

    return () => {
      scrollContainer.removeEventListener('touchstart', onTouchStart);
      scrollContainer.removeEventListener('touchmove', onTouchMove);
      scrollContainer.removeEventListener('touchend', onTouchEnd);

      scrollContainer.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [pullDistance, isRefreshing]);

  return { pullDistance, isPulling, isRefreshing };
}

=== src/domain/guide/ports/guideCatalogPort.ts — diff ===
@@ -1,8 +1,10 @@
+import type { FeaturedListings } from '../types/featuredListing';
 import { GuideItem } from '../types/guide';
 
 export interface GuideCatalogSnapshot {
   items: GuideItem[];
   events: GuideItem[];
+  featured: FeaturedListings;
 }
 
 export interface GuideCatalogPort {

=== src/domain/guide/stores/useGuideCatalogStore.ts — diff ===
@@ -1,10 +1,12 @@
 import { create } from 'zustand';
 import { subscribeGuideCatalog } from '../factory';
+import type { FeaturedListings } from '../types/featuredListing';
 import { GuideItem } from '../types/guide';
 
 interface GuideCatalogState {
   items: GuideItem[];
   events: GuideItem[];
+  featured: FeaturedListings;
   loading: boolean;
   error: string | null;
   subscriberCount: number;
@@ -16,6 +18,7 @@ interface GuideCatalogState {
 export const useGuideCatalogStore = create<GuideCatalogState>((set, get) => ({
   items: [],
   events: [],
+  featured: {},
   loading: true,
   error: null,
   subscriberCount: 0,
@@ -29,10 +32,11 @@ export const useGuideCatalogStore = create<GuideCatalogState>((set, get) => ({
 
     if (current.subscriberCount === 0) {
       const unsubscribe = subscribeGuideCatalog(
-        ({ items, events }) => {
+        ({ items, events, featured }) => {
           set({
             items,
             events,
+            featured,
             loading: false,
             error: null,
           });
@@ -83,6 +87,7 @@ export const useGuideCatalogStore = create<GuideCatalogState>((set, get) => ({
     set({
       items: [],
       events: [],
+      featured: {},
       loading: true,
       error: null,
       catalogUnsubscribe: null,
@@ -90,10 +95,11 @@ export const useGuideCatalogStore = create<GuideCatalogState>((set, get) => ({
 
     if (current.subscriberCount > 0) {
       const unsubscribe = subscribeGuideCatalog(
-        ({ items, events }) => {
+        ({ items, events, featured }) => {
           set({
             items,
             events,
+            featured,
             loading: false,
             error: null,
           });

=== src/domain/guide/types/featuredListing.ts — ARQUIVO NOVO, conteúdo completo ===
import type { GuideItem } from './guide';

/** Projeção pública `featuredListings/{lista}` gravada pelo job diário do backend (D11). */
export type FeaturedListings = Partial<Record<FeaturedListKey, string[]>>;

export type FeaturedListKey =
  | 'hotel'
  | 'restaurant'
  | 'tour'
  | 'sight'
  | 'transfer'
  | 'rental'
  | 'events';

const LIST_BY_CATEGORY: Partial<Record<GuideItem['category'], FeaturedListKey>> = {
  hotel: 'hotel',
  restaurant: 'restaurant',
  tour: 'tour',
  sight: 'sight',
  transfer: 'transfer',
  rental: 'rental',
  event: 'events',
};

/** Lista do destaque da categoria; dicas e perfis de produtor não têm vagas. */
export function featuredListKeyOf(category: GuideItem['category']): FeaturedListKey | null {
  return LIST_BY_CATEGORY[category] ?? null;
}

=== src/domain/guide/utils/featuredOrdering.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import type { GuideItem } from '../types/guide';
import { orderWithFeatured } from './featuredOrdering';

const item = (id: string, rating = 0, reviewCount = 0, isVerified = false) =>
  ({
    id,
    name: id,
    description: '',
    category: 'hotel',
    image: '',
    location: '',
    rating,
    reviewCount,
    isVerified,
  }) as GuideItem;

describe('orderWithFeatured (D11)', () => {
  const items = [item('a', 4.2, 10, true), item('b', 4.8, 3), item('c', 4.8, 9), item('d', 3)];

  it('destaques no topo na ordem do sorteio; o resto por nota e avaliações, sem favorecer o selo', () => {
    const ordered = orderWithFeatured(items, ['d', 'a']);
    expect(ordered.items.map((listing) => listing.id)).toEqual(['d', 'a', 'c', 'b']);
    expect([...ordered.featuredIds]).toEqual(['d', 'a']);
  });

  it('destaque que não está na lista (filtro ou inativo) é ignorado', () => {
    const ordered = orderWithFeatured(items, ['x']);
    expect(ordered.items.map((listing) => listing.id)).toEqual(['c', 'b', 'a', 'd']);
    expect(ordered.featuredIds.size).toBe(0);
  });
});

=== src/domain/guide/utils/featuredOrdering.ts — ARQUIVO NOVO, conteúdo completo ===
import type { GuideItem } from '../types/guide';

export interface OrderedListing {
  items: GuideItem[];
  featuredIds: ReadonlySet<string>;
}

const byOrganicRank = (a: GuideItem, b: GuideItem) =>
  (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0);

/**
 * Ordem das listas (D11): as vagas "Destaque" do dia no topo, na ordem do sorteio; o resto em
 * ordem orgânica (nota e avaliações), com assinantes e não assinantes juntos.
 */
export function orderWithFeatured(
  items: GuideItem[],
  featuredIds: readonly string[] = [],
  organic: (a: GuideItem, b: GuideItem) => number = byOrganicRank
): OrderedListing {
  const byId = new Map(items.map((item) => [item.id, item]));
  const featured = featuredIds.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
  const featuredSet = new Set(featured.map((item) => item.id));
  const rest = items.filter((item) => !featuredSet.has(item.id)).sort(organic);
  return { items: [...featured, ...rest], featuredIds: featuredSet };
}

=== src/domain/guide/utils/listingSeal.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { isListingSealVisible } from './listingSeal';

const NOW = new Date('2026-10-24T12:00:00.000Z');

describe('isListingSealVisible (D11)', () => {
  it('mostra o selo ativo, inclusive o concedido pela equipe sem validade', () => {
    expect(
      isListingSealVisible({ isVerified: true, verifiedUntil: '2026-11-01T00:00:00.000Z' }, NOW)
    ).toBe(true);
    expect(isListingSealVisible({ isVerified: true, verifiedUntil: null }, NOW)).toBe(true);
  });

  it('esconde o selo vencido, suspenso ou inexistente', () => {
    expect(
      isListingSealVisible({ isVerified: true, verifiedUntil: '2026-10-24T11:59:00.000Z' }, NOW)
    ).toBe(false);
    expect(isListingSealVisible({ isVerified: true, isVerificationSuspended: true }, NOW)).toBe(
      false
    );
    expect(isListingSealVisible({ isVerified: false }, NOW)).toBe(false);
  });
});

=== src/domain/guide/utils/listingSeal.ts — ARQUIVO NOVO, conteúdo completo ===
interface SealFields {
  isVerified?: boolean;
  verifiedUntil?: string | null;
  isVerificationSuspended?: boolean;
}

/**
 * Selo público do cadastro (D11). O job diário desliga o selo vencido, mas os cards também
 * conferem a validade para não mostrar o selo entre o vencimento e a próxima execução do job.
 */
export function isListingSealVisible(item: SealFields, now: Date = new Date()): boolean {
  if (!item.isVerified || item.isVerificationSuspended) return false;
  return !item.verifiedUntil || new Date(item.verifiedUntil) > now;
}

=== src/domain/partners/adapters/apiListingPlanAdapter.test.ts — diff ===
@@ -29,6 +29,16 @@ describe('ApiListingPlanAdapter', () => {
     expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'POST' });
   });
 
+  it('admin concede o selo por PUT só com { grant }', async () => {
+    fetchMock.mockResolvedValue(ok({ data: { itemId: 'item-1', planType: 'admin' } }));
+    await adapter.setSeal('item-1', true);
+    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/listing-plans/item-1/seal');
+    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
+      method: 'PUT',
+      body: JSON.stringify({ grant: true }),
+    });
+  });
+
   it('lança o code estável do erro', async () => {
     fetchMock.mockResolvedValue(
       new Response(JSON.stringify({ error: { code: 'TRIAL_ALREADY_USED' } }), { status: 409 })

=== src/domain/partners/adapters/apiListingPlanAdapter.ts — diff ===
@@ -24,4 +24,12 @@ export class ApiListingPlanAdapter implements ListingPlanPort {
   activateTrial(itemId: string): Promise<ListingPlanView> {
     return call(`${planPath(itemId)}/trial`, { method: 'POST' });
   }
+
+  setSeal(itemId: string, grant: boolean): Promise<ListingPlanView> {
+    return call(`${planPath(itemId)}/seal`, {
+      method: 'PUT',
+      headers: { 'Content-Type': 'application/json' },
+      body: JSON.stringify({ grant }),
+    });
+  }
 }

=== src/domain/partners/adapters/apiPartnerAdapter.ts — diff ===
@@ -80,25 +80,6 @@ export class ApiPartnerAdapter implements PartnerPort {
     }
   }
 
-  async updatePartnerVerification(partnerId: string, isVerified: boolean): Promise<void> {
-    const res = await firebaseApiFetch(
-      '/api/partners/verify',
-      {
-        method: 'PATCH',
-        headers: {
-          'Content-Type': 'application/json',
-        },
-        body: JSON.stringify({ partnerId, isVerified }),
-      },
-      { requireAuth: true }
-    );
-
-    if (!res.ok) {
-      const errorData = await res.json().catch(() => ({}));
-      throw new Error(errorData.error || 'Erro ao atualizar verificação do parceiro no backend');
-    }
-  }
-
   async deletePartnerProfile(partnerId: string): Promise<void> {
     const res = await firebaseApiFetch(
       `/api/partners/${partnerId}`,

=== src/domain/partners/application/usecases/setListingSealUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanAdapter } from '../../factory';
import type { ListingPlanView } from '../../types/listingPlan';

/** Admin concede ou retira o selo do estabelecimento; um plano pago em vigor é mantido (D8). */
export function setListingSealUseCase(itemId: string, grant: boolean): Promise<ListingPlanView> {
  return listingPlanAdapter.setSeal(itemId, grant);
}

=== src/domain/partners/application/usecases/updatePartnerVerificationUseCase.test.ts — APAGUE este arquivo ===

=== src/domain/partners/application/usecases/updatePartnerVerificationUseCase.ts — APAGUE este arquivo ===

=== src/domain/partners/components/plan/AdminListingSealControl.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({
  get: vi.fn(),
  setSeal: vi.fn(),
  confirm: vi.fn(),
  toast: vi.fn(),
}));
vi.mock('../../application/usecases/getListingPlanUseCase', () => ({
  getListingPlanUseCase: m.get,
}));
vi.mock('../../application/usecases/activateListingTrialUseCase', () => ({
  activateListingTrialUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/setListingSealUseCase', () => ({
  setListingSealUseCase: m.setSeal,
}));
vi.mock('../../../../shared/stores/useUIStore', () => ({
  useUI: () => ({ showToast: m.toast, confirmAction: m.confirm }),
}));

import { AdminListingSealControl } from './AdminListingSealControl';

const SEAL = {
  isVerified: true,
  verifiedUntil: null,
  verificationType: 'admin',
  isVerificationSuspended: false,
};
const NO_PLAN = {
  itemId: 'item-1',
  planType: null,
  planUntil: null,
  planActive: false,
  sealSuspended: false,
  seal: { ...SEAL, isVerified: false, verificationType: null },
  trialAvailable: true,
};

describe('AdminListingSealControl (D8, D11)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('concede o selo depois da confirmação e relê o plano', async () => {
    m.get.mockResolvedValue(NO_PLAN);
    m.confirm.mockResolvedValue(true);
    m.setSeal.mockResolvedValue({ ...NO_PLAN, planType: 'admin', planActive: true, seal: SEAL });
    render(<AdminListingSealControl itemId="item-1" name="Pousada Sol" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Conceder selo a Pousada Sol' }));
    await waitFor(() => expect(m.setSeal).toHaveBeenCalledWith('item-1', true));
    expect(m.confirm).toHaveBeenCalledWith(
      expect.stringContaining('Pousada Sol'),
      expect.objectContaining({ tone: 'positive' })
    );
    await waitFor(() => expect(m.toast).toHaveBeenCalledWith('Selo concedido.', 'success'));
    expect(m.get).toHaveBeenCalledTimes(2);
  });

  it('retirar o selo pede confirmação de risco e não chama a API se cancelar', async () => {
    m.get.mockResolvedValue({ ...NO_PLAN, planType: 'annual', planActive: true, seal: SEAL });
    m.confirm.mockResolvedValue(false);
    render(<AdminListingSealControl itemId="item-1" name="Pousada Sol" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Retirar selo de Pousada Sol' }));
    await waitFor(() =>
      expect(m.confirm).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ tone: 'danger' })
      )
    );
    expect(m.setSeal).not.toHaveBeenCalled();
  });
});

=== src/domain/partners/components/plan/AdminListingSealControl.tsx — ARQUIVO NOVO, conteúdo completo ===
import { BadgeCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { cn } from '../../../../shared/utils/cn';
import { setListingSealUseCase } from '../../application/usecases/setListingSealUseCase';
import { useListingPlan } from '../../hooks/useListingPlan';
import { getListingPlanErrorMessage } from '../../utils/listingPlanErrorMessage';
import { formatPlanDate, listingPlanChipStatus } from '../../utils/listingPlanStatus';

interface AdminListingSealControlProps {
  itemId: string;
  name: string;
}

/** Selo de um estabelecimento no painel admin (D8 por estabelecimento, D11). */
export function AdminListingSealControl({ itemId, name }: AdminListingSealControlProps) {
  const { t, i18n } = useTranslation();
  const { showToast, confirmAction } = useUI();
  const { data, loading, reload } = useListingPlan(itemId);
  const [saving, setSaving] = useState(false);
  const status = data ? listingPlanChipStatus(data) : 'none';
  const date = data?.planUntil ? formatPlanDate(data.planUntil, i18n.language) : '';
  const hasSeal = Boolean(data?.seal.isVerified && !data.sealSuspended);

  const toggle = async () => {
    const grant = !hasSeal;
    const confirmed = await confirmAction(
      t(grant ? 'listingPlan.admin.confirmGrant' : 'listingPlan.admin.confirmRevoke', { name }),
      {
        tone: grant ? 'positive' : 'danger',
        confirmLabel: t(grant ? 'listingPlan.admin.grant' : 'listingPlan.admin.revoke'),
      }
    );
    if (!confirmed) return;
    setSaving(true);
    try {
      const view = await setListingSealUseCase(itemId, grant);
      showToast(
        t(
          view.seal.isVerified || !grant
            ? grant
              ? 'listingPlan.admin.granted'
              : 'listingPlan.admin.revoked'
            : 'listingPlan.admin.grantedPendingVerification'
        ),
        'success'
      );
      await reload();
    } catch (err: unknown) {
      showToast(getListingPlanErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/70">
        <BadgeCheck size={12} aria-hidden="true" />
        {loading ? t('listingPlan.dialog.loading') : t(`listingPlan.chip.${status}`, { date })}
      </span>
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={loading || saving}
        aria-label={t(hasSeal ? 'listingPlan.admin.revokeLabel' : 'listingPlan.admin.grantLabel', {
          name,
        })}
        className={cn(
          'min-h-[44px] px-4 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50',
          hasSeal
            ? 'bg-blue-500/10 text-blue-300 hover:bg-blue-500 hover:text-black'
            : 'bg-blue-500 text-black hover:bg-blue-400'
        )}
      >
        {t(hasSeal ? 'listingPlan.admin.revoke' : 'listingPlan.admin.grant')}
      </button>
    </div>
  );
}

=== src/domain/partners/index.ts — diff ===
@@ -10,8 +10,8 @@ export { getAllPartnersUseCase } from './application/usecases/getAllPartnersUseC
 export { getPartnerProfileUseCase } from './application/usecases/getPartnerProfileUseCase';
 export { subscribeToPartnerProfileUseCase } from './application/usecases/subscribeToPartnerProfileUseCase';
 export { updatePartnerStatusUseCase } from './application/usecases/updatePartnerStatusUseCase';
-export { updatePartnerVerificationUseCase } from './application/usecases/updatePartnerVerificationUseCase';
 export { ListingEditor, type ListingEditorProps } from './components/ListingEditor';
+export { AdminListingSealControl } from './components/plan/AdminListingSealControl';
 export { ListingVerificationQueue } from './components/verification/ListingVerificationQueue';
 export { PartnerEventForm } from './components/PartnerEventForm';
 export {
@@ -36,9 +36,7 @@ export {
   type PartnerSubmissionInput,
   partnerSubmissionSchema,
   type UpdatePartnerStatusInput,
-  type UpdatePartnerVerificationInput,
   updatePartnerStatusSchema,
-  updatePartnerVerificationSchema,
 } from './schemas/partnerSchema';
 export type {
   PartnerBusiness,

=== src/domain/partners/ports/listingPlanPort.ts — diff ===
@@ -4,4 +4,6 @@ export interface ListingPlanPort {
   get(itemId: string): Promise<ListingPlanView>;
   /** Teste grátis de 7 dias, uma vez por conta, no estabelecimento escolhido (D11). */
   activateTrial(itemId: string): Promise<ListingPlanView>;
+  /** Só admin: concede ou retira o selo; tipo e validade são decididos no servidor (D8). */
+  setSeal(itemId: string, grant: boolean): Promise<ListingPlanView>;
 }

=== src/domain/partners/ports/partnerPort.ts — diff ===
@@ -5,6 +5,5 @@ export interface PartnerPort {
   getPartnerProfile(partnerId: string): Promise<PartnerProfile | null>;
   getAllPartners(): Promise<PartnerProfile[]>;
   updatePartnerStatus(partnerId: string, status: PartnerAccountStatus): Promise<void>;
-  updatePartnerVerification(partnerId: string, isVerified: boolean): Promise<void>;
   deletePartnerProfile(partnerId: string): Promise<void>;
 }

=== src/domain/partners/schemas/partnerSchema.test.ts — diff ===
@@ -7,7 +7,6 @@ import {
   step3Schema,
   step5SchemaContext,
   updatePartnerStatusSchema,
-  updatePartnerVerificationSchema,
 } from './partnerSchema';
 
 describe('Partner Validation Schemas (Frontend)', () => {
@@ -254,19 +253,5 @@ describe('Partner Validation Schemas (Frontend)', () => {
       expect(result.success).toBe(true);
       expect(result.data?.status).toBe('suspended');
     });
-
-    it('updatePartnerVerificationSchema aceita só partnerId e isVerified', () => {
-      expect(
-        updatePartnerVerificationSchema.safeParse({ partnerId: 'partner-123', isVerified: true })
-          .success
-      ).toBe(true);
-      expect(
-        updatePartnerVerificationSchema.safeParse({
-          partnerId: 'partner-123',
-          isVerified: true,
-          verificationType: 'annual',
-        }).success
-      ).toBe(false);
-    });
   });
 });

=== src/domain/partners/schemas/partnerSchema.ts — diff ===
@@ -365,13 +365,5 @@ export const updatePartnerStatusSchema = z.object({
   status: z.enum(['active', 'suspended']),
 });
 
-export const updatePartnerVerificationSchema = z
-  .object({
-    partnerId: z.string().min(1),
-    isVerified: z.boolean(),
-  })
-  .strict();
-
 export type PartnerSubmissionInput = z.infer<typeof partnerSubmissionSchema>;
 export type UpdatePartnerStatusInput = z.infer<typeof updatePartnerStatusSchema>;
-export type UpdatePartnerVerificationInput = z.infer<typeof updatePartnerVerificationSchema>;

=== src/shared/i18n/listingPlanResources.ts — diff ===
@@ -54,6 +54,17 @@ export interface ListingPlanTranslation {
   };
   trialActivated: string;
   checkoutName: string;
+  admin: {
+    grant: string;
+    revoke: string;
+    grantLabel: string;
+    revokeLabel: string;
+    confirmGrant: string;
+    confirmRevoke: string;
+    granted: string;
+    grantedPendingVerification: string;
+    revoked: string;
+  };
   errors: {
     VALIDATION_ERROR: string;
     FORBIDDEN: string;
@@ -123,6 +134,19 @@ export const listingPlanPtBR: ListingPlanTranslation = {
   },
   trialActivated: 'Teste grátis ativado até {{date}}.',
   checkoutName: 'Use Guide Verificado · {{plan}} · {{name}}',
+  admin: {
+    grant: 'Conceder selo',
+    revoke: 'Retirar selo',
+    grantLabel: 'Conceder selo a {{name}}',
+    revokeLabel: 'Retirar selo de {{name}}',
+    confirmGrant: 'Conceder o selo a {{name}}? Um plano pago em vigor não é alterado.',
+    confirmRevoke:
+      'Retirar o selo de {{name}}? Um plano pago em vigor é mantido; só o selo deixa de aparecer.',
+    granted: 'Selo concedido.',
+    grantedPendingVerification:
+      'Selo concedido. Ele aparece quando a verificação do estabelecimento for aprovada.',
+    revoked: 'Selo retirado.',
+  },
   errors: {
     VALIDATION_ERROR: 'Dados inválidos. Revise e tente novamente.',
     FORBIDDEN: 'Este estabelecimento não é da sua conta.',
@@ -192,6 +216,19 @@ export const listingPlanEn: ListingPlanTranslation = {
   },
   trialActivated: 'Free trial active until {{date}}.',
   checkoutName: 'Use Guide Verified · {{plan}} · {{name}}',
+  admin: {
+    grant: 'Grant badge',
+    revoke: 'Remove badge',
+    grantLabel: 'Grant badge to {{name}}',
+    revokeLabel: 'Remove badge from {{name}}',
+    confirmGrant: 'Grant the badge to {{name}}? An active paid plan is not changed.',
+    confirmRevoke:
+      'Remove the badge from {{name}}? An active paid plan is kept; only the badge stops showing.',
+    granted: 'Badge granted.',
+    grantedPendingVerification:
+      'Badge granted. It shows once the business verification is approved.',
+    revoked: 'Badge removed.',
+  },
   errors: {
     VALIDATION_ERROR: 'Invalid data. Please review and try again.',
     FORBIDDEN: 'This business does not belong to your account.',
@@ -261,6 +298,19 @@ export const listingPlanFr: ListingPlanTranslation = {
   },
   trialActivated: "Essai gratuit actif jusqu'au {{date}}.",
   checkoutName: 'Use Guide Vérifié · {{plan}} · {{name}}',
+  admin: {
+    grant: 'Accorder le badge',
+    revoke: 'Retirer le badge',
+    grantLabel: 'Accorder le badge à {{name}}',
+    revokeLabel: 'Retirer le badge de {{name}}',
+    confirmGrant: "Accorder le badge à {{name}} ? Une offre payante en cours n'est pas modifiée.",
+    confirmRevoke:
+      'Retirer le badge de {{name}} ? Une offre payante en cours est conservée ; seul le badge disparaît.',
+    granted: 'Badge accordé.',
+    grantedPendingVerification:
+      "Badge accordé. Il s'affiche une fois la vérification de l'établissement approuvée.",
+    revoked: 'Badge retiré.',
+  },
   errors: {
     VALIDATION_ERROR: 'Données invalides. Vérifiez et réessayez.',
     FORBIDDEN: "Cet établissement n'appartient pas à votre compte.",

=== src/shared/i18n/resources.ts — diff ===
@@ -39,6 +39,14 @@ export interface TranslationResource {
     language: string;
     cancel: string;
     confirm: string;
+    /** Selo "Use Guide Verificado" explicado ao toque (D11). */
+    seal: {
+      label: string;
+      title: string;
+      explanation: string;
+    };
+    /** Vaga paga identificada como tal (D11, CDC art. 36). */
+    featured: string;
     locales: {
       ptBR: string;
       en: string;
@@ -250,6 +258,13 @@ const ptBR: TranslationResource = {
     language: 'Idioma',
     cancel: 'Cancelar',
     confirm: 'Confirmar',
+    seal: {
+      label: 'Ver o que significa o selo Use Guide Verificado',
+      title: 'Use Guide Verificado',
+      explanation:
+        'Responsável verificado pelo Use Guide · assinante do plano Use Guide Verificado.',
+    },
+    featured: 'Destaque',
     locales: {
       ptBR: 'Português (Brasil)',
       en: 'English',
@@ -512,6 +527,12 @@ const en: TranslationResource = {
     language: 'Language',
     cancel: 'Cancel',
     confirm: 'Confirm',
+    seal: {
+      label: 'See what the Use Guide Verified badge means',
+      title: 'Use Guide Verified',
+      explanation: 'Owner verified by Use Guide · subscriber of the Use Guide Verified plan.',
+    },
+    featured: 'Featured',
     locales: {
       ptBR: 'Português (Brasil)',
       en: 'English',
@@ -769,6 +790,12 @@ const fr: TranslationResource = {
     language: 'Langue',
     cancel: 'Annuler',
     confirm: 'Confirmer',
+    seal: {
+      label: 'Voir ce que signifie le badge Use Guide Vérifié',
+      title: 'Use Guide Vérifié',
+      explanation: "Responsable vérifié par Use Guide · abonné à l'offre Use Guide Vérifié.",
+    },
+    featured: 'À la une',
     locales: {
       ptBR: 'Português (Brasil)',
       en: 'English',

=== src/ui/components/Popover.tsx — diff ===
@@ -11,6 +11,8 @@ interface PopoverProps {
   side?: 'top' | 'right' | 'bottom' | 'left';
   showCloseButton?: boolean;
   className?: string;
+  /** Dentro de um modal, o popover precisa ficar acima dele. */
+  zIndex?: number;
 }
 
 export function Popover({
@@ -20,6 +22,7 @@ export function Popover({
   side = 'bottom',
   showCloseButton = false,
   className,
+  zIndex = Z_INDEX.dropdown,
 }: PopoverProps) {
   return (
     <RadixPopover.Root>
@@ -34,7 +37,7 @@ export function Popover({
             'p-4 rounded-2xl bg-neutral-900/95 border border-white/10 shadow-2xl backdrop-blur-xl text-white outline-none animate-scale-in max-w-xs w-full',
             className
           )}
-          style={{ zIndex: Z_INDEX.dropdown }}
+          style={{ zIndex }}
         >
           {children}

=== src/ui/components/VerifiedSealButton.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../shared/i18n';
import { VerifiedSealButton } from './VerifiedSealButton';

describe('VerifiedSealButton (D11)', () => {
  beforeEach(async () => {
    // O Popover do Radix mede o gatilho; o jsdom não tem ResizeObserver.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
    await i18n.changeLanguage('pt-BR');
  });

  it('ao tocar no selo explica o que ele significa', async () => {
    render(<VerifiedSealButton />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Ver o que significa o selo Use Guide Verificado' })
    );
    expect(
      await screen.findByText(
        'Responsável verificado pelo Use Guide · assinante do plano Use Guide Verificado.'
      )
    ).toBeTruthy();
  });
});

=== src/ui/components/VerifiedSealButton.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { Popover } from './Popover';
import { VerifiedBadge } from './VerifiedBadge';

interface VerifiedSealButtonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Selo que explica o que significa ao ser tocado (D11). Não usar dentro de outro botão. */
export function VerifiedSealButton({ size = 'md', className }: VerifiedSealButtonProps) {
  const { t } = useTranslation();
  return (
    <Popover
      zIndex={Z_INDEX.modalNested}
      trigger={
        <button
          type="button"
          aria-label={t('common.seal.label')}
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -m-2 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <VerifiedBadge size={size} className={className} />
        </button>
      }
    >
      <p className="text-sm font-bold text-white">{t('common.seal.title')}</p>
      <p className="text-xs text-white/70 leading-relaxed mt-1">{t('common.seal.explanation')}</p>
    </Popover>
  );
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/app/compositions/AdminPanelComposition.tsx src/domain/admin/components/AdminPanel.tsx src/domain/admin/components/subcomponents/AdminGuideView.tsx src/domain/admin/components/subcomponents/AdminItemGrid.test.tsx src/domain/admin/components/subcomponents/AdminItemGrid.tsx src/domain/admin/components/subcomponents/AdminPartnersView.tsx src/domain/admin/hooks/useAdminPartnerActions.ts src/domain/admin/types/admin.ts src/domain/guide/adapters/firebaseGuideCatalogAdapter.test.ts src/domain/guide/adapters/firebaseGuideCatalogAdapter.ts src/domain/guide/components/AttractionDetailModal.tsx src/domain/guide/components/EventDetailModal.tsx src/domain/guide/components/ExploreView.tsx src/domain/guide/components/GridView.tsx src/domain/guide/components/ItemDetailModal.tsx src/domain/guide/components/RestaurantDetailModal.tsx src/domain/guide/components/StandardCard.tsx src/domain/guide/components/StayDetailModal.tsx src/domain/guide/components/TourDetailModal.tsx src/domain/guide/components/explore/ExploreSection.tsx src/domain/guide/components/explore/PullRefreshIndicator.tsx src/domain/guide/components/explore/exploreSections.ts src/domain/guide/hooks/useExploreSections.ts src/domain/guide/hooks/useGuideCatalog.ts src/domain/guide/hooks/usePullToRefresh.ts src/domain/guide/ports/guideCatalogPort.ts src/domain/guide/stores/useGuideCatalogStore.ts src/domain/guide/types/featuredListing.ts src/domain/guide/utils/featuredOrdering.test.ts src/domain/guide/utils/featuredOrdering.ts src/domain/guide/utils/listingSeal.test.ts src/domain/guide/utils/listingSeal.ts src/domain/partners/adapters/apiListingPlanAdapter.test.ts src/domain/partners/adapters/apiListingPlanAdapter.ts src/domain/partners/adapters/apiPartnerAdapter.ts src/domain/partners/application/usecases/setListingSealUseCase.ts src/domain/partners/components/plan/AdminListingSealControl.test.tsx src/domain/partners/components/plan/AdminListingSealControl.tsx src/domain/partners/index.ts src/domain/partners/ports/listingPlanPort.ts src/domain/partners/ports/partnerPort.ts src/domain/partners/schemas/partnerSchema.test.ts src/domain/partners/schemas/partnerSchema.ts src/shared/i18n/listingPlanResources.ts src/shared/i18n/resources.ts src/ui/components/Popover.tsx src/ui/components/VerifiedSealButton.test.tsx src/ui/components/VerifiedSealButton.tsx` (todos verdes). Não precisa rodar a suíte inteira.
- no app:
  - painel admin → Itens do Guia: cada cadastro tem o estado do plano e "Conceder selo" ou "Retirar selo"; a aba Parceiros não tem mais selo;
  - detalhe de um cadastro com selo: tocar no selo abre a explicação;
  - home e listas por categoria: as vagas do dia aparecem primeiro com o rótulo "Destaque" (depois de rodar o job diário de planos, que grava featuredListings).

Responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
