import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../events', () => ({
  useEventOccurrences: () => ({
    occurrences: [
      { id: 'occ-1', startsAt: '2026-12-20T22:00:00.000Z', capacity: 100, status: 'scheduled' },
    ],
    loading: false,
  }),
}));
vi.mock('../../payment', () => ({ PartnerStripeConnectPortal: () => <div>portal</div> }));
vi.mock('../hooks/useTicketTypes', () => ({
  useManagementTicketTypes: () => ({ ticketTypes: [], loading: false, reload: vi.fn() }),
}));
vi.mock('../hooks/usePartnerEventSales', () => ({
  usePartnerEventSales: () => ({
    analytics: null,
    orders: [],
    checkIns: [],
    refunds: [],
    loading: false,
    reload: vi.fn(),
    performCheckIn: vi.fn(),
  }),
  usePartnerMerchantAccount: () => ({ status: { readyForSales: true } }),
}));
vi.mock('../utils/offlineCheckInStorage', () => ({
  getOfflineManifestBundle: vi.fn().mockResolvedValue(null),
  listPendingOfflineCheckInEvents: vi.fn().mockResolvedValue([]),
  removeSyncedOfflineCheckInEvents: vi.fn(),
  saveOfflineManifestBundle: vi.fn(),
  verifyAndConsumeOfflineQrToken: vi.fn(),
}));

import { PartnerEventTicketingManager } from './PartnerEventTicketingManager';

describe('PartnerEventTicketingManager (divisão em abas, sem mudar comportamento)', () => {
  it('cada aba mostra o próprio conteúdo', async () => {
    render(<PartnerEventTicketingManager eventListingId="ev-1" />);
    expect(await screen.findByText('Novo Lote / Tipo de Ingresso')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Vendas/ }));
    expect(screen.getByText('Ingressos Pagos')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Participantes/ }));
    expect(
      screen.getByText('Nenhum pedido ou participante registrado para este evento.')
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Check-in/ }));
    expect(screen.getByText('Preparar Check-in Offline')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Reembolsos/ }));
    expect(
      screen.getByText('Nenhuma solicitação de reembolso registrada para este evento.')
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Financeiro/ }));
    expect(screen.getByText('portal')).toBeTruthy();
  });

  it('admin não vê a aba Financeiro', () => {
    render(<PartnerEventTicketingManager eventListingId="ev-1" asAdmin />);
    expect(screen.queryByRole('button', { name: /Financeiro/ })).toBeNull();
  });
});
