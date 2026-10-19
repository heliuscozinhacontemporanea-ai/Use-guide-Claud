# Prompt 18.2.1 (parte a) — Sessões do evento: domínio events e admin

> Lote 12, gerado do commit de referência `ce7f92a` da branch `claude/agents-md-v2`. Aplique depois do A3. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.2.1 (parte a) — Sessões do evento: domínio events e admin

Decisão de 2026-10-19 (opção A): datas, horários e capacidade das sessões ficam no editor do evento, para o parceiro e o admin; o gerenciador de ingressos fica com tipos de ingresso, vendas e check-in.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os 13 arquivos novos. Não reescreva os arquivos do seu jeito e não acrescente funcionalidades. Arquivo tocado sai sem avisos do lint (AGENTS.md §13).

Esta é a PARTE A de duas. Aplique só os arquivos listados abaixo; a parte B vem em outra mensagem.

O QUE MUDA:
1) src/domain/events (novo):
   - types/eventSession.ts;
   - utils/eventSessions.ts: planEventSessionChanges, validateEventSessions, eventDateRangeFromSessions e newEventSessionDraft;
   - saveEventSessionsUseCase: cria e altera antes de apagar, pelas rotas do admin ou do parceiro;
   - components/EventSessionsField.tsx: campo controlado, no fuso de Fortaleza;
   - tudo exportado no index.ts. O componente é só para src/app/compositions.
2) Admin:
   - AdminEditorEventFields usa o campo de sessões recebido por renderSessionsField e o gerenciador de ingressos por renderTicketingManager, sem importar o domínio ticketing (§5.2);
   - AdminPanel grava as sessões por saveEventSessionsUseCase (savedOccurrenceIds no lugar de removedOccurrenceIds);
   - AdminDispatcher repassa os slots, e AdminPanelComposition os monta.
3) Testes novos: eventSessions.test.ts, saveEventSessionsUseCase.test.ts e EventSessionsField.test.tsx.

ARQUIVOS (crie, altere ou apague exatamente estes):
- src/app/compositions/AdminPanelComposition.tsx (alterar)
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

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

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

VERIFICAÇÃO (obrigatória): `npm run typecheck`, `npx biome lint .` (0 erros) e `npm test` passam. A contagem final vem depois da parte B.
Responda no formato do AGENTS.md §16.3.
~~~~
