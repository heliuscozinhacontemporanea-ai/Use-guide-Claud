import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import {
  createEventListingUseCase,
  deleteOrArchiveEventListingUseCase,
  type CreateEventListingInput,
} from '../../domain/events';
import { getItemByIdUseCase } from '../../domain/guide';
import {
  PartnerDomainError,
  getPartnerProfileUseCase,
  linkBusinessUseCase,
} from '../../domain/partners';

export type CreatePartnerEventInput = Omit<CreateEventListingInput, 'ownerId'> & {
  name: string;
  image: string;
  occurrences?: Array<{
    startsAt: string;
    endsAt: string;
    capacity: number;
    salesStartsAt?: string;
    salesEndsAt?: string;
  }>;
};

export async function createPartnerEventApplicationUseCase(
  user: AuthenticatedUserContext,
  data: CreatePartnerEventInput
): Promise<string> {
  const partnerProfile = await getPartnerProfileUseCase(user.uid);
  if (!partnerProfile) {
    throw new PartnerDomainError(
      'NOT_FOUND',
      'Perfil de parceiro não encontrado.'
    );
  }
  // Todo evento pertence a um estabelecimento ou ao perfil de produtor do parceiro (decisão D9).
  if (!data.establishmentId) {
    throw new PartnerDomainError(
      'INVALID_ARGUMENT',
      'Selecione o estabelecimento ou o perfil de produtor do evento.'
    );
  }
  const establishment = await getItemByIdUseCase(data.establishmentId);
  if (!establishment) {
    throw new PartnerDomainError('NOT_FOUND', 'Estabelecimento não encontrado.');
  }
  if (establishment.ownerId !== user.uid) {
    throw new PartnerDomainError(
      'FORBIDDEN',
      'Você não possui permissão sobre este estabelecimento.'
    );
  }

  const created = await createEventListingUseCase(user, {
    ...data,
    title: data.name,
    coverImage: data.image,
    establishmentId: data.establishmentId,
  });

  const eventId = created.listing.id;
  try {
    await linkBusinessUseCase(user.uid, {
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
  return eventId;
}
