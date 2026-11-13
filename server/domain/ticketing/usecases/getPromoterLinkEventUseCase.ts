import { promoterService } from '../factory';

/** Evento publicado de um link curto de divulgador (C6); `null` quando o link não vale mais. */
export function getPromoterLinkEventUseCase(param: string): Promise<string | null> {
  return promoterService.eventForLink(param);
}
