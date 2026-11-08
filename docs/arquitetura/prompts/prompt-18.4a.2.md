# Prompt 18.4a.2 — Conta Stripe Express por CNPJ (D14) · Parte 2 de 2 — frontend

> Lote 16, gerado do commit de referência `6946ecf` da branch `claude/agents-md-v2`. Aplique depois do A5 e do 18.4a.1. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4a.2 — Conta Stripe Express por CNPJ (D14) · Parte 2 de 2 — frontend

Primeira parte do 18.4 (docs/arquitetura/06-repasse-design.md).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8); as coleções antigas saem direto e os dados de teste podem ser recriados.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e as remoções. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova. Este prompt ainda NÃO muda o tipo de cobrança (continua destination charge, agora para a conta do CNPJ); a cobrança na plataforma com transferência depois do serviço vem no 18.4c.

DECISÃO D14 (docs/arquitetura/decisoes.md): cada CNPJ verificado recebe na própria conta Stripe Express; cada estabelecimento vende pela conta do seu CNPJ. Resolve o débito B22 (antes só o primeiro CNPJ da conta vendia).

Esta é a PARTE 2 de 2: só o frontend. A parte 1 (backend) já foi aplicada; as rotas /api/payment/connect/* não existem mais e o app usa /api/payment-accounts.

O QUE MUDA:
1) Frontend:
   - payment: listPaymentAccountsUseCase e createPaymentAccountSessionUseCase; o portal de recebimentos (PartnerStripeConnectPortal) mostra um cartão por CNPJ e abre o cadastro da conta escolhida; os componentes do Stripe Connect vão para o UI adapter adapters/ui/StripeConnectAccountEmbed.tsx (sai StripeConnectProvider), com as cores do tema claro/escuro e o idioma ativo; textos em src/shared/i18n/paymentAccountsResources.ts nos 3 idiomas;
   - ticketing: saem getPartnerMerchantStatus e createPartnerConnectAccount(Session); o aviso do painel de ingressos usa listPaymentAccountsUseCase;
   - PartnerBookingsComposition usa listPaymentAccountsUseCase (com os tokens do tema).

ARQUIVOS (crie, altere ou apague exatamente estes):
- src/app/compositions/PartnerBookingsComposition.tsx (alterar)
- src/domain/payment/adapters/stripeConnectAdapter.ts (alterar)
- src/domain/payment/adapters/ui/StripeConnectAccountEmbed.tsx (criar)
- src/domain/payment/api/apiPaymentAdapter.ts (alterar)
- src/domain/payment/application/usecases/createPartnerConnectAccountSessionUseCase.ts (apagar)
- src/domain/payment/application/usecases/createPartnerConnectAccountUseCase.ts (apagar)
- src/domain/payment/application/usecases/createPaymentAccountSessionUseCase.ts (criar)
- src/domain/payment/application/usecases/getPartnerConnectStatusUseCase.ts (apagar)
- src/domain/payment/application/usecases/listPaymentAccountsUseCase.ts (criar)
- src/domain/payment/components/PartnerStripeConnectPortal.test.tsx (criar)
- src/domain/payment/components/PartnerStripeConnectPortal.tsx (alterar)
- src/domain/payment/components/StripeConnectProvider.tsx (apagar)
- src/domain/payment/components/accounts/PaymentAccountCard.tsx (criar)
- src/domain/payment/components/accounts/PaymentAccountWorkspace.tsx (criar)
- src/domain/payment/components/accounts/paymentAccountStatus.ts (criar)
- src/domain/payment/index.ts (alterar)
- src/domain/payment/ports/paymentApiPort.ts (alterar)
- src/domain/payment/types/payment.ts (alterar)
- src/domain/ticketing/adapters/httpTicketingAdapter.ts (alterar)
- src/domain/ticketing/application/usecases/createPartnerConnectAccountSessionUseCase.ts (apagar)
- src/domain/ticketing/application/usecases/createPartnerConnectAccountUseCase.ts (apagar)
- src/domain/ticketing/application/usecases/getPartnerMerchantStatusUseCase.ts (apagar)
- src/domain/ticketing/hooks/usePartnerEventSales.ts (alterar)
- src/domain/ticketing/index.ts (alterar)
- src/domain/ticketing/ports/ticketingPort.ts (alterar)
- src/domain/ticketing/types/ticketing.ts (alterar)
- src/shared/i18n/paymentAccountsResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== src/app/compositions/PartnerBookingsComposition.tsx — diff ===
@@ -1,7 +1,7 @@
 import { useCallback, useEffect, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { type BookableGuideItem, PartnerOffersManager } from '../../domain/bookings';
-import { getPartnerConnectStatusUseCase, PartnerStripeConnectPortal } from '../../domain/payment';
+import { listPaymentAccountsUseCase, PartnerStripeConnectPortal } from '../../domain/payment';
 
 type AccountState = 'loading' | 'ready' | 'not_ready' | 'error';
 
@@ -13,9 +13,11 @@ export function PartnerBookingsComposition({ items }: { items: BookableGuideItem
   const loadStatus = useCallback(() => {
     let active = true;
     setAccount('loading');
-    getPartnerConnectStatusUseCase()
-      .then((status) => {
-        if (active) setAccount(status.readyForSales ? 'ready' : 'not_ready');
+    // A publicação confere a conta do CNPJ da oferta no backend (D14); aqui basta um CNPJ pronto (B26).
+    listPaymentAccountsUseCase()
+      .then((accounts) => {
+        const ready = accounts.some((entry) => entry.account?.readyForSales);
+        if (active) setAccount(ready ? 'ready' : 'not_ready');
       })
       .catch(() => {
         // Falha de rede não significa conta incompleta: não mostra o onboarding por engano.
@@ -34,20 +36,20 @@ export function PartnerBookingsComposition({ items }: { items: BookableGuideItem
       canPublish={account === 'ready'}
       accountNotice={
         account === 'not_ready' ? (
-          <div className="space-y-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
-            <p className="text-xs text-amber-200">{t('bookings.partner.stripeRequired')}</p>
+          <div className="space-y-3 p-3 rounded-xl bg-warn-soft border border-warn-line">
+            <p className="text-xs text-warn">{t('bookings.partner.stripeRequired')}</p>
             <PartnerStripeConnectPortal />
           </div>
         ) : account === 'error' ? (
           <div
             role="alert"
-            className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
+            className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-surface border border-line"
           >
-            <p className="text-xs text-white/80">{t('bookings.partner.accountStatusError')}</p>
+            <p className="text-xs text-ink">{t('bookings.partner.accountStatusError')}</p>
             <button
               type="button"
               onClick={loadStatus}
-              className="min-h-11 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white focus-visible:ring-2 focus-visible:ring-teal-400/50"
+              className="press min-h-11 px-4 rounded-xl border border-line text-xs font-bold text-ink hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-teal-400/50"
             >
               {t('bookings.partner.retry')}
             </button>

=== src/domain/payment/adapters/stripeConnectAdapter.ts — diff ===
@@ -1,21 +1,39 @@
 import { loadConnectAndInitialize } from '@stripe/connect-js';
 
-export function createStripeConnectInstance(
-  publishableKey: string,
-  fetchClientSecret: () => Promise<string>
-) {
+export type ConnectTheme = 'light' | 'dark';
+
+// Cores do tema do app (src/index.css): o componente do Stripe não lê as variáveis CSS da página.
+const APPEARANCE: Record<ConnectTheme, Record<string, string>> = {
+  dark: {
+    colorPrimary: '#2dd4bf',
+    colorBackground: '#0b1120',
+    colorText: '#f8fafc',
+    colorSecondaryText: '#94a3b8',
+  },
+  light: {
+    colorPrimary: '#0f766e',
+    colorBackground: '#faf6ee',
+    colorText: '#231d16',
+    colorSecondaryText: '#6b5f50',
+  },
+};
+
+// Idiomas do Connect: https://docs.stripe.com/connect/supported-embedded-components/localization
+const CONNECT_LOCALES: Record<string, string> = { 'pt-BR': 'pt-BR', en: 'en-US', fr: 'fr-FR' };
+
+export function createStripeConnectInstance(options: {
+  publishableKey: string;
+  fetchClientSecret: () => Promise<string>;
+  theme: ConnectTheme;
+  locale: string;
+}) {
   return loadConnectAndInitialize({
-    publishableKey,
-    fetchClientSecret,
+    publishableKey: options.publishableKey,
+    fetchClientSecret: options.fetchClientSecret,
+    locale: CONNECT_LOCALES[options.locale] ?? 'pt-BR',
     appearance: {
       overlays: 'dialog',
-      variables: {
-        colorPrimary: '#2dd4bf',
-        colorBackground: '#0b1120',
-        colorText: '#f8fafc',
-        colorSecondaryText: '#94a3b8',
-        borderRadius: '12px',
-      },
+      variables: { ...APPEARANCE[options.theme], borderRadius: '12px' },
     },
   });
 }

=== src/domain/payment/adapters/ui/StripeConnectAccountEmbed.tsx — ARQUIVO NOVO, conteúdo completo ===
import {
  ConnectAccountManagement,
  ConnectAccountOnboarding,
  ConnectBalances,
  ConnectComponentsProvider,
  ConnectPayments,
  ConnectPayouts,
} from '@stripe/react-connect-js';
import { useMemo } from 'react';
import { type ConnectTheme, createStripeConnectInstance } from '../stripeConnectAdapter';

export type ConnectSection = 'onboarding' | 'balances' | 'payouts' | 'payments' | 'account';

/** UI adapter (AGENTS.md §3.3): componentes embutidos do Stripe Connect de uma conta, com props neutras. */
export function StripeConnectAccountEmbed(props: {
  publishableKey: string;
  /** Muda quando a conta muda: a instância do Connect é de uma conta só. */
  accountKey: string;
  fetchClientSecret: () => Promise<string>;
  section: ConnectSection;
  theme: ConnectTheme;
  locale: string;
  onOnboardingExit: () => void;
}) {
  const { publishableKey, accountKey, fetchClientSecret, theme, locale } = props;
  // biome-ignore lint/correctness/useExhaustiveDependencies: accountKey troca a conta da sessão; fetchClientSecret muda a cada render.
  const instance = useMemo(
    () => createStripeConnectInstance({ publishableKey, fetchClientSecret, theme, locale }),
    [publishableKey, accountKey, theme, locale]
  );
  return (
    <ConnectComponentsProvider connectInstance={instance}>
      {props.section === 'onboarding' && (
        <ConnectAccountOnboarding onExit={props.onOnboardingExit} />
      )}
      {props.section === 'balances' && <ConnectBalances />}
      {props.section === 'payouts' && <ConnectPayouts />}
      {props.section === 'payments' && <ConnectPayments />}
      {props.section === 'account' && <ConnectAccountManagement />}
    </ConnectComponentsProvider>
  );
}

=== src/domain/payment/api/apiPaymentAdapter.ts — diff ===
@@ -4,7 +4,7 @@ import type {
   CreatePaymentIntentResponse,
   CreatePlanPaymentIntentPayload,
   PaidPlanId,
-  PartnerConnectStatusResponse,
+  PartnerPaymentAccount,
   PaymentLocale,
   PlanSubscription,
   StartPlanSubscriptionPayload,
@@ -72,57 +72,34 @@ export class ApiPaymentAdapter implements PaymentApiPort {
     return data;
   }
 
-  async getPartnerConnectStatus(): Promise<PartnerConnectStatusResponse> {
+  async listPaymentAccounts(): Promise<PartnerPaymentAccount[]> {
     const response = await firebaseApiFetch(
-      '/api/payment/connect/status',
+      '/api/payment-accounts',
       { method: 'GET' },
       { requireAuth: true, requireAppCheck: true }
     );
     const data = await response.json().catch(() => ({}));
     if (!response.ok) {
-      throw new Error(
-        data.error?.message ?? data.error ?? 'Não foi possível carregar o status financeiro.'
-      );
-    }
-    return data;
-  }
-
-  async createPartnerConnectAccount(): Promise<PartnerConnectStatusResponse> {
-    const response = await firebaseApiFetch(
-      '/api/payment/connect/account',
-      {
-        method: 'POST',
-        headers: { 'Content-Type': 'application/json' },
-        body: JSON.stringify({}),
-      },
-      { requireAuth: true, requireAppCheck: true }
-    );
-    const data = await response.json().catch(() => ({}));
-    if (!response.ok) {
-      throw new Error(
-        data.error?.message ?? data.error ?? 'Não foi possível criar a conta conectada.'
-      );
+      throw new Error(data.error?.code ?? 'PAYMENT_ACCOUNT_UNAVAILABLE');
     }
-    return data;
+    return Array.isArray(data.data) ? data.data : [];
   }
 
-  async createPartnerConnectAccountSession(): Promise<{ clientSecret: string }> {
+  async createPaymentAccountSession(accountKey: string): Promise<{ clientSecret: string }> {
     const response = await firebaseApiFetch(
-      '/api/payment/connect/account-session',
+      '/api/payment-accounts/session',
       {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
-        body: JSON.stringify({}),
+        body: JSON.stringify({ accountKey }),
       },
       { requireAuth: true, requireAppCheck: true }
     );
     const data = await response.json().catch(() => ({}));
-    if (!response.ok || !data.clientSecret) {
-      throw new Error(
-        data.error?.message ?? data.error ?? 'Não foi possível iniciar a sessão financeira.'
-      );
+    if (!response.ok || !data.data?.clientSecret) {
+      throw new Error(data.error?.code ?? 'PAYMENT_ACCOUNT_UNAVAILABLE');
     }
-    return { clientSecret: data.clientSecret };
+    return { clientSecret: data.data.clientSecret };
   }
 
   async startPlanSubscription(

=== src/domain/payment/application/usecases/createPartnerConnectAccountSessionUseCase.ts — APAGUE este arquivo ===

=== src/domain/payment/application/usecases/createPartnerConnectAccountUseCase.ts — APAGUE este arquivo ===

=== src/domain/payment/application/usecases/createPaymentAccountSessionUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { paymentApiAdapter } from '../../factory';

export function createPaymentAccountSessionUseCase(
  accountKey: string
): Promise<{ clientSecret: string }> {
  return paymentApiAdapter.createPaymentAccountSession(accountKey);
}

=== src/domain/payment/application/usecases/getPartnerConnectStatusUseCase.ts — APAGUE este arquivo ===

=== src/domain/payment/application/usecases/listPaymentAccountsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { paymentApiAdapter } from '../../factory';
import type { PartnerPaymentAccount } from '../../types/payment';

export function listPaymentAccountsUseCase(): Promise<PartnerPaymentAccount[]> {
  return paymentApiAdapter.listPaymentAccounts();
}

=== src/domain/payment/components/PartnerStripeConnectPortal.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';

const m = vi.hoisted(() => ({ list: vi.fn(), embed: vi.fn() }));
vi.mock('../application/usecases/listPaymentAccountsUseCase', () => ({
  listPaymentAccountsUseCase: m.list,
}));
vi.mock('../application/usecases/createPaymentAccountSessionUseCase', () => ({
  createPaymentAccountSessionUseCase: vi.fn(),
}));
vi.mock('../adapters/ui/StripeConnectAccountEmbed', () => ({
  StripeConnectAccountEmbed: (props: { accountKey: string; section: string }) => {
    m.embed(props);
    return <div data-testid="connect-embed">{`${props.accountKey}:${props.section}`}</div>;
  },
}));
vi.mock('../../../shared/context/ThemeContext', () => ({
  useTheme: () => ({ resolvedTheme: 'dark' }),
}));

import { PartnerStripeConnectPortal } from './PartnerStripeConnectPortal';

const READY = {
  accountKey: 'key-1',
  maskedDocument: '**.***.***/0001-81',
  itemIds: ['item-1', 'item-3'],
  account: {
    status: 'enabled' as const,
    chargesEnabled: true,
    payoutsEnabled: true,
    detailsSubmitted: true,
    requirementsDueCount: 0,
    readyForSales: true,
  },
};
const NOT_STARTED = {
  accountKey: 'key-2',
  maskedDocument: '**.***.***/0001-61',
  itemIds: ['item-2'],
  account: null,
};

describe('PartnerStripeConnectPortal (D14)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_x');
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra um cartão por CNPJ com o status de cada conta', async () => {
    m.list.mockResolvedValue([READY, NOT_STARTED]);
    render(<PartnerStripeConnectPortal />);
    expect(await screen.findByText('**.***.***/0001-81')).toBeTruthy();
    expect(screen.getByText('2 cadastros vendem por este CNPJ')).toBeTruthy();
    expect(screen.getByText('Pronta para receber')).toBeTruthy();
    expect(screen.getByText('Cadastro não iniciado')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Configurar recebimentos/ })).toBeTruthy();
  });

  it('abre o cadastro da conta escolhida, sem misturar CNPJs', async () => {
    m.list.mockResolvedValue([READY, NOT_STARTED]);
    render(<PartnerStripeConnectPortal />);
    fireEvent.click(await screen.findByRole('button', { name: /Configurar recebimentos/ }));
    expect(screen.getByTestId('connect-embed').textContent).toBe('key-2:onboarding');
    // Conta sem cadastro só mostra o cadastro: saldos e repasses ainda não existem.
    expect(screen.queryByRole('button', { name: 'Saldos' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Voltar para as contas/ }));
    fireEvent.click(screen.getByRole('button', { name: /Gerenciar/ }));
    expect(screen.getByTestId('connect-embed').textContent).toBe('key-1:balances');
  });

  it('sem CNPJ verificado: explica o que fazer', async () => {
    m.list.mockResolvedValue([]);
    render(<PartnerStripeConnectPortal />);
    expect(await screen.findByText(/Nenhum CNPJ verificado ainda/)).toBeTruthy();
  });

  it('erro da API: mensagem traduzida pelo código e botão de tentar de novo', async () => {
    m.list.mockRejectedValueOnce(new Error('PAYMENT_ACCOUNT_UNAVAILABLE'));
    m.list.mockResolvedValueOnce([READY]);
    render(<PartnerStripeConnectPortal />);
    expect(await screen.findByText(/Não foi possível falar com o Stripe/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    await waitFor(() => expect(screen.getByText('Pronta para receber')).toBeTruthy());
  });
});

=== src/domain/payment/components/PartnerStripeConnectPortal.tsx — diff ===
@@ -1,299 +1,96 @@
-import React, { useCallback, useEffect, useMemo, useState } from 'react';
-import {
-  ConnectAccountManagement,
-  ConnectAccountOnboarding,
-  ConnectBalances,
-  ConnectPayments,
-  ConnectPayouts,
-} from '@stripe/react-connect-js';
-import {
-  AlertTriangle,
-  Building2,
-  CheckCircle2,
-  CreditCard,
-  Loader2,
-  RefreshCw,
-  ShieldCheck,
-  Wallet,
-} from 'lucide-react';
+import { Loader2, RefreshCw } from 'lucide-react';
+import { useCallback, useEffect, useState } from 'react';
+import { useTranslation } from 'react-i18next';
 import { GlassCard } from '../../../ui/components/GlassCard';
-import { createStripeConnectInstance } from '../adapters/stripeConnectAdapter';
-import { createPartnerConnectAccountSessionUseCase } from '../application/usecases/createPartnerConnectAccountSessionUseCase';
-import { createPartnerConnectAccountUseCase } from '../application/usecases/createPartnerConnectAccountUseCase';
-import { getPartnerConnectStatusUseCase } from '../application/usecases/getPartnerConnectStatusUseCase';
-import type { PartnerConnectStatusResponse } from '../types/payment';
-import { StripeConnectProvider } from './StripeConnectProvider';
-
-type FinanceSubTab = 'onboarding' | 'balances' | 'payouts' | 'payments' | 'account';
+import { listPaymentAccountsUseCase } from '../application/usecases/listPaymentAccountsUseCase';
+import type { PartnerPaymentAccount } from '../types/payment';
+import { PaymentAccountCard } from './accounts/PaymentAccountCard';
+import { PaymentAccountWorkspace } from './accounts/PaymentAccountWorkspace';
+import { accountErrorKey } from './accounts/paymentAccountStatus';
 
+/** Recebimentos do parceiro: uma conta Stripe por CNPJ verificado (D14). */
 export function PartnerStripeConnectPortal() {
-  const [status, setStatus] = useState<PartnerConnectStatusResponse | null>(null);
-  const [loading, setLoading] = useState(true);
-  const [creating, setCreating] = useState(false);
+  const { t } = useTranslation();
+  const [accounts, setAccounts] = useState<PartnerPaymentAccount[] | null>(null);
   const [error, setError] = useState<string | null>(null);
-  const [activeSubTab, setActiveSubTab] = useState<FinanceSubTab>('onboarding');
-
-  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
+  const [loading, setLoading] = useState(true);
+  const [openKey, setOpenKey] = useState<string | null>(null);
 
-  const loadStatus = useCallback(async () => {
+  const load = useCallback(async () => {
     setLoading(true);
     setError(null);
     try {
-      const res = await getPartnerConnectStatusUseCase();
-      setStatus(res);
-      if (res.chargesEnabled && res.payoutsEnabled && res.detailsSubmitted) {
-        setActiveSubTab((prev) => (prev === 'onboarding' ? 'balances' : prev));
-      }
-    } catch (err: unknown) {
-      setError(
-        err instanceof Error
-          ? err.message
-          : 'Não foi possível carregar o status financeiro.'
-      );
+      setAccounts(await listPaymentAccountsUseCase());
+    } catch (err) {
+      setError(accountErrorKey(err));
     } finally {
       setLoading(false);
     }
   }, []);
 
   useEffect(() => {
-    loadStatus();
-  }, [loadStatus]);
-
-  const handleStartConnect = async () => {
-    setCreating(true);
-    setError(null);
-    try {
-      const created = await createPartnerConnectAccountUseCase();
-      setStatus(created);
-      setActiveSubTab('onboarding');
-    } catch (err: unknown) {
-      setError(
-        err instanceof Error
-          ? err.message
-          : 'Não foi possível iniciar o cadastro financeiro.'
-      );
-    } finally {
-      setCreating(false);
-    }
-  };
+    void load();
+  }, [load]);
 
-  const connectInstance = useMemo(() => {
-    if (!publishableKey || !status?.connected) {
-      return null;
-    }
-    return createStripeConnectInstance(publishableKey, async () => {
-      const { clientSecret } = await createPartnerConnectAccountSessionUseCase();
-      return clientSecret;
-    });
-  }, [publishableKey, status?.connected]);
-
-  const isFullyReady = Boolean(
-    status?.connected &&
-      status.chargesEnabled &&
-      status.payoutsEnabled &&
-      status.detailsSubmitted
-  );
-
-  if (loading) {
-    return (
-      <GlassCard className="p-6 flex items-center justify-center gap-3 text-white/70">
-        <Loader2 size={18} className="animate-spin text-teal-400" />
-        <span className="text-xs font-semibold">Carregando conta financeira...</span>
-      </GlassCard>
-    );
-  }
+  const open = accounts?.find((entry) => entry.accountKey === openKey) ?? null;
 
   return (
-    <div className="space-y-4">
-      <GlassCard className="p-5 space-y-4 border border-white/10">
-        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
-          <div className="flex items-start gap-3">
-            <div
-              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
-                isFullyReady
-                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
-                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
-              }`}
-            >
-              {isFullyReady ? <CheckCircle2 size={20} /> : <Building2 size={20} />}
-            </div>
-            <div>
-              <div className="flex items-center gap-2 flex-wrap">
-                <h4 className="text-sm font-bold text-white">
-                  {isFullyReady
-                    ? 'Conta conectada'
-                    : 'Complete a configuração da sua conta para receber pagamentos.'}
-                </h4>
-                <span
-                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
-                    isFullyReady
-                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
-                      : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
-                  }`}
-                >
-                  {isFullyReady
-                    ? 'Habilitada para vendas e repasses'
-                    : status?.connected
-                      ? 'Configuração pendente'
-                      : 'Não conectada'}
-                </span>
-              </div>
-              <p className="text-xs text-white/60 mt-1">
-                {isFullyReady
-                  ? 'Seus recebimentos de ingressos pagos (Cartão e Pix) são transferidos automaticamente com comissão da plataforma já descontada.'
-                  : 'Eventos pagos exigem conta verificada com recebimentos e repasses habilitados.'}
-              </p>
-            </div>
-          </div>
-
-          <div className="flex items-center gap-2">
-            <button
-              type="button"
-              onClick={loadStatus}
-              aria-label="Atualizar status financeiro"
-              className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer"
-            >
-              <RefreshCw size={16} />
-            </button>
-            {!status?.connected && (
-              <button
-                type="button"
-                disabled={creating}
-                onClick={handleStartConnect}
-                className="min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
-              >
-                {creating ? (
-                  <Loader2 size={15} className="animate-spin" />
-                ) : (
-                  <ShieldCheck size={15} />
-                )}
-                <span>Configurar Recebimentos</span>
-              </button>
-            )}
-          </div>
+    <GlassCard className="p-5 space-y-4">
+      <div className="flex items-start justify-between gap-3">
+        <div className="space-y-1">
+          <h4 className="text-sm font-bold text-ink">{t('paymentAccounts.title')}</h4>
+          <p className="text-xs text-ink/70">{t('paymentAccounts.subtitle')}</p>
         </div>
+        <button
+          type="button"
+          onClick={() => void load()}
+          aria-label={t('paymentAccounts.refresh')}
+          className="press w-11 h-11 shrink-0 rounded-xl border border-line text-ink flex items-center justify-center hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-teal-400/50"
+        >
+          <RefreshCw size={16} aria-hidden="true" />
+        </button>
+      </div>
 
-        {error && (
-          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200 flex items-center gap-2">
-            <AlertTriangle size={15} className="shrink-0 text-red-400" />
-            <span>{error}</span>
-          </div>
-        )}
-
-        {status?.connected && (
-          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-xs">
-            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
-              <span className="text-white/60">Pagamentos (Charges)</span>
-              <span
-                className={`font-bold ${
-                  status.chargesEnabled ? 'text-emerald-300' : 'text-amber-300'
-                }`}
-              >
-                {status.chargesEnabled ? 'Ativo' : 'Pendente'}
-              </span>
-            </div>
-            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
-              <span className="text-white/60">Repasses (Payouts)</span>
-              <span
-                className={`font-bold ${
-                  status.payoutsEnabled ? 'text-emerald-300' : 'text-amber-300'
-                }`}
-              >
-                {status.payoutsEnabled ? 'Ativo' : 'Pendente'}
-              </span>
-            </div>
-            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
-              <span className="text-white/60">Dados cadastrais</span>
-              <span
-                className={`font-bold ${
-                  status.detailsSubmitted ? 'text-emerald-300' : 'text-amber-300'
-                }`}
-              >
-                {status.detailsSubmitted ? 'Enviados' : 'Incompletos'}
-              </span>
-            </div>
-          </div>
-        )}
-      </GlassCard>
-
-      {status?.connected && connectInstance && (
-        <GlassCard className="p-5 space-y-4 border border-white/10">
-          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
-            <button
-              type="button"
-              onClick={() => setActiveSubTab('onboarding')}
-              className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
-                activeSubTab === 'onboarding'
-                  ? 'bg-teal-400 text-slate-950'
-                  : 'bg-white/5 text-white/70 hover:bg-white/10'
-              }`}
-            >
-              <ShieldCheck size={14} />
-              <span>Onboarding / Cadastro</span>
-            </button>
-            <button
-              type="button"
-              onClick={() => setActiveSubTab('balances')}
-              className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
-                activeSubTab === 'balances'
-                  ? 'bg-teal-400 text-slate-950'
-                  : 'bg-white/5 text-white/70 hover:bg-white/10'
-              }`}
-            >
-              <Wallet size={14} />
-              <span>Saldos</span>
-            </button>
-            <button
-              type="button"
-              onClick={() => setActiveSubTab('payouts')}
-              className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
-                activeSubTab === 'payouts'
-                  ? 'bg-teal-400 text-slate-950'
-                  : 'bg-white/5 text-white/70 hover:bg-white/10'
-              }`}
-            >
-              <Building2 size={14} />
-              <span>Repasses (Payouts)</span>
-            </button>
-            <button
-              type="button"
-              onClick={() => setActiveSubTab('payments')}
-              className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
-                activeSubTab === 'payments'
-                  ? 'bg-teal-400 text-slate-950'
-                  : 'bg-white/5 text-white/70 hover:bg-white/10'
-              }`}
-            >
-              <CreditCard size={14} />
-              <span>Recebimentos</span>
-            </button>
-            <button
-              type="button"
-              onClick={() => setActiveSubTab('account')}
-              className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
-                activeSubTab === 'account'
-                  ? 'bg-teal-400 text-slate-950'
-                  : 'bg-white/5 text-white/70 hover:bg-white/10'
-              }`}
-            >
-              <CheckCircle2 size={14} />
-              <span>Dados da Conta</span>
-            </button>
-          </div>
-
-          <StripeConnectProvider connectInstance={connectInstance}>
-            <div className="min-h-[320px] rounded-2xl bg-slate-950/60 p-4 border border-white/10">
-              {activeSubTab === 'onboarding' && (
-                <ConnectAccountOnboarding onExit={loadStatus} />
-              )}
-              {activeSubTab === 'balances' && <ConnectBalances />}
-              {activeSubTab === 'payouts' && <ConnectPayouts />}
-              {activeSubTab === 'payments' && <ConnectPayments />}
-              {activeSubTab === 'account' && <ConnectAccountManagement />}
-            </div>
-          </StripeConnectProvider>
-        </GlassCard>
+      {loading && !accounts ? (
+        <p className="flex items-center gap-2 text-xs text-ink/70" role="status">
+          <Loader2 size={16} className="animate-spin text-accent" aria-hidden="true" />
+          {t('paymentAccounts.loading')}
+        </p>
+      ) : error ? (
+        <div
+          role="alert"
+          className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-danger-soft border border-danger-line"
+        >
+          <p className="text-xs text-danger">{t(error)}</p>
+          <button
+            type="button"
+            onClick={() => void load()}
+            className="press min-h-11 px-4 rounded-xl border border-line text-xs font-bold text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
+          >
+            {t('paymentAccounts.retry')}
+          </button>
+        </div>
+      ) : open ? (
+        <PaymentAccountWorkspace
+          entry={open}
+          onBack={() => setOpenKey(null)}
+          onOnboardingExit={() => void load()}
+        />
+      ) : accounts && accounts.length > 0 ? (
+        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
+          {accounts.map((entry) => (
+            <PaymentAccountCard
+              key={entry.accountKey}
+              entry={entry}
+              onOpen={(selected) => setOpenKey(selected.accountKey)}
+            />
+          ))}
+        </div>
+      ) : (
+        <p className="py-8 text-center text-xs text-ink/70 border-2 border-dashed border-line rounded-2xl">
+          {t('paymentAccounts.empty')}
+        </p>
       )}
-    </div>
+    </GlassCard>
   );
 }

=== src/domain/payment/components/StripeConnectProvider.tsx — APAGUE este arquivo ===

=== src/domain/payment/components/accounts/PaymentAccountCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Building2, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PartnerPaymentAccount } from '../../types/payment';
import { accountStatusKey, accountStatusTone } from './paymentAccountStatus';

export function PaymentAccountCard({
  entry,
  onOpen,
}: {
  entry: PartnerPaymentAccount;
  onOpen: (entry: PartnerPaymentAccount) => void;
}) {
  const { t } = useTranslation();
  const status = accountStatusKey(entry);
  const dueCount = entry.account?.requirementsDueCount ?? 0;
  const action =
    status === 'notStarted' ? 'start' : status === 'ready' ? 'manage' : 'continue';

  return (
    <article className="p-4 rounded-2xl bg-surface border border-line space-y-3">
      <div className="flex items-start gap-3">
        <span className="w-11 h-11 shrink-0 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
          <Building2 size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-bold text-ink font-mono break-all">{entry.maskedDocument}</p>
          <p className="text-xs text-ink/70">
            {t('paymentAccounts.listings', { count: entry.itemIds.length })}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${accountStatusTone(status)}`}
        >
          {t(`paymentAccounts.status.${status}`)}
        </span>
        {dueCount > 0 && status !== 'ready' && (
          <span className="text-[11px] text-ink/70">
            {t('paymentAccounts.requirements', { count: dueCount })}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onOpen(entry)}
        className="press w-full min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        {t(`paymentAccounts.actions.${action}`)}
        <ChevronRight size={15} aria-hidden="true" />
      </button>
    </article>
  );
}

=== src/domain/payment/components/accounts/PaymentAccountWorkspace.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../shared/context/ThemeContext';
import {
  type ConnectSection,
  StripeConnectAccountEmbed,
} from '../../adapters/ui/StripeConnectAccountEmbed';
import { createPaymentAccountSessionUseCase } from '../../application/usecases/createPaymentAccountSessionUseCase';
import type { PartnerPaymentAccount } from '../../types/payment';

const SECTIONS: ConnectSection[] = ['onboarding', 'balances', 'payouts', 'payments', 'account'];

/** Cadastro e gestão no Stripe de uma conta (um CNPJ), com os componentes embutidos do Connect. */
export function PaymentAccountWorkspace({
  entry,
  onBack,
  onOnboardingExit,
}: {
  entry: PartnerPaymentAccount;
  onBack: () => void;
  onOnboardingExit: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { resolvedTheme } = useTheme();
  const ready = entry.account?.readyForSales === true;
  const [section, setSection] = useState<ConnectSection>(ready ? 'balances' : 'onboarding');
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  // Antes de a conta ficar pronta, só o cadastro faz sentido: saldos e repasses ainda não existem.
  const sections = ready ? SECTIONS : (['onboarding'] as ConnectSection[]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="press min-h-11 px-3 rounded-xl border border-line text-xs font-bold text-ink flex items-center gap-2 hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {t('paymentAccounts.actions.back')}
        </button>
        <p className="text-sm font-bold text-ink font-mono break-all">{entry.maskedDocument}</p>
      </div>

      {sections.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('paymentAccounts.tabs.label')}>
          {sections.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={section === key}
              onClick={() => setSection(key)}
              className={`press min-h-11 px-3.5 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
                section === key
                  ? 'bg-teal-400 text-slate-950'
                  : 'bg-surface border border-line text-ink hover:bg-accent-soft'
              }`}
            >
              {t(`paymentAccounts.tabs.${key}`)}
            </button>
          ))}
        </div>
      )}

      {publishableKey ? (
        <div className="min-h-[320px] rounded-2xl bg-surface p-4 border border-line">
          <StripeConnectAccountEmbed
            publishableKey={publishableKey}
            accountKey={entry.accountKey}
            fetchClientSecret={async () =>
              (await createPaymentAccountSessionUseCase(entry.accountKey)).clientSecret
            }
            section={section}
            theme={resolvedTheme}
            locale={i18n.language}
            onOnboardingExit={onOnboardingExit}
          />
        </div>
      ) : (
        <p role="alert" className="p-3 rounded-xl bg-warn-soft border border-warn-line text-xs text-warn">
          {t('paymentAccounts.missingKey')}
        </p>
      )}
    </div>
  );
}

=== src/domain/payment/components/accounts/paymentAccountStatus.ts — ARQUIVO NOVO, conteúdo completo ===
import type { PartnerPaymentAccount } from '../../types/payment';

export type AccountStatusKey = 'ready' | 'pending' | 'restricted' | 'disabled' | 'notStarted';

const TONE: Record<AccountStatusKey, string> = {
  ready: 'bg-success-soft text-success border-success-line',
  pending: 'bg-warn-soft text-warn border-warn-line',
  restricted: 'bg-info-soft text-info border-info-line',
  disabled: 'bg-danger-soft text-danger border-danger-line',
  notStarted: 'bg-surface text-ink/70 border-line',
};

export function accountStatusKey(entry: PartnerPaymentAccount): AccountStatusKey {
  if (!entry.account) return 'notStarted';
  if (entry.account.readyForSales) return 'ready';
  if (entry.account.status === 'disabled') return 'disabled';
  if (entry.account.status === 'restricted') return 'restricted';
  return 'pending';
}

export function accountStatusTone(key: AccountStatusKey): string {
  return TONE[key];
}

/** Erros da API chegam pelo `code` (AGENTS.md §12.5); o texto vem das traduções. */
export function accountErrorKey(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  const known = ['NOT_FOUND', 'FORBIDDEN', 'VALIDATION_ERROR'];
  return `paymentAccounts.errors.${known.includes(code) ? code : 'PAYMENT_ACCOUNT_UNAVAILABLE'}`;
}

=== src/domain/payment/index.ts — diff ===
@@ -1,19 +1,16 @@
 export { CheckoutModal } from './components/CheckoutModal';
 export { PlanSubscriptionCard } from './components/PlanSubscriptionCard';
 export { StripePaymentElement } from './adapters/ui/StripePaymentElement';
-export { StripeConnectProvider } from './components/StripeConnectProvider';
 export { PartnerStripeConnectPortal } from './components/PartnerStripeConnectPortal';
 export { confirmPlanPaymentReturnUseCase } from './application/usecases/confirmPlanPaymentReturnUseCase';
-export { createPartnerConnectAccountSessionUseCase } from './application/usecases/createPartnerConnectAccountSessionUseCase';
-export { createPartnerConnectAccountUseCase } from './application/usecases/createPartnerConnectAccountUseCase';
 export { createPlanPaymentIntentUseCase } from './application/usecases/createPlanPaymentIntentUseCase';
-export { getPartnerConnectStatusUseCase } from './application/usecases/getPartnerConnectStatusUseCase';
+export { listPaymentAccountsUseCase } from './application/usecases/listPaymentAccountsUseCase';
 export { isPaidPlanId } from './utils/planIds';
 export type {
   CreatePaymentIntentResponse,
   CreatePlanPaymentIntentPayload,
   PaidPlanId,
-  PartnerConnectStatusResponse,
+  PartnerPaymentAccount,
   PaymentStatus,
   PlanPeriodOption,
 } from './types/payment';

=== src/domain/payment/ports/paymentApiPort.ts — diff ===
@@ -2,7 +2,7 @@ import type {
   CreatePaymentIntentResponse,
   PaidPlanId,
   CreatePlanPaymentIntentPayload,
-  PartnerConnectStatusResponse,
+  PartnerPaymentAccount,
   PaymentLocale,
   PlanSubscription,
   StartPlanSubscriptionPayload,
@@ -14,9 +14,8 @@ export interface PaymentApiPort {
     payload: CreatePlanPaymentIntentPayload
   ): Promise<CreatePaymentIntentResponse>;
   confirmPlanPaymentReturn(params: { paymentIntentId: string }): Promise<{ status: string }>;
-  getPartnerConnectStatus(): Promise<PartnerConnectStatusResponse>;
-  createPartnerConnectAccount(): Promise<PartnerConnectStatusResponse>;
-  createPartnerConnectAccountSession(): Promise<{ clientSecret: string }>;
+  listPaymentAccounts(): Promise<PartnerPaymentAccount[]>;
+  createPaymentAccountSession(accountKey: string): Promise<{ clientSecret: string }>;
   startPlanSubscription(
     payload: StartPlanSubscriptionPayload
   ): Promise<StartPlanSubscriptionResponse>;

=== src/domain/payment/types/payment.ts — diff ===
@@ -25,17 +25,20 @@ export interface CreatePaymentIntentResponse {
   orderStatus?: string;
 }
 
-export interface PartnerConnectStatusResponse {
-  connected: boolean;
-  accountId?: string;
-  chargesEnabled: boolean;
-  payoutsEnabled: boolean;
-  detailsSubmitted: boolean;
-  requirementsCurrentlyDue?: string[];
-  requirementsPastDue?: string[];
-  status: 'pending' | 'restricted' | 'enabled' | 'disabled';
-  /** Calculado no servidor: mesmo critério usado para vender. */
-  readyForSales: boolean;
+/** Conta Stripe de um CNPJ verificado (D14); `account` é `null` antes de o parceiro iniciar o cadastro. */
+export interface PartnerPaymentAccount {
+  accountKey: string;
+  maskedDocument: string;
+  itemIds: string[];
+  account: {
+    status: 'pending' | 'restricted' | 'enabled' | 'disabled';
+    chargesEnabled: boolean;
+    payoutsEnabled: boolean;
+    detailsSubmitted: boolean;
+    requirementsDueCount: number;
+    /** Calculado no servidor: mesmo critério usado para vender. */
+    readyForSales: boolean;
+  } | null;
 }
 
 export type PaymentLocale = 'pt-BR' | 'en' | 'fr';

=== src/domain/ticketing/adapters/httpTicketingAdapter.ts — diff ===
@@ -9,7 +9,6 @@ import type {
   EventSalesAnalytics,
   OfflineCheckInSessionResponse,
   OfflineCheckInSyncResult,
-  PartnerMerchantStatus,
   PublicTicketTypeProjection,
   Refund,
   Ticket,
@@ -79,9 +78,7 @@ export class HttpTicketingAdapter implements TicketingPort {
     return parseJsonOrThrow<TicketType>(res, 'Não foi possível atualizar o lote de ingresso.');
   }
 
-  async deleteOrArchiveTicketType(
-    ticketTypeId: string
-  ): Promise<{ mode: 'deleted' | 'archived' }> {
+  async deleteOrArchiveTicketType(ticketTypeId: string): Promise<{ mode: 'deleted' | 'archived' }> {
     const res = await firebaseApiFetch(
       `/api/ticketing/ticket-types/${encodeURIComponent(ticketTypeId)}`,
       { method: 'DELETE' },
@@ -358,9 +355,7 @@ export class HttpTicketingAdapter implements TicketingPort {
     const base = asAdmin
       ? `/api/admin/events/${encodeURIComponent(eventListingId)}/analytics`
       : `/api/partners/events/${encodeURIComponent(eventListingId)}/analytics`;
-    const url = occurrenceId
-      ? `${base}?occurrenceId=${encodeURIComponent(occurrenceId)}`
-      : base;
+    const url = occurrenceId ? `${base}?occurrenceId=${encodeURIComponent(occurrenceId)}` : base;
     const res = await firebaseApiFetch(url, { method: 'GET' }, { requireAuth: true });
     return parseJsonOrThrow<EventSalesAnalytics>(
       res,
@@ -394,48 +389,4 @@ export class HttpTicketingAdapter implements TicketingPort {
     const res = await firebaseApiFetch(url, { method: 'GET' }, { requireAuth: true });
     return parseJsonOrThrow<Refund[]>(res, 'Não foi possível carregar os reembolsos do evento.');
   }
-
-  async getPartnerMerchantStatus(): Promise<PartnerMerchantStatus> {
-    const res = await firebaseApiFetch(
-      '/api/payment/connect/status',
-      { method: 'GET' },
-      { requireAuth: true }
-    );
-    return parseJsonOrThrow<PartnerMerchantStatus>(
-      res,
-      'Não foi possível verificar o status da conta Stripe Connect.'
-    );
-  }
-
-  async createPartnerConnectAccount(): Promise<PartnerMerchantStatus> {
-    const res = await firebaseApiFetch(
-      '/api/payment/connect/account',
-      {
-        method: 'POST',
-        headers: { 'Content-Type': 'application/json' },
-        body: JSON.stringify({}),
-      },
-      { requireAuth: true }
-    );
-    return parseJsonOrThrow<PartnerMerchantStatus>(
-      res,
-      'Não foi possível criar a conta Stripe Connect.'
-    );
-  }
-
-  async createPartnerConnectAccountSession(): Promise<{ clientSecret: string }> {
-    const res = await firebaseApiFetch(
-      '/api/payment/connect/account-session',
-      {
-        method: 'POST',
-        headers: { 'Content-Type': 'application/json' },
-        body: JSON.stringify({}),
-      },
-      { requireAuth: true }
-    );
-    return parseJsonOrThrow<{ clientSecret: string }>(
-      res,
-      'Não foi possível iniciar a sessão do Stripe Connect.'
-    );
-  }
 }

=== src/domain/ticketing/application/usecases/createPartnerConnectAccountSessionUseCase.ts — APAGUE este arquivo ===

=== src/domain/ticketing/application/usecases/createPartnerConnectAccountUseCase.ts — APAGUE este arquivo ===

=== src/domain/ticketing/application/usecases/getPartnerMerchantStatusUseCase.ts — APAGUE este arquivo ===

=== src/domain/ticketing/hooks/usePartnerEventSales.ts — diff ===
@@ -1,18 +1,11 @@
 import { useCallback, useEffect, useState } from 'react';
 import { checkInTicketUseCase } from '../application/usecases/checkInTicketUseCase';
-import { createPartnerConnectAccountUseCase } from '../application/usecases/createPartnerConnectAccountUseCase';
 import { getEventSalesAnalyticsUseCase } from '../application/usecases/getEventSalesAnalyticsUseCase';
-import { getPartnerMerchantStatusUseCase } from '../application/usecases/getPartnerMerchantStatusUseCase';
 import { listEventCheckInsUseCase } from '../application/usecases/listEventCheckInsUseCase';
 import { listEventOrdersUseCase } from '../application/usecases/listEventOrdersUseCase';
 import { listEventRefundsUseCase } from '../application/usecases/listEventRefundsUseCase';
-import type {
-  EventCheckIn,
-  EventSalesAnalytics,
-  PartnerMerchantStatus,
-  Refund,
-  TicketOrder,
-} from '../types/ticketing';
+import { listPaymentAccountsUseCase } from '../../payment';
+import type { EventCheckIn, EventSalesAnalytics, Refund, TicketOrder } from '../types/ticketing';
 
 export function usePartnerEventSales(
   eventListingId?: string,
@@ -90,8 +83,12 @@ export function usePartnerEventSales(
   };
 }
 
+/**
+ * Aviso de conta financeira do painel de ingressos. Por enquanto basta um CNPJ da conta pronto para
+ * receber; a venda confere a conta do estabelecimento do evento no backend (D14, débito B26).
+ */
 export function usePartnerMerchantAccount(enabled = true) {
-  const [status, setStatus] = useState<PartnerMerchantStatus | null>(null);
+  const [status, setStatus] = useState<{ readyForSales: boolean } | null>(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
 
@@ -100,14 +97,12 @@ export function usePartnerMerchantAccount(enabled = true) {
     setLoading(true);
     setError(null);
     try {
-      const res = await getPartnerMerchantStatusUseCase();
-      setStatus(res);
+      const accounts = await listPaymentAccountsUseCase();
+      setStatus({ readyForSales: accounts.some((entry) => entry.account?.readyForSales) });
     } catch (err) {
       console.error('[usePartnerMerchantAccount]', err);
       setError(
-        err instanceof Error
-          ? err.message
-          : 'Não foi possível carregar o status da conta Stripe Connect.'
+        err instanceof Error ? err.message : 'Não foi possível carregar a conta financeira.'
       );
     } finally {
       setLoading(false);
@@ -118,18 +113,5 @@ export function usePartnerMerchantAccount(enabled = true) {
     void reload();
   }, [reload]);
 
-  const connectMarketplace = useCallback(async () => {
-    setError(null);
-    const created = await createPartnerConnectAccountUseCase();
-    setStatus(created);
-    return created;
-  }, []);
-
-  return {
-    status,
-    loading,
-    error,
-    reload,
-    connectMarketplace,
-  };
+  return { status, loading, error, reload };
 }

=== src/domain/ticketing/index.ts — diff ===
@@ -1,15 +1,12 @@
 export { checkInTicketUseCase } from './application/usecases/checkInTicketUseCase';
 export { confirmTicketOrderPaymentReturnUseCase } from './application/usecases/confirmTicketOrderPaymentReturnUseCase';
 export { createOfflineCheckInSessionUseCase } from './application/usecases/createOfflineCheckInSessionUseCase';
-export { createPartnerConnectAccountSessionUseCase } from './application/usecases/createPartnerConnectAccountSessionUseCase';
-export { createPartnerConnectAccountUseCase } from './application/usecases/createPartnerConnectAccountUseCase';
 export { createTicketOrderPaymentIntentUseCase } from './application/usecases/createTicketOrderPaymentIntentUseCase';
 export { createTicketOrderUseCase } from './application/usecases/createTicketOrderUseCase';
 export { createTicketTypeUseCase } from './application/usecases/createTicketTypeUseCase';
 export { deleteOrArchiveTicketTypeUseCase } from './application/usecases/deleteOrArchiveTicketTypeUseCase';
 export { expireTicketOrderUseCase } from './application/usecases/expireTicketOrderUseCase';
 export { getEventSalesAnalyticsUseCase } from './application/usecases/getEventSalesAnalyticsUseCase';
-export { getPartnerMerchantStatusUseCase } from './application/usecases/getPartnerMerchantStatusUseCase';
 export { getTicketOrderUseCase } from './application/usecases/getTicketOrderUseCase';
 export { getTicketQrTokenUseCase } from './application/usecases/getTicketQrTokenUseCase';
 export { listEventCheckInsUseCase } from './application/usecases/listEventCheckInsUseCase';

=== src/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -3,7 +3,6 @@ import type {
   EventSalesAnalytics,
   OfflineCheckInSessionResponse,
   OfflineCheckInSyncResult,
-  PartnerMerchantStatus,
   PublicTicketTypeProjection,
   Refund,
   Ticket,
@@ -144,7 +143,4 @@ export interface TicketingPort {
   listEventOrders(eventListingId: string, asAdmin?: boolean): Promise<TicketOrder[]>;
   listEventCheckIns(eventListingId: string, asAdmin?: boolean): Promise<EventCheckIn[]>;
   listEventRefunds(eventListingId: string, asAdmin?: boolean): Promise<Refund[]>;
-  getPartnerMerchantStatus(): Promise<PartnerMerchantStatus>;
-  createPartnerConnectAccount(): Promise<PartnerMerchantStatus>;
-  createPartnerConnectAccountSession(): Promise<{ clientSecret: string }>;
 }

=== src/domain/ticketing/types/ticketing.ts — diff ===
@@ -221,17 +221,6 @@ export interface EventSalesAnalytics {
   ordersPending: number;
 }
 
-export interface PartnerMerchantStatus {
-  connected: boolean;
-  accountId?: string;
-  chargesEnabled: boolean;
-  payoutsEnabled: boolean;
-  detailsSubmitted: boolean;
-  status: 'pending' | 'restricted' | 'enabled' | 'disabled';
-  /** Calculado no servidor: mesmo critério usado para vender. */
-  readyForSales: boolean;
-}
-
 export interface OfflineCheckInSessionResponse {
   session: {
     id: string;

=== src/shared/i18n/paymentAccountsResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos das contas de recebimento por CNPJ (D14). pt-BR é a fonte. */
export interface PaymentAccountsTranslation {
  title: string;
  subtitle: string;
  loading: string;
  empty: string;
  refresh: string;
  retry: string;
  missingKey: string;
  listings_one: string;
  listings_other: string;
  requirements_one: string;
  requirements_other: string;
  status: {
    ready: string;
    pending: string;
    restricted: string;
    disabled: string;
    notStarted: string;
  };
  actions: {
    start: string;
    continue: string;
    manage: string;
    back: string;
  };
  tabs: {
    label: string;
    onboarding: string;
    balances: string;
    payouts: string;
    payments: string;
    account: string;
  };
  errors: {
    NOT_FOUND: string;
    FORBIDDEN: string;
    VALIDATION_ERROR: string;
    PAYMENT_ACCOUNT_UNAVAILABLE: string;
  };
}

export const paymentAccountsPtBR: PaymentAccountsTranslation = {
  title: 'Recebimentos',
  subtitle:
    'Cada CNPJ verificado recebe na própria conta. As vendas de um estabelecimento caem na conta do CNPJ dele.',
  loading: 'Carregando contas de recebimento…',
  empty:
    'Nenhum CNPJ verificado ainda. Verifique um estabelecimento com CNPJ para receber pagamentos.',
  refresh: 'Atualizar contas de recebimento',
  retry: 'Tentar de novo',
  missingKey:
    'Pagamentos indisponíveis no momento: a chave pública do Stripe não está configurada.',
  listings_one: '{{count}} cadastro vende por este CNPJ',
  listings_other: '{{count}} cadastros vendem por este CNPJ',
  requirements_one: '{{count}} pendência no Stripe',
  requirements_other: '{{count}} pendências no Stripe',
  status: {
    ready: 'Pronta para receber',
    pending: 'Cadastro incompleto',
    restricted: 'Em análise no Stripe',
    disabled: 'Desativada pelo Stripe',
    notStarted: 'Cadastro não iniciado',
  },
  actions: {
    start: 'Configurar recebimentos',
    continue: 'Continuar cadastro',
    manage: 'Gerenciar',
    back: 'Voltar para as contas',
  },
  tabs: {
    label: 'Seções da conta',
    onboarding: 'Cadastro',
    balances: 'Saldos',
    payouts: 'Repasses',
    payments: 'Pagamentos',
    account: 'Dados da conta',
  },
  errors: {
    NOT_FOUND: 'Este CNPJ não está verificado na sua conta.',
    FORBIDDEN: 'Esta conta de recebimento pertence a outro parceiro.',
    VALIDATION_ERROR: 'Conta inválida. Atualize a página e tente de novo.',
    PAYMENT_ACCOUNT_UNAVAILABLE:
      'Não foi possível falar com o Stripe agora. Tente de novo em instantes.',
  },
};

export const paymentAccountsEn: PaymentAccountsTranslation = {
  title: 'Payouts',
  subtitle:
    'Each verified CNPJ gets paid into its own account. Sales from a listing go to the account of its CNPJ.',
  loading: 'Loading payout accounts…',
  empty: 'No verified CNPJ yet. Verify a listing with a CNPJ to receive payments.',
  refresh: 'Refresh payout accounts',
  retry: 'Try again',
  missingKey: 'Payments are unavailable right now: the Stripe publishable key is not set.',
  listings_one: '{{count}} listing sells under this CNPJ',
  listings_other: '{{count}} listings sell under this CNPJ',
  requirements_one: '{{count}} pending item on Stripe',
  requirements_other: '{{count}} pending items on Stripe',
  status: {
    ready: 'Ready to receive',
    pending: 'Setup incomplete',
    restricted: 'Under review by Stripe',
    disabled: 'Disabled by Stripe',
    notStarted: 'Setup not started',
  },
  actions: {
    start: 'Set up payouts',
    continue: 'Continue setup',
    manage: 'Manage',
    back: 'Back to accounts',
  },
  tabs: {
    label: 'Account sections',
    onboarding: 'Setup',
    balances: 'Balances',
    payouts: 'Payouts',
    payments: 'Payments',
    account: 'Account details',
  },
  errors: {
    NOT_FOUND: 'This CNPJ is not verified on your account.',
    FORBIDDEN: 'This payout account belongs to another partner.',
    VALIDATION_ERROR: 'Invalid account. Refresh the page and try again.',
    PAYMENT_ACCOUNT_UNAVAILABLE: "We couldn't reach Stripe right now. Try again in a moment.",
  },
};

export const paymentAccountsFr: PaymentAccountsTranslation = {
  title: 'Versements',
  subtitle:
    "Chaque CNPJ vérifié est payé sur son propre compte. Les ventes d'un établissement vont sur le compte de son CNPJ.",
  loading: 'Chargement des comptes de versement…',
  empty:
    "Aucun CNPJ vérifié pour l'instant. Faites vérifier un établissement avec un CNPJ pour recevoir des paiements.",
  refresh: 'Actualiser les comptes de versement',
  retry: 'Réessayer',
  missingKey:
    "Paiements indisponibles pour le moment : la clé publique Stripe n'est pas configurée.",
  listings_one: '{{count}} fiche vend avec ce CNPJ',
  listings_other: '{{count}} fiches vendent avec ce CNPJ',
  requirements_one: '{{count}} élément en attente sur Stripe',
  requirements_other: '{{count}} éléments en attente sur Stripe',
  status: {
    ready: 'Prêt à recevoir',
    pending: 'Inscription incomplète',
    restricted: 'En cours de vérification par Stripe',
    disabled: 'Désactivé par Stripe',
    notStarted: 'Inscription non commencée',
  },
  actions: {
    start: 'Configurer les versements',
    continue: "Continuer l'inscription",
    manage: 'Gérer',
    back: 'Retour aux comptes',
  },
  tabs: {
    label: 'Sections du compte',
    onboarding: 'Inscription',
    balances: 'Soldes',
    payouts: 'Versements',
    payments: 'Paiements',
    account: 'Données du compte',
  },
  errors: {
    NOT_FOUND: "Ce CNPJ n'est pas vérifié sur votre compte.",
    FORBIDDEN: 'Ce compte de versement appartient à un autre partenaire.',
    VALIDATION_ERROR: 'Compte invalide. Actualisez la page et réessayez.',
    PAYMENT_ACCOUNT_UNAVAILABLE:
      "Impossible de joindre Stripe pour l'instant. Réessayez dans un instant.",
  },
};

=== src/shared/i18n/resources.ts — diff ===
@@ -16,6 +16,12 @@ import {
   listingPlanFr,
   listingPlanPtBR,
 } from './listingPlanResources';
+import {
+  type PaymentAccountsTranslation,
+  paymentAccountsEn,
+  paymentAccountsFr,
+  paymentAccountsPtBR,
+} from './paymentAccountsResources';
 import {
   type PartnersTranslation,
   partnersEn,
@@ -34,6 +40,7 @@ export interface TranslationResource {
   insights: InsightsTranslation;
   listingPlan: ListingPlanTranslation;
   partners: PartnersTranslation;
+  paymentAccounts: PaymentAccountsTranslation;
   verification: VerificationTranslation;
   common: {
     language: string;
@@ -253,6 +260,7 @@ const ptBR: TranslationResource = {
   insights: insightsPtBR,
   listingPlan: listingPlanPtBR,
   partners: partnersPtBR,
+  paymentAccounts: paymentAccountsPtBR,
   verification: verificationPtBR,
   common: {
     language: 'Idioma',
@@ -522,6 +530,7 @@ const en: TranslationResource = {
   insights: insightsEn,
   listingPlan: listingPlanEn,
   partners: partnersEn,
+  paymentAccounts: paymentAccountsEn,
   verification: verificationEn,
   common: {
     language: 'Language',
@@ -785,6 +794,7 @@ const fr: TranslationResource = {
   insights: insightsFr,
   listingPlan: listingPlanFr,
   partners: partnersFr,
+  paymentAccounts: paymentAccountsFr,
   verification: verificationFr,
   common: {
     language: 'Langue',

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- `npm run test:rules` (firestore.rules mudou);
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/app/compositions/PartnerBookingsComposition.tsx src/domain/payment/adapters/stripeConnectAdapter.ts src/domain/payment/adapters/ui/StripeConnectAccountEmbed.tsx src/domain/payment/api/apiPaymentAdapter.ts src/domain/payment/application/usecases/createPaymentAccountSessionUseCase.ts src/domain/payment/application/usecases/listPaymentAccountsUseCase.ts src/domain/payment/components/PartnerStripeConnectPortal.test.tsx src/domain/payment/components/PartnerStripeConnectPortal.tsx src/domain/payment/components/accounts/PaymentAccountCard.tsx src/domain/payment/components/accounts/PaymentAccountWorkspace.tsx src/domain/payment/components/accounts/paymentAccountStatus.ts src/domain/payment/index.ts src/domain/payment/ports/paymentApiPort.ts src/domain/payment/types/payment.ts src/domain/ticketing/adapters/httpTicketingAdapter.ts src/domain/ticketing/hooks/usePartnerEventSales.ts src/domain/ticketing/index.ts src/domain/ticketing/ports/ticketingPort.ts src/domain/ticketing/types/ticketing.ts src/shared/i18n/paymentAccountsResources.ts src/shared/i18n/resources.ts` (todos verdes). Não precisa rodar a suíte inteira.
- no app (chaves de teste do Stripe):
  - painel do parceiro com dois estabelecimentos de CNPJs diferentes aprovados → Recebimentos mostra dois cartões, cada um com o CNPJ mascarado e o próprio status;
  - "Configurar recebimentos" de um cartão abre o cadastro do Stripe daquela conta; o outro cartão continua "Cadastro não iniciado";
  - publicar uma oferta de passeio só funciona quando a conta do CNPJ daquele estabelecimento está pronta.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
