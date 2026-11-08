import { FieldValue, type Transaction } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { PromotionsDomainError } from '../errors/promotionsDomainError';
import type { PromoCodePort } from '../ports/promoCodePort';
import {
  normalizePromoCode,
  type PromoCode,
  type PromoCodeInput,
  type PromoCodeLimitsEdit,
  type PromoTarget,
  promoTargetKey,
} from '../types/promoCode';
import { assertPromoUsable } from '../utils/assertPromoUsable';

// Coleções só de backend (`allow read, write: if false`); o dono lê pela API (§6.2).
const CODES = 'promoCodes';
const REDEMPTIONS = 'promoRedemptions';
const BUYERS = 'promoBuyers';

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : null;
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

function toTargets(raw: unknown): PromoTarget[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const target = item as Record<string, unknown>;
    if ((target.kind !== 'event' && target.kind !== 'offer') || typeof target.id !== 'string') {
      return [];
    }
    const optionIds = Array.isArray(target.optionIds)
      ? target.optionIds.filter((id): id is string => typeof id === 'string')
      : null;
    return [{ kind: target.kind, id: target.id, optionIds }];
  });
}

function toDomain(id: string, raw: Record<string, unknown>): PromoCode {
  return {
    id,
    ownerId: String(raw.ownerId ?? ''),
    code: String(raw.code ?? ''),
    type: raw.type === 'fixed' ? 'fixed' : 'percentage',
    percentage: num(raw.percentage),
    valueMinor: num(raw.valueMinor),
    targets: toTargets(raw.targets),
    maxUses: num(raw.maxUses),
    usedCount: num(raw.usedCount) ?? 0,
    firstUsedAt: str(raw.firstUsedAt),
    onePerAccount: raw.onePerAccount === true,
    maxTicketsPerOrder: num(raw.maxTicketsPerOrder),
    startsAt: str(raw.startsAt),
    endsAt: str(raw.endsAt),
    isActive: raw.isActive !== false,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  };
}

function toDoc(input: PromoCodeInput) {
  return {
    code: normalizePromoCode(input.code),
    type: input.type,
    percentage: input.type === 'percentage' ? input.percentage : null,
    valueMinor: input.type === 'fixed' ? input.valueMinor : null,
    targets: input.targets.map((target) => ({
      kind: target.kind,
      id: target.id,
      optionIds: target.optionIds,
    })),
    targetKeys: input.targets.map(promoTargetKey),
    maxUses: input.maxUses,
    onePerAccount: input.onePerAccount,
    maxTicketsPerOrder: input.type === 'percentage' ? input.maxTicketsPerOrder : null,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
  };
}

async function assertCodeFree(tx: Transaction, ownerId: string, code: string, selfId?: string) {
  const taken = await tx.get(
    adminDb.collection(CODES).where('ownerId', '==', ownerId).where('code', '==', code).limit(2)
  );
  if (taken.docs.some((doc) => doc.id !== selfId)) {
    throw new PromotionsDomainError('PROMO_CODE_TAKEN', 'Você já tem um cupom com este código.');
  }
}

export class FirestorePromoCodeAdapter implements PromoCodePort {
  async listByOwner(ownerId: string): Promise<PromoCode[]> {
    const snap = await adminDb
      .collection(CODES)
      .where('ownerId', '==', ownerId)
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();
    return snap.docs.map((doc) => toDomain(doc.id, doc.data()));
  }

  async getById(id: string): Promise<PromoCode | null> {
    const snap = await adminDb.collection(CODES).doc(id).get();
    return snap.exists ? toDomain(snap.id, snap.data() ?? {}) : null;
  }

  async findForTarget(code: string, targetKey: string): Promise<PromoCode | null> {
    const snap = await adminDb
      .collection(CODES)
      .where('code', '==', normalizePromoCode(code))
      .where('targetKeys', 'array-contains', targetKey)
      .limit(1)
      .get();
    const doc = snap.docs[0];
    return doc ? toDomain(doc.id, doc.data()) : null;
  }

  async hasBuyerUse(promoId: string, buyerUid: string): Promise<boolean> {
    return (await adminDb.collection(BUYERS).doc(`${promoId}__${buyerUid}`).get()).exists;
  }

  async create(ownerId: string, input: PromoCodeInput, nowIso: string): Promise<PromoCode> {
    const ref = adminDb.collection(CODES).doc();
    const doc = {
      ...toDoc(input),
      ownerId,
      usedCount: 0,
      firstUsedAt: null,
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    await adminDb.runTransaction(async (tx) => {
      await assertCodeFree(tx, ownerId, doc.code);
      tx.set(ref, doc);
    });
    return toDomain(ref.id, doc);
  }

  async replace(id: string, input: PromoCodeInput, nowIso: string): Promise<PromoCode> {
    const ref = adminDb.collection(CODES).doc(id);
    return adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new PromotionsDomainError('NOT_FOUND', 'Cupom não encontrado.');
      const current = toDomain(snap.id, snap.data() ?? {});
      if (current.firstUsedAt) {
        throw new PromotionsDomainError(
          'PROMO_LOCKED',
          'Este cupom já foi usado: só o limite, o fim e a pausa podem mudar.'
        );
      }
      const doc = toDoc(input);
      await assertCodeFree(tx, current.ownerId, doc.code, id);
      tx.update(ref, { ...doc, updatedAt: nowIso });
      return toDomain(id, { ...snap.data(), ...doc, updatedAt: nowIso });
    });
  }

  async updateLimits(id: string, edit: PromoCodeLimitsEdit, nowIso: string): Promise<PromoCode> {
    const ref = adminDb.collection(CODES).doc(id);
    return adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new PromotionsDomainError('NOT_FOUND', 'Cupom não encontrado.');
      const current = toDomain(snap.id, snap.data() ?? {});
      if (edit.maxUses !== undefined && edit.maxUses !== null && edit.maxUses < current.usedCount) {
        throw new PromotionsDomainError(
          'INVALID_ARGUMENT',
          'O limite não pode ficar abaixo dos usos que já existem.'
        );
      }
      const patch: Record<string, unknown> = { updatedAt: nowIso };
      if (edit.maxUses !== undefined) patch.maxUses = edit.maxUses;
      if (edit.endsAt !== undefined) patch.endsAt = edit.endsAt;
      if (edit.isActive !== undefined) patch.isActive = edit.isActive;
      tx.update(ref, patch);
      return toDomain(id, { ...snap.data(), ...patch });
    });
  }

  async delete(id: string): Promise<void> {
    const ref = adminDb.collection(CODES).doc(id);
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      if (toDomain(snap.id, snap.data() ?? {}).firstUsedAt) {
        throw new PromotionsDomainError(
          'PROMO_IN_USE',
          'Cupom já usado não pode ser excluído; pause ou encerre.'
        );
      }
      tx.delete(ref);
    });
  }

  async reserveUse(promoId: string, buyerUid: string, nowIso: string): Promise<string> {
    const ref = adminDb.collection(CODES).doc(promoId);
    const buyerRef = adminDb.collection(BUYERS).doc(`${promoId}__${buyerUid}`);
    const redemptionRef = adminDb.collection(REDEMPTIONS).doc();
    await adminDb.runTransaction(async (tx) => {
      const [snap, buyerSnap] = await Promise.all([tx.get(ref), tx.get(buyerRef)]);
      if (!snap.exists) throw new PromotionsDomainError('PROMO_INVALID', 'Cupom inválido.');
      const promo = toDomain(snap.id, snap.data() ?? {});
      // Conferido de novo aqui: entre a consulta e a compra, outro comprador pode ter usado o último.
      assertPromoUsable(promo, nowIso, promo.onePerAccount && buyerSnap.exists);
      tx.update(ref, {
        usedCount: FieldValue.increment(1),
        ...(promo.firstUsedAt ? {} : { firstUsedAt: nowIso }),
        updatedAt: nowIso,
      });
      if (promo.onePerAccount) tx.set(buyerRef, { redemptionId: redemptionRef.id });
      tx.set(redemptionRef, { promoId, buyerUid, status: 'reserved', createdAt: nowIso });
    });
    return redemptionRef.id;
  }

  async releaseUse(redemptionId: string, nowIso: string): Promise<void> {
    const redemptionRef = adminDb.collection(REDEMPTIONS).doc(redemptionId);
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(redemptionRef);
      const data = snap.data();
      if (!snap.exists || !data || data.status !== 'reserved') return;
      const promoRef = adminDb.collection(CODES).doc(String(data.promoId));
      const buyerRef = adminDb.collection(BUYERS).doc(`${data.promoId}__${data.buyerUid}`);
      const [promoSnap, buyerSnap] = await Promise.all([tx.get(promoRef), tx.get(buyerRef)]);
      tx.update(redemptionRef, { status: 'released', releasedAt: nowIso });
      if (promoSnap.exists && (num(promoSnap.data()?.usedCount) ?? 0) > 0) {
        tx.update(promoRef, { usedCount: FieldValue.increment(-1), updatedAt: nowIso });
      }
      if (buyerSnap.data()?.redemptionId === redemptionId) tx.delete(buyerRef);
    });
  }
}
