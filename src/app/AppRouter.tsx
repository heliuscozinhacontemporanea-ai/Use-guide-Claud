import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Suspense, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';
import { UserRole } from '../domain/auth';
import { useGuideCatalog } from '../domain/guide';
import { NotificationBell } from '../domain/notifications';
import { useAccount, useAccountEntry } from '../domain/user';
import { ACCOUNT_ACTION_PATH } from '../shared/constants/accountActionPath';
import { useLocalizedRouting, useSyncLocaleWithUrl } from '../shared/hooks/useLocalizedRouting';
import { useScrollLock } from '../shared/hooks/useScrollLock';
import { useUI, useUIStore } from '../shared/stores/useUIStore';
import { cn } from '../shared/utils/cn';
import { BottomNav } from '../ui/components/BottomNav';
import { ScreenFallback } from '../ui/lazy/DelayedFallback';
import { Header } from '../ui/layouts/Header';
import { ScreenTitle } from '../ui/layouts/ScreenTitle';
import { screenTitleKey, tabOfRoute } from '../shared/constants/navigation';
import { prefetchWhenIdle } from './lazy/prefetchWhenIdle';
import {
  AdminPanelComposition,
  COMMON_SCREENS,
  LoginModal,
  loadAdminPanel,
  loadPartnerPortal,
  PartnerPortalComposition,
  PartnerJoinSheet,
  ClaimListingSheet,
  SearchOverlay,
} from './lazy/screens';
import { useOpenedOnce } from './lazy/useOpenedOnce';
import { usePartnerInvite } from './partnerJoin/usePartnerInvite';
import { useClaimStore } from './stores/claimStore';
import { useClaimListing } from './claim/useClaimListing';
import { AboutTermsView } from './lazy/menuScreens';
import { SideMenu } from './menu/SideMenu';
import { useSideMenu } from './menu/useSideMenu';
import { AppRoutes } from './routes/AppRoutes';
import { useNotificationNavigation } from './useNotificationNavigation';
import { useOpenListing } from './useOpenListing';
import { useRouteSEO } from './useRouteSEO';
import { useScrollContainer } from './useScrollContainer';
import { useTabMemory } from './useTabMemory';
import { BackdropCard } from './BackdropCard';
import { ListingDetailComposition } from './compositions/ListingDetailComposition';

// Tempo para a folha do menu terminar de descer antes de outra subir.
const SHEET_SWAP_MS = 450;

export function AppRouter() {
  const { user, profile, photoURL, refreshProfile } = useAccount();
  const accountEntry = useAccountEntry();
  const isPartner = user?.role === UserRole.PARTNER;
  const isAdmin = user?.role === UserRole.ADMIN;

  const location = useLocation();
  const { routeKey } = useLocalizedRouting();
  const titleKey = screenTitleKey(routeKey);
  // Trocar de pílula dentro de Experiências ou Serviços não troca de página (só a lista muda).
  const tab = tabOfRoute(routeKey);
  const pageKey = tab === 'experiences' || tab === 'services' ? tab : location.pathname;
  useSyncLocaleWithUrl();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { isLoginModalOpen, closeLoginModal, openLoginModal, showToast } = useUI();
  const loginModalTab = useUIStore((state) => state.loginModalTab);
  const loginNote = useUIStore((state) => state.loginNote);

  useEffect(() => prefetchWhenIdle(COMMON_SCREENS), []);
  useEffect(() => {
    if (isPartner) return prefetchWhenIdle([loadPartnerPortal]);
    if (isAdmin) return prefetchWhenIdle([loadAdminPanel]);
  }, [isPartner, isAdmin]);

  useEffect(() => {
    if (searchParams.get('login') === '1') {
      openLoginModal();
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('login');
          return next;
        },
        { replace: true }
      );
    }
  }, [searchParams, openLoginModal, setSearchParams]);

  const isPartnerPortalOpen = searchParams.get('partner') === '1';

  const handleAdminOpen = () => {
    const target = isAdmin ? 'admin' : isPartner ? 'partner' : null;
    if (!target) {
      return;
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('admin');
        next.delete('partner');
        next.set(target, '1');
        return next;
      },
      { replace: true }
    );
    setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('menu');
          next.delete('admin');
          next.delete('partner');
          next.set(target, '1');
          return next;
        },
        { replace: true }
      );
    }, 850);
  };

  // O papel de parceiro vem do perfil no Firestore: recarrega antes de abrir o portal recém-liberado.
  const openPartnerPortalAfterSignup = async () => {
    await refreshProfile();
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('partners');
        next.delete('menu');
        next.set('partner', '1');
        return next;
      },
      { replace: true }
    );
  };

  const { items, events, loading: catalogLoading, error: catalogError } = useGuideCatalog();

  const isSearchOpen = searchParams.get('search') === '1';
  const { isOpen: isMenuOpen, openMenu, closeMenu } = useSideMenu();
  const openNotificationLink = useNotificationNavigation(openMenu);
  const isPartnersOpen = searchParams.get('partners') === '1';

  const { selectedItem, setSelectedItem, growsFromCard } = useOpenListing({
    items,
    events,
    catalogReady: !catalogLoading && !catalogError,
  });
  useRouteSEO({
    selectedItem,
    isAdminOpen: searchParams.get('admin') === '1',
    isPartnersOpen,
  });

  const setIsPartnersOpen = (open: boolean) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (open) {
        nextParams.set('partners', '1');
      } else {
        nextParams.delete('partners');
      }
      return nextParams;
    });
  };

  // As folhas em pilha dividem o mesmo progresso (D33): o menu desce primeiro e o Seja parceiro sobe
  // depois, para uma não esconder a outra.
  const openPartnerJoin = useCallback(() => {
    setSearchParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.delete('menu');
        return nextParams;
      },
      { replace: true }
    );
    setTimeout(
      () =>
        setSearchParams((prev) => {
          const nextParams = new URLSearchParams(prev);
          nextParams.set('partners', '1');
          return nextParams;
        }),
      SHEET_SWAP_MS
    );
  }, [setSearchParams]);
  const startPartnerInvite = usePartnerInvite(openPartnerJoin);
  // Volta para "Assumir anúncio" depois do login, mesmo com o anúncio já fechado (D35, 4a).
  useClaimListing();

  const setIsSearchOpen = (open: boolean) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (open) {
        nextParams.set('search', '1');
      } else {
        nextParams.delete('search');
      }
      return nextParams;
    });
  };

  useScrollLock(isMenuOpen);
  useScrollLock(isSearchOpen);
  useScrollLock(isPartnersOpen);
  useScrollLock(!!selectedItem);
  useScrollLock(isLoginModalOpen && !isMenuOpen);

  const { scrollContainerRef, isScrolled, isPastTitle } = useScrollContainer(location.pathname);
  const rememberedPlace = useTabMemory(location);
  const reduceMotion = useReducedMotion();
  // Tocar na aba ativa (P23): com anúncio aberto, volta à raiz da aba; senão, sobe ao topo.
  const reselectTab = () => {
    if (searchParams.has('item')) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('item');
          next.delete('type');
          return next;
        },
        { replace: false }
      );
      return;
    }
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  const isAccountActionPage = location.pathname === ACCOUNT_ACTION_PATH;
  const isAdminOpen = searchParams.get('admin') === '1';
  const isHideGlobalUI =
    isAccountActionPage || isAdminOpen || isPartnerPortalOpen || location.pathname === '/admin';
  // Anúncio é página da aba, abaixo da barra (P23); aberto pela busca ou sem a barra, fica por cima.
  const listingCoversTabBar = isSearchOpen || isHideGlobalUI;
  // O que fica atrás do anúncio sai do toque, do Tab e do leitor de tela; a barra de abas continua.
  const behindListing = Boolean(selectedItem) && !listingCoversTabBar;

  const loginMounted = useOpenedOnce(isLoginModalOpen);
  const partnersMounted = useOpenedOnce(isPartnersOpen);
  const claimOpen = useClaimStore((state) => state.target !== null);
  const claimMounted = useOpenedOnce(claimOpen);
  const openClaim = useClaimStore((state) => state.open);

  return (
    <div className="relative h-screen bg-black text-ink selection:bg-teal-500/30">
      <BackdropCard>
        {/* O fundo vira cartão atrás de qualquer folha pelo `BackdropCard` (D33). */}
        <div ref={scrollContainerRef} className="relative h-full overflow-y-auto no-scrollbar">
          {!isHideGlobalUI && (
            <div inert={behindListing || undefined} className="contents">
              <Header
                onSearchClick={() => setIsSearchOpen(true)}
                isMenuOpen={isMenuOpen}
                onMenuToggle={() => (isMenuOpen ? closeMenu() : openMenu())}
                isScrolled={isScrolled}
                showTitle={isPastTitle}
                onAdminOpen={handleAdminOpen}
                isAdmin={isAdmin}
                isPartner={isPartner}
                account={
                  user
                    ? {
                        photoURL,
                        displayName: profile?.displayName || user.displayName,
                        email: user.email,
                      }
                    : null
                }
                notificationSlot={
                  user ? (
                    <NotificationBell
                      uid={user.uid}
                      onNavigate={openNotificationLink}
                      onOpenSettings={() => openMenu('notifications')}
                    />
                  ) : null
                }
              />
            </div>
          )}

          {isAdminOpen ? (
            <Suspense fallback={<ScreenFallback className="min-h-dvh bg-app p-6" />}>
              <AdminPanelComposition />
            </Suspense>
          ) : isPartnerPortalOpen ? (
            <Suspense fallback={<ScreenFallback className="min-h-dvh bg-app p-6" />}>
              <PartnerPortalComposition />
            </Suspense>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={pageKey}
                inert={behindListing || undefined}
                className={cn(
                  'min-h-full max-w-2xl mx-auto w-full',
                  isAccountActionPage ? 'pt-0' : 'pt-[calc(env(safe-area-inset-top)+4rem)]'
                )}
              >
                {titleKey && <ScreenTitle>{t(titleKey)}</ScreenTitle>}
                <AppRoutes
                  location={location}
                  onSelectItem={setSelectedItem}
                  onOpenSearch={() => setIsSearchOpen(true)}
                />
              </motion.div>
            </AnimatePresence>
          )}

          {!isHideGlobalUI && (
            <BottomNav rememberedPlace={rememberedPlace} onReselect={reselectTab} />
          )}

          <SideMenu
            onPartnersOpen={openPartnerJoin}
            onPartnerInvite={startPartnerInvite}
            onAdminOpen={handleAdminOpen}
          />

          {partnersMounted && (
            <Suspense fallback={null}>
              <PartnerJoinSheet
                isOpen={isPartnersOpen}
                onClose={() => setIsPartnersOpen(false)}
                onNeedAccount={() => {
                  setIsPartnersOpen(false);
                  startPartnerInvite();
                }}
                onClaim={(target) => {
                  setIsPartnersOpen(false);
                  setTimeout(() => openClaim(target), SHEET_SWAP_MS);
                }}
                onJoined={() => {
                  showToast(t('partnerGuide.join.ready'), 'success');
                  void openPartnerPortalAfterSignup();
                }}
              />
            </Suspense>
          )}

          {claimMounted && (
            <Suspense fallback={null}>
              <ClaimListingSheet
                onOpenPanel={() => {
                  // O pedido pode ter começado no anúncio: ele fecha para o painel aparecer.
                  setSelectedItem(null);
                  void openPartnerPortalAfterSignup();
                }}
              />
            </Suspense>
          )}

          <AnimatePresence>
            {isSearchOpen && (
              <Suspense key="search" fallback={null}>
                <SearchOverlay
                  isOpen={isSearchOpen}
                  onClose={() => setIsSearchOpen(false)}
                  onSelectItem={setSelectedItem}
                />
              </Suspense>
            )}
          </AnimatePresence>

          {/* Anúncio em tela cheia (2026-11-10): a foto cresce do cartão e volta ao fechar. */}
          <AnimatePresence>
            {selectedItem && (
              <ListingDetailComposition
                key={selectedItem.id}
                item={selectedItem}
                coversTabBar={listingCoversTabBar}
                growsFromCard={growsFromCard}
                onClose={() => setSelectedItem(null)}
              />
            )}
          </AnimatePresence>

          {loginMounted && (
            <Suspense fallback={null}>
              <LoginModal
                actions={accountEntry}
                isOpen={isLoginModalOpen}
                onClose={closeLoginModal}
                initialTab={loginModalTab}
                note={loginNote}
                renderTerms={(onBack) => (
                  <Suspense fallback={<ScreenFallback />}>
                    <AboutTermsView document="terms" onBack={onBack} />
                  </Suspense>
                )}
              />
            </Suspense>
          )}
        </div>
      </BackdropCard>
    </div>
  );
}
