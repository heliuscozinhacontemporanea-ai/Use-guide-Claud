import { beforeEach, describe, expect, it } from 'vitest';
import { ListingPlanError } from '../errors/listingPlanError';
import type { ListingPlanRepositoryPort } from '../ports/listingPlanRepositoryPort';
import type { ListingPlanRecord } from '../types/listingPlan';
import { ListingPlanService } from './listingPlanService';

class InMemoryPlans implements ListingPlanRepositoryPort {
  plans = new Map<string, ListingPlanRecord>();
  usedTrial = new Set<string>();
  suspended = new Set<string>();
  async get(itemId: string) {
    return this.plans.get(itemId) ?? null;
  }
  async save(record: ListingPlanRecord) {
    this.plans.set(record.itemId, record);
  }
  async activateTrial(record: ListingPlanRecord) {
    if (this.usedTrial.has(record.ownerId)) {
      throw new ListingPlanError('TRIAL_ALREADY_USED', 'usado');
    }
    this.usedTrial.add(record.ownerId);
    this.plans.set(record.itemId, record);
  }
  async hasUsedTrial(ownerId: string) {
    return this.usedTrial.has(ownerId);
  }
  async isOwnerSuspended(ownerId: string) {
    return this.suspended.has(ownerId);
  }
  async setSealActive(itemId: string, sealActive: boolean) {
    const record = this.plans.get(itemId);
    if (record) record.sealActive = sealActive;
  }
  async listExpiredWithSeal(nowIso: string) {
    return [...this.plans.values()].filter(
      (p) => p.sealActive && p.planUntil !== null && p.planUntil <= nowIso
    );
  }
  async listExpiringWithSeal(fromIso: string, toIso: string) {
    return [...this.plans.values()].filter(
      (p) => p.sealActive && p.planUntil !== null && p.planUntil > fromIso && p.planUntil <= toIso
    );
  }
  async listActive(nowIso: string) {
    return [...this.plans.values()].filter((p) => p.planUntil !== null && p.planUntil > nowIso);
  }
  async delete(itemId: string) {
    this.plans.delete(itemId);
  }
  async deleteByOwner(ownerId: string) {
    for (const [id, p] of this.plans) if (p.ownerId === ownerId) this.plans.delete(id);
  }
}

const owner = { uid: 'owner-1' };
const admin = { uid: 'admin-1', admin: true };
const pousada = { id: 'item-1', ownerId: 'owner-1' };
const restaurante = { id: 'item-2', ownerId: 'owner-1' };

describe('ListingPlanService (D11)', () => {
  let repo: InMemoryPlans;
  let service: ListingPlanService;

  beforeEach(() => {
    repo = new InMemoryPlans();
    service = new ListingPlanService(repo, () => new Date('2026-10-21T12:00:00Z'));
  });

  it('trial e plano exigem verificação aprovada', async () => {
    await expect(service.activateTrial(owner, pousada, 'pending')).rejects.toMatchObject({
      code: 'LISTING_PENDING_VERIFICATION',
    });
    await expect(service.assertCanPurchase(owner, pousada, 'not_submitted')).rejects.toMatchObject({
      code: 'LISTING_PENDING_VERIFICATION',
    });
  });

  it('trial de 7 dias, uma vez por conta, no estabelecimento escolhido', async () => {
    const trial = await service.activateTrial(owner, pousada, 'approved');
    expect(trial).toMatchObject({ planType: 'trial', planUntil: '2026-10-28T12:00:00.000Z' });
    await expect(service.activateTrial(owner, restaurante, 'approved')).rejects.toMatchObject({
      code: 'TRIAL_ALREADY_USED',
    });
    const view = await service.getView(owner, restaurante, 'approved');
    expect(view.trialAvailable).toBe(false);
  });

  it('só o dono contrata; conta suspensa não contrata', async () => {
    await expect(service.activateTrial(admin, pousada, 'approved')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    repo.suspended.add('owner-1');
    await expect(service.activateTrial(owner, pousada, 'approved')).rejects.toMatchObject({
      code: 'PARTNER_SUSPENDED',
    });
  });

  it('plano pago mantém a suspensão do admin e o selo segue a verificação', async () => {
    await service.setAdminSeal(admin, pousada, true);
    await service.applyPaidPlan(pousada, 'annual', '2027-10-21T12:00:00.000Z');
    await service.setAdminSeal(admin, pousada, false);
    expect((await repo.get('item-1'))?.planType).toBe('annual');
    expect(await service.computeSeal('item-1', 'approved')).toMatchObject({
      isVerified: true,
      isVerificationSuspended: true,
    });
    expect((await service.computeSeal('item-1', 'rejected')).isVerified).toBe(false);
  });

  it('só admin mexe no selo; outro dono não vê o plano', async () => {
    await expect(service.setAdminSeal(owner, pousada, true)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(service.getView({ uid: 'intruso' }, pousada, 'approved')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('métricas exigem plano em vigor no estabelecimento', async () => {
    await expect(service.assertPlanActive('item-1')).rejects.toMatchObject({
      code: 'LISTING_PLAN_REQUIRED',
      statusCode: 403,
    });
    const expired: ListingPlanRecord = {
      itemId: 'item-1',
      ownerId: 'owner-1',
      planType: 'monthly',
      planUntil: '2026-10-20T12:00:00.000Z',
      sealSuspended: false,
      sealActive: false,
      updatedAt: '',
    };
    await repo.save(expired);
    await expect(service.assertPlanActive('item-1')).rejects.toMatchObject({
      code: 'LISTING_PLAN_REQUIRED',
    });
    await repo.save({ ...expired, planUntil: '2026-11-20T12:00:00.000Z' });
    await expect(service.assertPlanActive('item-1')).resolves.toBeUndefined();
  });

  it('destaque: só planos em vigor de contas não suspensas', async () => {
    const base: ListingPlanRecord = {
      itemId: 'item-1',
      ownerId: 'owner-1',
      planType: 'annual',
      planUntil: '2027-01-01T00:00:00.000Z',
      sealSuspended: false,
      sealActive: true,
      updatedAt: '',
    };
    await repo.save(base);
    await repo.save({ ...base, itemId: 'item-2', planUntil: '2026-10-01T00:00:00.000Z' });
    await repo.save({ ...base, itemId: 'item-3', ownerId: 'owner-2' });
    repo.suspended.add('owner-2');
    expect(await service.listActivePlanItemIds(50)).toEqual(['item-1']);
  });

  it('lista selos ligados já vencidos e os que vencem em breve', async () => {
    await repo.save({
      itemId: 'item-1',
      ownerId: 'owner-1',
      planType: 'monthly',
      planUntil: '2026-10-20T12:00:00.000Z',
      sealSuspended: false,
      sealActive: true,
      updatedAt: '',
    });
    await repo.save({
      itemId: 'item-2',
      ownerId: 'owner-1',
      planType: 'monthly',
      planUntil: '2026-10-23T12:00:00.000Z',
      sealSuspended: false,
      sealActive: true,
      updatedAt: '',
    });
    expect((await service.listExpiredWithSeal(50)).map((p) => p.itemId)).toEqual(['item-1']);
    expect((await service.listExpiringWithSeal(3, 50)).map((p) => p.itemId)).toEqual(['item-2']);
  });
});
