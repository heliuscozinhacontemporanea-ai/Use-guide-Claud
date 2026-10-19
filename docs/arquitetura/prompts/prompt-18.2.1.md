# Prompt 18.2.1 — Sessões do evento no editor (parceiro e admin)

> Lote 12, gerado do commit de referência `ce7f92a` da branch `claude/agents-md-v2`. Aplique depois do A3. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.2.1 — Sessões do evento no editor (parceiro e admin)

Decisão de 2026-10-19 (opção A): datas, horários e capacidade das sessões ficam no editor do evento, para o parceiro e o admin; o gerenciador de ingressos fica com tipos de ingresso, vendas e check-in.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os 13 arquivos novos. Não reescreva os arquivos do seu jeito e não acrescente funcionalidades. Arquivo tocado sai sem avisos do lint (AGENTS.md §13).

O QUE MUDA:
1) src/domain/events (novo):
   - types/eventSession.ts;
   - utils/eventSessions.ts: planEventSessionChanges, validateEventSessions, eventDateRangeFromSessions e newEventSessionDraft;
   - saveEventSessionsUseCase: cria e altera antes de apagar, pelas rotas do admin ou do parceiro;
   - components/EventSessionsField.tsx: campo controlado, no fuso de Fortaleza;
   - tudo exportado no index.ts. O componente é só para src/app/compositions.
2) Parceiro:
   - o editor de evento passa a ter "Datas e capacidade", com o campo de sessões recebido pela composição (renderEventSessionsField);
   - usePartnerEventSessions lê as sessões salvas e bloqueia o salvamento enquanto não carregaram;
   - evento novo nasce com uma sessão e é criado com occurrences;
   - na edição, as sessões são gravadas por saveEventSessionsUseCase;
   - date e endDate do evento passam a ser derivados das sessões (saem os dois campos de data do formulário).
3) Admin:
   - AdminEditorEventFields usa o mesmo campo (renderSessionsField) e recebe o gerenciador de ingressos por renderTicketingManager, sem importar o domínio ticketing (§5.2);
   - AdminPanel grava as sessões por saveEventSessionsUseCase (savedOccurrenceIds no lugar de removedOccurrenceIds);
   - AdminDispatcher repassa os slots; AdminPanelComposition e PartnerPortalComposition montam os slots.
4) Divisão (§13):
   - PartnerEventForm dividido em src/domain/partners/components/event/*, com SelectDropdown único no lugar das três listas;
   - PartnerEventEditor (novo) com o modal e a confirmação de exclusão; PartnerPanel abaixo de 400 linhas;
   - o editor de evento não fecha ao clicar fora, o que descartava as edições.
5) docs/arquitetura/debitos.md: B17 atualizado e resolução registrada.
6) Testes novos: eventSessions.test.ts, saveEventSessionsUseCase.test.ts e EventSessionsField.test.tsx.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- src/app/compositions/AdminPanelComposition.tsx (alterar)
- src/app/compositions/PartnerPortalComposition.tsx (alterar)
- src/domain/admin/components/AdminDispatcher.tsx (alterar)
- src/domain/admin/components/AdminPanel.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminEditorEventFields.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminEditorModal.tsx (alterar)
- src/domain/events/application/usecases/saveEventSessionsUseCase.test.ts (criar)
- src/domain/events/application/usecases/saveEventSessionsUseCase.ts (criar)
- src/domain/events/components/EventSessionsField.test.tsx (criar)
- src/domain/events/components/EventSessionsField.tsx (criar)
- src/domain/events/index.ts (alterar)
- src/domain/events/types/eventSession.ts (criar)
- src/domain/events/utils/eventSessions.test.ts (criar)
- src/domain/events/utils/eventSessions.ts (criar)
- src/domain/partners/components/PartnerEventEditor.tsx (criar)
- src/domain/partners/components/PartnerEventForm.tsx (alterar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/components/event/EventBasicsSection.tsx (criar)
- src/domain/partners/components/event/EventContactSection.tsx (criar)
- src/domain/partners/components/event/EventEntrySection.tsx (criar)
- src/domain/partners/components/event/EventPhotosSection.tsx (criar)
- src/domain/partners/components/event/SelectDropdown.tsx (criar)
- src/domain/partners/components/event/eventSectionProps.ts (criar)
- src/domain/partners/hooks/usePartnerContentActions.ts (alterar)
- src/domain/partners/hooks/usePartnerEventSessions.ts (criar)
- src/domain/partners/types/partnerContent.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -13,7 +13,7 @@
 | B13 | `application/usecases/bookings/*` (horário cancelado, reembolso que falhou) | §8.7 (avisar o comprador) e §7.10 A09 (alerta ao admin) | médio — o comprador só descobre o cancelamento em "Minhas reservas" e a falha de reembolso fica só no log | `notifications` aceitar destinatário usuário e admin (hoje só `recipientPartnerId`) |
 | B14 | UX — itens da auditoria de 2026-10-12 que pedem decisão de produto | §11 (UX) e §15 item 4 | baixo a médio | (a) preferências de notificação do parceiro estão em "Sobre o app" (`content/components/AboutView.tsx`), deveriam ir para Configurações; (b) "Ver todos" da Explore abre a listagem sem a busca e os filtros aplicados (`GridView` não tem filtros); (c) modais de hospedagem e restaurante não têm botão de mapa (`mapLink`); (d) "Programa de Parceiros" aberto pelo menu não volta ao menu ao fechar |
 | B16 | textos fixos em pt-BR ainda em `user/components/AccountView.tsx`, `ticketing/components/UserTicketsHistoryView.tsx` e `CheckoutResultView.tsx`, `partners/components/PartnersModal.tsx`, `insights/components/ReportsView.tsx`, `guide/components/ExploreView.tsx` | §12.3 | médio para en/fr | traduzir tela a tela; o Prompt 16 traduziu menu, configurações, favoritos e portal do parceiro |
-| B17 | Painel do parceiro — itens da auditoria de 2026-10-12 ainda abertos | §11.8, §11.10, §12.4, §11.7, §13 | médio | seção de reservas aparece para hospedagem/restaurante; parceiro não gerencia datas/capacidade do evento (Prompt 18.2.1); ingressos ocultos em evento novo sem aviso; relatórios bloqueados só na UI; quem já assina vê a compra de novo; erros de catálogo/notificações aparecem como lista vazia; excluir lote e "não compareceu" sem confirmação; clique fora do editor de evento descarta edições; botões só com ícone sem nome no editor de evento; `PartnerItemForms.tsx` sem uso; `Step2ContactInfo.tsx` (516 linhas) e `Step5Media.tsx` (756) acima de 400 linhas |
+| B17 | Painel do parceiro — itens da auditoria de 2026-10-12 ainda abertos | §11.8, §11.10, §12.4, §11.7, §13 | médio | seção de reservas aparece para hospedagem/restaurante; ingressos ocultos em evento novo sem aviso; relatórios bloqueados só na UI; quem já assina vê a compra de novo; erros de catálogo/notificações aparecem como lista vazia; excluir lote e "não compareceu" sem confirmação; `PartnerItemForms.tsx` sem uso; `Step2ContactInfo.tsx` (516 linhas) e `Step5Media.tsx` (756) acima de 400 linhas |
 | B18 | Painel admin — itens da auditoria de 2026-10-12 ainda abertos | §6.2, §6.4, §8, §11.7, §11.8 | médio | preço de planos em reais (Prompt 17.1); preço de item gravado como texto; catálogo e planos lidos direto do Firestore (deveria ser API, com limite); relatórios em branco antes de carregar e média 0.0 sem avaliações; card de eventos conta rascunhos; duas entradas (`/admin` e `?admin=1`); visitante sem login redirecionado sem aviso; tabs sem `role="tablist"` |
 | B19 | Modelo de eventos guarda contato em dois lugares (`phone` no topo e `contact.phone`) | §13, §6.3 | baixo | unificar em `contact` quando o editor único (Prompt 18.2) tocar no evento |
 | B20 | `operationalInfoSchema` duplicado em `server/domain/guide/schemas/guideSchema.ts` e `server/domain/partners/schemas/partnerContentSchema.ts` | §5.3 | baixo — as duas cópias precisam mudar juntas | rotas de conteúdo do parceiro passarem a validar com o schema publicado pelo `guide` (Published Language) |
@@ -22,6 +22,7 @@
 
 | ID | Resolução |
 |---|---|
+| Sessões do evento no editor — Prompt 18.2.1 | `EventSessionsField` e `saveEventSessionsUseCase` (events) usados pelo parceiro e pelo admin (decisão de 2026-10-19, opção A): o parceiro passa a editar datas, horários e capacidade; a data do evento é derivada das sessões; o editor do admin deixa de importar o gerenciador de ingressos de outro domínio (§5.2); `PartnerEventForm` dividido em seções (634 → 67 linhas) e modal em `PartnerEventEditor` (`PartnerPanel` abaixo de 400 linhas); o editor de evento não fecha ao clicar fora; botões do editor de evento com nome acessível |
 | Editor único de cadastro — Prompt 18.2 | `ListingEditor` (partners) usado pelo painel do parceiro e pelo admin (composição `AdminPanelComposition`); o admin edita hospedagem, restaurante, atração, passeio, translado, aluguel e perfil de produtor com os mesmos campos da inscrição; o editor não fecha ao clicar fora; `PartnerPanel.tsx` abaixo de 400 linhas; datas no fuso de Fortaleza no gerenciador de ingressos (AI Studio, lote 9); três critérios de "pronto para receber" unificados (17.2); preço de plano por `Intl` (17.1) |
 | Categorias passeio, translado e aluguel na inscrição e no editor — Prompt 18.1 | formulário com campos próprios por categoria (`steps/details/`), validação no `step3Schema`, gravação em `operationalInfo`; editor do painel sem CPF/CNPJ e com categoria travada em item existente; campo de arquivo do cardápio removido |
 | Painéis parceiro/admin — Prompt 17 | plano pago abre o checkout; visualizações e relatório de evento corretos; portal rola; sessões de evento não duplicam e são removidas no servidor; "Suspender" grava `suspended` e bloqueia; selo do admin sem mexer no plano; excluir parceiro com confirmação; filtro e categoria de evento; avisos com seleção limpa; datas dos formulários de evento no fuso de Fortaleza |

=== src/app/compositions/AdminPanelComposition.tsx — diff ===
@@ -1,5 +1,6 @@
 import { AdminDispatcher, type AdminListingEditorProps } from '../../domain/admin';
 import { useAuthContext } from '../../domain/auth/context/AuthContext';
+import { EventSessionsField } from '../../domain/events';
 import {
   createGuideItemUseCase,
   deleteGuideItemUseCase,
@@ -13,6 +14,7 @@ import {
   type PartnerContentItemInput,
   type PartnerContentRecord,
 } from '../../domain/partners';
+import { PartnerEventTicketingManager } from '../../domain/ticketing';
 
 // Cadastros novos que o admin pode criar pelo editor do parceiro (o servidor permite só estes ao admin).
 const ADMIN_LISTING_CATEGORIES = ['sight', 'tour'];
@@ -77,7 +79,18 @@ function AdminListingEditor({ item, onClose }: AdminListingEditorProps) {
   );
 }
 
-/** Painel admin com o editor de cadastro do parceiro (editor único, decisão D9). */
+/**
+ * Painel admin com os editores compartilhados: cadastro (o mesmo do parceiro, decisão D9), sessões do
+ * evento e gerenciador de ingressos.
+ */
 export function AdminPanelComposition() {
-  return <AdminDispatcher renderListingEditor={(props) => <AdminListingEditor {...props} />} />;
+  return (
+    <AdminDispatcher
+      renderListingEditor={(props) => <AdminListingEditor {...props} />}
+      renderSessionsField={(props) => <EventSessionsField {...props} />}
+      renderTicketingManager={(eventListingId) => (
+        <PartnerEventTicketingManager eventListingId={eventListingId} asAdmin />
+      )}
+    />
+  );
 }

=== src/app/compositions/PartnerPortalComposition.tsx — diff ===
@@ -1,4 +1,4 @@
-import React, { useEffect, useState } from 'react';
+import { useEffect, useState } from 'react';
 import { LogIn, RefreshCw, ShieldAlert } from 'lucide-react';
 import { useTranslation } from 'react-i18next';
 import { PartnerPanel, getPartnerProfileUseCase } from '../../domain/partners';
@@ -6,6 +6,7 @@ import type { PartnerProfile, SubscriptionPlan } from '../../domain/partners';
 import { getActiveSubscriptionPlansUseCase } from '../../domain/admin';
 import { UserRole } from '../../domain/auth/types/auth';
 import { useAuthContext } from '../../domain/auth/context/AuthContext';
+import { EventSessionsField } from '../../domain/events';
 import { ReportsView } from '../../domain/insights';
 import { CheckoutModal, isPaidPlanId, PlanSubscriptionCard } from '../../domain/payment';
 import { PartnerBookingsComposition } from './PartnerBookingsComposition';
@@ -173,6 +174,7 @@ export function PartnerPortalComposition() {
       renderEventTicketingManager={(eventListingId) => (
         <PartnerEventTicketingManager eventListingId={eventListingId} />
       )}
+      renderEventSessionsField={(props) => <EventSessionsField {...props} />}
     />
   );
 }

=== src/domain/admin/components/AdminDispatcher.tsx — diff ===
@@ -28,7 +28,7 @@ function RestrictedAdminAccess() {
   );
 }
 
-export function AdminDispatcher({ renderListingEditor }: AdminPanelProps = {}) {
+export function AdminDispatcher(slots: AdminPanelProps = {}) {
   const { goTo } = useLocalizedRouting();
   const { user, loading } = useAuthContext();
 
@@ -57,5 +57,5 @@ export function AdminDispatcher({ renderListingEditor }: AdminPanelProps = {}) {
     return <RestrictedAdminAccess />;
   }
 
-  return <AdminPanel renderListingEditor={renderListingEditor} />;
+  return <AdminPanel {...slots} />;
 }

=== src/domain/admin/components/AdminPanel.tsx — diff ===
@@ -11,11 +11,9 @@ import { ErrorState } from '../../../ui/components/ErrorState';
 import { CATEGORIES } from '../../../shared/constants/categories';
 import {
   createAdminEventListingUseCase,
-  createAdminEventOccurrenceUseCase,
   deleteAdminEventListingUseCase,
-  deleteAdminEventOccurrenceUseCase,
+  saveEventSessionsUseCase,
   updateAdminEventListingUseCase,
-  updateAdminEventOccurrenceUseCase,
 } from '../../events';
 import {
   createGuideItemUseCase,
@@ -39,6 +37,7 @@ import { AdminStatsView } from './subcomponents/AdminStatsView';
 import { AdminPartnersView } from './subcomponents/AdminPartnersView';
 import { AdminGuideView } from './subcomponents/AdminGuideView';
 import { AdminEditorModal, type AdminEditorSaveData } from './subcomponents/AdminEditorModal';
+import type { AdminEventSlots } from './subcomponents/AdminEditorEventFields';
 import { AdminPlansView } from './subcomponents/AdminPlansView';
 import { AdminNotificationsView } from './subcomponents/AdminNotificationsView';
 
@@ -60,7 +59,7 @@ export interface AdminListingEditorProps {
   onClose: () => void;
 }
 
-export interface AdminPanelProps {
+export interface AdminPanelProps extends AdminEventSlots {
   /**
    * Editor de cadastro (o mesmo do parceiro), montado pela composição do app. Dicas e eventos
    * continuam no editor próprio do admin.
@@ -68,7 +67,11 @@ export interface AdminPanelProps {
   renderListingEditor?: (props: AdminListingEditorProps) => ReactNode;
 }
 
-export function AdminPanel({ renderListingEditor }: AdminPanelProps = {}) {
+export function AdminPanel({
+  renderListingEditor,
+  renderSessionsField,
+  renderTicketingManager,
+}: AdminPanelProps = {}) {
   const { goTo } = useLocalizedRouting();
   const { user, loading: userLoading } = useAuthContext();
   const { showToast, confirmAction } = useUI();
@@ -161,26 +164,12 @@ export function AdminPanel({ renderListingEditor }: AdminPanelProps = {}) {
             editorData.id,
             toGuideEventUpdateInput(normalizedEventData)
           );
-          for (const occurrenceId of editorData.removedOccurrenceIds ?? []) {
-            await deleteAdminEventOccurrenceUseCase(editorData.id, occurrenceId);
-          }
-          if (Array.isArray(rawOccurrences)) {
-            for (const occ of rawOccurrences) {
-              if (occ.id) {
-                await updateAdminEventOccurrenceUseCase(editorData.id, occ.id, {
-                  startsAt: occ.startsAt,
-                  endsAt: occ.endsAt,
-                  capacity: occ.capacity,
-                });
-              } else {
-                await createAdminEventOccurrenceUseCase(editorData.id, {
-                  startsAt: occ.startsAt,
-                  endsAt: occ.endsAt,
-                  capacity: occ.capacity,
-                });
-              }
-            }
-          }
+          await saveEventSessionsUseCase({
+            eventListingId: editorData.id,
+            scope: 'admin',
+            savedIds: editorData.savedOccurrenceIds ?? [],
+            sessions: rawOccurrences ?? [],
+          });
         } else {
           const eventPayload = toGuideEventInput(normalizedEventData);
           await createAdminEventListingUseCase({
@@ -365,6 +354,8 @@ export function AdminPanel({ renderListingEditor }: AdminPanelProps = {}) {
             activeTab={activeTab as 'items' | 'events'}
             isAdminUser={isAdminUser}
             onSave={handleSaveRecord}
+            renderSessionsField={renderSessionsField}
+            renderTicketingManager={renderTicketingManager}
             onDeleteConfirm={async (id) => {
               if (activeTab === 'items') {
                 await deleteGuideItemUseCase(id);

=== src/domain/admin/components/subcomponents/AdminEditorEventFields.tsx — diff ===
@@ -1,30 +1,34 @@
-import React from 'react';
-import { useFieldArray, useFormContext } from 'react-hook-form';
-import { Plus, Trash2 } from 'lucide-react';
+import type { ReactNode } from 'react';
+import { useFormContext } from 'react-hook-form';
 import {
-  businessDateTimeToIso,
-  isoToBusinessDateTime,
-} from '../../../../shared/utils/businessDateTime';
-import { CUSTOM_EVENT_CATEGORY, EVENT_CATEGORIES } from '../../../events';
-import { PartnerEventTicketingManager } from '../../../ticketing';
+  CUSTOM_EVENT_CATEGORY,
+  EVENT_CATEGORIES,
+  type EventSessionsFieldProps,
+  type EventSessionsLoadState,
+} from '../../../events';
 import type { AdminGuideEditorSchemaValues } from '../../schemas/adminGuideEditorFormSchema';
 
-interface AdminEditorEventFieldsProps {
+export interface AdminEventSlots {
+  /** Campo de sessões do domínio events, montado pela composição do app. */
+  renderSessionsField?: (props: EventSessionsFieldProps) => ReactNode;
+  /** Gerenciador de ingressos do domínio ticketing, montado pela composição do app. */
+  renderTicketingManager?: (eventListingId: string) => ReactNode;
+}
+
+interface AdminEditorEventFieldsProps extends AdminEventSlots {
   eventListingId?: string;
-  occurrencesState: 'idle' | 'loading' | 'ready' | 'error';
+  occurrencesState: EventSessionsLoadState;
 }
 
 export function AdminEditorEventFields({
   eventListingId,
   occurrencesState,
+  renderSessionsField,
+  renderTicketingManager,
 }: AdminEditorEventFieldsProps) {
-  const { control, register, setValue, watch } = useFormContext<AdminGuideEditorSchemaValues>();
-  const { fields, append, remove } = useFieldArray({
-    control,
-    name: 'occurrences',
-  });
+  const { register, setValue, watch } = useFormContext<AdminGuideEditorSchemaValues>();
 
-  const occurrences = watch('occurrences') || [];
+  const occurrences = watch('occurrences');
   const eventCategory = watch('eventCategory') || '';
 
   return (
@@ -66,125 +70,21 @@ export function AdminEditorEventFields({
         )}
       </div>
 
-      {occurrencesState === 'loading' && (
-        <p role="status" className="px-2 text-xs text-white/60">
-          Carregando as sessões do evento...
-        </p>
-      )}
-      {occurrencesState === 'error' && (
-        <p role="alert" className="px-2 text-xs text-rose-300">
-          Não foi possível carregar as sessões deste evento. Feche e abra o editor de novo antes de
-          salvar.
-        </p>
-      )}
-      <p className="px-2 text-[11px] text-white/60">Horários no fuso de Fortaleza (UTC−3).</p>
-      <div className="flex items-center justify-between px-2">
-        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/50">
-          Ocorrências do Evento
-        </label>
-        <button
-          type="button"
-          onClick={() => {
-            const now = new Date();
-            const startIso = now.toISOString();
-            const endIso = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();
-            append({
-              startsAt: startIso,
-              endsAt: endIso,
-              capacity: 100,
-            });
-          }}
-          className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-teal-500/20 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
-        >
-          <Plus size={14} /> Adicionar Data
-        </button>
-      </div>
-
-      {fields.map((field, index) => {
-        const occ = occurrences[index];
-        return (
-          <div
-            key={field.id}
-            className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4"
-          >
-            <div className="flex items-center justify-between">
-              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
-                Sessão #{index + 1}
-              </span>
-              {fields.length > 1 && (
-                <button
-                  type="button"
-                  aria-label={`Remover sessão ${index + 1}`}
-                  onClick={() => remove(index)}
-                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
-                >
-                  <Trash2 size={14} />
-                </button>
-              )}
-            </div>
-
-            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
-              <div className="space-y-1.5">
-                <label className="text-[9px] font-bold uppercase tracking-widest text-white/50">
-                  Início
-                </label>
-                <input
-                  type="datetime-local"
-                  value={isoToBusinessDateTime(occ?.startsAt)}
-                  onChange={(e) => {
-                    const iso = businessDateTimeToIso(e.target.value);
-                    setValue(`occurrences.${index}.startsAt`, iso, {
-                      shouldDirty: true,
-                      shouldValidate: true,
-                    });
-                    if (index === 0) {
-                      setValue('date', iso, { shouldDirty: true });
-                    }
-                  }}
-                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
-                />
-              </div>
-
-              <div className="space-y-1.5">
-                <label className="text-[9px] font-bold uppercase tracking-widest text-white/50">
-                  Término
-                </label>
-                <input
-                  type="datetime-local"
-                  value={isoToBusinessDateTime(occ?.endsAt)}
-                  onChange={(e) => {
-                    const iso = businessDateTimeToIso(e.target.value);
-                    setValue(`occurrences.${index}.endsAt`, iso, {
-                      shouldDirty: true,
-                      shouldValidate: true,
-                    });
-                    if (index === 0) {
-                      setValue('endDate', iso, { shouldDirty: true });
-                    }
-                  }}
-                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
-                />
-              </div>
-            </div>
-
-            <div className="space-y-1.5">
-              <label className="text-[9px] font-bold uppercase tracking-widest text-white/50">
-                Capacidade Máxima
-              </label>
-              <input
-                type="number"
-                min={1}
-                {...register(`occurrences.${index}.capacity`, { valueAsNumber: true })}
-                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
-              />
-            </div>
-          </div>
-        );
+      {renderSessionsField?.({
+        sessions: (occurrences ?? []).map((occ) => ({
+          id: occ.id,
+          startsAt: occ.startsAt,
+          endsAt: occ.endsAt,
+          capacity: occ.capacity,
+        })),
+        onChange: (sessions) =>
+          setValue('occurrences', sessions, { shouldDirty: true, shouldValidate: true }),
+        loadState: occurrencesState === 'idle' ? 'ready' : occurrencesState,
       })}
 
-      {eventListingId && (
+      {eventListingId && renderTicketingManager && (
         <div className="pt-4 border-t border-white/10">
-          <PartnerEventTicketingManager eventListingId={eventListingId} asAdmin />
+          {renderTicketingManager(eventListingId)}
         </div>
       )}
     </div>

=== src/domain/admin/components/subcomponents/AdminEditorModal.tsx — diff ===
@@ -6,7 +6,12 @@ import { X, Trash2, RefreshCw } from 'lucide-react';
 import { CATEGORIES } from '../../../../shared/constants/categories';
 import { useUI } from '../../../../shared/stores/useUIStore';
 import { Z_INDEX } from '../../../../shared/constants/zIndex';
-import { listEventOccurrencesUseCase } from '../../../events';
+import {
+  eventDateRangeFromSessions,
+  listEventOccurrencesUseCase,
+  validateEventSessions,
+  type EventSessionsLoadState,
+} from '../../../events';
 import type { GuideItem } from '../../../guide';
 import { getImageUploadErrorMessage, uploadImageUseCase } from '../../../media';
 import {
@@ -16,7 +21,7 @@ import {
 import { AdminEditorBasicInfo } from './AdminEditorBasicInfo';
 import { AdminEditorGallery } from './AdminEditorGallery';
 import { AdminEditorLocation } from './AdminEditorLocation';
-import { AdminEditorEventFields } from './AdminEditorEventFields';
+import { AdminEditorEventFields, type AdminEventSlots } from './AdminEditorEventFields';
 import { AdminEditorActions } from './AdminEditorActions';
 
 // Atrações e passeios usam o editor de cadastro do parceiro (decisão D9); aqui ficam as dicas.
@@ -24,13 +29,11 @@ export const ADMIN_CREATABLE_ITEM_CATEGORIES = ['tips'] as const;
 
 export type AdminEditorSaveData = GuideItem & {
   occurrences?: AdminGuideEditorSchemaValues['occurrences'];
-  /** Sessões salvas que o admin removeu no editor e devem ser apagadas no servidor. */
-  removedOccurrenceIds?: string[];
+  /** Sessões que existiam quando o editor abriu (as ausentes de `occurrences` são apagadas). */
+  savedOccurrenceIds?: string[];
 };
 
-type OccurrencesLoadState = 'idle' | 'loading' | 'ready' | 'error';
-
-interface AdminEditorModalProps {
+interface AdminEditorModalProps extends AdminEventSlots {
   isEditing: GuideItem;
   setIsEditing: (item: GuideItem | null) => void;
   activeTab: 'items' | 'events';
@@ -46,12 +49,14 @@ export function AdminEditorModal({
   isAdminUser,
   onSave,
   onDeleteConfirm,
+  renderSessionsField,
+  renderTicketingManager,
 }: AdminEditorModalProps) {
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const { showToast } = useUI();
-  const [occurrencesState, setOccurrencesState] = useState<OccurrencesLoadState>('idle');
+  const [occurrencesState, setOccurrencesState] = useState<EventSessionsLoadState>('idle');
   const savedOccurrenceIdsRef = useRef<string[]>([]);
 
   const form = useForm<AdminGuideEditorSchemaValues>({
@@ -191,21 +196,23 @@ export function AdminEditorModal({
         showToast('Aguarde o carregamento das sessões do evento antes de salvar.', 'error');
         return;
       }
+      const sessions = values.occurrences ?? [];
+      if (activeTab === 'events') {
+        const sessionsError = validateEventSessions(sessions);
+        if (sessionsError) {
+          showToast(sessionsError, 'error');
+          return;
+        }
+      }
       setIsLoading(true);
       try {
-        const firstOccurrence = values.occurrences?.[0];
-        const keptIds = new Set(
-          (values.occurrences ?? []).map((occ) => occ.id).filter((id): id is string => Boolean(id))
-        );
         await onSave({
           ...isEditing,
           ...values,
           category: values.category as GuideItem['category'],
-          date: firstOccurrence?.startsAt || values.date,
-          endDate:
-            firstOccurrence?.endsAt || values.endDate || firstOccurrence?.startsAt || values.date,
-          occurrences: values.occurrences,
-          removedOccurrenceIds: savedOccurrenceIdsRef.current.filter((id) => !keptIds.has(id)),
+          ...(activeTab === 'events' ? eventDateRangeFromSessions(sessions) : {}),
+          occurrences: sessions,
+          savedOccurrenceIds: savedOccurrenceIdsRef.current,
         });
       } finally {
         setIsLoading(false);
@@ -344,6 +351,8 @@ export function AdminEditorModal({
                     <AdminEditorEventFields
                       eventListingId={isEditing.id || undefined}
                       occurrencesState={occurrencesState}
+                      renderSessionsField={renderSessionsField}
+                      renderTicketingManager={renderTicketingManager}
                     />
                   )}

=== src/domain/events/application/usecases/saveEventSessionsUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { calls, record } = vi.hoisted(() => {
  const calls: string[] = [];
  const record = (name: string) =>
    vi.fn(async () => {
      calls.push(name);
    });
  return { calls, record };
});

vi.mock('./createAdminEventOccurrenceUseCase', () => ({
  createAdminEventOccurrenceUseCase: record('admin:create'),
}));
vi.mock('./updateAdminEventOccurrenceUseCase', () => ({
  updateAdminEventOccurrenceUseCase: record('admin:update'),
}));
vi.mock('./deleteAdminEventOccurrenceUseCase', () => ({
  deleteAdminEventOccurrenceUseCase: record('admin:delete'),
}));
vi.mock('./createPartnerEventOccurrenceUseCase', () => ({
  createPartnerEventOccurrenceUseCase: record('partner:create'),
}));
vi.mock('./updatePartnerEventOccurrenceUseCase', () => ({
  updatePartnerEventOccurrenceUseCase: record('partner:update'),
}));
vi.mock('./deletePartnerEventOccurrenceUseCase', () => ({
  deletePartnerEventOccurrenceUseCase: record('partner:delete'),
}));

import { saveEventSessionsUseCase } from './saveEventSessionsUseCase';

const sessions = [
  {
    id: 'kept',
    startsAt: '2026-11-01T20:00:00.000Z',
    endsAt: '2026-11-01T23:00:00.000Z',
    capacity: 80,
  },
  { startsAt: '2026-11-02T20:00:00.000Z', endsAt: '2026-11-02T23:00:00.000Z', capacity: 80 },
];

describe('saveEventSessionsUseCase', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('parceiro: cria e altera antes de apagar, pelas rotas do parceiro', async () => {
    await saveEventSessionsUseCase({
      eventListingId: 'ev1',
      scope: 'partner',
      savedIds: ['kept', 'removed'],
      sessions,
    });
    expect(calls).toEqual(['partner:create', 'partner:update', 'partner:delete']);
  });

  it('admin usa as rotas do admin', async () => {
    await saveEventSessionsUseCase({
      eventListingId: 'ev1',
      scope: 'admin',
      savedIds: ['kept'],
      sessions,
    });
    expect(calls).toEqual(['admin:create', 'admin:update']);
  });
});

=== src/domain/events/application/usecases/saveEventSessionsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import type { EventSessionDraft, EventSessionsScope } from '../../types/eventSession';
import { planEventSessionChanges } from '../../utils/eventSessions';
import { createAdminEventOccurrenceUseCase } from './createAdminEventOccurrenceUseCase';
import { createPartnerEventOccurrenceUseCase } from './createPartnerEventOccurrenceUseCase';
import { deleteAdminEventOccurrenceUseCase } from './deleteAdminEventOccurrenceUseCase';
import { deletePartnerEventOccurrenceUseCase } from './deletePartnerEventOccurrenceUseCase';
import { updateAdminEventOccurrenceUseCase } from './updateAdminEventOccurrenceUseCase';
import { updatePartnerEventOccurrenceUseCase } from './updatePartnerEventOccurrenceUseCase';

export interface SaveEventSessionsInput {
  eventListingId: string;
  scope: EventSessionsScope;
  /** IDs das sessões que existiam quando o editor abriu. */
  savedIds: string[];
  sessions: EventSessionDraft[];
}

/**
 * Grava as sessões editadas de um evento já criado. Cria e altera antes de apagar, para o evento
 * nunca ficar sem sessão no meio da gravação; o servidor recusa apagar sessão com ingressos vendidos.
 */
export async function saveEventSessionsUseCase({
  eventListingId,
  scope,
  savedIds,
  sessions,
}: SaveEventSessionsInput): Promise<void> {
  const { toCreate, toUpdate, toDeleteIds } = planEventSessionChanges(savedIds, sessions);
  const create =
    scope === 'admin' ? createAdminEventOccurrenceUseCase : createPartnerEventOccurrenceUseCase;
  const update =
    scope === 'admin' ? updateAdminEventOccurrenceUseCase : updatePartnerEventOccurrenceUseCase;
  const remove =
    scope === 'admin' ? deleteAdminEventOccurrenceUseCase : deletePartnerEventOccurrenceUseCase;

  for (const session of toCreate) {
    await create(eventListingId, {
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      capacity: session.capacity,
    });
  }
  for (const session of toUpdate) {
    await update(eventListingId, session.id, {
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      capacity: session.capacity,
    });
  }
  for (const id of toDeleteIds) {
    await remove(eventListingId, id);
  }
}

=== src/domain/events/components/EventSessionsField.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EventSessionsField } from './EventSessionsField';

const one = [
  { startsAt: '2026-11-01T23:00:00.000Z', endsAt: '2026-11-02T02:00:00.000Z', capacity: 80 },
];

describe('EventSessionsField', () => {
  it('mostra os horários no fuso de Fortaleza e adiciona uma sessão', () => {
    const onChange = vi.fn();
    render(<EventSessionsField sessions={one} onChange={onChange} loadState="ready" />);
    expect(screen.getByLabelText('Início')).toHaveProperty('value', '2026-11-01T20:00');
    fireEvent.click(screen.getByRole('button', { name: /Adicionar data/ }));
    expect(onChange.mock.calls[0]?.[0]).toHaveLength(2);
  });

  it('só permite remover quando há mais de uma sessão', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <EventSessionsField sessions={one} onChange={onChange} loadState="ready" />
    );
    expect(screen.queryByRole('button', { name: /Remover sessão/ })).toBeNull();
    rerender(
      <EventSessionsField sessions={[...one, ...one]} onChange={onChange} loadState="ready" />
    );
    const [firstRemove] = screen.getAllByRole('button', { name: /Remover sessão/ });
    if (firstRemove) fireEvent.click(firstRemove);
    expect(onChange.mock.calls[0]?.[0]).toHaveLength(1);
  });

  it('não deixa editar enquanto as sessões salvas não carregaram', () => {
    render(<EventSessionsField sessions={[]} onChange={vi.fn()} loadState="error" />);
    expect(screen.getByRole('alert').textContent).toMatch(/Não foi possível carregar/);
    expect(screen.queryByRole('button', { name: /Adicionar data/ })).toBeNull();
  });
});

=== src/domain/events/components/EventSessionsField.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Plus, Trash2 } from 'lucide-react';
import {
  businessDateTimeToIso,
  isoToBusinessDateTime,
} from '../../../shared/utils/businessDateTime';
import type { EventSessionDraft, EventSessionsLoadState } from '../types/eventSession';
import { newEventSessionDraft } from '../utils/eventSessions';

export interface EventSessionsFieldProps {
  sessions: EventSessionDraft[];
  onChange: (sessions: EventSessionDraft[]) => void;
  /** Estado da leitura das sessões salvas; enquanto não está pronta, a lista não é editável. */
  loadState: EventSessionsLoadState;
}

const INPUT_CLASS =
  'w-full min-h-[44px] bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50 focus-visible:ring-2 focus-visible:ring-teal-400/50';

/** Sessões do evento (data, horário e capacidade), no fuso de Fortaleza. Usado pelo parceiro e pelo admin. */
export function EventSessionsField({ sessions, onChange, loadState }: EventSessionsFieldProps) {
  if (loadState === 'loading') {
    return (
      <p role="status" className="px-2 text-xs text-white/60">
        Carregando as sessões do evento...
      </p>
    );
  }
  if (loadState === 'error') {
    return (
      <p role="alert" className="px-2 text-xs text-rose-300">
        Não foi possível carregar as sessões deste evento. Feche e abra o editor de novo antes de
        salvar.
      </p>
    );
  }

  const updateSession = (index: number, patch: Partial<EventSessionDraft>) => {
    onChange(
      sessions.map((session, current) => (current === index ? { ...session, ...patch } : session))
    );
  };

  return (
    <div className="space-y-4" id="event-sessions-field">
      <p className="px-2 text-[11px] text-white/60">Horários no fuso de Fortaleza (UTC−3).</p>
      <div className="flex items-center justify-between px-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/50">
          Sessões do evento
        </span>
        <button
          type="button"
          onClick={() => onChange([...sessions, newEventSessionDraft()])}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-teal-500/20 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <Plus size={14} aria-hidden="true" /> Adicionar data
        </button>
      </div>

      {sessions.map((session, index) => {
        const label = `Sessão ${index + 1}`;
        return (
          <fieldset
            key={session.id ?? `new-${index}`}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <legend className="text-[10px] font-black uppercase tracking-widest text-white/60">
                {label}
              </legend>
              {sessions.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remover ${label.toLowerCase()}`}
                  onClick={() => onChange(sessions.filter((_, current) => current !== index))}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1.5 block">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">
                  Início
                </span>
                <input
                  type="datetime-local"
                  value={isoToBusinessDateTime(session.startsAt)}
                  onChange={(e) =>
                    updateSession(index, { startsAt: businessDateTimeToIso(e.target.value) })
                  }
                  className={INPUT_CLASS}
                />
              </label>
              <label className="space-y-1.5 block">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">
                  Término
                </span>
                <input
                  type="datetime-local"
                  value={isoToBusinessDateTime(session.endsAt)}
                  onChange={(e) =>
                    updateSession(index, { endsAt: businessDateTimeToIso(e.target.value) })
                  }
                  className={INPUT_CLASS}
                />
              </label>
            </div>

            <label className="space-y-1.5 block">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">
                Capacidade máxima
              </span>
              <input
                type="number"
                min={1}
                value={Number.isFinite(session.capacity) ? session.capacity : ''}
                onChange={(e) => updateSession(index, { capacity: e.target.valueAsNumber })}
                className={INPUT_CLASS}
              />
            </label>
          </fieldset>
        );
      })}
    </div>
  );
}

=== src/domain/events/index.ts — diff ===
@@ -25,3 +25,18 @@ export type {
   UpdateEventListingInput,
 } from './types/event';
 export { CUSTOM_EVENT_CATEGORY, EVENT_CATEGORIES } from './constants/eventCategories';
+export { saveEventSessionsUseCase } from './application/usecases/saveEventSessionsUseCase';
+export type { SaveEventSessionsInput } from './application/usecases/saveEventSessionsUseCase';
+export type {
+  EventSessionDraft,
+  EventSessionsLoadState,
+  EventSessionsScope,
+} from './types/eventSession';
+export {
+  eventDateRangeFromSessions,
+  newEventSessionDraft,
+  planEventSessionChanges,
+  validateEventSessions,
+} from './utils/eventSessions';
+// Só para src/app/compositions (§5.2).
+export { EventSessionsField, type EventSessionsFieldProps } from './components/EventSessionsField';

=== src/domain/events/types/eventSession.ts — ARQUIVO NOVO, conteúdo completo ===
/** Sessão de um evento em edição (data, horário e capacidade). `id` existe nas sessões já salvas. */
export interface EventSessionDraft {
  id?: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
}

export type EventSessionsLoadState = 'idle' | 'loading' | 'ready' | 'error';

/** Quem grava as sessões: cada um usa as rotas da própria área. */
export type EventSessionsScope = 'admin' | 'partner';

=== src/domain/events/utils/eventSessions.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import {
  eventDateRangeFromSessions,
  newEventSessionDraft,
  planEventSessionChanges,
  validateEventSessions,
} from './eventSessions';

const session = (startsAt: string, endsAt: string, id?: string) => ({
  ...(id ? { id } : {}),
  startsAt,
  endsAt,
  capacity: 50,
});

describe('eventSessions', () => {
  it('separa sessões novas, alteradas e removidas', () => {
    const changes = planEventSessionChanges(
      ['a', 'b'],
      [
        session('2026-11-01T20:00:00.000Z', '2026-11-01T23:00:00.000Z', 'a'),
        session('2026-11-02T20:00:00.000Z', '2026-11-02T23:00:00.000Z'),
      ]
    );
    expect(changes.toCreate).toHaveLength(1);
    expect(changes.toUpdate.map((s) => s.id)).toEqual(['a']);
    expect(changes.toDeleteIds).toEqual(['b']);
  });

  it('valida quantidade, horários e capacidade', () => {
    expect(validateEventSessions([])).toMatch(/ao menos uma sessão/);
    expect(
      validateEventSessions([session('2026-11-01T23:00:00.000Z', '2026-11-01T20:00:00.000Z')])
    ).toMatch(/sessão 1/);
    expect(
      validateEventSessions([
        { ...session('2026-11-01T20:00:00.000Z', '2026-11-01T23:00:00.000Z'), capacity: 0 },
      ])
    ).toMatch(/capacidade/);
    expect(
      validateEventSessions([session('2026-11-01T20:00:00.000Z', '2026-11-01T23:00:00.000Z')])
    ).toBeNull();
  });

  it('o período do evento vai do primeiro início ao último término', () => {
    expect(
      eventDateRangeFromSessions([
        session('2026-11-02T20:00:00.000Z', '2026-11-02T23:00:00.000Z'),
        session('2026-11-01T20:00:00.000Z', '2026-11-01T22:00:00.000Z'),
      ])
    ).toEqual({ date: '2026-11-01T20:00:00.000Z', endDate: '2026-11-02T23:00:00.000Z' });
  });

  it('sessão sugerida dura três horas', () => {
    const draft = newEventSessionDraft(new Date('2026-11-01T20:00:00.000Z'));
    expect(draft).toEqual({
      startsAt: '2026-11-01T20:00:00.000Z',
      endsAt: '2026-11-01T23:00:00.000Z',
      capacity: 100,
    });
  });
});

=== src/domain/events/utils/eventSessions.ts — ARQUIVO NOVO, conteúdo completo ===
import type { EventSessionDraft } from '../types/eventSession';

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

export interface EventSessionChanges {
  toCreate: EventSessionDraft[];
  toUpdate: Array<EventSessionDraft & { id: string }>;
  toDeleteIds: string[];
}

/** Compara as sessões salvas com as editadas: o que criar, alterar e apagar. */
export function planEventSessionChanges(
  savedIds: string[],
  sessions: EventSessionDraft[]
): EventSessionChanges {
  const keptIds = new Set(sessions.map((session) => session.id).filter(Boolean));
  return {
    toCreate: sessions.filter((session) => !session.id),
    toUpdate: sessions.filter((session): session is EventSessionDraft & { id: string } =>
      Boolean(session.id)
    ),
    toDeleteIds: savedIds.filter((id) => !keptIds.has(id)),
  };
}

/** Mensagem do primeiro problema encontrado, ou `null` se as sessões estão válidas. */
export function validateEventSessions(sessions: EventSessionDraft[]): string | null {
  if (sessions.length === 0) return 'Adicione ao menos uma sessão ao evento.';
  for (const [index, session] of sessions.entries()) {
    const start = new Date(session.startsAt).getTime();
    const end = new Date(session.endsAt).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) {
      return `Informe início e término da sessão ${index + 1}.`;
    }
    if (end <= start) {
      return `O término da sessão ${index + 1} deve ser depois do início.`;
    }
    if (!Number.isInteger(session.capacity) || session.capacity < 1) {
      return `A capacidade da sessão ${index + 1} deve ser de pelo menos 1 pessoa.`;
    }
  }
  return null;
}

/** Período do evento na agenda: do início da primeira sessão ao término da última. */
export function eventDateRangeFromSessions(sessions: EventSessionDraft[]): {
  date: string;
  endDate: string;
} {
  const starts = sessions.map((session) => new Date(session.startsAt).getTime());
  const ends = sessions.map((session) => new Date(session.endsAt).getTime());
  return {
    date: new Date(Math.min(...starts)).toISOString(),
    endDate: new Date(Math.max(...ends)).toISOString(),
  };
}

/** Sessão sugerida ao adicionar: começa agora e dura três horas. */
export function newEventSessionDraft(now: Date = new Date()): EventSessionDraft {
  return {
    startsAt: now.toISOString(),
    endsAt: new Date(now.getTime() + THREE_HOURS_MS).toISOString(),
    capacity: 100,
  };
}

=== src/domain/partners/components/PartnerEventEditor.tsx — ARQUIVO NOVO, conteúdo completo ===
import { RefreshCw, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ChangeEvent, ReactNode } from 'react';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import type { EventSessionsFieldProps, EventSessionsLoadState } from '../../events';
import type { PartnerBusiness } from '../types/partner';
import type { PartnerContentEditorState } from '../types/partnerContent';
import { PartnerEventForm } from './PartnerEventForm';

interface PartnerEventEditorProps {
  item: PartnerContentEditorState;
  onChange: (updatedItem: PartnerContentEditorState) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
  isUploading: boolean;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  businesses?: PartnerBusiness[];
  sessionsLoadState: EventSessionsLoadState;
  renderSessionsField?: (props: EventSessionsFieldProps) => ReactNode;
  renderEventTicketingManager?: (eventListingId: string) => ReactNode;
  showDeleteConfirm: boolean;
  onRequestDelete: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
}

/** Modal do editor de evento do parceiro, com a confirmação de exclusão. Não fecha ao clicar fora. */
export function PartnerEventEditor({
  item,
  onChange,
  onClose,
  onSave,
  isLoading,
  isUploading,
  onImageUpload,
  businesses,
  sessionsLoadState,
  renderSessionsField,
  renderEventTicketingManager,
  showDeleteConfirm,
  onRequestDelete,
  onConfirmDelete,
}: PartnerEventEditorProps) {
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
          aria-labelledby="partner-event-editor-title"
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: 'calc(85vh - env(safe-area-inset-bottom))' }}
          className="w-full max-w-xl glassmorphism-vibrant bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl relative z-10"
        >
          <div className="p-8 flex items-center justify-between flex-shrink-0">
            <div>
              <h3
                id="partner-event-editor-title"
                className="text-xl font-display font-black text-white tracking-tight"
              >
                {item.id ? 'Editar Evento' : 'Novo Evento'}
              </h3>
              <p className="text-[10px] text-white/50 font-medium tracking-wide">
                Preencha os detalhes do seu evento
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar editor de evento"
              className="w-11 h-11 flex items-center justify-center bg-white/5 rounded-2xl text-white/50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>

          <PartnerEventForm
            item={item}
            onChange={onChange}
            isUploading={isUploading}
            onImageUpload={onImageUpload}
            businesses={businesses}
            sessionsLoadState={sessionsLoadState}
            renderSessionsField={renderSessionsField}
            renderEventTicketingManager={renderEventTicketingManager}
          />

          <div className="p-8 border-t border-white/5 flex gap-3 items-center flex-shrink-0">
            <button
              type="button"
              onClick={onSave}
              disabled={isLoading}
              className="flex-1 min-h-[44px] bg-[#00D4FF] text-black py-4 rounded-2xl font-semibold tracking-wide text-[12px] shadow-lg shadow-[#00D4FF]/20 active:scale-95 flex items-center justify-center gap-2 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:scale-100 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {isLoading && <RefreshCw className="animate-spin" size={16} aria-hidden="true" />}
              Salvar
            </button>
            {item.id && (
              <button
                type="button"
                onClick={() => onRequestDelete(true)}
                disabled={isLoading}
                aria-label="Excluir evento"
                className="py-4 px-4 aspect-square bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl flex items-center justify-center transition-all hover:bg-rose-500 hover:text-white flex-shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            )}
          </div>
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
              aria-labelledby="partner-event-delete-title"
              className="w-full max-w-xs bg-[#0A0C10] rounded-[2.5rem] border border-white/10 p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto shadow-2xl shadow-rose-500/10">
                <Trash2 size={32} aria-hidden="true" />
              </div>
              <div>
                <h3
                  id="partner-event-delete-title"
                  className="text-lg font-display font-black text-white"
                >
                  Excluir {item.name || 'evento'}?
                </h3>
                <p className="text-white/50 text-xs mt-2 leading-relaxed">
                  Esta ação não poderá ser desfeita.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  disabled={isLoading}
                  className="w-full min-h-[44px] bg-rose-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-rose-500/20 transition-all hover:bg-rose-400 active:scale-95 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  {isLoading ? (
                    <RefreshCw className="animate-spin" size={14} aria-hidden="true" />
                  ) : (
                    <Trash2 size={14} aria-hidden="true" />
                  )}
                  Excluir
                </button>
                <button
                  type="button"
                  onClick={() => onRequestDelete(false)}
                  className="w-full min-h-[44px] bg-white/5 text-white/50 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
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

=== src/domain/partners/components/PartnerEventForm.tsx — diff ===
@@ -1,109 +1,23 @@
-import React, { useState, useRef, useEffect } from 'react';
-import { zodResolver } from '@hookform/resolvers/zod';
-import { useForm, type Resolver } from 'react-hook-form';
-import {
-  Building2,
-  Phone,
-  Globe,
-  MapPin,
-  Camera,
-  CheckCircle2,
-  Trash2,
-  Upload,
-  RefreshCw,
-  ChevronDown,
-  Check,
-  Hash,
-  Ticket,
-} from 'lucide-react';
-import { cn } from '../../../shared/utils/cn';
-import { REGIONS } from '../../../shared/constants/regions';
-import {
-  partnerEventFormSchema,
-  type PartnerEventFormValues,
-} from '../schemas/partnerEventFormSchema';
+import { CalendarClock } from 'lucide-react';
+import type { ChangeEvent, ReactNode } from 'react';
+import type { EventSessionsFieldProps, EventSessionsLoadState } from '../../events';
 import type { PartnerBusiness } from '../types/partner';
 import type { PartnerContentEditorState } from '../types/partnerContent';
-import { businessDateTimeToIso, isoToBusinessDateTime } from '../../../shared/utils/businessDateTime';
-import { EVENT_CATEGORIES } from '../../events';
-import { E164PhoneField } from '../../../ui/components/E164PhoneField';
-
-
-function RegionDropdown({
-  value,
-  onChange,
-  placeholder,
-  hasError,
-}: {
-  value: string;
-  onChange: (val: string) => void;
-  placeholder: string;
-  hasError?: boolean;
-}) {
-  const [isOpen, setIsOpen] = useState(false);
-  const dropdownRef = useRef<HTMLDivElement>(null);
-
-  useEffect(() => {
-    function handleClickOutside(event: MouseEvent) {
-      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
-        setIsOpen(false);
-      }
-    }
-    document.addEventListener('mousedown', handleClickOutside);
-    return () => document.removeEventListener('mousedown', handleClickOutside);
-  }, []);
-
-  return (
-    <div className="relative w-full" ref={dropdownRef}>
-      <button
-        type="button"
-        onClick={() => setIsOpen(!isOpen)}
-        className={cn(
-          'w-full bg-white/5 border rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-left flex items-center justify-between hover:bg-white/10',
-          hasError ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-white/10'
-        )}
-      >
-        <span className={value ? 'text-white' : 'text-white/50'}>{value || placeholder}</span>
-        <ChevronDown
-          size={16}
-          className={cn(
-            'text-white/50 transition-transform duration-200',
-            isOpen ? 'transform rotate-180' : ''
-          )}
-        />
-      </button>
-
-      {isOpen && (
-        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 py-1 max-h-60 overflow-y-auto no-scrollbar">
-          {REGIONS.map((region) => (
-            <button
-              key={region}
-              type="button"
-              onClick={() => {
-                onChange(region);
-                setIsOpen(false);
-              }}
-              className="w-full px-5 py-3.5 text-left text-white text-sm hover:bg-white/5 flex items-center justify-between transition-colors font-medium border-b border-white/[0.02]"
-            >
-              <span className={value === region ? 'text-indigo-400 font-bold' : 'text-white/85'}>
-                {region}
-              </span>
-              {value === region && <Check size={14} className="text-indigo-400" />}
-            </button>
-          ))}
-        </div>
-      )}
-    </div>
-  );
-}
+import { EventBasicsSection } from './event/EventBasicsSection';
+import { EventContactSection } from './event/EventContactSection';
+import { EventEntrySection } from './event/EventEntrySection';
+import { EventPhotosSection } from './event/EventPhotosSection';
 
 interface PartnerEventFormProps {
   item: PartnerContentEditorState;
   onChange: (updatedItem: PartnerContentEditorState) => void;
   isUploading: boolean;
-  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
+  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
   businesses?: PartnerBusiness[];
-  renderEventTicketingManager?: (eventListingId: string) => React.ReactNode;
+  sessionsLoadState: EventSessionsLoadState;
+  /** Campo de sessões do domínio events, montado pela composição do app. */
+  renderSessionsField?: (props: EventSessionsFieldProps) => ReactNode;
+  renderEventTicketingManager?: (eventListingId: string) => ReactNode;
 }
 
 export function PartnerEventForm({
@@ -112,523 +26,42 @@ export function PartnerEventForm({
   isUploading,
   onImageUpload,
   businesses,
+  sessionsLoadState,
+  renderSessionsField,
   renderEventTicketingManager,
 }: PartnerEventFormProps) {
-  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
-  const [isEstablishmentOpen, setIsEstablishmentOpen] = useState(false);
-  const categoryRef = useRef<HTMLDivElement>(null);
-  const establishmentRef = useRef<HTMLDivElement>(null);
-
-  const { reset } = useForm<PartnerEventFormValues>({
-    resolver: zodResolver(partnerEventFormSchema) as unknown as Resolver<PartnerEventFormValues>,
-  });
-
-  useEffect(() => {
-    reset({
-      name: item?.name || '',
-      description: item?.description || '',
-      eventCategory: item?.eventCategory || '',
-      customCategory: item?.customCategory || '',
-      establishmentId: item?.establishmentId || '',
-      date: item?.date || '',
-      endDate: item?.endDate || '',
-      location: item?.location || '',
-      googleMapsLink: item?.googleMapsLink || '',
-      images: item?.images || [],
-      image: item?.image || '',
-      entryType: item?.entryType || 'gratuito',
-      phone: item?.phone || '',
-      websiteLink: item?.websiteLink || '',
-      instagramLink: item?.instagramLink || '',
-      address: item?.address || '',
-    });
-  }, [item, reset]);
-
-  const partnerEstablishments = (businesses ?? []).filter(
-    (business) => business.type === 'item'
-  );
-
-  const selectedEstablishment = partnerEstablishments.find(
-    (business) => business.businessId === item.establishmentId
-  );
-
-  const isEditingExistingEvent = Boolean(item.id);
-
-  useEffect(() => {
-    function handleClickOutside(event: MouseEvent) {
-      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
-        setIsCategoryOpen(false);
-      }
-      if (establishmentRef.current && !establishmentRef.current.contains(event.target as Node)) {
-        setIsEstablishmentOpen(false);
-      }
-    }
-    document.addEventListener('mousedown', handleClickOutside);
-    return () => document.removeEventListener('mousedown', handleClickOutside);
-  }, []);
-
-  const updateField = (field: string, value: any) => {
-    onChange({ ...item, [field]: value });
-  };
-
   return (
     <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-10 no-scrollbar">
-      <div className="space-y-6">
-        <div className="flex items-center gap-2">
-          <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
-            <Building2 size={18} />
-          </span>
-          <h3 className="text-sm font-black text-white uppercase tracking-widest">
-            Informações Básicas
-          </h3>
-        </div>
-
-        <div className="space-y-4">
-          {/* Todo evento pertence a um estabelecimento ou ao perfil de produtor (decisão D9). */}
-          {(
-            <div className="space-y-2 relative" ref={establishmentRef}>
-              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-                Estabelecimento ou perfil de produtor <span className="text-rose-500 font-bold">*</span>
-              </label>
-              {isEditingExistingEvent ? (
-                <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white/70 text-sm flex items-center justify-between cursor-not-allowed">
-                  <span>
-                    {selectedEstablishment?.businessName ||
-                      item.establishmentId ||
-                      'Estabelecimento vinculado'}
-                  </span>
-                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
-                    Somente leitura
-                  </span>
-                </div>
-              ) : (
-                <>
-                  <button
-                    type="button"
-                    onClick={() => setIsEstablishmentOpen(!isEstablishmentOpen)}
-                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-left flex items-center justify-between hover:bg-white/10"
-                  >
-                    <span className={selectedEstablishment ? 'text-white' : 'text-white/50'}>
-                      {selectedEstablishment?.businessName ||
-                        'Selecione o estabelecimento...'}
-                    </span>
-                    <ChevronDown
-                      size={16}
-                      className={cn(
-                        'text-white/50 transition-transform duration-200',
-                        isEstablishmentOpen ? 'transform rotate-180' : ''
-                      )}
-                    />
-                  </button>
-
-                  {isEstablishmentOpen && (
-                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 py-1 max-h-60 overflow-y-auto no-scrollbar">
-                      {partnerEstablishments.length === 0 ? (
-                        <div className="px-5 py-3.5 text-white/50 text-xs">
-                          Nenhum estabelecimento cadastrado no seu perfil.
-                        </div>
-                      ) : (
-                        partnerEstablishments.map((est) => (
-                          <button
-                            key={est.businessId}
-                            type="button"
-                            onClick={() => {
-                              updateField('establishmentId', est.businessId);
-                              setIsEstablishmentOpen(false);
-                            }}
-                            className="w-full px-5 py-3.5 text-left text-white text-sm hover:bg-white/5 flex items-center justify-between transition-colors font-medium border-b border-white/[0.02]"
-                          >
-                            <span
-                              className={
-                                item.establishmentId === est.businessId
-                                  ? 'text-indigo-400 font-bold'
-                                  : 'text-white/80'
-                              }
-                            >
-                              {est.businessName}
-                            </span>
-                            {item.establishmentId === est.businessId && (
-                              <Check size={14} className="text-indigo-400" />
-                            )}
-                          </button>
-                        ))
-                      )}
-                    </div>
-                  )}
-                </>
-              )}
-            </div>
-          )}
-
-          <div className="space-y-2">
-            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-              Nome do Evento <span className="text-rose-500 font-bold">*</span>
-            </label>
-            <input
-              type="text"
-              value={item.name || ''}
-              onChange={(e) => updateField('name', e.target.value)}
-              maxLength={100}
-              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
-              placeholder="Ex: Show na Praia, Sunset Party..."
-            />
-          </div>
-
-          <div className="space-y-2 relative" ref={categoryRef}>
-            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-              Categoria <span className="text-rose-500 font-bold">*</span>
-            </label>
-            <button
-              type="button"
-              onClick={() => {
-                setIsCategoryOpen(!isCategoryOpen);
-              }}
-              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-left flex items-center justify-between hover:bg-white/10"
-            >
-              <span className={item.eventCategory ? 'text-white' : 'text-white/50'}>
-                {item.eventCategory || 'Selecione uma categoria...'}
-              </span>
-              <ChevronDown
-                size={16}
-                className={cn(
-                  'text-white/50 transition-transform duration-200',
-                  isCategoryOpen ? 'transform rotate-180' : ''
-                )}
-              />
-            </button>
-
-            {isCategoryOpen && (
-              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 py-1 max-h-60 overflow-y-auto no-scrollbar">
-                {EVENT_CATEGORIES.map((cat) => (
-                  <button
-                    key={cat}
-                    type="button"
-                    onClick={() => {
-                      onChange({
-                        ...item,
-                        eventCategory: cat,
-                        ...(cat !== 'Outro' && { customCategory: '' }),
-                      });
-                      setIsCategoryOpen(false);
-                    }}
-                    className="w-full px-5 py-3.5 text-left text-white text-sm hover:bg-white/5 flex items-center justify-between transition-colors font-medium border-b border-white/[0.02]"
-                  >
-                    <span
-                      className={
-                        item.eventCategory === cat ? 'text-indigo-400 font-bold' : 'text-white/80'
-                      }
-                    >
-                      {cat}
-                    </span>
-                    {item.eventCategory === cat && <Check size={14} className="text-indigo-400" />}
-                  </button>
-                ))}
-              </div>
-            )}
-          </div>
-
-          {item.eventCategory === 'Outro' && (
-            <div className="space-y-2 animate-fade-in relative z-10">
-              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-                Especifique a Categoria <span className="text-rose-500 font-bold">*</span>
-              </label>
-              <input
-                type="text"
-                value={item.customCategory || ''}
-                onChange={(e) => updateField('customCategory', e.target.value)}
-                maxLength={100}
-                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
-                placeholder="Ex: Luau, Palestra, Workshop..."
-              />
-            </div>
-          )}
-
-          <div className="space-y-2">
-            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-              Data e Hora de Início <span className="text-rose-500 font-bold">*</span>
-            </label>
-            <input
-              type="datetime-local"
-              value={isoToBusinessDateTime(item.date)}
-              onChange={(e) => updateField('date', businessDateTimeToIso(e.target.value))}
-              className="w-[85%] bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
-            />
-          </div>
-
-          <div className="space-y-2">
-            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-              Data e Hora de Término <span className="text-rose-500 font-bold">*</span>
-            </label>
-            <input
-              type="datetime-local"
-              value={isoToBusinessDateTime(item.endDate)}
-              onChange={(e) => updateField('endDate', businessDateTimeToIso(e.target.value))}
-              className="w-[85%] bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
-            />
-          </div>
-
-          <div className="space-y-2">
-            <div className="flex justify-between items-center px-1">
-              <label className="text-[10px] font-black uppercase tracking-widest text-white/50">
-                Descrição do Evento
-              </label>
-              <span className="text-[10px] font-bold text-white/50">
-                {item.description?.length || 0}/400
-              </span>
-            </div>
-            <textarea
-              value={item.description || ''}
-              onChange={(e) => updateField('description', e.target.value.slice(0, 400))}
-              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50 resize-none h-32 no-scrollbar"
-              placeholder="Descreva os detalhes importantes, atrações ou diferenciais do evento..."
-            />
-          </div>
-        </div>
-      </div>
+      <EventBasicsSection item={item} onChange={onChange} businesses={businesses} />
 
       <div className="space-y-6 pt-4 border-t border-white/5">
         <div className="flex items-center gap-2">
           <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
-            <Ticket size={18} />
+            <CalendarClock size={18} aria-hidden="true" />
           </span>
           <h3 className="text-sm font-black text-white uppercase tracking-widest">
-            Entradas / Ingressos
+            Datas e capacidade
           </h3>
         </div>
-
-        <div className="grid grid-cols-2 gap-4">
-          <button
-            type="button"
-            onClick={() => updateField('entryType', 'pago')}
-            className={cn(
-              'relative overflow-hidden py-4 px-6 rounded-2xl border text-sm font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md',
-              item.entryType === 'pago'
-                ? 'bg-indigo-500/80 border-indigo-500/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
-                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
-            )}
-          >
-            Pago
-          </button>
-
-          <button
-            type="button"
-            onClick={() => updateField('entryType', 'gratuito')}
-            className={cn(
-              'relative overflow-hidden py-4 px-6 rounded-2xl border text-sm font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md',
-              !item.entryType || item.entryType === 'gratuito'
-                ? 'bg-indigo-500/50 border-indigo-500/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
-                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
-            )}
-          >
-            Entrada gratuita
-          </button>
-        </div>
-
-        {item.id && renderEventTicketingManager && (
-          <div className="pt-4">{renderEventTicketingManager(item.id)}</div>
-        )}
-      </div>
-
-      <div className="space-y-6 pt-4 border-t border-white/5">
-        <div className="flex items-center gap-2">
-          <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
-            <Phone size={18} />
-          </span>
-          <h3 className="text-sm font-black text-white uppercase tracking-widest">
-            Contato e Localização
-          </h3>
-        </div>
-
-        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
-          <div className="space-y-2">
-            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-              WhatsApp de Contato / Reservas
-            </label>
-            <E164PhoneField
-              id="partner-event-phone"
-              value={item.phone}
-              onChange={(e164) => updateField('phone', e164)}
-            />
-          </div>
-
-          <div className="space-y-2">
-            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-              Site / Link de Ingressos
-            </label>
-            <div className="relative">
-              <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
-              <input
-                type="text"
-                placeholder="https://..."
-                value={item.websiteLink || ''}
-                onChange={(e) => updateField('websiteLink', e.target.value)}
-                maxLength={300}
-                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
-              />
-            </div>
-          </div>
-
-          <div className="space-y-2">
-            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-              Instagram do Evento
-            </label>
-            <div className="relative">
-              <Camera
-                size={16}
-                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
-              />
-              <input
-                type="text"
-                placeholder="@perfil"
-                value={item.instagramLink || ''}
-                onChange={(e) => updateField('instagramLink', e.target.value)}
-                maxLength={300}
-                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
-              />
-            </div>
-          </div>
-
-          <div className="space-y-2">
-            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-              Google Maps (Local) <span className="text-rose-500 font-bold">*</span>
-            </label>
-            <div className="relative">
-              <MapPin
-                size={16}
-                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
-              />
-              <input
-                type="text"
-                placeholder="Link da localização"
-                value={item.googleMapsLink || ''}
-                onChange={(e) => updateField('googleMapsLink', e.target.value)}
-                maxLength={300}
-                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
-              />
-            </div>
-          </div>
-
-          <div className="space-y-2 sm:col-span-2">
-            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-              Região / Bairro <span className="text-rose-500 font-bold">*</span>
-            </label>
-            <div className="relative">
-              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 z-10 pointer-events-none">
-                <Hash size={16} />
-              </div>
-              <RegionDropdown
-                value={item.location || ''}
-                onChange={(val) => updateField('location', val)}
-                placeholder="Selecione uma região..."
-              />
-            </div>
-          </div>
-        </div>
-
-        <div className="space-y-2">
-          <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-            Endereço do Local
-          </label>
-          <div className="relative">
-            <Building2
-              size={16}
-              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
-            />
-            <input
-              type="text"
-              placeholder="Rua, Número, Referência..."
-              value={item.address || ''}
-              onChange={(e) => updateField('address', e.target.value)}
-              maxLength={300}
-              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
-            />
-          </div>
-        </div>
+        {renderSessionsField?.({
+          sessions: item.sessions ?? [],
+          onChange: (sessions) => onChange({ ...item, sessions }),
+          loadState: sessionsLoadState,
+        })}
       </div>
 
-      <div className="space-y-6 pt-4 border-t border-white/5">
-        <div className="flex items-center gap-2">
-          <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
-            <Camera size={18} />
-          </span>
-          <h3 className="text-sm font-black text-white uppercase tracking-widest">
-            Fotos do Evento
-          </h3>
-        </div>
-
-        <div className="grid grid-cols-3 gap-3">
-          {(item.images || []).map((img: string, i: number) => (
-            <div
-              key={i}
-              className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-lg"
-            >
-              <img
-                src={img}
-                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
-                alt=""
-              />
-              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
-                <button
-                  type="button"
-                  onClick={() => updateField('image', img)}
-                  aria-label="Definir como principal"
-                  className={cn(
-                    'p-2 rounded-lg transition-all',
-                    item.image === img
-                      ? 'bg-emerald-500 text-white'
-                      : 'bg-white/20 text-white hover:bg-white/40'
-                  )}
-                  title="Definir como principal"
-                >
-                  <CheckCircle2 size={14} />
-                </button>
-                <button
-                  type="button"
-                  aria-label="Remover foto"
-                  onClick={() => {
-                    const newImgs = (item.images || []).filter((_: string, idx: number) => idx !== i);
-                    onChange({
-                      ...item,
-                      images: newImgs,
-                      image: item.image === img ? newImgs[0] || '' : item.image,
-                    });
-                  }}
-                  className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-500 transition-all"
-                >
-                  <Trash2 size={14} />
-                </button>
-              </div>
-              {item.image === img && (
-                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-xl">
-                  Principal
-                </div>
-              )}
-            </div>
-          ))}
-          {(item.images || []).length < 5 && (
-            <label
-              className={cn(
-                'aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all gap-2',
-                isUploading
-                  ? 'border-indigo-500/20 bg-indigo-500/5 animate-pulse'
-                  : 'border-white/5 hover:border-indigo-500/30 hover:bg-white/5'
-              )}
-            >
-              <input type="file" className="hidden" onChange={onImageUpload} multiple />
-              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50">
-                {isUploading ? (
-                  <RefreshCw className="animate-spin" size={16} />
-                ) : (
-                  <Upload size={16} />
-                )}
-              </div>
-              <span className="text-[8px] font-black uppercase tracking-widest text-white/50">
-                Add Fotos
-              </span>
-            </label>
-          )}
-        </div>
-      </div>
+      <EventEntrySection
+        item={item}
+        onChange={onChange}
+        renderEventTicketingManager={renderEventTicketingManager}
+      />
+      <EventContactSection item={item} onChange={onChange} />
+      <EventPhotosSection
+        item={item}
+        onChange={onChange}
+        isUploading={isUploading}
+        onImageUpload={onImageUpload}
+      />
     </div>
   );
 }

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -1,19 +1,20 @@
-import { BarChart3, RefreshCw, Trash2, X } from 'lucide-react';
-import { AnimatePresence, motion } from 'motion/react';
+import { BarChart3, RefreshCw } from 'lucide-react';
+import { AnimatePresence } from 'motion/react';
 import React, { useRef } from 'react';
-import { Z_INDEX } from '../../../shared/constants/zIndex';
 
 // Componentes estruturais e utilitários da UI
 import { BackgroundBlobs } from '../../../ui/components/BackgroundBlobs';
 import { createPartnerContentItemUseCase } from '../application/usecases/createPartnerContentItemUseCase';
 import { deletePartnerContentItemUseCase } from '../application/usecases/deletePartnerContentItemUseCase';
 import { updatePartnerContentItemUseCase } from '../application/usecases/updatePartnerContentItemUseCase';
+import { type EventSessionsFieldProps, newEventSessionDraft } from '../../events';
 import { useEditorScrollLock } from '../hooks/useEditorScrollLock';
+import { usePartnerEventSessions } from '../hooks/usePartnerEventSessions';
 import { usePartnerPanelActions } from '../hooks/usePartnerPanelActions';
 import { PartnerProfile, SubscriptionPlan } from '../types/partner';
 import type { PartnerContentRecord } from '../types/partnerContent';
 import { ListingEditor } from './ListingEditor';
-import { PartnerEventForm } from './PartnerEventForm';
+import { PartnerEventEditor } from './PartnerEventEditor';
 import { PartnerEventsTable } from './subcomponents/PartnerEventsTable';
 import { PartnerHeader } from './subcomponents/PartnerHeader';
 import { PartnerItemsTable } from './subcomponents/PartnerItemsTable';
@@ -39,6 +40,8 @@ export interface PartnerPanelProps {
     onPaymentSuccess: () => void;
   }) => React.ReactNode;
   renderEventTicketingManager?: (eventListingId: string) => React.ReactNode;
+  /** Campo de sessões do evento (domínio events), montado pela composição do app. */
+  renderEventSessionsField?: (props: EventSessionsFieldProps) => React.ReactNode;
   planSubscriptionSlot?: React.ReactNode;
   renderBookableOffersManager?: (
     items: Array<{ id: string; name: string; category: string }>
@@ -54,6 +57,7 @@ export function PartnerPanel({
   renderNotificationBell,
   renderCheckoutModal,
   renderEventTicketingManager,
+  renderEventSessionsField,
   planSubscriptionSlot,
   renderBookableOffersManager,
   onPlanPurchased,
@@ -88,6 +92,10 @@ export function PartnerPanel({
     PartnerContentRecord | null | undefined
   >(undefined);
   useEditorScrollLock(Boolean(isEditing));
+  const editingEventId = isEditing?.category === 'event' ? isEditing.id || undefined : undefined;
+  const eventSessions = usePartnerEventSessions(editingEventId, (sessions) =>
+    setIsEditing((current) => (current ? { ...current, sessions } : current))
+  );
 
   const [showPlansModal, setShowPlansModal] = React.useState(false);
   const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
@@ -216,85 +224,36 @@ export function PartnerPanel({
                 image: '',
                 images: [],
                 operationalInfo: {},
+                sessions: [newEventSessionDraft()],
               })
             }
           />
         )}
       </div>
 
-      {/* Editor Modal */}
       <AnimatePresence>
         {isEditing && isEditing.category === 'event' && (
-          <motion.div
-            initial={{ opacity: 0 }}
-            animate={{ opacity: 1 }}
-            exit={{ opacity: 0 }}
-            onClick={(e) => {
-              if (e.target === e.currentTarget) setIsEditing(null);
-            }}
-            style={{ zIndex: Z_INDEX.modal }}
-            className="fixed inset-0 flex overflow-y-auto no-scrollbar justify-center items-start pt-[7.5vh] pb-[7.5vh] px-4 bg-black/5 backdrop-blur-xl"
-          >
-            <motion.div
-              initial={{ scale: 0.95, y: 15, opacity: 0 }}
-              animate={{ scale: 1, y: 0, opacity: 1 }}
-              exit={{ scale: 0.95, y: 15, opacity: 0 }}
-              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
-              style={{ height: 'calc(85vh - env(safe-area-inset-bottom))' }}
-              className="w-full max-w-xl glassmorphism-vibrant bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl relative z-10"
-            >
-              <div className="p-8 flex items-center justify-between flex-shrink-0">
-                <div>
-                  <h3 className="text-xl font-display font-black text-white tracking-tight">
-                    {isEditing.id ? 'Editar Evento' : 'Novo Evento'}
-                  </h3>
-                  <p className="text-[10px] text-white/50 font-medium tracking-wide">
-                    Preencha os detalhes do seu evento
-                  </p>
-                </div>
-                <button
-                  onClick={() => setIsEditing(null)}
-                  className="p-3 bg-white/5 rounded-2xl text-white/50"
-                >
-                  <X size={24} />
-                </button>
-              </div>
-
-              <PartnerEventForm
-                item={isEditing}
-                onChange={(updatedItem) => setIsEditing(updatedItem)}
-                isUploading={isUploading}
-                onImageUpload={handleImageUpload}
-                businesses={partnerProfile?.businesses}
-                renderEventTicketingManager={renderEventTicketingManager}
-              />
-
-              <div className="p-8 border-t border-white/5 flex gap-3 items-center flex-shrink-0">
-                <button
-                  onClick={async () => {
-                    await handleSaveEvent();
-                  }}
-                  disabled={isLoading}
-                  className={`flex-1 bg-[#00D4FF] text-black py-4 rounded-2xl font-semibold tracking-wide text-[12px] shadow-lg shadow-[#00D4FF]/20 active:scale-95 flex items-center justify-center gap-2 ${
-                    isLoading
-                      ? 'cursor-not-allowed opacity-80'
-                      : 'hover:scale-[1.02] cursor-pointer'
-                  }`}
-                >
-                  {isLoading && <RefreshCw className="animate-spin" size={16} />} Salvar
-                </button>
-                {isEditing.id && (
-                  <button
-                    onClick={() => setShowDeleteConfirm(true)}
-                    disabled={isLoading}
-                    className="py-4 px-4 aspect-square bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl flex items-center justify-center transition-all hover:bg-rose-500 hover:text-white flex-shrink-0"
-                  >
-                    <Trash2 size={16} />
-                  </button>
-                )}
-              </div>
-            </motion.div>
-          </motion.div>
+          <PartnerEventEditor
+            item={isEditing}
+            onChange={(updatedItem) => setIsEditing(updatedItem)}
+            onClose={() => setIsEditing(null)}
+            onSave={() =>
+              handleSaveEvent({
+                sessionsLoadState: eventSessions.loadState,
+                savedSessionIds: eventSessions.savedIds,
+              })
+            }
+            isLoading={isLoading}
+            isUploading={isUploading}
+            onImageUpload={handleImageUpload}
+            businesses={partnerProfile?.businesses}
+            sessionsLoadState={eventSessions.loadState}
+            renderSessionsField={renderEventSessionsField}
+            renderEventTicketingManager={renderEventTicketingManager}
+            showDeleteConfirm={showDeleteConfirm}
+            onRequestDelete={setShowDeleteConfirm}
+            onConfirmDelete={handleDelete}
+          />
         )}
       </AnimatePresence>
 
@@ -317,56 +276,6 @@ export function PartnerPanel({
         )}
       </AnimatePresence>
 
-      {/* Confirmação de exclusão de evento */}
-      <AnimatePresence>
-        {showDeleteConfirm && (
-          <motion.div
-            initial={{ opacity: 0 }}
-            animate={{ opacity: 1 }}
-            exit={{ opacity: 0 }}
-            style={{ zIndex: Z_INDEX.modalNested }}
-            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
-          >
-            <motion.div
-              initial={{ scale: 0.9, opacity: 0 }}
-              animate={{ scale: 1, opacity: 1 }}
-              exit={{ scale: 0.9, opacity: 0 }}
-              className="w-full max-w-xs bg-[#0A0C10] rounded-[2.5rem] border border-white/10 p-8 text-center space-y-6"
-            >
-              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto shadow-2xl shadow-rose-500/10">
-                <Trash2 size={32} />
-              </div>
-              <div>
-                <h3 className="text-lg font-display font-black text-white">Excluir evento?</h3>
-                <p className="text-white/50 text-xs mt-2 leading-relaxed">
-                  Esta ação não poderá ser desfeita. Deseja realmente remover este evento?
-                </p>
-              </div>
-              <div className="flex flex-col gap-3">
-                <button
-                  onClick={handleDelete}
-                  disabled={isLoading}
-                  className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-rose-500/20 transition-all hover:bg-rose-400 active:scale-95 flex items-center justify-center gap-2"
-                >
-                  {isLoading ? (
-                    <RefreshCw className="animate-spin" size={14} />
-                  ) : (
-                    <Trash2 size={14} />
-                  )}{' '}
-                  Excluir
-                </button>
-                <button
-                  onClick={() => setShowDeleteConfirm(false)}
-                  className="w-full bg-white/5 text-white/50 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
-                >
-                  Cancelar
-                </button>
-              </div>
-            </motion.div>
-          </motion.div>
-        )}
-      </AnimatePresence>
-
       <PlansModal
         isOpen={showPlansModal}
         onClose={() => setShowPlansModal(false)}

=== src/domain/partners/components/event/EventBasicsSection.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Building2 } from 'lucide-react';
import { CUSTOM_EVENT_CATEGORY, EVENT_CATEGORIES } from '../../../events';
import type { PartnerBusiness } from '../../types/partner';
import { type EventSectionProps, updateEventField } from './eventSectionProps';
import { SelectDropdown } from './SelectDropdown';

const LABEL_CLASS = 'text-[10px] font-black uppercase tracking-widest text-white/50 ml-1';
const INPUT_CLASS =
  'w-full min-h-[44px] bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-all placeholder:text-white/50';

interface EventBasicsSectionProps extends EventSectionProps {
  businesses?: PartnerBusiness[];
}

export function EventBasicsSection({ item, onChange, businesses }: EventBasicsSectionProps) {
  const props = { item, onChange };
  const establishments = (businesses ?? []).filter((business) => business.type === 'item');
  const selectedEstablishment = establishments.find(
    (business) => business.businessId === item.establishmentId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
          <Building2 size={18} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          Informações Básicas
        </h3>
      </div>

      <div className="space-y-4">
        {/* Todo evento pertence a um estabelecimento ou ao perfil de produtor (decisão D9). */}
        <div className="space-y-2">
          <span className={LABEL_CLASS}>
            Estabelecimento ou perfil de produtor <span className="text-rose-500 font-bold">*</span>
          </span>
          {item.id ? (
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white/70 text-sm flex items-center justify-between cursor-not-allowed">
              <span>
                {selectedEstablishment?.businessName ||
                  item.establishmentId ||
                  'Estabelecimento vinculado'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                Somente leitura
              </span>
            </div>
          ) : (
            <SelectDropdown
              ariaLabel="Estabelecimento ou perfil de produtor"
              value={item.establishmentId || ''}
              options={establishments.map((business) => ({
                value: business.businessId,
                label: business.businessName,
              }))}
              onChange={(value) => updateEventField(props, 'establishmentId', value)}
              placeholder="Selecione o estabelecimento..."
              emptyMessage="Nenhum estabelecimento cadastrado no seu perfil."
            />
          )}
        </div>

        <label className="space-y-2 block">
          <span className={LABEL_CLASS}>
            Nome do Evento <span className="text-rose-500 font-bold">*</span>
          </span>
          <input
            type="text"
            value={item.name || ''}
            onChange={(e) => updateEventField(props, 'name', e.target.value)}
            maxLength={100}
            className={INPUT_CLASS}
            placeholder="Ex: Show na Praia, Sunset Party..."
          />
        </label>

        <div className="space-y-2">
          <span className={LABEL_CLASS}>
            Categoria <span className="text-rose-500 font-bold">*</span>
          </span>
          <SelectDropdown
            ariaLabel="Categoria do evento"
            value={item.eventCategory || ''}
            options={EVENT_CATEGORIES.map((category) => ({ value: category, label: category }))}
            onChange={(value) =>
              onChange({
                ...item,
                eventCategory: value,
                ...(value !== CUSTOM_EVENT_CATEGORY && { customCategory: '' }),
              })
            }
            placeholder="Selecione uma categoria..."
          />
        </div>

        {item.eventCategory === CUSTOM_EVENT_CATEGORY && (
          <label className="space-y-2 block animate-fade-in">
            <span className={LABEL_CLASS}>
              Especifique a Categoria <span className="text-rose-500 font-bold">*</span>
            </span>
            <input
              type="text"
              value={item.customCategory || ''}
              onChange={(e) => updateEventField(props, 'customCategory', e.target.value)}
              maxLength={100}
              className={INPUT_CLASS}
              placeholder="Ex: Luau, Palestra, Workshop..."
            />
          </label>
        )}

        <label className="space-y-2 block">
          <span className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
              Descrição do Evento
            </span>
            <span className="text-[10px] font-bold text-white/50">
              {item.description?.length || 0}/400
            </span>
          </span>
          <textarea
            value={item.description || ''}
            onChange={(e) => updateEventField(props, 'description', e.target.value.slice(0, 400))}
            className={`${INPUT_CLASS} resize-none h-32 no-scrollbar`}
            placeholder="Descreva os detalhes importantes, atrações ou diferenciais do evento..."
          />
        </label>
      </div>
    </div>
  );
}

=== src/domain/partners/components/event/EventContactSection.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Building2, Camera, Globe, Hash, MapPin, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { REGIONS } from '../../../../shared/constants/regions';
import { E164PhoneField } from '../../../../ui/components/E164PhoneField';
import type { PartnerContentEditorState } from '../../types/partnerContent';
import { type EventSectionProps, updateEventField } from './eventSectionProps';
import { SelectDropdown } from './SelectDropdown';

const LABEL_CLASS = 'text-[10px] font-black uppercase tracking-widest text-white/50 ml-1';
const ICON_INPUT_CLASS =
  'w-full min-h-[44px] bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-all';
const ICON_CLASS = 'absolute left-4 top-1/2 -translate-y-1/2 text-white/50';

type TextField = 'websiteLink' | 'instagramLink' | 'googleMapsLink' | 'address';

function IconTextField({
  label,
  icon,
  field,
  placeholder,
  required = false,
  section,
}: {
  label: string;
  icon: ReactNode;
  field: TextField;
  placeholder: string;
  required?: boolean;
  section: EventSectionProps;
}) {
  const value: PartnerContentEditorState[TextField] = section.item[field];
  return (
    <label className="space-y-2 block">
      <span className={LABEL_CLASS}>
        {label} {required && <span className="text-rose-500 font-bold">*</span>}
      </span>
      <span className="relative block">
        <span className={ICON_CLASS} aria-hidden="true">
          {icon}
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => updateEventField(section, field, e.target.value)}
          maxLength={300}
          className={ICON_INPUT_CLASS}
        />
      </span>
    </label>
  );
}

export function EventContactSection({ item, onChange }: EventSectionProps) {
  const section = { item, onChange };

  return (
    <div className="space-y-6 pt-4 border-t border-white/5">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
          <Phone size={18} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          Contato e Localização
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="partner-event-phone" className={LABEL_CLASS}>
            WhatsApp de Contato / Reservas
          </label>
          <E164PhoneField
            id="partner-event-phone"
            value={item.phone}
            onChange={(e164) => updateEventField(section, 'phone', e164)}
          />
        </div>
        <IconTextField
          section={section}
          field="websiteLink"
          label="Site / Link de Ingressos"
          icon={<Globe size={16} />}
          placeholder="https://..."
        />
        <IconTextField
          section={section}
          field="instagramLink"
          label="Instagram do Evento"
          icon={<Camera size={16} />}
          placeholder="@perfil"
        />
        <IconTextField
          section={section}
          field="googleMapsLink"
          label="Google Maps (Local)"
          icon={<MapPin size={16} />}
          placeholder="Link da localização"
          required
        />
        <div className="space-y-2 sm:col-span-2">
          <span className={LABEL_CLASS}>
            Região / Bairro <span className="text-rose-500 font-bold">*</span>
          </span>
          <div className="relative">
            <span className={`${ICON_CLASS} z-10 pointer-events-none`} aria-hidden="true">
              <Hash size={16} />
            </span>
            <SelectDropdown
              ariaLabel="Região do evento"
              withIcon
              value={item.location || ''}
              options={REGIONS.map((region) => ({ value: region, label: region }))}
              onChange={(value) => updateEventField(section, 'location', value)}
              placeholder="Selecione uma região..."
            />
          </div>
        </div>
      </div>

      <IconTextField
        section={section}
        field="address"
        label="Endereço do Local"
        icon={<Building2 size={16} />}
        placeholder="Rua, Número, Referência..."
      />
    </div>
  );
}

=== src/domain/partners/components/event/EventEntrySection.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Ticket } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../../../shared/utils/cn';
import { type EventSectionProps, updateEventField } from './eventSectionProps';

interface EventEntrySectionProps extends EventSectionProps {
  renderEventTicketingManager?: (eventListingId: string) => ReactNode;
}

const OPTION_CLASS =
  'min-h-[44px] relative overflow-hidden py-4 px-6 rounded-2xl border text-sm font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function EventEntrySection({
  item,
  onChange,
  renderEventTicketingManager,
}: EventEntrySectionProps) {
  const isPaid = item.entryType === 'pago';

  return (
    <div className="space-y-6 pt-4 border-t border-white/5">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
          <Ticket size={18} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          Entradas / Ingressos
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Tipo de entrada">
        <button
          type="button"
          role="radio"
          aria-checked={isPaid}
          onClick={() => updateEventField({ item, onChange }, 'entryType', 'pago')}
          className={cn(
            OPTION_CLASS,
            isPaid
              ? 'bg-indigo-500/80 border-indigo-500/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
              : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
          )}
        >
          Pago
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!isPaid}
          onClick={() => updateEventField({ item, onChange }, 'entryType', 'gratuito')}
          className={cn(
            OPTION_CLASS,
            !isPaid
              ? 'bg-indigo-500/50 border-indigo-500/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
              : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
          )}
        >
          Entrada gratuita
        </button>
      </div>

      {item.id && renderEventTicketingManager && (
        <div className="pt-4">{renderEventTicketingManager(item.id)}</div>
      )}
    </div>
  );
}

=== src/domain/partners/components/event/EventPhotosSection.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Camera, CheckCircle2, RefreshCw, Trash2, Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { cn } from '../../../../shared/utils/cn';
import { type EventSectionProps, updateEventField } from './eventSectionProps';

const MAX_PHOTOS = 5;

interface EventPhotosSectionProps extends EventSectionProps {
  isUploading: boolean;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function EventPhotosSection({
  item,
  onChange,
  isUploading,
  onImageUpload,
}: EventPhotosSectionProps) {
  const images = item.images ?? [];

  return (
    <div className="space-y-6 pt-4 border-t border-white/5">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
          <Camera size={18} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-black text-white uppercase tracking-widest">Fotos do Evento</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {images.map((img, index) => (
          <div
            key={img}
            className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-lg"
          >
            <img
              src={img}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              alt={`Foto ${index + 1} do evento`}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => updateEventField({ item, onChange }, 'image', img)}
                aria-label={`Definir a foto ${index + 1} como principal`}
                className={cn(
                  'w-11 h-11 flex items-center justify-center rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50',
                  item.image === img
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/40'
                )}
              >
                <CheckCircle2 size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={`Remover a foto ${index + 1}`}
                onClick={() => {
                  const remaining = images.filter((_, current) => current !== index);
                  onChange({
                    ...item,
                    images: remaining,
                    image: item.image === img ? remaining[0] || '' : item.image,
                  });
                }}
                className="w-11 h-11 flex items-center justify-center bg-red-500/80 rounded-lg text-white hover:bg-red-500 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
            {item.image === img && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-xl">
                Principal
              </div>
            )}
          </div>
        ))}
        {images.length < MAX_PHOTOS && (
          <label
            className={cn(
              'aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all gap-2 focus-within:ring-2 focus-within:ring-teal-400/50',
              isUploading
                ? 'border-indigo-500/20 bg-indigo-500/5 animate-pulse'
                : 'border-white/5 hover:border-indigo-500/30 hover:bg-white/5'
            )}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={onImageUpload}
              multiple
            />
            <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50">
              {isUploading ? (
                <RefreshCw className="animate-spin" size={16} aria-hidden="true" />
              ) : (
                <Upload size={16} aria-hidden="true" />
              )}
            </span>
            <span className="text-[8px] font-black uppercase tracking-widest text-white/50">
              Add Fotos
            </span>
          </label>
        )}
      </div>
    </div>
  );
}

=== src/domain/partners/components/event/SelectDropdown.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../../../shared/utils/cn';

export interface SelectDropdownOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  value: string;
  options: SelectDropdownOption[];
  onChange: (value: string) => void;
  placeholder: string;
  emptyMessage?: string;
  /** Espaço à esquerda para um ícone posicionado por quem usa. */
  withIcon?: boolean;
  ariaLabel: string;
}

/** Lista suspensa do editor de evento; fecha ao escolher ou ao clicar fora. */
export function SelectDropdown({
  value,
  options,
  onChange,
  placeholder,
  emptyMessage,
  withIcon = false,
  ariaLabel,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full min-h-[44px] bg-white/5 border border-white/10 rounded-2xl pr-5 py-4 text-white text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-all text-left flex items-center justify-between hover:bg-white/10',
          withIcon ? 'pl-12' : 'pl-5'
        )}
      >
        <span className={selected ? 'text-white' : 'text-white/50'}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn('text-white/50 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 py-1 max-h-60 overflow-y-auto no-scrollbar"
        >
          {options.length === 0 && emptyMessage ? (
            <div className="px-5 py-3.5 text-white/50 text-xs">{emptyMessage}</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full min-h-[44px] px-5 py-3.5 text-left text-white text-sm hover:bg-white/5 flex items-center justify-between transition-colors font-medium border-b border-white/[0.02]"
              >
                <span
                  className={option.value === value ? 'text-indigo-400 font-bold' : 'text-white/80'}
                >
                  {option.label}
                </span>
                {option.value === value && (
                  <Check size={14} className="text-indigo-400" aria-hidden="true" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

=== src/domain/partners/components/event/eventSectionProps.ts — ARQUIVO NOVO, conteúdo completo ===
import type { PartnerContentEditorState } from '../../types/partnerContent';

export interface EventSectionProps {
  item: PartnerContentEditorState;
  onChange: (updatedItem: PartnerContentEditorState) => void;
}

/** Atualiza um campo do evento em edição mantendo os demais. */
export function updateEventField<K extends keyof PartnerContentEditorState>(
  { item, onChange }: EventSectionProps,
  field: K,
  value: PartnerContentEditorState[K]
): void {
  onChange({ ...item, [field]: value });
}

=== src/domain/partners/hooks/usePartnerContentActions.ts — diff ===
@@ -8,6 +8,12 @@ import {
   updatePartnerContentEventUseCase,
   updatePartnerContentItemUseCase,
 } from '../index';
+import {
+  type EventSessionsLoadState,
+  eventDateRangeFromSessions,
+  saveEventSessionsUseCase,
+  validateEventSessions,
+} from '../../events';
 import { partnerEventFormSchema } from '../schemas/partnerEventFormSchema';
 import type { PartnerContentEditorState, PartnerContentEventInput } from '../types/partnerContent';
 
@@ -19,6 +25,12 @@ function toPlainRecord(value: object): Record<string, unknown> {
   return Object.fromEntries(Object.entries(value));
 }
 
+export interface SaveEventSessionsContext {
+  sessionsLoadState: EventSessionsLoadState;
+  /** Sessões que existiam quando o editor abriu. */
+  savedSessionIds: string[];
+}
+
 export interface UsePartnerContentActionsProps {
   user: UserSession | null;
   activeTab: 'items' | 'events' | 'reports';
@@ -83,81 +95,109 @@ export function usePartnerContentActions({
     [activeTab, showToast]
   );
 
-  const handleSaveEvent = useCallback(async () => {
-    if (!isEditing || !user?.uid) return;
+  const handleSaveEvent = useCallback(
+    async ({ sessionsLoadState, savedSessionIds }: SaveEventSessionsContext) => {
+      if (!isEditing || !user?.uid) return;
 
-    if (!isEditing.id && !isEditing.establishmentId?.trim()) {
-      showToast('Selecione o estabelecimento ou o perfil de produtor do evento.', 'error');
-      return;
-    }
+      if (sessionsLoadState === 'loading' || sessionsLoadState === 'error') {
+        showToast('Aguarde o carregamento das sessões do evento antes de salvar.', 'error');
+        return;
+      }
+      const sessions = isEditing.sessions ?? [];
+      const sessionsError = validateEventSessions(sessions);
+      if (sessionsError) {
+        showToast(sessionsError, 'error');
+        return;
+      }
+      const { date, endDate } = eventDateRangeFromSessions(sessions);
 
-    const parsedEvent = partnerEventFormSchema.safeParse({
-      name: isEditing.name || '',
-      description: isEditing.description || '',
-      eventCategory: isEditing.eventCategory || '',
-      customCategory: isEditing.customCategory,
-      establishmentId: isEditing.establishmentId,
-      date: isEditing.date || '',
-      endDate: isEditing.endDate || '',
-      location: isEditing.location || '',
-      googleMapsLink: isEditing.googleMapsLink || '',
-      images: isEditing.images ?? [],
-      image: isEditing.image,
-      entryType: isEditing.entryType || 'gratuito',
-      phone: isEditing.phone,
-      websiteLink: isEditing.websiteLink,
-      instagramLink: isEditing.instagramLink,
-      address: isEditing.address,
-    });
-
-    if (!parsedEvent.success) {
-      const firstIssue = parsedEvent.error.issues[0];
-      showToast(firstIssue?.message || 'Preencha os campos obrigatórios.', 'error');
-      return;
-    }
+      if (!isEditing.id && !isEditing.establishmentId?.trim()) {
+        showToast('Selecione o estabelecimento ou o perfil de produtor do evento.', 'error');
+        return;
+      }
 
-    setIsLoading(true);
-    const eventId = isEditing.id;
-    try {
-      const data: PartnerContentEventInput = {
+      const parsedEvent = partnerEventFormSchema.safeParse({
         name: isEditing.name || '',
         description: isEditing.description || '',
-        image: isEditing.image || '',
-        images: isEditing.images ?? [],
-        location: isEditing.location || '',
-        date: isEditing.date || '',
-        endDate: isEditing.endDate || '',
-        eventCategory: isEditing.eventCategory || 'geral',
+        eventCategory: isEditing.eventCategory || '',
         customCategory: isEditing.customCategory,
-        entryType: parsedEvent.data.entryType,
         establishmentId: isEditing.establishmentId,
-        instagramLink: isEditing.instagramLink,
-        websiteLink: isEditing.websiteLink,
-        bookingLink: isEditing.bookingLink,
+        date,
+        endDate,
+        location: isEditing.location || '',
+        googleMapsLink: isEditing.googleMapsLink || '',
+        images: isEditing.images ?? [],
+        image: isEditing.image,
+        entryType: isEditing.entryType || 'gratuito',
         phone: isEditing.phone,
-        googleMapsLink: isEditing.googleMapsLink,
+        websiteLink: isEditing.websiteLink,
+        instagramLink: isEditing.instagramLink,
         address: isEditing.address,
-        tags: isEditing.tags,
-        operationalInfo: isEditing.operationalInfo
-          ? toPlainRecord(isEditing.operationalInfo)
-          : undefined,
-      };
-
-      if (!eventId) {
-        await createPartnerContentEventUseCase(data);
-      } else {
-        const { establishmentId: _ignored, ...updateData } = data;
-        await updatePartnerContentEventUseCase(eventId, updateData);
+      });
+
+      if (!parsedEvent.success) {
+        const firstIssue = parsedEvent.error.issues[0];
+        showToast(firstIssue?.message || 'Preencha os campos obrigatórios.', 'error');
+        return;
       }
-      setIsEditing(null);
-      showToast('Evento salvo com sucesso!', 'success');
-    } catch (error: unknown) {
-      console.error('Erro ao salvar evento:', error);
-      showToast(getErrorMessage(error, 'Erro ao salvar evento'), 'error');
-    } finally {
-      setIsLoading(false);
-    }
-  }, [isEditing, user?.uid, setIsLoading, setIsEditing, showToast]);
+
+      setIsLoading(true);
+      const eventId = isEditing.id;
+      try {
+        const data: PartnerContentEventInput = {
+          name: isEditing.name || '',
+          description: isEditing.description || '',
+          image: isEditing.image || '',
+          images: isEditing.images ?? [],
+          location: isEditing.location || '',
+          date,
+          endDate,
+          eventCategory: isEditing.eventCategory || 'geral',
+          customCategory: isEditing.customCategory,
+          entryType: parsedEvent.data.entryType,
+          establishmentId: isEditing.establishmentId,
+          instagramLink: isEditing.instagramLink,
+          websiteLink: isEditing.websiteLink,
+          bookingLink: isEditing.bookingLink,
+          phone: isEditing.phone,
+          googleMapsLink: isEditing.googleMapsLink,
+          address: isEditing.address,
+          tags: isEditing.tags,
+          operationalInfo: isEditing.operationalInfo
+            ? toPlainRecord(isEditing.operationalInfo)
+            : undefined,
+        };
+
+        if (!eventId) {
+          await createPartnerContentEventUseCase({
+            ...data,
+            occurrences: sessions.map(({ startsAt, endsAt, capacity }) => ({
+              startsAt,
+              endsAt,
+              capacity,
+            })),
+          });
+        } else {
+          const { establishmentId: _ignored, ...updateData } = data;
+          await updatePartnerContentEventUseCase(eventId, updateData);
+          await saveEventSessionsUseCase({
+            eventListingId: eventId,
+            scope: 'partner',
+            savedIds: savedSessionIds,
+            sessions,
+          });
+        }
+        setIsEditing(null);
+        showToast('Evento salvo com sucesso!', 'success');
+      } catch (error: unknown) {
+        console.error('Erro ao salvar evento:', error);
+        showToast(getErrorMessage(error, 'Erro ao salvar evento'), 'error');
+      } finally {
+        setIsLoading(false);
+      }
+    },
+    [isEditing, user?.uid, setIsLoading, setIsEditing, showToast]
+  );
 
   return {
     handleDelete,

=== src/domain/partners/hooks/usePartnerEventSessions.ts — ARQUIVO NOVO, conteúdo completo ===
import { useEffect, useState } from 'react';
import {
  type EventSessionDraft,
  type EventSessionsLoadState,
  listEventOccurrencesUseCase,
} from '../../events';

/**
 * Lê as sessões salvas do evento aberto no editor. Enquanto não estiverem prontas, o evento não pode
 * ser salvo: sem a lista real, a gravação trataria as sessões existentes como removidas.
 */
export function usePartnerEventSessions(
  eventId: string | undefined,
  onLoaded: (sessions: EventSessionDraft[]) => void
) {
  const [loadState, setLoadState] = useState<EventSessionsLoadState>('idle');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: lê de novo só quando outro evento é aberto.
  useEffect(() => {
    setSavedIds([]);
    if (!eventId) {
      setLoadState('idle');
      return;
    }
    let active = true;
    setLoadState('loading');
    listEventOccurrencesUseCase(eventId)
      .then((occurrences) => {
        if (!active) return;
        setSavedIds(occurrences.map((occurrence) => occurrence.id));
        onLoaded(
          occurrences.map((occurrence) => ({
            id: occurrence.id,
            startsAt: occurrence.startsAt,
            endsAt: occurrence.endsAt,
            capacity: occurrence.capacity,
          }))
        );
        setLoadState('ready');
      })
      .catch((error: unknown) => {
        console.error('[usePartnerEventSessions]', error);
        if (active) setLoadState('error');
      });
    return () => {
      active = false;
    };
  }, [eventId]);

  return { loadState, savedIds };
}

=== src/domain/partners/types/partnerContent.ts — diff ===
@@ -1,3 +1,4 @@
+import type { EventSessionDraft } from '../../events';
 export interface PartnerOperationalInfo {
   /** Passeio, translado e aluguel (decisão D9). */
   durationMinutes?: number;
@@ -69,6 +70,8 @@ export type EventEntryType = 'pago' | 'gratuito';
 
 export type PartnerContentEditorState = Omit<PartnerContentRecord, 'category'> & {
   category: PartnerContentCategory | '';
+  /** Sessões do evento em edição; as já salvas são lidas ao abrir o editor. */
+  sessions?: EventSessionDraft[];
 };
 
 export interface PartnerContentRecord {
@@ -144,4 +147,6 @@ export interface PartnerContentEventInput {
   tags?: string[];
   operationalInfo?: Record<string, unknown>;
   isActive?: boolean;
+  /** Sessões iniciais do evento novo; depois, as sessões são gravadas pelo domínio events. */
+  occurrences?: Array<{ startsAt: string; endsAt: string; capacity: number }>;
 }

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm test` → 144 arquivos, 801 testes, `npm run build`.
Responda no formato do AGENTS.md §16.3.
~~~~
