# Prompt 22.6 — Sobre o app, Termos do parceiro, Licenças e créditos e Notificações em Configurações

> Lote 19, gerado dos commits de referência `98511bd..cd37326` da branch `claude/agents-md-v2`. Aplique na ordem do lote (C18, A8, 22.1, 22.2, 22.6, 23.0, 23.1, 23.2a, 23.2b, 23.2c, 23.3), um por vez, depois do C18. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 22.6 — Sobre o app, Termos do parceiro, Licenças e créditos e Notificações em Configurações

Proposta A aprovada em 2026-11-02 (D24).

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras estão nas decisões D24 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Sobre o app: ícone, "Versão X" lida do package.json no build (__APP_VERSION__; sem número de build), descrição neutra e as linhas Termos e políticas, Termos do parceiro e Licenças e créditos; © com o ano atual.
2) GET /api/version sai; /api/health devolve { status, version }.
3) Licenças e créditos: lista das bibliotecas (gerada por `npm run licenses` em src/domain/content/data/licenses.generated.json) e créditos (animação do hamster).
4) Configurações › Notificações em tela própria (versão inicial; o 23.1 a refaz).
5) Interruptor Switch no design system.

ARQUIVOS (crie, altere ou apague exatamente estes):
- package.json (alterar)
- scripts/generate-licenses.mjs (criar)
- server.ts (alterar)
- src/app/menu/SideMenu.tsx (alterar)
- src/app/menu/menuViews.test.ts (alterar)
- src/app/menu/menuViews.ts (alterar)
- src/domain/content/adapters/apiContentAdapter.ts (apagar)
- src/domain/content/application/usecases/getAppVersionUseCase.ts (apagar)
- src/domain/content/components/AboutView.test.tsx (criar)
- src/domain/content/components/AboutView.tsx (alterar)
- src/domain/content/components/about/AboutGeneralTab.tsx (apagar)
- src/domain/content/components/about/AboutLicensesTab.tsx (apagar)
- src/domain/content/components/about/AboutLicensesView.test.tsx (criar)
- src/domain/content/components/about/AboutLicensesView.tsx (criar)
- src/domain/content/components/about/AboutTermsTab.tsx (apagar)
- src/domain/content/components/about/AboutTermsView.tsx (criar)
- src/domain/content/components/about/LicenseEntry.tsx (criar)
- src/domain/content/data/credits.ts (criar)
- src/domain/content/data/licenses.generated.test.ts (criar)
- src/domain/content/data/licenses.ts (apagar)
- src/domain/content/factory.ts (apagar)
- src/domain/content/hooks/useAppVersion.ts (apagar)
- src/domain/content/hooks/useOpenSourceLicenses.ts (criar)
- src/domain/content/index.ts (alterar)
- src/domain/content/ports/contentPort.ts (apagar)
- src/domain/content/types/content.ts (alterar)
- src/domain/notifications/components/NotificationSettingsView.test.tsx (criar)
- src/domain/notifications/components/NotificationSettingsView.tsx (criar)
- src/domain/notifications/hooks/useNotificationSettings.ts (alterar)
- src/domain/notifications/index.ts (alterar)
- src/domain/user/components/SettingsView.tsx (alterar)
- src/shared/constants/appVersion.ts (criar)
- src/shared/i18n/appAboutResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)
- src/ui/components/Switch.tsx (criar)
- src/ui/legal/LegalTermsDocument.tsx (alterar)
- vite.config.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== package.json — diff ===
@@ -25,7 +25,8 @@
     "deploy:storage": "firebase deploy --only storage",
     "deploy:firebase-rules": "firebase deploy --only firestore:rules,storage",
     "deploy:functions": "firebase deploy --only functions",
-    "deploy:firestore": "firebase deploy --only firestore"
+    "deploy:firestore": "firebase deploy --only firestore",
+    "licenses": "node scripts/generate-licenses.mjs"
   },
   "dependencies": {
     "@google-cloud/kms": "6.2.1",

=== scripts/generate-licenses.mjs — ARQUIVO NOVO, conteúdo completo ===
// Gera src/domain/content/data/licenses.generated.json a partir das dependências de produção do
// package.json: nome, versão, licença, autoria, página do projeto e o texto da licença de cada uma.
// Rode `npm run licenses` depois de adicionar ou atualizar dependências (um teste confere).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const LICENSE_FILE = /^(licen[cs]e|copying)(\.(md|txt))?$/i;

function repositoryUrl(meta) {
  const raw = typeof meta.repository === 'string' ? meta.repository : meta.repository?.url;
  const url = meta.homepage || raw || '';
  return url.replace(/^git\+/, '').replace(/\.git$/, '').replace(/^git:\/\//, 'https://');
}

function author(meta) {
  if (typeof meta.author === 'string') return meta.author.replace(/\s*[<(].*$/, '');
  return meta.author?.name ?? '';
}

const entries = Object.keys(pkg.dependencies)
  .sort()
  .map((name) => {
    const dir = path.join(root, 'node_modules', name);
    const meta = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
    const file = readdirSync(dir).find((f) => LICENSE_FILE.test(f));
    const text = file ? readFileSync(path.join(dir, file), 'utf8').trim() : '';
    const license = typeof meta.license === 'string' ? meta.license : (meta.license?.type ?? '');
    return {
      name,
      version: meta.version,
      license,
      author: author(meta),
      url: repositoryUrl(meta),
      text,
    };
  });

// Pacotes publicados sem o arquivo de licença: Apache-2.0 tem texto único (vale o de outro pacote);
// MIT recebe o texto padrão com o autor do pacote.
const MIT_TEMPLATE = (holder) => `MIT License

Copyright (c) ${holder}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

for (const entry of entries) {
  if (entry.text) continue;
  if (entry.license === 'MIT') {
    entry.text = MIT_TEMPLATE(entry.author || entry.name);
  } else {
    entry.text = entries.find((other) => other.license === entry.license && other.text)?.text ?? '';
  }
  if (!entry.text) throw new Error(`Sem texto de licença para ${entry.name} (${entry.license})`);
}

const out = path.join(root, 'src/domain/content/data/licenses.generated.json');
writeFileSync(out, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`${entries.length} licenças em ${path.relative(root, out)}`);

=== server.ts — diff ===
@@ -2,6 +2,7 @@ import compression from 'compression';
 import express from 'express';
 import helmet from 'helmet';
 import path from 'path';
+import { version as APP_VERSION } from './package.json';
 import { renderSeoPageApplicationUseCase } from './server/application/usecases/renderSeoPageApplicationUseCase';
 import { renderSitemapApplicationUseCase } from './server/application/usecases/renderSitemapApplicationUseCase';
 import adminRouter from './server/domain/admin/routes/adminRoutes';
@@ -134,22 +135,9 @@ async function startServer() {
     PaymentController.stripeWebhook
   );
 
-  // 2. Health, Version e Internal Job (autenticado via X-Internal-Job-Key com timingSafeEqual)
+  // 2. Health e Internal Job (autenticado via X-Internal-Job-Key com timingSafeEqual)
   app.get('/api/health', (_req, res) => {
-    res.json({
-      status: 'ok',
-      version: process.env.npm_package_version || '0.0.0',
-      revision: process.env.K_REVISION || 'local-dev',
-    });
-  });
-  app.get('/api/version', (_req, res) => {
-    res.json({
-      version: process.env.npm_package_version || '0.0.0',
-      revision: process.env.K_REVISION || 'local-dev',
-      service: process.env.K_SERVICE || 'use-guide',
-      configuration: process.env.K_CONFIGURATION || 'local',
-      environment: process.env.NODE_ENV || 'development',
-    });
+    res.json({ status: 'ok', version: APP_VERSION });
   });
   // Rotas /internal nunca passam pelo rewrite do Hosting (AGENTS.md §7.9).
   app.post(
@@ -172,11 +160,7 @@ async function startServer() {
 
   // 3. App Check para rotas /api/*
   app.use('/api', (req, res, next) => {
-    if (
-      req.path === '/health' ||
-      req.path === '/version' ||
-      req.path.startsWith('/payment/webhook')
-    ) {
+    if (req.path === '/health' || req.path.startsWith('/payment/webhook')) {
       return next();
     }
     return verifyAppCheck(req, res, next);

=== src/app/menu/SideMenu.tsx — diff ===
@@ -4,8 +4,9 @@ import { hasPasswordSignInUseCase, logoutUseCase } from '../../domain/auth';
 import { useAuthContext } from '../../domain/auth/context/AuthContext';
 import { UserRole } from '../../domain/auth/types/auth';
 import { MyBookingsView } from '../../domain/bookings';
-import { AboutView, SupportView } from '../../domain/content';
+import { AboutLicensesView, AboutTermsView, AboutView, SupportView } from '../../domain/content';
 import { FavoritesList } from '../../domain/favorites';
+import { NotificationSettingsView } from '../../domain/notifications';
 import { UserTicketsHistoryView } from '../../domain/ticketing';
 import {
   AccountView,
@@ -42,6 +43,10 @@ const FULL_HEIGHT_VIEWS: readonly MenuView[] = [
   'appearance',
   'support',
   'about',
+  'terms',
+  'partner-terms',
+  'licenses',
+  'notifications',
 ];
 
 const SETTINGS_VIEWS: readonly MenuView[] = [
@@ -52,6 +57,10 @@ const SETTINGS_VIEWS: readonly MenuView[] = [
   'appearance',
   'support',
   'about',
+  'terms',
+  'partner-terms',
+  'licenses',
+  'notifications',
 ];
 
 /** Compõe as telas de vários domínios (perfil, ingressos, reservas, compras, favoritos, avaliações, conteúdo) no menu. */
@@ -69,7 +78,9 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
   // Papel vem da sessão (claims + perfil), a mesma fonte que o AppRouter usa para abrir os painéis.
   const isPartner = user?.role === UserRole.PARTNER;
   const isAdmin = user?.role === UserRole.ADMIN;
-  const view = visibleMenuView(requestedView ?? 'main', Boolean(user));
+  const visibleView = visibleMenuView(requestedView ?? 'main', Boolean(user));
+  // Notificações só existem para parceiros; outra conta que abrir o link vê Configurações.
+  const view = visibleView === 'notifications' && !isPartner ? 'settings' : visibleView;
   const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
 
   const showView = (target: MenuView) => openMenu(target);
@@ -156,8 +167,11 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
             onOpenAbout={() => showView('about')}
             onOpenPurchases={user ? () => showView('purchases') : undefined}
             onOpenUsername={user ? () => showView('username') : undefined}
+            onOpenNotifications={isPartner ? () => showView('notifications') : undefined}
           />
         );
+      case 'notifications':
+        return user ? <NotificationSettingsView partnerId={user.uid} onBack={goBack} /> : null;
       case 'username':
         return <UsernameSettingsView onBack={goBack} />;
       case 'purchases':
@@ -182,7 +196,20 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
           />
         );
       case 'about':
-        return <AboutView onBack={goBack} />;
+        return (
+          <AboutView
+            onBack={goBack}
+            onOpenTerms={() => showView('terms')}
+            onOpenPartnerTerms={() => showView('partner-terms')}
+            onOpenLicenses={() => showView('licenses')}
+          />
+        );
+      case 'terms':
+        return <AboutTermsView document="terms" onBack={goBack} />;
+      case 'partner-terms':
+        return <AboutTermsView document="partner" onBack={goBack} />;
+      case 'licenses':
+        return <AboutLicensesView onBack={goBack} />;
       case 'support':
         return <SupportView onBack={goBack} userEmail={user?.email} />;
       case 'tickets':

=== src/app/menu/menuViews.test.ts — diff ===
@@ -27,6 +27,10 @@ describe('sub-telas do menu', () => {
     expect(parentMenuView('purchases')).toBe('settings');
     expect(parentMenuView('support')).toBe('settings');
     expect(parentMenuView('about')).toBe('settings');
+    expect(parentMenuView('terms')).toBe('about');
+    expect(parentMenuView('partner-terms')).toBe('about');
+    expect(parentMenuView('licenses')).toBe('about');
+    expect(parentMenuView('notifications')).toBe('settings');
     expect(parentMenuView('reviews')).toBe('main');
     expect(parentMenuView('password')).toBe('account');
     expect(parentMenuView('favorites')).toBe('main');

=== src/app/menu/menuViews.ts — diff ===
@@ -17,6 +17,10 @@ export const MENU_VIEWS = [
   'appearance',
   'support',
   'about',
+  'terms',
+  'partner-terms',
+  'licenses',
+  'notifications',
 ] as const;
 export type MenuView = (typeof MENU_VIEWS)[number];
 
@@ -37,6 +41,10 @@ const PARENT_VIEW: Record<Exclude<MenuView, 'main'>, MenuView> = {
   appearance: 'settings',
   support: 'settings',
   about: 'settings',
+  terms: 'about',
+  'partner-terms': 'about',
+  licenses: 'about',
+  notifications: 'settings',
 };
 
 /** Sub-telas com dados do próprio usuário: sem login, o menu mostra a tela principal (com o login). */
@@ -49,6 +57,7 @@ const PRIVATE_VIEWS: readonly MenuView[] = [
   'reviews',
   'purchases',
   'username',
+  'notifications',
 ];
 
 function isMenuView(value: string): value is MenuView {

=== src/domain/content/adapters/apiContentAdapter.ts — APAGUE este arquivo ===

=== src/domain/content/application/usecases/getAppVersionUseCase.ts — APAGUE este arquivo ===

=== src/domain/content/components/AboutView.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import pkg from '../../../../package.json';
import { i18n } from '../../../shared/i18n';
import { AboutView } from './AboutView';

describe('AboutView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra só a versão do package.json e abre termos, termos do parceiro e licenças', () => {
    const handlers = { onTerms: vi.fn(), onPartner: vi.fn(), onLicenses: vi.fn() };
    render(
      <AboutView
        onBack={() => undefined}
        onOpenTerms={handlers.onTerms}
        onOpenPartnerTerms={handlers.onPartner}
        onOpenLicenses={handlers.onLicenses}
      />
    );
    expect(screen.getByText(`Versão ${pkg.version}`)).toBeTruthy();
    expect(screen.queryByText(/build/)).toBeNull();
    const rows = screen.getAllByRole('button').map((button) => button.textContent);
    expect(rows.slice(-3)).toEqual([
      'Termos e políticas',
      'Termos do parceiro',
      'Licenças e créditos',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Termos do parceiro' }));
    expect(handlers.onPartner).toHaveBeenCalled();
    expect(
      screen.getByText(`© ${new Date().getFullYear()} Use Guide. Todos os direitos reservados.`)
    ).toBeTruthy();
  });
});

=== src/domain/content/components/AboutView.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ChevronRight, Code, type LucideIcon, ScrollText, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../../../shared/constants/appVersion';
import { BackButton } from '../../../ui/components/BackButton';

interface AboutViewProps {
  onBack: () => void;
  onOpenTerms: () => void;
  onOpenPartnerTerms: () => void;
  onOpenLicenses: () => void;
}

function AboutRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full min-h-14 px-4 flex items-center gap-3 text-left hover:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        <Icon size={20} className="text-ink/80 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-[15px] font-semibold text-ink">{label}</span>
        <ChevronRight size={18} className="text-ink/40 shrink-0" aria-hidden="true" />
      </button>
    </li>
  );
}

/** Configurações › Sobre o app: versão, o que o app faz, termos e licenças (uma tela, sem abas). */
export function AboutView({
  onBack,
  onOpenTerms,
  onOpenPartnerTerms,
  onOpenLicenses,
}: AboutViewProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('appAbout.title')}</h2>
      </div>

      <div className="shrink-0 flex flex-col items-center text-center gap-2 mb-6">
        <img
          src="/pwa-192x192.png"
          alt="Use Guide"
          width={72}
          height={72}
          className="w-[72px] h-[72px] rounded-[20px] shadow-sm"
        />
        <p className="text-[13px] text-ink/70 tabular-nums">
          {t('appAbout.version', { version: APP_VERSION })}
        </p>
      </div>

      <p className="shrink-0 mb-4 px-4 py-3 rounded-[20px] bg-surface border border-line text-[15px] text-ink/80 leading-relaxed">
        {t('appAbout.description')}
      </p>

      <ul className="shrink-0 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
        <AboutRow icon={ScrollText} label={t('appAbout.terms')} onClick={onOpenTerms} />
        <AboutRow icon={Store} label={t('legal.partner.title')} onClick={onOpenPartnerTerms} />
        <AboutRow icon={Code} label={t('appAbout.licenses')} onClick={onOpenLicenses} />
      </ul>

      <p className="mt-auto pt-8 text-center text-[12px] text-ink/70">
        {t('appAbout.rights', { year: new Date().getFullYear() })}
      </p>
    </div>
  );
}

=== src/domain/content/components/about/AboutGeneralTab.tsx — APAGUE este arquivo ===

=== src/domain/content/components/about/AboutLicensesTab.tsx — APAGUE este arquivo ===

=== src/domain/content/components/about/AboutLicensesView.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { AboutLicensesView } from './AboutLicensesView';

describe('AboutLicensesView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra o crédito da animação e as bibliotecas, com o texto da licença ao abrir', async () => {
    render(<AboutLicensesView onBack={() => undefined} />);
    const credit = screen.getByRole('button', { name: /Animação do hamster/ });
    expect(screen.getByText('por Nawsome · Uiverse.io')).toBeTruthy();
    fireEvent.click(credit);
    expect(credit.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/Copyright \(c\) Nawsome/)).toBeTruthy();

    expect(await screen.findByRole('button', { name: /^react, \d/ })).toBeTruthy();
    expect(screen.getByText(/Bibliotecas de código aberto \(\d+\)/)).toBeTruthy();
  });
});

=== src/domain/content/components/about/AboutLicensesView.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { TextButton } from '../../../../ui/components/TextButton';
import { CREDITS } from '../../data/credits';
import { useOpenSourceLicenses } from '../../hooks/useOpenSourceLicenses';
import { LicenseEntry } from './LicenseEntry';

const SECTION_TITLE = 'px-1 mb-2 text-[13px] font-semibold text-ink/70';
const LIST = 'shrink-0 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden';

/** Sobre o app › Licenças e créditos: autoria de trabalhos de terceiros e licenças das bibliotecas. */
export function AboutLicensesView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { licenses, loading, error, reload } = useOpenSourceLicenses();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">
          {t('appAbout.licensesTitle')}
        </h2>
      </div>
      <p className="mb-5 px-1 text-[13px] text-ink/70">{t('appAbout.licensesIntro')}</p>

      <h3 className={SECTION_TITLE}>{t('appAbout.credits')}</h3>
      <ul className={`${LIST} mb-6`}>
        {CREDITS.map((credit) => (
          <LicenseEntry
            key={credit.id}
            title={t(credit.workKey)}
            subtitle={t('appAbout.creditBy', { author: credit.author, source: credit.source })}
            license={credit.license}
            url={credit.url}
            text={credit.text}
          />
        ))}
      </ul>

      <h3 className={SECTION_TITLE}>
        {t('appAbout.libraries')}
        {licenses && ` (${licenses.length})`}
      </h3>
      {loading ? (
        <div className="h-56 rounded-[20px] bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
      ) : error || !licenses ? (
        <div className="flex items-center justify-between gap-2 px-1 text-[13px] text-ink/70">
          <span role="alert">{t('appAbout.loadError')}</span>
          <TextButton tone="accent" onClick={() => void reload()}>
            {t('appAbout.retry')}
          </TextButton>
        </div>
      ) : (
        <ul className={LIST}>
          {licenses.map((library) => (
            <LicenseEntry
              key={library.name}
              title={library.name}
              subtitle={[library.version, library.author].filter(Boolean).join(' · ')}
              license={library.license}
              url={library.url}
              text={library.text}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

=== src/domain/content/components/about/AboutTermsTab.tsx — APAGUE este arquivo ===

=== src/domain/content/components/about/AboutTermsView.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { type LegalSectionKey, LegalTermsDocument } from '../../../../ui/legal/LegalTermsDocument';

const DOCUMENTS = {
  // Uso, compras e cancelamento e privacidade: valem para todo mundo.
  terms: { titleKey: 'appAbout.terms', sections: ['use', 'purchases', 'privacy'] },
  partner: { titleKey: 'legal.partner.title', sections: ['partner'] },
} satisfies Record<string, { titleKey: string; sections: LegalSectionKey[] }>;

/** Sobre o app › Termos e políticas ou Termos do parceiro (D15). */
export function AboutTermsView({
  document,
  onBack,
}: {
  document: keyof typeof DOCUMENTS;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const { titleKey, sections } = DOCUMENTS[document];
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t(titleKey)}</h2>
      </div>
      <div className="shrink-0 p-4 rounded-[20px] bg-surface border border-line">
        {/* Com um documento só, o título da tela já basta. */}
        <LegalTermsDocument sections={sections} showSectionTitles={sections.length > 1} />
      </div>
    </div>
  );
}

=== src/domain/content/components/about/LicenseEntry.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ChevronDown, ExternalLink } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';

interface LicenseEntryProps {
  title: string;
  subtitle: string;
  license: string;
  url: string;
  text: string;
}

// Os arquivos de licença quebram linha a cada ~80 colunas; na tela estreita, cada parágrafo flui.
function reflow(text: string): string {
  return text.replace(/([^\n])\n(?=[^\n\s])/g, '$1 ');
}

/** Uma linha de Licenças e créditos: abre o texto completo da licença e o link do projeto. */
export function LicenseEntry({ title, subtitle, license, url, text }: LicenseEntryProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${title}, ${subtitle}, ${license}`}
        onClick={() => setOpen((value) => !value)}
        className="w-full min-h-14 px-4 py-2.5 flex items-center gap-3 text-left hover:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        <span className="flex-1 min-w-0">
          <span className="block text-[15px] font-semibold text-ink break-words">{title}</span>
          <span className="block text-[13px] text-ink/70 break-words">{subtitle}</span>
        </span>
        <span className="shrink-0 px-2 py-0.5 rounded-full bg-ink/[0.06] text-[12px] font-semibold text-ink/80">
          {license}
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={cn(
            'shrink-0 text-ink/40 transition-transform motion-reduce:transition-none',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div id={panelId} className="px-4 pb-4 space-y-2">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-11 text-[13px] font-semibold text-accent focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-lg"
            >
              {t('appAbout.project')}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
          <p className="max-h-72 overflow-auto p-3 rounded-xl bg-ink/[0.04] text-[12px] leading-relaxed text-ink/80 whitespace-pre-line break-words">
            {reflow(text)}
          </p>
        </div>
      )}
    </li>
  );
}

=== src/domain/content/data/credits.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ThirdPartyCredit } from '../types/content';

/** Autoria de trabalhos de terceiros usados no app, como pede a licença de cada um. */
export const CREDITS: ThirdPartyCredit[] = [
  {
    id: 'hamster',
    workKey: 'appAbout.hamsterWork',
    author: 'Nawsome',
    source: 'Uiverse.io',
    url: 'https://uiverse.io',
    license: 'MIT',
    text: `MIT License

Copyright (c) Nawsome (Uiverse.io)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
];

=== src/domain/content/data/licenses.generated.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import licenses from './licenses.generated.json';

const root = path.resolve(__dirname, '../../../..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>;
};

describe('licenças das bibliotecas', () => {
  it('cobre toda dependência de produção, na versão instalada, com o texto da licença', () => {
    const byName = new Map(licenses.map((entry) => [entry.name, entry]));
    for (const name of Object.keys(pkg.dependencies)) {
      const installed = JSON.parse(
        readFileSync(path.join(root, 'node_modules', name, 'package.json'), 'utf8')
      ) as { version: string };
      const entry = byName.get(name);
      // Falhou? Rode `npm run licenses` depois de mudar dependências.
      expect(entry, name).toBeDefined();
      expect(entry?.version, name).toBe(installed.version);
      expect(entry?.license, name).not.toBe('');
      expect(entry?.text.length, name).toBeGreaterThan(200);
    }
    expect(licenses).toHaveLength(Object.keys(pkg.dependencies).length);
  });
});

=== src/domain/content/data/licenses.ts — APAGUE este arquivo ===

=== src/domain/content/factory.ts — APAGUE este arquivo ===

=== src/domain/content/hooks/useAppVersion.ts — APAGUE este arquivo ===

=== src/domain/content/hooks/useOpenSourceLicenses.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import type { OpenSourceLicense } from '../types/content';

/** Licenças das bibliotecas, carregadas só quando a tela abre (o arquivo tem os textos completos). */
export function useOpenSourceLicenses() {
  const [licenses, setLicenses] = useState<OpenSourceLicense[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const module = await import('../data/licenses.generated.json');
      setLicenses(module.default as OpenSourceLicense[]);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { licenses, loading: !licenses && !error, error, reload: load };
}

=== src/domain/content/index.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
export { AboutView } from './components/AboutView';
export { AboutLicensesView } from './components/about/AboutLicensesView';
export { AboutTermsView } from './components/about/AboutTermsView';
export { SupportView } from './components/SupportView';

=== src/domain/content/ports/contentPort.ts — APAGUE este arquivo ===

=== src/domain/content/types/content.ts — diff ===
@@ -1,11 +1,25 @@
 import React from 'react';
 
-export interface LicenseItem {
+/** Biblioteca de produção com o texto da licença (gerado por `npm run licenses`). */
+export interface OpenSourceLicense {
   name: string;
   version: string;
   license: string;
-  copyright: string;
-  description: string;
+  author: string;
+  url: string;
+  text: string;
+}
+
+/** Trabalho de terceiros usado no app (ilustração, animação), com a autoria exigida pela licença. */
+export interface ThirdPartyCredit {
+  id: string;
+  /** Chave de tradução do que é o trabalho. */
+  workKey: string;
+  author: string;
+  source: string;
+  url: string;
+  license: string;
+  text: string;
 }
 
 export type FAQCategoryType = 'all' | 'general' | 'kitesurf' | 'account' | 'partner';

=== src/domain/notifications/components/NotificationSettingsView.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';

vi.mock('../application/usecases/getNotificationSettingsUseCase', () => ({
  getNotificationSettingsUseCase: vi.fn(),
}));
vi.mock('../application/usecases/updateNotificationSettingsUseCase', () => ({
  updateNotificationSettingsUseCase: vi.fn(),
}));

import { getNotificationSettingsUseCase } from '../application/usecases/getNotificationSettingsUseCase';
import { updateNotificationSettingsUseCase } from '../application/usecases/updateNotificationSettingsUseCase';
import { NotificationSettingsView } from './NotificationSettingsView';

describe('NotificationSettingsView', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
    vi.mocked(getNotificationSettingsUseCase).mockResolvedValue({
      partnerId: 'p1',
      reviewNotifications: true,
      planExpiringNotifications: false,
    });
  });

  it('mostra cada aviso com o estado salvo e salva ao tocar', async () => {
    vi.mocked(updateNotificationSettingsUseCase).mockResolvedValue(undefined as never);
    render(<NotificationSettingsView partnerId="p1" onBack={() => undefined} />);
    const reviews = await screen.findByRole('switch', { name: 'Avaliações recebidas' });
    const plan = screen.getByRole('switch', { name: 'Vencimento do plano' });
    expect(reviews.getAttribute('aria-checked')).toBe('true');
    expect(plan.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(plan);
    expect(plan.getAttribute('aria-checked')).toBe('true');
    expect(updateNotificationSettingsUseCase).toHaveBeenCalledWith('p1', {
      planExpiringNotifications: true,
    });
  });

  it('desfaz e avisa quando o servidor recusa', async () => {
    vi.mocked(updateNotificationSettingsUseCase).mockRejectedValue(new Error('fail'));
    render(<NotificationSettingsView partnerId="p1" onBack={() => undefined} />);
    const reviews = await screen.findByRole('switch', { name: 'Avaliações recebidas' });
    fireEvent.click(reviews);
    expect(await screen.findByText('Não foi possível salvar. Tente de novo.')).toBeTruthy();
    await waitFor(() => expect(reviews.getAttribute('aria-checked')).toBe('true'));
  });

  it('erro ao carregar oferece tentar de novo', async () => {
    vi.mocked(getNotificationSettingsUseCase).mockRejectedValueOnce(new Error('fail'));
    render(<NotificationSettingsView partnerId="p1" onBack={() => undefined} />);
    expect(await screen.findByText('Não foi possível carregar suas notificações.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('switch', { name: 'Avaliações recebidas' })).toBeTruthy();
  });
});

=== src/domain/notifications/components/NotificationSettingsView.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../ui/components/BackButton';
import { StatusText } from '../../../ui/components/StatusText';
import { Switch } from '../../../ui/components/Switch';
import { TextButton } from '../../../ui/components/TextButton';
import {
  type NotificationSettingKey,
  useNotificationSettings,
} from '../hooks/useNotificationSettings';

const OPTIONS: Array<{ key: NotificationSettingKey; label: string; hint: string }> = [
  {
    key: 'reviewNotifications',
    label: 'appAbout.notifications.reviews',
    hint: 'appAbout.notifications.reviewsHint',
  },
  {
    key: 'planExpiringNotifications',
    label: 'appAbout.notifications.plan',
    hint: 'appAbout.notifications.planHint',
  },
];

/** Configurações › Notificações do parceiro (antes ficavam em Sobre o app). */
export function NotificationSettingsView({
  partnerId,
  onBack,
}: {
  partnerId: string;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const baseId = useId();
  const { settings, loading, error, saveError, reload, updateSetting } =
    useNotificationSettings(partnerId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">
          {t('appAbout.notifications.title')}
        </h2>
      </div>
      <p className="mb-5 px-1 text-[13px] text-ink/70">{t('appAbout.notifications.intro')}</p>

      {loading ? (
        <div className="h-36 rounded-[20px] bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
      ) : error || !settings ? (
        <div className="flex items-center justify-between gap-2 px-1 text-[13px] text-ink/70">
          <span role="alert">{t('appAbout.notifications.loadError')}</span>
          <TextButton tone="accent" onClick={() => void reload()}>
            {t('appAbout.retry')}
          </TextButton>
        </div>
      ) : (
        <>
          <ul className="shrink-0 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
            {OPTIONS.map((option) => {
              const labelId = `${baseId}-${option.key}`;
              const hintId = `${labelId}-hint`;
              return (
                <li key={option.key} className="flex items-center gap-3 pl-4 pr-2 py-3">
                  <div className="flex-1 min-w-0">
                    <p id={labelId} className="text-[15px] font-semibold text-ink">
                      {t(option.label)}
                    </p>
                    <p id={hintId} className="text-[13px] text-ink/70">
                      {t(option.hint)}
                    </p>
                  </div>
                  <Switch
                    checked={settings[option.key]}
                    onChange={(value) => void updateSetting(option.key, value)}
                    labelledBy={labelId}
                    describedBy={hintId}
                  />
                </li>
              );
            })}
          </ul>
          {saveError && (
            <p role="alert" className="mt-3 px-1">
              <StatusText tone="danger">{t('appAbout.notifications.saveError')}</StatusText>
            </p>
          )}
        </>
      )}
    </div>
  );
}

=== src/domain/notifications/hooks/useNotificationSettings.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useCallback, useEffect, useState } from 'react';
import { getNotificationSettingsUseCase } from '../application/usecases/getNotificationSettingsUseCase';
import { updateNotificationSettingsUseCase } from '../application/usecases/updateNotificationSettingsUseCase';
import type { NotificationSettings } from '../types/notification';

export type NotificationSettingKey = 'reviewNotifications' | 'planExpiringNotifications';

/** Preferências de notificação do parceiro: carrega, salva na hora e desfaz se o servidor recusar. */
export function useNotificationSettings(partnerId: string | undefined) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const load = useCallback(async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      setSettings(await getNotificationSettingsUseCase(partnerId));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateSetting = useCallback(
    async (key: NotificationSettingKey, value: boolean) => {
      if (!partnerId) return;
      setSaveError(false);
      setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
      try {
        await updateNotificationSettingsUseCase(partnerId, { [key]: value });
      } catch {
        setSettings((prev) => (prev ? { ...prev, [key]: !value } : prev));
        setSaveError(true);
      }
    },
    [partnerId]
  );

  return { settings, loading, error, saveError, reload: load, updateSetting };
}

=== src/domain/notifications/index.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
// Contratos e tipos públicos do domínio de Notificações

export { getNotificationSettingsUseCase } from './application/usecases/getNotificationSettingsUseCase';
export { markAllNotificationsAsReadUseCase } from './application/usecases/markAllNotificationsAsReadUseCase';
export { markNotificationAsReadUseCase } from './application/usecases/markNotificationAsReadUseCase';
export { sendAdminNotificationUseCase } from './application/usecases/sendAdminNotificationUseCase';
// Use Cases públicos do domínio de Notificações
export { subscribeToNotificationsUseCase } from './application/usecases/subscribeToNotificationsUseCase';
export { updateNotificationSettingsUseCase } from './application/usecases/updateNotificationSettingsUseCase';
// Componentes públicos do domínio de Notificações
export { NotificationBell } from './components/NotificationBell';
export { NotificationPanel } from './components/NotificationPanel';
// Público só para src/app (menu lateral › Configurações).
export { NotificationSettingsView } from './components/NotificationSettingsView';
export { useNotificationSettings } from './hooks/useNotificationSettings';
// Hooks públicos do domínio de Notificações
export { useNotifications } from './hooks/useNotifications';
export type { Notification, NotificationSettings } from './types/notification';

=== src/domain/user/components/SettingsView.tsx — diff ===
@@ -1,5 +1,6 @@
 import {
   AtSign,
+  Bell,
   ChevronRight,
   HelpCircle,
   Info,
@@ -25,6 +26,8 @@ interface SettingsViewProps {
   onOpenPurchases?: () => void;
   /** Só com login: o @ que outras pessoas usam para transferir ingressos (D21). */
   onOpenUsername?: () => void;
+  /** Só para parceiros: avisos do painel (avaliações, vencimento do plano). */
+  onOpenNotifications?: () => void;
 }
 
 function SettingsRow({
@@ -62,6 +65,7 @@ export function SettingsView({
   onOpenAbout,
   onOpenPurchases,
   onOpenUsername,
+  onOpenNotifications,
 }: SettingsViewProps) {
   const { t } = useTranslation();
   const { theme } = useTheme();
@@ -87,6 +91,13 @@ export function SettingsView({
             onClick={onOpenPurchases}
           />
         )}
+        {onOpenNotifications && (
+          <SettingsRow
+            icon={Bell}
+            label={t('appAbout.notifications.title')}
+            onClick={onOpenNotifications}
+          />
+        )}
         <SettingsRow
           icon={ThemeIcon}
           label={t('settings.appearance')}

=== src/shared/constants/appVersion.ts — ARQUIVO NOVO, conteúdo completo ===
declare const __APP_VERSION__: string;

/** Versão do app, do campo `version` do package.json (alterado a cada lançamento), gravada no build. */
export const APP_VERSION = __APP_VERSION__;

=== src/shared/i18n/appAboutResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos de Sobre o app, Licenças e créditos e Notificações (Configurações). pt-BR é a fonte. */
export interface AppAboutTranslation {
  title: string;
  version: string;
  description: string;
  terms: string;
  licenses: string;
  rights: string;
  licensesTitle: string;
  licensesIntro: string;
  credits: string;
  hamsterWork: string;
  creditBy: string;
  libraries: string;
  project: string;
  loadError: string;
  retry: string;
  notifications: {
    title: string;
    intro: string;
    reviews: string;
    reviewsHint: string;
    plan: string;
    planHint: string;
    loadError: string;
    saveError: string;
  };
}

export const appAboutPtBR: AppAboutTranslation = {
  title: 'Sobre o app',
  version: 'Versão {{version}}',
  description:
    'O Use Guide é um guia de viagem com hospedagens, restaurantes, passeios, atrações, eventos e dicas, além da previsão de vento e clima. Pelo app, você compra ingressos e reserva passeios, aluguéis e traslados com pagamento seguro. Estabelecimentos e organizadores divulgam e vendem seus serviços pela plataforma.',
  terms: 'Termos e políticas',
  licenses: 'Licenças e créditos',
  rights: '© {{year}} Use Guide. Todos os direitos reservados.',
  licensesTitle: 'Licenças e créditos',
  licensesIntro:
    'O Use Guide usa projetos de código aberto e trabalhos de outros autores. Agradecemos a quem os criou.',
  credits: 'Créditos',
  hamsterWork: 'Animação do hamster na página não encontrada',
  creditBy: 'por {{author}} · {{source}}',
  libraries: 'Bibliotecas de código aberto',
  project: 'Página do projeto',
  loadError: 'Não foi possível carregar as licenças.',
  retry: 'Tentar de novo',
  notifications: {
    title: 'Notificações',
    intro: 'Escolha os avisos que aparecem no seu painel de parceiro.',
    reviews: 'Avaliações recebidas',
    reviewsHint: 'Quando alguém avaliar um item ou evento seu.',
    plan: 'Vencimento do plano',
    planHint: 'Quando o plano de um estabelecimento estiver perto de vencer.',
    loadError: 'Não foi possível carregar suas notificações.',
    saveError: 'Não foi possível salvar. Tente de novo.',
  },
};

export const appAboutEn: AppAboutTranslation = {
  title: 'About the app',
  version: 'Version {{version}}',
  description:
    'Use Guide is a travel guide with stays, restaurants, tours, attractions, events and tips, plus wind and weather forecasts. In the app, you can buy tickets and book tours, rentals and transfers with secure payment. Businesses and organizers promote and sell their services on the platform.',
  terms: 'Terms and policies',
  licenses: 'Licenses and credits',
  rights: '© {{year}} Use Guide. All rights reserved.',
  licensesTitle: 'Licenses and credits',
  licensesIntro:
    'Use Guide relies on open source projects and work by other authors. Thank you to everyone who made them.',
  credits: 'Credits',
  hamsterWork: 'Hamster animation on the page not found',
  creditBy: 'by {{author}} · {{source}}',
  libraries: 'Open source libraries',
  project: 'Project page',
  loadError: 'We couldn’t load the licenses.',
  retry: 'Try again',
  notifications: {
    title: 'Notifications',
    intro: 'Choose the alerts that show up in your partner panel.',
    reviews: 'Reviews received',
    reviewsHint: 'When someone reviews one of your items or events.',
    plan: 'Plan expiring',
    planHint: 'When a business plan is about to expire.',
    loadError: 'We couldn’t load your notifications.',
    saveError: 'We couldn’t save. Try again.',
  },
};

export const appAboutFr: AppAboutTranslation = {
  title: 'À propos de l’app',
  version: 'Version {{version}}',
  description:
    'Use Guide est un guide de voyage avec hébergements, restaurants, excursions, attractions, événements et conseils, ainsi que les prévisions de vent et de météo. Dans l’app, vous achetez des billets et réservez excursions, locations et transferts avec un paiement sécurisé. Établissements et organisateurs y présentent et vendent leurs services.',
  terms: 'Conditions et politiques',
  licenses: 'Licences et crédits',
  rights: '© {{year}} Use Guide. Tous droits réservés.',
  licensesTitle: 'Licences et crédits',
  licensesIntro:
    'Use Guide s’appuie sur des projets open source et le travail d’autres auteurs. Merci à celles et ceux qui les ont créés.',
  credits: 'Crédits',
  hamsterWork: 'Animation du hamster de la page introuvable',
  creditBy: 'par {{author}} · {{source}}',
  libraries: 'Bibliothèques open source',
  project: 'Page du projet',
  loadError: 'Impossible de charger les licences.',
  retry: 'Réessayer',
  notifications: {
    title: 'Notifications',
    intro: 'Choisissez les alertes affichées dans votre espace partenaire.',
    reviews: 'Avis reçus',
    reviewsHint: 'Quand quelqu’un évalue l’un de vos éléments ou événements.',
    plan: 'Expiration de l’abonnement',
    planHint: 'Quand l’abonnement d’un établissement arrive bientôt à échéance.',
    loadError: 'Impossible de charger vos notifications.',
    saveError: 'Impossible d’enregistrer. Réessayez.',
  },
};

=== src/shared/i18n/resources.ts — diff ===
@@ -10,18 +10,36 @@ import {
   adminPanelFr,
   adminPanelPtBR,
 } from './adminPanelResources';
+import {
+  type AppAboutTranslation,
+  appAboutEn,
+  appAboutFr,
+  appAboutPtBR,
+} from './appAboutResources';
 import {
   type BookingsTranslation,
   bookingsEn,
   bookingsFr,
   bookingsPtBR,
 } from './bookingsResources';
+import {
+  type EmailVerificationTranslation,
+  emailVerificationEn,
+  emailVerificationFr,
+  emailVerificationPtBR,
+} from './emailVerificationResources';
 import {
   type EventSessionsTranslation,
   eventSessionsEn,
   eventSessionsFr,
   eventSessionsPtBR,
 } from './eventSessionsResources';
+import {
+  type GateModeTranslation,
+  gateModeEn,
+  gateModeFr,
+  gateModePtBR,
+} from './gateModeResources';
 import {
   type InsightsTranslation,
   insightsEn,
@@ -123,24 +141,12 @@ import {
   usernameFr,
   usernamePtBR,
 } from './usernameResources';
-import {
-  type GateModeTranslation,
-  gateModeEn,
-  gateModeFr,
-  gateModePtBR,
-} from './gateModeResources';
 import {
   type VerificationTranslation,
   verificationEn,
   verificationFr,
   verificationPtBR,
 } from './verificationResources';
-import {
-  type EmailVerificationTranslation,
-  emailVerificationEn,
-  emailVerificationFr,
-  emailVerificationPtBR,
-} from './emailVerificationResources';
 
 export interface TranslationResource {
   bookings: BookingsTranslation;
@@ -163,6 +169,7 @@ export interface TranslationResource {
   ticketWallet: TicketWalletTranslation;
   ticketGate: TicketGateTranslation;
   username: UsernameTranslation;
+  appAbout: AppAboutTranslation;
   eventSessions: EventSessionsTranslation;
   gateMode: GateModeTranslation;
   legal: LegalTranslation;
@@ -400,6 +407,7 @@ const ptBR: TranslationResource = {
   ticketWallet: ticketWalletPtBR,
   ticketGate: ticketGatePtBR,
   username: usernamePtBR,
+  appAbout: appAboutPtBR,
   eventSessions: eventSessionsPtBR,
   gateMode: gateModePtBR,
   legal: legalPtBR,
@@ -697,6 +705,7 @@ const en: TranslationResource = {
   ticketWallet: ticketWalletEn,
   ticketGate: ticketGateEn,
   username: usernameEn,
+  appAbout: appAboutEn,
   eventSessions: eventSessionsEn,
   gateMode: gateModeEn,
   legal: legalEn,
@@ -988,6 +997,7 @@ const fr: TranslationResource = {
   ticketWallet: ticketWalletFr,
   ticketGate: ticketGateFr,
   username: usernameFr,
+  appAbout: appAboutFr,
   eventSessions: eventSessionsFr,
   gateMode: gateModeFr,
   legal: legalFr,

=== src/ui/components/Switch.tsx — ARQUIVO NOVO, conteúdo completo ===
import { cn } from '../../shared/utils/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Id do texto que descreve o interruptor (aria-labelledby). */
  labelledBy: string;
  describedBy?: string;
  disabled?: boolean;
}

/** Interruptor liga/desliga: área de toque de 48×44 px, cores do tema e foco visível. */
export function Switch({ checked, onChange, labelledBy, describedBy, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="press shrink-0 w-12 min-h-11 flex items-center justify-center rounded-full disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
    >
      <span
        aria-hidden="true"
        className={cn(
          'w-11 h-[26px] rounded-full p-[3px] flex items-center transition-colors duration-200',
          checked ? 'bg-teal-500' : 'bg-ink/20'
        )}
      >
        <span
          className={cn(
            'w-5 h-5 rounded-full bg-[#ffffff] shadow-sm transition-transform duration-200 motion-reduce:transition-none',
            checked ? 'translate-x-[18px]' : 'translate-x-0'
          )}
        />
      </span>
    </button>
  );
}

=== src/ui/legal/LegalTermsDocument.tsx — diff ===
@@ -20,6 +20,8 @@ interface LegalTermsDocumentProps {
   /** Taxas vigentes vindas do backend; sem elas, o texto aponta para o painel de recebimentos. */
   fees?: PlatformFeesView | null;
   version?: string;
+  /** false quando a tela já mostra o título (um documento só, em Sobre o app). */
+  showSectionTitles?: boolean;
 }
 
 const FAMILIES: CancellationPolicyFamily[] = ['event', 'booking', 'transfer'];
@@ -31,6 +33,7 @@ export function LegalTermsDocument({
   focusSection,
   fees,
   version = BUYER_TERMS_VERSION,
+  showSectionTitles = true,
 }: LegalTermsDocumentProps) {
   const { t, i18n } = useTranslation();
   const focusRef = useRef<HTMLElement | null>(null);
@@ -63,7 +66,10 @@ export function LegalTermsDocument({
           aria-labelledby={`legal-${key}-title`}
           className="space-y-2 scroll-mt-4"
         >
-          <h3 id={`legal-${key}-title`} className="text-base font-bold text-ink">
+          <h3
+            id={`legal-${key}-title`}
+            className={showSectionTitles ? 'text-base font-bold text-ink' : 'sr-only'}
+          >
             {t(`legal.${key}.title`)}
           </h3>
           {key === 'partner' && (

=== vite.config.ts — diff ===
@@ -4,12 +4,15 @@ import path from 'path';
 import { fileURLToPath } from 'url';
 import { defineConfig } from 'vite';
 import { VitePWA } from 'vite-plugin-pwa';
+import pkg from './package.json';
 
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);
 
 export default defineConfig(() => {
   return {
+    // Versão do app (package.json, alterada à mão a cada lançamento) gravada no build.
+    define: { __APP_VERSION__: JSON.stringify(pkg.version) },
     plugins: [
       react(),
       tailwindcss(),
@@ -109,7 +112,8 @@ export default defineConfig(() => {
               },
             },
             {
-              urlPattern: /^https:\/\/(images\.unsplash\.com|firebasestorage\.googleapis\.com)\/.*/i,
+              urlPattern:
+                /^https:\/\/(images\.unsplash\.com|firebasestorage\.googleapis\.com)\/.*/i,
               handler: 'StaleWhileRevalidate',
               options: {
                 cacheName: 'external-images-cache',

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server.ts src/app/menu/SideMenu.tsx src/app/menu/menuViews.test.ts src/app/menu/menuViews.ts src/domain/content/components/AboutView.test.tsx src/domain/content/components/AboutView.tsx src/domain/content/components/about/AboutLicensesView.test.tsx src/domain/content/components/about/AboutLicensesView.tsx src/domain/content/components/about/AboutTermsView.tsx src/domain/content/components/about/LicenseEntry.tsx src/domain/content/data/credits.ts src/domain/content/data/licenses.generated.test.ts src/domain/content/hooks/useOpenSourceLicenses.ts src/domain/content/index.ts src/domain/content/types/content.ts src/domain/notifications/components/NotificationSettingsView.test.tsx src/domain/notifications/components/NotificationSettingsView.tsx src/domain/notifications/hooks/useNotificationSettings.ts src/domain/notifications/index.ts src/domain/user/components/SettingsView.tsx src/shared/constants/appVersion.ts src/shared/i18n/appAboutResources.ts src/shared/i18n/resources.ts src/ui/components/Switch.tsx src/ui/legal/LegalTermsDocument.tsx vite.config.ts` (todos verdes). Não precisa rodar a suíte inteira.
- ANTES dos testes: rode `npm run licenses` para gerar src/domain/content/data/licenses.generated.json (o arquivo não vem no diff por ser grande; o script novo scripts/generate-licenses.mjs o cria a partir de node_modules).

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique uma revisão nova do Cloud Run (`use-guide`, `us-east1`) e o Hosting com o mesmo código.
