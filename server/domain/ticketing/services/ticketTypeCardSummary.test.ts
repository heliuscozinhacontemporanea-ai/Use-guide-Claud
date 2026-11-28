import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../events', () => ({
  createEventAuditLogUseCase: vi.fn(),
  getEventListingByIdUseCase: vi.fn(),
  getEventOccurrenceByIdUseCase: vi.fn(),
  listEventOccurrencesUseCase: vi.fn(),
  updateEventListingPricingSummaryUseCase: vi.fn().mockResolvedValue(undefined),
}));

import {
  getEventListingByIdUseCase,
  listEventOccurrencesUseCase,
  updateEventListingPricingSummaryUseCase,
} from '../../events';
import type { TicketingPort } from '../ports/ticketingPort';
import { TicketTypeService } from './ticketTypeService';

const FEES = {
  BOOKINGS_PLATFORM_FEE_BPS: '1500',
  TICKETS_PLATFORM_FEE_BPS: '1000',
  TICKETS_ABSORBED_FEE_BPS: '1250',
  TICKET_SERVICE_FEE_MINOR: '300',
};

function setup() {
  vi.mocked(getEventListingByIdUseCase).mockResolvedValue({
    id: 'ev1',
    salesPolicy: { serviceFeeMode: 'pass_to_buyer', cancellationPolicy: 'flexible' },
  } as never);
  vi.mocked(listEventOccurrencesUseCase).mockResolvedValue([
    { id: 'o1', startsAt: '2099-01-01T00:00:00.000Z', status: 'scheduled' },
  ] as never);
  const port = {
    listTicketTypesByOccurrenceId: vi.fn().mockResolvedValue([
      {
        id: 't1',
        occurrenceId: 'o1',
        kind: 'paid',
        priceMinor: 4000,
        quantity: 10,
        soldCount: 0,
        reservedCount: 0,
        status: 'on_sale',
        visibility: 'public',
      },
    ]),
  } as unknown as TicketingPort;
  return new TicketTypeService(port);
}

describe('TicketTypeService: cartão do evento (D37 item 10)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('grava o "a partir de" com a taxa de serviço do comprador', async () => {
    for (const [name, value] of Object.entries(FEES)) vi.stubEnv(name, value);
    await setup().refreshListingPricingSummary('ev1');
    expect(updateEventListingPricingSummaryUseCase).toHaveBeenCalledWith('ev1', {
      pricingMode: 'paid',
      cardSummary: {
        fromPriceMinor: 4300,
        priceUnit: 'ticket',
        serviceFeeIncluded: true,
        freeCancellationHours: 24,
      },
    });
  });

  it('sem as taxas configuradas, o cartão fica sem preço (não mostra valor sem a taxa)', async () => {
    for (const name of Object.keys(FEES)) vi.stubEnv(name, '');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await setup().refreshListingPricingSummary('ev1');
    expect(updateEventListingPricingSummaryUseCase).toHaveBeenCalledWith('ev1', {
      pricingMode: 'paid',
      cardSummary: null,
    });
    error.mockRestore();
  });
});
