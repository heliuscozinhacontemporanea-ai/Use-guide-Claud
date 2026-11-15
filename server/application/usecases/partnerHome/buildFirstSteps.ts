import type { GuidePublication, ListingStep } from '../../../domain/guide';

/**
 * Guia de passos no "Resolva agora" (D34, no lugar dos primeiros passos de 2026-11-09): o anúncio
 * que o dono está montando ("Para aparecer no guia") e o que falta para vender. Um cartão por vez,
 * no primeiro segmento incompleto; some quando tudo está feito.
 */
export type FirstStepSegment =
  | 'tours'
  | 'rentals'
  | 'transfers'
  | 'events'
  | 'attraction'
  | 'lodging'
  | 'restaurant';

export type FirstStepId = 'verify' | 'account' | 'offer' | 'slots' | 'event';

export interface FirstStep {
  id: FirstStepId;
  done: boolean;
  /** `pending`: verificação em análise; `locked`: depende do passo anterior. */
  state?: 'pending' | 'locked';
  /** Estabelecimento que o passo abre. */
  itemId: string;
}

/** O anúncio que o cartão acompanha, com os passos de "Para aparecer no guia". */
export interface FirstStepsListing {
  itemId: string;
  name: string;
  publication: GuidePublication;
  steps: ListingStep[];
}

export interface PartnerFirstSteps {
  segment: FirstStepSegment;
  /** `prepare`: ainda não vende nada; `start`: já vende em outro segmento; `complete`: vitrine. */
  title: 'prepare' | 'start' | 'complete';
  listing: FirstStepsListing;
  steps: FirstStep[];
}

export interface FirstStepsInput {
  establishments: ReadonlyArray<{
    id: string;
    name: string;
    category: string;
    publication: GuidePublication;
    setupSteps: ListingStep[];
  }>;
  verifications: ReadonlyArray<{ itemId: string; status: string }>;
  accounts: ReadonlyArray<{ itemIds: string[]; account: { readyForSales: boolean } | null }>;
  offers: ReadonlyArray<{ id: string; guideItemId: string; kind: string }>;
  /** Ofertas com pelo menos um horário aberto daqui para a frente. */
  offersWithSlots: ReadonlySet<string>;
  events: ReadonlyArray<{ establishmentId?: string | null }>;
}

type Establishment = FirstStepsInput['establishments'][number];

const ORDER: ReadonlyArray<{ segment: FirstStepSegment; category: string; offerKind?: string }> = [
  { segment: 'tours', category: 'tour', offerKind: 'tour' },
  { segment: 'rentals', category: 'rental', offerKind: 'rental' },
  { segment: 'transfers', category: 'transfer', offerKind: 'transfer' },
  { segment: 'events', category: 'producer' },
  // Atração pode ser pública (não vende): por ora só a verificação, como a vitrine.
  { segment: 'attraction', category: 'sight' },
  { segment: 'lodging', category: 'hotel' },
  { segment: 'restaurant', category: 'restaurant' },
];

const SHOWCASE = new Set<FirstStepSegment>(['attraction', 'lodging', 'restaurant']);

const listingOpen = (item: Establishment) =>
  item.publication === 'draft' || item.setupSteps.some((step) => !step.done);

/** O rascunho primeiro; depois um anúncio publicado com passo em aberto; senão, o primeiro. */
function trackedListing(items: Establishment[]): Establishment {
  return (
    items.find((item) => item.publication === 'draft') ??
    items.find(listingOpen) ??
    (items[0] as Establishment)
  );
}

function stepsFor(
  entry: (typeof ORDER)[number],
  itemIds: string[],
  itemId: string,
  input: FirstStepsInput
): FirstStep[] {
  const statuses = input.verifications.filter((v) => itemIds.includes(v.itemId));
  const verified = statuses.some((v) => v.status === 'approved');
  const verify: FirstStep = {
    id: 'verify',
    done: verified,
    itemId,
    ...(!verified && statuses.some((v) => v.status === 'pending') ? { state: 'pending' } : {}),
  };
  if (SHOWCASE.has(entry.segment)) return [verify];
  const ready = input.accounts.some(
    (account) =>
      account.account?.readyForSales === true && account.itemIds.some((id) => itemIds.includes(id))
  );
  const account: FirstStep = {
    id: 'account',
    done: ready,
    itemId,
    ...(!ready && !verified ? { state: 'locked' } : {}),
  };
  if (entry.segment === 'events') {
    return [verify, account, { id: 'event', done: input.events.length > 0, itemId }];
  }
  const offers = input.offers.filter(
    (offer) => offer.kind === entry.offerKind && itemIds.includes(offer.guideItemId)
  );
  const hasSlots = offers.some((offer) => input.offersWithSlots.has(offer.id));
  return [
    verify,
    account,
    { id: 'offer', done: offers.length > 0, itemId },
    {
      id: 'slots',
      done: hasSlots,
      itemId,
      ...(!hasSlots && offers.length === 0 ? { state: 'locked' } : {}),
    },
  ];
}

export function buildFirstSteps(input: FirstStepsInput): PartnerFirstSteps | null {
  let anySellingDone = false;
  let pending: {
    entry: (typeof ORDER)[number];
    steps: FirstStep[];
    listing: Establishment;
  } | null = null;
  for (const entry of ORDER) {
    const items = input.establishments.filter((item) => item.category === entry.category);
    if (items.length === 0) continue;
    const listing = trackedListing(items);
    const itemIds = items.map((item) => item.id);
    const steps = stepsFor(entry, itemIds, listing.id, input);
    const complete = !listingOpen(listing) && steps.every((step) => step.done);
    if (complete && !SHOWCASE.has(entry.segment)) anySellingDone = true;
    if (!complete && !pending) pending = { entry, steps, listing };
  }
  if (!pending) return null;
  const title = SHOWCASE.has(pending.entry.segment)
    ? 'complete'
    : anySellingDone
      ? 'start'
      : 'prepare';
  const { listing } = pending;
  return {
    segment: pending.entry.segment,
    title,
    listing: {
      itemId: listing.id,
      name: listing.name,
      publication: listing.publication,
      steps: listing.setupSteps,
    },
    steps: pending.steps,
  };
}
