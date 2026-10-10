import { guideService } from '../factory';

export async function updateReviewAggregateUseCase(
  resourceType: 'items',
  resourceId: string,
  rating: number,
  reviewCount: number
): Promise<void> {
  if (!resourceId || !resourceId.trim()) {
    throw new Error('ID do recurso é obrigatório');
  }
  await guideService.updateReviewAggregate(resourceType, resourceId, rating, reviewCount);
}
