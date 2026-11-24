import {
  type CreateEventListingInput,
  createEventListingUseCase,
  deleteOrArchiveEventListingUseCase,
} from '../../domain/events';
import { getItemByIdUseCase } from '../../domain/guide';
import { getPartnerProfileUseCase, PartnerDomainError } from '../../domain/partners';
import {
  type BrState,
  type PlaceTime,
  placeTimeOf,
  timeZoneForBrazilianCity,
} from '../../shared/kernel/timeZones';
import { USE_GUIDE_OWNER_ID } from '../../shared/kernel/useGuideOwner';
import type { AuthenticatedUserContext } from '../../shared/kernel/authenticatedUserContext';
import { syncListingSealApplicationUseCase } from './listingPlans/syncListingSealApplicationUseCase';
import { linkOwnerBusiness } from './ownerBusinessLink';

export type CreatePartnerEventInput = Omit<CreateEventListingInput, 'ownerId'> & {
  name: string;
  image: string;
  /** Só no evento do Use Guide sem estabelecimento: dão o fuso (D28). */
  state?: BrState;
  city?: string;
  occurrences?: Array<{
    startsAt: string;
    endsAt: string;
    capacity: number;
    salesStartsAt?: string;
    salesEndsAt?: string;
  }>;
};

/** Fuso e cidade do evento: os do estabelecimento ou, sem ele, os do estado e da cidade (D28). */
function eventPlace(
  establishment: object | null,
  data: CreatePartnerEventInput
): Partial<PlaceTime> {
  if (establishment) return placeTimeOf(establishment);
  const city = data.city?.trim();
  return data.state && city ? { timeZone: timeZoneForBrazilianCity(data.state, city), city } : {};
}

/**
 * Evento do parceiro, sempre num estabelecimento ou perfil de produtor dele (D9). O do admin é do Use
 * Guide (escolhas da F4): o estabelecimento é opcional e, se houver, é um anúncio do Use Guide.
 */
export async function createPartnerEventApplicationUseCase(
  user: AuthenticatedUserContext,
  data: CreatePartnerEventInput
): Promise<string> {
  const ownerId = user.admin ? USE_GUIDE_OWNER_ID : user.uid;
  if (!user.admin) {
    const partnerProfile = await getPartnerProfileUseCase(user.uid);
    if (!partnerProfile) {
      throw new PartnerDomainError('NOT_FOUND', 'Perfil de parceiro não encontrado.');
    }
    if (!data.establishmentId) {
      throw new PartnerDomainError(
        'INVALID_ARGUMENT',
        'Selecione o estabelecimento ou o perfil de produtor do evento.'
      );
    }
  }
  const establishment = data.establishmentId
    ? await getItemByIdUseCase(data.establishmentId)
    : null;
  if (data.establishmentId && !establishment) {
    throw new PartnerDomainError('NOT_FOUND', 'Estabelecimento não encontrado.');
  }
  if (establishment && establishment.ownerId !== ownerId) {
    throw new PartnerDomainError(
      'FORBIDDEN',
      'Você não possui permissão sobre este estabelecimento.'
    );
  }
  const place = eventPlace(establishment, data);
  if (!establishment && !place.timeZone) {
    throw new PartnerDomainError('INVALID_ARGUMENT', 'Informe o estado e a cidade do evento.');
  }

  const created = await createEventListingUseCase(user, {
    ...data,
    title: data.name,
    coverImage: data.image,
    establishmentId: data.establishmentId,
    // O evento usa o fuso e a cidade do estabelecimento ou do perfil de produtor (D28).
    ...place,
  });

  const eventId = created.listing.id;
  try {
    await linkOwnerBusiness(ownerId, {
      businessId: eventId,
      businessName: data.name,
      type: 'event',
    });
  } catch (error) {
    try {
      await deleteOrArchiveEventListingUseCase(user, eventId, false);
    } catch (rollbackError) {
      console.error(
        '[createPartnerEventApplicationUseCase] Falha no rollback do evento:',
        rollbackError
      );
    }
    throw error;
  }
  // O evento herda o selo do estabelecimento ou do perfil de produtor (D11); o Use Guide não tem selo.
  if (data.establishmentId && !user.admin) {
    await syncListingSealApplicationUseCase(data.establishmentId);
  }
  return eventId;
}
