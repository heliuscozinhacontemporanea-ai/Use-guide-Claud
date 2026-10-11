import React from 'react';
import { UserRole } from '../../domain/auth/types/auth';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { logoutUseCase } from '../../domain/auth';
import { useNavigate } from 'react-router-dom';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import { cn } from '../../shared/utils/cn';
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

// Sub-components
import { SidebarLayout } from './SidebarLayout';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { useUI } from '../../shared/stores/useUIStore';
import { AboutView } from '../../domain/content/components/AboutView';
import { SupportView } from '../../domain/content/components/SupportView';
import { UserTicketsHistoryView } from '../../domain/ticketing';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onPartnersOpen: () => void;
  onAdminOpen: () => void;
}

export function SideMenu({ isOpen, onClose, onPartnersOpen, onAdminOpen }: SideMenuProps) {
  const { user } = useAuthContext();
  const { openLoginModal } = useUI();
  const navigate = useNavigate();
  const { goTo } = useLocalizedRouting();

  const [isChangePasswordViewOpen, setIsChangePasswordViewOpen] = React.useState(false);
  const [isAboutViewOpen, setIsAboutViewOpen] = React.useState(false);
  const [isSupportViewOpen, setIsSupportViewOpen] = React.useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = React.useState(false);
  const [isSettingsViewOpen, setIsSettingsViewOpen] = React.useState(false);
  const [isLanguageViewOpen, setIsLanguageViewOpen] = React.useState(false);
  const [isAppearanceViewOpen, setIsAppearanceViewOpen] = React.useState(false);
  const [isTicketsViewOpen, setIsTicketsViewOpen] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setIsChangePasswordViewOpen(false);
      setIsAboutViewOpen(false);
      setIsSupportViewOpen(false);
      setIsUserProfileOpen(false);
      setIsSettingsViewOpen(false);
      setIsLanguageViewOpen(false);
      setIsAppearanceViewOpen(false);
      setIsTicketsViewOpen(false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!user) {
      setIsUserProfileOpen(false);
    }
  }, [user]);

  const {
    userData,
    setUserData,
    passwordData,
    setPasswordData,
    showPasswords,
    setShowPasswords,
    isLoading,
    isPartner,
    isAdmin,
    message,
    setMessage,
    updateProfile,
    updatePassword,
    deleteAccount,
  } = useUserProfile(() => {
    onClose();
    navigate('/');
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

  const handleUpdatePassword = async () => {
    const success = await updatePassword();
    if (success) {
      setTimeout(() => setIsChangePasswordViewOpen(false), 2000);
    }
  };

  const handleLogout = async () => {
    await logoutUseCase();
    onClose();
  };

  const menuContent = (
    <SidebarLayout
      isOpen={isOpen}
      onClose={onClose}
      isCropping={isCropping}
      onSettingsClick={
        isCropping || isSettingsViewOpen || isLanguageViewOpen || isAppearanceViewOpen
          ? undefined
          : () => {
              setIsSettingsViewOpen(true);
              setIsLanguageViewOpen(false);
              setIsAppearanceViewOpen(false);
              setIsAboutViewOpen(false);
              setIsSupportViewOpen(false);
              setIsChangePasswordViewOpen(false);
              setIsUserProfileOpen(false);
            }
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
        ) : isAppearanceViewOpen ? (
          <motion.div
            key="appearance-settings-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex flex-col overflow-hidden"
          >
            <AppearanceSettingsView onBack={() => setIsAppearanceViewOpen(false)} />
          </motion.div>
        ) : isLanguageViewOpen ? (
          <motion.div
            key="language-settings-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex flex-col overflow-hidden"
          >
            <LanguageSettingsView onBack={() => setIsLanguageViewOpen(false)} />
          </motion.div>
        ) : isSettingsViewOpen ? (
          <motion.div
            key="settings-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex flex-col overflow-hidden"
          >
            <SettingsView
              onBack={() => setIsSettingsViewOpen(false)}
              onOpenLanguage={() => setIsLanguageViewOpen(true)}
              onOpenAppearance={() => setIsAppearanceViewOpen(true)}
            />
          </motion.div>
        ) : isChangePasswordViewOpen ? (
          <motion.div
            key="password-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <ChangePasswordView
              passwordData={passwordData}
              setPasswordData={setPasswordData}
              showPasswords={showPasswords}
              setShowPasswords={setShowPasswords}
              isLoading={isLoading}
              message={message}
              onUpdatePassword={handleUpdatePassword}
              onBack={() => setIsChangePasswordViewOpen(false)}
            />
          </motion.div>
        ) : isAboutViewOpen ? (
          <motion.div
            key="about-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex flex-col overflow-hidden"
          >
            <AboutView onBack={() => setIsAboutViewOpen(false)} />
          </motion.div>
        ) : isSupportViewOpen ? (
          <motion.div
            key="support-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex flex-col overflow-hidden"
          >
            <SupportView onBack={() => setIsSupportViewOpen(false)} userEmail={user?.email} />
          </motion.div>
        ) : isTicketsViewOpen && user ? (
          <motion.div
            key="tickets-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <UserTicketsHistoryView onBack={() => setIsTicketsViewOpen(false)} />
          </motion.div>
        ) : isUserProfileOpen && user ? (
          <motion.div
            key="account-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <AccountView
              user={
                user
                  ? {
                      uid: user.uid,
                      email: user.email,
                      displayName: user.displayName,
                      photoURL: user.photoURL,
                      emailVerified: user.emailVerified,
                      role: isPartner ? UserRole.PARTNER : isAdmin ? UserRole.ADMIN : UserRole.USER,
                      isAnonymous: user.isAnonymous,
                    }
                  : null
              }
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
                setIsChangePasswordViewOpen(true);
                setMessage(null);
                setPasswordData({ current: '', new: '', confirm: '' });
              }}
              onDeleteAccount={deleteAccount}
              onBack={() => {
                setIsUserProfileOpen(false);
                setShowDeleteConfirm(false);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="main-menu"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <MainMenuView
              user={
                user
                  ? {
                      uid: user.uid,
                      email: user.email,
                      displayName: user.displayName,
                      photoURL: user.photoURL,
                      emailVerified: user.emailVerified,
                      role: isPartner ? UserRole.PARTNER : isAdmin ? UserRole.ADMIN : UserRole.USER,
                      isAnonymous: user.isAnonymous,
                    }
                  : null
              }
              userData={userData}
              isAdmin={isAdmin}
              isPartner={isPartner}
              isUploading={isUploading}
              onClose={onClose}
              onAccountOpen={() => setIsUserProfileOpen(true)}
              onFavoritesOpen={() => {
                onClose();
                goTo('favorites');
              }}
              onTicketsOpen={() => setIsTicketsViewOpen(true)}
              onPartnersOpen={onPartnersOpen}
              onAboutOpen={() => setIsAboutViewOpen(true)}
              onSupportOpen={() => setIsSupportViewOpen(true)}
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
          </motion.div>
        )}
      </AnimatePresence>
    </SidebarLayout>
  );

  return menuContent;
}
