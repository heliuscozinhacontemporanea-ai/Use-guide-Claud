// Contratos e tipos públicos do domínio de Notificações

export { getNotificationSettingsUseCase } from './application/usecases/getNotificationSettingsUseCase';
export { markAllNotificationsAsReadUseCase } from './application/usecases/markAllNotificationsAsReadUseCase';
export { markNotificationAsReadUseCase } from './application/usecases/markNotificationAsReadUseCase';
export { sendAdminNotificationUseCase } from './application/usecases/sendAdminNotificationUseCase';
// Use Cases públicos do domínio de Notificações
export { subscribeToNotificationsUseCase } from './application/usecases/subscribeToNotificationsUseCase';
export { updateNotificationSettingsUseCase } from './application/usecases/updateNotificationSettingsUseCase';
// Componentes públicos do domínio de Notificações
export { NotificationBell } from './components/NotificationBell';
export { NotificationPanel } from './components/NotificationPanel';
// Público só para src/app (menu lateral › Configurações).
export { NotificationSettingsView } from './components/NotificationSettingsView';
export { useNotificationSettings } from './hooks/useNotificationSettings';
// Hooks públicos do domínio de Notificações
export { useNotifications } from './hooks/useNotifications';
export type { Notification, NotificationSettings } from './types/notification';
