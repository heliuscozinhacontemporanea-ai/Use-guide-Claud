import { ListingPlanError } from '../errors/listingPlanError';
import type { ListingPlanRepositoryPort } from '../ports/listingPlanRepositoryPort';
import type {
  ListingPlanRecord,
  ListingPlanView,
  ListingSeal,
  PaidListingPlanType,
  PlanListing,
} from '../types/listingPlan';
import type { ListingVerificationStatus } from '../types/listingVerification';
import {
  computeListingSeal,
  EMPTY_PLAN,
  hasActivePurchasedPlan,
  isPlanActive,
  resolveAdminPlan,
} from '../utils/listingSeal';

const TRIAL_DAYS = 7;
const DAY_MS = 86_400_000;

type VerificationState = ListingVerificationStatus | 'not_submitted';

interface Actor {
  uid: string;
  admin?: boolean;
}

/** Plano "Use Guide Verificado" por estabelecimento (D11): trial, plano pago e selo do admin. */
export class ListingPlanService {
  constructor(
    private readonly repository: ListingPlanRepositoryPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async getView(
    actor: Actor,
    listing: PlanListing,
    verification: VerificationState
  ): Promise<ListingPlanView> {
    if (!actor.admin && actor.uid !== listing.ownerId) {
      throw new ListingPlanError('FORBIDDEN', 'Sem acesso ao plano deste estabelecimento.');
    }
    const [record, usedTrial] = await Promise.all([
      this.repository.get(listing.id),
      this.repository.hasUsedTrial(listing.ownerId),
    ]);
    const plan = record ?? EMPTY_PLAN;
    const now = this.now();
    const planActive = isPlanActive(plan, now);
    return {
      itemId: listing.id,
      planType: planActive ? plan.planType : null,
      planUntil: planActive ? plan.planUntil : null,
      planActive,
      sealSuspended: plan.sealSuspended,
      seal: computeListingSeal(plan, verification, now),
      trialAvailable: !usedTrial && !planActive,
    };
  }

  /** Trial de 7 dias, uma vez por conta, no estabelecimento que o parceiro escolher (D11). */
  async activateTrial(
    actor: Actor,
    listing: PlanListing,
    verification: VerificationState
  ): Promise<ListingPlanRecord> {
    await this.assertCanPurchase(actor, listing, verification);
    const current = await this.repository.get(listing.id);
    const now = this.now();
    if (current && hasActivePurchasedPlan(current, now)) {
      throw new ListingPlanError('PLAN_ALREADY_ACTIVE', 'Este estabelecimento já tem plano ativo.');
    }
    const record: ListingPlanRecord = {
      itemId: listing.id,
      ownerId: listing.ownerId,
      planType: 'trial',
      planUntil: new Date(now.getTime() + TRIAL_DAYS * DAY_MS).toISOString(),
      sealSuspended: current?.sealSuspended ?? false,
      sealActive: current?.sealActive ?? false,
      updatedAt: now.toISOString(),
    };
    await this.repository.activateTrial(record);
    return record;
  }

  /** Plano e trial só depois da verificação aprovada; avaliações e cadastro seguem livres (D11). */
  async assertCanPurchase(
    actor: Actor,
    listing: PlanListing,
    verification: VerificationState
  ): Promise<void> {
    if (actor.uid !== listing.ownerId) {
      throw new ListingPlanError('FORBIDDEN', 'Só o dono contrata o plano do estabelecimento.');
    }
    if (await this.repository.isOwnerSuspended(listing.ownerId)) {
      throw new ListingPlanError('PARTNER_SUSPENDED', 'Conta de parceiro suspensa.');
    }
    if (verification !== 'approved') {
      throw new ListingPlanError(
        'LISTING_PENDING_VERIFICATION',
        'O estabelecimento precisa ser verificado pelo Use Guide antes do plano.'
      );
    }
  }

  async getPlanUntil(itemId: string): Promise<string | null> {
    const record = await this.repository.get(itemId);
    return record && isPlanActive(record, this.now()) ? record.planUntil : null;
  }

  /** Grava o plano pago confirmado pelo Stripe; uma suspensão feita pelo admin é mantida (D8). */
  async applyPaidPlan(
    listing: PlanListing,
    planType: PaidListingPlanType,
    planUntil: string
  ): Promise<ListingPlanRecord> {
    const current = await this.repository.get(listing.id);
    const record: ListingPlanRecord = {
      itemId: listing.id,
      ownerId: listing.ownerId,
      planType,
      planUntil,
      sealSuspended: current?.sealSuspended ?? false,
      sealActive: current?.sealActive ?? false,
      updatedAt: this.now().toISOString(),
    };
    await this.repository.save(record);
    return record;
  }

  async setAdminSeal(actor: Actor, listing: PlanListing, grant: boolean): Promise<void> {
    if (!actor.admin) {
      throw new ListingPlanError('FORBIDDEN', 'Somente administradores alteram o selo.');
    }
    const current = await this.repository.get(listing.id);
    const now = this.now();
    const next = resolveAdminPlan(current ?? EMPTY_PLAN, grant, now);
    await this.repository.save({
      itemId: listing.id,
      ownerId: listing.ownerId,
      ...next,
      sealActive: current?.sealActive ?? false,
      updatedAt: now.toISOString(),
    });
  }

  async computeSeal(itemId: string, verification: VerificationState): Promise<ListingSeal> {
    const record = await this.repository.get(itemId);
    return computeListingSeal(record ?? EMPTY_PLAN, verification, this.now());
  }

  setSealActive(itemId: string, sealActive: boolean): Promise<void> {
    return this.repository.setSealActive(itemId, sealActive);
  }

  listExpiredWithSeal(limit: number): Promise<ListingPlanRecord[]> {
    return this.repository.listExpiredWithSeal(this.now().toISOString(), limit);
  }

  listExpiringWithSeal(withinDays: number, limit: number): Promise<ListingPlanRecord[]> {
    const now = this.now();
    const until = new Date(now.getTime() + withinDays * DAY_MS);
    return this.repository.listExpiringWithSeal(now.toISOString(), until.toISOString(), limit);
  }

  deleteForListing(itemId: string): Promise<void> {
    return this.repository.delete(itemId);
  }

  deleteForOwner(ownerId: string): Promise<void> {
    return this.repository.deleteByOwner(ownerId);
  }
}
