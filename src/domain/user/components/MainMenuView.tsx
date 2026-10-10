import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  User,
  ChevronRight,
  Handshake,
  HelpCircle,
  Info,
  ChevronLeft,
  Camera,
  Heart,
  LifeBuoy,
  Mail,
  Ticket,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { UserSession } from '../../auth/types/auth';
import { useAuth } from '../../auth';
import { useUI } from '../../../shared/stores/useUIStore';
import { getUserInitials } from '../../../shared/utils/formatters';

interface MainMenuViewProps {
  user: UserSession | null;
  userData: { firstName: string; lastName: string };
  isAdmin: boolean;
  isPartner: boolean;
  isUploading: boolean;
  onClose: () => void;
  onAccountOpen: () => void;
  onFavoritesOpen: () => void;
  onTicketsOpen?: () => void;
  onPartnersOpen: () => void;
  onAboutOpen: () => void;
  onSupportOpen: () => void;
  onAdminOpen: () => void;
  onLogout: () => void;
  onPhotoClick: () => void;
  photoURL: string | null;
}

export function MainMenuView({
  user,
  userData,
  isAdmin,
  isPartner,
  isUploading,
  onClose,
  onAccountOpen,
  onFavoritesOpen,
  onTicketsOpen,
  onPartnersOpen,
  onAboutOpen,
  onSupportOpen,
  onAdminOpen,
  onLogout,
  onPhotoClick,
  photoURL,
}: MainMenuViewProps) {
  const { t } = useTranslation();
  const { openLoginModal } = useUI();
  const { loginWithGoogle } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

  const userInitials = user
    ? getUserInitials(user.displayName || `${userData.firstName} ${userData.lastName}`, user.email)
    : '';

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      if (err?.code === 'auth/popup-blocked') {
        setAuthError(
          'O pop-up de login foi bloqueado pelo navegador. Habilite pop-ups para continuar.'
        );
      } else if (err?.code === 'auth/unauthorized-domain') {
        setAuthError(
          'Domínio não autorizado nas configurações do Firebase. Recarregue a página e tente novamente.'
        );
      } else {
        setAuthError(err?.message || 'Não foi possível autenticar com o Google.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center relative mb-8 pt-2 px-10">
        <button
          onClick={onClose}
          aria-label={t('menu.closeMenu')}
          className="absolute left-0 p-2 text-white/70 hover:text-white active:scale-90 transition-all z-10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-display font-black mb-1 text-white leading-tight">
            {t('menu.mainTitle')}
          </h2>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
            {t('menu.subtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {user && (
          <div className="flex flex-col items-center mb-4">
            <div className="relative group">
              <button
                onClick={onPhotoClick}
                disabled={isUploading}
                aria-label={t('menu.changeProfilePhoto')}
                className="w-28 h-28 rounded-[2.5rem] border-2 border-teal-500/20 p-1.5 bg-white/5 overflow-hidden relative active:scale-95 transition-all shadow-2xl shadow-teal-500/10 group-hover:border-teal-500/40"
              >
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Profile"
                    className="w-full h-full rounded-[2rem] object-cover"
                  />
                ) : userInitials ? (
                  <div className="w-full h-full flex items-center justify-center text-teal-300 font-display font-black text-3xl bg-teal-500/15 border border-teal-400/20 rounded-[2rem] select-none uppercase tracking-wider">
                    {userInitials}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-teal-400 bg-teal-500/10 rounded-[2rem]">
                    <User size={48} />
                  </div>
                )}

                <div
                  className={cn(
                    'absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity',
                    isUploading && 'opacity-100'
                  )}
                >
                  {isUploading ? (
                    <div className="flex gap-1.5 items-center justify-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [0, -4, 0],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                          }}
                          className="w-2 h-2 bg-white rounded-full shadow-sm"
                        />
                      ))}
                    </div>
                  ) : (
                    <Camera className="text-white" size={20} />
                  )}
                </div>
              </button>
            </div>

            <h3 className="mt-2 text-2xl font-display font-black text-white text-center">
              {userData.firstName
                ? `${userData.firstName} ${userData.lastName}`
                : user.displayName || t('menu.userFallback')}
            </h3>
          </div>
        )}

        <div className="mt-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3 ml-1">
            {t('menu.signInOrRegister')}
          </p>

          {user ? (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onAccountOpen}
                className="w-full flex items-center justify-between gap-3 p-4 rounded-[1.5rem] glassmorphism text-white active:scale-95 transition-all text-[10px] font-black uppercase tracking-[0.1em] border border-white/10 group focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 group-hover:scale-110 transition-all shadow-lg shadow-teal-500/5">
                    <User size={16} />
                  </div>
                  <span className="text-white/80">{t('menu.account')}</span>
                </div>
                <ChevronRight
                  size={14}
                  className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                />
              </button>

              <button
                type="button"
                onClick={onFavoritesOpen}
                className="w-full flex items-center justify-between gap-3 p-4 rounded-[1.5rem] glassmorphism text-white active:scale-95 transition-all text-[10px] font-black uppercase tracking-[0.1em] border border-white/10 group focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:bg-rose-500/20 group-hover:scale-110 transition-all shadow-lg shadow-rose-500/5">
                    <Heart size={16} className="fill-rose-500/20" />
                  </div>
                  <span className="text-white/80">{t('menu.favorites')}</span>
                </div>
                <ChevronRight
                  size={14}
                  className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                />
              </button>

              {onTicketsOpen && (
                <button
                  type="button"
                  onClick={onTicketsOpen}
                  className="w-full flex items-center justify-between gap-3 p-4 rounded-[1.5rem] glassmorphism text-white active:scale-95 transition-all text-[10px] font-black uppercase tracking-[0.1em] border border-white/10 group focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 group-hover:scale-110 transition-all shadow-lg shadow-teal-500/5">
                      <Ticket size={16} />
                    </div>
                    <span className="text-white/80">Meus Ingressos</span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                  />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  openLoginModal();
                }}
                className="w-full h-12 min-h-[44px] rounded-2xl glassmorphism bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-xs font-bold uppercase tracking-widest text-white flex items-center justify-center gap-2.5 focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <Mail size={16} className="text-teal-400" />
                <span>{t('menu.emailPassword')}</span>
              </button>

              <div className="flex items-center gap-3 my-2.5">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                  {t('menu.orUse')}
                </span>
                <div className="h-[1px] flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full h-12 min-h-[44px] rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-white flex items-center justify-center gap-3 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      className="w-5 h-5"
                      alt="Google"
                      loading="lazy"
                    />
                    <span className="text-xs font-bold text-white/70">{t('menu.continueGoogle')}</span>
                  </>
                )}
              </button>

              {authError && (
                <p
                  role="alert"
                  className="text-[11px] text-rose-400 font-medium text-center p-2 rounded-xl bg-rose-500/10 border border-rose-500/20"
                >
                  {authError}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="pt-3 space-y-2.5">
          {user && (isAdmin || isPartner) && (
            <button
              type="button"
              onClick={onAdminOpen}
              className="w-full flex items-center justify-between gap-3 p-4 rounded-[1.5rem] glassmorphism text-white active:scale-95 transition-all text-[10px] font-black uppercase tracking-[0.1em] border border-white/10 group focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 shadow-lg shadow-indigo-500/5">
                  <Handshake size={16} />
                </div>
                <span className="text-white/80 group-hover:text-white transition-colors">
                  {isAdmin ? t('menu.managementPanel') : t('menu.myPanel')}
                </span>
              </div>
              <ChevronRight
                size={14}
                className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
              />
            </button>
          )}

          <div className="pt-4 space-y-2.5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2 ml-1">
              {t('menu.servicesInfo')}
            </p>

            {!isPartner && (
              <button
                type="button"
                onClick={onPartnersOpen}
                className="w-full flex items-center justify-between gap-3 p-4 rounded-[1.5rem] glassmorphism text-white active:scale-95 transition-all text-[10px] font-black uppercase tracking-[0.1em] border border-white/10 group focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all shadow-lg shadow-indigo-500/5">
                    <Handshake size={16} />
                  </div>
                  <span className="text-white/80">{t('menu.partnerProgram')}</span>
                </div>
                <ChevronRight
                  size={14}
                  className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                />
              </button>
            )}

            <button
              type="button"
              className="w-full flex items-center justify-between gap-3 p-4 rounded-[1.5rem] glassmorphism text-white active:scale-95 transition-all text-[10px] font-black uppercase tracking-[0.1em] border border-white/10 group focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500/20 group-hover:scale-110 transition-all shadow-lg shadow-red-500/5">
                  <LifeBuoy size={16} />
                </div>
                <span className="text-white/80">{t('menu.emergencyCenter')}</span>
              </div>
              <ChevronRight
                size={14}
                className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
              />
            </button>

            <button
              type="button"
              onClick={onSupportOpen}
              className="w-full flex items-center justify-between gap-3 p-4 rounded-[1.5rem] glassmorphism text-white active:scale-95 transition-all text-[10px] font-black uppercase tracking-[0.1em] border border-white/10 group focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 group-hover:scale-110 transition-all shadow-lg shadow-sky-500/5">
                  <HelpCircle size={16} />
                </div>
                <span className="text-white/80">{t('menu.support')}</span>
              </div>
              <ChevronRight
                size={14}
                className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
              />
            </button>

            <button
              type="button"
              onClick={onAboutOpen}
              className="w-full flex items-center justify-between gap-3 p-4 rounded-[1.5rem] glassmorphism text-white active:scale-95 transition-all text-[10px] font-black uppercase tracking-[0.1em] border border-white/10 group animate-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/20 group-hover:scale-110 transition-all shadow-lg shadow-orange-500/5">
                  <Info size={16} />
                </div>
                <span className="text-white/80">{t('menu.aboutApp')}</span>
              </div>
              <ChevronRight
                size={14}
                className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
              />
            </button>
          </div>
        </div>

        {user && (
          <div className="pt-10 pb-4 flex justify-center">
            <button
              type="button"
              onClick={onLogout}
              className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-rose-400 hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-90 transition-all min-h-[44px] px-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-rose-500/50"
            >
              {t('menu.logout')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
