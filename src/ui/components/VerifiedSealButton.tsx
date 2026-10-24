import { useTranslation } from 'react-i18next';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { Popover } from './Popover';
import { VerifiedBadge } from './VerifiedBadge';

interface VerifiedSealButtonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Selo que explica o que significa ao ser tocado (D11). Não usar dentro de outro botão. */
export function VerifiedSealButton({ size = 'md', className }: VerifiedSealButtonProps) {
  const { t } = useTranslation();
  return (
    <Popover
      zIndex={Z_INDEX.modalNested}
      trigger={
        <button
          type="button"
          aria-label={t('common.seal.label')}
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -m-2 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <VerifiedBadge size={size} className={className} />
        </button>
      }
    >
      <p className="text-sm font-bold text-white">{t('common.seal.title')}</p>
      <p className="text-xs text-white/70 leading-relaxed mt-1">{t('common.seal.explanation')}</p>
    </Popover>
  );
}
