import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationDomainError } from '../errors/notificationErrors';
import type { NotificationRepositoryPort } from '../ports/notificationRepositoryPort';
import { NotificationService } from './notificationService';

const NOW = new Date('2026-11-03T12:00:00.000Z');

function createRepository(): NotificationRepositoryPort {
  return {
    create: vi.fn().mockResolvedValue(true),
    createMany: vi.fn(),
    markAsRead: vi.fn().mockResolvedValue(true),
    markAllAsRead: vi.fn(),
    getPreferences: vi.fn().mockResolvedValue(null),
    savePreferences: vi.fn(),
    deleteAllForUser: vi.fn(),
  };
}

describe('NotificationService', () => {
  let repo: NotificationRepositoryPort;
  let service: NotificationService;

  beforeEach(() => {
    repo = createRepository();
    service = new NotificationService(repo, () => NOW);
  });

  it('grava tipo e dados com validade de 90 dias', async () => {
    await service.create({
      recipientUid: 'u1',
      type: 'ticket_received',
      params: { event: 'Luau' },
    });
    expect(repo.create).toHaveBeenCalledWith(
      { recipientUid: 'u1', type: 'ticket_received', params: { event: 'Luau' } },
      new Date('2027-02-01T12:00:00.000Z')
    );
  });

  it('recusa tipo desconhecido ou sem destinatário', async () => {
    await expect(
      service.create({ recipientUid: '', type: 'ticket_received' })
    ).rejects.toBeInstanceOf(NotificationDomainError);
    await expect(
      service.create({ recipientUid: 'u1', type: 'nao_existe' as 'ticket_received' })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('mensagem do admin vai uma vez para cada pessoa, com o texto como está', async () => {
    await service.sendAdminMessage(['a', 'b', 'a', ''], 'Aviso', 'Manutenção às 2h');
    expect(repo.createMany).toHaveBeenCalledWith(
      ['a', 'b'],
      { type: 'admin_message', params: { title: 'Aviso', message: 'Manutenção às 2h' } },
      expect.any(Date)
    );
  });

  it('marcar como lida aviso de outra pessoa responde não encontrado (IDOR)', async () => {
    vi.mocked(repo.markAsRead).mockResolvedValue(false);
    await expect(service.markAsRead('n1', 'intruso')).rejects.toMatchObject({
      code: 'NOTIFICATION_NOT_FOUND',
      statusCode: 404,
    });
  });

  it('preferências começam no padrão (novidades desligadas) e salvam só o que mudou por cima', async () => {
    expect(await service.getPreferences('u1')).toEqual({
      reviewRequests: true,
      news: false,
      salesAlerts: 'each',
    });
    vi.mocked(repo.getPreferences).mockResolvedValue({ news: true });
    const next = await service.updatePreferences('u1', { salesAlerts: 'daily' });
    expect(next).toEqual({ reviewRequests: true, news: true, salesAlerts: 'daily' });
    expect(repo.savePreferences).toHaveBeenCalledWith('u1', next);
  });
});
