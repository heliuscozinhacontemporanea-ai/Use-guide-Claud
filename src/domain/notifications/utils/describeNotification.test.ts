import { beforeEach, describe, expect, it } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { describeNotification } from './describeNotification';

const base = { id: 'n1', recipientUid: 'u1', read: false, createdAt: '2026-11-03T12:00:00Z' };

describe('describeNotification', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('traduz pelo tipo com os dados e o plural do idioma', () => {
    const t = i18n.t.bind(i18n);
    expect(
      describeNotification({ ...base, type: 'sale_ticket', params: { count: 2 } }, t, 'pt-BR').body
    ).toBe('2 ingressos vendidos.');
    expect(
      describeNotification(
        { ...base, type: 'ticket_received', params: { event: 'Luau na Duna' } },
        t,
        'pt-BR'
      ).body
    ).toBe('Um ingresso para Luau na Duna está na sua carteira.');
  });

  it('sem o nome, usa o texto que não depende dele', () => {
    const t = i18n.t.bind(i18n);
    const item = describeNotification(
      { ...base, type: 'booking_provider_arrived', params: { business: '' } },
      t,
      'pt-BR'
    );
    expect(item.title).toBe('Seu guia chegou');
  });

  it('data da nova sessão sai no idioma e no fuso de Fortaleza', async () => {
    await i18n.changeLanguage('en');
    const item = describeNotification(
      {
        ...base,
        type: 'event_postponed',
        params: { event: 'Luau', startsAt: '2026-12-20T23:00:00.000Z' },
      },
      i18n.t.bind(i18n),
      'en'
    );
    expect(item.body).toContain('December 20, 2026');
    expect(item.body).toContain('8:00');
  });

  it('tipo desconhecido não quebra a lista', () => {
    const item = describeNotification({ ...base, type: 'novo_tipo' }, i18n.t.bind(i18n), 'pt-BR');
    expect(item).toMatchObject({ title: 'Notificações', body: '' });
  });
});
