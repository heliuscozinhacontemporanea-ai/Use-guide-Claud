import { useTranslation } from 'react-i18next';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import { cn } from '../../shared/utils/cn';
import { BUTTON_PRIMARY } from '../styles/controls';
import { HamsterWheel } from './HamsterWheel';

/** Página não encontrada em tela cheia: "404" com o hamster na roda no lugar do zero. */
export function NotFoundView() {
  const { t } = useTranslation();
  const { goTo } = useLocalizedRouting();
  return (
    <main
      className="fixed inset-0 bg-app text-ink flex flex-col items-center justify-center gap-5 px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-center overflow-y-auto"
      style={{ zIndex: Z_INDEX.overlay }}
    >
      <p className="flex items-center justify-center gap-1 font-display font-black leading-none text-ink text-[96px] sm:text-[140px]">
        <span className="sr-only">404</span>
        <span aria-hidden="true">4</span>
        <HamsterWheel className="text-[7px] sm:text-[10px]" />
        <span aria-hidden="true">4</span>
      </p>
      <h1 className="text-[22px] sm:text-[28px] font-display font-bold">
        {t('pages.notFoundTitle')}
      </h1>
      <p className="max-w-sm text-[15px] text-ink/70 leading-relaxed">
        {t('pages.notFoundDescription')}
      </p>
      <button
        type="button"
        onClick={() => goTo('explore')}
        className={cn(BUTTON_PRIMARY, 'min-h-12 px-6 mt-2')}
      >
        {t('pages.backHome')}
      </button>
    </main>
  );
}
