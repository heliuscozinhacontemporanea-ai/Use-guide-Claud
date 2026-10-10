export function buildReviewId(
  itemCollection: 'items' | 'events',
  itemId: string,
  userId: string,
  occurrenceId?: string
): string {
  if (itemCollection === 'events' && occurrenceId?.trim()) {
    return [
      itemCollection,
      encodeURIComponent(itemId),
      encodeURIComponent(occurrenceId.trim()),
      encodeURIComponent(userId),
    ].join('__');
  }
  return [itemCollection, encodeURIComponent(itemId), encodeURIComponent(userId)].join('__');
}
