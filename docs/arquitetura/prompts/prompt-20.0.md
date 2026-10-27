# Prompt 20.0 — Base visual: fundo grafite liso e cartões sólidos (D17)

> Lote 17, gerado do commit de referência `99b8e30` da branch `claude/agents-md-v2`. Aplique depois do A6. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 20.0 — Base visual: fundo grafite liso e cartões sólidos (D17)

Primeira parte do visual novo (D17, AGENTS.md §11.1). Prints aprovados em 2026-10-27.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e os apagados. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

O QUE MUDA (o app inteiro, sem reorganizar telas):
1) src/index.css: tokens do tema escuro — fundo --ug-app #0d0e10, cartão --ug-surface #1e2024 (sólido), linha 8%. O body usa bg-app. A classe .glassmorphism vira cartão sólido (sem desfoque); o vidro fica só em .glassmorphism-vibrant (barras fixas e folhas).
2) Sai o BackgroundBlobs (gradiente azul e linhas de mapa): o arquivo é apagado e o AppRouter, o painel admin e o portal do parceiro usam bg-app.
3) theme-color #0d0e10 no escuro (index.html e ThemeContext); o seo.ts deixa de gravar uma cor fixa por cima a cada troca de rota.
4) AppRouter: a restauração da rolagem vai para o hook src/app/useScrollContainer.ts, sem mudar comportamento (o arquivo passava de 400 linhas).

ARQUIVOS (crie, altere ou apague exatamente estes):
- index.html (alterar)
- src/app/AppRouter.tsx (alterar)
- src/app/useScrollContainer.ts (criar)
- src/domain/admin/components/AdminPanel.tsx (alterar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/index.css (alterar)
- src/shared/context/ThemeContext.tsx (alterar)
- src/shared/utils/seo.ts (alterar)
- src/ui/components/BackgroundBlobs.tsx (apagar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== index.html — diff ===
@@ -15,7 +15,7 @@
     <meta name="apple-mobile-web-app-capable" content="yes" />
     <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
     <meta name="apple-mobile-web-app-title" content="Use Guide" />
-    <meta name="theme-color" content="#060b1e" />
+    <meta name="theme-color" content="#0d0e10" />
     <script>
       // Aplica o tema antes da primeira pintura (sem piscar escuro no tema claro). Mesma regra do ThemeContext.
       (function () {
@@ -27,7 +27,7 @@
         var dark =
           theme === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : theme === 'dark';
         document.documentElement.classList.add(dark ? 'dark' : 'light');
-        document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#060b1e' : '#f3eee4');
+        document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#0d0e10' : '#f3eee4');
       })();
     </script>
     <link rel="canonical" href="https://useguide.com.br" />

=== src/app/AppRouter.tsx — diff ===
@@ -1,5 +1,5 @@
 import { AnimatePresence, motion } from 'motion/react';
-import { useEffect, useMemo, useRef, useState } from 'react';
+import { useEffect, useMemo, useState } from 'react';
 import { useLocation, useSearchParams } from 'react-router-dom';
 import { AdminPanelComposition } from './compositions/AdminPanelComposition';
 import { LoginModal } from '../domain/auth/components/LoginModal';
@@ -20,7 +20,6 @@ import { useLocalizedRouting, useSyncLocaleWithUrl } from '../shared/hooks/useLo
 import { useSEO } from '../shared/hooks/useSEO';
 import { useUI, useUIStore } from '../shared/stores/useUIStore';
 import { cn } from '../shared/utils/cn';
-import { BackgroundBlobs } from '../ui/components/BackgroundBlobs';
 import { BottomNav } from '../ui/components/BottomNav';
 import { Header } from '../ui/layouts/Header';
 
@@ -28,6 +27,7 @@ import { PartnerPortalComposition } from './compositions/PartnerPortalCompositio
 import { ItemBookingComposition } from './compositions/ItemBookingComposition';
 import { SideMenu } from './menu/SideMenu';
 import { useSideMenu } from './menu/useSideMenu';
+import { useScrollContainer } from './useScrollContainer';
 import { AppRoutes } from './routes/AppRoutes';
 
 export function AppRouter() {
@@ -210,47 +210,7 @@ export function AppRouter() {
   useScrollLock(!!selectedItem);
   useScrollLock(isLoginModalOpen && !isMenuOpen);
 
-  const scrollContainerRef = useRef<HTMLDivElement>(null);
-  const scrollPositions = useRef<Record<string, number>>({});
-  const lastPathname = useRef(location.pathname);
-
-  useEffect(() => {
-    const container = scrollContainerRef.current;
-    if (!container) return;
-
-    if (lastPathname.current !== location.pathname) {
-      scrollPositions.current[lastPathname.current] = container.scrollTop;
-    }
-
-    const savedPosition = scrollPositions.current[location.pathname] || 0;
-
-    let attempts = 0;
-    const maxAttempts = 15;
-    const scrollInterval = setInterval(() => {
-      if (!container) {
-        clearInterval(scrollInterval);
-        return;
-      }
-
-      const currentMaxScroll = container.scrollHeight - container.clientHeight;
-      const canReachSaved = currentMaxScroll >= savedPosition;
-
-      if (canReachSaved || attempts >= maxAttempts) {
-        container.scrollTo({
-          top: Math.min(savedPosition, currentMaxScroll),
-          behavior: 'auto',
-        });
-        clearInterval(scrollInterval);
-      }
-      attempts++;
-    }, 100);
-
-    lastPathname.current = location.pathname;
-
-    return () => clearInterval(scrollInterval);
-  }, [location.pathname]);
-
-  const [isScrolled, setIsScrolled] = useState(false);
+  const { scrollContainerRef, isScrolled } = useScrollContainer(location.pathname);
   const [isSearchSticky, setIsSearchSticky] = useState(false);
 
   // biome-ignore lint/correctness/useExhaustiveDependencies: a busca fixa volta ao normal a cada troca de rota.
@@ -258,22 +218,6 @@ export function AppRouter() {
     setIsSearchSticky(false);
   }, [location.pathname]);
 
-  useEffect(() => {
-    const container = scrollContainerRef.current;
-    if (!container) return;
-
-    const handleScroll = () => {
-      setIsScrolled(container.scrollTop > 10);
-    };
-
-    container.addEventListener('scroll', handleScroll, { passive: true });
-    handleScroll();
-
-    return () => {
-      container.removeEventListener('scroll', handleScroll);
-    };
-  }, []);
-
   const isResetPasswordPage = location.pathname === '/reset-password';
   const isAdminOpen = searchParams.get('admin') === '1';
   const isHideGlobalUI =
@@ -282,8 +226,7 @@ export function AppRouter() {
   const isRetracted = isLoginModalOpen && !isMenuOpen && !isLoginClosingBySwipe;
 
   return (
-    <div className="relative h-screen bg-transparent text-white selection:bg-teal-500/30">
-      <BackgroundBlobs />
+    <div className="relative h-screen bg-app text-ink selection:bg-teal-500/30">
       <motion.div
         ref={scrollContainerRef}
         animate={{

=== src/app/useScrollContainer.ts — ARQUIVO NOVO, conteúdo completo ===
import { useEffect, useRef, useState } from 'react';

/**
 * Contêiner de rolagem do app: guarda a posição de cada rota e a restaura ao voltar, esperando o
 * conteúdo carregar; `isScrolled` indica rolagem além do topo.
 */
export function useScrollContainer(pathname: string) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});
  const lastPathname = useRef(pathname);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (lastPathname.current !== pathname) {
      scrollPositions.current[lastPathname.current] = container.scrollTop;
    }

    const savedPosition = scrollPositions.current[pathname] || 0;

    let attempts = 0;
    const maxAttempts = 15;
    const scrollInterval = setInterval(() => {
      if (!container) {
        clearInterval(scrollInterval);
        return;
      }

      const currentMaxScroll = container.scrollHeight - container.clientHeight;
      const canReachSaved = currentMaxScroll >= savedPosition;

      if (canReachSaved || attempts >= maxAttempts) {
        container.scrollTo({
          top: Math.min(savedPosition, currentMaxScroll),
          behavior: 'auto',
        });
        clearInterval(scrollInterval);
      }
      attempts++;
    }, 100);

    lastPathname.current = pathname;

    return () => clearInterval(scrollInterval);
  }, [pathname]);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 10);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { scrollContainerRef, isScrolled };
}

=== src/domain/admin/components/AdminPanel.tsx — diff ===
@@ -6,7 +6,6 @@ import { ChevronLeft, RefreshCw } from 'lucide-react';
 import { useUI } from '../../../shared/stores/useUIStore';
 import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
 
-import { BackgroundBlobs } from '../../../ui/components/BackgroundBlobs';
 import { ErrorState } from '../../../ui/components/ErrorState';
 import { CATEGORIES } from '../../../shared/constants/categories';
 import {
@@ -222,11 +221,9 @@ export function AdminPanel({
 
   return (
     <div
-      className="min-h-screen pt-12 pb-40 px-4 bg-[#020508] font-sans selection:bg-teal-500/30 relative overflow-hidden"
+      className="min-h-screen pt-12 pb-40 px-4 bg-app font-sans selection:bg-teal-500/30 relative overflow-hidden"
       id="admin-panel-viewport"
     >
-      <BackgroundBlobs />
-
       <div className="max-w-4xl mx-auto space-y-8 relative z-10">
         <motion.div
           initial={{ opacity: 0, y: -20 }}

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -3,7 +3,6 @@ import { AnimatePresence } from 'motion/react';
 import React, { useRef } from 'react';
 
 // Componentes estruturais e utilitários da UI
-import { BackgroundBlobs } from '../../../ui/components/BackgroundBlobs';
 import { createPartnerContentItemUseCase } from '../application/usecases/createPartnerContentItemUseCase';
 import { deletePartnerContentItemUseCase } from '../application/usecases/deletePartnerContentItemUseCase';
 import { updatePartnerContentItemUseCase } from '../application/usecases/updatePartnerContentItemUseCase';
@@ -161,9 +160,7 @@ export function PartnerPanel({
   }
 
   return (
-    <div className="min-h-screen pt-12 pb-40 px-4 bg-app/60 font-sans selection:bg-teal-500/30 relative overflow-x-hidden backdrop-blur-md">
-      <BackgroundBlobs />
-
+    <div className="min-h-screen pt-12 pb-40 px-4 bg-app font-sans selection:bg-teal-500/30 relative overflow-x-hidden">
       <div
         className={`max-w-4xl mx-auto space-y-8 relative z-10 transition-all duration-300 ${isEditing || editingListing !== undefined ? 'opacity-0 scale-[0.98] pointer-events-none h-0 overflow-hidden' : 'opacity-100 scale-100'}`}
       >

=== src/index.css — diff ===
@@ -112,9 +112,9 @@
   }
 }
 
-/* Leaflet Overrides for Glassmorphism */
+/* Leaflet */
 .leaflet-container {
-  background: #060b1e !important;
+  background: var(--ug-app) !important;
   font-family: inherit;
 }
 
@@ -172,11 +172,12 @@
   --liquid-accent: #0d9488; /* Teal 600 */
   --liquid-gradient: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
 
-  --ug-app: #060b1e;
+  /* Grafite liso e cartões sólidos um tom acima (D17, AGENTS.md §11.1). */
+  --ug-app: #0d0e10;
   --ug-ink: #ffffff;
-  --ug-surface: rgba(20, 22, 28, 0.94);
-  --ug-surface-solid: #14161c;
-  --ug-line: rgba(255, 255, 255, 0.1);
+  --ug-surface: #1e2024;
+  --ug-surface-solid: #1e2024;
+  --ug-line: rgba(255, 255, 255, 0.08);
   --ug-scrim: rgba(0, 0, 0, 0.7);
   --ug-accent: #5eead4;
   --ug-accent-soft: rgba(20, 184, 166, 0.12);
@@ -237,8 +238,6 @@
   background-color: var(--ug-app) !important;
 }
 
-/* Remove fixed background overlay to let BackgroundBlobs handle it dynamically */
-
 :root.light .text-white {
   color: #231d16 !important;
 }
@@ -313,7 +312,7 @@
 
 @layer base {
   body {
-    @apply bg-[#060b1e] text-white overflow-hidden font-sans;
+    @apply bg-app text-white overflow-hidden font-sans;
     min-height: 100vh;
   }
 
@@ -324,15 +323,14 @@
   }
 }
 
+/* Cartão sólido (D17): o vidro fica só em barras fixas e folhas (`glassmorphism-vibrant`). */
 .glassmorphism {
-  @apply backdrop-blur-2xl bg-white/5 border border-white/10;
-  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.5);
+  background-color: var(--ug-surface);
+  border: 1px solid var(--ug-line);
 }
 
 :root.light .glassmorphism {
-  background-color: rgba(250, 246, 238, 0.55);
-  border-color: rgba(35, 29, 22, 0.08);
-  box-shadow: 0 4px 24px 0 rgba(35, 29, 22, 0.04);
+  box-shadow: 0 1px 3px rgba(35, 29, 22, 0.06);
 }
 
 .glassmorphism-vibrant {

=== src/shared/context/ThemeContext.tsx — diff ===
@@ -38,7 +38,7 @@ export function ThemeProvider({ children }: { children: React.ReactNode }) {
       // Barra de status do celular na cor do fundo, como num app nativo.
       document
         .querySelector('meta[name="theme-color"]')
-        ?.setAttribute('content', isDark ? '#060b1e' : '#f3eee4');
+        ?.setAttribute('content', isDark ? '#0d0e10' : '#f3eee4');
       if (isDark) {
         root.classList.remove('light');
         root.classList.add('dark');

=== src/shared/utils/seo.ts — diff ===
@@ -11,7 +11,7 @@ export interface SEOMetadata {
   robots?: string | undefined;
   canonicalUrl?: string | undefined;
   author?: string | undefined;
-  structuredData?: Record<string, any> | undefined;
+  structuredData?: Record<string, unknown> | undefined;
   locale?: Locale | undefined;
 }
 
@@ -117,7 +117,7 @@ function getOrCreateLinkTag(rel: string): HTMLLinkElement {
   return element;
 }
 
-function updateStructuredData(schema: Record<string, any>): void {
+function updateStructuredData(schema: Record<string, unknown>): void {
   let script = document.getElementById('schema-structured-data') as HTMLScriptElement | null;
   if (!script) {
     script = document.createElement('script');
@@ -158,7 +158,6 @@ export function updateDocumentSEO(metadata: SEOMetadata = {}): void {
   getOrCreateMetaTag('name', 'keywords').setAttribute('content', keywords);
   getOrCreateMetaTag('name', 'author').setAttribute('content', author);
   getOrCreateMetaTag('name', 'robots').setAttribute('content', robots);
-  getOrCreateMetaTag('name', 'theme-color').setAttribute('content', '#0d1b2a');
 
   getOrCreateMetaTag('property', 'og:title').setAttribute('content', resolvedTitle);
   getOrCreateMetaTag('property', 'og:description').setAttribute('content', description);

=== src/ui/components/BackgroundBlobs.tsx — APAGUE este arquivo ===

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/app/AppRouter.tsx src/app/useScrollContainer.ts src/domain/admin/components/AdminPanel.tsx src/domain/partners/components/PartnerPanel.tsx src/shared/context/ThemeContext.tsx src/shared/utils/seo.ts` (todos verdes). Não precisa rodar a suíte inteira.
- abra o app nos temas claro e escuro: fundo liso, sem azul nem linhas, cartões sólidos.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
