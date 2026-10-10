import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import { getItemByIdUseCase, updateGuideItemUseCase } from '../../domain/guide';
import type { GuideUpdateItemInput } from '../../domain/guide';
import { updateBusinessUseCase } from '../../domain/partners';

function toItemRollbackInput(previous: { [key: string]: unknown }): GuideUpdateItemInput {
  const result: GuideUpdateItemInput = {};

  const stringFields = [
    'name',
    'description',
    'image',
    'location',
    'googleMapsType',
    'mapLink',
    'instagramLink',
    'websiteLink',
    'bookingLink',
    'whatsappLink',
    'googleMapsLink',
    'address',
  ] as const;

  for (const field of stringFields) {
    const value = previous[field];

    if (typeof value === 'string') {
      result[field] = value;
    }
  }

  if (Array.isArray(previous.images)) {
    result.images = previous.images.filter((value): value is string => typeof value === 'string');
  }

  if (Array.isArray(previous.tags)) {
    result.tags = previous.tags.filter((value): value is string => typeof value === 'string');
  }

  if (
    previous.operationalInfo &&
    typeof previous.operationalInfo === 'object' &&
    !Array.isArray(previous.operationalInfo)
  ) {
    result.operationalInfo = previous.operationalInfo as GuideUpdateItemInput['operationalInfo'];
  }

  if (typeof previous.isActive === 'boolean') {
    result.isActive = previous.isActive;
  }

  if (
    previous.category === 'hotel' ||
    previous.category === 'restaurant' ||
    previous.category === 'sight' ||
    previous.category === 'tour' ||
    previous.category === 'tips'
  ) {
    result.category = previous.category;
  }

  return result;
}

export async function updatePartnerItemApplicationUseCase(
  user: AuthenticatedUserContext,
  id: string,
  data: GuideUpdateItemInput
): Promise<void> {
  const previous = await getItemByIdUseCase(id);
  if (!previous) {
    throw new Error('Item não encontrado.');
  }

  const ownerId = previous.ownerId;
  if (typeof ownerId !== 'string' || !ownerId) {
    throw new Error('Proprietário do item não encontrado.');
  }

  await updateGuideItemUseCase(user, id, data);

  if (data.name && data.name !== previous.name) {
    try {
      await updateBusinessUseCase(ownerId, {
        businessId: id,
        businessName: data.name,
        type: 'item',
      });
    } catch (error) {
      try {
        await updateGuideItemUseCase(user, id, toItemRollbackInput(previous));
      } catch (rollbackError) {
        console.error(
          '[updatePartnerItemApplicationUseCase] Falha no rollback do item:',
          rollbackError
        );
      }

      throw error;
    }
  }
}
