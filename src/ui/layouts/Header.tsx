import { Handshake, Search, User as UserIcon } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { screenTitleKey } from '../../shared/constants/navigation';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import { cn } from '../../shared/utils/cn';
import { FADE, SPRING } from '../motion/tokens';

interface HeaderProps {
  onSearchClick: () => void;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  /** A página rolou: o topo vira barra fixa com vidro (§5.1). */
  isScrolled?: boolean;
  /** O título grande saiu de vista: o nome da tela aparece no meio da barra (D37). */
  showTitle?: boolean;
  onAdminOpen?: () => void;
  isAdmin?: boolean;
  isPartner?: boolean;
  /** Quem está logado, montado em src/app (o design system não conhece domínios). */
  account?: { photoURL: string | null; displayName: string | null; email: string | null } | null;
  /** Sininho de notificações, montado em src/app (o design system não conhece domínios). */
  notificationSlot?: ReactNode;
}

const ICON_BUTTON =
  'press relative w-11 h-11 rounded-control flex items-center justify-center text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';

/**
 * Topo principal (DESIGN.md §8, D37): Perfil e atalho do painel à esquerda, busca e avisos à direita,
 * todos ícones de 24 px sem fundo. O título grande fica na página; ao rolar, o topo vira barra com
 * vidro e o nome da tela aparece no meio.
 */
export function Header({
  onSearchClick,
  isMenuOpen,
  onMenuToggle,
  isScrolled = false,
  showTitle = false,
  onAdminOpen,
  isAdmin = false,
  isPartner = false,
  account = null,
  notificationSlot,
}: HeaderProps) {
  const { t } = useTranslation();
  const { routeKey } = useLocalizedRouting();
  const reduceMotion = useReducedMotion();
  const titleKey = screenTitleKey(routeKey);
  const showPanel = Boolean(account) && (isAdmin || isPartner);

  return (
    <header
      style={{ zIndex: Z_INDEX.header }}
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-2 pt-[env(safe-area-inset-top)]"
    >
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 -z-10 pointer-events-none transition-opacity duration-200 ease-out',
          isScrolled ? 'glassmorphism-vibrant border-b border-line opacity-100' : 'opacity-0'
        )}
      />
      <div className="relative h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label={isMenuOpen ? t('header.closeMenu') : t('header.openMenu')}
            aria-expanded={isMenuOpen}
            className={ICON_BUTTON}
          >
            {account?.photoURL ? (
              <img src={account.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <UserIcon size={24} aria-hidden="true" />
            )}
          </button>
          {showPanel && (
            <button
              type="button"
              onClick={onAdminOpen}
              aria-label={isAdmin ? t('header.openManagementPanel') : t('header.openMyPanel')}
              className={ICON_BUTTON}
            >
              <Handshake size={24} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* O nome repete o título grande da página, que já é o h1: o leitor de tela lê só aquele. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-28 inset-y-0 flex items-center justify-center pointer-events-none"
        >
          <AnimatePresence>
            {showTitle && titleKey && (
              <motion.span
                key={titleKey}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
                transition={reduceMotion ? FADE : SPRING}
                className="text-title font-semibold text-ink truncate"
              >
                {t(titleKey)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={onSearchClick}
            aria-label={t('header.openSearch')}
            className={ICON_BUTTON}
          >
            <Search size={24} aria-hidden="true" />
          </button>
          {notificationSlot}
        </div>
      </div>
    </header>
  );
}
