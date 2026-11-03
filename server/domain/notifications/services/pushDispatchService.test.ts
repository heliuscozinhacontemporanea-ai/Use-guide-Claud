import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationRepositoryPort } from '../ports/notificationRepositoryPort';
import type {
  NotificationOutboxPort,
  OutboxEntry,
  PushDevicePort,
  PushSenderPort,
} from '../ports/pushPorts';
import { OPTIONAL_TYPES } from '../types/notificationTypes';
import { isQuietHour, nextMorning, PushDispatchService } from './pushDispatchService';

// 15h em Fortaleza (UTC−3).
const AFTERNOON = new Date('2026-11-03T18:00:00.000Z');
const NIGHT = new Date('2026-11-04T03:00:00.000Z'); // meia-noite do dia 4 em Fortaleza

function entry(partial: Partial<OutboxEntry> = {}): OutboxEntry {
  return {
    id: 'n1',
    recipientUid: 'u1',
    type: 'ticket_received',
    params: { event: 'Luau' },
    link: { screen: 'tickets' },
    attempts: 0,
    ...partial,
  };
}

describe('PushDispatchService', () => {
  let outbox: NotificationOutboxPort;
  let devices: PushDevicePort;
  let sender: PushSenderPort;
  let repo: NotificationRepositoryPort;
  let service: PushDispatchService;

  beforeEach(() => {
    outbox = {
      claimDue: vi.fn().mockResolvedValue([entry()]),
      enqueue: vi.fn().mockResolvedValue(true),
      complete: vi.fn(),
      defer: vi.fn(),
      retryLater: vi.fn(),
      deleteAllForUser: vi.fn(),
    };
    devices = {
      register: vi.fn(),
      unregister: vi.fn(),
      listForUser: vi.fn().mockResolvedValue([
        { id: 'd1', token: 't-pt', locale: 'pt-BR' },
        { id: 'd2', token: 't-fr', locale: 'fr' },
      ]),
      remove: vi.fn(),
      deleteAllForUser: vi.fn(),
    };
    sender = { send: vi.fn().mockResolvedValue({ invalidTokens: [] }) };
    repo = {
      create: vi.fn(),
      createMany: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getPreferences: vi.fn().mockResolvedValue(null),
      savePreferences: vi.fn(),
      deleteAllForUser: vi.fn(),
      listDailySalesRecipients: vi.fn().mockResolvedValue([]),
      countSalesSince: vi.fn(),
    };
    service = new PushDispatchService(outbox, devices, sender, repo);
  });

  it('envia no idioma de cada aparelho e tira da fila', async () => {
    const result = await service.dispatch(AFTERNOON);
    expect(sender.send).toHaveBeenCalledWith(['t-pt'], {
      title: 'Você recebeu um ingresso',
      body: 'Um ingresso para Luau está na sua carteira.',
      link: { screen: 'tickets' },
      tag: 'n1',
    });
    expect(sender.send).toHaveBeenCalledWith(
      ['t-fr'],
      expect.objectContaining({ title: 'Vous avez reçu un billet' })
    );
    expect(outbox.complete).toHaveBeenCalledWith('n1');
    expect(result).toMatchObject({ sent: 1, failed: 0 });
  });

  it('avisos importantes chegam também de madrugada', async () => {
    await service.dispatch(NIGHT);
    expect(sender.send).toHaveBeenCalled();
  });

  it('tira da lista o aparelho que o FCM recusou', async () => {
    vi.mocked(sender.send).mockResolvedValueOnce({ invalidTokens: ['t-pt'] });
    await service.dispatch(AFTERNOON);
    expect(devices.remove).toHaveBeenCalledWith(['d1']);
  });

  it('parceiro com resumo diário não recebe push a cada venda (a venda fica na central)', async () => {
    vi.mocked(outbox.claimDue).mockResolvedValue([
      entry({ type: 'sale_ticket', params: { count: 1 } }),
    ]);
    vi.mocked(repo.getPreferences).mockResolvedValue({ salesAlerts: 'daily' });
    const result = await service.dispatch(AFTERNOON);
    expect(sender.send).not.toHaveBeenCalled();
    expect(result.skipped).toBe(1);
  });

  it('aviso opcional respeita a escolha e espera as 5h30', async () => {
    const optional = OPTIONAL_TYPES as Record<string, 'news'>;
    optional.ticket_received = 'news';
    try {
      vi.mocked(repo.getPreferences).mockResolvedValue({ news: true });
      expect(await service.dispatch(NIGHT)).toMatchObject({ deferred: 1 });
      expect(outbox.defer).toHaveBeenCalledWith('n1', new Date('2026-11-04T08:30:00.000Z'));

      vi.mocked(repo.getPreferences).mockResolvedValue({ news: false });
      expect(await service.dispatch(AFTERNOON)).toMatchObject({ skipped: 1 });
    } finally {
      delete optional.ticket_received;
    }
  });

  it('falha no envio volta para a fila com espera crescente; na 5ª tentativa desiste', async () => {
    vi.mocked(sender.send).mockRejectedValue(new Error('fcm down'));
    await service.dispatch(AFTERNOON);
    expect(outbox.retryLater).toHaveBeenCalledWith(
      'n1',
      1,
      new Date(AFTERNOON.getTime() + 2 * 60_000)
    );
    vi.mocked(outbox.claimDue).mockResolvedValue([entry({ attempts: 4 })]);
    await service.dispatch(AFTERNOON);
    expect(outbox.complete).toHaveBeenCalledWith('n1');
  });

  it('resumo do dia conta as vendas desde 0h de Fortaleza e não repete no mesmo dia', async () => {
    vi.mocked(repo.listDailySalesRecipients).mockResolvedValue(['p1', 'p2']);
    vi.mocked(repo.countSalesSince).mockImplementation(async (uid) => (uid === 'p1' ? 3 : 0));
    const at20h = new Date('2026-11-03T23:00:00.000Z');
    expect(await service.enqueueDailySalesDigest(at20h)).toBe(1);
    expect(repo.countSalesSince).toHaveBeenCalledWith('p1', new Date('2026-11-03T03:00:00.000Z'));
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'sale_daily_digest_p1_2026-11-03',
        type: 'sale_daily_digest',
        params: { count: 3 },
      }),
      at20h
    );
  });

  it('horário de silêncio é das 23h30 às 5h30 em Fortaleza', () => {
    expect(isQuietHour(AFTERNOON)).toBe(false);
    expect(isQuietHour(NIGHT)).toBe(true);
    expect(isQuietHour(new Date('2026-11-04T02:29:00.000Z'))).toBe(false); // 23h29
    expect(isQuietHour(new Date('2026-11-04T02:30:00.000Z'))).toBe(true); // 23h30
    expect(isQuietHour(new Date('2026-11-04T08:29:00.000Z'))).toBe(true); // 5h29
    expect(isQuietHour(new Date('2026-11-04T08:30:00.000Z'))).toBe(false); // 5h30
    expect(nextMorning(new Date('2026-11-04T07:00:00.000Z'))).toEqual(
      new Date('2026-11-04T08:30:00.000Z')
    );
    expect(nextMorning(new Date('2026-11-04T02:45:00.000Z'))).toEqual(
      new Date('2026-11-04T08:30:00.000Z')
    );
  });
});
