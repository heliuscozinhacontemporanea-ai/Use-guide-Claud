import { courtesyService } from '../factory';
import type { CourtesyLinkPreview } from '../services/courtesyService';

/** O que o link de convite mostra antes do login (p28): evento, data e local. */
export function previewCourtesyLinkUseCase(
  courtesyId: string,
  token: string
): Promise<CourtesyLinkPreview> {
  return courtesyService.preview(courtesyId, token);
}
