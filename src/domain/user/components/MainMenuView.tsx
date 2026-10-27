import { Handshake, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../shared/utils/businessDateTime';
import { getUserInitials } from '../../../shared/utils/formatters';
import { BackButton } from '../../../ui/components/BackButton';
import { TextButton } from '../../../ui/components/TextButton';
import type { UserSession } from '../../auth/types/auth';
import { MenuRow } from './menu/MenuRow';
import { ProfileAvatar } from './menu/ProfileAvatar';
import { SignInPanel } from './menu/SignInPanel';

interface MainMenuViewProps {
  user: UserSession | null;
  userData: { firstName: string; lastName: string };
  /** Data de criação da conta (ISO), para "No Use Guide desde…". */
  memberSince: string | null;
  isAdmin: boolean;
  isPartner: boolean;
  isUploading: boolean;
  photoURL: string | null;
  onClose: () => void;
  onAccountOpen: () => void;
  onPartnersOpen: () => void;
  onAdminOpen: () => void;
  onLogout: () => void;
  onPhotoClick: () => void;
  /** "Próximo" e os cartões de ingressos, reservas, favoritos e avaliações, da composição. */
  highlights?: ReactNode;
}

/** Tela principal do menu (D19): perfil com login; sem login, entrar ou cadastrar. */
export function MainMenuView({
  user,
  userData,
  memberSince,
  isAdmin,
  isPartner,
  isUploading,
  photoURL,
  onClose,
  onAccountOpen,
  onPartnersOpen,
  onAdminOpen,
  onLogout,
  onPhotoClick,
  highlights,
}: MainMenuViewProps) {
  const { t, i18n } = useTranslation();
  const fullName = userData.firstName ? `${userData.firstName} ${userData.lastName}`.trim() : '';
  const name = fullName || user?.displayName || t('menu.userFallback');

  return (
    <>
      <div className="mb-4 pr-12">
        <BackButton label={t('menu.closeMenu')} onClick={onClose} />
      </div>
      {user ? (
        <div className="space-y-5">
          <div className="flex flex-col items-center text-center">
            <ProfileAvatar
              photoURL={photoURL}
              initials={getUserInitials(user.displayName || fullName, user.email)}
              isUploading={isUploading}
              onPhotoClick={onPhotoClick}
            />
            <h2 className="mt-3 text-2xl font-display font-bold text-ink break-words">{name}</h2>
            {memberSince && (
              <p className="text-[13px] text-ink/70">
                {t('profile.memberSince', {
                  date: formatBusinessDate(memberSince, i18n.language, {
                    month: 'long',
                    year: 'numeric',
                  }),
                })}
              </p>
            )}
          </div>
          {highlights}
          <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
            <MenuRow icon={User} label={t('profile.account')} onClick={onAccountOpen} />
            {isAdmin || isPartner ? (
              <MenuRow
                icon={Handshake}
                label={isAdmin ? t('menu.managementPanel') : t('menu.myPanel')}
                onClick={onAdminOpen}
              />
            ) : (
              <MenuRow
                icon={Handshake}
                label={t('profile.partnerProgram')}
                onClick={onPartnersOpen}
              />
            )}
          </ul>
          <div className="pt-4 flex justify-center">
            <TextButton tone="danger" onClick={onLogout}>
              {t('profile.logout')}
            </TextButton>
          </div>
        </div>
      ) : (
        <SignInPanel onPartnersOpen={onPartnersOpen} />
      )}
    </>
  );
}
