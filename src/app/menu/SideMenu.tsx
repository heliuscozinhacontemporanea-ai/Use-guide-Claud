import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { hasPasswordSignInUseCase, logoutUseCase } from '../../domain/auth';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { UserRole } from '../../domain/auth/types/auth';
import { AboutView, SupportView } from '../../domain/content';
import { FavoritesList } from '../../domain/favorites';
import {
  useUserProfile,
  useUserPhoto,
  ChangePasswordView,
  ImageCropperView,
  MainMenuView,
  AccountView,
  SettingsView,
  LanguageSettingsView,
  AppearanceSettingsView,
} from '../../domain/user';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { cn } from '../../shared/utils/cn';
import { SidebarLayout } from '../../ui/layouts/SidebarLayout';
import { BuyerBookingsComposition } from '../compositions/BuyerBookingsComposition';
import { BuyerTicketWalletComposition } from '../compositions/BuyerTicketWalletComposition';
import { type MenuView, parentMenuView, visibleMenuView } from './menuViews';
import { useSideMenu } from './useSideMenu';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';

interface SideMenuProps {
  onPartnersOpen: () => void;
  onAdminOpen: () => void;
}

/** Telas que ocupam a altura toda do menu e rolam por dentro. */
const FULL_HEIGHT_VIEWS: readonly MenuView[] = [
  'settings',
  'language',
  'appearance',
  'support',
  'about',
];

const SETTINGS_VIEWS: readonly MenuView[] = ['settings', 'language', 'appearance'];

/** Compõe as telas de vários domínios (usuário, ingressos, reservas, favoritos, conteúdo) no menu. */
export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
  const { user } = useAuthContext();
  const { goTo } = useLocalizedRouting();
  const {
    view: requestedView,
    isOpen,
    openMenu,
    backTo,
    closeMenu,
    closeMenuAndOpenItem,
  } = useSideMenu();
  // Papel vem da sessão (claims + perfil), a mesma fonte que o AppRouter usa para abrir os painéis.
  const isPartner = user?.role === UserRole.PARTNER;
  const isAdmin = user?.role === UserRole.ADMIN;
  const view = visibleMenuView(requestedView ?? 'main', Boolean(user));
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const showView = (target: MenuView) => openMenu(target);
  const goBack = () => backTo(parentMenuView(view));

  React.useEffect(() => {
    if (view !== 'account') {
      setShowDeleteConfirm(false);
    }
  }, [view]);

  const {
    userData,
    setUserData,
    passwordData,
    setPasswordData,
    showPasswords,
    setShowPasswords,
    isLoading,
    message,
    setMessage,
    updateProfile,
    updatePassword,
    deleteAccount,
  } = useUserProfile(() => {
    goTo('explore');
  });

  const {
    photoURL,
    isUploading,
    imageToCrop,
    isCropping,
    crop,
    zoom,
    setZoom,
    fileInputRef,
    onCropChange,
    onZoomChange,
    onCropComplete,
    handlePhotoSelect,
    handleConfirmCrop,
    cancelCropping,
  } = useUserPhoto((msg) => setMessage(msg));

  const menuUser = user
    ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        role: user.role,
        isAnonymous: user.isAnonymous,
      }
    : null;

  const handleUpdatePassword = async () => {
    const success = await updatePassword();
    if (success) {
      setTimeout(goBack, 2000);
    }
  };

  const handleLogout = async () => {
    await logoutUseCase();
    closeMenu();
  };

  const renderView = (): React.ReactNode => {
    switch (view) {
      case 'appearance':
        return <AppearanceSettingsView onBack={goBack} />;
      case 'language':
        return <LanguageSettingsView onBack={goBack} />;
      case 'settings':
        return (
          <SettingsView
            onBack={goBack}
            onOpenLanguage={() => showView('language')}
            onOpenAppearance={() => showView('appearance')}
          />
        );
      case 'password':
        return (
          <ChangePasswordView
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            showPasswords={showPasswords}
            setShowPasswords={setShowPasswords}
            isLoading={isLoading}
            message={message}
            onUpdatePassword={handleUpdatePassword}
            onBack={goBack}
          />
        );
      case 'about':
        return <AboutView onBack={goBack} />;
      case 'support':
        return <SupportView onBack={goBack} userEmail={user?.email} />;
      case 'tickets':
        return <BuyerTicketWalletComposition onBack={goBack} />;
      case 'bookings':
        return <BuyerBookingsComposition onBack={goBack} />;
      case 'favorites':
        return <FavoritesList onBack={goBack} onSelectItem={closeMenuAndOpenItem} />;
      case 'account':
        return (
          <AccountView
            user={menuUser}
            userData={{
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone || '',
            }}
            setUserData={setUserData}
            isLoading={isLoading}
            isPartner={isPartner}
            message={message}
            showDeleteConfirm={showDeleteConfirm}
            setShowDeleteConfirm={setShowDeleteConfirm}
            onUpdateProfile={updateProfile}
            onChangePassword={() => {
              setMessage(null);
              setPasswordData({ current: '', new: '', confirm: '' });
              showView('password');
            }}
            onDeleteAccount={deleteAccount}
            hasPassword={hasPasswordSignInUseCase()}
            onBack={goBack}
          />
        );
      case 'main':
        return (
          <>
            <MainMenuView
              user={menuUser}
              userData={userData}
              isAdmin={isAdmin}
              isPartner={isPartner}
              isUploading={isUploading}
              onClose={closeMenu}
              onAccountOpen={() => showView('account')}
              onFavoritesOpen={() => showView('favorites')}
              onTicketsOpen={() => showView('tickets')}
              onBookingsOpen={() => showView('bookings')}
              onPartnersOpen={onPartnersOpen}
              onAboutOpen={() => showView('about')}
              onSupportOpen={() => showView('support')}
              onAdminOpen={onAdminOpen}
              onLogout={handleLogout}
              onPhotoClick={() => fileInputRef.current?.click()}
              photoURL={photoURL}
            />
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoSelect}
            />
          </>
        );
    }
  };

  return (
    <SidebarLayout
      isOpen={isOpen}
      onClose={closeMenu}
      isCropping={isCropping}
      onSettingsClick={
        isCropping || SETTINGS_VIEWS.includes(view) ? undefined : () => showView('settings')
      }
    >
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{ zIndex: Z_INDEX.toast }}
            className={cn(
              'absolute top-4 left-4 right-4 p-4 rounded-3xl border text-[10px] font-black uppercase tracking-widest text-center shadow-2xl cursor-pointer text-white',
              message.type === 'success'
                ? 'bg-teal-500/80 border-teal-500/40 shadow-teal-500/20 backdrop-blur-md'
                : 'bg-rose-500/80 border-rose-500/40 shadow-rose-500/20 backdrop-blur-md'
            )}
            onClick={() => setMessage(null)}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {isCropping ? (
          <motion.div
            key="crop-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex flex-col"
          >
            <ImageCropperView
              imageToCrop={imageToCrop}
              crop={crop}
              zoom={zoom}
              onCropChange={onCropChange}
              onCropComplete={onCropComplete}
              onZoomChange={onZoomChange}
              setZoom={setZoom}
              onCancel={cancelCropping}
              onConfirm={handleConfirmCrop}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`menu-${view}`}
            initial={{ opacity: 0, x: view === 'main' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: view === 'main' ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'w-full',
              FULL_HEIGHT_VIEWS.includes(view) && 'h-full flex flex-col overflow-hidden'
            )}
          >
            {renderView()}
          </motion.div>
        )}
      </AnimatePresence>
    </SidebarLayout>
  );
}
