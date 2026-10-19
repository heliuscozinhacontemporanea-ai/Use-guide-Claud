import { useLocation } from 'react-router-dom';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import { Search, Handshake, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { UserSession } from '../../domain/auth/types/auth';
import { cn } from '../../shared/utils/cn';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { getUserInitials } from '../../shared/utils/formatters';

interface HeaderProps {
  onSearchClick: () => void;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  isScrolled?: boolean;
  isSearchSticky?: boolean;
  onAdminOpen?: () => void;
  isAdmin?: boolean;
  isPartner?: boolean;
  user?: UserSession | null;
}

export function Header({
  onSearchClick,
  isMenuOpen,
  onMenuToggle,
  isScrolled = false,
  onAdminOpen,
  isAdmin = false,
  isPartner = false,
  user = null,
}: HeaderProps) {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { photoURL, profile } = useAuthContext();
  const userInitials = user
    ? getUserInitials(profile?.displayName || user.displayName, user.email)
    : '';
  const { routeKey } = useLocalizedRouting();
  const isMainPage = routeKey === 'explore';

  const isAdminPage = pathname.startsWith('/admin');

  const getPageTitle = () => {
    switch (routeKey) {
      case 'events':
        return t('header.pageTitles.events');
      case 'tours':
        return t('header.pageTitles.tours');
      case 'transfers':
        return t('header.pageTitles.transfers');
      case 'rentals':
        return t('header.pageTitles.rentals');
      case 'stays':
        return t('header.pageTitles.accommodations');
      case 'restaurants':
        return t('header.pageTitles.restaurants');
      case 'attractions':
        return t('header.pageTitles.attractions');
      case 'guide':
        return t('header.pageTitles.practicalGuide');
      default:
        return '';
    }
  };

  const title = getPageTitle();

  const showGlass = isScrolled && !isMainPage;

  return (
    <header
      style={{ zIndex: Z_INDEX.header }}
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 py-5 flex flex-col justify-center bg-transparent border-b border-transparent"
    >
      <div
        className={cn(
          'absolute top-0 left-0 right-0 bottom-0 z-[-1] pointer-events-none',
          showGlass
            ? 'glassmorphism-vibrant border-b border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] opacity-100 transition-all duration-200 ease-out'
            : 'opacity-0 border-b border-transparent shadow-none transition-none'
        )}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            aria-label={isMenuOpen ? t('header.closeMenu') : t('header.openMenu')}
            aria-expanded={isMenuOpen}
            className="relative w-[34px] h-[34px] rounded-xl bg-white/10 border border-white/20 backdrop-blur-2xl p-0.5 flex items-center justify-center active:scale-90 transition-all hover:bg-white/20 text-white/80 shadow-md overflow-hidden group before:absolute before:inset-[-5px] before:content-[''] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
          >
            {user && photoURL ? (
              <img
                src={photoURL}
                alt={t('header.profileAlt')}
                className="w-full h-full rounded-[10px] object-cover"
              />
            ) : user && userInitials ? (
              <div className="w-full h-full rounded-[10px] bg-teal-500/15 border border-teal-400/20 flex items-center justify-center font-display font-black text-[10px] text-teal-300 tracking-wider select-none uppercase">
                {userInitials}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-teal-400/70 group-hover:text-teal-400 transition-colors">
                <UserIcon size={16} />
              </div>
            )}
          </button>
          {isMainPage && user && (isAdmin || isPartner) && (
            <button
              onClick={onAdminOpen}
              title={isAdmin ? t('header.managementPanel') : t('header.myPanel')}
              aria-label={
                isAdmin ? t('header.openManagementPanel') : t('header.openMyPanel')
              }
              className="relative w-[34px] h-[34px] rounded-xl bg-white/10 border border-white/20 backdrop-blur-2xl flex items-center justify-center active:scale-90 transition-all hover:bg-white/20 text-indigo-400 shadow-md animate-fade-in before:absolute before:inset-[-5px] before:content-[''] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
            >
              <Handshake size={16} />
            </button>
          )}
          {!isMainPage && (
            <div className="space-y-0.5">
              <h1 className="text-3xl font-display font-bold tracking-tight text-white/90">
                {title}
              </h1>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isMainPage && !isAdminPage && (
            <button
              onClick={onSearchClick}
              aria-label={t('header.openSearch')}
              className="relative w-[34px] h-[34px] rounded-xl bg-white/10 border border-white/20 backdrop-blur-2xl flex items-center justify-center active:scale-90 transition-all hover:bg-white/20 text-white/80 shadow-md before:absolute before:inset-[-5px] before:content-[''] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
            >
              <Search size={20} className="text-white/80" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
