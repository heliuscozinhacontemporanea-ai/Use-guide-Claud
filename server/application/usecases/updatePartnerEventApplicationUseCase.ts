import {
  getEventListingByIdUseCase,
  type UpdateEventListingInput,
  updateEventListingUseCase,
} from '../../domain/events';
import { getItemByIdUseCase } from '../../domain/guide';
import { updateBusinessUseCase } from '../../domain/partners';
import { placeTimeOf } from '../../shared/kernel/timeZones';
import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import { updateEventListingSafelyApplicationUseCase } from './updateEventListingSafelyApplicationUseCase';

export async function updatePartnerEventApplicationUseCase(
  user: AuthenticatedUserContext,
  id: string,
  data: UpdateEventListingInput
): Promise<void> {
  const previous = await getEventListingByIdUseCase(id);
  if (!previous) {
    throw new Error('Evento não encontrado.');
  }

  const ownerId = previous.ownerId;
  if (typeof ownerId !== 'string' || !ownerId) {
    throw new Error('Proprietário do evento não encontrado.');
  }

  // O fuso segue o do estabelecimento do evento, que pode ter mudado de cidade (D28).
  const establishment = previous.establishmentId
    ? await getItemByIdUseCase(previous.establishmentId)
    : null;
  const { timeZone: _ignoredZone, city: _ignoredCity, ...fromClient } = data;
  const updatePayload: UpdateEventListingInput = {
    ...fromClient,
    title: data.name,
    coverImage: data.image,
    ...(establishment ? placeTimeOf(establishment) : {}),
  };

  await updateEventListingSafelyApplicationUseCase(user, id, updatePayload);

  if (data.name && data.name !== previous.name) {
    try {
      await updateBusinessUseCase(ownerId, {
        businessId: id,
        businessName: data.name,
        type: 'event',
      });
    } catch (error) {
      try {
        await updateEventListingUseCase(user, id, {
          name: previous.name,
          title: previous.title,
        });
      } catch (rollbackError) {
        console.error(
          '[updatePartnerEventApplicationUseCase] Falha no rollback do evento:',
          rollbackError
        );
      }

      throw error;
    }
  }
}
