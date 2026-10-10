import {
  trackInteractionUseCase as domainTrackInteraction,
  getItemStatsUseCase as domainGetItemStats,
  InteractionType as DomainInteractionType,
} from '../../domain/insights';

export type InteractionType = DomainInteractionType;

export async function trackInteraction(
  itemId: string,
  type: InteractionType,
  collectionName: 'items' | 'events',
  partnerId?: string
) {
  return domainTrackInteraction(itemId, type, collectionName, partnerId);
}

export async function getItemStats(itemId: string) {
  return domainGetItemStats(itemId);
}
