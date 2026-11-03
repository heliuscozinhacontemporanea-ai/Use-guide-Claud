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

  it('mostra os avisos de todas as contas, sem a seção de parceiro', async () => {
    render(<NotificationSettingsView isPartner={false} onBack={() => undefined} />);
    expect(await screen.findByRole('switch', { name: 'Ingressos' })).toBeTruthy();
    expect(screen.getByRole('switch', { name: 'Novidades' }).getAttribute('aria-checked')).toBe(
      'false'
    );
    expect(screen.queryByRole('switch', { name: 'Vendas' })).toBeNull();
    expect(screen.getByRole('switch', { name: 'Silêncio noturno' })).toBeTruthy();
  });

  it('parceiro vê a própria seção e o resumo diário', async () => {
    render(<NotificationSettingsView isPartner onBack={() => undefined} />);
    expect(await screen.findByRole('switch', { name: 'Vendas' })).toBeTruthy();
    expect(screen.getByRole('switch', { name: 'Resumo diário de vendas' })).toBeTruthy();
  });

  it('salva só a categoria tocada e desfaz se o servidor recusar', async () => {
    vi.mocked(updateNotificationPreferencesUseCase).mockRejectedValueOnce(new Error('fail'));
    render(<NotificationSettingsView isPartner={false} onBack={() => undefined} />);
    const tickets = await screen.findByRole('switch', { name: 'Ingressos' });
    fireEvent.click(tickets);
    expect(updateNotificationPreferencesUseCase).toHaveBeenCalledWith({
      push: { ...DEFAULT_PREFERENCES.push, tickets: false },
    });
    expect(await screen.findByText('Não foi possível salvar. Tente de novo.')).toBeTruthy();
    await waitFor(() => expect(tickets.getAttribute('aria-checked')).toBe('true'));
  });
});
