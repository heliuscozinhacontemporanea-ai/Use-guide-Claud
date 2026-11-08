import { useTranslation } from 'react-i18next';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';

/** Resumo da escolha de avisos de venda, para a linha Notificações do painel (p24). */
export function SalesAlertsSummary() {
  const { t } = useTranslation();
  const { preferences } = useNotificationPreferences();
  if (!preferences) return null;
  return <>{t(preferences.salesAlerts === 'daily' ? 'notify.sales.daily' : 'notify.sales.each')}</>;
}
