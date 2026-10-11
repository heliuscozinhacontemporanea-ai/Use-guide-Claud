import { Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import { MessagePage } from './MessagePage';

export function NotFoundView() {
  const { t } = useTranslation();
  const { goTo } = useLocalizedRouting();
  return (
    <MessagePage
      icon={Compass}
      title={t('pages.notFoundTitle')}
      description={t('pages.notFoundDescription')}
      actionLabel={t('pages.backHome')}
      onAction={() => goTo('explore')}
    />
  );
}
