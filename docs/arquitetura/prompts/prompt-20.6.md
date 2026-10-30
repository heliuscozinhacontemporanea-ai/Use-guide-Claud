# Prompt 20.6 — Painel admin: App Check, abas e build de produção

> Lote 18, gerado dos commits de referência `1ee8dc9` e `a5266cd` da branch `claude/agents-md-v2`. Aplique depois do C17. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 20.6 — Painel admin: App Check, abas e build de produção

Barra de abas e cabeçalho aprovados em 2026-10-30. Corrige o painel admin em produção: o site publicado em 29/10 saiu com bundle de desenvolvimento (`import.meta.env.DEV=true`), o App Check ficou em modo de depuração e todas as rotas responderam 401.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova. Não altere firebase.json, functions/ nem .env.

O QUE MUDA:
1) package.json: o script `build` passa a ser `NODE_ENV=production vite build && esbuild ...`. Com NODE_ENV=development no terminal do deploy, o Vite gerava um bundle de desenvolvimento (App Check em modo de depuração, React de desenvolvimento). `npm run dev` não muda.
2) App Check: o middleware do servidor responde 401 no formato padrão (§10.2): `APP_CHECK_REQUIRED` e `APP_CHECK_INVALID`. No navegador, `firebaseApiFetch` mostra um aviso traduzido uma única vez quando a resposta tem um desses códigos (`appCheckFailureNotice.ts`). O tempo (climawind) deixa de pular o App Check.
3) Painel admin: barra de abas com rolagem lateral, nomes inteiros (sem espremer), aba ativa no visual D17 e levada para a área visível; cabeçalho com BackButton e "Painel admin". Textos no namespace `adminPanel` (pt-BR, en, fr).
4) Lista de parceiros: um documento inválido em `partners` é ignorado (com aviso no log, só o ID) em vez de derrubar a lista inteira.
5) Planos: o adapter lê a mensagem de erro no formato `{ error: { message } }`.
6) Moderação: `<div>` em volta das estrelas (antes era `<p>` com `<div>` dentro).

ARQUIVOS (crie, altere ou apague exatamente estes):
- package.json (alterar)
- server/domain/partners/adapters/firestorePartnerAdapter.ts (alterar)
- server/infrastructure/auth/appCheckMiddleware.test.ts (alterar)
- server/infrastructure/auth/appCheckMiddleware.ts (alterar)
- src/domain/admin/adapters/firestoreAdminPlansAdapter.ts (alterar)
- src/domain/admin/components/AdminPanel.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminNavigation.test.tsx (criar)
- src/domain/admin/components/subcomponents/AdminNavigation.tsx (alterar)
- src/domain/climawind/adapters/apiClimaWindAdapter.ts (alterar)
- src/domain/climawind/components/ConditionsDetailModal.tsx (alterar)
- src/domain/reviews/components/moderation/ReviewModerationQueue.tsx (alterar)
- src/shared/i18n/adminPanelResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/infrastructure/firebase/appCheckFailureNotice.test.ts (criar)
- src/shared/infrastructure/firebase/appCheckFailureNotice.ts (criar)
- src/shared/infrastructure/firebase/firebaseApiFetch.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== package.json — diff ===
@@ -8,7 +8,7 @@
   },
   "scripts": {
     "dev": "tsx server.ts",
-    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
+    "build": "NODE_ENV=production vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
     "start": "node dist/server.cjs",
     "preview": "vite preview",
     "clean": "rm -rf dist",

=== server/domain/partners/adapters/firestorePartnerAdapter.ts — diff ===
@@ -89,9 +89,17 @@ export class FirestorePartnerAdapter implements PartnerPort {
 
   async getAllPartners(): Promise<PartnerProfileDocument[]> {
     const snapshot = await adminDb.collection('partners').get();
-    return snapshot.docs.map((doc) =>
-      toPartnerProfileDTO(doc.id, doc.data() as Record<string, unknown>)
-    );
+    const partners: PartnerProfileDocument[] = [];
+    for (const doc of snapshot.docs) {
+      try {
+        partners.push(toPartnerProfileDTO(doc.id, doc.data() as Record<string, unknown>));
+      } catch (error) {
+        // Um documento fora do formato não pode derrubar a lista inteira do admin; fica só no log.
+        if (!(error instanceof PartnerDomainError)) throw error;
+        console.warn('[FirestorePartnerAdapter.getAllPartners] parceiro ignorado', { id: doc.id });
+      }
+    }
+    return partners;
   }
 
   async deletePartnerProfile(partnerId: string): Promise<void> {

=== server/infrastructure/auth/appCheckMiddleware.test.ts — diff ===
@@ -1,5 +1,5 @@
-import { describe, expect, it } from 'vitest';
-import { isAppCheckRequired } from './appCheckMiddleware';
+import { describe, expect, it, vi } from 'vitest';
+import { isAppCheckRequired, verifyAppCheck } from './appCheckMiddleware';
 
 describe('isAppCheckRequired', () => {
   it('exige App Check em produção quando a variável não foi definida', () => {
@@ -15,4 +15,19 @@ describe('isAppCheckRequired', () => {
     expect(isAppCheckRequired({ NODE_ENV: 'development', APP_CHECK_REQUIRED: 'true' })).toBe(true);
     expect(isAppCheckRequired({ NODE_ENV: 'production', APP_CHECK_REQUIRED: 'false' })).toBe(false);
   });
+
+  it('sem o token, quando exigido, responde 401 com código estável (AGENTS.md §10.2)', async () => {
+    const previous = process.env.APP_CHECK_REQUIRED;
+    process.env.APP_CHECK_REQUIRED = 'true';
+    const res = { status: vi.fn(), json: vi.fn() };
+    res.status.mockReturnValue(res);
+    const next = vi.fn();
+    await verifyAppCheck({ header: () => undefined } as never, res as never, next);
+    process.env.APP_CHECK_REQUIRED = previous;
+    expect(next).not.toHaveBeenCalled();
+    expect(res.status).toHaveBeenCalledWith(401);
+    expect(res.json).toHaveBeenCalledWith({
+      error: { code: 'APP_CHECK_REQUIRED', message: 'App Check obrigatório.' },
+    });
+  });
 });

=== server/infrastructure/auth/appCheckMiddleware.ts — diff ===
@@ -12,23 +12,25 @@ export async function verifyAppCheck(
   req: Request,
   res: Response,
   next: NextFunction
-): Promise<void | Response> {
+): Promise<undefined | Response> {
   const token = req.header('X-Firebase-AppCheck');
   if (!token) {
     if (isAppCheckRequired()) {
       return res.status(401).json({
-        error: 'App Check obrigatório',
+        error: { code: 'APP_CHECK_REQUIRED', message: 'App Check obrigatório.' },
       });
     }
-    return next();
+    next();
+    return undefined;
   }
   try {
     const claims = await getAppCheck().verifyToken(token);
     (req as Request & { appCheck?: unknown }).appCheck = claims;
-    return next();
+    next();
+    return undefined;
   } catch {
     return res.status(401).json({
-      error: 'App Check inválido',
+      error: { code: 'APP_CHECK_INVALID', message: 'App Check inválido.' },
     });
   }
 }

=== src/domain/admin/adapters/firestoreAdminPlansAdapter.ts — diff ===
@@ -70,11 +70,8 @@ export class FirestoreAdminPlansAdapter implements AdminPlansPort {
 
     if (!response.ok) {
       const body = await response.json().catch(() => null);
-      throw new Error(
-        typeof body?.error === 'string'
-          ? body.error
-          : 'Erro ao atualizar plano'
-      );
+      const message = typeof body?.error === 'string' ? body.error : body?.error?.message;
+      throw new Error(message || 'Erro ao atualizar plano');
     }
   }
 }

=== src/domain/admin/components/AdminPanel.tsx — diff ===
@@ -2,9 +2,11 @@ import { type ReactNode, useMemo, useState } from 'react';
 import { UserRole } from '../../auth/types/auth';
 import { motion, AnimatePresence } from 'motion/react';
 import { useAuthContext } from '../../auth/context/AuthContext';
-import { ChevronLeft, RefreshCw } from 'lucide-react';
+import { RefreshCw } from 'lucide-react';
 import { useUI } from '../../../shared/stores/useUIStore';
+import { useTranslation } from 'react-i18next';
 import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
+import { BackButton } from '../../../ui/components/BackButton';
 
 import { ErrorState } from '../../../ui/components/ErrorState';
 import { CATEGORIES } from '../../../shared/constants/categories';
@@ -84,6 +86,7 @@ export function AdminPanel({
   renderSessionsField,
   renderTicketingManager,
 }: AdminPanelProps = {}) {
+  const { t } = useTranslation();
   const { goTo } = useLocalizedRouting();
   const { user, loading: userLoading } = useAuthContext();
   const { showToast, confirmAction } = useUI();
@@ -224,35 +227,14 @@ export function AdminPanel({
 
   return (
     <div
-      className="min-h-screen pt-12 pb-40 px-4 bg-app font-sans selection:bg-teal-500/30 relative overflow-hidden"
+      className="min-h-screen pt-[max(1rem,env(safe-area-inset-top))] pb-40 px-4 bg-app font-sans selection:bg-teal-500/30 relative"
       id="admin-panel-viewport"
     >
-      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
-        <motion.div
-          initial={{ opacity: 0, y: -20 }}
-          animate={{ opacity: 1, y: 0 }}
-          className="flex items-center gap-5"
-        >
-          <button
-            type="button"
-            aria-label="Voltar para Home"
-            onClick={() => goTo('explore')}
-            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-teal-400/50"
-          >
-            <ChevronLeft size={22} />
-          </button>
-          <div>
-            <h1 className="text-3xl font-display font-extrabold tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
-              CMS Dashboard
-            </h1>
-            <div className="flex items-center gap-2 mt-1">
-              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
-              <p className="text-[10px] text-white/50 uppercase font-black tracking-[0.2em]">
-                Gestão de Conteúdo
-              </p>
-            </div>
-          </div>
-        </motion.div>
+      <div className="max-w-4xl mx-auto space-y-6 relative">
+        <div className="flex items-center gap-2">
+          <BackButton label={t('adminPanel.back')} onClick={() => goTo('explore')} />
+          <h1 className="text-[22px] font-display font-bold text-ink">{t('adminPanel.title')}</h1>
+        </div>
 
         <AdminNavigation
           activeTab={activeTab}

=== src/domain/admin/components/subcomponents/AdminNavigation.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { AdminNavigation } from './AdminNavigation';

beforeAll(() => {
  // jsdom não implementa scrollIntoView.
  Element.prototype.scrollIntoView = vi.fn();
});

describe('abas do painel admin (D17)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra cada aba com o nome inteiro e marca a ativa', () => {
    const onSelect = vi.fn();
    render(
      <AdminNavigation
        activeTab="plans"
        onSelectTab={onSelect}
        showVerifications
        showFinance
        showModeration
      />
    );
    const names = screen.getAllByRole('button').map((button) => button.textContent);
    expect(names).toEqual([
      'Relatórios',
      'Parceiros',
      'Verificações',
      'Financeiro',
      'Moderação',
      'Guia local',
      'Agenda',
      'Planos',
      'Avisos',
    ]);
    expect(screen.getByRole('button', { name: 'Planos' }).getAttribute('aria-pressed')).toBe(
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Moderação' }));
    expect(onSelect).toHaveBeenCalledWith('moderation');
  });

  it('abas de outros domínios só aparecem quando a composição as monta', () => {
    render(<AdminNavigation activeTab="reports" onSelectTab={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Financeiro' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Moderação' })).toBeNull();
  });
});

=== src/domain/admin/components/subcomponents/AdminNavigation.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useEffect, useRef } from 'react';
import {
  Award,
  Bell,
  Calendar,
  Database,
  Flag,
  Landmark,
  Layers,
  type LucideIcon,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';

export type AdminTabId =
  | 'items'
  | 'events'
  | 'reports'
  | 'partners'
  | 'verifications'
  | 'finance'
  | 'moderation'
  | 'plans'
  | 'notifications';

interface AdminNavigationProps {
  activeTab: AdminTabId;
  onSelectTab: (tab: AdminTabId) => void;
  /** A fila de verificação vem de outro domínio; a aba só aparece quando a composição a monta. */
  showVerifications?: boolean;
  /** As filas financeiras vêm do payment; a aba só aparece quando a composição as monta. */
  showFinance?: boolean;
  /** A fila de denúncias vem do reviews (D19); a aba só aparece quando a composição a monta. */
  showModeration?: boolean;
}

// Ordem das abas; o rótulo de cada uma vem da tradução (as de outros domínios usam o namespace deles).
const ADMIN_TABS: { id: AdminTabId; icon: LucideIcon; labelKey: string }[] = [
  { id: 'reports', icon: Database, labelKey: 'adminPanel.tabs.reports' },
  { id: 'partners', icon: Users, labelKey: 'adminPanel.tabs.partners' },
  { id: 'verifications', icon: ShieldCheck, labelKey: 'verification.admin.tab' },
  { id: 'finance', icon: Landmark, labelKey: 'adminFinance.title' },
  { id: 'moderation', icon: Flag, labelKey: 'reviewReports.admin.tab' },
  { id: 'items', icon: Layers, labelKey: 'adminPanel.tabs.items' },
  { id: 'events', icon: Calendar, labelKey: 'adminPanel.tabs.events' },
  { id: 'plans', icon: Award, labelKey: 'adminPanel.tabs.plans' },
  { id: 'notifications', icon: Bell, labelKey: 'adminPanel.tabs.notifications' },
];

/**
 * Abas do painel admin (D17): rolam para o lado no celular, com o nome inteiro, e a ativa fica
 * invertida, sem cor de destaque. A aba escolhida rola para ficar visível.
 */
export function AdminNavigation({
  activeTab,
  onSelectTab,
  showVerifications = false,
  showFinance = false,
  showModeration = false,
}: AdminNavigationProps) {
  const { t } = useTranslation();
  const activeRef = useRef<HTMLButtonElement>(null);
  const shown: Partial<Record<AdminTabId, boolean>> = {
    verifications: showVerifications,
    finance: showFinance,
    moderation: showModeration,
  };
  const tabs = ADMIN_TABS.filter((tab) => shown[tab.id] ?? true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: rolar de novo só quando a aba muda
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activeTab]);

  return (
    <nav
      aria-label={t('adminPanel.tabsLabel')}
      id="admin-navigation-tabs"
      className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-app"
    >
      <div className="flex gap-1 p-1 rounded-full bg-ink/[0.06] overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const label = t(tab.labelKey);
          return (
            <button
              key={tab.id}
              ref={active ? activeRef : undefined}
              type="button"
              aria-pressed={active}
              aria-label={label}
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                'press shrink-0 min-h-11 px-4 rounded-full inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
                active ? 'bg-ink text-app' : 'text-ink/70 hover:text-ink'
              )}
            >
              <tab.icon size={16} aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

=== src/domain/climawind/adapters/apiClimaWindAdapter.ts — diff ===
@@ -16,8 +16,7 @@ export class ApiClimaWindAdapter implements ClimaWindPort {
     try {
       const res = await firebaseApiFetch(
         `/api/weather?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,uv_index&hourly=wind_speed_10m,wind_direction_10m&wind_speed_unit=kn&timezone=auto&forecast_days=2&past_days=1`,
-        { signal: controller.signal },
-        { requireAppCheck: false }
+        { signal: controller.signal }
       );
 
       clearTimeout(timeoutId);
@@ -37,7 +36,7 @@ export class ApiClimaWindAdapter implements ClimaWindPort {
 
       const json = (await res.json()) as ApiWeatherResponse;
 
-      if (!json || !json.current || !json.hourly) {
+      if (!json?.current || !json.hourly) {
         console.error('Dados climáticos incompletos retornados:', json);
         throw new Error('Dados climáticos incompletos do servidor');
       }
@@ -49,7 +48,7 @@ export class ApiClimaWindAdapter implements ClimaWindPort {
       const allHours: HourlyWindItem[] = hourlyTime
         .map((time: string, i: number): HourlyWindItem | null => {
           const d = new Date(time);
-          if (isNaN(d.getTime())) return null;
+          if (Number.isNaN(d.getTime())) return null;
           return {
             time: `${String(d.getHours()).padStart(2, '0')}h`,
             hourNum: d.getHours(),
@@ -60,7 +59,7 @@ export class ApiClimaWindAdapter implements ClimaWindPort {
         })
         .filter((item: HourlyWindItem | null): item is HourlyWindItem => item !== null);
 
-      const now = new Date().getTime();
+      const now = Date.now();
       // Filtro temporal: de 1h atrás até as próximas 24h — janela relevante para condições de vento em Jeri
       const hourlyData = allHours.filter(
         (h: HourlyWindItem) =>

=== src/domain/climawind/components/ConditionsDetailModal.tsx — diff ===
@@ -1,4 +1,4 @@
-import React, { useState, useEffect } from 'react';
+import { useState, useEffect } from 'react';
 import { X, Navigation } from 'lucide-react';
 import { getWeatherDesc } from '../../../shared/lib/weatherUtils';
 import { useScrollLock } from '../../../shared/hooks/useScrollLock';
@@ -39,7 +39,7 @@ export function ConditionsDetailModal({ isOpen, onClose, location }: ConditionsD
         const res = await firebaseApiFetch(
           `/api/weather?latitude=${location.lat}&longitude=${location.lon}&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,weather_code&wind_speed_unit=kn&timezone=auto&forecast_days=10`,
           { signal: controller.signal },
-          { requireAuth: false, requireAppCheck: false }
+          { requireAuth: false }
         );
 
         clearTimeout(timeoutId);
@@ -59,7 +59,7 @@ export function ConditionsDetailModal({ isOpen, onClose, location }: ConditionsD
 
         const json = await res.json();
 
-        if (!json || !json.daily) {
+        if (!json?.daily) {
           throw new Error('Invalid forecast API response');
         }
 
@@ -74,7 +74,7 @@ export function ConditionsDetailModal({ isOpen, onClose, location }: ConditionsD
         const days = dailyTime
           .map((time: string, i: number) => {
             const d = new Date(time);
-            if (isNaN(d.getTime())) return null;
+            if (Number.isNaN(d.getTime())) return null;
             return {
               date: d.toLocaleDateString('pt-BR', {
                 weekday: 'short',

=== src/domain/reviews/components/moderation/ReviewModerationQueue.tsx — diff ===
@@ -95,10 +95,10 @@ export function ReviewModerationQueue() {
                 </StatusText>
               </div>
               <div>
-                <p className="flex items-center gap-2 text-[13px] text-ink/70">
+                <div className="flex items-center gap-2 text-[13px] text-ink/70">
                   {t('reviewReports.admin.review', { rating: report.reviewRating })}
                   <StarRating rating={report.reviewRating} size={12} />
-                </p>
+                </div>
                 <p className="text-sm text-ink/80 break-words">{report.reviewComment}</p>
               </div>
               <div className="p-3 rounded-2xl bg-danger-soft border border-danger-line">

=== src/shared/i18n/adminPanelResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos do cabeçalho e das abas do painel admin. pt-BR é a fonte. */
type Tabs = {
  reports: string;
  partners: string;
  items: string;
  events: string;
  plans: string;
  notifications: string;
};

export interface AdminPanelTranslation {
  title: string;
  back: string;
  tabsLabel: string;
  tabs: Tabs;
}

export const adminPanelPtBR: AdminPanelTranslation = {
  title: 'Painel admin',
  back: 'Voltar para o início',
  tabsLabel: 'Seções do painel admin',
  tabs: {
    reports: 'Relatórios',
    partners: 'Parceiros',
    items: 'Guia local',
    events: 'Agenda',
    plans: 'Planos',
    notifications: 'Avisos',
  },
};

export const adminPanelEn: AdminPanelTranslation = {
  title: 'Admin panel',
  back: 'Back to home',
  tabsLabel: 'Admin panel sections',
  tabs: {
    reports: 'Reports',
    partners: 'Partners',
    items: 'Local guide',
    events: 'Agenda',
    plans: 'Plans',
    notifications: 'Notices',
  },
};

export const adminPanelFr: AdminPanelTranslation = {
  title: 'Panneau admin',
  back: 'Retour à l’accueil',
  tabsLabel: 'Sections du panneau admin',
  tabs: {
    reports: 'Rapports',
    partners: 'Partenaires',
    items: 'Guide local',
    events: 'Agenda',
    plans: 'Formules',
    notifications: 'Avis',
  },
};

=== src/shared/i18n/resources.ts — diff ===
@@ -62,6 +62,12 @@ import {
   reviewReportsFr,
   reviewReportsPtBR,
 } from './reviewReportsResources';
+import {
+  type AdminPanelTranslation,
+  adminPanelEn,
+  adminPanelFr,
+  adminPanelPtBR,
+} from './adminPanelResources';
 import {
   type TicketSessionsTranslation,
   ticketSessionsEn,
@@ -112,6 +118,7 @@ export interface TranslationResource {
   profile: ProfileTranslation;
   myReviews: MyReviewsTranslation;
   reviewReports: ReviewReportsTranslation;
+  adminPanel: AdminPanelTranslation;
   adminFinance: AdminFinanceTranslation;
   ticketSessions: TicketSessionsTranslation;
   salesPolicy: SalesPolicyTranslation;
@@ -183,6 +190,7 @@ export interface TranslationResource {
     tips: string;
   };
   errors: {
+    appCheck: { APP_CHECK_REQUIRED: string; APP_CHECK_INVALID: string };
     media: {
       IMAGE_TOO_LARGE: string;
       INVALID_IMAGE: string;
@@ -340,6 +348,7 @@ const ptBR: TranslationResource = {
   profile: profilePtBR,
   myReviews: myReviewsPtBR,
   reviewReports: reviewReportsPtBR,
+  adminPanel: adminPanelPtBR,
   adminFinance: adminFinancePtBR,
   ticketSessions: ticketSessionsPtBR,
   salesPolicy: salesPolicyPtBR,
@@ -415,6 +424,11 @@ const ptBR: TranslationResource = {
     tips: 'Dicas',
   },
   errors: {
+    appCheck: {
+      APP_CHECK_REQUIRED:
+        'O servidor recusou o acesso porque este aparelho não foi validado pelo App Check. Recarregue a página; se continuar, o App Check precisa ser configurado.',
+      APP_CHECK_INVALID: 'A validação do App Check falhou. Recarregue a página e tente de novo.',
+    },
     media: {
       IMAGE_TOO_LARGE: 'A imagem passa de 6 MB. Escolha uma imagem menor.',
       INVALID_IMAGE: 'Formato não suportado. Envie uma imagem JPEG, PNG ou WebP.',
@@ -624,6 +638,7 @@ const en: TranslationResource = {
   profile: profileEn,
   myReviews: myReviewsEn,
   reviewReports: reviewReportsEn,
+  adminPanel: adminPanelEn,
   adminFinance: adminFinanceEn,
   ticketSessions: ticketSessionsEn,
   salesPolicy: salesPolicyEn,
@@ -698,6 +713,11 @@ const en: TranslationResource = {
     tips: 'Tips',
   },
   errors: {
+    appCheck: {
+      APP_CHECK_REQUIRED:
+        'The server refused access because this device was not validated by App Check. Reload the page; if it continues, App Check needs to be configured.',
+      APP_CHECK_INVALID: 'App Check validation failed. Reload the page and try again.',
+    },
     media: {
       IMAGE_TOO_LARGE: 'The image is larger than 6 MB. Choose a smaller image.',
       INVALID_IMAGE: 'Unsupported format. Upload a JPEG, PNG or WebP image.',
@@ -902,6 +922,7 @@ const fr: TranslationResource = {
   profile: profileFr,
   myReviews: myReviewsFr,
   reviewReports: reviewReportsFr,
+  adminPanel: adminPanelFr,
   adminFinance: adminFinanceFr,
   ticketSessions: ticketSessionsFr,
   salesPolicy: salesPolicyFr,
@@ -977,6 +998,11 @@ const fr: TranslationResource = {
     tips: 'Conseils',
   },
   errors: {
+    appCheck: {
+      APP_CHECK_REQUIRED:
+        'Le serveur a refusé l’accès car cet appareil n’a pas été validé par App Check. Rechargez la page ; si cela continue, App Check doit être configuré.',
+      APP_CHECK_INVALID: 'La validation App Check a échoué. Rechargez la page et réessayez.',
+    },
     media: {
       IMAGE_TOO_LARGE: "L'image dépasse 6 Mo. Choisissez une image plus légère.",
       INVALID_IMAGE: 'Format non pris en charge. Envoyez une image JPEG, PNG ou WebP.',

=== src/shared/infrastructure/firebase/appCheckFailureNotice.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('aviso de recusa do App Check', () => {
  beforeEach(() => vi.resetModules());

  it('mostra o aviso traduzido uma vez só, mesmo com várias recusas', async () => {
    const { useUIStore } = await import('../../stores/useUIStore');
    const showToast = vi.spyOn(useUIStore.getState(), 'showToast');
    const { noticeAppCheckFailure } = await import('./appCheckFailureNotice');
    const refused = { error: { code: 'APP_CHECK_REQUIRED', message: 'App Check obrigatório.' } };
    await noticeAppCheckFailure(json(401, refused));
    await noticeAppCheckFailure(json(401, refused));
    expect(showToast).toHaveBeenCalledTimes(1);
    expect(showToast.mock.calls[0]?.[0]).toMatch(/App Check/);
    expect(showToast.mock.calls[0]?.[1]).toBe('error');
  });

  it('ignora outras respostas, inclusive 401 de login', async () => {
    const { useUIStore } = await import('../../stores/useUIStore');
    const showToast = vi.spyOn(useUIStore.getState(), 'showToast');
    const { noticeAppCheckFailure } = await import('./appCheckFailureNotice');
    await noticeAppCheckFailure(json(200, { ok: true }));
    await noticeAppCheckFailure(json(401, { error: { code: 'UNAUTHENTICATED' } }));
    expect(showToast).not.toHaveBeenCalled();
  });
});

=== src/shared/infrastructure/firebase/appCheckFailureNotice.ts — ARQUIVO NOVO, conteúdo completo ===
import { i18n } from '../../i18n';
import { useUIStore } from '../../stores/useUIStore';

const APP_CHECK_CODES = ['APP_CHECK_REQUIRED', 'APP_CHECK_INVALID'] as const;
let noticeShown = false;

/**
 * Recusa do App Check derruba todas as telas de uma vez; um aviso só, com a causa, evita que cada
 * tela mostre "não foi possível carregar" sem dizer por quê.
 */
export async function noticeAppCheckFailure(response: Response): Promise<void> {
  if (response.status !== 401 || noticeShown) return;
  const body = await response
    .clone()
    .json()
    .catch(() => null);
  const code = body?.error?.code;
  if (!APP_CHECK_CODES.includes(code)) return;
  noticeShown = true;
  useUIStore.getState().showToast(i18n.t(`errors.appCheck.${code}`), 'error');
}

=== src/shared/infrastructure/firebase/firebaseApiFetch.ts — diff ===
@@ -1,4 +1,5 @@
 import { auth } from './firebaseAuth';
+import { noticeAppCheckFailure } from './appCheckFailureNotice';
 import { getFirebaseAppCheckToken } from './firebaseAppCheck';
 
 export interface FirebaseApiFetchOptions {
@@ -43,8 +44,10 @@ export async function firebaseApiFetch(
     }
   }
 
-  return fetch(input, {
+  const response = await fetch(input, {
     ...init,
     headers,
   });
+  await noticeAppCheckFailure(response);
+  return response;
 }

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/domain/partners/adapters/firestorePartnerAdapter.ts server/infrastructure/auth/appCheckMiddleware.test.ts server/infrastructure/auth/appCheckMiddleware.ts src/domain/admin/adapters/firestoreAdminPlansAdapter.ts src/domain/admin/components/AdminPanel.tsx src/domain/admin/components/subcomponents/AdminNavigation.test.tsx src/domain/admin/components/subcomponents/AdminNavigation.tsx src/domain/climawind/adapters/apiClimaWindAdapter.ts src/domain/climawind/components/ConditionsDetailModal.tsx src/domain/reviews/components/moderation/ReviewModerationQueue.tsx src/shared/i18n/adminPanelResources.ts src/shared/i18n/resources.ts src/shared/infrastructure/firebase/appCheckFailureNotice.test.ts src/shared/infrastructure/firebase/appCheckFailureNotice.ts src/shared/infrastructure/firebase/firebaseApiFetch.ts` (todos verdes). Não precisa rodar a suíte inteira.
- depois do build, `grep -c 'DEV:!0' dist/assets/index-*.js` deve dar 0 em todos os arquivos, mesmo rodando `NODE_ENV=development npm run build`.
- no painel admin: as abas mostram os nomes inteiros e rolam para o lado; a aba tocada fica visível.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique o Hosting com o build novo: `firebase deploy --only hosting`.
2. Publique também uma revisão nova do Cloud Run (`use-guide`, `us-east1`) com o mesmo código. Todas as páginas, exceto a home `/`, são montadas pelo Cloud Run (rewrite `**` do firebase.json, SEO no servidor) a partir do `dist/index.html` que está dentro dele. Se só o Hosting for publicado, essas páginas, inclusive o painel admin, continuam carregando o bundle antigo.
3. Confira no site: abra uma página interna (ex.: `/eventos`) e o console do navegador. A linha "Firebase App Check debug token" não pode aparecer. Não cadastre token de depuração no console do Firebase para produção.
4. No console do Firebase › App Check, confira que o app Web está registrado com reCAPTCHA Enterprise e que o domínio `useguide.com.br` está na lista de domínios da chave do reCAPTCHA Enterprise (Google Cloud › Segurança › reCAPTCHA).
