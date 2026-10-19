import { getEventListingByIdUseCase } from '../../events';
import { getResourceOwnerIdUseCase } from '../../guide';
import { InsightsAccessError } from '../errors/insightsErrors';
import type { InsightsRepositoryPort } from '../ports/insightsRepositoryPort';
import type { ViewerKeyPort } from '../ports/viewerKeyPort';
import type { InteractionCounter, InteractionType, ItemStats } from '../types/interaction';
import { businessDayKey } from '../utils/businessDay';

/** O mesmo visitante abrindo o mesmo item de novo em até 30 minutos conta uma vez só. */
export const INTERACTION_GUARD_WINDOW_MS = 30 * 60 * 1000;

export interface TrackInteractionInput {
  itemId: string;
  itemCollection: 'items' | 'events';
  type: InteractionType;
  /** Usuário logado, quando houver. */
  uid?: string | null;
  /** IP do visitante (resolvido pelo `trust proxy`); só vira chave opaca, nunca é gravado. */
  ip?: string | null;
}

function counterFor(type: InteractionType, signedIn: boolean): InteractionCounter {
  if (type === 'view') return signedIn ? 'viewsSignedIn' : 'viewsAnonymous';
  return type;
}

export class InsightsService {
  constructor(
    private readonly repoPort: InsightsRepositoryPort,
    private readonly viewerKeys: ViewerKeyPort
  ) {}

  /** Devolve `false` quando a interação não foi contada (repetida na janela ou sem visitante). */
  async trackInteraction(input: TrackInteractionInput, now: Date = new Date()): Promise<boolean> {
    const viewer = input.uid ? `u:${input.uid}` : input.ip ? `ip:${input.ip}` : null;
    if (!viewer) return false;
    const guardId = this.viewerKeys.keyFor(
      `${viewer}|${input.type}|${input.itemCollection}|${input.itemId}`
    );
    return this.repoPort.recordInteraction({
      itemId: input.itemId,
      itemCollection: input.itemCollection,
      counter: counterFor(input.type, Boolean(input.uid)),
      day: businessDayKey(now),
      guardId,
      now,
      guardWindowMs: INTERACTION_GUARD_WINDOW_MS,
    });
  }

  async getItemStats(
    itemId: string,
    itemCollection: 'items' | 'events',
    userContext: { uid: string; admin?: boolean },
    now: Date = new Date()
  ): Promise<ItemStats> {
    if (!userContext.admin) {
      const ownerId =
        itemCollection === 'events'
          ? ((await getEventListingByIdUseCase(itemId))?.ownerId ?? null)
          : await getResourceOwnerIdUseCase('items', itemId);
      if (!ownerId || ownerId !== userContext.uid) {
        throw new InsightsAccessError();
      }
    }
    return this.repoPort.getItemStats(itemId, itemCollection, now);
  }
}
