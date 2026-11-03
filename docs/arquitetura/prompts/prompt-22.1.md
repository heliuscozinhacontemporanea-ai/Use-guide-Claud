# Prompt 22.1 — Página não encontrada nos dois temas e status 404 no servidor

> Lote 19, gerado dos commits de referência `a692a83..b850241` da branch `claude/agents-md-v2`. Aplique na ordem do lote (C18, A8, 22.1, 22.2, 22.6, 23.0, 23.1, 23.2a, 23.2b, 23.2c, 23.3), um por vez, depois do C18. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 22.1 — Página não encontrada nos dois temas e status 404 no servidor

Aprovado em 2026-11-02.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras estão nas decisões D24 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Endereço que não existe no app responde 404 no servidor (isKnownPagePath no SEO), sem trocar a página.
2) Página não encontrada (MessagePage) com os tokens dos dois temas.
3) Link de item que não existe mais mostra o aviso "Este item não está mais disponível" (useMissingItemNotice).

ARQUIVOS (crie, altere ou apague exatamente estes):
- server.ts (alterar)
- server/domain/seo/index.ts (alterar)
- server/domain/seo/utils/isKnownPagePath.test.ts (criar)
- server/domain/seo/utils/isKnownPagePath.ts (criar)
- server/domain/seo/utils/routeSeo.ts (alterar)
- src/app/AppRouter.tsx (alterar)
- src/app/useMissingItemNotice.test.tsx (criar)
- src/app/useMissingItemNotice.ts (criar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/utils/seo.ts (alterar)
- src/ui/components/MessagePage.tsx (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server.ts — diff ===
@@ -20,6 +20,7 @@ import {
   reviewReportRouter,
 } from './server/domain/reviews/routes/reviewReportRoutes';
 import reviewRouter from './server/domain/reviews/routes/reviewRoutes';
+import { isKnownPagePath } from './server/domain/seo';
 import { TicketingController } from './server/domain/ticketing/controllers/ticketingController';
 import ticketingRouter, {
   adminTicketingEventsRouter,
@@ -289,7 +290,8 @@ async function startServer() {
         res.setHeader('Content-Type', 'text/html; charset=utf-8');
         // A CDN do Hosting guarda por 5 min; o navegador sempre revalida.
         res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300');
-        res.send(html);
+        // Endereço que não existe: o app mostra "Página não encontrada" com status 404 de verdade.
+        res.status(isKnownPagePath(req.path) ? 200 : 404).send(html);
       } catch (error) {
         console.error('[SEO render]', error instanceof Error ? error.message : error);
         res.setHeader('Cache-Control', 'no-cache');

=== server/domain/seo/index.ts — diff ===
@@ -8,3 +8,4 @@ export type {
 } from './types/seoTypes';
 export { renderSeoHtmlUseCase } from './usecases/renderSeoHtmlUseCase';
 export { renderSitemapXmlUseCase } from './usecases/renderSitemapXmlUseCase';
+export { isKnownPagePath } from './utils/isKnownPagePath';

=== server/domain/seo/utils/isKnownPagePath.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { isKnownPagePath } from './isKnownPagePath';

describe('isKnownPagePath', () => {
  it('aceita as páginas do app em todos os idiomas e as rotas fora do mapa', () => {
    for (const path of [
      '/',
      '/eventos',
      '/en/events',
      '/fr/evenements',
      '/eventos/',
      '/admin',
      '/conta/acao',
      '/checkout/result',
    ]) {
      expect(isKnownPagePath(path)).toBe(true);
    }
  });

  it('recusa caminhos que não existem', () => {
    for (const path of [
      '/reset-password',
      '/evento',
      '/en/qualquer-coisa',
      '/toString',
      '/__proto__',
    ]) {
      expect(isKnownPagePath(path)).toBe(false);
    }
  });
});

=== server/domain/seo/utils/isKnownPagePath.ts — ARQUIVO NOVO, conteúdo completo ===
import { parseLocalizedPath } from '../../../shared/kernel/localizedRoutes';
import { NON_LOCALIZED_ROUTE_SEO } from './routeSeo';

/**
 * Se o caminho é uma página do app (rotas por idioma ou fora do mapa). Os outros recebem status 404
 * para o Google não tratar a página "não encontrada" como conteúdo (soft 404).
 */
export function isKnownPagePath(path: string): boolean {
  const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  return (
    parseLocalizedPath(normalized) !== null || Object.hasOwn(NON_LOCALIZED_ROUTE_SEO, normalized)
  );
}

=== server/domain/seo/utils/routeSeo.ts — diff ===
@@ -197,4 +197,11 @@ export const NON_LOCALIZED_ROUTE_SEO: Record<string, SeoMetadata> = {
     robots: 'noindex, nofollow',
     type: 'website',
   },
+  // Volta do Stripe depois do pagamento (rota do app sem idioma).
+  '/checkout/result': {
+    title: 'Pagamento | Use Guide',
+    description: 'Resultado do pagamento no Use Guide.',
+    robots: 'noindex, nofollow',
+    type: 'website',
+  },
 };

=== src/app/AppRouter.tsx — diff ===
@@ -14,6 +14,7 @@ import { TipDetailModal } from '../domain/guide/components/TipDetailModal';
 import { TourDetailModal } from '../domain/guide/components/TourDetailModal';
 import { PartnersModal } from '../domain/partners';
 import { SearchOverlay } from '../domain/search';
+import { ACCOUNT_ACTION_PATH } from '../shared/constants/accountActionPath';
 import { useLocalizedRouting, useSyncLocaleWithUrl } from '../shared/hooks/useLocalizedRouting';
 import { useScrollLock } from '../shared/hooks/useScrollLock';
 import { useSEO } from '../shared/hooks/useSEO';
@@ -27,8 +28,8 @@ import { PartnerPortalComposition } from './compositions/PartnerPortalCompositio
 import { SideMenu } from './menu/SideMenu';
 import { useSideMenu } from './menu/useSideMenu';
 import { AppRoutes } from './routes/AppRoutes';
+import { useMissingItemNotice } from './useMissingItemNotice';
 import { useScrollContainer } from './useScrollContainer';
-import { ACCOUNT_ACTION_PATH } from '../shared/constants/accountActionPath';
 
 export function AppRouter() {
   const { user, refreshProfile } = useAuthContext();
@@ -104,7 +105,7 @@ export function AppRouter() {
     );
   };
 
-  const { items, events } = useGuideCatalog();
+  const { items, events, loading: catalogLoading, error: catalogError } = useGuideCatalog();
 
   const isSearchOpen = searchParams.get('search') === '1';
   const { isOpen: isMenuOpen, openMenu, closeMenu } = useSideMenu();
@@ -162,6 +163,11 @@ export function AppRouter() {
   }, [selectedItem, searchParams, isPartnersOpen]);
 
   useSEO(dynamicSEO);
+  useMissingItemNotice({
+    itemId: itemIdParam,
+    found: selectedItem !== null,
+    catalogReady: !catalogLoading && !catalogError,
+  });
 
   const setSelectedItem = (item: GuideItem | null) => {
     setSearchParams((prev) => {

=== src/app/useMissingItemNotice.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../shared/i18n';
import { useUIStore } from '../shared/stores/useUIStore';
import { useMissingItemNotice } from './useMissingItemNotice';

function wrapper(url: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  );
}

function useCase(props: Parameters<typeof useMissingItemNotice>[0]) {
  useMissingItemNotice(props);
  return useLocation();
}

describe('useMissingItemNotice', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.restoreAllMocks();
  });

  it('avisa e tira item e type da URL quando o item não está no catálogo carregado', () => {
    const toast = vi.spyOn(useUIStore.getState(), 'showToast');
    const { result } = renderHook(
      () => useCase({ itemId: 'abc', found: false, catalogReady: true }),
      { wrapper: wrapper('/eventos?item=abc&type=event&x=1') }
    );
    expect(toast).toHaveBeenCalledWith('Este item não está mais disponível.', 'info');
    expect(result.current.search).toBe('?x=1');
  });

  it('espera o catálogo carregar e não avisa quando o item existe', () => {
    const toast = vi.spyOn(useUIStore.getState(), 'showToast');
    renderHook(() => useCase({ itemId: 'abc', found: false, catalogReady: false }), {
      wrapper: wrapper('/eventos?item=abc'),
    });
    renderHook(() => useCase({ itemId: 'abc', found: true, catalogReady: true }), {
      wrapper: wrapper('/eventos?item=abc'),
    });
    expect(toast).not.toHaveBeenCalled();
  });
});

=== src/app/useMissingItemNotice.ts — ARQUIVO NOVO, conteúdo completo ===
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useUIStore } from '../shared/stores/useUIStore';

/**
 * Link com `?item=` de um item que não está no catálogo (apagado, despublicado ou id errado): avisa e
 * tira o parâmetro da URL, em vez de mostrar a lista sem explicação.
 */
export function useMissingItemNotice({
  itemId,
  found,
  catalogReady,
}: {
  itemId: string | null;
  found: boolean;
  catalogReady: boolean;
}) {
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!itemId || found || !catalogReady) return;
    useUIStore.getState().showToast(t('pages.itemUnavailable'), 'info');
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('item');
        next.delete('type');
        return next;
      },
      { replace: true }
    );
  }, [itemId, found, catalogReady, setSearchParams, t]);
}

=== src/shared/i18n/resources.ts — diff ===
@@ -334,6 +334,7 @@ export interface TranslationResource {
   pages: {
     notFoundTitle: string;
     notFoundDescription: string;
+    itemUnavailable: string;
     backHome: string;
     checkoutResultMissing: string;
     planPaymentTitle: string;
@@ -623,6 +624,7 @@ const ptBR: TranslationResource = {
   pages: {
     notFoundTitle: 'Página não encontrada',
     notFoundDescription: 'O endereço que você abriu não existe ou foi alterado.',
+    itemUnavailable: 'Este item não está mais disponível.',
     backHome: 'Voltar ao início',
     checkoutResultMissing: 'Não encontramos o pedido deste pagamento.',
     planPaymentTitle: 'Pagamento do plano em processamento',
@@ -913,6 +915,7 @@ const en: TranslationResource = {
   pages: {
     notFoundTitle: 'Page not found',
     notFoundDescription: 'The address you opened does not exist or has changed.',
+    itemUnavailable: 'This item is no longer available.',
     backHome: 'Back to home',
     checkoutResultMissing: 'We could not find the order for this payment.',
     planPaymentTitle: 'Plan payment processing',
@@ -1210,6 +1213,7 @@ const fr: TranslationResource = {
   pages: {
     notFoundTitle: 'Page introuvable',
     notFoundDescription: 'L’adresse que vous avez ouverte n’existe pas ou a changé.',
+    itemUnavailable: 'Cet élément n’est plus disponible.',
     backHome: 'Retour à l’accueil',
     checkoutResultMissing: 'Nous n’avons pas trouvé la commande de ce paiement.',
     planPaymentTitle: 'Paiement du forfait en cours',

=== src/shared/utils/seo.ts — diff ===
@@ -69,6 +69,11 @@ const NON_LOCALIZED_ROUTE_SEO: Record<string, SEOMetadata> = {
     description: 'Confirmação de e-mail e nova senha da conta Use Guide.',
     robots: 'noindex, nofollow',
   },
+  '/checkout/result': {
+    title: 'Pagamento',
+    description: 'Resultado do pagamento no Use Guide.',
+    robots: 'noindex, nofollow',
+  },
 };
 
 /**

=== src/ui/components/MessagePage.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../shared/utils/cn';
import { BUTTON_PRIMARY } from '../styles/controls';
import { GlassCard } from './GlassCard';

interface MessagePageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

/** Página simples de aviso (não encontrada, resultado de pagamento) com uma ação principal, nos dois temas. */
export function MessagePage({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: MessagePageProps) {
  return (
    <div className="px-4 py-16 max-w-lg mx-auto">
      <GlassCard className="p-8 flex flex-col items-center text-center gap-4">
        <Icon size={36} className="text-accent" aria-hidden="true" />
        <h1 className="text-xl font-display font-black text-ink">{title}</h1>
        <p className="text-sm text-ink/70 leading-relaxed">{description}</p>
        <button type="button" onClick={onAction} className={cn(BUTTON_PRIMARY, 'min-h-12 px-6')}>
          {actionLabel}
        </button>
      </GlassCard>
    </div>
  );
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server.ts server/domain/seo/index.ts server/domain/seo/utils/isKnownPagePath.test.ts server/domain/seo/utils/isKnownPagePath.ts server/domain/seo/utils/routeSeo.ts src/app/AppRouter.tsx src/app/useMissingItemNotice.test.tsx src/app/useMissingItemNotice.ts src/shared/i18n/resources.ts src/shared/utils/seo.ts src/ui/components/MessagePage.tsx` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique uma revisão nova do Cloud Run (`use-guide`, `us-east1`) e o Hosting com o mesmo código.
