import type {
  AvailabilitySlot,
  BookableOffer,
  Booking,
  BookingParticipant,
} from '../types/bookingTypes';

type Data = Record<string, unknown>;

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function int(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : 0;
}

/** Converte Timestamp do Firestore (ou string) em ISO; o resto do domínio só vê ISO. */
function iso(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate(): Date }).toDate().toISOString();
  }
  return '';
}

export const OfferPersistenceMapper = {
  toDomain(id: string, data: Data): BookableOffer {
    return {
      ...(data as unknown as BookableOffer),
      id,
      createdAt: iso(data.createdAt),
      updatedAt: iso(data.updatedAt),
    };
  },
  toPersistence(offer: BookableOffer): Data {
    const { id: _id, ...rest } = offer;
    return JSON.parse(JSON.stringify(rest)) as Data;
  },
};

export const SlotPersistenceMapper = {
  toDomain(id: string, data: Data): AvailabilitySlot {
    return {
      id,
      offerId: str(data.offerId),
      startsAt: iso(data.startsAt),
      ...(data.endsAt ? { endsAt: iso(data.endsAt) } : {}),
      capacityTotal: int(data.capacityTotal),
      capacityReserved: int(data.capacityReserved),
      capacitySold: int(data.capacitySold),
      status: str(data.status, 'closed') as AvailabilitySlot['status'],
      createdAt: iso(data.createdAt),
      updatedAt: iso(data.updatedAt),
    };
  },
  toPersistence(slot: AvailabilitySlot): Data {
    const { id: _id, ...rest } = slot;
    return JSON.parse(JSON.stringify(rest)) as Data;
  },
};

export const BookingPersistenceMapper = {
  toDomain(id: string, data: Data): Booking {
    return {
      ...(data as unknown as Booking),
      id,
      participantsCount: int(data.participantsCount),
      subtotalMinor: int(data.subtotalMinor),
      platformFeeMinor: int(data.platformFeeMinor),
      totalMinor: int(data.totalMinor),
      expiresAt: data.expiresAt ? iso(data.expiresAt) : null,
      createdAt: iso(data.createdAt),
      updatedAt: iso(data.updatedAt),
    };
  },
  toPersistence(booking: Booking): Data {
    const { id: _id, ...rest } = booking;
    return JSON.parse(JSON.stringify(rest)) as Data;
  },
};

export const ParticipantPersistenceMapper = {
  toDomain(data: Data): BookingParticipant {
    return {
      name: str(data.name),
      isLeadContact: data.isLeadContact === true,
      ...(typeof data.nameChangedAt === 'string' ? { nameChangedAt: data.nameChangedAt } : {}),
    };
  },
};
