# Prompt 23.4 — Folhas seguem as telas no tema claro e título do Suporte

> Lote 19, gerado dos commits de referência `7788a52..1bf7dc1` da branch `claude/agents-md-v2`. Aplique por último no lote 19 (depois do 23.3). Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 23.4 — Folhas seguem as telas no tema claro e título do Suporte

Pedido do responsável do produto em 2026-11-03: nas folhas do tema claro, fundo bege e cartões claros, como nas telas. O escuro não muda.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Tokens novos em src/index.css: --ug-sheet, --ug-sheet-card e --ug-sheet-card-line (classes bg-sheet, bg-sheet-card, border-sheet-card-line). Claro: folha #f3eee4 (bege, como o fundo das telas) e cartões #faf6ee com borda. Escuro e modo portaria: iguais ao que já era (folha #1e2024, blocos 4% mais claros, sem borda).
2) Dialog (folha do design system) usa bg-sheet.
3) Blocos dentro das folhas (recibo de compra, central de notificações, decisão da reclamação, força maior, provas do serviço, ações da reserva, link de transferência recebido) usam bg-sheet-card com a borda.
4) Suporte: o título perde o "Oi!" — "Como podemos ajudar?" (en: "How can we help?", fr: "Comment pouvons-nous vous aider ?").

ARQUIVOS (crie, altere ou apague exatamente estes):
- src/domain/bookings/components/admin/ServiceEvidenceList.tsx (alterar)
- src/domain/bookings/components/buyer/BookingServiceActions.tsx (alterar)
- src/domain/notifications/components/NotificationCenterSheet.tsx (alterar)
- src/domain/payment/components/admin/ForceMajeureSheet.tsx (alterar)
- src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx (alterar)
- src/domain/ticketing/components/wallet/TransferLinkReceiverDialog.tsx (alterar)
- src/index.css (alterar)
- src/shared/i18n/helpResources.ts (alterar)
- src/ui/components/Dialog.tsx (alterar)
- src/ui/components/purchases/PurchaseReceiptSheet.tsx (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== src/domain/bookings/components/admin/ServiceEvidenceList.tsx — diff ===
@@ -83,7 +83,7 @@ export function ServiceEvidenceList({ evidence }: { evidence: BookingServiceEvid
 
   const location = arrival?.location;
   return (
-    <div className="p-4 rounded-2xl bg-ink/[0.04] space-y-1.5">
+    <div className="p-4 rounded-2xl bg-sheet-card border border-sheet-card-line space-y-1.5">
       <p className="text-[13px] font-semibold text-ink">{t('serviceProof.evidence.title')}</p>
       <ul className="space-y-1">
         {lines.map((line) => (

=== src/domain/bookings/components/buyer/BookingServiceActions.tsx — diff ===
@@ -95,7 +95,7 @@ export function BookingServiceActions({
   const absence = booking.providerAbsence;
   if (isConfirmationPending(booking, now) && booking.serviceConfirmation) {
     content = (
-      <div className="p-4 rounded-2xl bg-ink/[0.04] space-y-3">
+      <div className="p-4 rounded-2xl bg-sheet-card border border-sheet-card-line space-y-3">
         <div className="space-y-1">
           <p className="text-[15px] font-semibold text-ink">
             {t('serviceProof.buyer.questionTitle')}

=== src/domain/notifications/components/NotificationCenterSheet.tsx — diff ===
@@ -144,7 +144,7 @@ export function NotificationCenterSheet({
                     <button
                       type="button"
                       onClick={() => onOpenItem(item)}
-                      className="press w-full p-4 rounded-2xl bg-ink/[0.04] flex items-start gap-3 text-left hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
+                      className="press w-full p-4 rounded-2xl bg-sheet-card border border-sheet-card-line flex items-start gap-3 text-left hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
                     >
                       <span className="flex-1 min-w-0 space-y-0.5">
                         <span

=== src/domain/payment/components/admin/ForceMajeureSheet.tsx — diff ===
@@ -37,7 +37,7 @@ export function ForceMajeureSheet({
     >
       {review && (
         <div className="space-y-4">
-          <div className="p-4 rounded-2xl bg-ink/[0.04] space-y-2">
+          <div className="p-4 rounded-2xl bg-sheet-card border border-sheet-card-line space-y-2">
             <p className="text-sm text-ink/80 whitespace-pre-line break-words">
               “{review.forceMajeureReason}”
             </p>

=== src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx — diff ===
@@ -12,7 +12,7 @@ import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceError
 const OUTCOMES: SaleClaimOutcome[] = ['release', 'refund_full', 'refund_partial'];
 
 const OPTION =
-  'press min-h-14 px-4 py-2.5 rounded-2xl bg-ink/[0.04] flex items-center gap-3 text-sm text-ink cursor-pointer has-[:checked]:bg-accent-soft has-[:checked]:ring-1 has-[:checked]:ring-accent-line focus-within:ring-2 focus-within:ring-teal-400/50';
+  'press min-h-14 px-4 py-2.5 rounded-2xl bg-sheet-card border border-sheet-card-line flex items-center gap-3 text-sm text-ink cursor-pointer has-[:checked]:bg-accent-soft has-[:checked]:ring-1 has-[:checked]:ring-accent-line focus-within:ring-2 focus-within:ring-teal-400/50';
 
 /** Decisão do admin (D16, 2A); o backend recalcula os valores e confere a multa. */
 export function SaleClaimDecisionDialog({
@@ -81,7 +81,7 @@ export function SaleClaimDecisionDialog({
     >
       {claim && (
         <form onSubmit={submit} className="space-y-4" noValidate>
-          <div className="p-4 rounded-2xl bg-ink/[0.04] space-y-1.5">
+          <div className="p-4 rounded-2xl bg-sheet-card border border-sheet-card-line space-y-1.5">
             <p className="text-[13px] font-semibold text-warn flex items-center gap-1.5">
               <AlertCircle size={15} aria-hidden="true" />
               {t(`saleClaims.reason.${claim.reason}`)}
@@ -154,7 +154,7 @@ export function SaleClaimDecisionDialog({
             </div>
           )}
           {penaltyAllowed && (
-            <label className="press min-h-14 px-4 py-2.5 rounded-2xl bg-ink/[0.04] flex items-center justify-between gap-3 cursor-pointer focus-within:ring-2 focus-within:ring-teal-400/50">
+            <label className="press min-h-14 px-4 py-2.5 rounded-2xl bg-sheet-card border border-sheet-card-line flex items-center justify-between gap-3 cursor-pointer focus-within:ring-2 focus-within:ring-teal-400/50">
               <span className="space-y-0.5">
                 <span className="block text-sm font-semibold text-ink">
                   {t('adminFinance.claims.penaltyLabel')}

=== src/domain/ticketing/components/wallet/TransferLinkReceiverDialog.tsx — diff ===
@@ -98,7 +98,7 @@ export function TransferLinkReceiverDialog({
           </>
         ) : preview ? (
           <>
-            <div className="flex items-start gap-3 p-3 rounded-2xl bg-ink/[0.04]">
+            <div className="flex items-start gap-3 p-3 rounded-2xl bg-sheet-card border border-sheet-card-line">
               <span className="w-11 h-11 shrink-0 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                 <TicketIcon size={20} aria-hidden="true" />
               </span>

=== src/index.css — diff ===
@@ -84,6 +84,9 @@
   --color-ink: var(--ug-ink);
   --color-surface: var(--ug-surface);
   --color-surface-solid: var(--ug-surface-solid);
+  --color-sheet: var(--ug-sheet);
+  --color-sheet-card: var(--ug-sheet-card);
+  --color-sheet-card-line: var(--ug-sheet-card-line);
   --color-line: var(--ug-line);
   --color-scrim: var(--ug-scrim);
   --color-accent: var(--ug-accent);
@@ -188,6 +191,10 @@
   --ug-ink: #ffffff;
   --ug-surface: #1e2024;
   --ug-surface-solid: #1e2024;
+  /* Folhas (D17): no escuro, folha na cor do cartão e blocos um pouco mais claros. */
+  --ug-sheet: #1e2024;
+  --ug-sheet-card: rgba(255, 255, 255, 0.04);
+  --ug-sheet-card-line: transparent;
   --ug-line: rgba(255, 255, 255, 0.08);
   --ug-scrim: rgba(0, 0, 0, 0.7);
   --ug-accent: #5eead4;
@@ -215,6 +222,10 @@
   --ug-ink: #ffffff;
   --ug-surface: #1e2024;
   --ug-surface-solid: #1e2024;
+  /* Folhas (D17): no escuro, folha na cor do cartão e blocos um pouco mais claros. */
+  --ug-sheet: #1e2024;
+  --ug-sheet-card: rgba(255, 255, 255, 0.04);
+  --ug-sheet-card-line: transparent;
   --ug-line: rgba(255, 255, 255, 0.08);
   --ug-accent: #5eead4;
   --ug-accent-soft: rgba(20, 184, 166, 0.12);
@@ -235,6 +246,10 @@
   --ug-ink: #231d16;
   --ug-surface: rgba(250, 246, 238, 0.97);
   --ug-surface-solid: #faf6ee;
+  /* Folhas no claro seguem as telas: fundo bege e cartões claros com borda. */
+  --ug-sheet: #f3eee4;
+  --ug-sheet-card: #faf6ee;
+  --ug-sheet-card-line: rgba(35, 29, 22, 0.12);
   --ug-line: rgba(35, 29, 22, 0.12);
   --ug-scrim: rgba(35, 29, 22, 0.35);
   --ug-accent: #0f766e;

=== src/shared/i18n/helpResources.ts — diff ===
@@ -42,7 +42,7 @@ export const helpPtBR: HelpTranslation = {
     tickets: 'Meus ingressos',
     bookings: 'Minhas reservas',
   },
-  greeting: 'Oi! Como podemos ajudar?',
+  greeting: 'Como podemos ajudar?',
   topicsTitle: 'Assuntos',
   topTitle: 'Perguntas mais lidas',
   resultsTitle: 'Resultados',
@@ -187,7 +187,7 @@ export const helpEn: HelpTranslation = {
     tickets: 'My tickets',
     bookings: 'My bookings',
   },
-  greeting: 'Hi! How can we help?',
+  greeting: 'How can we help?',
   topicsTitle: 'Topics',
   topTitle: 'Most read questions',
   resultsTitle: 'Results',
@@ -332,7 +332,7 @@ export const helpFr: HelpTranslation = {
     tickets: 'Mes billets',
     bookings: 'Mes réservations',
   },
-  greeting: 'Bonjour ! Comment pouvons-nous vous aider ?',
+  greeting: 'Comment pouvons-nous vous aider ?',
   topicsTitle: 'Sujets',
   topTitle: 'Questions les plus lues',
   resultsTitle: 'Résultats',

=== src/ui/components/Dialog.tsx — diff ===
@@ -40,7 +40,7 @@ export function Dialog({
         {/* Celular: folha que sobe da borda (como num app nativo). Do sm em diante: cartão central. */}
         <RadixDialog.Content
           className={cn(
-            'fixed inset-x-0 bottom-0 mx-auto w-full max-w-md max-h-[92dvh] overflow-y-auto p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] rounded-t-3xl bg-surface border border-line shadow-2xl backdrop-blur-xl text-ink outline-none overscroll-contain animate-sheet-up data-[state=closed]:animate-sheet-down motion-reduce:animate-none',
+            'fixed inset-x-0 bottom-0 mx-auto w-full max-w-md max-h-[92dvh] overflow-y-auto p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] rounded-t-3xl bg-sheet border border-line shadow-2xl backdrop-blur-xl text-ink outline-none overscroll-contain animate-sheet-up data-[state=closed]:animate-sheet-down motion-reduce:animate-none',
             'sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[calc(100%-2rem)] sm:pb-6 sm:rounded-3xl sm:animate-scale-in sm:data-[state=closed]:animate-scale-out',
             className
           )}

=== src/ui/components/purchases/PurchaseReceiptSheet.tsx — diff ===
@@ -63,7 +63,7 @@ export function PurchaseReceiptSheet({
           <p className="text-sm text-ink/70 mt-1">{serviceLine}</p>
         </div>
         {lines.length > 0 && (
-          <dl className="p-4 rounded-2xl bg-ink/[0.04] space-y-2">
+          <dl className="p-4 rounded-2xl bg-sheet-card border border-sheet-card-line space-y-2">
             {lines.map((line, index) => (
               <div
                 key={`${line.label}-${index}`}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/domain/bookings/components/admin/ServiceEvidenceList.tsx src/domain/bookings/components/buyer/BookingServiceActions.tsx src/domain/notifications/components/NotificationCenterSheet.tsx src/domain/payment/components/admin/ForceMajeureSheet.tsx src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx src/domain/ticketing/components/wallet/TransferLinkReceiverDialog.tsx src/shared/i18n/helpResources.ts src/ui/components/Dialog.tsx src/ui/components/purchases/PurchaseReceiptSheet.tsx` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique o Hosting.
