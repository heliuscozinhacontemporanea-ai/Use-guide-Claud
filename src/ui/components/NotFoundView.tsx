import { useTranslation } from 'react-i18next';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import { HamsterWheel } from './HamsterWheel';
import { MessagePage } from './MessagePage';

/** "404" com o hamster na roda no lugar do zero: lido como "404" pelo leitor de tela. */
function NotFoundNumber() {
  return (
    <p className="flex items-center justify-center gap-1 font-display font-black leading-none text-ink text-[96px] sm:text-[120px]">
      <span className="sr-only">404</span>
      <span aria-hidden="true">4</span>
      <HamsterWheel className="text-[7px] sm:text-[9px]" />
      <span aria-hidden="true">4</span>
    </p>
  );
}

export function NotFoundView() {
  const { t } = useTranslation();
  const { goTo } = useLocalizedRouting();
  return (
    <MessagePage
      visual={<NotFoundNumber />}
      title={t('pages.notFoundTitle')}
      description={t('pages.notFoundDescription')}
      actionLabel={t('pages.backHome')}
      onAction={() => goTo('explore')}
    />
  );
}
