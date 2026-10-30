import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { AdminNavigation } from './AdminNavigation';

beforeAll(() => {
  // jsdom não implementa scrollIntoView.
  Element.prototype.scrollIntoView = vi.fn();
});

describe('abas do painel admin (D17)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra cada aba com o nome inteiro e marca a ativa', () => {
    const onSelect = vi.fn();
    render(
      <AdminNavigation
        activeTab="plans"
        onSelectTab={onSelect}
        showVerifications
        showFinance
        showModeration
      />
    );
    const names = screen.getAllByRole('button').map((button) => button.textContent);
    expect(names).toEqual([
      'Relatórios',
      'Parceiros',
      'Verificações',
      'Financeiro',
      'Moderação',
      'Guia local',
      'Agenda',
      'Planos',
      'Avisos',
    ]);
    expect(screen.getByRole('button', { name: 'Planos' }).getAttribute('aria-pressed')).toBe(
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Moderação' }));
    expect(onSelect).toHaveBeenCalledWith('moderation');
  });

  it('abas de outros domínios só aparecem quando a composição as monta', () => {
    render(<AdminNavigation activeTab="reports" onSelectTab={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Financeiro' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Moderação' })).toBeNull();
  });
});
