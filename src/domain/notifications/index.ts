// Contratos e tipos públicos do domínio de Notificações

export { markAllNotificationsAsReadUseCase } from './application/usecases/markAllNotificationsAsReadUseCase';
export { markNotificationAsReadUseCase } from './application/usecases/markNotificationAsReadUseCase';
export { sendAdminNotificationUseCase } from './application/usecases/sendAdminNotificationUseCase';
// Use Cases públicos do domínio de Notificações
export { subscribeToNotificationsUseCase } from './application/usecases/subscribeToNotificationsUseCase';
// Componentes públicos do domínio de Notificações
export { NotificationBell } from './components/NotificationBell';
export { NotificationPanel } from './components/NotificationPanel';
// Público só para src/app (menu lateral › Configurações).
export { NotificationSettingsView } from './components/NotificationSettingsView';
// Hooks públicos do domínio de Notificações
export { useNotifications } from './hooks/useNotifications';
export type { Notification } from './types/notification';
