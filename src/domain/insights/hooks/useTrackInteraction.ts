import { useCallback } from 'react';
import { trackInteractionUseCase } from '../application/usecases/trackInteractionUseCase';
import { InteractionType } from '../types/interaction';

export function useTrackInteraction() {
  const track = useCallback(
    async (
      itemId: string,
      type: InteractionType,
      collectionName: 'items' | 'events',
      partnerId?: string
    ) => {
      await trackInteractionUseCase(itemId, type, collectionName, partnerId);
    },
    []
  );

  return { trackInteraction: track };
}
