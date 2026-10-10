// Contratos e tipos públicos do domínio de Notificações
export type { Notification, NotificationSettings } from './types/notification';

// Hooks públicos do domínio de Notificações
export { useNotifications } from './hooks/useNotifications';
export { useNotificationSettings } from './hooks/useNotificationSettings';

// Componentes públicos do domínio de Notificações
export { NotificationBell } from './components/NotificationBell';
export { NotificationPanel } from './components/NotificationPanel';

// Use Cases públicos do domínio de Notificações
export { subscribeToNotificationsUseCase } from './application/usecases/subscribeToNotificationsUseCase';
export { markNotificationAsReadUseCase } from './application/usecases/markNotificationAsReadUseCase';
export { markAllNotificationsAsReadUseCase } from './application/usecases/markAllNotificationsAsReadUseCase';
export { getNotificationSettingsUseCase } from './application/usecases/getNotificationSettingsUseCase';
export { updateNotificationSettingsUseCase } from './application/usecases/updateNotificationSettingsUseCase';
export { sendAdminNotificationUseCase } from './application/usecases/sendAdminNotificationUseCase';
