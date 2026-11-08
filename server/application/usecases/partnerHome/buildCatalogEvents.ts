import type { EventListing, EventOccurrence } from '../../../domain/events';

export type CatalogEventStatus = 'published' | 'draft' | 'paused' | 'ended';

/** Linha de evento no Catálogo do painel (p09). */
export interface PartnerCatalogEvent {
  id: string;
  title: string;
  establishmentIds: string[];
  status: CatalogEventStatus;
  /** O que falta para publicar um rascunho. */
  missing: 'cover' | 'sessions' | null;
  sessions: number;
  nextStartsAt: string | null;
  lastStartsAt: string | null;
  sold: number;
}

export interface CatalogEventInput {
  event: Pick<
    EventListing,
    'id' | 'title' | 'name' | 'establishmentId' | 'status' | 'isActive' | 'coverImage' | 'image'
  >;
  occurrences: Array<Pick<EventOccurrence, 'startsAt' | 'endsAt' | 'status'>>;
  sold: number;
}

function statusOf(input: CatalogEventInput, upcoming: number, nowIso: string): CatalogEventStatus {
  const { event } = input;
  if (event.status === 'draft') return 'draft';
  if (event.status === 'paused' || !event.isActive) return 'paused';
  const anyFuture = input.occurrences.some(
    (occurrence) => (occurrence.endsAt || occurrence.startsAt) > nowIso
  );
  return upcoming === 0 && !anyFuture && input.occurrences.length > 0 ? 'ended' : 'published';
}

/** Monta as linhas do Catálogo: arquivados e sessões canceladas ficam de fora. */
export function buildCatalogEvents(
  inputs: CatalogEventInput[],
  nowIso: string
): PartnerCatalogEvent[] {
  return inputs
    .filter((input) => input.event.status !== 'archived')
    .map((input): PartnerCatalogEvent => {
      const live = input.occurrences.filter((occurrence) => occurrence.status !== 'canceled');
      const starts = live.map((occurrence) => occurrence.startsAt).sort();
      const upcoming = starts.filter((startsAt) => startsAt > nowIso);
      const status = statusOf({ ...input, occurrences: live }, upcoming.length, nowIso);
      const hasCover = Boolean(input.event.coverImage || input.event.image);
      const missing: PartnerCatalogEvent['missing'] =
        status !== 'draft' ? null : !hasCover ? 'cover' : live.length === 0 ? 'sessions' : null;
      return {
        id: input.event.id,
        title: input.event.title || input.event.name,
        establishmentIds: input.event.establishmentId ? [input.event.establishmentId] : [],
        status,
        missing,
        sessions: live.length,
        nextStartsAt: upcoming[0] ?? null,
        lastStartsAt: starts.at(-1) ?? null,
        sold: input.sold,
      };
    })
    .sort(
      (a, b) =>
        order(a) - order(b) ||
        (a.nextStartsAt ?? a.lastStartsAt ?? '').localeCompare(
          b.nextStartsAt ?? b.lastStartsAt ?? ''
        )
    );
}

const ORDER: Record<CatalogEventStatus, number> = { published: 0, draft: 1, paused: 2, ended: 3 };
function order(event: PartnerCatalogEvent): number {
  return ORDER[event.status];
}
