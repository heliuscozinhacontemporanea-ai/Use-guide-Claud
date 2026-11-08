import { Camera, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';

interface ProfileAvatarProps {
  photoURL: string | null;
  initials: string;
  isUploading: boolean;
  onPhotoClick: () => void;
}

/** Foto do perfil com troca ao toque (o mesmo desenho de antes, com as cores do tema). */
export function ProfileAvatar({
  photoURL,
  initials,
  isUploading,
  onPhotoClick,
}: ProfileAvatarProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onPhotoClick}
      disabled={isUploading}
      aria-label={t('menu.changeProfilePhoto')}
      className="group press relative w-28 h-28 p-1.5 rounded-[2.5rem] border-2 border-accent-line bg-surface overflow-hidden focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
    >
      {photoURL ? (
        <img src={photoURL} alt="" className="w-full h-full rounded-[2rem] object-cover" />
      ) : initials ? (
        <span className="w-full h-full flex items-center justify-center rounded-[2rem] bg-accent-soft text-accent font-display font-bold text-3xl uppercase tracking-wider select-none">
          {initials}
        </span>
      ) : (
        <span className="w-full h-full flex items-center justify-center rounded-[2rem] bg-accent-soft text-accent">
          <User size={48} aria-hidden="true" />
        </span>
      )}
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-scrim opacity-0 group-hover:opacity-100 transition-opacity',
          isUploading && 'opacity-100'
        )}
      >
        {isUploading ? (
          <span className="flex gap-1.5 items-center" role="status">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, delay: i * 0.15 }}
                className="w-2 h-2 rounded-full bg-[#fff8f0]"
              />
            ))}
          </span>
        ) : (
          <Camera size={20} className="text-[#fff8f0]" aria-hidden="true" />
        )}
      </span>
    </button>
  );
}
