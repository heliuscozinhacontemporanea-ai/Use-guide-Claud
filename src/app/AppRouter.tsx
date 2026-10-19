import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { AdminDispatcher } from '../domain/admin/components/AdminDispatcher';
import { LoginModal } from '../domain/auth/components/LoginModal';
import { useAuthContext } from '../domain/auth/context/AuthContext';
import { UserRole } from '../domain/auth/types/auth';
import { GuideItem, useGuideCatalog } from '../domain/guide';
import { AttractionDetailModal } from '../domain/guide/components/AttractionDetailModal';
import { EventDetailModal } from '../domain/guide/components/EventDetailModal';
import { ItemDetailModal } from '../domain/guide/components/ItemDetailModal';
import { RestaurantDetailModal } from '../domain/guide/components/RestaurantDetailModal';
import { StayDetailModal } from '../domain/guide/components/StayDetailModal';
import { TipDetailModal } from '../domain/guide/components/TipDetailModal';
import { TourDetailModal } from '../domain/guide/components/TourDetailModal';
import { PartnersModal } from '../domain/partners';
import { SearchOverlay } from '../domain/search';
import { useConnection } from '../shared/hooks/useConnection';
import { useScrollLock } from '../shared/hooks/useScrollLock';
import { useLocalizedRouting, useSyncLocaleWithUrl } from '../shared/hooks/useLocalizedRouting';
import { useSEO } from '../shared/hooks/useSEO';
import { useUI, useUIStore } from '../shared/stores/useUIStore';
import { cn } from '../shared/utils/cn';
import { BackgroundBlobs } from '../ui/components/BackgroundBlobs';
import { BottomNav } from '../ui/components/BottomNav';
import { Header } from '../ui/layouts/Header';

import { PartnerPortalComposition } from './compositions/PartnerPortalComposition';
import { ItemBookingComposition } from './compositions/ItemBookingComposition';
import { SideMenu } from './menu/SideMenu';
import { useSideMenu } from './menu/useSideMenu';
import { AppRoutes } from './routes/AppRoutes';

export function AppRouter() {
  const { user, refreshProfile } = useAuthContext();
  const isPartner = user?.role === UserRole.PARTNER;
  const isAdmin = user?.role === UserRole.ADMIN;

  const location = useLocation();
  const { routeKey } = useLocalizedRouting();
  const isExplorePage = routeKey === 'explore';
  useSyncLocaleWithUrl();
  const connection = useConnection();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoginModalOpen, isLoginClosingBySwipe, closeLoginModal, openLoginModal } = useUI();
  const loginModalTab = useUIStore((state) => state.loginModalTab);

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

  const { items, events } = useGuideCatalog();

  const isSearchOpen = searchParams.get('search') === '1';
  const { isOpen: isMenuOpen, openMenu, closeMenu } = useSideMenu();
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});
  const lastPathname = useRef(location.pathname);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (lastPathname.current !== location.pathname) {
      scrollPositions.current[lastPathname.current] = container.scrollTop;
    }

    const savedPosition = scrollPositions.current[location.pathname] || 0;

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

    lastPathname.current = location.pathname;

    return () => clearInterval(scrollInterval);
  }, [location.pathname]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchSticky, setIsSearchSticky] = useState(false);

  useEffect(() => {
    setIsSearchSticky(false);
  }, [location.pathname]);

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

  const isResetPasswordPage = location.pathname === '/reset-password';
  const isAdminOpen = searchParams.get('admin') === '1';
  const isHideGlobalUI =
    isResetPasswordPage || isAdminOpen || isPartnerPortalOpen || location.pathname === '/admin';

  const isRetracted = isLoginModalOpen && !isMenuOpen && !isLoginClosingBySwipe;

  return (
    <div className="relative h-screen bg-transparent text-white selection:bg-teal-500/30">
      <BackgroundBlobs />
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
          />
        )}

        {isAdminOpen ? (
          <AdminDispatcher />
        ) : isPartnerPortalOpen ? (
          <PartnerPortalComposition />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className={cn(
                'min-h-full max-w-2xl mx-auto w-full',
                isExplorePage ? 'pt-[70px]' : isResetPasswordPage ? 'pt-0' : 'pt-28'
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

        <PartnersModal
          isOpen={isPartnersOpen}
          onClose={() => setIsPartnersOpen(false)}
          onOpenPartnerPanel={() => void openPartnerPortalAfterSignup()}
        />

        <AnimatePresence>
          {isSearchOpen && (
            <SearchOverlay
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              onSelectItem={setSelectedItem}
            />
          )}
        </AnimatePresence>

        {selectedItem?.category === 'event' && (
          <EventDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
        {(selectedItem?.category === 'tour' ||
          selectedItem?.category === 'transfer' ||
          selectedItem?.category === 'rental') && (
          <TourDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            bookingPanel={<ItemBookingComposition guideItemId={selectedItem.id} />}
          />
        )}
        {selectedItem?.category === 'hotel' && (
          <StayDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
        {selectedItem?.category === 'restaurant' && (
          <RestaurantDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
        {selectedItem?.category === 'sight' && (
          <AttractionDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            bookingPanel={<ItemBookingComposition guideItemId={selectedItem.id} />}
          />
        )}
        {selectedItem?.category === 'tips' && (
          <TipDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
        {selectedItem &&
          !['event', 'tour', 'transfer', 'rental', 'hotel', 'restaurant', 'sight', 'tips'].includes(
            selectedItem.category
          ) && <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={closeLoginModal}
          initialTab={loginModalTab}
        />
      </motion.div>
    </div>
  );
}
