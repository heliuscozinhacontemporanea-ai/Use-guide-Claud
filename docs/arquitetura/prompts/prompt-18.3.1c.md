# Prompt 18.3.1c — Telas tocadas nos temas claro e escuro, com toque e transições de app nativo

> Lote 15, gerado do commit de referência `52392fe` da branch `claude/agents-md-v2`. Aplique depois do 18.3.1b. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.3.1c — Temas claro/escuro e experiência de app nativo nas telas tocadas

Ajuste visual das telas de plano, selo, verificação, assinatura, checkout, relatórios e admin.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova. Nenhuma regra de negócio muda: só cores, toque e transições.

CONTEXTO: o tema padrão é o escuro; em Configurações a pessoa escolhe claro, escuro ou sistema. As telas tocadas nos prompts 18.3.x usavam cores fixas (text-white, amber, rose…) que ficavam ilegíveis no claro. O modo claro NUNCA usa branco puro: o fundo é um off-white bege (#f3eee4) e as superfícies #faf6ee.

O QUE MUDA:
1) src/index.css: tokens de tema (--ug-*) expostos ao Tailwind (bg-app, text-ink, bg-surface, border-line, bg-scrim, text-accent, text-warn, text-info, text-success, text-danger, text-seal e os -soft/-line), valores do escuro em :root e do claro em :root.light; keyframes de entrada/saída (fade, scale, sheet) com as propriedades individuais scale/translate, para não brigar com o transform de centralização; utilitário press (escala 0,97 ao toque, sem destaque de toque, respeita prefers-reduced-motion); tons do claro legado trocados de branco puro para bege; biome-ignore-all das sobrescritas !important (débito B25).
2) index.html: script antes da pintura aplica a classe do tema e o theme-color (sem piscar no carregamento).
3) ThemeContext: padrão 'dark', expõe resolvedTheme e atualiza o meta theme-color.
4) AppProviders: MotionConfig reducedMotion="user" e toasts no tema resolvido.
5) Dialog: no celular vira folha que sobe da borda inferior (com alça e safe area); do sm em diante, cartão central; animações de saída pelo data-state do Radix; o foco inicial vai para a própria folha, sem anel no botão fechar. ConfirmDialog e Popover com os tokens.
6) Telas de plano, selo, verificação, assinatura, checkout, relatórios e admin: cores fixas trocadas pelos tokens; texto branco sobre fundo colorido vira text-on-fill; botões principais com press (os que usam motion whileTap/whileHover ou active:scale ficam como estão, para não somar efeitos).
7) docs/arquitetura/debitos.md: B25.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- index.html (alterar)
- src/app/AppProviders.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminItemGrid.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminPartnersView.tsx (alterar)
- src/domain/insights/components/ReportsView.tsx (alterar)
- src/domain/insights/components/reports/PendingReviewCard.tsx (alterar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/components/plan/AdminListingSealControl.tsx (alterar)
- src/domain/partners/components/plan/ListingPlanBenefits.tsx (alterar)
- src/domain/partners/components/plan/ListingPlanChip.tsx (alterar)
- src/domain/partners/components/plan/ListingPlanDialog.tsx (alterar)
- src/domain/partners/components/plan/ListingPlanOptions.tsx (alterar)
- src/domain/partners/components/plan/ListingPlanStatus.tsx (alterar)
- src/domain/partners/components/steps/Step6Success.tsx (alterar)
- src/domain/partners/components/subcomponents/PartnerHeader.tsx (alterar)
- src/domain/partners/components/subcomponents/PartnerItemsTable.tsx (alterar)
- src/domain/partners/components/verification/DocumentVerificationForm.tsx (alterar)
- src/domain/partners/components/verification/LinkedVerificationForm.tsx (alterar)
- src/domain/partners/components/verification/ListingVerificationDialog.tsx (alterar)
- src/domain/partners/components/verification/VerificationFileField.tsx (alterar)
- src/domain/partners/components/verification/VerificationQueueCard.tsx (alterar)
- src/domain/partners/components/verification/VerificationRadioGroup.tsx (alterar)
- src/domain/partners/components/verification/verificationStatusStyle.ts (alterar)
- src/domain/payment/components/CheckoutModal.tsx (alterar)
- src/domain/payment/components/PlanSubscriptionCard.tsx (alterar)
- src/domain/payment/components/subcomponents/CheckoutStatusNotice.tsx (alterar)
- src/domain/payment/components/subcomponents/PaymentMethodChoice.tsx (alterar)
- src/domain/payment/components/subcomponents/SubscriptionPlanCheckout.tsx (alterar)
- src/domain/payment/components/subcomponents/SuccessPaymentGlass.tsx (alterar)
- src/domain/payment/components/subscription/PlanPeriodChange.tsx (alterar)
- src/domain/payment/components/subscription/SubscriptionDetails.tsx (alterar)
- src/index.css (alterar)
- src/shared/context/ThemeContext.tsx (alterar)
- src/ui/components/BackgroundBlobs.tsx (alterar)
- src/ui/components/ConfirmDialog.tsx (alterar)
- src/ui/components/Dialog.tsx (alterar)
- src/ui/components/Popover.tsx (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -18,6 +18,7 @@
 | B20 | `operationalInfoSchema` duplicado em `server/domain/guide/schemas/guideSchema.ts` e `server/domain/partners/schemas/partnerContentSchema.ts` | §5.3 | baixo — as duas cópias precisam mudar juntas | rotas de conteúdo do parceiro passarem a validar com o schema publicado pelo `guide` (Published Language) |
 | B21 | `package-lock.json`: `npm audit --omit=dev` aponta 10 vulnerabilidades (1 crítica, 7 altas) em `firebase`, `@firebase/firestore`, `@grpc/grpc-js`, `gaxios`, `proxy-addr`, `uuid` e outras | §7.4 e §7.10 A06 (sem high/critical para merge) | alto — já existiam antes do Prompt 18.3.0a; a dependência nova (`@google-cloud/kms` 6.2.1) não acrescentou nenhuma | prompt próprio de atualização de dependências, testando cada salto de versão |
 | B22 | `listingVerificationService.assertCanSell`: até o Prompt 18.4, só o primeiro CNPJ aprovado de cada conta vende (`SALES_DOCUMENT_MISMATCH`) | D12 (P8): repasse por documento | médio — conta com dois CNPJs só vende por um deles | Prompt 18.4: conta Stripe por documento |
+| B25 | `src/index.css`: o tema claro ainda depende de sobrescritas globais com `!important` (`:root.light .text-white`, `.bg-white/5`, `.border-white/10`…) para as telas que usam cores fixas; `biome-ignore-all lint/complexity/noImportantStyles` no topo do arquivo | §11.1 (tokens, nunca `text-white` fixo em superfície que muda) e §13 (sem avisos) | médio — cor nova sem token pode sair ilegível no claro; as sobrescritas valem para o app todo | cada tela tocada passa a usar os tokens `--ug-*` (`text-ink`, `bg-surface`, `border-line`, `text-warn`…); quando nenhuma usar mais as classes fixas, as sobrescritas e o `biome-ignore-all` saem |
 
 ## Resolvidos

=== index.html — diff ===
@@ -15,7 +15,21 @@
     <meta name="apple-mobile-web-app-capable" content="yes" />
     <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
     <meta name="apple-mobile-web-app-title" content="Use Guide" />
-    <meta name="theme-color" content="#000000" />
+    <meta name="theme-color" content="#060b1e" />
+    <script>
+      // Aplica o tema antes da primeira pintura (sem piscar escuro no tema claro). Mesma regra do ThemeContext.
+      (function () {
+        var saved = null;
+        try {
+          saved = localStorage.getItem('theme');
+        } catch (e) {}
+        var theme = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'dark';
+        var dark =
+          theme === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : theme === 'dark';
+        document.documentElement.classList.add(dark ? 'dark' : 'light');
+        document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#060b1e' : '#f3eee4');
+      })();
+    </script>
     <link rel="canonical" href="https://useguide.com.br" />
     <link rel="alternate" hreflang="pt-BR" href="https://useguide.com.br/" />
     <link rel="alternate" hreflang="en" href="https://useguide.com.br/en" />

=== src/app/AppProviders.tsx — diff ===
@@ -1,6 +1,7 @@
+import { MotionConfig } from 'motion/react';
 import { ReactNode } from 'react';
 import { Toaster } from 'sonner';
-import { ThemeProvider } from '../shared/context/ThemeContext';
+import { ThemeProvider, useTheme } from '../shared/context/ThemeContext';
 import { AuthProvider } from '../domain/auth/context/AuthContext';
 import { Z_INDEX } from '../shared/constants/zIndex';
 import { useUIStore } from '../shared/stores/useUIStore';
@@ -10,26 +11,35 @@ interface AppProvidersProps {
   children: ReactNode;
 }
 
+function ThemedToaster() {
+  const { resolvedTheme } = useTheme();
+  return (
+    <Toaster
+      position="bottom-center"
+      theme={resolvedTheme}
+      closeButton
+      richColors
+      style={{ zIndex: Z_INDEX.toast }}
+      toastOptions={{
+        className: '!bg-surface !border !border-line !backdrop-blur-xl !text-ink !rounded-2xl',
+      }}
+    />
+  );
+}
+
 export function AppProviders({ children }: AppProvidersProps) {
   const confirmDialog = useUIStore((state) => state.confirmDialog);
 
   return (
     <ThemeProvider>
-      <AuthProvider>
-        {children}
-        <ConfirmDialog data={confirmDialog} />
-        <Toaster
-          position="bottom-center"
-          theme="dark"
-          closeButton
-          richColors
-          style={{ zIndex: Z_INDEX.toast }}
-          toastOptions={{
-            className:
-              '!bg-neutral-900/95 !border !border-white/10 !backdrop-blur-xl !text-white !rounded-2xl',
-          }}
-        />
-      </AuthProvider>
+      {/* Respeita "reduzir movimento" do aparelho em todas as animações do motion (AGENTS.md §11.7). */}
+      <MotionConfig reducedMotion="user">
+        <AuthProvider>
+          {children}
+          <ConfirmDialog data={confirmDialog} />
+          <ThemedToaster />
+        </AuthProvider>
+      </MotionConfig>
     </ThemeProvider>
   );
 }

=== src/domain/admin/components/subcomponents/AdminItemGrid.tsx — diff ===
@@ -95,7 +95,7 @@ export function AdminItemGrid({
               className={cn(
                 'min-h-[44px] whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400/50',
                 filter === cat.id
-                  ? 'bg-white text-black border-white shadow-xl scale-105'
+                  ? 'bg-ink text-app border-ink shadow-xl scale-105'
                   : 'bg-white/[0.03] text-white/50 border-white/10 hover:bg-white/10'
               )}
             >
@@ -107,7 +107,7 @@ export function AdminItemGrid({
 
       {dataLoading ? (
         <div className="py-24 text-center">
-          <div className="inline-block animate-spin mb-6 text-teal-500">
+          <div className="inline-block animate-spin mb-6 text-accent">
             <RefreshCw size={32} />
           </div>
           <div className="animate-pulse text-white/50 font-black uppercase tracking-[0.4em] text-[10px] italic">
@@ -174,13 +174,13 @@ export function AdminItemGrid({
                             'Evento'}
                         </span>
                         {ratingAverage !== null && (
-                          <div className="flex items-center gap-1 text-amber-500 text-[8px] font-black">
+                          <div className="flex items-center gap-1 text-warn text-[8px] font-black">
                             <Star size={8} fill="currentColor" /> {ratingAverage.toFixed(1)}
                           </div>
                         )}
                       </div>
 
-                      <h4 className="font-display font-bold text-white text-sm line-clamp-1 group-hover:text-teal-400 transition-colors uppercase tracking-tight">
+                      <h4 className="font-display font-bold text-white text-sm line-clamp-1 group-hover:text-accent transition-colors uppercase tracking-tight">
                         {item.name}
                       </h4>
 
@@ -200,7 +200,7 @@ export function AdminItemGrid({
                               event.stopPropagation();
                               onEdit(item);
                             }}
-                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-black transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
+                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-accent-soft text-accent hover:bg-teal-500 hover:text-black transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
                           >
                             <Edit2 size={14} strokeWidth={2.5} />
                           </button>
@@ -211,7 +211,7 @@ export function AdminItemGrid({
                               event.stopPropagation();
                               onDelete(activeTab === 'items' ? 'items' : 'events', item.id);
                             }}
-                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
+                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-danger-soft text-danger hover:bg-rose-500 hover:text-on-fill transition-all shadow-lg shadow-rose-500/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                           >
                             <Trash2 size={14} strokeWidth={2.5} />
                           </button>

=== src/domain/admin/components/subcomponents/AdminPartnersView.tsx — diff ===
@@ -6,8 +6,8 @@ const STATUS_BADGE: Record<
   AdminPartnerSummary['status'],
   { label: string; className: string; icon: typeof Clock }
 > = {
-  active: { label: 'Cadastro Ativo', className: 'text-emerald-400', icon: CheckCircle },
-  suspended: { label: 'Suspenso', className: 'text-rose-400', icon: Ban },
+  active: { label: 'Cadastro Ativo', className: 'text-success', icon: CheckCircle },
+  suspended: { label: 'Suspenso', className: 'text-danger', icon: Ban },
 };
 
 const ROW_BUTTON =
@@ -29,7 +29,7 @@ export function AdminPartnersView({
   if (isLoading) {
     return (
       <div className="py-24 text-center">
-        <RefreshCw className="animate-spin text-indigo-500 mx-auto" size={32} />
+        <RefreshCw className="animate-spin text-seal mx-auto" size={32} />
       </div>
     );
   }
@@ -51,7 +51,7 @@ export function AdminPartnersView({
             id={`partner-row-${partner.id}`}
           >
             <div className="flex items-center gap-5 w-full sm:w-auto">
-              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
+              <div className="w-14 h-14 rounded-2xl bg-seal-soft flex items-center justify-center text-seal group-hover:scale-110 transition-transform">
                 <Users size={24} />
               </div>
               <div>
@@ -90,8 +90,8 @@ export function AdminPartnersView({
                 className={cn(
                   ROW_BUTTON,
                   partner.status === 'suspended'
-                    ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black'
-                    : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black'
+                    ? 'bg-success-soft text-success hover:bg-emerald-500 hover:text-black'
+                    : 'bg-warn-soft text-warn hover:bg-amber-500 hover:text-black'
                 )}
                 id={`btn-status-${partner.id}`}
               >
@@ -102,7 +102,7 @@ export function AdminPartnersView({
                 type="button"
                 onClick={() => onDeletePartner(partner)}
                 aria-label={`Excluir parceiro ${partner.businessName}`}
-                className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
+                className="w-11 h-11 flex items-center justify-center rounded-xl bg-danger-soft text-danger hover:bg-rose-500 hover:text-on-fill transition-all shadow-lg shadow-rose-500/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                 id={`btn-delete-${partner.id}`}
               >
                 <Trash2 size={16} aria-hidden="true" />

=== src/domain/insights/components/ReportsView.tsx — diff ===
@@ -81,7 +81,7 @@ export function ReportsView({ items, events }: ReportsViewProps) {
             className={cn(
               'inline-block mb-1 px-2 py-0.5 rounded text-[8px] font-bold tracking-widest',
               selected.type === 'items'
-                ? 'bg-teal-500/20 text-teal-400'
+                ? 'bg-accent-soft text-accent'
                 : 'bg-[#00D4FF]/20 text-[#00D4FF]'
             )}
           >
@@ -97,7 +97,7 @@ export function ReportsView({ items, events }: ReportsViewProps) {
                 <VerifiedBadge size="md" className="text-[18px] flex-shrink-0" />
               )}
           </h3>
-          <p className="text-[10px] text-amber-500 font-semibold tracking-wide">
+          <p className="text-[10px] text-warn font-semibold tracking-wide">
             {t('insights.reports.title')}
           </p>
         </div>
@@ -115,13 +115,13 @@ export function ReportsView({ items, events }: ReportsViewProps) {
         <ErrorState message={t('insights.reports.loadError')} onRetry={report.reload} />
       ) : report.statsLocked || !report.stats ? (
         <div className="space-y-8">
-          <div className="p-6 rounded-[2rem] border border-amber-500/20 bg-amber-500/10 flex items-start gap-3">
-            <Lock size={18} className="text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
+          <div className="p-6 rounded-[2rem] border border-warn-line bg-warn-soft flex items-start gap-3">
+            <Lock size={18} className="text-warn shrink-0 mt-0.5" aria-hidden="true" />
             <div className="space-y-1">
               <h4 className="text-sm font-bold text-white">
                 {t('insights.reports.planRequiredTitle')}
               </h4>
-              <p className="text-xs text-amber-100 leading-relaxed">
+              <p className="text-xs text-warn leading-relaxed">
                 {t('insights.reports.planRequired')}
               </p>
             </div>

=== src/domain/insights/components/reports/PendingReviewCard.tsx — diff ===
@@ -44,7 +44,7 @@ export function PendingReviewCard({ review, onReplied }: PendingReviewCardProps)
       <div className="flex items-center justify-between gap-3">
         <div className="flex items-center gap-3 min-w-0">
           <div
-            className="w-8 h-8 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-xs font-bold"
+            className="w-8 h-8 shrink-0 rounded-full bg-warn-soft flex items-center justify-center text-warn text-xs font-bold"
             aria-hidden="true"
           >
             {review.userName?.charAt(0).toUpperCase()}
@@ -64,7 +64,7 @@ export function PendingReviewCard({ review, onReplied }: PendingReviewCardProps)
                   size={8}
                   aria-hidden="true"
                   className={cn(
-                    star < review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'
+                    star < review.rating ? 'text-warn fill-amber-400' : 'text-white/20'
                   )}
                 />
               ))}
@@ -91,14 +91,14 @@ export function PendingReviewCard({ review, onReplied }: PendingReviewCardProps)
               type="button"
               onClick={send}
               disabled={sending || !replyText.trim()}
-              className="flex-1 min-h-[44px] bg-amber-500 text-black py-2.5 rounded-xl text-[9px] font-semibold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
+              className="press flex-1 min-h-[44px] bg-amber-500 text-black py-2.5 rounded-xl text-[9px] font-semibold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
             >
               <Send size={12} aria-hidden="true" /> {t('insights.reviews.send')}
             </button>
             <button
               type="button"
               onClick={cancel}
-              className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white/5 text-[9px] font-semibold tracking-wide text-white/60 focus-visible:ring-2 focus-visible:ring-teal-400/50"
+              className="press px-4 py-2.5 min-h-[44px] rounded-xl bg-white/5 text-[9px] font-semibold tracking-wide text-white/60 focus-visible:ring-2 focus-visible:ring-teal-400/50"
             >
               {t('insights.reviews.cancel')}
             </button>
@@ -108,7 +108,7 @@ export function PendingReviewCard({ review, onReplied }: PendingReviewCardProps)
         <button
           type="button"
           onClick={() => setReplying(true)}
-          className="text-[9px] font-bold tracking-wide text-amber-500 hover:text-amber-400 flex items-center gap-1.5 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-teal-400/50"
+          className="press text-[9px] font-bold tracking-wide text-warn hover:text-warn flex items-center gap-1.5 min-h-[44px] focus-visible:ring-2 focus-visible:ring-teal-400/50"
         >
           <MessageSquare size={12} aria-hidden="true" /> {t('insights.reviews.reply')}
         </button>

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -138,7 +138,7 @@ export function PartnerPanel({
   if (userLoading || profileStatus === 'loading') {
     return (
       <div className="min-h-screen flex items-center justify-center bg-slate-950">
-        <RefreshCw className="animate-spin text-teal-500" size={32} />
+        <RefreshCw className="animate-spin text-accent" size={32} />
       </div>
     );
   }
@@ -152,7 +152,7 @@ export function PartnerPanel({
         </p>
         <button
           onClick={() => goTo('explore')}
-          className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-semibold tracking-wide text-white"
+          className="press px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-semibold tracking-wide text-white"
         >
           Voltar
         </button>
@@ -161,7 +161,7 @@ export function PartnerPanel({
   }
 
   return (
-    <div className="min-h-screen pt-12 pb-40 px-4 bg-[#020508]/60 font-sans selection:bg-teal-500/30 relative overflow-x-hidden backdrop-blur-md">
+    <div className="min-h-screen pt-12 pb-40 px-4 bg-app/60 font-sans selection:bg-teal-500/30 relative overflow-x-hidden backdrop-blur-md">
       <BackgroundBlobs />
 
       <div

=== src/domain/partners/components/plan/AdminListingSealControl.tsx — diff ===
@@ -72,9 +72,9 @@ export function AdminListingSealControl({ itemId, name }: AdminListingSealContro
           name,
         })}
         className={cn(
-          'min-h-[44px] px-4 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50',
+          'press min-h-[44px] px-4 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50',
           hasSeal
-            ? 'bg-blue-500/10 text-blue-300 hover:bg-blue-500 hover:text-black'
+            ? 'bg-seal-soft text-seal hover:bg-blue-500 hover:text-black'
             : 'bg-blue-500 text-black hover:bg-blue-400'
         )}
       >

=== src/domain/partners/components/plan/ListingPlanBenefits.tsx — diff ===
@@ -16,7 +16,7 @@ export function ListingPlanBenefits() {
       <ul className="space-y-2">
         {BENEFITS.map(({ key, Icon }) => (
           <li key={key} className="flex items-start gap-2 text-xs text-white/70">
-            <Icon size={14} className="text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
+            <Icon size={14} className="text-accent shrink-0 mt-0.5" aria-hidden="true" />
             {t(`listingPlan.benefits.${key}`)}
           </li>
         ))}

=== src/domain/partners/components/plan/ListingPlanChip.tsx — diff ===
@@ -10,11 +10,11 @@ import {
 
 const CHIP_STYLE: Record<ListingPlanChipStatus, string> = {
   none: 'bg-white/5 text-white/70 border-white/10',
-  trial: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
-  active: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
-  admin: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
-  suspended: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
-  pendingSeal: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
+  trial: 'bg-info-soft text-info border-info-line',
+  active: 'bg-accent-soft text-accent border-accent-line',
+  admin: 'bg-accent-soft text-accent border-accent-line',
+  suspended: 'bg-danger-soft text-danger border-danger-line',
+  pendingSeal: 'bg-warn-soft text-warn border-warn-line',
 };
 
 interface ListingPlanChipProps {
@@ -37,7 +37,7 @@ export function ListingPlanChip({ itemId, name, onOpen }: ListingPlanChipProps)
       disabled={loading}
       aria-label={t('listingPlan.chip.label', { name, status: label })}
       className={cn(
-        'min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-xl border text-[10px] font-semibold transition-colors hover:bg-white/10 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50',
+        'press min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-xl border text-[10px] font-semibold hover:bg-white/10 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50',
         CHIP_STYLE[status]
       )}
     >

=== src/domain/partners/components/plan/ListingPlanDialog.tsx — diff ===
@@ -33,7 +33,7 @@ interface ListingPlanDialogProps {
 }
 
 const buttonClass =
-  'w-full min-h-12 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50';
+  'press w-full min-h-12 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50';
 
 export function ListingPlanDialog({
   listing,
@@ -98,7 +98,7 @@ export function ListingPlanDialog({
           </p>
         ) : error || !plan.data ? (
           <div className="space-y-3">
-            <p className="text-sm text-rose-300">{error}</p>
+            <p className="text-sm text-danger">{error}</p>
             <button
               type="button"
               onClick={() => {
@@ -138,8 +138,8 @@ export function ListingPlanDialog({
                 </button>
               </>
             ) : (
-              <div className="space-y-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
-                <p className="text-xs text-amber-100 leading-relaxed">
+              <div className="space-y-3 p-4 rounded-2xl bg-warn-soft border border-warn-line">
+                <p className="text-xs text-warn leading-relaxed">
                   {t('listingPlan.verificationRequired')}
                 </p>
                 <button

=== src/domain/partners/components/plan/ListingPlanOptions.tsx — diff ===
@@ -14,9 +14,9 @@ interface ListingPlanOptionsProps {
 
 const optionClass = (isSelected: boolean) =>
   cn(
-    'w-full min-h-[56px] p-4 rounded-2xl border text-left flex items-center justify-between gap-3 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50',
+    'press w-full min-h-[56px] p-4 rounded-2xl border text-left flex items-center justify-between gap-3 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50',
     isSelected
-      ? 'bg-teal-500/10 border-teal-500/40'
+      ? 'bg-accent-soft border-accent-line'
       : 'bg-white/5 border-white/10 hover:bg-white/10'
   );
 
@@ -50,7 +50,7 @@ export function ListingPlanOptions({
               {t('listingPlan.options.trialHint')}
             </span>
           </span>
-          <span className="text-sm font-black text-teal-300">{t('listingPlan.options.free')}</span>
+          <span className="text-sm font-black text-accent">{t('listingPlan.options.free')}</span>
         </button>
       )}
       {paidPlans.length === 0 ? (
@@ -71,7 +71,7 @@ export function ListingPlanOptions({
               )}
             </span>
             <span className="text-right shrink-0">
-              <span className="block text-sm font-black text-teal-300">
+              <span className="block text-sm font-black text-accent">
                 {formatMoneyMinor(plan.priceMinor, i18n.language)}
               </span>
               {plan.monthlyEquivalentMinor ? (

=== src/domain/partners/components/plan/ListingPlanStatus.tsx — diff ===
@@ -28,7 +28,7 @@ export function ListingPlanStatus({ view }: { view: ListingPlanView }) {
       <p
         className={
           view.sealSuspended || !view.seal.isVerified
-            ? 'text-xs text-amber-200'
+            ? 'text-xs text-warn'
             : 'text-xs text-white/70'
         }
       >

=== src/domain/partners/components/steps/Step6Success.tsx — diff ===
@@ -19,14 +19,14 @@ export function Step6Success({ businessName, onClose, onAccessPanel }: Step6Succ
       id="success-step-container"
     >
       <div className="relative">
-        <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
+        <div className="w-24 h-24 rounded-[2.5rem] bg-success-soft flex items-center justify-center text-success border border-success-line shadow-[0_0_40px_rgba(16,185,129,0.1)]">
           <CheckCircle2 size={48} aria-hidden="true" />
         </div>
         <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           aria-hidden="true"
-          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold"
+          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-on-fill text-xs font-bold"
         >
           🚀
         </motion.div>
@@ -42,18 +42,18 @@ export function Step6Success({ businessName, onClose, onAccessPanel }: Step6Succ
               values={{ name: businessName }}
               components={{
                 name: <span className="text-white font-bold" />,
-                active: <span className="text-emerald-400 font-bold uppercase" />,
+                active: <span className="text-success font-bold uppercase" />,
               }}
             />
           </p>
         </div>
         <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left space-y-2">
-          <p className="text-[10px] font-black uppercase text-indigo-400">
+          <p className="text-[10px] font-black uppercase text-seal">
             {t('partners.signupSuccess.nextStepsTitle')}
           </p>
           <ul className="space-y-2">
             <li className="flex items-start gap-2 text-xs text-white/80 font-semibold">
-              <ShieldCheck size={14} className="text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
+              <ShieldCheck size={14} className="text-accent shrink-0 mt-0.5" aria-hidden="true" />
               {t('partners.signupSuccess.steps.verify')}
             </li>
             {STEPS.map((step) => (
@@ -71,7 +71,7 @@ export function Step6Success({ businessName, onClose, onAccessPanel }: Step6Succ
           <button
             type="button"
             onClick={onAccessPanel}
-            className="w-full py-5 rounded-[2rem] bg-indigo-500 text-white font-black uppercase tracking-widest text-[11px] hover:bg-indigo-400 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
+            className="w-full py-5 rounded-[2rem] bg-indigo-500 text-on-fill font-black uppercase tracking-widest text-[11px] hover:bg-indigo-400 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
             id="success-access-panel-btn"
           >
             <Rocket size={16} aria-hidden="true" />

=== src/domain/partners/components/subcomponents/PartnerHeader.tsx — diff ===
@@ -38,7 +38,7 @@ export function PartnerHeader({
               Painel do Parceiro
             </h1>
             <div className="flex items-center gap-2">
-              <p className="text-[10px] text-teal-400 font-semibold tracking-wide">
+              <p className="text-[10px] text-accent font-semibold tracking-wide">
                 {partnerProfile?.businessName || 'Meu Negócio'}
               </p>
             </div>

=== src/domain/partners/components/subcomponents/PartnerItemsTable.tsx — diff ===
@@ -69,9 +69,9 @@ export function PartnerItemsTable({
                 type="button"
                 onClick={() => onEditItem(item)}
                 aria-label={t('partners.items.edit', { name: item.name })}
-                className="absolute inset-0 rounded-3xl flex items-end justify-end p-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
+                className="press absolute inset-0 rounded-3xl flex items-end justify-end p-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
               >
-                <span className="p-2 rounded-xl bg-white/5 text-white/50 group-hover:text-teal-400 group-hover:bg-teal-400/10 transition-all">
+                <span className="p-2 rounded-xl bg-white/5 text-white/50 group-hover:text-accent group-hover:bg-accent-soft transition-all">
                   <Edit2 size={13} aria-hidden="true" />
                 </span>
               </button>
@@ -105,7 +105,7 @@ export function PartnerItemsTable({
                 </div>
                 <div className="mt-2 flex items-center gap-2">
                   {item.isActive !== false ? (
-                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[9px] font-semibold">
+                    <span className="px-2 py-0.5 rounded-md bg-success-soft text-success text-[9px] font-semibold">
                       Ativo
                     </span>
                   ) : (
@@ -146,7 +146,7 @@ export function PartnerItemsTable({
                     await onToggleActive(item.id, item.isActive !== false);
                   }
                 }}
-                className="absolute top-2 right-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl focus-visible:ring-2 focus-visible:ring-teal-400/50"
+                className="press absolute top-2 right-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl focus-visible:ring-2 focus-visible:ring-teal-400/50"
               >
                 <span
                   className={cn(

=== src/domain/partners/components/verification/DocumentVerificationForm.tsx — diff ===
@@ -67,13 +67,13 @@ export function DocumentVerificationForm({ submitting, onSubmit }: DocumentVerif
           inputMode="numeric"
           autoComplete="off"
           maxLength={documentType === 'cnpj' ? 18 : 14}
-          className={cn(INPUT, errors.document ? 'border-rose-500/50' : 'border-white/10')}
+          className={cn(INPUT, errors.document ? 'border-danger-line' : 'border-white/10')}
           {...register('document', {
             onChange: (event) => setValue('document', maskCpfCnpj(event.target.value)),
           })}
         />
         {errors.document && (
-          <p className="text-xs text-rose-300">{errorText(errors.document.message)}</p>
+          <p className="text-xs text-danger">{errorText(errors.document.message)}</p>
         )}
       </div>
 
@@ -160,7 +160,7 @@ export function DocumentVerificationForm({ submitting, onSubmit }: DocumentVerif
       <button
         type="submit"
         disabled={submitting}
-        className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-teal-500 text-black text-xs font-bold hover:bg-teal-400 disabled:opacity-60 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50"
+        className="press w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-teal-500 text-black text-xs font-bold hover:bg-teal-400 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-400/50"
       >
         {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
         {submitting ? t('verification.form.submitting') : t('verification.form.submit')}

=== src/domain/partners/components/verification/LinkedVerificationForm.tsx — diff ===
@@ -57,12 +57,12 @@ export function LinkedVerificationForm({
             </option>
           ))}
         </select>
-        {error && <p className="text-xs text-rose-300">{error}</p>}
+        {error && <p className="text-xs text-danger">{error}</p>}
       </div>
       <button
         type="submit"
         disabled={submitting}
-        className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-teal-500 text-black text-xs font-bold hover:bg-teal-400 disabled:opacity-60 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50"
+        className="press w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-teal-500 text-black text-xs font-bold hover:bg-teal-400 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-400/50"
       >
         {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
         {submitting ? t('verification.form.submitting') : t('verification.form.submit')}

=== src/domain/partners/components/verification/ListingVerificationDialog.tsx — diff ===
@@ -66,7 +66,7 @@ export function ListingVerificationDialog({
           </p>
         ) : error ? (
           <div className="space-y-3">
-            <p className="text-sm text-rose-300">{error}</p>
+            <p className="text-sm text-danger">{error}</p>
             <button
               type="button"
               onClick={() => void reload()}

=== src/domain/partners/components/verification/VerificationFileField.tsx — diff ===
@@ -37,8 +37,8 @@ export function VerificationFileField({
         type="button"
         onClick={() => inputRef.current?.click()}
         className={cn(
-          'w-full min-h-[44px] flex items-center gap-2 px-4 rounded-2xl border bg-white/5 text-xs text-white/80 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50',
-          error ? 'border-rose-500/50' : 'border-white/10'
+          'press w-full min-h-[44px] flex items-center gap-2 px-4 rounded-2xl border bg-white/5 text-xs text-white/80 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-400/50',
+          error ? 'border-danger-line' : 'border-white/10'
         )}
       >
         <FileUp size={14} aria-hidden="true" />
@@ -48,12 +48,10 @@ export function VerificationFileField({
             : t('verification.form.chooseFile')}
         </span>
         {file && (
-          <span className="ml-auto text-teal-300 shrink-0">
-            {t('verification.form.replaceFile')}
-          </span>
+          <span className="ml-auto text-accent shrink-0">{t('verification.form.replaceFile')}</span>
         )}
       </button>
-      {error && <p className="text-xs text-rose-300">{error}</p>}
+      {error && <p className="text-xs text-danger">{error}</p>}
     </div>
   );
 }

=== src/domain/partners/components/verification/VerificationQueueCard.tsx — diff ===
@@ -10,7 +10,7 @@ import type {
 
 const MIN_REASON = 5;
 const BUTTON =
-  'min-h-[44px] inline-flex items-center gap-2 px-4 rounded-2xl text-xs font-semibold transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50';
+  'press min-h-[44px] inline-flex items-center gap-2 px-4 rounded-2xl text-xs font-semibold disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50';
 
 interface VerificationQueueCardProps {
   entry: ListingVerificationQueueEntry;
@@ -148,7 +148,7 @@ export function VerificationQueueCard({ entry, onReview, onOpenFile }: Verificat
                 type="button"
                 disabled={busy || reason.trim().length < MIN_REASON}
                 onClick={() => void review('reject')}
-                className={`${BUTTON} bg-rose-500 text-white hover:bg-rose-400`}
+                className={`${BUTTON} bg-rose-600 text-on-fill hover:bg-rose-500`}
               >
                 {t('verification.admin.confirmReject')}
               </button>
@@ -186,7 +186,7 @@ export function VerificationQueueCard({ entry, onReview, onOpenFile }: Verificat
               type="button"
               disabled={busy}
               onClick={() => setRejecting(true)}
-              className={`${BUTTON} border border-rose-500/30 text-rose-300 hover:bg-rose-500/10`}
+              className={`${BUTTON} border border-danger-line text-danger hover:bg-danger-soft`}
             >
               <X size={14} aria-hidden="true" />
               {t('verification.admin.reject')}

=== src/domain/partners/components/verification/VerificationRadioGroup.tsx — diff ===
@@ -27,7 +27,7 @@ export function VerificationRadioGroup<T extends string>({
             className={cn(
               'min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-400/50',
               value === option.value
-                ? 'border-teal-400/60 bg-teal-400/10 text-white'
+                ? 'border-accent-line bg-accent-soft text-white'
                 : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
             )}
           >
@@ -43,7 +43,7 @@ export function VerificationRadioGroup<T extends string>({
           </label>
         ))}
       </div>
-      {error && <p className="text-xs text-rose-300">{error}</p>}
+      {error && <p className="text-xs text-danger">{error}</p>}
     </fieldset>
   );
 }

=== src/domain/partners/components/verification/verificationStatusStyle.ts — diff ===
@@ -2,7 +2,7 @@ import type { ListingVerificationView } from '../../types/listingVerification';
 
 export const VERIFICATION_STATUS_STYLE: Record<ListingVerificationView['status'], string> = {
   not_submitted: 'bg-white/5 text-white/70 border-white/10',
-  pending: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
-  approved: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
-  rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
+  pending: 'bg-warn-soft text-warn border-warn-line',
+  approved: 'bg-success-soft text-success border-success-line',
+  rejected: 'bg-danger-soft text-danger border-danger-line',
 };

=== src/domain/payment/components/CheckoutModal.tsx — diff ===
@@ -54,10 +54,10 @@ export function CheckoutModal({
           exit={{ opacity: 0, scale: 0.95, y: 12 }}
           className="w-full max-w-[480px] mx-auto my-auto"
         >
-          <GlassCard className="p-6 border border-white/15 bg-slate-950/90 shadow-2xl space-y-5 relative">
+          <GlassCard className="p-6 border border-white/15 bg-surface shadow-2xl space-y-5 relative">
             <div className="flex items-center justify-between border-b border-white/10 pb-4">
               <div className="flex items-center gap-2.5">
-                <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
+                <div className="w-10 h-10 rounded-xl bg-accent-soft border border-accent-line flex items-center justify-center text-accent">
                   <Lock size={18} />
                 </div>
                 <div>
@@ -69,7 +69,7 @@ export function CheckoutModal({
                 type="button"
                 onClick={handleClose}
                 aria-label={t('payment.checkout.close')}
-                className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer"
+                className="press w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer"
               >
                 <X size={18} />
               </button>
@@ -77,7 +77,7 @@ export function CheckoutModal({
 
             <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
               <span className="text-xs text-white/60">{t('payment.checkout.totalLabel')}</span>
-              <span className="text-xl font-black text-teal-300">
+              <span className="text-xl font-black text-accent">
                 {formatPlanAmount(amountMinor, i18n.language)}
                 <span className="block text-[11px] font-medium text-white/60 text-right">
                   {t(`payment.period.${planId}`)}
@@ -91,7 +91,7 @@ export function CheckoutModal({
                 <button
                   type="button"
                   onClick={() => setConfirmedMethod(method)}
-                  className="w-full min-h-12 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
+                  className="press w-full min-h-12 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
                 >
                   {t('payment.checkout.continue')}
                 </button>
@@ -121,7 +121,7 @@ export function CheckoutModal({
             )}
 
             <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-white/60">
-              <ShieldCheck size={14} className="text-teal-400 shrink-0" />
+              <ShieldCheck size={14} className="text-accent shrink-0" />
               <span>{t('payment.checkout.secureFooter')}</span>
             </div>
           </GlassCard>

=== src/domain/payment/components/PlanSubscriptionCard.tsx — diff ===
@@ -61,7 +61,7 @@ export function PlanSubscriptionCard({
   return (
     <GlassCard className="p-5 space-y-3 border border-white/10">
       <div className="flex items-center gap-2">
-        <CreditCard size={18} className="text-teal-300" aria-hidden="true" />
+        <CreditCard size={18} className="text-accent" aria-hidden="true" />
         <h2 className="text-sm font-bold text-white">{t('payment.subscription.title')}</h2>
       </div>
       {loading && (
@@ -72,11 +72,11 @@ export function PlanSubscriptionCard({
       )}
       {!loading && error && (
         <div className="flex flex-wrap items-center gap-3" role="alert">
-          <p className="text-xs text-red-200">{error}</p>
+          <p className="text-xs text-danger">{error}</p>
           <button
             type="button"
             onClick={() => void reload()}
-            className="min-h-11 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
+            className="press min-h-11 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
           >
             <RefreshCw size={13} aria-hidden="true" />
             <span>{t('payment.subscription.retry')}</span>

=== src/domain/payment/components/subcomponents/CheckoutStatusNotice.tsx — diff ===
@@ -8,7 +8,7 @@ export function CheckoutLoading() {
       className="py-10 flex flex-col items-center justify-center gap-3 text-white/70"
       role="status"
     >
-      <RefreshCw size={22} className="animate-spin text-teal-400" />
+      <RefreshCw size={22} className="animate-spin text-accent" />
       <span className="text-xs font-medium">{t('payment.checkout.preparing')}</span>
     </div>
   );
@@ -17,10 +17,10 @@ export function CheckoutLoading() {
 export function CheckoutPending({ title, description }: { title: string; description: string }) {
   return (
     <div
-      className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-3"
+      className="p-4 rounded-2xl bg-warn-soft border border-warn-line text-xs text-warn flex items-center gap-3"
       role="status"
     >
-      <Clock size={18} className="text-amber-300 shrink-0 animate-pulse" />
+      <Clock size={18} className="text-warn shrink-0 animate-pulse" />
       <div>
         <p className="font-bold">{title}</p>
         <p className="text-white/60 mt-0.5">{description}</p>
@@ -33,17 +33,17 @@ export function CheckoutError({ message, onRetry }: { message: string; onRetry?:
   const { t } = useTranslation();
   return (
     <div
-      className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-200 flex items-start gap-2.5"
+      className="p-3.5 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger flex items-start gap-2.5"
       role="alert"
     >
-      <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
+      <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
       <div className="flex-1 space-y-2">
         <p>{message}</p>
         {onRetry && (
           <button
             type="button"
             onClick={onRetry}
-            className="min-h-11 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
+            className="press min-h-11 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
           >
             <RefreshCw size={13} />
             <span>{t('payment.checkout.retry')}</span>

=== src/domain/payment/components/subcomponents/PaymentMethodChoice.tsx — diff ===
@@ -38,7 +38,7 @@ export function PaymentMethodChoice({ value, onChange }: PaymentMethodChoiceProp
             key={option}
             className={`flex items-start gap-3 min-h-11 p-3.5 rounded-2xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-teal-400/50 ${
               selected
-                ? 'border-teal-400/60 bg-teal-500/10'
+                ? 'border-accent-line bg-accent-soft'
                 : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
             }`}
           >
@@ -50,10 +50,7 @@ export function PaymentMethodChoice({ value, onChange }: PaymentMethodChoiceProp
               onChange={() => onChange(option)}
               className="sr-only"
             />
-            <Icon
-              size={18}
-              className={selected ? 'text-teal-300 mt-0.5' : 'text-white/60 mt-0.5'}
-            />
+            <Icon size={18} className={selected ? 'text-accent mt-0.5' : 'text-white/60 mt-0.5'} />
             <span className="flex-1">
               <span className="block text-sm font-bold text-white">{labels[option].title}</span>
               <span className="block text-xs text-white/60 mt-0.5">{labels[option].hint}</span>

=== src/domain/payment/components/subcomponents/SubscriptionPlanCheckout.tsx — diff ===
@@ -49,7 +49,7 @@ export function SubscriptionPlanCheckout({
   if (status === 'active') {
     return (
       <div className="py-6 flex flex-col items-center text-center gap-3" role="status">
-        <CheckCircle2 size={40} className="text-emerald-400" />
+        <CheckCircle2 size={40} className="text-success" />
         <p className="text-base font-bold text-white">{t('payment.checkout.successTitle')}</p>
         <p className="text-xs text-white/70">
           {t('payment.checkout.successDescription', { plan: itemName })}
@@ -57,7 +57,7 @@ export function SubscriptionPlanCheckout({
         <button
           type="button"
           onClick={onClose}
-          className="min-h-11 px-5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-sm font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
+          className="press min-h-11 px-5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-sm font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
         >
           {t('payment.checkout.close')}
         </button>

=== src/domain/payment/components/subcomponents/SuccessPaymentGlass.tsx — diff ===
@@ -1,4 +1,3 @@
-import React from 'react';
 import { motion } from 'motion/react';
 import { Check, CreditCard, Calendar, ShieldCheck, Mail } from 'lucide-react';
 import { useTranslation } from 'react-i18next';
@@ -26,16 +25,16 @@ export function SuccessPaymentGlass({
       exit={{ opacity: 0, scale: 0.92 }}
       className="text-center relative flex flex-col justify-center items-center py-6 px-1 space-y-6"
     >
-      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-teal-500/20 rounded-full filter blur-3xl -z-10 pointer-events-none animate-pulse" />
+      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent-soft rounded-full filter blur-3xl -z-10 pointer-events-none animate-pulse" />
 
       <div className="relative">
-        <div className="relative w-20 h-20 rounded-full bg-slate-900/80 backdrop-blur-md border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-[0_10px_30px_rgba(20,184,166,0.3)]">
+        <div className="relative w-20 h-20 rounded-full bg-slate-900/80 backdrop-blur-md border border-accent-line flex items-center justify-center text-accent shadow-[0_10px_30px_rgba(20,184,166,0.3)]">
           <Check size={40} className="stroke-[3]" />
         </div>
       </div>
 
       <div className="space-y-2 max-w-sm">
-        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/10 border border-teal-500/20 text-teal-300">
+        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent-soft border border-accent-line text-accent">
           <ShieldCheck size={11} />
           <span>Pagamento Confirmado</span>
         </span>
@@ -53,7 +52,7 @@ export function SuccessPaymentGlass({
       <GlassCard className="w-full p-5 space-y-4 bg-slate-900/35 border border-white/10 backdrop-blur-xl rounded-2xl text-left">
         <div className="flex justify-between items-center pb-3 border-b border-white/5">
           <span className="text-xs text-white/50">Valor Pago</span>
-          <span className="text-lg font-black text-teal-400">
+          <span className="text-lg font-black text-accent">
             {formatPlanAmount(amountMinor, i18n.language)}
           </span>
         </div>
@@ -62,7 +61,7 @@ export function SuccessPaymentGlass({
           <div className="space-y-1">
             <span className="text-white/50 block">Processamento</span>
             <span className="text-white/80 font-bold flex items-center gap-1.5">
-              <CreditCard size={15} className="text-teal-300" />
+              <CreditCard size={15} className="text-accent" />
               <span>Stripe (Cartão / Pix)</span>
             </span>
           </div>
@@ -70,20 +69,20 @@ export function SuccessPaymentGlass({
           <div className="space-y-1 text-right">
             <span className="text-white/50 block">Data</span>
             <span className="text-white/80 font-bold flex items-center gap-1 justify-end">
-              <Calendar size={13} className="text-teal-400/70" />
+              <Calendar size={13} className="text-accent" />
               <span>Hoje</span>
             </span>
           </div>
         </div>
 
         <div className="pt-2 flex items-start gap-2.5 text-[11px] text-white/50 leading-normal border-t border-white/5">
-          <Mail size={14} className="text-teal-400 shrink-0 mt-0.5" />
+          <Mail size={14} className="text-accent shrink-0 mt-0.5" />
           <span>Seu plano já está ativo e atualizado em sua conta de parceiro.</span>
         </div>
       </GlassCard>
 
       <div className="font-mono text-[10px] text-white/50 tracking-widest uppercase">
-        ID Transação: <span className="text-teal-400 px-1 font-bold">{paymentId}</span>
+        ID Transação: <span className="text-accent px-1 font-bold">{paymentId}</span>
       </div>
 
       <button

=== src/domain/payment/components/subscription/PlanPeriodChange.tsx — diff ===
@@ -45,9 +45,9 @@ export function PlanPeriodChange({
           aria-pressed={selected === plan.id}
           onClick={() => setSelected(plan.id)}
           className={cn(
-            'w-full min-h-[48px] px-4 py-3 rounded-xl border text-left flex items-center justify-between gap-3 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50',
+            'press w-full min-h-[48px] px-4 py-3 rounded-xl border text-left flex items-center justify-between gap-3 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50',
             selected === plan.id
-              ? 'bg-teal-500/10 border-teal-500/40'
+              ? 'bg-accent-soft border-accent-line'
               : 'bg-white/5 border-white/10 hover:bg-white/10'
           )}
         >
@@ -59,7 +59,7 @@ export function PlanPeriodChange({
               </span>
             )}
           </span>
-          <span className="text-sm font-black text-teal-300">
+          <span className="text-sm font-black text-accent">
             {formatPlanAmount(plan.priceMinor, i18n.language)}
           </span>
         </button>

=== src/domain/payment/components/subscription/SubscriptionDetails.tsx — diff ===
@@ -56,14 +56,14 @@ export function SubscriptionDetails({
     <>
       <p
         className={
-          subscription.status === 'past_due' ? 'text-sm text-amber-200' : 'text-sm text-white/80'
+          subscription.status === 'past_due' ? 'text-sm text-warn' : 'text-sm text-white/80'
         }
       >
         {message}
       </p>
       {pending && subscription.pendingChangeAt && (
-        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
-          <p className="text-xs text-cyan-100 flex-1 min-w-[12rem]">
+        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-info-soft border border-info-line">
+          <p className="text-xs text-info flex-1 min-w-[12rem]">
             {t('payment.subscription.pendingChange', {
               date: formatBillingDate(subscription.pendingChangeAt, i18n.language),
               plan: pending.name,

=== src/index.css — diff ===
@@ -1,3 +1,4 @@
+/* biome-ignore-all lint/complexity/noImportantStyles: o tema claro legado sobrescreve classes fixas (text-white, bg-white/5) de telas ainda sem tokens; sai quando todas usarem --ug-* (débito em docs/arquitetura/debitos.md). */
 @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;600;700;800&display=swap");
 @import "tailwindcss";
 
@@ -19,6 +20,96 @@
     }
   }
   --animate-pulse-slow: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
+
+  /* Transições de app nativo: entrada e saída curtas, curva de desaceleração (iOS/Material). */
+  @keyframes fade-in {
+    from {
+      opacity: 0;
+    }
+  }
+  @keyframes fade-out {
+    to {
+      opacity: 0;
+    }
+  }
+  /* `scale` e `translate` são propriedades próprias: não brigam com o translate de centralização. */
+  @keyframes scale-in {
+    from {
+      opacity: 0;
+      scale: 0.96;
+    }
+  }
+  @keyframes scale-out {
+    to {
+      opacity: 0;
+      scale: 0.96;
+    }
+  }
+  @keyframes sheet-up {
+    from {
+      translate: 0 100%;
+    }
+  }
+  @keyframes sheet-down {
+    to {
+      translate: 0 100%;
+    }
+  }
+  --animate-fade-in: fade-in 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
+  --animate-fade-out: fade-out 150ms ease-in forwards;
+  --animate-scale-in: scale-in 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
+  --animate-scale-out: scale-out 150ms ease-in forwards;
+  --animate-sheet-up: sheet-up 280ms cubic-bezier(0.32, 0.72, 0, 1);
+  --animate-sheet-down: sheet-down 220ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
+}
+
+/*
+ * Tokens que mudam com o tema (AGENTS.md §11.1). O claro usa tons de linho, nunca branco puro,
+ * para cansar menos a vista; o escuro é o padrão de design.
+ */
+@theme inline {
+  --color-app: var(--ug-app);
+  --color-ink: var(--ug-ink);
+  --color-surface: var(--ug-surface);
+  --color-surface-solid: var(--ug-surface-solid);
+  --color-line: var(--ug-line);
+  --color-scrim: var(--ug-scrim);
+  --color-accent: var(--ug-accent);
+  --color-accent-soft: var(--ug-accent-soft);
+  --color-accent-line: var(--ug-accent-line);
+  --color-warn: var(--ug-warn);
+  --color-warn-soft: var(--ug-warn-soft);
+  --color-warn-line: var(--ug-warn-line);
+  --color-info: var(--ug-info);
+  --color-info-soft: var(--ug-info-soft);
+  --color-info-line: var(--ug-info-line);
+  --color-success: var(--ug-success);
+  --color-success-soft: var(--ug-success-soft);
+  --color-success-line: var(--ug-success-line);
+  --color-danger: var(--ug-danger);
+  --color-danger-soft: var(--ug-danger-soft);
+  --color-danger-line: var(--ug-danger-line);
+  --color-seal: var(--ug-seal);
+  --color-seal-soft: var(--ug-seal-soft);
+  /* Texto sobre botão ou etiqueta colorida: claro nos dois temas, sem branco puro. */
+  --color-on-fill: #fff8f0;
+}
+
+/* Toque de app nativo: sem o flash azul do navegador e sem a espera do toque duplo. */
+@utility press {
+  -webkit-tap-highlight-color: transparent;
+  touch-action: manipulation;
+  transition-property: scale, background-color, border-color, color, opacity, box-shadow;
+  transition-duration: 150ms;
+  transition-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
+  &:active:not(:disabled) {
+    scale: 0.97;
+  }
+  @media (prefers-reduced-motion: reduce) {
+    &:active:not(:disabled) {
+      scale: 1;
+    }
+  }
 }
 
 /* Leaflet Overrides for Glassmorphism */
@@ -80,96 +171,144 @@
   --glass-border: rgba(255, 255, 255, 0.1);
   --liquid-accent: #0d9488; /* Teal 600 */
   --liquid-gradient: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
+
+  --ug-app: #060b1e;
+  --ug-ink: #ffffff;
+  --ug-surface: rgba(20, 22, 28, 0.94);
+  --ug-surface-solid: #14161c;
+  --ug-line: rgba(255, 255, 255, 0.1);
+  --ug-scrim: rgba(0, 0, 0, 0.7);
+  --ug-accent: #5eead4;
+  --ug-accent-soft: rgba(20, 184, 166, 0.12);
+  --ug-accent-line: rgba(20, 184, 166, 0.35);
+  --ug-warn: #fcd34d;
+  --ug-warn-soft: rgba(245, 158, 11, 0.1);
+  --ug-warn-line: rgba(245, 158, 11, 0.25);
+  --ug-info: #a5f3fc;
+  --ug-info-soft: rgba(6, 182, 212, 0.1);
+  --ug-info-line: rgba(6, 182, 212, 0.25);
+  --ug-success: #6ee7b7;
+  --ug-success-soft: rgba(16, 185, 129, 0.1);
+  --ug-success-line: rgba(16, 185, 129, 0.25);
+  --ug-danger: #fda4af;
+  --ug-danger-soft: rgba(244, 63, 94, 0.1);
+  --ug-danger-line: rgba(244, 63, 94, 0.25);
+  --ug-seal: #93c5fd;
+  --ug-seal-soft: rgba(59, 130, 246, 0.12);
 }
 
-/* Light Theme Variables and Class Overrides */
+/* Tema claro em tons de linho: fundo, superfícies e tinta quentes, sem branco puro. */
 :root.light {
-  --glass-bg: rgba(12, 17, 29, 0.05);
-  --glass-border: rgba(12, 17, 29, 0.1);
+  --glass-bg: rgba(35, 29, 22, 0.04);
+  --glass-border: rgba(35, 29, 22, 0.1);
+
+  --ug-app: #f3eee4;
+  --ug-ink: #231d16;
+  --ug-surface: rgba(250, 246, 238, 0.97);
+  --ug-surface-solid: #faf6ee;
+  --ug-line: rgba(35, 29, 22, 0.12);
+  --ug-scrim: rgba(35, 29, 22, 0.35);
+  --ug-accent: #0f766e;
+  --ug-accent-soft: rgba(13, 148, 136, 0.12);
+  --ug-accent-line: rgba(13, 148, 136, 0.4);
+  --ug-warn: #92400e;
+  --ug-warn-soft: rgba(217, 119, 6, 0.12);
+  --ug-warn-line: rgba(217, 119, 6, 0.35);
+  --ug-info: #155e75;
+  --ug-info-soft: rgba(8, 145, 178, 0.12);
+  --ug-info-line: rgba(8, 145, 178, 0.35);
+  --ug-success: #065f46;
+  --ug-success-soft: rgba(5, 150, 105, 0.12);
+  --ug-success-line: rgba(5, 150, 105, 0.35);
+  --ug-danger: #9f1239;
+  --ug-danger-soft: rgba(225, 29, 72, 0.1);
+  --ug-danger-line: rgba(225, 29, 72, 0.3);
+  --ug-seal: #1d4ed8;
+  --ug-seal-soft: rgba(37, 99, 235, 0.12);
 }
 
 :root.light body {
-  background-color: #f4f7f6 !important;
-  color: #0c111d !important;
+  background-color: var(--ug-app) !important;
+  color: #231d16 !important;
 }
 
 :root.light .bg-slate-950,
 :root.light .bg-\[\#020508\] {
-  background-color: #f4f7f6 !important;
+  background-color: var(--ug-app) !important;
 }
 
 /* Remove fixed background overlay to let BackgroundBlobs handle it dynamically */
 
 :root.light .text-white {
-  color: #0c111d !important;
+  color: #231d16 !important;
 }
 :root.light .text-white\/90 {
-  color: rgba(12, 17, 29, 0.9) !important;
+  color: rgba(35, 29, 22, 0.9) !important;
 }
 :root.light .text-white\/80 {
-  color: rgba(12, 17, 29, 0.8) !important;
+  color: rgba(35, 29, 22, 0.8) !important;
 }
 :root.light .text-white\/70,
 :root.light .text-zinc-300 {
-  color: rgba(12, 17, 29, 0.7) !important;
+  color: rgba(35, 29, 22, 0.7) !important;
 }
 :root.light .text-white\/60,
 :root.light .text-zinc-400,
 :root.light .text-slate-300 {
-  color: rgba(12, 17, 29, 0.6) !important;
+  color: rgba(35, 29, 22, 0.6) !important;
 }
 :root.light .text-white\/50,
 :root.light .text-slate-400 {
-  color: rgba(12, 17, 29, 0.5) !important;
+  color: rgba(35, 29, 22, 0.5) !important;
 }
 :root.light .text-white\/40,
 :root.light .text-zinc-500,
 :root.light .text-slate-500 {
-  color: rgba(12, 17, 29, 0.4) !important;
+  color: rgba(35, 29, 22, 0.4) !important;
 }
 :root.light .text-white\/30 {
-  color: rgba(12, 17, 29, 0.3) !important;
+  color: rgba(35, 29, 22, 0.3) !important;
 }
 :root.light .text-white\/20,
 :root.light .text-white\/10 {
-  color: rgba(12, 17, 29, 0.2) !important;
+  color: rgba(35, 29, 22, 0.2) !important;
 }
 
 :root.light .transparent-glass-light {
-  background-color: rgba(255, 255, 255, 0.6) !important;
+  background-color: rgba(250, 246, 238, 0.6) !important;
 }
 
 /* Borders and Glass */
 :root.light .border-white\/10 {
-  border-color: rgba(12, 17, 29, 0.08) !important;
+  border-color: rgba(35, 29, 22, 0.08) !important;
 }
 :root.light .border-white\/20 {
-  border-color: rgba(12, 17, 29, 0.12) !important;
+  border-color: rgba(35, 29, 22, 0.12) !important;
 }
 :root.light .border-white\/30 {
-  border-color: rgba(12, 17, 29, 0.2) !important;
+  border-color: rgba(35, 29, 22, 0.2) !important;
 }
 :root.light .bg-white\/5 {
-  background-color: rgba(12, 17, 29, 0.03) !important;
+  background-color: rgba(35, 29, 22, 0.03) !important;
 }
 :root.light .bg-white\/10 {
-  background-color: rgba(12, 17, 29, 0.06) !important;
+  background-color: rgba(35, 29, 22, 0.06) !important;
 }
 :root.light .bg-white\/20 {
-  background-color: rgba(12, 17, 29, 0.12) !important;
+  background-color: rgba(35, 29, 22, 0.12) !important;
 }
 :root.light .bg-white\/80 {
-  background-color: rgba(255, 255, 255, 0.95) !important;
+  background-color: rgba(250, 246, 238, 0.95) !important;
 }
 :root.light .bg-zinc-950,
 :root.light .bg-zinc-900 {
-  background-color: #ffffff !important;
+  background-color: var(--ug-surface-solid) !important;
 }
 :root.light .bg-black\/60 {
-  background-color: rgba(255, 255, 255, 0.7) !important;
+  background-color: rgba(243, 238, 228, 0.7) !important;
 }
 :root.light .bg-black\/80 {
-  background-color: rgba(255, 255, 255, 0.8) !important;
+  background-color: rgba(243, 238, 228, 0.8) !important;
 }
 
 @layer base {
@@ -191,9 +330,9 @@
 }
 
 :root.light .glassmorphism {
-  background-color: rgba(255, 255, 255, 0.45);
-  border-color: rgba(12, 17, 29, 0.08);
-  box-shadow: 0 4px 24px 0 rgba(12, 17, 29, 0.04);
+  background-color: rgba(250, 246, 238, 0.55);
+  border-color: rgba(35, 29, 22, 0.08);
+  box-shadow: 0 4px 24px 0 rgba(35, 29, 22, 0.04);
 }
 
 .glassmorphism-vibrant {
@@ -204,11 +343,11 @@
 }
 
 :root.light .glassmorphism-vibrant {
-  background-color: rgba(255, 255, 255, 0.65);
-  border-color: rgba(12, 17, 29, 0.12);
+  background-color: rgba(250, 246, 238, 0.72);
+  border-color: rgba(35, 29, 22, 0.12);
   box-shadow:
-    inset 0 0 20px rgba(255, 255, 255, 0.3),
-    0 8px 32px 0 rgba(12, 17, 29, 0.06);
+    inset 0 0 20px rgba(250, 246, 238, 0.35),
+    0 8px 32px 0 rgba(35, 29, 22, 0.06);
 }
 
 .no-scrollbar::-webkit-scrollbar {

=== src/shared/context/ThemeContext.tsx — diff ===
@@ -4,6 +4,8 @@ export type Theme = 'light' | 'dark' | 'system';
 
 interface ThemeContextType {
   theme: Theme;
+  /** Tema efetivo depois de resolver `system` pela preferência do aparelho. */
+  resolvedTheme: 'light' | 'dark';
   setTheme: (theme: Theme) => void;
 }
 
@@ -11,8 +13,9 @@ const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
 
 export function ThemeProvider({ children }: { children: React.ReactNode }) {
   const [theme, setThemeState] = useState<Theme>(() => {
+    // O escuro é o padrão de design (AGENTS.md §11.1); claro e sistema são escolhas da pessoa.
     const saved = localStorage.getItem('theme');
-    return (saved as Theme) || 'system';
+    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'dark';
   });
 
   const setTheme = (newTheme: Theme) => {
@@ -20,6 +23,8 @@ export function ThemeProvider({ children }: { children: React.ReactNode }) {
     setThemeState(newTheme);
   };
 
+  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
+
   useEffect(() => {
     const root = document.documentElement;
 
@@ -29,6 +34,11 @@ export function ThemeProvider({ children }: { children: React.ReactNode }) {
           ? window.matchMedia('(prefers-color-scheme: dark)').matches
           : theme === 'dark';
 
+      setResolvedTheme(isDark ? 'dark' : 'light');
+      // Barra de status do celular na cor do fundo, como num app nativo.
+      document
+        .querySelector('meta[name="theme-color"]')
+        ?.setAttribute('content', isDark ? '#060b1e' : '#f3eee4');
       if (isDark) {
         root.classList.remove('light');
         root.classList.add('dark');
@@ -49,7 +59,11 @@ export function ThemeProvider({ children }: { children: React.ReactNode }) {
     }
   }, [theme]);
 
-  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
+  return (
+    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
+      {children}
+    </ThemeContext.Provider>
+  );
 }
 
 export function useTheme() {

=== src/ui/components/BackgroundBlobs.tsx — diff ===
@@ -28,7 +28,7 @@ export function BackgroundBlobs() {
       className={cn(
         'fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-all duration-700 ease-in-out',
         isLight
-          ? 'bg-gradient-to-br from-[#ffffff] via-[#f7f9fc] to-[#edf2f7]'
+          ? 'bg-gradient-to-br from-[#f6f1e7] via-[#f3eee4] to-[#ece4d5]'
           : 'bg-gradient-to-br from-[#060B1E] via-[#010A01] to-[#000033]'
       )}
     >
@@ -36,7 +36,7 @@ export function BackgroundBlobs() {
       <svg
         className={cn(
           'absolute inset-0 w-full h-full transition-all duration-700 ease-in-out',
-          isLight ? 'opacity-[0.12] text-slate-400' : 'opacity-[0.06] text-cyan-500/60'
+          isLight ? 'opacity-[0.12] text-stone-400' : 'opacity-[0.06] text-cyan-500/60'
         )}
         xmlns="http://www.w3.org/2000/svg"
       >

=== src/ui/components/ConfirmDialog.tsx — diff ===
@@ -34,17 +34,17 @@ export function ConfirmDialog({ data }: ConfirmDialogProps) {
     >
       <RadixDialog.Portal>
         <RadixDialog.Overlay
-          className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
+          className="fixed inset-0 bg-scrim backdrop-blur-sm animate-fade-in data-[state=closed]:animate-fade-out motion-reduce:animate-none"
           style={{ zIndex: Z_INDEX.overlay }}
         />
         <RadixDialog.Content
-          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-xs outline-none animate-scale-in"
+          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-xs outline-none animate-scale-in data-[state=closed]:animate-scale-out motion-reduce:animate-none"
           style={{ zIndex: Z_INDEX.modalNested }}
         >
           <GlassCard className="p-6 flex flex-col items-center text-center gap-4">
             <Icon
               size={28}
-              className={positive ? 'text-emerald-400' : 'text-amber-400'}
+              className={positive ? 'text-success' : 'text-warn'}
               aria-hidden="true"
             />
             <RadixDialog.Title className="text-sm font-medium text-white/90 leading-relaxed">
@@ -54,7 +54,7 @@ export function ConfirmDialog({ data }: ConfirmDialogProps) {
               <button
                 type="button"
                 onClick={data?.onCancel}
-                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wide hover:bg-white/15 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
+                className="press flex-1 min-h-[44px] py-2.5 rounded-xl bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wide hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
               >
                 {t('common.cancel')}
               </button>
@@ -62,10 +62,10 @@ export function ConfirmDialog({ data }: ConfirmDialogProps) {
                 type="button"
                 onClick={data?.onConfirm}
                 className={cn(
-                  'flex-1 min-h-[44px] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors focus-visible:ring-2 focus-visible:outline-none',
+                  'press flex-1 min-h-[44px] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide focus-visible:ring-2 focus-visible:outline-none',
                   positive
                     ? 'bg-emerald-500 text-black hover:bg-emerald-400 focus-visible:ring-emerald-400/50'
-                    : 'bg-rose-500/80 text-white hover:bg-rose-500 focus-visible:ring-rose-400/50'
+                    : 'bg-rose-600 !text-[#fff8f0] hover:bg-rose-500 focus-visible:ring-rose-400/50'
                 )}
               >
                 {data?.confirmLabel ?? t('common.confirm')}

=== src/ui/components/Dialog.tsx — diff ===
@@ -25,18 +25,30 @@ export function Dialog({
     <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
       <RadixDialog.Portal>
         <RadixDialog.Overlay
-          className="fixed inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
+          className="fixed inset-0 bg-scrim backdrop-blur-md animate-fade-in data-[state=closed]:animate-fade-out motion-reduce:animate-none"
           style={{ zIndex: Z_INDEX.overlay }}
         />
+        {/* Celular: folha que sobe da borda (como num app nativo). Do sm em diante: cartão central. */}
         <RadixDialog.Content
           className={cn(
-            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md p-6 rounded-3xl bg-neutral-900/90 border border-white/10 shadow-2xl backdrop-blur-xl text-white outline-none animate-scale-in',
+            'fixed inset-x-0 bottom-0 mx-auto w-full max-w-md max-h-[92dvh] overflow-y-auto p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] rounded-t-3xl bg-surface border border-line shadow-2xl backdrop-blur-xl text-ink outline-none overscroll-contain animate-sheet-up data-[state=closed]:animate-sheet-down motion-reduce:animate-none',
+            'sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[calc(100%-2rem)] sm:pb-6 sm:rounded-3xl sm:animate-scale-in sm:data-[state=closed]:animate-scale-out',
             className
           )}
           style={{ zIndex: Z_INDEX.modal }}
+          // O Radix foca o primeiro controle (o botão fechar) e o anel de foco aparece sem o usuário usar o teclado.
+          // Focar a própria folha mantém o Tab e o leitor de tela começando dentro do diálogo.
+          onOpenAutoFocus={(event) => {
+            event.preventDefault();
+            (event.currentTarget as HTMLElement).focus();
+          }}
         >
+          <div
+            aria-hidden="true"
+            className="mx-auto -mt-2 mb-4 h-1.5 w-10 rounded-full bg-line sm:hidden"
+          />
           {title && (
-            <RadixDialog.Title className="text-lg font-bold text-white tracking-tight mb-1">
+            <RadixDialog.Title className="text-lg font-bold text-ink tracking-tight mb-1 pr-10">
               {title}
             </RadixDialog.Title>
           )}
@@ -50,7 +62,7 @@ export function Dialog({
 
           <RadixDialog.Close
             aria-label="Fechar modal"
-            className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
+            className="press absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
           >
             <X size={20} />
           </RadixDialog.Close>

=== src/ui/components/Popover.tsx — diff ===
@@ -34,7 +34,7 @@ export function Popover({
           side={side}
           sideOffset={8}
           className={cn(
-            'p-4 rounded-2xl bg-neutral-900/95 border border-white/10 shadow-2xl backdrop-blur-xl text-white outline-none animate-scale-in max-w-xs w-full',
+            'p-4 rounded-2xl bg-surface border border-line shadow-2xl backdrop-blur-xl text-ink outline-none animate-scale-in data-[state=closed]:animate-scale-out motion-reduce:animate-none max-w-xs w-full origin-(--radix-popover-content-transform-origin)',
             className
           )}
           style={{ zIndex }}
@@ -50,7 +50,7 @@ export function Popover({
             </RadixPopover.Close>
           )}
 
-          <RadixPopover.Arrow className="fill-neutral-900/95" />
+          <RadixPopover.Arrow className="fill-surface-solid" />
         </RadixPopover.Content>
       </RadixPopover.Portal>
     </RadixPopover.Root>

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/app/AppProviders.tsx src/domain/admin/components/subcomponents/AdminItemGrid.tsx src/domain/admin/components/subcomponents/AdminPartnersView.tsx src/domain/insights/components/ReportsView.tsx src/domain/insights/components/reports/PendingReviewCard.tsx src/domain/partners/components/PartnerPanel.tsx src/domain/partners/components/plan/AdminListingSealControl.tsx src/domain/partners/components/plan/ListingPlanBenefits.tsx src/domain/partners/components/plan/ListingPlanChip.tsx src/domain/partners/components/plan/ListingPlanDialog.tsx src/domain/partners/components/plan/ListingPlanOptions.tsx src/domain/partners/components/plan/ListingPlanStatus.tsx src/domain/partners/components/steps/Step6Success.tsx src/domain/partners/components/subcomponents/PartnerHeader.tsx src/domain/partners/components/subcomponents/PartnerItemsTable.tsx src/domain/partners/components/verification/DocumentVerificationForm.tsx src/domain/partners/components/verification/LinkedVerificationForm.tsx src/domain/partners/components/verification/ListingVerificationDialog.tsx src/domain/partners/components/verification/VerificationFileField.tsx src/domain/partners/components/verification/VerificationQueueCard.tsx src/domain/partners/components/verification/VerificationRadioGroup.tsx src/domain/partners/components/verification/verificationStatusStyle.ts src/domain/payment/components/CheckoutModal.tsx src/domain/payment/components/PlanSubscriptionCard.tsx src/domain/payment/components/subcomponents/CheckoutStatusNotice.tsx src/domain/payment/components/subcomponents/PaymentMethodChoice.tsx src/domain/payment/components/subcomponents/SubscriptionPlanCheckout.tsx src/domain/payment/components/subcomponents/SuccessPaymentGlass.tsx src/domain/payment/components/subscription/PlanPeriodChange.tsx src/domain/payment/components/subscription/SubscriptionDetails.tsx src/shared/context/ThemeContext.tsx src/ui/components/BackgroundBlobs.tsx src/ui/components/ConfirmDialog.tsx src/ui/components/Dialog.tsx src/ui/components/Popover.tsx` (todos verdes). Não precisa rodar a suíte inteira.
- no app, em Configurações → Aparência, alterne claro e escuro e confira:
  - painel do parceiro → plano de um cadastro: no celular abre como folha que sobe de baixo; no desktop, cartão central; fecha com animação; o X não aparece destacado ao abrir;
  - no claro nada é branco puro, e os avisos (amarelo, vermelho, verde) continuam legíveis;
  - admin → Itens do Guia: o filtro ativo "Todos" fica escuro no claro e claro no escuro; "Recusar" na fila de verificação é legível;
  - relatórios: "Responder avaliação" legível no claro;
  - recarregar a página no tema claro não pisca o escuro.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
