import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';

const m = vi.hoisted(() => ({ forecast: vi.fn(), current: vi.fn() }));
vi.mock('../factory', () => ({
  windForecastAdapter: { fetchForecast: m.forecast, fetchCurrentWind: m.current },
}));
vi.mock('./WindMapLeaflet', () => ({
  WindMapLeaflet: ({ points }: { points: Array<{ id: string; speed?: number }> }) => (
    <p>mapa com {points.filter((point) => point.speed !== undefined).length} pontos</p>
  ),
}));

import { ConditionsDetailModal } from './ConditionsDetailModal';
import { WindMapModal } from './WindMapModal';

const JERI = { id: 'jeri', name: 'Jericoacoara', lat: -2.79, lon: -40.5 };

describe('folhas do vento (D33)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
  });

  it('previsão: cada dia com vento, rajada, condição e temperatura no idioma ativo', async () => {
    m.forecast.mockResolvedValue([
      {
        day: '2026-11-15',
        maxTemp: 31,
        minTemp: 25,
        maxWind: 22,
        maxGusts: 28,
        windDir: 90,
        weatherCode: 0,
      },
    ]);
    render(<ConditionsDetailModal isOpen onClose={vi.fn()} location={JERI} />);
    expect(screen.getByRole('dialog', { name: 'Jericoacoara' })).toBeInTheDocument();
    expect(await screen.findByText('Céu limpo · 31° / 25°')).toBeInTheDocument();
    expect(screen.getByText('Rajada 28 nós')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Vento de 90°' })).toBeInTheDocument();
    expect(m.forecast).toHaveBeenCalledWith(-2.79, -40.5);
  });

  it('previsão que falha mostra o erro com nova tentativa', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    m.forecast.mockRejectedValue(new Error('WEATHER_UNAVAILABLE'));
    render(<ConditionsDetailModal isOpen onClose={vi.fn()} location={JERI} />);
    await vi.advanceTimersByTimeAsync(5000);
    expect(await screen.findByText(i18n.t('wind.forecast.error'))).toBeInTheDocument();
    m.forecast.mockResolvedValue([]);
    fireEvent.click(screen.getByRole('button', { name: /tentar/i }));
    expect(m.forecast).toHaveBeenCalledTimes(4);
    vi.useRealTimers();
  });

  it('mapa abre numa folha e recebe o vento de cada ponto', async () => {
    m.current.mockImplementation(async (points: Array<{ id: string }>) =>
      points.map((point) => ({ ...point, speed: 12, dir: 90 }))
    );
    render(<WindMapModal isOpen onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Mapa do vento' })).toBeInTheDocument();
    expect(await screen.findByText(/mapa com [1-9]\d* pontos/)).toBeInTheDocument();
  });
});
