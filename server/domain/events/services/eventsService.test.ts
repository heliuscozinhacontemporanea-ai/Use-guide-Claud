import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventsService } from './eventsService';
import type { EventsPort } from '../ports/eventsPort';
import type { EventListing, EventOccurrence } from '../types/eventTypes';

function createMockPort(): EventsPort {
  return {
    createListing: vi.fn(),
    getListingById: vi.fn(),
    listPublicListings: vi.fn(),
    listAllListings: vi.fn(),
    updateListing: vi.fn(),
    deleteListing: vi.fn(),
    updateRatingSummary: vi.fn(),
    updateVerificationByOwner: vi.fn(),
    deleteListingsByOwner: vi.fn(),
    createOccurrence: vi.fn(),
    getOccurrenceById: vi.fn(),
    listOccurrencesByListingId: vi.fn(),
    updateOccurrence: vi.fn(),
    deleteOccurrence: vi.fn(),
    createAuditLog: vi.fn().mockResolvedValue({
      id: 'log-1',
      actorId: 'u1',
      actorType: 'partner',
      resourceType: 'event',
      resourceId: 'ev-1',
      action: 'test',
      timestamp: '2026-06-01T12:00:00.000Z',
    }),
  };
}

const sampleListing: EventListing = {
  id: 'ev-1',
  ownerId: 'partner-1',
  partnerId: 'partner-1',
  title: 'Show Pôr do Sol',
  name: 'Show Pôr do Sol',
  description: 'Evento musical na duna',
  category: 'shows',
  eventCategory: 'shows',
  coverImage: 'https://example.com/cover.jpg',
  image: 'https://example.com/cover.jpg',
  images: ['https://example.com/cover.jpg'],
  visibility: 'public',
  status: 'published',
  isActive: true,
  organizerId: 'partner-1',
  location: { name: 'Jericoacoara' },
  refundPolicy: { enabled: true, cancellationWindowHours: 24 },
  entryType: 'gratuito',
  pricingMode: 'free',
  date: '2026-08-10T18:00:00.000Z',
  endDate: '2026-08-10T22:00:00.000Z',
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
};

const sampleOccurrence: EventOccurrence = {
  id: 'occ-1',
  eventListingId: 'ev-1',
  startsAt: '2026-08-10T18:00:00.000Z',
  endsAt: '2026-08-10T22:00:00.000Z',
  status: 'scheduled',
  capacity: 150,
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
};

describe('EventsService', () => {
  let port: EventsPort;
  let service: EventsService;

  beforeEach(() => {
    port = createMockPort();
    service = new EventsService(port);
  });

  it('creates an EventListing and its initial EventOccurrences with audit log', async () => {
    vi.mocked(port.createListing).mockResolvedValue(sampleListing);
    vi.mocked(port.createOccurrence).mockResolvedValue(sampleOccurrence);

    const result = await service.createListing(
      { uid: 'partner-1', admin: false },
      {
        title: 'Show Pôr do Sol',
        name: 'Show Pôr do Sol',
        description: 'Evento musical na duna',
        category: 'shows',
        eventCategory: 'shows',
        coverImage: 'https://example.com/cover.jpg',
        image: 'https://example.com/cover.jpg',
        images: ['https://example.com/cover.jpg'],
        visibility: 'public',
        status: 'published',
        isActive: true,
        organizerId: 'partner-1',
        location: { name: 'Jericoacoara' },
        refundPolicy: { enabled: true },
        occurrences: [
          {
            startsAt: '2026-08-10T18:00:00.000Z',
            endsAt: '2026-08-10T22:00:00.000Z',
            capacity: 150,
          },
        ],
      }
    );

    expect(result.listing.id).toBe('ev-1');
    expect(result.occurrences).toHaveLength(1);
    expect(port.createOccurrence).toHaveBeenCalledWith(
      expect.objectContaining({
        eventListingId: 'ev-1',
        capacity: 150,
      })
    );
    expect(port.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'event.created',
        resourceId: 'ev-1',
      })
    );
  });

  it('blocks non-owner partner from updating another partner listing', async () => {
    vi.mocked(port.getListingById).mockResolvedValue(sampleListing);

    await expect(
      service.updateListing(
        { uid: 'partner-other', admin: false },
        'ev-1',
        { title: 'Tentativa Inválida' }
      )
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('archives listing instead of physical delete when commercial history exists', async () => {
    vi.mocked(port.getListingById).mockResolvedValue(sampleListing);
    vi.mocked(port.updateListing).mockResolvedValue({
      ...sampleListing,
      status: 'archived',
      isActive: false,
    });

    const result = await service.deleteOrArchiveListing(
      { uid: 'partner-1', admin: false },
      'ev-1',
      true
    );

    expect(result.mode).toBe('archived');
    expect(port.deleteListing).not.toHaveBeenCalled();
    expect(port.updateListing).toHaveBeenCalledWith('ev-1', {
      status: 'archived',
      isActive: false,
    });
  });

  it('prevents reducing occurrence capacity below committed tickets count', async () => {
    vi.mocked(port.getOccurrenceById).mockResolvedValue(sampleOccurrence);
    vi.mocked(port.getListingById).mockResolvedValue(sampleListing);

    await expect(
      service.updateOccurrence(
        { uid: 'partner-1', admin: false },
        'occ-1',
        { capacity: 20 },
        50
      )
    ).rejects.toMatchObject({
      code: 'UNPROCESSABLE_ENTITY',
    });
  });

  it('postpones an occurrence by creating a linked replacement occurrence', async () => {
    vi.mocked(port.getOccurrenceById).mockResolvedValue(sampleOccurrence);
    vi.mocked(port.getListingById).mockResolvedValue(sampleListing);
    vi.mocked(port.createOccurrence).mockResolvedValue({
      ...sampleOccurrence,
      id: 'occ-2',
      startsAt: '2026-08-17T18:00:00.000Z',
      endsAt: '2026-08-17T22:00:00.000Z',
      rescheduledFromOccurrenceId: 'occ-1',
    });
    vi.mocked(port.updateOccurrence).mockResolvedValue({
      ...sampleOccurrence,
      status: 'postponed',
      rescheduledToOccurrenceId: 'occ-2',
      postponementReason: 'Chuva forte',
    });

    const result = await service.postponeOccurrence(
      { uid: 'partner-1', admin: false },
      'occ-1',
      {
        startsAt: '2026-08-17T18:00:00.000Z',
        endsAt: '2026-08-17T22:00:00.000Z',
        reason: 'Chuva forte',
      }
    );

    expect(result.newOccurrence.id).toBe('occ-2');
    expect(result.postponedOccurrence.status).toBe('postponed');
    expect(result.postponedOccurrence.rescheduledToOccurrenceId).toBe('occ-2');
  });

  it('preserves original ownerId when Admin updates an EventListing', async () => {
    vi.mocked(port.getListingById).mockResolvedValue(sampleListing);
    vi.mocked(port.updateListing).mockResolvedValue({
      ...sampleListing,
      title: 'Show Atualizado pelo Admin',
      ownerId: sampleListing.ownerId,
    });

    const updated = await service.updateListing(
      { uid: 'admin-master', admin: true, role: 'admin' },
      'ev-1',
      {
        title: 'Show Atualizado pelo Admin',
        ownerId: 'hijacked-owner',
      } as unknown as Parameters<typeof service.updateListing>[2]
    );

    expect(port.updateListing).toHaveBeenCalledWith(
      'ev-1',
      expect.not.objectContaining({
        ownerId: 'hijacked-owner',
      })
    );
    expect(updated.ownerId).toBe('partner-1');
  });

  it('prevents changing establishmentId when event has commercial history', async () => {
    vi.mocked(port.getListingById).mockResolvedValue({
      ...sampleListing,
      establishmentId: 'est-original',
    });
    vi.mocked(port.updateListing).mockResolvedValue({
      ...sampleListing,
      establishmentId: 'est-original',
      title: 'Novo Nome',
    });

    await service.updateListing(
      { uid: 'partner-1', admin: false },
      'ev-1',
      {
        title: 'Novo Nome',
        establishmentId: 'est-hacked',
      } as unknown as Parameters<typeof service.updateListing>[2],
      { hasCommercialHistory: true }
    );

    expect(port.updateListing).toHaveBeenCalledWith(
      'ev-1',
      expect.not.objectContaining({
        establishmentId: 'est-hacked',
      })
    );
  });
});
