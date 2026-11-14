import { AnimatePresence, motion, useReducedMotion, useTransform } from 'motion/react';
import { type ReactNode, Suspense, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../domain/auth/context/AuthContext';
import { UserRole } from '../domain/auth/types/auth';
import { GuideItem, useGuideCatalog } from '../domain/guide';
import { NotificationBell } from '../domain/notifications';
import { ACCOUNT_ACTION_PATH } from '../shared/constants/accountActionPath';
import { useLocalizedRouting, useSyncLocaleWithUrl } from '../shared/hooks/useLocalizedRouting';
import { useScrollLock } from '../shared/hooks/useScrollLock';
import { useSEO } from '../shared/hooks/useSEO';
import { useUI, useUIStore } from '../shared/stores/useUIStore';
import { cn } from '../shared/utils/cn';
import { BottomNav } from '../ui/components/BottomNav';
import { DelayedFallback, ScreenFallback } from '../ui/lazy/DelayedFallback';
import { Header } from '../ui/layouts/Header';
import { readSafeAreaTop } from '../ui/motion/safeAreaTop';
import { stackSheetProgress } from '../ui/motion/stackSheetProgress';
import { CARD_RADIUS_PX, CARD_SCALE } from '../ui/motion/tokens';
import { Z_INDEX } from '../shared/constants/zIndex';
import { prefetchWhenIdle } from './lazy/prefetchWhenIdle';
import {
  AdminPanelComposition,
  COMMON_SCREENS,
  EventTicketingPurchasePanel,
  ItemBookingComposition,
  ListingDetail,
  LoginModal,
  loadAdminPanel,
  loadPartnerPortal,
  PartnerPortalComposition,
  PartnersModal,
  SearchOverlay,
} from './lazy/screens';
import { useOpenedOnce } from './lazy/useOpenedOnce';

// Categorias com reserva pelo app (passeio, translado, aluguel e entrada de atração).
const BOOKABLE_CATEGORIES = ['tour', 'transfer', 'rental', 'sight'];

import { SideMenu } from './menu/SideMenu';
import { useSideMenu } from './menu/useSideMenu';
import { AppRoutes } from './routes/AppRoutes';
import { useMissingItemNotice } from './useMissingItemNotice';
import { useNotificationNavigation } from './useNotificationNavigation';
import { useScrollContainer } from './useScrollContainer';

export function AppRouter() {
  const { user, refreshProfile } = useAuthContext();
  const isPartner = user?.role === UserRole.PARTNER;
  const isAdmin = user?.role === UserRole.ADMIN;

  const location = useLocation();
  const { routeKey } = useLocalizedRouting();
  const isExplorePage = routeKey === 'explore';
  useSyncLocaleWithUrl();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoginModalOpen, isLoginClosingBySwipe, closeLoginModal, openLoginModal } = useUI();
  const loginModalTab = useUIStore((state) => state.loginModalTab);

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

  const itemIdParam = searchParams.get('item');
  const itemTypeParam = searchParams.get('type');

  const selectedItem = useMemo(() => {
    if (!itemIdParam) {
      return null;
    }

    if (itemTypeParam === 'event') {
      return events.find((event) => event.id === itemIdParam) ?? null;
    }

    if (itemTypeParam === 'item') {
      return items.find((item) => item.id === itemIdParam) ?? null;
    }

    return null;
  }, [itemIdParam, itemTypeParam, items, events]);

  const dynamicSEO = useMemo(() => {
    if (selectedItem) {
      return {
        title: `${selectedItem.name} | Guia ${selectedItem.location || 'Jericoacoara'}`,
        description:
          selectedItem.description ||
          `Confira informações completas sobre ${selectedItem.name} no Use Guide.`,
        image: selectedItem.image,
        type: (selectedItem.category === 'event' ? 'event' : 'place') as 'event' | 'place',
        keywords:
          selectedItem.tags && selectedItem.tags.length > 0
            ? selectedItem.tags
            : [selectedItem.name, selectedItem.location, selectedItem.category, 'Jericoacoara'],
      };
    }
    if (searchParams.get('admin') === '1') {
      return {
        title: 'Painel Administrativo',
        description: 'Área de gestão e moderação de conteúdo do Use Guide.',
        robots: 'noindex, nofollow',
      };
    }
    if (isPartnersOpen) {
      return {
        title: 'Seja um Parceiro',
        description:
          'Cadastre seu negócio e alcance milhares de turistas em Jericoacoara, Preá e Barrinha.',
      };
    }
    return undefined;
  }, [selectedItem, searchParams, isPartnersOpen]);

  useSEO(dynamicSEO);
  useMissingItemNotice({
    itemId: itemIdParam,
    found: selectedItem !== null,
    catalogReady: !catalogLoading && !catalogError,
  });

  const setSelectedItem = (item: GuideItem | null) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);

      if (item) {
        nextParams.set('item', item.id);

        nextParams.set('type', item.category === 'event' ? 'event' : 'item');
      } else {
        nextParams.delete('item');
        nextParams.delete('type');
      }

      return nextParams;
    });
  };

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

  const { scrollContainerRef, isScrolled } = useScrollContainer(location.pathname);
  const [isSearchSticky, setIsSearchSticky] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a busca fixa volta ao normal a cada troca de rota.
  useEffect(() => {
    setIsSearchSticky(false);
  }, [location.pathname]);

  const isAccountActionPage = location.pathname === ACCOUNT_ACTION_PATH;
  const isAdminOpen = searchParams.get('admin') === '1';
  const isHideGlobalUI =
    isAccountActionPage || isAdminOpen || isPartnerPortalOpen || location.pathname === '/admin';

  const isRetracted = isLoginModalOpen && !isMenuOpen && !isLoginClosingBySwipe;
  const loginMounted = useOpenedOnce(isLoginModalOpen);
  const partnersMounted = useOpenedOnce(isPartnersOpen);

  return (
    <div className="relative h-screen bg-black text-ink selection:bg-teal-500/30">
      <BackdropCard>
        <motion.div
          ref={scrollContainerRef}
          animate={{
            y: isRetracted ? 16 : 0,
            scale: isRetracted ? 0.9 : 1,
            opacity: 1,
            borderTopLeftRadius: isRetracted ? 12 : 0,
            borderTopRightRadius: isRetracted ? 12 : 0,
          }}
          transition={{
            duration: isRetracted ? 0.45 : isLoginClosingBySwipe ? 0.22 : 0.35,
            ease: isRetracted ? [0.16, 1, 0.3, 1] : [0.32, 0.72, 0, 1],
          }}
          style={{
            transformOrigin: 'top center',
            opacity: 1,
          }}
          className="relative h-full overflow-y-auto no-scrollbar"
        >
          {!isHideGlobalUI && (
            <Header
              onSearchClick={() => setIsSearchOpen(true)}
              isMenuOpen={isMenuOpen}
              onMenuToggle={() => (isMenuOpen ? closeMenu() : openMenu())}
              isScrolled={isScrolled}
              isSearchSticky={isExplorePage ? isSearchSticky : false}
              onAdminOpen={handleAdminOpen}
              isAdmin={isAdmin}
              isPartner={isPartner}
              user={user}
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
                key={location.pathname}
                className={cn(
                  'min-h-full max-w-2xl mx-auto w-full',
                  isExplorePage ? 'pt-[70px]' : isAccountActionPage ? 'pt-0' : 'pt-28'
                )}
              >
                <AppRoutes
                  location={location}
                  onSelectItem={setSelectedItem}
                  onStickyChange={setIsSearchSticky}
                />
              </motion.div>
            </AnimatePresence>
          )}

          {!isHideGlobalUI && <BottomNav />}

          <SideMenu
            onPartnersOpen={() => {
              setSearchParams(
                (prev) => {
                  const nextParams = new URLSearchParams(prev);
                  nextParams.set('partners', '1');
                  return nextParams;
                },
                { replace: true }
              );

              setTimeout(() => {
                setSearchParams(
                  (prev) => {
                    const nextParams = new URLSearchParams(prev);
                    nextParams.delete('menu');
                    nextParams.set('partners', '1');
                    return nextParams;
                  },
                  { replace: true }
                );
              }, 800);
            }}
            onAdminOpen={handleAdminOpen}
          />

          {partnersMounted && (
            <Suspense fallback={null}>
              <PartnersModal
                isOpen={isPartnersOpen}
                onClose={() => setIsPartnersOpen(false)}
                onOpenPartnerPanel={() => void openPartnerPortalAfterSignup()}
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
              <Suspense key={selectedItem.id} fallback={null}>
                <ListingDetail
                  item={selectedItem}
                  onClose={() => setSelectedItem(null)}
                  renderBooking={
                    BOOKABLE_CATEGORIES.includes(selectedItem.category)
                      ? (included) => (
                          <Suspense fallback={<BlockFallback />}>
                            <ItemBookingComposition
                              guideItemId={selectedItem.id}
                              between={included}
                            />
                          </Suspense>
                        )
                      : undefined
                  }
                  ticketPanel={
                    selectedItem.category === 'event' ? (
                      <Suspense fallback={<BlockFallback />}>
                        <EventTicketingPurchasePanel
                          eventId={selectedItem.id}
                          eventTitle={selectedItem.name}
                          place={{ timeZone: selectedItem.timeZone, city: selectedItem.city }}
                          userEmail={user?.email || undefined}
                          userName={user?.displayName || undefined}
                          onRequireLogin={openLoginModal}
                        />
                      </Suspense>
                    ) : undefined
                  }
                />
              </Suspense>
            )}
          </AnimatePresence>

          {loginMounted && (
            <Suspense fallback={null}>
              <LoginModal
                isOpen={isLoginModalOpen}
                onClose={closeLoginModal}
                initialTab={loginModalTab}
              />
            </Suspense>
          )}
        </motion.div>
      </BackdropCard>
    </div>
  );
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * O app inteiro vira cartão atrás da folha em pilha (DESIGN.md §9.1, D33): encolhe, desce até a área
 * segura, arredonda os cantos e recebe o véu `recede`, no mesmo movimento da folha (inclusive no arraste).
 */
function BackdropCard({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [top] = useState(() => Math.max(readSafeAreaTop(), 16));
  const scale = useTransform(stackSheetProgress, (p) =>
    reduced ? 1 : 1 - (1 - CARD_SCALE) * clamp01(p)
  );
  const y = useTransform(stackSheetProgress, (p) => (reduced ? 0 : top * clamp01(p)));
  // Canto aparece pronto (não se anima o raio, DESIGN.md P9).
  const borderRadius = useTransform(stackSheetProgress, (p) =>
    !reduced && p > 0.001 ? CARD_RADIUS_PX : 0
  );
  const veil = useTransform(stackSheetProgress, clamp01);
  return (
    <motion.div
      style={{ scale, y, borderRadius, transformOrigin: 'top center' }}
      className="relative h-full overflow-hidden bg-app"
    >
      {children}
      <motion.div
        aria-hidden="true"
        style={{ opacity: veil, zIndex: Z_INDEX.popover }}
        className="pointer-events-none absolute inset-0 bg-recede"
      />
    </motion.div>
  );
}

/** Espaço do bloco de compra enquanto o código dele chega (DESIGN.md P15). */
function BlockFallback() {
  return (
    <DelayedFallback>
      <div className="h-24 rounded-[20px] bg-surface border border-line animate-pulse-slow" />
    </DelayedFallback>
  );
}
