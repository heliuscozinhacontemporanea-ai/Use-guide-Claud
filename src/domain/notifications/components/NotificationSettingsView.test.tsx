import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';

vi.mock('../application/usecases/getNotificationSettingsUseCase', () => ({
  getNotificationSettingsUseCase: vi.fn(),
}));
vi.mock('../application/usecases/updateNotificationSettingsUseCase', () => ({
  updateNotificationSettingsUseCase: vi.fn(),
}));

import { getNotificationSettingsUseCase } from '../application/usecases/getNotificationSettingsUseCase';
import { updateNotificationSettingsUseCase } from '../application/usecases/updateNotificationSettingsUseCase';
import { NotificationSettingsView } from './NotificationSettingsView';

describe('NotificationSettingsView', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
    vi.mocked(getNotificationSettingsUseCase).mockResolvedValue({
      partnerId: 'p1',
      reviewNotifications: true,
      planExpiringNotifications: false,
    });
  });

  it('mostra cada aviso com o estado salvo e salva ao tocar', async () => {
    vi.mocked(updateNotificationSettingsUseCase).mockResolvedValue(undefined as never);
    render(<NotificationSettingsView partnerId="p1" onBack={() => undefined} />);
    const reviews = await screen.findByRole('switch', { name: 'Avaliações recebidas' });
    const plan = screen.getByRole('switch', { name: 'Vencimento do plano' });
    expect(reviews.getAttribute('aria-checked')).toBe('true');
    expect(plan.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(plan);
    expect(plan.getAttribute('aria-checked')).toBe('true');
    expect(updateNotificationSettingsUseCase).toHaveBeenCalledWith('p1', {
      planExpiringNotifications: true,
    });
  });

  it('desfaz e avisa quando o servidor recusa', async () => {
    vi.mocked(updateNotificationSettingsUseCase).mockRejectedValue(new Error('fail'));
    render(<NotificationSettingsView partnerId="p1" onBack={() => undefined} />);
    const reviews = await screen.findByRole('switch', { name: 'Avaliações recebidas' });
    fireEvent.click(reviews);
    expect(await screen.findByText('Não foi possível salvar. Tente de novo.')).toBeTruthy();
    await waitFor(() => expect(reviews.getAttribute('aria-checked')).toBe('true'));
  });

  it('erro ao carregar oferece tentar de novo', async () => {
    vi.mocked(getNotificationSettingsUseCase).mockRejectedValueOnce(new Error('fail'));
    render(<NotificationSettingsView partnerId="p1" onBack={() => undefined} />);
    expect(await screen.findByText('Não foi possível carregar suas notificações.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('switch', { name: 'Avaliações recebidas' })).toBeTruthy();
  });
});
