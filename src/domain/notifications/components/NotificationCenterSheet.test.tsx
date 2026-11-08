import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { NotificationCenterSheet } from './NotificationCenterSheet';

const NOW = new Date('2026-11-03T15:00:00-03:00');
const items = [
  {
    id: 'a',
    category: 'tickets' as const,
    title: 'Você recebeu um ingresso',
    body: '@ana enviou 1 ingresso.',
    createdAt: new Date('2026-11-03T14:40:00-03:00'),
    read: false,
  },
  {
    id: 'b',
    category: 'bookings' as const,
    title: 'Reserva confirmada',
    body: 'Passeio de buggy, sábado às 9h.',
    createdAt: new Date('2026-11-01T10:00:00-03:00'),
    read: true,
  },
];

describe('NotificationCenterSheet', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('agrupa em Hoje e Anteriores, marca não lidas e abre o aviso tocado', () => {
    const onOpenItem = vi.fn();
    render(
      <NotificationCenterSheet
        open
        onOpenChange={() => undefined}
        items={items}
        loading={false}
        error={false}
        onRetry={() => undefined}
        onOpenItem={onOpenItem}
        onMarkAllRead={() => undefined}
        onOpenSettings={() => undefined}
        now={NOW}
      />
    );
    expect(screen.getByText('Hoje')).toBeTruthy();
    expect(screen.getByText('Anteriores')).toBeTruthy();
    expect(screen.getAllByText('Não lida')).toHaveLength(1);
    fireEvent.click(screen.getByText('Reserva confirmada'));
    expect(onOpenItem).toHaveBeenCalledWith(items[1]);
  });

  it('sem avisos mostra o estado vazio; em Não lidas, você está em dia', () => {
    render(
      <NotificationCenterSheet
        open
        onOpenChange={() => undefined}
        items={[]}
        loading={false}
        error={false}
        onRetry={() => undefined}
        onOpenItem={() => undefined}
        onMarkAllRead={() => undefined}
        onOpenSettings={() => undefined}
        now={NOW}
      />
    );
    expect(screen.getByText('Nenhuma notificação')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Não lidas' }));
    expect(screen.getByText('Você está em dia')).toBeTruthy();
  });
});
