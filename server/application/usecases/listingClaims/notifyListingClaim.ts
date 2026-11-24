import { createNotificationUseCase } from '../../../domain/notifications';
import type { ListingClaimRecord } from '../../../domain/partners';

type ClaimOutcome = 'approved' | 'rejected' | 'returned';

/**
 * Aviso no app para quem pediu (D35), no idioma de quem lê: só o tipo e o nome do lugar. O e-mail
 * depende de um provedor de envio que o app ainda não tem (débito registrado).
 */
export async function notifyListingClaim(
  claim: ListingClaimRecord,
  outcome: ClaimOutcome,
  listingName: string
): Promise<void> {
  await createNotificationUseCase({
    recipientUid: claim.claimantId,
    type: `listing_claim_${outcome}`,
    params: { listing: listingName },
    link: { screen: 'partner' },
    dedupeKey: `listing_claim_${outcome}_${claim.claimId}_${claim.reviewedAt ?? ''}`,
  });
}
