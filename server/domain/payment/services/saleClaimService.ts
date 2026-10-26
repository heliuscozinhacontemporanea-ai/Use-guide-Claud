import type { PaymentGatewayPort } from '../ports/paymentGatewayPort';
import type { SaleClaimRepositoryPort } from '../ports/saleClaimRepositoryPort';
import type { PayoutEntry } from '../types/payoutEntry';
import type {
  AdminSaleClaimView,
  BuyerSaleClaimView,
  SaleClaim,
  SaleClaimOutcome,
  SaleClaimReason,
} from '../types/saleClaim';
import { computeClaimDeadline, computeReleaseAt } from '../utils/payoutRules';
import type { PayoutService } from './payoutService';
import { PaymentDomainError } from './stripePaymentService';

export interface OpenSaleClaimInput {
  referenceType: string;
  referenceId: string;
  buyerUid: string;
  reason: SaleClaimReason;
  details?: string;
  serviceStartsAt: string;
  serviceEndsAt: string;
}

export interface SaleClaimDecision {
  outcome: SaleClaimOutcome;
  /** Só no reembolso parcial: sai do valor do proprietário, sem a taxa de serviço. */
  amountMinor?: number;
}

type ClaimPayouts = Pick<PayoutService, 'getForReference' | 'setHold' | 'applyRefund'>;

function refundedTotals(entry: PayoutEntry): { amountMinor: number; serviceFeeMinor: number } {
  return Object.values(entry.refunds).reduce(
    (sum, refund) => ({
      amountMinor: sum.amountMinor + refund.amountMinor,
      serviceFeeMinor: sum.serviceFeeMinor + refund.serviceFeeMinor,
    }),
    { amountMinor: 0, serviceFeeMinor: 0 }
  );
}

function refundableMinor(entry: PayoutEntry): number {
  return Math.max(0, entry.grossMinor - refundedTotals(entry).amountMinor);
}

function toBuyerView(claim: SaleClaim): BuyerSaleClaimView {
  return {
    id: claim.id,
    referenceType: claim.referenceType,
    referenceId: claim.referenceId,
    reason: claim.reason,
    status: claim.status,
    openedAt: claim.openedAt,
    decideBy: claim.decideBy,
    ...(claim.refundAmountMinor !== undefined
      ? { refundAmountMinor: claim.refundAmountMinor }
      : {}),
  };
}

/** Reclamações do comprador (D14, D16 2A): retêm o repasse da venda até a decisão do admin. */
export class SaleClaimService {
  constructor(
    private readonly claims: SaleClaimRepositoryPort,
    private readonly payouts: ClaimPayouts,
    private readonly gateway: Pick<PaymentGatewayPort, 'refundPayment'>,
    private readonly now: () => Date = () => new Date()
  ) {}

  /** Do início do serviço até 48 h depois do fim; uma reclamação por venda. */
  async open(input: OpenSaleClaimInput): Promise<SaleClaim> {
    const nowDate = this.now();
    const nowIso = nowDate.toISOString();
    if (nowIso < input.serviceStartsAt) {
      throw new PaymentDomainError(
        'CLAIM_TOO_EARLY',
        'Antes do início, use o cancelamento da compra.',
        422
      );
    }
    const entry = await this.payouts.getForReference(input.referenceType, input.referenceId);
    if (nowIso > computeReleaseAt(input.serviceEndsAt) || entry?.status === 'released') {
      throw new PaymentDomainError(
        'CLAIM_WINDOW_CLOSED',
        'O prazo para relatar um problema era de 48 h depois do fim do serviço.',
        422
      );
    }
    if (!entry || entry.status === 'canceled') {
      throw new PaymentDomainError(
        'CLAIM_NOT_ALLOWED',
        'Esta compra não tem valor a reclamar.',
        422
      );
    }
    const id = `claim_${input.referenceType}_${input.referenceId}`;
    if (await this.claims.get(id)) {
      throw new PaymentDomainError(
        'CLAIM_ALREADY_EXISTS',
        'Já existe uma reclamação para esta compra.',
        409
      );
    }
    const claim = await this.claims.createIfAbsent({
      id,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      payoutEntryId: entry.id,
      buyerUid: input.buyerUid,
      reason: input.reason,
      ...(input.details ? { details: input.details } : {}),
      status: 'open',
      openedAt: nowIso,
      decideBy: computeClaimDeadline(nowDate),
      updatedAt: nowIso,
    });
    await this.payouts.setHold(entry.id, 'claim', true);
    return claim;
  }

  get(claimId: string): Promise<SaleClaim | null> {
    return this.claims.get(claimId);
  }

  async listForBuyer(buyerUid: string): Promise<BuyerSaleClaimView[]> {
    const claims = await this.claims.listByBuyer(buyerUid, 50);
    return claims.map(toBuyerView);
  }

  /** Fila do admin, pelo prazo de decisão mais próximo. */
  async listPendingForAdmin(
    limit: number,
    cursor?: string
  ): Promise<{ data: AdminSaleClaimView[]; nextCursor: string | null }> {
    const claims = await this.claims.listPending(limit, cursor);
    const data = await Promise.all(
      claims.map(async (claim) => {
        const entry = await this.payouts.getForReference(claim.referenceType, claim.referenceId);
        return {
          ...toBuyerView(claim),
          buyerUid: claim.buyerUid,
          ...(claim.details ? { details: claim.details } : {}),
          grossMinor: entry?.grossMinor ?? 0,
          refundableMinor: entry ? refundableMinor(entry) : 0,
        };
      })
    );
    const last = claims[claims.length - 1];
    return { data, nextCursor: claims.length === limit && last ? last.id : null };
  }

  /**
   * Decisão do admin. Liberar devolve a venda à fila do repasse. Reembolso integral devolve tudo o que
   * resta, inclusive a taxa de serviço; o parcial sai só do valor do proprietário. O repasse fica retido
   * até o reembolso concluir, para não transferir o que vai voltar ao comprador.
   */
  async decide(claimId: string, adminUid: string, decision: SaleClaimDecision): Promise<SaleClaim> {
    const claim = await this.claims.get(claimId);
    if (!claim) throw new PaymentDomainError('NOT_FOUND', 'Reclamação não encontrada.', 404);
    if (claim.status !== 'open') {
      throw new PaymentDomainError(
        'CLAIM_ALREADY_DECIDED',
        'Esta reclamação já foi decidida.',
        409
      );
    }
    const nowIso = this.now().toISOString();
    if (decision.outcome === 'release') {
      const released = await this.finish(claim.id, 'released', { decidedBy: adminUid });
      await this.payouts.setHold(claim.payoutEntryId, 'claim', false);
      return released;
    }

    const entry = await this.payouts.getForReference(claim.referenceType, claim.referenceId);
    if (!entry) throw new PaymentDomainError('NOT_FOUND', 'Venda não encontrada.', 404);
    const refunded = refundedTotals(entry);
    const remainingServiceFee = Math.max(0, entry.serviceFeeMinor - refunded.serviceFeeMinor);
    const remaining = refundableMinor(entry);
    const full = decision.outcome === 'refund_full';
    const amountMinor = full ? remaining : (decision.amountMinor ?? 0);
    if (amountMinor <= 0 || amountMinor > (full ? remaining : remaining - remainingServiceFee)) {
      throw new PaymentDomainError(
        'INVALID_REFUND_AMOUNT',
        'Valor de reembolso fora do que ainda pode voltar ao comprador.',
        422
      );
    }
    const serviceFeeMinor = full ? remainingServiceFee : 0;
    const pending = await this.claims.update(claim.id, (current) =>
      current.status === 'open'
        ? {
            ...current,
            status: 'refund_pending',
            refundAttempts: (current.refundAttempts ?? 0) + 1,
            refundAmountMinor: amountMinor,
            refundServiceFeeMinor: serviceFeeMinor,
            decidedBy: adminUid,
            decidedAt: nowIso,
            updatedAt: nowIso,
          }
        : null
    );
    const result = await this.gateway
      .refundPayment({
        paymentIntentId: entry.paymentIntentId,
        amountMinor,
        // Repetir a mesma tentativa não reembolsa duas vezes; uma nova decisão usa outra chave.
        idempotencyKey: `refund_claim_${claim.id}_${pending?.refundAttempts ?? 1}`,
        metadata: { referenceType: 'claim_refund', claimId: claim.id },
      })
      .catch(async (error: unknown) => {
        await this.failRefund(claim.id);
        throw error;
      });
    if (result.status === 'failed') {
      await this.failRefund(claim.id);
      throw new PaymentDomainError(
        'CLAIM_REFUND_FAILED',
        'O reembolso foi recusado pelo meio de pagamento.',
        503
      );
    }
    if (result.providerRefundId) {
      await this.claims.update(claim.id, (current) => ({
        ...current,
        providerRefundId: result.providerRefundId ?? undefined,
        updatedAt: this.now().toISOString(),
      }));
    }
    if (result.status === 'succeeded' && result.providerRefundId) {
      return this.completeRefund(claim.id, result.providerRefundId);
    }
    return (await this.claims.get(claim.id)) ?? claim;
  }

  /** Reembolso concluído (resposta do Stripe ou `refund.updated`); repetir não desconta duas vezes. */
  async completeRefund(claimId: string, providerRefundId: string): Promise<SaleClaim> {
    const claim = await this.claims.get(claimId);
    if (!claim) throw new PaymentDomainError('NOT_FOUND', 'Reclamação não encontrada.', 404);
    if (claim.status !== 'refund_pending' && claim.status !== 'refunded') return claim;
    // O desconto no repasse vem antes da mudança de status: se falhar, o webhook tenta de novo.
    await this.payouts.applyRefund({
      referenceType: claim.referenceType,
      referenceId: claim.referenceId,
      refundKey: providerRefundId,
      amountMinor: claim.refundAmountMinor ?? 0,
      serviceFeeMinor: claim.refundServiceFeeMinor ?? 0,
    });
    const done = await this.finish(claim.id, 'refunded', { providerRefundId });
    await this.payouts.setHold(claim.payoutEntryId, 'claim', false);
    return done;
  }

  /** Reembolso recusado: a reclamação volta para o admin decidir de novo, ainda retendo o repasse. */
  async failRefund(claimId: string): Promise<void> {
    await this.claims.update(claimId, (current) =>
      current.status === 'refund_pending'
        ? { ...current, status: 'open', updatedAt: this.now().toISOString() }
        : null
    );
  }

  /** Job de hora em hora: sem decisão em 5 dias, o repasse é liberado (D14). */
  async expireDue(limit = 100): Promise<number> {
    const nowIso = this.now().toISOString();
    const expired = await this.claims.listExpired(nowIso, limit);
    let count = 0;
    for (const claim of expired) {
      const updated = await this.claims.update(claim.id, (current) =>
        current.status === 'open' ? { ...current, status: 'expired', updatedAt: nowIso } : null
      );
      if (updated?.status !== 'expired') continue;
      await this.payouts.setHold(claim.payoutEntryId, 'claim', false);
      count += 1;
    }
    return count;
  }

  private async finish(
    claimId: string,
    status: 'released' | 'refunded',
    extra: Partial<Pick<SaleClaim, 'decidedBy' | 'providerRefundId'>>
  ): Promise<SaleClaim> {
    const nowIso = this.now().toISOString();
    const updated = await this.claims.update(claimId, (current) =>
      current.status === status
        ? null
        : {
            ...current,
            ...extra,
            status,
            ...(extra.decidedBy ? { decidedAt: nowIso } : {}),
            updatedAt: nowIso,
          }
    );
    if (!updated) throw new PaymentDomainError('NOT_FOUND', 'Reclamação não encontrada.', 404);
    return updated;
  }
}
