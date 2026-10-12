import { LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { MyBookingsView } from '../../domain/bookings';
import { useUI } from '../../shared/stores/useUIStore';
import { MessagePage } from '../../ui/components/MessagePage';

export function MyBookingsPageComposition() {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { openLoginModal } = useUI();

  if (!user) {
    return (
      <MessagePage
        icon={LogIn}
        title={t('bookings.buyer.myBookingsTitle')}
        description={t('bookings.buyer.loginRequired')}
        actionLabel={t('bookings.buyer.login')}
        onAction={openLoginModal}
      />
    );
  }
  return <MyBookingsView />;
}
