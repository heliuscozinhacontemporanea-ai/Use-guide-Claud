import { useEffect, useState } from 'react';
import { getEventListingByIdUseCase } from '../../domain/events';
import { useGuideCatalog } from '../../domain/guide';
import { type FirestoreReview, MyReviewsView, useMyReviews } from '../../domain/reviews';

/**
 * Minhas avaliações com o nome do lugar vindo do guia: a avaliação guarda só o ID do item. Eventos
 * que já saíram do catálogo (passados) são buscados um a um.
 */
export function MyReviewsComposition({ onBack }: { onBack: () => void }) {
  const { items, events } = useGuideCatalog();
  const source = useMyReviews();
  const { data } = source;
  const [eventTitles, setEventTitles] = useState<Record<string, string>>({});

  const catalogTitle = (review: FirestoreReview) =>
    review.itemCollection === 'events'
      ? events.find((event) => event.id === review.itemId)?.name
      : items.find((item) => item.id === review.itemId)?.name;

  const missingEvents = [
    ...new Set(
      data
        .filter((review) => review.itemCollection === 'events' && !catalogTitle(review))
        .map((review) => review.itemId)
        .filter((id) => !(id in eventTitles))
    ),
  ];
  const missingKey = missingEvents.join(',');

  useEffect(() => {
    if (!missingKey) return;
    let active = true;
    void Promise.all(
      missingKey.split(',').map(async (id) => {
        const event = await getEventListingByIdUseCase(id).catch(() => null);
        return [id, event?.title || event?.name || ''] as const;
      })
    ).then((pairs) => {
      if (active) setEventTitles((current) => ({ ...current, ...Object.fromEntries(pairs) }));
    });
    return () => {
      active = false;
    };
  }, [missingKey]);

  return (
    <MyReviewsView
      source={source}
      onBack={onBack}
      titleOf={(review) => catalogTitle(review) || eventTitles[review.itemId] || undefined}
    />
  );
}
