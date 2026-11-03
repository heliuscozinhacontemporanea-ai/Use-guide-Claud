import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { DEFAULT_PREFERENCES } from '../types/notificationCategories';

vi.mock('../application/usecases/getNotificationPreferencesUseCase', () => ({
  getNotificationPreferencesUseCase: vi.fn(),
}));
vi.mock('../application/usecases/updateNotificationPreferencesUseCase', () => ({
  updateNotificationPreferencesUseCase: vi.fn(),
}));

import { getNotificationPreferencesUseCase } from '../application/usecases/getNotificationPreferencesUseCase';
import { updateNotificationPreferencesUseCase } from '../application/usecases/updateNotificationPreferencesUseCase';
import { NotificationSettingsView } from './NotificationSettingsView';

describe('NotificationSettingsView', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
    vi.mocked(getNotificationPreferencesUseCase).mockResolvedValue(DEFAULT_PREFERENCES);
  });

  it('avisos importantes não têm interruptor; só os opcionais têm', async () => {
    render(<NotificationSettingsView isPartner={false} onBack={() => undefined} />);
    expect(screen.getByText('Compras, pagamentos e reembolsos')).toBeTruthy();
    await screen.findByRole('switch', { name: 'Pedidos de avaliação' });
    expect(screen.getAllByRole('switch')).toHaveLength(2);
    expect(
      screen.getByRole('switch', { name: 'Novidades e ofertas' }).getAttribute('aria-checked')
    ).toBe('false');
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('parceiro escolhe entre aviso a cada venda e resumo do dia', async () => {
    render(<NotificationSettingsView isPartner onBack={() => undefined} />);
    const daily = await screen.findByRole('radio', { name: /Resumo no fim do dia/ });
    expect(screen.getByRole('radio', { name: /A cada venda/ })).toHaveProperty('checked', true);
    fireEvent.click(daily);
    expect(updateNotificationPreferencesUseCase).toHaveBeenCalledWith({ salesAlerts: 'daily' });
  });

  it('salva só o que mudou e desfaz se o servidor recusar', async () => {
    vi.mocked(updateNotificationPreferencesUseCase).mockRejectedValueOnce(new Error('fail'));
    render(<NotificationSettingsView isPartner={false} onBack={() => undefined} />);
    const reviews = await screen.findByRole('switch', { name: 'Pedidos de avaliação' });
    fireEvent.click(reviews);
    expect(updateNotificationPreferencesUseCase).toHaveBeenCalledWith({ reviewRequests: false });
    expect(await screen.findByText('Não conseguimos salvar. Tente de novo.')).toBeTruthy();
    await waitFor(() => expect(reviews.getAttribute('aria-checked')).toBe('true'));
  });
});
