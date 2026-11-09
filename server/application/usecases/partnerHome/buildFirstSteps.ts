/**
 * Primeiros passos dentro do "Resolva agora" (painel por segmento, 2026-11-09): o que falta para o
 * parceiro vender em cada segmento. Um cartão por vez, no primeiro segmento incompleto; some quando
 * tudo está feito.
 */
export type FirstStepSegment =
  | 'tours'
  | 'rentals'
  | 'transfers'
  | 'events'
  | 'attraction'
  | 'lodging'
  | 'restaurant';

export type FirstStepId = 'verify' | 'account' | 'offer' | 'event';

export interface FirstStep {
  id: FirstStepId;
  done: boolean;
  /** `pending`: verificação enviada, em análise; `locked`: só depois da verificação. */
  state?: 'pending' | 'locked';
  /** Estabelecimento que o passo abre. */
  itemId: string;
}

export interface PartnerFirstSteps {
  segment: FirstStepSegment;
  /** `prepare`: ainda não vende nada; `start`: já vende em outro segmento; `complete`: vitrine. */
  title: 'prepare' | 'start' | 'complete';
  steps: FirstStep[];
}

export interface FirstStepsInput {
  establishments: ReadonlyArray<{ id: string; category: string }>;
  verifications: ReadonlyArray<{ itemId: string; status: string }>;
  accounts: ReadonlyArray<{ itemIds: string[]; account: { readyForSales: boolean } | null }>;
  offers: ReadonlyArray<{ guideItemId: string; kind: string }>;
  events: ReadonlyArray<{ establishmentId?: string | null }>;
}

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

function stepsFor(
  entry: (typeof ORDER)[number],
  itemIds: string[],
  input: FirstStepsInput
): FirstStep[] {
  const itemId = itemIds[0] as string;
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
  const sells =
    entry.segment === 'events'
      ? input.events.length > 0
      : input.offers.some(
          (offer) => offer.kind === entry.offerKind && itemIds.includes(offer.guideItemId)
        );
  return [
    verify,
    account,
    { id: entry.segment === 'events' ? 'event' : 'offer', done: sells, itemId },
  ];
}

export function buildFirstSteps(input: FirstStepsInput): PartnerFirstSteps | null {
  let anySellingDone = false;
  let pending: { entry: (typeof ORDER)[number]; steps: FirstStep[] } | null = null;
  for (const entry of ORDER) {
    const itemIds = input.establishments
      .filter((item) => item.category === entry.category)
      .map((item) => item.id);
    if (itemIds.length === 0) continue;
    const steps = stepsFor(entry, itemIds, input);
    const complete = steps.every((step) => step.done);
    if (complete && !SHOWCASE.has(entry.segment)) anySellingDone = true;
    if (!complete && !pending) pending = { entry, steps };
  }
  if (!pending) return null;
  const title = SHOWCASE.has(pending.entry.segment)
    ? 'complete'
    : anySellingDone
      ? 'start'
      : 'prepare';
  return { segment: pending.entry.segment, title, steps: pending.steps };
}
