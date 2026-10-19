import type { ItemStats } from '../types/interaction';

export interface AudienceShare {
  signedIn: number;
  anonymous: number;
}

/** Fração (0–1) de visualizações com e sem conta; `null` quando ainda não há visualização. */
export function audienceShare(
  stats: Pick<ItemStats, 'viewsSignedIn' | 'viewsAnonymous'>
): AudienceShare | null {
  const total = stats.viewsSignedIn + stats.viewsAnonymous;
  if (total <= 0) return null;
  const signedIn = stats.viewsSignedIn / total;
  return { signedIn, anonymous: 1 - signedIn };
}
