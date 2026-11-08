import { previewCourtesyLinkUseCase } from '../../../domain/ticketing';
import { courtesyBusinessName } from './courtesyBusinessName';

export interface CourtesyLinkPublicPreview {
  businessName: string | null;
  eventTitle: string;
  startsAt: string;
  locationName: string | null;
  timeZone?: string;
  city?: string;
  expiresAt: string;
}

/** O que a página do link de convite mostra antes do login (p28): só dados públicos do evento. */
export async function previewCourtesyLinkApplicationUseCase(
  courtesyId: string,
  token: string
): Promise<CourtesyLinkPublicPreview> {
  const preview = await previewCourtesyLinkUseCase(courtesyId, token);
  return {
    businessName: await courtesyBusinessName(preview.establishmentId),
    eventTitle: preview.eventTitle,
    startsAt: preview.startsAt,
    locationName: preview.locationName,
    timeZone: preview.timeZone,
    city: preview.city,
    expiresAt: preview.expiresAt,
  };
}
