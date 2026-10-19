import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { ItemStats } from '../../types/interaction';
import { ReportsStatsGrid } from './ReportsStatsGrid';

const STATS: ItemStats = {
  views: 8,
  viewsSignedIn: 2,
  viewsAnonymous: 6,
  whatsapp_click: 1,
  share: 0,
  favorite: 3,
  history: [],
};

describe('ReportsStatsGrid', () => {
  afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra o total e a divisão entre com conta e visitantes', async () => {
    await i18n.changeLanguage('pt-BR');
    render(<ReportsStatsGrid stats={STATS} />);
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByText('Com conta no Use Guide')).toBeTruthy();
    expect(screen.getByText('25%')).toBeTruthy();
    expect(screen.getByText('75%')).toBeTruthy();
  });

  it('avisa quando ainda não há visualização', async () => {
    await i18n.changeLanguage('fr');
    render(
      <ReportsStatsGrid stats={{ ...STATS, views: 0, viewsSignedIn: 0, viewsAnonymous: 0 }} />
    );
    expect(screen.getByText('Pas encore de vues.')).toBeTruthy();
  });
});
