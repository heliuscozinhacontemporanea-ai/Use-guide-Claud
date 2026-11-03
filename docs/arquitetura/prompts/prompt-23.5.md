# Prompt 23.5 — Verde forte para ação, interruptor branco, filtros da central centralizados e mensagem do push testável

> Lote 19, gerado dos commits de referência `3a7e901..bc78a72` da branch `claude/agents-md-v2`. Aplique por último no lote 19, depois do 23.4. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 23.5 — Verde forte para ação, interruptor branco, filtros da central centralizados e mensagem do push testável

D26, aprovada em 2026-11-03.

~~~~text
Siga o AGENTS.md (o §11.1 já foi atualizado pelo prompt A8). O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) src/index.css: a escala teal-* (50 a 950) passa a ser verde, com o 400 em #11D450; os componentes continuam com as mesmas classes. Tokens accent: #3EE47A no escuro (e modo portaria) e #087A2E no claro. --liquid-accent e --liquid-gradient em verde.
2) Stripe (Payment Element e Connect): colorPrimary #11d450.
3) Folha de decisão da reclamação: bolinha do interruptor da multa sempre branca, como nos outros.
4) Central de notificações: filtros "Não lidas" e "Tudo" centralizados e com a mesma largura; o menu "…" fica no canto direito.
5) server/domain/notifications/adapters/fcmPushSenderAdapter.ts: a mensagem do FCM passa a ser montada por buildFcmMulticastMessage (função pura, com teste); o envio não muda.

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/domain/notifications/adapters/fcmPushSenderAdapter.test.ts (criar)
- server/domain/notifications/adapters/fcmPushSenderAdapter.ts (alterar)
- src/domain/notifications/components/NotificationCenterSheet.tsx (alterar)
- src/domain/payment/adapters/stripeConnectAdapter.ts (alterar)
- src/domain/payment/adapters/ui/StripePaymentElement.tsx (alterar)
- src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx (alterar)
- src/index.css (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/domain/notifications/adapters/fcmPushSenderAdapter.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../infrastructure/firebase/adminClient', () => ({ adminMessaging: {} }));

import { buildFcmMulticastMessage } from './fcmPushSenderAdapter';

describe('buildFcmMulticastMessage', () => {
  it('monta o web push com ícone, tag do aviso e link absoluto da tela certa', () => {
    expect(
      buildFcmMulticastMessage(['t1', 't2'], {
        title: 'Você recebeu um ingresso',
        body: 'Um ingresso para Luau está na sua carteira.',
        link: { screen: 'tickets' },
        tag: 'n1',
      })
    ).toEqual({
      tokens: ['t1', 't2'],
      webpush: {
        notification: {
          title: 'Você recebeu um ingresso',
          body: 'Um ingresso para Luau está na sua carteira.',
          icon: '/pwa-192x192.png',
          badge: '/favicon-32x32.png',
          tag: 'n1',
        },
        fcmOptions: { link: 'https://useguide.com.br/?menu=tickets' },
      },
      data: { link: 'https://useguide.com.br/?menu=tickets' },
    });
  });

  it('aviso do parceiro abre o painel; sem destino, a página inicial', () => {
    const partner = buildFcmMulticastMessage(['t'], {
      title: 'a',
      body: 'b',
      link: { screen: 'partner' },
      tag: 'x',
    });
    expect(partner.webpush.fcmOptions.link).toBe('https://useguide.com.br/?partner=1');
    const none = buildFcmMulticastMessage(['t'], { title: 'a', body: 'b', link: null, tag: 'x' });
    expect(none.data.link).toBe('https://useguide.com.br/');
  });
});

=== server/domain/notifications/adapters/fcmPushSenderAdapter.ts — diff ===
@@ -22,24 +22,31 @@ const INVALID_TOKEN_CODES = new Set([
   'messaging/invalid-registration-token',
 ]);
 
+/** Mensagem do FCM para os aparelhos (web push). Separada para a simulação e os testes. */
+export function buildFcmMulticastMessage(tokens: string[], message: PushMessage) {
+  const link = `${SITE_URL}${message.link ? PATHS[message.link.screen] : '/'}`;
+  return {
+    tokens,
+    webpush: {
+      notification: {
+        title: message.title,
+        body: message.body,
+        icon: '/pwa-192x192.png',
+        badge: '/favicon-32x32.png',
+        tag: message.tag,
+      },
+      fcmOptions: { link },
+    },
+    data: { link },
+  };
+}
+
 export class FcmPushSenderAdapter implements PushSenderPort {
   async send(tokens: string[], message: PushMessage): Promise<{ invalidTokens: string[] }> {
     if (tokens.length === 0) return { invalidTokens: [] };
-    const link = `${SITE_URL}${message.link ? PATHS[message.link.screen] : '/'}`;
-    const response = await adminMessaging.sendEachForMulticast({
-      tokens,
-      webpush: {
-        notification: {
-          title: message.title,
-          body: message.body,
-          icon: '/pwa-192x192.png',
-          badge: '/favicon-32x32.png',
-          tag: message.tag,
-        },
-        fcmOptions: { link },
-      },
-      data: { link },
-    });
+    const response = await adminMessaging.sendEachForMulticast(
+      buildFcmMulticastMessage(tokens, message)
+    );
     const invalidTokens = tokens.filter((_, index) => {
       const result = response.responses[index];
       return result && !result.success && INVALID_TOKEN_CODES.has(result.error?.code ?? '');

=== src/domain/notifications/components/NotificationCenterSheet.tsx — diff ===
@@ -64,7 +64,7 @@ export function NotificationCenterSheet({
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange} title={t('notify.center.title')}>
-      <div className="flex items-center justify-between gap-2 -mt-1 mb-4">
+      <div className="relative flex items-center justify-center -mt-1 mb-4 min-h-11">
         <div className="flex gap-2">
           {(['unread', 'all'] as const).map((key) => (
             <button
@@ -73,7 +73,7 @@ export function NotificationCenterSheet({
               aria-pressed={filter === key}
               onClick={() => setFilter(key)}
               className={cn(
-                'press min-h-11 px-4 rounded-full text-[14px] font-semibold border focus-visible:ring-2 focus-visible:ring-teal-400/50',
+                'press min-h-11 w-28 px-3 rounded-full text-[14px] font-semibold border focus-visible:ring-2 focus-visible:ring-teal-400/50',
                 filter === key ? 'bg-ink text-app border-ink' : 'text-ink/80 border-line'
               )}
             >
@@ -81,30 +81,32 @@ export function NotificationCenterSheet({
             </button>
           ))}
         </div>
-        <DropdownMenu
-          trigger={
-            <button
-              type="button"
-              aria-label={t('notify.center.more')}
-              className="press w-11 h-11 rounded-full flex items-center justify-center text-ink/80 hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50"
-            >
-              <Ellipsis size={20} aria-hidden="true" />
-            </button>
-          }
-          items={[
-            {
-              label: t('notify.center.settings'),
-              icon: <SlidersHorizontal size={18} aria-hidden="true" />,
-              onClick: onOpenSettings,
-            },
-            {
-              label: t('notify.center.markAll'),
-              icon: <CheckCheck size={18} aria-hidden="true" />,
-              onClick: onMarkAllRead,
-              disabled: !hasUnread,
-            },
-          ]}
-        />
+        <div className="absolute right-0 top-1/2 -translate-y-1/2">
+          <DropdownMenu
+            trigger={
+              <button
+                type="button"
+                aria-label={t('notify.center.more')}
+                className="press w-11 h-11 rounded-full flex items-center justify-center text-ink/80 hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50"
+              >
+                <Ellipsis size={20} aria-hidden="true" />
+              </button>
+            }
+            items={[
+              {
+                label: t('notify.center.settings'),
+                icon: <SlidersHorizontal size={18} aria-hidden="true" />,
+                onClick: onOpenSettings,
+              },
+              {
+                label: t('notify.center.markAll'),
+                icon: <CheckCheck size={18} aria-hidden="true" />,
+                onClick: onMarkAllRead,
+                disabled: !hasUnread,
+              },
+            ]}
+          />
+        </div>
       </div>
 
       {loading ? (

=== src/domain/payment/adapters/stripeConnectAdapter.ts — diff ===
@@ -5,7 +5,7 @@ export type ConnectTheme = 'light' | 'dark';
 // Cores do tema do app (src/index.css): o componente do Stripe não lê as variáveis CSS da página.
 const APPEARANCE: Record<ConnectTheme, Record<string, string>> = {
   dark: {
-    colorPrimary: '#2dd4bf',
+    colorPrimary: '#11d450',
     colorBackground: '#0b1120',
     colorText: '#f8fafc',
     colorSecondaryText: '#94a3b8',

=== src/domain/payment/adapters/ui/StripePaymentElement.tsx — diff ===
@@ -146,7 +146,7 @@ export function StripePaymentElement({ clientSecret, ...formProps }: StripePayme
         : {
             theme: 'night',
             variables: {
-              colorPrimary: '#2dd4bf',
+              colorPrimary: '#11d450',
               colorBackground: '#090d16',
               colorText: '#f8fafc',
               colorDanger: '#f87171',

=== src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx — diff ===
@@ -172,7 +172,7 @@ export function SaleClaimDecisionDialog({
               />
               <span
                 aria-hidden="true"
-                className="relative w-11 h-6 shrink-0 rounded-full bg-ink/20 transition-colors peer-checked:bg-teal-500 after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-surface-solid after:shadow after:transition-[translate] peer-checked:after:translate-x-5"
+                className="relative w-11 h-6 shrink-0 rounded-full bg-ink/20 transition-colors peer-checked:bg-teal-500 after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-[#ffffff] after:shadow after:transition-[translate] peer-checked:after:translate-x-5"
               />
             </label>
           )}

=== src/index.css — diff ===
@@ -7,6 +7,22 @@
   --font-display: "Outfit", sans-serif;
   --color-zinc-850: #1f1f23;
 
+  /*
+   * Cor de ação do app (verde, 2026-11-03): entre #21C063 e #01E93E, a pedido do responsável do produto.
+   * Fica na escala `teal-*` porque os componentes já usam essas classes; o 400 é o tom principal.
+   */
+  --color-teal-50: #ecfdf1;
+  --color-teal-100: #d1fadd;
+  --color-teal-200: #a5f3bd;
+  --color-teal-300: #5ee88c;
+  --color-teal-400: #11d450;
+  --color-teal-500: #0eb845;
+  --color-teal-600: #0b9a3a;
+  --color-teal-700: #087a2e;
+  --color-teal-800: #076127;
+  --color-teal-900: #064f21;
+  --color-teal-950: #022c12;
+
   --radius-arredondados: 2.5rem;
   --radius-arredondados-sm: 1.5rem;
 
@@ -184,8 +200,8 @@
 :root {
   --glass-bg: rgba(255, 255, 255, 0.05);
   --glass-border: rgba(255, 255, 255, 0.1);
-  --liquid-accent: #0d9488; /* Teal 600 */
-  --liquid-gradient: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
+  --liquid-accent: #0b9a3a;
+  --liquid-gradient: linear-gradient(135deg, #0b9a3a 0%, #11d450 100%);
 
   --ug-app: #0d0e10;
   --ug-ink: #ffffff;
@@ -197,9 +213,9 @@
   --ug-sheet-card-line: transparent;
   --ug-line: rgba(255, 255, 255, 0.08);
   --ug-scrim: rgba(0, 0, 0, 0.7);
-  --ug-accent: #5eead4;
-  --ug-accent-soft: rgba(20, 184, 166, 0.12);
-  --ug-accent-line: rgba(20, 184, 166, 0.35);
+  --ug-accent: #3ee47a;
+  --ug-accent-soft: rgba(17, 212, 80, 0.12);
+  --ug-accent-line: rgba(17, 212, 80, 0.35);
   --ug-warn: #fcd34d;
   --ug-warn-soft: rgba(245, 158, 11, 0.1);
   --ug-warn-line: rgba(245, 158, 11, 0.25);
@@ -227,9 +243,9 @@
   --ug-sheet-card: rgba(255, 255, 255, 0.04);
   --ug-sheet-card-line: transparent;
   --ug-line: rgba(255, 255, 255, 0.08);
-  --ug-accent: #5eead4;
-  --ug-accent-soft: rgba(20, 184, 166, 0.12);
-  --ug-accent-line: rgba(20, 184, 166, 0.35);
+  --ug-accent: #3ee47a;
+  --ug-accent-soft: rgba(17, 212, 80, 0.12);
+  --ug-accent-line: rgba(17, 212, 80, 0.35);
   --ug-warn: #fcd34d;
   --ug-warn-soft: rgba(245, 158, 11, 0.1);
   --ug-success: #6ee7b7;
@@ -252,9 +268,9 @@
   --ug-sheet-card-line: rgba(35, 29, 22, 0.12);
   --ug-line: rgba(35, 29, 22, 0.12);
   --ug-scrim: rgba(35, 29, 22, 0.35);
-  --ug-accent: #0f766e;
-  --ug-accent-soft: rgba(13, 148, 136, 0.12);
-  --ug-accent-line: rgba(13, 148, 136, 0.4);
+  --ug-accent: #087a2e;
+  --ug-accent-soft: rgba(17, 180, 70, 0.14);
+  --ug-accent-line: rgba(8, 122, 46, 0.4);
   --ug-warn: #92400e;
   --ug-warn-soft: rgba(217, 119, 6, 0.12);
   --ug-warn-line: rgba(217, 119, 6, 0.35);

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/domain/notifications/adapters/fcmPushSenderAdapter.test.ts server/domain/notifications/adapters/fcmPushSenderAdapter.ts src/domain/notifications/components/NotificationCenterSheet.tsx src/domain/payment/adapters/stripeConnectAdapter.ts src/domain/payment/adapters/ui/StripePaymentElement.tsx src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique o Hosting. Na conta Stripe, a cor dos e-mails e da página do Connect (Dashboard › Configurações › Marca) pode ser ajustada para #11D450 se quiser o mesmo verde fora do app.
