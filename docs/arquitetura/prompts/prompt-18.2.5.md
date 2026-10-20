# Prompt 18.2.5 — Completa o lote 12 (correção)

> Gerado do zip de 2026-10-19 (3º) importado na `main` (`fada927`) até o estado de referência (`93c6c9b`). Aplique ANTES do 18.3.0a. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.2.5 — Completa o lote 12 (correção)

Correção do lote 12: partes do 18.2 e do 18.2.1 não aplicadas e reescritas fora do escopo.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md.

CONTEXTO: o lote 12 voltou com partes não aplicadas e com reescritas próprias que causam regressões. Este prompt traz os arquivos de volta ao estado combinado. Não faz nada novo.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE. Não reescreva, não "melhore", não junte linhas e não troque aspas. Se um trecho de contexto não bater, substitua o arquivo inteiro pelo resultado esperado do diff em vez de improvisar.

O QUE ESTAVA ERRADO NO ZIP (e este prompt corrige):
1) 18.2.1 não aplicado no salvamento das sessões:
   - usePartnerContentActions.ts voltou à versão antiga (sem saveEventSessionsUseCase, sem validação e sem data derivada das sessões);
   - partnerContent.ts perdeu `sessions` e `occurrences`;
   - PartnerPanel não passa o contexto das sessões ao salvar.
   Efeito: o parceiro editava datas e capacidade e nada era gravado.
2) 18.2 não aplicado:
   - usePartnerProfile.ts voltou à versão de antes do lote, com o código morto do editor antigo;
   - o AdminPanel perdeu o botão "Nova dica" e o editor próprio de dicas;
   - partners/index.ts perdeu `ListingEditorProps`.
3) Reescritas fora do escopo, desfeitas:
   - PartnerPortalComposition: sem checagem de papel, texto fixo sem i18n, `as any`; 3 testes falhavam;
   - adminPlanSchema: tirou a exigência de ao menos um campo e aceitava campos que o DTO descarta; 1 teste falhava;
   - AdminPanel:
     - sem a tela de acesso restrito;
     - filtro de itens aplicado aos eventos;
   - AdminEditorModal:
     - salvava sem validação;
     - tinha categoria duplicada;
     - deixava uploads órfãos;
   - AdminEditorEventFields: perdeu htmlFor, aria-label e min-h-44;
   - PartnerPanel:
     - relatórios sem o bloqueio;
     - gerenciador de ofertas reserváveis sumido;
     - gerenciador de ingressos recebendo o id do parceiro;
   - PartnerHeader, PartnerTabsNavigation e PartnerEventsTable: props redundantes e código morto;
   - resources.ts: reformatado (o conteúdo é o mesmo; volta ao formato do Biome).
4) docs/arquitetura: debitos.md, decisoes.md e solicitacoes-agents.md voltam ao texto combinado.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- docs/arquitetura/decisoes.md (alterar)
- docs/arquitetura/solicitacoes-agents.md (alterar)
- server/domain/admin/schemas/adminPlanSchema.ts (alterar)
- src/app/compositions/PartnerPortalComposition.tsx (alterar)
- src/domain/admin/components/AdminPanel.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminEditorEventFields.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminEditorModal.tsx (alterar)
- src/domain/partners/components/PartnerEventForm.tsx (alterar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/components/subcomponents/PartnerEventsTable.tsx (alterar)
- src/domain/partners/components/subcomponents/PartnerHeader.tsx (alterar)
- src/domain/partners/components/subcomponents/PartnerTabsNavigation.tsx (alterar)
- src/domain/partners/hooks/usePartnerContentActions.ts (alterar)
- src/domain/partners/hooks/usePartnerProfile.ts (alterar)
- src/domain/partners/index.ts (alterar)
- src/domain/partners/types/partnerContent.ts (alterar)
- src/shared/i18n/resources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -25,6 +25,7 @@
 | B19 | Prompt 18.2.2 (decisão de 2026-10-19): o contato do evento fica só nos campos do topo (`phone`, `websiteLink`, `instagramLink`, `bookingLink`), como nos itens do guia; o objeto `contact` deixou de ser lido e gravado; `eventsService` dividido em `EventsService` (anúncios) e `EventOccurrencesService` (sessões), com as regras de acesso em `eventAccess.ts` |
 | Sessões do evento no editor — Prompt 18.2.1 | `EventSessionsField` e `saveEventSessionsUseCase` (events) usados pelo parceiro e pelo admin (decisão de 2026-10-19, opção A): o parceiro passa a editar datas, horários e capacidade; a data do evento é derivada das sessões; o editor do admin deixa de importar o gerenciador de ingressos de outro domínio (§5.2); `PartnerEventForm` dividido em seções (634 → 67 linhas) e modal em `PartnerEventEditor` (`PartnerPanel` abaixo de 400 linhas); o editor de evento não fecha ao clicar fora; botões do editor de evento com nome acessível |
 | Editor único de cadastro — Prompt 18.2 | `ListingEditor` (partners) usado pelo painel do parceiro e pelo admin (composição `AdminPanelComposition`); o admin edita hospedagem, restaurante, atração, passeio, translado, aluguel e perfil de produtor com os mesmos campos da inscrição; o editor não fecha ao clicar fora; `PartnerPanel.tsx` abaixo de 400 linhas; datas no fuso de Fortaleza no gerenciador de ingressos (AI Studio, lote 9); três critérios de "pronto para receber" unificados (17.2); preço de plano por `Intl` (17.1) |
+| Categorias passeio, translado e aluguel na inscrição e no editor — Prompt 18.1 | formulário com campos próprios por categoria (`steps/details/`), validação no `step3Schema`, gravação em `operationalInfo`; editor do painel sem CPF/CNPJ e com categoria travada em item existente; campo de arquivo do cardápio removido |
 | Painéis parceiro/admin — Prompt 17 | plano pago abre o checkout; visualizações e relatório de evento corretos; portal rola; sessões de evento não duplicam e são removidas no servidor; "Suspender" grava `suspended` e bloqueia; selo do admin sem mexer no plano; excluir parceiro com confirmação; filtro e categoria de evento; avisos com seleção limpa; datas dos formulários de evento no fuso de Fortaleza |
 | B15 | Removido import de `database/factory` em `FavoritesList` (Prompt 16): o item usa os dados de `FavoriteItem` e navega para o detalhe via `useSideMenu` |
 | Menu lateral em `src/ui/layouts` importando domínios (§3.4.3) | Prompt 16: virou composição em `src/app/menu/SideMenu.tsx`; `SidebarLayout` continua em `src/ui` sem conhecer domínios |

=== docs/arquitetura/decisoes.md — diff ===
@@ -118,4 +118,3 @@
 * **Persistência só por escolha explícita** (Configurações ou aviso). Mudança causada pela URL não é gravada. Hoje o app grava o idioma da URL, e quem entra por `/` fica preso em português.
 * Escolha feita por quem tem conta vai para `preferredLocale` pela API (escrita no backend, §6.1) e vale em todos os aparelhos e nos e-mails (§12.5).
 * **Depende de:** S12 (AGENTS.md §12.1 e §12.7).
-

=== docs/arquitetura/solicitacoes-agents.md — diff ===
@@ -98,14 +98,14 @@
 **Texto proposto:**
 > * **Um UseCase por arquivo** (`createBookingUseCase.ts`), com o nome do arquivo igual ao da função exportada. É proibido criar arquivo agregador de UseCases; tipos compartilhados entre UseCases ficam em arquivo próprio (ex: `orchestrationActor.ts`).
 
-## S10 — §13 e §16.1: arquivos tocados sem avisos do lint
+## S10 — §13 e §16.1: arquivo tocado sai sem avisos do lint
 
-**Por quê:** garantir que nenhum código novo introduza avisos do linter (Biome).
+**Por quê:** regra dada pelo responsável do produto em 2026-10-19: quando uma refatoração toca um arquivo, os problemas presentes nesse arquivo devem ser corrigidos. Hoje o §16.1 só exige "biome sem erros", e o projeto acumula cerca de 320 avisos (`any`, imports sem uso, dependências de efeito). Sem a regra escrita, o agente do AI Studio não a conhece.
 
-**Texto atual (§13):**
-> (sem essa linha)
+**Texto atual (§13, último item da lista de tamanho):**
+> * Referência de tamanho: arquivo acima de **~200 linhas** DEVE ser avaliado para divisão; acima de **400** linhas, dividir ao tocar (exceto testes, schemas e mappers declarativos).
 
-**Texto proposto (§13):**
+**Texto proposto (novo item no §13, logo depois):**
 > * Arquivo tocado DEVE sair sem avisos do lint (`npx biome lint <arquivo>`) e formatado (`npx biome format --write <arquivo>`). Aviso que não puder ser corrigido sem mudar comportamento recebe `biome-ignore` com justificativa ou vai para `docs/arquitetura/debitos.md`.
 
 **Texto atual (§16.1):**

=== server/domain/admin/schemas/adminPlanSchema.ts — diff ===
@@ -7,12 +7,11 @@ export const updatePlanSchema = z
     priceMinor: z.number().int().nonnegative().max(100_000_000).optional(),
     period: z.string().trim().min(1).max(50).optional(),
     description: z.string().trim().max(300).optional(),
-    features: z.array(z.string().trim().min(1).max(100)).optional(),
-    badge: z.string().trim().max(50).optional(),
-    isPopular: z.boolean().optional(),
     isActive: z.boolean().optional(),
-    displayOrder: z.number().int().nonnegative().optional(),
   })
-  .strict();
+  .strict()
+  .refine((value) => Object.keys(value).length > 0, {
+    message: 'Informe ao menos um campo para atualizar',
+  });
 
 export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

=== src/app/compositions/PartnerPortalComposition.tsx — diff ===
@@ -14,72 +14,90 @@ import { NotificationBell } from '../../domain/notifications';
 import { PartnerEventTicketingManager } from '../../domain/ticketing';
 import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
 import { useUI } from '../../shared/stores/useUIStore';
+import { MessagePage } from '../../ui/components/MessagePage';
 
 export function PartnerPortalComposition() {
   const { t } = useTranslation();
-  const { user, loading: userLoading } = useAuthContext();
+  const { user, loading } = useAuthContext();
+  const { openLoginModal } = useUI();
   const { goTo } = useLocalizedRouting();
-  const { showToast } = useUI();
-  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
-  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null);
-  const [profileStatus, setProfileStatus] = useState<'loading' | 'active' | 'pending' | 'suspended' | 'none'>('loading');
+
+  const [profile, setProfile] = useState<PartnerProfile | null>(null);
+  const [profileLoading, setProfileLoading] = useState(true);
+  const [profileError, setProfileError] = useState<string | null>(null);
+  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
+  const [profileVersion, setProfileVersion] = useState(0);
 
   useEffect(() => {
     let active = true;
-    async function loadData() {
-      if (!user) {
+    getActiveSubscriptionPlansUseCase()
+      .then((loadedPlans) => {
         if (active) {
-          setProfileStatus('none');
-          setPartnerProfile(null);
+          setPlans(loadedPlans as unknown as SubscriptionPlan[]);
         }
-        return;
-      }
+      })
+      .catch((err) => {
+        console.error('[PartnerPortalComposition] Erro ao carregar planos:', err);
+      });
+    return () => {
+      active = false;
+    };
+  }, []);
+
+  useEffect(() => {
+    if (loading) {
+      return;
+    }
+    if (!user) {
+      setProfileLoading(false);
+      return;
+    }
+
+    if (user.role !== UserRole.PARTNER) {
+      setProfileError('pages.partnerOnly');
+      setProfileLoading(false);
+      return;
+    }
 
-      setProfileStatus('loading');
-      try {
-        const [profile, plans] = await Promise.all([
-          getPartnerProfileUseCase(user.uid),
-          getActiveSubscriptionPlansUseCase(),
-        ]);
-        if (!active) return;
-        setSubscriptionPlans(plans);
-        if (profile) {
-          setPartnerProfile(profile);
-          setProfileStatus((profile.status as any) || 'none');
-        } else {
-          setPartnerProfile(null);
-          setProfileStatus('none');
+    let active = true;
+    // Recarga depois da compra de plano: mantém o painel na tela em vez do carregamento inicial.
+    setProfileLoading(profileVersion === 0);
+    setProfileError(null);
+
+    getPartnerProfileUseCase(user.uid)
+      .then((result) => {
+        if (!active) {
+          return;
+        }
+        if (!result) {
+          setProfileError('pages.partnerProfileNotFound');
+          setProfile(null);
+          return;
         }
-      } catch (err) {
-        console.error('Erro ao carregar perfil do parceiro:', err);
+        setProfile(result);
+      })
+      .catch((error: unknown) => {
+        if (!active) {
+          return;
+        }
+        console.error('[PartnerPortalComposition]', error);
+        setProfileError('pages.partnerProfileLoadError');
+        setProfile(null);
+      })
+      .finally(() => {
         if (active) {
-          setProfileStatus('none');
-          showToast('Erro ao carregar dados do parceiro', 'error');
+          setProfileLoading(false);
         }
-      }
-    }
-    loadData();
+      });
+
     return () => {
       active = false;
     };
-  }, [user, showToast]);
-
-  const handlePlanPurchased = async () => {
-    if (!user) return;
-    try {
-      const profile = await getPartnerProfileUseCase(user.uid);
-      if (profile) {
-        setPartnerProfile(profile);
-        setProfileStatus((profile.status as any) || 'none');
-      }
-    } catch (err) {
-      console.error('Erro ao atualizar perfil pós-pagamento:', err);
-    }
-  };
+  }, [user, loading, profileVersion]);
 
-  if (userLoading) {
+  if (loading || profileLoading) {
     return (
-      <div className="min-h-screen flex items-center justify-center bg-slate-950">
+      <div className="min-h-screen flex items-center justify-center bg-[#020508]">
         <RefreshCw className="animate-spin text-teal-500" size={32} />
       </div>
     );
@@ -87,57 +105,64 @@ export function PartnerPortalComposition() {
 
   if (!user) {
     return (
-      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
-        <div className="w-16 h-16 rounded-3xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6">
-          <LogIn size={32} />
-        </div>
-        <h2 className="text-xl font-display font-bold text-white mb-2">Portal do Parceiro</h2>
-        <p className="text-white/50 text-xs mb-8 max-w-xs">
-          Faça login para gerenciar seu estabelecimento, ver métricas e atrair mais clientes.
-        </p>
-        <button
-          onClick={() => goTo('explore')}
-          className="px-8 py-4 rounded-2xl bg-teal-500 text-black font-black uppercase tracking-widest text-[10px]"
-        >
-          Voltar para Home
-        </button>
-      </div>
+      <MessagePage
+        icon={LogIn}
+        title={t('pages.partnerAreaTitle')}
+        description={t('pages.partnerLoginRequired')}
+        actionLabel={t('pages.signIn')}
+        onAction={openLoginModal}
+      />
     );
   }
 
-  if (profileStatus === 'suspended') {
+  if (profile?.status === 'suspended') {
     return (
-      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
-        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
-          <ShieldAlert size={32} />
-        </div>
-        <h2 className="text-xl font-display font-bold text-white mb-2">Conta Suspensa</h2>
-        <p className="text-white/50 text-xs mb-8 max-w-xs">
-          O acesso ao portal de parceiros está temporariamente suspenso. Entre em contato com o suporte para mais informações.
-        </p>
-        <button
-          onClick={() => goTo('explore')}
-          className="px-8 py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest text-[10px]"
-        >
-          Voltar para Home
-        </button>
-      </div>
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
+  // O portal esconde o cabeçalho e a navegação; a ação leva de volta ao guia.
+  if (profileError || !profile) {
+    return (
+      <MessagePage
+        icon={ShieldAlert}
+        title={t('pages.partnerAreaTitle')}
+        description={t(profileError ?? 'pages.partnerProfileNotFound')}
+        actionLabel={t('pages.backHome')}
+        onAction={() => goTo('explore')}
+      />
     );
   }
 
   return (
     <PartnerPanel
-      profile={partnerProfile ?? undefined}
-      subscriptionPlans={subscriptionPlans}
-      onPlanPurchased={handlePlanPurchased}
-      renderReports={(props) => <ReportsView {...props} />}
+      key={profileVersion}
+      profile={profile}
+      onPlanPurchased={() => setProfileVersion((version) => version + 1)}
+      subscriptionPlans={plans}
+      renderReports={({ partnerId, items, events }) => (
+        <ReportsView partnerId={partnerId} items={items} events={events} />
+      )}
       renderNotificationBell={(partnerId) => <NotificationBell partnerId={partnerId} />}
-      renderCheckoutModal={({ isOpen, onClose, planId, itemName, amountMinor, onPaymentSuccess }) =>
-        isOpen ? (
+      renderCheckoutModal={({
+        isOpen,
+        onClose,
+        itemId,
+        itemName,
+        amountMinor,
+        onPaymentSuccess,
+      }) =>
+        isPaidPlanId(itemId) ? (
           <CheckoutModal
             isOpen={isOpen}
             onClose={onClose}
-            planId={planId as any}
+            planId={itemId}
             itemName={itemName}
             amountMinor={amountMinor}
             onPaymentSuccess={onPaymentSuccess}

=== src/domain/admin/components/AdminPanel.tsx — diff ===
@@ -101,44 +101,55 @@ export function AdminPanel({
     items: itemsList,
     events: eventsList,
     isLoading: dataLoading,
-    error: catalogError,
-    retry: fetchCatalog,
+    error: dataError,
+    retry: retryCatalog,
   } = useAdminGuideCatalog(isAdminUser && (activeTab === 'items' || activeTab === 'events'));
 
-  const {
-    handleToggleVerification,
-    handleToggleStatus,
-    handleDeletePartner,
-  } = useAdminPartnerActions({
-    reloadPartners: fetchPartners,
-    patchPartner,
-    removePartner,
-  });
+  const currentList = activeTab === 'events' ? eventsList : itemsList;
+
+  // O filtro de categoria só existe na aba de itens; na agenda todos os eventos aparecem.
+  const filteredItems = useMemo(() => {
+    if (activeTab !== 'items' || filter === 'all') return currentList;
+    return currentList.filter((item) => item.category === filter);
+  }, [activeTab, currentList, filter]);
+
+  const categories = useMemo(
+    () => [
+      { id: 'all', label: 'Todos', color: 'bg-white/10' },
+      ...Object.values(CATEGORIES).map((c) => ({
+        id: c.id,
+        label: c.label,
+        color: `${c.bgClass} ${c.colorClass}`,
+      })),
+    ],
+    []
+  );
 
   const handleDelete = async (coll: string, id: string) => {
-    if (!(await confirmAction('Excluir este registro?'))) return;
+    if (!(await confirmAction('Excluir permanentemente?'))) return;
     try {
-      if (coll === 'items' || activeTab === 'items') {
+      if (coll === 'items') {
         await deleteGuideItemUseCase(id);
-      } else {
+      } else if (coll === 'events') {
         await deleteAdminEventListingUseCase(id);
       }
       showToast('Registro excluído.', 'success');
-      fetchCatalog();
-    } catch (err: unknown) {
-      console.error('Erro ao excluir:', err);
+    } catch (error) {
+      console.error(`Erro ao deletar em ${coll}/${id}:`, error);
       showToast('Não foi possível excluir o registro.', 'error');
     }
   };
 
+  const { handleToggleVerification, handleToggleStatus, handleDeletePartner } =
+    useAdminPartnerActions({ reloadPartners: fetchPartners, patchPartner, removePartner });
+
   const handleSaveRecord = async (editorData: AdminEditorSaveData) => {
     try {
-      if (editorData.category === 'tips') {
-        const payload = toGuideItemInput(editorData);
+      if (activeTab === 'items') {
         if (editorData.id) {
           await updateGuideItemUseCase(editorData.id, toGuideItemUpdateInput(editorData));
         } else {
-          await createGuideItemUseCase(payload);
+          await createGuideItemUseCase(toGuideItemInput(editorData));
         }
       } else {
         const normalizedEventData: GuideItem = {
@@ -169,37 +180,54 @@ export function AdminPanel({
                   endsAt: occ.endsAt,
                   capacity: occ.capacity,
                 }))
-              : [],
+              : undefined,
           });
         }
       }
       setIsEditing(null);
-      fetchCatalog();
-      showToast('Alterações salvas com sucesso!', 'success');
-    } catch (err: unknown) {
-      console.error('Erro ao salvar registro no admin:', err);
-      showToast(err instanceof Error ? err.message : 'Erro ao salvar registro', 'error');
+      showToast('Registro salvo.', 'success');
+    } catch (error: unknown) {
+      console.error('[AdminPanel.handleSaveRecord]', error);
+      showToast(
+        error instanceof Error ? error.message : 'Não foi possível salvar o conteúdo.',
+        'error'
+      );
+      throw error;
     }
   };
 
-  const filteredItems = useMemo(() => {
-    if (filter === 'all') return itemsList;
-    return itemsList.filter((i) => i.category === filter);
-  }, [itemsList, filter]);
-
-  const filteredEvents = useMemo(() => {
-    if (filter === 'all') return eventsList;
-    return eventsList.filter((e) => e.eventCategory === filter);
-  }, [eventsList, filter]);
-
   if (userLoading) {
     return (
-      <div className="min-h-screen flex items-center justify-center bg-[#020508]">
+      <div className="min-h-screen flex items-center justify-center bg-slate-950">
         <RefreshCw className="animate-spin text-teal-500" size={32} />
       </div>
     );
   }
 
+  if (!user || !isAdminUser) {
+    return (
+      <div
+        className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center"
+        id="denied-access-screen"
+      >
+        <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
+          <X size={40} />
+        </div>
+        <h2 className="text-2xl font-display font-extrabold mb-2">Acesso Restrito</h2>
+        <p className="text-white/50 mb-8 max-w-xs text-sm">
+          Você precisa estar autenticado com uma conta de administrador.
+        </p>
+        <button
+          type="button"
+          onClick={() => goTo('explore')}
+          className="min-h-[44px] px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
+        >
+          Voltar para o Início
+        </button>
+      </div>
+    );
+  }
+
   return (
     <div
       className="min-h-screen pt-12 pb-40 px-4 bg-[#020508] font-sans selection:bg-teal-500/30 relative overflow-hidden"
@@ -207,27 +235,32 @@ export function AdminPanel({
     >
       <BackgroundBlobs />
 
-      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
-        <div className="flex items-center justify-between">
-          <div className="flex items-center gap-5">
-            <button
-              type="button"
-              onClick={() => goTo('explore')}
-              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
-              aria-label="Voltar para a página principal"
-            >
-              <ChevronLeft size={22} />
-            </button>
-            <div>
-              <h1 className="text-3xl font-display font-extrabold tracking-tight text-white">
-                Painel Administrativo
-              </h1>
-              <p className="text-[10px] text-teal-400 font-semibold tracking-wide">
-                Governança, Parceiros e Catálogo Geral
+      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
+        <motion.div
+          initial={{ opacity: 0, y: -20 }}
+          animate={{ opacity: 1, y: 0 }}
+          className="flex items-center gap-5"
+        >
+          <button
+            type="button"
+            aria-label="Voltar para Home"
+            onClick={() => goTo('explore')}
+            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-teal-400/50"
+          >
+            <ChevronLeft size={22} />
+          </button>
+          <div>
+            <h1 className="text-3xl font-display font-extrabold tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
+              CMS Dashboard
+            </h1>
+            <div className="flex items-center gap-2 mt-1">
+              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
+              <p className="text-[10px] text-white/50 uppercase font-black tracking-[0.2em]">
+                Gestão de Conteúdo
               </p>
             </div>
           </div>
-        </div>
+        </motion.div>
 
         <AdminNavigation activeTab={activeTab} onSelectTab={setActiveTab} />
 
@@ -238,24 +271,21 @@ export function AdminPanel({
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -15 }}
             transition={{ duration: 0.25 }}
+            id="admin-rendered-content"
           >
             {activeTab === 'reports' ? (
               statsError ? (
-                <ErrorState message={statsError} onRetry={fetchStatsData} />
+                <div className="py-6">
+                  <ErrorState message={statsError} onRetry={fetchStatsData} />
+                </div>
               ) : (
-                <AdminStatsView
-                  stats={stats}
-                  isLoading={statsLoading}
-                  categories={Object.values(CATEGORIES).map((c) => ({
-                    id: c.id,
-                    label: c.label,
-                    color: c.colorClass,
-                  }))}
-                />
+                <AdminStatsView stats={stats} isLoading={statsLoading} categories={categories} />
               )
             ) : activeTab === 'partners' ? (
               partnersError ? (
-                <ErrorState message={partnersError} onRetry={fetchPartners} />
+                <div className="py-6">
+                  <ErrorState message={partnersError} onRetry={fetchPartners} />
+                </div>
               ) : (
                 <AdminPartnersView
                   partners={partners}
@@ -265,49 +295,45 @@ export function AdminPanel({
                   onDeletePartner={handleDeletePartner}
                 />
               )
-            ) : activeTab === 'items' || activeTab === 'events' ? (
-              catalogError ? (
-                <ErrorState message={catalogError} onRetry={fetchCatalog} />
-              ) : (
-                <AdminGuideView
-                  activeTab={activeTab}
-                  categories={
-                    activeTab === 'items'
-                      ? Object.values(CATEGORIES).map((c) => ({
-                          id: c.id,
-                          label: c.label,
-                          color: c.colorClass,
-                        }))
-                      : []
-                  }
-                  filter={filter}
-                  setFilter={setFilter}
-                  filteredItems={activeTab === 'items' ? filteredItems : filteredEvents}
-                  dataLoading={dataLoading}
-                  dataError={catalogError}
-                  onRetry={fetchCatalog}
-                  onInitNew={() => {
-                    if (activeTab === 'items') {
-                      setEditingListing(null);
-                    } else {
-                      setIsEditing(newRecord('event'));
-                    }
-                  }}
-                  onEdit={(item) => {
-                    if (activeTab === 'items') {
-                      setEditingListing(item);
-                    } else {
-                      setIsEditing(item);
-                    }
-                  }}
-                  onDelete={handleDelete}
-                />
-              )
             ) : activeTab === 'plans' ? (
               <AdminPlansView />
             ) : activeTab === 'notifications' ? (
               <AdminNotificationsView />
-            ) : null}
+            ) : (
+              <AdminGuideView
+                activeTab={activeTab}
+                categories={categories}
+                filter={filter}
+                setFilter={setFilter}
+                filteredItems={filteredItems}
+                dataLoading={dataLoading}
+                dataError={dataError}
+                onRetry={retryCatalog}
+                onInitNew={() => {
+                  if (activeTab === 'items' && renderListingEditor) {
+                    setEditingListing(null);
+                    return;
+                  }
+                  setIsEditing(newRecord(activeTab === 'items' ? 'tips' : 'event'));
+                }}
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
+                  setIsEditing({
+                    ...item,
+                    images: item.images || (item.image ? [item.image] : []),
+                  });
+                }}
+                onDelete={handleDelete}
+              />
+            )}
           </motion.div>
         </AnimatePresence>
       </div>

=== src/domain/admin/components/subcomponents/AdminEditorEventFields.tsx — diff ===
@@ -32,14 +32,24 @@ export function AdminEditorEventFields({
   const eventCategory = watch('eventCategory') || '';
 
   return (
-    <div className="space-y-6">
-      <div className="space-y-2">
-        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-          Categoria do Evento <span className="text-rose-500 font-bold">*</span>
+    <div className="space-y-4" id="event-occurrences-section">
+      <div className="space-y-1.5 px-2">
+        <label
+          htmlFor="admin-event-category"
+          className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/50"
+        >
+          Categoria do Evento
         </label>
         <select
-          {...register('eventCategory')}
-          className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
+          id="admin-event-category"
+          value={eventCategory}
+          onChange={(e) => {
+            setValue('eventCategory', e.target.value, { shouldDirty: true });
+            if (e.target.value !== CUSTOM_EVENT_CATEGORY) {
+              setValue('customCategory', '', { shouldDirty: true });
+            }
+          }}
+          className="w-full min-h-[44px] bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
         >
           <option value="">Selecione uma categoria...</option>
           {EVENT_CATEGORIES.map((cat) => (
@@ -48,21 +58,17 @@ export function AdminEditorEventFields({
             </option>
           ))}
         </select>
-      </div>
-
-      {eventCategory === CUSTOM_EVENT_CATEGORY && (
-        <div className="space-y-2">
-          <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-            Especifique a Categoria <span className="text-rose-500 font-bold">*</span>
-          </label>
+        {eventCategory === CUSTOM_EVENT_CATEGORY && (
           <input
             type="text"
+            aria-label="Nome da categoria"
+            placeholder="Nome da categoria"
+            maxLength={200}
             {...register('customCategory')}
-            placeholder="Ex: Luau, Workshop..."
-            className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
+            className="w-full min-h-[44px] bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
           />
-        </div>
-      )}
+        )}
+      </div>
 
       {renderSessionsField?.({
         sessions: (occurrences ?? []).map((occ) => ({

=== src/domain/admin/components/subcomponents/AdminEditorModal.tsx — diff ===
@@ -1,5 +1,6 @@
-import { useState, useRef, useEffect } from 'react';
-import { useForm, FormProvider } from 'react-hook-form';
+import React, { useEffect, useRef, useState } from 'react';
+import { zodResolver } from '@hookform/resolvers/zod';
+import { FormProvider, useForm, type Resolver } from 'react-hook-form';
 import { motion, AnimatePresence } from 'motion/react';
 import { X, Trash2, RefreshCw } from 'lucide-react';
 import { CATEGORIES } from '../../../../shared/constants/categories';
@@ -59,108 +60,149 @@ export function AdminEditorModal({
   const savedOccurrenceIdsRef = useRef<string[]>([]);
 
   const form = useForm<AdminGuideEditorSchemaValues>({
+    resolver: zodResolver(
+      adminGuideEditorFormSchema
+    ) as unknown as Resolver<AdminGuideEditorSchemaValues>,
     defaultValues: {
-      name: isEditing.name || '',
-      description: isEditing.description || '',
-      image: isEditing.image || '',
-      images: isEditing.images || [],
-      category: isEditing.category || (activeTab === 'events' ? 'event' : 'tips'),
-      location: isEditing.location || 'Jericoacoara',
-      instagramLink: isEditing.instagramLink || '',
-      websiteLink: isEditing.websiteLink || '',
-      phone: isEditing.phone || '',
-      googleMapsLink: isEditing.googleMapsLink || '',
-      eventCategory: isEditing.eventCategory || '',
-      customCategory: isEditing.customCategory || '',
-      date: isEditing.date || new Date().toISOString(),
-      endDate: isEditing.endDate || new Date().toISOString(),
+      name: '',
+      description: '',
+      category: activeTab === 'events' ? 'event' : 'tips',
+      location: 'Jericoacoara',
+      image: '',
+      images: [],
       occurrences: [],
     },
   });
 
-  const { handleSubmit, setValue, watch, reset } = form;
-
   useEffect(() => {
-    reset({
-      name: isEditing.name || '',
-      description: isEditing.description || '',
-      image: isEditing.image || '',
-      images: isEditing.images || [],
-      category: isEditing.category || (activeTab === 'events' ? 'event' : 'tips'),
-      location: isEditing.location || 'Jericoacoara',
-      instagramLink: isEditing.instagramLink || '',
-      websiteLink: isEditing.websiteLink || '',
-      phone: isEditing.phone || '',
-      googleMapsLink: isEditing.googleMapsLink || '',
-      eventCategory: isEditing.eventCategory || '',
-      customCategory: isEditing.customCategory || '',
-      date: isEditing.date || new Date().toISOString(),
-      endDate: isEditing.endDate || new Date().toISOString(),
-      occurrences: [],
+    const defaultStart = isEditing?.date || new Date().toISOString();
+    const defaultEnd =
+      isEditing?.endDate ||
+      new Date(new Date(defaultStart).getTime() + 3 * 3600 * 1000).toISOString();
+
+    form.reset({
+      name: isEditing?.name || '',
+      description: isEditing?.description || '',
+      category: isEditing?.category || (activeTab === 'events' ? 'event' : 'tips'),
+      location: isEditing?.location || 'Jericoacoara',
+      image: isEditing?.image || '',
+      images: isEditing?.images || [],
+      date: isEditing?.date,
+      endDate: isEditing?.endDate,
+      // Evento novo começa com uma sessão; as sessões de um evento salvo vêm do servidor (efeito abaixo).
+      occurrences:
+        activeTab === 'events' && !isEditing?.id
+          ? [{ startsAt: defaultStart, endsAt: defaultEnd, capacity: 100 }]
+          : [],
+      eventCategory: isEditing?.eventCategory,
+      customCategory: isEditing?.customCategory,
+      googleMapsLink: isEditing?.googleMapsLink,
+      instagramLink: isEditing?.instagramLink,
+      phone: isEditing?.phone,
+      websiteLink: isEditing?.websiteLink,
+      bookingLink: isEditing?.bookingLink,
+      operationalInfo: isEditing?.operationalInfo as Record<string, unknown> | undefined,
     });
+  }, [isEditing, activeTab, form]);
+
+  useEffect(() => {
     savedOccurrenceIdsRef.current = [];
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
+  const isCreatingNew = !isEditing?.id;
 
-    if (activeTab === 'events' && isEditing.id) {
-      setOccurrencesState('loading');
-      listEventOccurrencesUseCase(isEditing.id)
-        .then((occurrences) => {
-          savedOccurrenceIdsRef.current = occurrences.map((occ) => occ.id);
-          setValue(
-            'occurrences',
-            occurrences.map((occ) => ({
-              id: occ.id,
-              startsAt: occ.startsAt,
-              endsAt: occ.endsAt,
-              capacity: occ.capacity,
-            }))
-          );
-          setOccurrencesState('ready');
+  const availableCategories =
+    activeTab === 'items'
+      ? Object.values(CATEGORIES).filter((c) => {
+          if (c.id === 'event') return false;
+          if (isCreatingNew) {
+            return ADMIN_CREATABLE_ITEM_CATEGORIES.includes(
+              c.id as (typeof ADMIN_CREATABLE_ITEM_CATEGORIES)[number]
+            );
+          }
+          return true;
         })
-        .catch((err) => {
-          console.error('[AdminEditorModal] load occurrences:', err);
-          setOccurrencesState('error');
-        });
-    } else {
-      setOccurrencesState('ready');
-    }
-  }, [isEditing, activeTab, reset, setValue]);
+      : [{ id: 'event', label: CATEGORIES.event.label }];
 
   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = e.target.files;
     if (!files || files.length === 0) return;
+
+    const currentImages = form.getValues('images') || [];
+    if (currentImages.length >= 5) {
+      showToast('Você já atingiu o limite de 5 fotos.', 'error');
+      return;
+    }
+
+    const filesArray = Array.from(files);
+    const filesToUpload = filesArray.slice(0, 5 - currentImages.length);
+
     setIsUploading(true);
     try {
-      const urls: string[] = [];
-      const currentImages = watch('images') || [];
-      for (const file of Array.from(files)) {
-        const url = await uploadImageUseCase(file, 'guia_local');
-        urls.push(url);
-      }
-      const combined = [...currentImages, ...urls].slice(0, 5);
-      setValue('images', combined, { shouldDirty: true });
-      if (!watch('image') && combined[0]) {
-        setValue('image', combined[0], { shouldDirty: true });
+      const folderName = activeTab === 'items' ? 'guia_local' : 'agenda_eventos';
+      const uploadedUrls = await Promise.all(
+        filesToUpload.map((file) => uploadImageUseCase(file, folderName))
+      );
+
+      const newImages = [...currentImages, ...uploadedUrls];
+      form.setValue('images', newImages, { shouldDirty: true, shouldValidate: true });
+      if (!form.getValues('image') && uploadedUrls[0]) {
+        form.setValue('image', uploadedUrls[0], { shouldDirty: true, shouldValidate: true });
       }
-      showToast('Imagem(ns) enviada(s) com sucesso!', 'success');
-    } catch (err: unknown) {
-      console.error('Erro no upload:', err);
-      showToast(getImageUploadErrorMessage(err), 'error');
+    } catch (error) {
+      showToast(getImageUploadErrorMessage(error), 'error');
     } finally {
       setIsUploading(false);
+      e.target.value = '';
     }
   };
 
-  const onSubmit = handleSubmit(async (values) => {
-    if (activeTab === 'events') {
-      if (occurrencesState === 'loading' || occurrencesState === 'error') {
+  // Sem a lista real de sessões, salvar trataria as sessões existentes como removidas.
+  const occurrencesBlocked = occurrencesState === 'loading' || occurrencesState === 'error';
+
+  const handleSaveWrapper = form.handleSubmit(
+    async (values) => {
+      if (occurrencesBlocked) {
         showToast('Aguarde o carregamento das sessões do evento antes de salvar.', 'error');
         return;
       }
       const sessions = values.occurrences ?? [];
-      const sessionsError = validateEventSessions(sessions);
-      if (sessionsError) {
-        showToast(sessionsError, 'error');
-        return;
+      if (activeTab === 'events') {
+        const sessionsError = validateEventSessions(sessions);
+        if (sessionsError) {
+          showToast(sessionsError, 'error');
+          return;
+        }
       }
       setIsLoading(true);
       try {
@@ -175,148 +217,160 @@ export function AdminEditorModal({
       } finally {
         setIsLoading(false);
       }
-      return;
-    }
-
-    const parsed = adminGuideEditorFormSchema.safeParse(values);
-    if (!parsed.success) {
-      showToast(parsed.error.issues[0]?.message || 'Preencha os campos obrigatórios', 'error');
-      return;
+    },
+    (errors) => {
+      const firstError = Object.values(errors)[0];
+      const nestedMessage =
+        firstError && typeof firstError === 'object' && 'message' in firstError
+          ? firstError.message
+          : Array.isArray(firstError)
+            ? firstError[0]?.startsAt?.message ||
+              firstError[0]?.endsAt?.message ||
+              firstError[0]?.capacity?.message
+            : undefined;
+      showToast(String(nestedMessage ?? 'Verifique os campos do formulário.'), 'error');
     }
+  );
 
+  const handleDeleteWrapper = async () => {
     setIsLoading(true);
     try {
-      await onSave({
-        ...isEditing,
-        ...parsed.data,
-        category: parsed.data.category as GuideItem['category'],
-      });
+      await onDeleteConfirm(isEditing.id);
+      setIsEditing(null);
+      setShowDeleteConfirm(false);
+    } catch (err) {
+      console.error('[AdminEditorModal] excluir', err);
+      showToast('Não foi possível excluir o registro.', 'error');
     } finally {
       setIsLoading(false);
     }
-  });
+  };
 
   return (
-    <div
-      style={{ zIndex: Z_INDEX.modal }}
-      className="fixed inset-0 bg-[#020508]/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
-    >
-      <motion.div
-        initial={{ opacity: 0, scale: 0.95, y: 20 }}
-        animate={{ opacity: 1, scale: 1, y: 0 }}
-        exit={{ opacity: 0, scale: 0.95, y: 20 }}
-        className="w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
+    <FormProvider {...form}>
+      <div
+        style={{ zIndex: Z_INDEX.modal }}
+        className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
+        id="editor-modal-container"
       >
-        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
-          <div>
-            <h2 className="text-lg font-display font-black text-white">
-              {isEditing.id ? 'Editar Registro' : 'Novo Registro'}
-            </h2>
-            <p className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">
-              {activeTab === 'events' ? 'Evento' : 'Dica ou Ponto de Interesse'}
-            </p>
+        <motion.div
+          initial={{ y: '100%', scale: 0.95 }}
+          animate={{ y: 0, scale: 1 }}
+          exit={{ y: '100%', scale: 0.95 }}
+          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
+          className="w-full max-w-xl glassmorphism-vibrant bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col max-h-[95vh] shadow-2xl"
+        >
+          <div className="p-8 pb-4 flex items-center justify-between" id="editor-modal-header">
+            <div>
+              <h3 className="text-2xl font-display font-extrabold tracking-tight">
+                {isEditing.id ? 'Editar Registro' : 'Novo Registro'}
+              </h3>
+              <p className="text-[10px] text-white/50 uppercase font-black tracking-[0.2em] mt-1">
+                Configuração de propriedades
+              </p>
+            </div>
+            <button
+              type="button"
+              aria-label="Fechar"
+              onClick={() => {
+                setIsEditing(null);
+                setShowDeleteConfirm(false);
+              }}
+              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-teal-400/50"
+            >
+              <X size={24} />
+            </button>
           </div>
-          <button
-            type="button"
-            onClick={() => setIsEditing(null)}
-            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
-          >
-            <X size={18} />
-          </button>
-        </div>
 
-        <FormProvider {...form}>
-          <form onSubmit={onSubmit} className="p-8 space-y-8 overflow-y-auto no-scrollbar">
-            <AdminEditorBasicInfo
-              isAdminUser={isAdminUser}
-              availableCategories={Object.values(CATEGORIES).map((c) => ({ id: c.id, label: c.label }))}
-            />
-
-            {activeTab === 'events' ? (
-              <AdminEditorEventFields
-                eventListingId={isEditing.id || undefined}
-                occurrencesState={occurrencesState}
-                renderSessionsField={renderSessionsField}
-                renderTicketingManager={renderTicketingManager}
-              />
-            ) : (
-              <div className="space-y-2">
-                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-                  Categoria <span className="text-rose-500 font-bold">*</span>
-                </label>
-                <select
-                  {...form.register('category')}
-                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
+          <div
+            className="p-8 pt-4 overflow-y-auto space-y-6 no-scrollbar pb-10 flex-1"
+            id="editor-modal-scrollable"
+          >
+            <AnimatePresence mode="wait">
+              {showDeleteConfirm ? (
+                <motion.div
+                  key="confirm"
+                  initial={{ opacity: 0, scale: 0.9 }}
+                  animate={{ opacity: 1, scale: 1 }}
+                  exit={{ opacity: 0, scale: 0.9 }}
+                  className="py-12 flex flex-col items-center text-center space-y-6"
+                  id="modal-delete-confirmation"
                 >
-                  {Object.values(CATEGORIES).map((c) => (
-                    <option key={c.id} value={c.id}>
-                      {c.label}
-                    </option>
-                  ))}
-                </select>
-              </div>
-            )}
+                  <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 mb-2 shadow-[0_0_40px_rgba(244,63,94,0.1)]">
+                    <Trash2 size={44} />
+                  </div>
+                  <div>
+                    <h4 className="text-xl font-display font-extrabold text-white">
+                      Confirmar Exclusão?
+                    </h4>
+                    <p className="text-white/50 text-sm mt-2 max-w-[240px] mx-auto">
+                      Esta ação é permanente e não poderá ser desfeita no banco de dados.
+                    </p>
+                  </div>
 
-            <AdminEditorGallery
-              isUploading={isUploading}
-              onImageUpload={handleImageUpload}
-            />
+                  <div className="flex flex-col w-full gap-3">
+                    <button
+                      type="button"
+                      onClick={handleDeleteWrapper}
+                      disabled={isLoading}
+                      className="w-full min-h-[44px] bg-rose-500 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-rose-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-rose-500/20 focus-visible:ring-2 focus-visible:ring-teal-400/50"
+                      id="btn-confirm-destruction"
+                    >
+                      {isLoading ? (
+                        <RefreshCw className="animate-spin" size={18} />
+                      ) : (
+                        <Trash2 size={18} />
+                      )}
+                      Sim, Excluir Registro
+                    </button>
+                    <button
+                      type="button"
+                      onClick={() => setShowDeleteConfirm(false)}
+                      className="w-full min-h-[44px] bg-white/5 text-white/50 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
+                    >
+                      Cancelar
+                    </button>
+                  </div>
+                </motion.div>
+              ) : (
+                <motion.div
+                  key="form"
+                  initial={{ opacity: 0 }}
+                  animate={{ opacity: 1 }}
+                  exit={{ opacity: 0 }}
+                  className="space-y-6"
+                >
+                  <AdminEditorBasicInfo
+                    isAdminUser={isAdminUser}
+                    availableCategories={availableCategories}
+                  />
 
-            <AdminEditorLocation />
+                  <AdminEditorGallery isUploading={isUploading} onImageUpload={handleImageUpload} />
 
-            <AdminEditorActions
-              hasId={Boolean(isEditing.id)}
-              isLoading={isLoading}
-              showDeleteConfirm={showDeleteConfirm}
-              onSave={onSubmit}
-              onRequestDelete={() => setShowDeleteConfirm(true)}
-            />
-          </form>
-        </FormProvider>
-      </motion.div>
+                  {activeTab === 'events' && (
+                    <AdminEditorEventFields
+                      eventListingId={isEditing.id || undefined}
+                      occurrencesState={occurrencesState}
+                      renderSessionsField={renderSessionsField}
+                      renderTicketingManager={renderTicketingManager}
+                    />
+                  )}
 
-      <AnimatePresence>
-        {showDeleteConfirm && (
-          <div
-            style={{ zIndex: Z_INDEX.modalNested }}
-            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
-          >
-            <div className="w-full max-w-xs bg-[#0A0C10] rounded-[2.5rem] border border-white/10 p-8 text-center space-y-6">
-              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto shadow-2xl shadow-rose-500/10">
-                <Trash2 size={32} />
-              </div>
-              <div>
-                <h3 className="text-lg font-display font-black text-white">Excluir registro?</h3>
-                <p className="text-white/50 text-xs mt-2 leading-relaxed">
-                  Esta ação não poderá ser desfeita.
-                </p>
-              </div>
-              <div className="flex flex-col gap-3">
-                <button
-                  type="button"
-                  onClick={async () => {
-                    if (isEditing.id) {
-                      await onDeleteConfirm(isEditing.id);
-                    }
-                    setShowDeleteConfirm(false);
-                    setIsEditing(null);
-                  }}
-                  className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-rose-500/20 transition-all hover:bg-rose-400 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
-                >
-                  Excluir
-                </button>
-                <button
-                  type="button"
-                  onClick={() => setShowDeleteConfirm(false)}
-                  className="w-full bg-white/5 text-white/50 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all cursor-pointer"
-                >
-                  Cancelar
-                </button>
-              </div>
-            </div>
+                  <AdminEditorLocation />
+                </motion.div>
+              )}
+            </AnimatePresence>
           </div>
-        )}
-      </AnimatePresence>
-    </div>
+
+          <AdminEditorActions
+            hasId={Boolean(isEditing.id)}
+            isLoading={isLoading}
+            showDeleteConfirm={showDeleteConfirm}
+            onSave={handleSaveWrapper}
+            onRequestDelete={() => setShowDeleteConfirm(true)}
+          />
+        </motion.div>
+      </div>
+    </FormProvider>
   );
 }

=== src/domain/partners/components/PartnerEventForm.tsx — diff ===
@@ -43,7 +43,6 @@ export function PartnerEventForm({
             Datas e capacidade
           </h3>
         </div>
-
         {renderSessionsField?.({
           sessions: item.sessions ?? [],
           onChange: (sessions) => onChange({ ...item, sessions }),

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -1,5 +1,5 @@
 import { BarChart3, RefreshCw } from 'lucide-react';
-import { motion, AnimatePresence } from 'motion/react';
+import { AnimatePresence } from 'motion/react';
 import React, { useRef } from 'react';
 
 // Componentes estruturais e utilitários da UI
@@ -25,7 +25,6 @@ import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
 export interface PartnerPanelProps {
   profile?: PartnerProfile;
   subscriptionPlans?: SubscriptionPlan[];
-  onPlanPurchased?: () => void;
   renderReports?: (props: {
     partnerId: string;
     items: PartnerContentRecord[];
@@ -35,7 +34,7 @@ export interface PartnerPanelProps {
   renderCheckoutModal?: (props: {
     isOpen: boolean;
     onClose: () => void;
-    planId: string;
+    itemId: string;
     itemName: string;
     amountMinor: number;
     onPaymentSuccess: () => void;
@@ -47,12 +46,13 @@ export interface PartnerPanelProps {
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
@@ -60,7 +60,7 @@ export function PartnerPanel({
   renderEventSessionsField,
   planSubscriptionSlot,
   renderBookableOffersManager,
-  onPlanPurchased: _onPlanPurchased,
+  onPlanPurchased,
 }: PartnerPanelProps) {
   const { goTo } = useLocalizedRouting();
 
@@ -74,6 +74,7 @@ export function PartnerPanel({
     isEditing,
     setIsEditing,
     isLoading,
+    isUploading,
     showDeleteConfirm,
     setShowDeleteConfirm,
     dataLoading,
@@ -84,7 +85,6 @@ export function PartnerPanel({
     handleToggleActive,
     handleImageUpload,
     handleSaveEvent,
-    isUploading,
   } = usePartnerPanelActions(profile);
 
   // `null` abre o editor para um cadastro novo; `undefined` mantém fechado.
@@ -126,29 +126,25 @@ export function PartnerPanel({
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
@@ -156,10 +152,10 @@ export function PartnerPanel({
       >
         <PartnerHeader
           partnerProfile={partnerProfile}
-          isVerified={isVerified}
           onNavigateBack={() => goTo('explore')}
-          onOpenPlansModal={() => setShowPlansModal(true)}
-          renderNotificationBell={renderNotificationBell}
+          isVerified={isVerified}
+          onVerifyClick={() => setShowPlansModal(true)}
+          notificationBell={renderNotificationBell?.(partnerProfile?.id || '')}
         />
 
         {planSubscriptionSlot}
@@ -168,69 +164,70 @@ export function PartnerPanel({
           activeTab={activeTab}
           setActiveTab={setActiveTab}
           isVerified={isVerified}
-          hasItems={itemsList.length > 0}
-          hasEvents={eventsList.length > 0}
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
-              <PartnerItemsTable
-                itemsList={itemsList}
-                loading={dataLoading}
-                onEditItem={(item) => setEditingListing(item)}
-                onToggleActive={handleToggleActive}
-                onCreateNew={() => setEditingListing(null)}
-              />
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
 
@@ -240,7 +237,12 @@ export function PartnerPanel({
             item={isEditing}
             onChange={(updatedItem) => setIsEditing(updatedItem)}
             onClose={() => setIsEditing(null)}
-            onSave={handleSaveEvent}
+            onSave={() =>
+              handleSaveEvent({
+                sessionsLoadState: eventSessions.loadState,
+                savedSessionIds: eventSessions.savedIds,
+              })
+            }
             isLoading={isLoading}
             isUploading={isUploading}
             onImageUpload={handleImageUpload}
@@ -277,25 +279,28 @@ export function PartnerPanel({
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
-        {showCheckoutModal && renderCheckoutModal?.({
-          isOpen: showCheckoutModal,
-          onClose: handleCheckoutClose,
-          planId: checkoutPlanInfo.itemId,
-          itemName: checkoutPlanInfo.itemName,
-          amountMinor: checkoutPlanInfo.amountMinor,
-          onPaymentSuccess: handleCheckoutSuccess,
-        })}
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

=== src/domain/partners/components/subcomponents/PartnerEventsTable.tsx — diff ===
@@ -9,8 +9,7 @@ interface PartnerEventsTableProps {
   loading: boolean;
   onEditEvent: (item: PartnerContentRecord) => void;
   onToggleActive: (eventId: string, currentActiveState: boolean) => Promise<void>;
-  onCreateNew?: () => void;
-  onCreateNewEvent?: () => void;
+  onCreateNew: () => void;
 }
 
 export function PartnerEventsTable({
@@ -19,7 +18,6 @@ export function PartnerEventsTable({
   onEditEvent,
   onToggleActive,
   onCreateNew,
-  onCreateNewEvent,
 }: PartnerEventsTableProps) {
   return (
     <div className="space-y-6">
@@ -29,7 +27,7 @@ export function PartnerEventsTable({
         </h2>
         <button
           type="button"
-          onClick={onCreateNew || onCreateNewEvent}
+          onClick={onCreateNew}
           className="min-h-[44px] px-6 py-4 rounded-2xl text-[11px] font-semibold tracking-wide transition-all flex items-center gap-2 text-black bg-[#00D4FF] shadow-[#00D4FF]/20 shadow-lg cursor-pointer hover:bg-[#3be0ff] focus-visible:ring-2 focus-visible:ring-teal-400/50"
         >
           <Plus size={16} strokeWidth={3} /> Criar Novo

=== src/domain/partners/components/subcomponents/PartnerHeader.tsx — diff ===
@@ -10,9 +10,7 @@ interface PartnerHeaderProps {
   onNavigateBack: () => void;
   isVerified: boolean;
   onVerifyClick?: () => void;
-  onOpenPlansModal?: () => void;
   notificationBell?: React.ReactNode;
-  renderNotificationBell?: (partnerId: string) => React.ReactNode;
 }
 
 const PLAN_SUBTITLE: Record<string, string> = {
@@ -31,9 +29,7 @@ export function PartnerHeader({
   onNavigateBack,
   isVerified,
   onVerifyClick,
-  onOpenPlansModal,
   notificationBell,
-  renderNotificationBell,
 }: PartnerHeaderProps) {
   return (
     <div className="space-y-6">
@@ -82,7 +78,7 @@ export function PartnerHeader({
               </span>
             </div>
           </div>
-          {renderNotificationBell && partnerProfile ? renderNotificationBell(partnerProfile.id) : notificationBell}
+          {notificationBell}
         </div>
       </motion.div>
 
@@ -92,7 +88,7 @@ export function PartnerHeader({
         initial={{ opacity: 0, y: 6 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
-        onClick={onOpenPlansModal || onVerifyClick}
+        onClick={onVerifyClick}
         className="py-4 px-6 rounded-3xl border border-white/10 bg-white/5 glassmorphism-vibrant flex items-center justify-between gap-6 w-full text-left cursor-pointer"
       >
         <div className="flex items-center gap-4">

=== src/domain/partners/components/subcomponents/PartnerTabsNavigation.tsx — diff ===
@@ -6,8 +6,6 @@ interface PartnerTabsNavigationProps {
   activeTab: 'items' | 'events' | 'reports';
   setActiveTab: (tab: 'items' | 'events' | 'reports') => void;
   isVerified: boolean;
-  hasItems?: boolean;
-  hasEvents?: boolean;
 }
 
 export function PartnerTabsNavigation({

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
@@ -22,7 +23,6 @@ export {
 } from './components/PartnerItemForms';
 export { PartnerPanel } from './components/PartnerPanel';
 export { PartnersModal } from './components/PartnersModal';
-export { ListingEditor } from './components/ListingEditor';
 export { mapPartnerRegistrationPayload, usePartnerForm } from './hooks/usePartnerForm';
 export { usePartnerContentActions } from './hooks/usePartnerContentActions';
 export { usePartnerContentCatalog } from './hooks/usePartnerContentCatalog';
@@ -48,7 +48,6 @@ export type {
   SubscriptionPlan,
 } from './types/partner';
 export type {
-  PartnerContentEditorState,
   PartnerContentEventInput,
   PartnerContentItemInput,
   PartnerContentRecord,

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
@@ -103,12 +106,6 @@ export interface PartnerContentRecord {
   eventCategory?: string;
   customCategory?: string;
   entryType?: EventEntryType;
-  sessions?: Array<{
-    id?: string;
-    startsAt: string;
-    endsAt: string;
-    capacity: number;
-  }>;
 }
 
 export interface PartnerContentItemInput {
@@ -150,4 +147,6 @@ export interface PartnerContentEventInput {
   tags?: string[];
   operationalInfo?: Record<string, unknown>;
   isActive?: boolean;
+  /** Sessões iniciais do evento novo; depois, as sessões são gravadas pelo domínio events. */
+  occurrences?: Array<{ startsAt: string; endsAt: string; capacity: number }>;
 }

=== src/shared/i18n/resources.ts — diff ===
@@ -273,7 +273,8 @@ const ptBR: TranslationResource = {
       IMAGE_TOO_LARGE: 'A imagem passa de 6 MB. Escolha uma imagem menor.',
       INVALID_IMAGE: 'Formato não suportado. Envie uma imagem JPEG, PNG ou WebP.',
       UPLOAD_FAILED: 'Não foi possível enviar a imagem. Tente novamente.',
-      STORAGE_UNAVAILABLE: 'O armazenamento está indisponível no momento. Tente novamente em instantes.',
+      STORAGE_UNAVAILABLE:
+        'O armazenamento está indisponível no momento. Tente novamente em instantes.',
     },
     payment: {
       SUBSCRIPTION_ALREADY_ACTIVE: 'Você já tem uma assinatura ativa.',
@@ -306,7 +307,8 @@ const ptBR: TranslationResource = {
       continue: 'Continuar',
       subscribeButton: 'Assinar por {{amount}} {{period}}',
       payButton: 'Pagar {{amount}}',
-      trialNotice: 'Seu período atual já está pago. Salve o cartão agora; a primeira cobrança acontece quando esse período terminar.',
+      trialNotice:
+        'Seu período atual já está pago. Salve o cartão agora; a primeira cobrança acontece quando esse período terminar.',
       activatingTitle: 'Confirmando sua assinatura',
       activatingDescription: 'O Stripe está confirmando o pagamento. Isso leva alguns segundos.',
       activationDelayed:
@@ -350,41 +352,48 @@ const ptBR: TranslationResource = {
     routes: {
       explore: {
         title: 'Use Guide | Guia de Jericoacoara, Preá e Barrinha',
-        description: 'Descubra as melhores experiências, pousadas, restaurantes, passeios e condições de vento em tempo real em Jericoacoara, Preá e Barrinha.',
+        description:
+          'Descubra as melhores experiências, pousadas, restaurantes, passeios e condições de vento em tempo real em Jericoacoara, Preá e Barrinha.',
       },
       events: {
         title: 'Eventos & Experiências | Use Guide',
-        description: 'Fique por dentro das festas, sunsets, campeonatos de kitesurf e eventos culturais em Jericoacoara e região.',
+        description:
+          'Fique por dentro das festas, sunsets, campeonatos de kitesurf e eventos culturais em Jericoacoara e região.',
       },
       tours: {
         title: 'Aventura & Passeios | Use Guide',
-        description: 'Passeios de buggy, quadriciclo, lagoas cristalinas e roteiros imperdíveis no litoral leste e oeste de Jericoacoara.',
+        description:
+          'Passeios de buggy, quadriciclo, lagoas cristalinas e roteiros imperdíveis no litoral leste e oeste de Jericoacoara.',
       },
       transfers: {
-        title: "Translados em Jericoacoara | Use Guide",
+        title: 'Translados em Jericoacoara | Use Guide',
         description:
-          "Transfers entre Fortaleza, Jijoca, Jericoacoara, Preá e Barrinha: veículos, capacidade e reserva.",
+          'Transfers entre Fortaleza, Jijoca, Jericoacoara, Preá e Barrinha: veículos, capacidade e reserva.',
       },
       rentals: {
-        title: "Aluguéis em Jericoacoara | Use Guide",
+        title: 'Aluguéis em Jericoacoara | Use Guide',
         description:
-          "Aluguel de quadriciclos, buggies, bicicletas e equipamentos em Jericoacoara e região.",
+          'Aluguel de quadriciclos, buggies, bicicletas e equipamentos em Jericoacoara e região.',
       },
       stays: {
         title: 'Melhores Hospedagens & Pousadas | Use Guide',
-        description: 'Seleção curada das melhores pousadas, hotéis boutique e resorts à beira-mar em Jeri, Preá e Barrinha.',
+        description:
+          'Seleção curada das melhores pousadas, hotéis boutique e resorts à beira-mar em Jeri, Preá e Barrinha.',
       },
       restaurants: {
         title: 'Sabores Locais & Gastronomia | Use Guide',
-        description: 'Descubra os melhores restaurantes, bares de praia, frutos do mar frescos e alta gastronomia de Jeri e Preá.',
+        description:
+          'Descubra os melhores restaurantes, bares de praia, frutos do mar frescos e alta gastronomia de Jeri e Preá.',
       },
       attractions: {
         title: 'Atrações & Pontos Turísticos | Use Guide',
-        description: 'Pedra Furada, Duna do Pôr do Sol, Lagoas e os cartões-postais mais famosos do Parque Nacional de Jericoacoara.',
+        description:
+          'Pedra Furada, Duna do Pôr do Sol, Lagoas e os cartões-postais mais famosos do Parque Nacional de Jericoacoara.',
       },
       guide: {
         title: 'Guia Prático & Dicas Úteis | Use Guide',
-        description: 'Tudo o que você precisa saber: taxa de turismo, como chegar, melhor época, traslados e dicas essenciais.',
+        description:
+          'Tudo o que você precisa saber: taxa de turismo, como chegar, melhor época, traslados e dicas essenciais.',
       },
     },
   },
@@ -538,7 +547,8 @@ const en: TranslationResource = {
       continue: 'Continue',
       subscribeButton: 'Subscribe for {{amount}} {{period}}',
       payButton: 'Pay {{amount}}',
-      trialNotice: 'Your current period is already paid. Save your card now; the first charge happens when that period ends.',
+      trialNotice:
+        'Your current period is already paid. Save your card now; the first charge happens when that period ends.',
       activatingTitle: 'Confirming your subscription',
       activatingDescription: 'Stripe is confirming the payment. This takes a few seconds.',
       activationDelayed:
@@ -581,41 +591,47 @@ const en: TranslationResource = {
     routes: {
       explore: {
         title: 'Use Guide | Jericoacoara, Preá & Barrinha Travel Guide',
-        description: 'Discover the best experiences, inns, restaurants, tours and real-time wind conditions in Jericoacoara, Preá and Barrinha.',
+        description:
+          'Discover the best experiences, inns, restaurants, tours and real-time wind conditions in Jericoacoara, Preá and Barrinha.',
       },
       events: {
         title: 'Events & Experiences | Use Guide',
-        description: 'Parties, sunsets, kitesurf competitions and cultural events in Jericoacoara and the region.',
+        description:
+          'Parties, sunsets, kitesurf competitions and cultural events in Jericoacoara and the region.',
       },
       tours: {
         title: 'Adventure & Tours | Use Guide',
-        description: 'Buggy and quad bike tours, crystal-clear lagoons and must-do routes around Jericoacoara.',
+        description:
+          'Buggy and quad bike tours, crystal-clear lagoons and must-do routes around Jericoacoara.',
       },
       transfers: {
-        title: "Transfers to Jericoacoara | Use Guide",
+        title: 'Transfers to Jericoacoara | Use Guide',
         description:
-          "Transfers between Fortaleza, Jijoca, Jericoacoara, Preá and Barrinha: vehicles, capacity and booking.",
+          'Transfers between Fortaleza, Jijoca, Jericoacoara, Preá and Barrinha: vehicles, capacity and booking.',
       },
       rentals: {
-        title: "Rentals in Jericoacoara | Use Guide",
-        description:
-          "Rent ATVs, buggies, bikes and gear in Jericoacoara and the region.",
+        title: 'Rentals in Jericoacoara | Use Guide',
+        description: 'Rent ATVs, buggies, bikes and gear in Jericoacoara and the region.',
       },
       stays: {
         title: 'Best Stays & Inns | Use Guide',
-        description: 'A curated selection of the best inns, boutique hotels and beachfront resorts in Jeri, Preá and Barrinha.',
+        description:
+          'A curated selection of the best inns, boutique hotels and beachfront resorts in Jeri, Preá and Barrinha.',
       },
       restaurants: {
         title: 'Local Flavors & Dining | Use Guide',
-        description: 'The best restaurants, beach bars, fresh seafood and fine dining in Jeri and Preá.',
+        description:
+          'The best restaurants, beach bars, fresh seafood and fine dining in Jeri and Preá.',
       },
       attractions: {
         title: 'Attractions & Landmarks | Use Guide',
-        description: 'Pedra Furada, Sunset Dune, the lagoons and the most famous postcards of Jericoacoara National Park.',
+        description:
+          'Pedra Furada, Sunset Dune, the lagoons and the most famous postcards of Jericoacoara National Park.',
       },
       guide: {
         title: 'Practical Guide & Tips | Use Guide',
-        description: 'Everything you need to know: tourism fee, how to get there, best season, transfers and essential tips.',
+        description:
+          'Everything you need to know: tourism fee, how to get there, best season, transfers and essential tips.',
       },
     },
   },
@@ -737,7 +753,8 @@ const fr: TranslationResource = {
       IMAGE_TOO_LARGE: "L'image dépasse 6 Mo. Choisissez une image plus légère.",
       INVALID_IMAGE: 'Format non pris en charge. Envoyez une image JPEG, PNG ou WebP.',
       UPLOAD_FAILED: "Impossible d'envoyer l'image. Veuillez réessayer.",
-      STORAGE_UNAVAILABLE: 'Le stockage est indisponible pour le moment. Réessayez dans un instant.',
+      STORAGE_UNAVAILABLE:
+        'Le stockage est indisponible pour le moment. Réessayez dans un instant.',
     },
     payment: {
       SUBSCRIPTION_ALREADY_ACTIVE: 'Vous avez déjà un abonnement actif.',
@@ -817,41 +834,48 @@ const fr: TranslationResource = {
     routes: {
       explore: {
         title: 'Use Guide | Guide de Jericoacoara, Preá et Barrinha',
-        description: 'Découvrez les meilleures expériences, pousadas, restaurants, excursions et le vent en temps réel à Jericoacoara, Preá et Barrinha.',
+        description:
+          'Découvrez les meilleures expériences, pousadas, restaurants, excursions et le vent en temps réel à Jericoacoara, Preá et Barrinha.',
       },
       events: {
         title: 'Événements & Expériences | Use Guide',
-        description: 'Fêtes, couchers de soleil, compétitions de kitesurf et événements culturels à Jericoacoara et dans la région.',
+        description:
+          'Fêtes, couchers de soleil, compétitions de kitesurf et événements culturels à Jericoacoara et dans la région.',
       },
       tours: {
         title: 'Aventure & Excursions | Use Guide',
-        description: 'Excursions en buggy et en quad, lagunes cristallines et itinéraires incontournables autour de Jericoacoara.',
+        description:
+          'Excursions en buggy et en quad, lagunes cristallines et itinéraires incontournables autour de Jericoacoara.',
       },
       transfers: {
-        title: "Transferts à Jericoacoara | Use Guide",
+        title: 'Transferts à Jericoacoara | Use Guide',
         description:
-          "Transferts entre Fortaleza, Jijoca, Jericoacoara, Preá et Barrinha : véhicules, capacité et réservation.",
+          'Transferts entre Fortaleza, Jijoca, Jericoacoara, Preá et Barrinha : véhicules, capacité et réservation.',
       },
       rentals: {
-        title: "Locations à Jericoacoara | Use Guide",
+        title: 'Locations à Jericoacoara | Use Guide',
         description:
-          "Location de quads, buggys, vélos et équipements à Jericoacoara et dans la région.",
+          'Location de quads, buggys, vélos et équipements à Jericoacoara et dans la région.',
       },
       stays: {
         title: 'Meilleurs Hébergements | Use Guide',
-        description: 'Une sélection des meilleures pousadas, hôtels boutique et resorts en bord de mer à Jeri, Preá et Barrinha.',
+        description:
+          'Une sélection des meilleures pousadas, hôtels boutique et resorts en bord de mer à Jeri, Preá et Barrinha.',
       },
       restaurants: {
         title: 'Saveurs Locales & Gastronomie | Use Guide',
-        description: 'Les meilleurs restaurants, bars de plage, fruits de mer frais et la haute gastronomie de Jeri et Preá.',
+        description:
+          'Les meilleurs restaurants, bars de plage, fruits de mer frais et la haute gastronomie de Jeri et Preá.',
       },
       attractions: {
         title: 'Attractions & Sites Touristiques | Use Guide',
-        description: 'Pedra Furada, la Dune du Coucher de Soleil, les lagunes et les cartes postales du Parc National de Jericoacoara.',
+        description:
+          'Pedra Furada, la Dune du Coucher de Soleil, les lagunes et les cartes postales du Parc National de Jericoacoara.',
       },
       guide: {
         title: 'Guide Pratique & Conseils | Use Guide',
-        description: 'Tout ce qu\'il faut savoir : taxe touristique, comment venir, meilleure saison, transferts et conseils essentiels.',
+        description:
+          "Tout ce qu'il faut savoir : taxe touristique, comment venir, meilleure saison, transferts et conseils essentiels.",
       },
     },
   },
@@ -861,10 +885,12 @@ const fr: TranslationResource = {
     backHome: 'Retour à l’accueil',
     checkoutResultMissing: 'Nous n’avons pas trouvé la commande de ce paiement.',
     planPaymentTitle: 'Paiement du forfait en cours',
-    planPaymentDescription: 'Dès que Stripe confirme, le badge apparaît dans votre espace partenaire.',
+    planPaymentDescription:
+      'Dès que Stripe confirme, le badge apparaît dans votre espace partenaire.',
     openPartnerArea: 'Ouvrir l’espace partenaire',
     partnerAreaTitle: 'Espace partenaire',
-    partnerLoginRequired: 'Connectez-vous à votre compte partenaire pour ouvrir le tableau de bord.',
+    partnerLoginRequired:
+      'Connectez-vous à votre compte partenaire pour ouvrir le tableau de bord.',
     signIn: 'Se connecter',
     partnerOnly: 'Ce tableau de bord est réservé aux partenaires inscrits.',
     partnerProfileNotFound: 'Nous n’avons pas trouvé votre inscription de partenaire.',

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros), `npm test` → 154 arquivos, 846 testes, todos passando (antes deste prompt falhavam 4), `npm run build`.
Responda no formato do AGENTS.md §16.3.
~~~~
