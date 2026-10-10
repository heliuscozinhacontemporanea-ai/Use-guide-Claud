import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notificationService';
import type {
  CreateNotificationInput,
  NotificationRepositoryPort,
} from '../ports/notificationRepositoryPort';

function createRepositoryMock(): NotificationRepositoryPort {
  return {
    createNotification: vi.fn(),
    createBulkNotifications: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    isNotificationTypeEnabled: vi.fn(),
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
  };
}

describe('NotificationService', () => {
  let repository: NotificationRepositoryPort;
  let service: NotificationService;

  beforeEach(() => {
    vi.clearAllMocks();

    repository = createRepositoryMock();
    service = new NotificationService(repository);
  });

  it('deve criar uma notificação de review quando estiver habilitada', async () => {
    vi.mocked(repository.isNotificationTypeEnabled).mockResolvedValue(true);

    const input: CreateNotificationInput = {
      recipientPartnerId: 'partner-1',
      type: 'review',
      title: 'Nova avaliação',
      message: 'Você recebeu uma nova avaliação.',
      relatedItemId: 'item-1',
    };

    await service.createNotification(input);

    expect(repository.isNotificationTypeEnabled).toHaveBeenCalledWith('partner-1', 'review');

    expect(repository.createNotification).toHaveBeenCalledWith(input);
  });

  it('não deve criar review notification quando estiver desabilitada', async () => {
    vi.mocked(repository.isNotificationTypeEnabled).mockResolvedValue(false);

    await service.createNotification({
      recipientPartnerId: 'partner-1',
      type: 'review',
      title: 'Nova avaliação',
      message: 'Mensagem',
    });

    expect(repository.createNotification).not.toHaveBeenCalled();
  });

  it('deve criar plan_expiring quando estiver habilitado', async () => {
    vi.mocked(repository.isNotificationTypeEnabled).mockResolvedValue(true);

    const input: CreateNotificationInput = {
      recipientPartnerId: 'partner-1',
      type: 'plan_expiring',
      title: 'Plano expirando',
      message: 'Seu plano expira em 3 dias.',
    };

    await service.createNotification(input);

    expect(repository.isNotificationTypeEnabled).toHaveBeenCalledWith('partner-1', 'plan_expiring');

    expect(repository.createNotification).toHaveBeenCalledWith(input);
  });

  it('deve criar admin_message sem consultar configuração do parceiro', async () => {
    const input: CreateNotificationInput = {
      recipientPartnerId: 'partner-1',
      type: 'admin_message',
      title: 'Aviso',
      message: 'Mensagem administrativa',
    };

    await service.createNotification(input);

    expect(repository.isNotificationTypeEnabled).not.toHaveBeenCalled();

    expect(repository.createNotification).toHaveBeenCalledWith(input);
  });

  it('deve marcar uma notificação como lida', async () => {
    await service.markAsRead('notification-1', 'partner-1');

    expect(repository.markAsRead).toHaveBeenCalledWith('notification-1', 'partner-1');
  });

  it('deve marcar todas as notificações do parceiro como lidas', async () => {
    await service.markAllAsRead('partner-1');

    expect(repository.markAllAsRead).toHaveBeenCalledWith('partner-1');
  });

  it('deve retornar as configurações do parceiro', async () => {
    const settings = {
      partnerId: 'partner-1',
      reviewNotifications: true,
      planExpiringNotifications: false,
    };

    vi.mocked(repository.getSettings).mockResolvedValue(settings);

    await expect(service.getSettings('partner-1')).resolves.toEqual(settings);

    expect(repository.getSettings).toHaveBeenCalledWith('partner-1');
  });

  it('deve atualizar as configurações do parceiro', async () => {
    const settings = {
      reviewNotifications: false,
      planExpiringNotifications: true,
    };

    await service.updateSettings('partner-1', settings);

    expect(repository.updateSettings).toHaveBeenCalledWith('partner-1', settings);
  });
});
