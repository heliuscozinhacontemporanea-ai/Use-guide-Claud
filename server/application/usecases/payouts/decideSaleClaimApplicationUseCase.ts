import {
  decideSaleClaimUseCase,
  getSaleClaimUseCase,
  PaymentDomainError,
  type SaleClaim,
  type SaleClaimDecision,
} from '../../../domain/payment';
import { releaseServiceProofHold } from '../bookings/releaseServiceProofHold';
import { chargeCancellationPenaltyApplicationUseCase } from './chargeCancellationPenaltyApplicationUseCase';

/**
 * Decisão do admin sobre a reclamação (D16). `chargePenalty` vale para o cancelamento silencioso: o serviço
 * não aconteceu e o CNPJ paga a mesma multa de 20% do cancelamento pelo proprietário (D14).
 */
export async function decideSaleClaimApplicationUseCase(
  adminUid: string,
  claimId: string,
  decision: SaleClaimDecision & { chargePenalty?: boolean }
): Promise<SaleClaim> {
  if (decision.chargePenalty) {
    const claim = await getSaleClaimUseCase(claimId);
    if (!claim) throw new PaymentDomainError('NOT_FOUND', 'Reclamação não encontrada.', 404);
    if (claim.reason !== 'did_not_happen' || decision.outcome !== 'refund_full') {
      throw new PaymentDomainError(
        'PENALTY_NOT_ALLOWED',
        'A multa vale só para serviço que não aconteceu, com reembolso integral.',
        422
      );
    }
    if (claim.status !== 'open') {
      throw new PaymentDomainError(
        'CLAIM_ALREADY_DECIDED',
        'Esta reclamação já foi decidida.',
        409
      );
    }
    // Antes do reembolso, que zera o valor vendido; repetir a decisão não gera outra multa.
    await chargeCancellationPenaltyApplicationUseCase({
      referenceType: 'sale_claim',
      referenceId: claim.id,
      sales: [
        {
          referenceType: claim.referenceType === 'booking' ? 'booking' : 'ticket_order',
          referenceId: claim.referenceId,
        },
      ],
    });
  }
  const decided = await decideSaleClaimUseCase(claimId, adminUid, {
    outcome: decision.outcome,
    ...(decision.amountMinor !== undefined ? { amountMinor: decision.amountMinor } : {}),
  });
  // D20: a decisão do admin encerra a espera pela prova do serviço; o que sobrou do repasse segue.
  if (decided.referenceType === 'booking' && decision.outcome !== 'refund_full') {
    await releaseServiceProofHold(decided.referenceId);
  }
  return decided;
}
