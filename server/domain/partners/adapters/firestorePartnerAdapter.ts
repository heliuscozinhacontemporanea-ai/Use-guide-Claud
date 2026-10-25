import type { TermsAcceptance } from '../../../shared/kernel/legalTerms';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { PartnerDomainError } from '../errors/partnerDomainError';
import {
  toPartnerProfileDTO,
  toPublicPartnerProfileDTO as toPublicPartnerProfile,
} from '../mappers/partnerMapper';
import { PartnerPort } from '../ports/partnerPort';
import type {
  PartnerBusiness,
  PartnerProfileDocument,
  PartnerRegistrationData,
  PartnerStatus,
  RegisterPartnerResult,
} from '../types/partnerTypes';

export class FirestorePartnerAdapter implements PartnerPort {
  private async mutatePartnerAtomically(
    partnerId: string,
    mutate: (current: Record<string, unknown>) => Record<string, unknown>
  ): Promise<void> {
    const partnerRef = adminDb.collection('partners').doc(partnerId);
    const publicRef = adminDb.collection('publicPartners').doc(partnerId);
    await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(partnerRef);
      if (!snapshot.exists) {
        throw new PartnerDomainError('NOT_FOUND', 'Perfil de parceiro não encontrado');
      }
      const current = snapshot.data() ?? {};
      const patch = mutate(current);
      const next = {
        ...current,
        ...patch,
      };
      transaction.set(
        partnerRef,
        {
          ...patch,
          updatedAt: FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        }
      );
      transaction.set(publicRef, toPublicPartnerProfile(partnerId, next));
    });
  }

  async getPartnerProfile(partnerId: string): Promise<PartnerProfileDocument | null> {
    const docSnap = await adminDb.collection('partners').doc(partnerId).get();
    if (!docSnap.exists) return null;
    const raw = (docSnap.data() || {}) as Record<string, unknown>;
    return toPartnerProfileDTO(partnerId, raw);
  }

  async getTermsAcceptance(partnerId: string): Promise<TermsAcceptance | null> {
    const docSnap = await adminDb.collection('partners').doc(partnerId).get();
    const raw = docSnap.data()?.termsAcceptance as Record<string, unknown> | undefined;
    if (typeof raw?.version !== 'string' || typeof raw.acceptedAt !== 'string') return null;
    return { version: raw.version, acceptedAt: raw.acceptedAt };
  }

  async recordTermsAcceptance(partnerId: string, acceptance: TermsAcceptance): Promise<void> {
    const partnerRef = adminDb.collection('partners').doc(partnerId);
    // Só no documento interno: o aceite não vai para a projeção pública (AGENTS.md §6.3).
    await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(partnerRef);
      if (!snapshot.exists) {
        throw new PartnerDomainError('NOT_FOUND', 'Perfil de parceiro não encontrado');
      }
      transaction.update(partnerRef, {
        termsAcceptance: acceptance,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
  }

  async updatePartnerStatus(partnerId: string, status: PartnerStatus): Promise<void> {
    await this.mutatePartnerAtomically(partnerId, () => ({
      status,
    }));
  }

  async getAllPartnerIds(): Promise<string[]> {
    const snapshot = await adminDb.collection('partners').get();
    return snapshot.docs.map((doc) => doc.id);
  }

  async getAllPartners(): Promise<PartnerProfileDocument[]> {
    const snapshot = await adminDb.collection('partners').get();
    return snapshot.docs.map((doc) =>
      toPartnerProfileDTO(doc.id, doc.data() as Record<string, unknown>)
    );
  }

  async deletePartnerProfile(partnerId: string): Promise<void> {
    const partnerRef = adminDb.collection('partners').doc(partnerId);
    const publicRef = adminDb.collection('publicPartners').doc(partnerId);
    await adminDb.runTransaction(async (transaction) => {
      const snap = await transaction.get(partnerRef);
      if (snap.exists) {
        transaction.delete(partnerRef);
      }
      transaction.delete(publicRef);
    });
  }

  async registerPartner(
    uid: string,
    data: PartnerRegistrationData
  ): Promise<RegisterPartnerResult> {
    const partnerRef = adminDb.collection('partners').doc(uid);
    const publicRef = adminDb.collection('publicPartners').doc(uid);
    let created = false;

    await adminDb.runTransaction(async (transaction) => {
      const partnerSnap = await transaction.get(partnerRef);
      created = !partnerSnap.exists;

      if (!created) {
        transaction.update(partnerRef, {
          termsAccepted: data.termsAccepted,
          updatedAt: FieldValue.serverTimestamp(),
        });
        return;
      }

      const nextData = {
        businesses: [],
        hasUsedTrial: false,
        status: 'active',
        termsAccepted: data.termsAccepted,
      };
      transaction.set(partnerRef, { ...nextData, createdAt: FieldValue.serverTimestamp() });
      transaction.set(publicRef, toPublicPartnerProfile(uid, nextData));
    });

    return { created };
  }

  async linkBusiness(partnerId: string, business: PartnerBusiness): Promise<void> {
    await this.mutatePartnerAtomically(partnerId, (current) => {
      const existing = Array.isArray(current.businesses)
        ? (current.businesses as PartnerBusiness[])
        : [];
      const businesses = existing
        .filter((item) => item.businessId !== business.businessId)
        .concat(business);
      return {
        businesses,
      };
    });
  }

  async updateBusiness(partnerId: string, business: PartnerBusiness): Promise<void> {
    await this.mutatePartnerAtomically(partnerId, (current) => {
      const existing = Array.isArray(current.businesses)
        ? (current.businesses as PartnerBusiness[])
        : [];
      const index = existing.findIndex((item) => item.businessId === business.businessId);
      if (index === -1) {
        throw new PartnerDomainError('NOT_FOUND', 'Negócio não encontrado no perfil do parceiro');
      }
      const businesses = [...existing];
      businesses[index] = {
        ...businesses[index],
        ...business,
      };
      return {
        businesses,
      };
    });
  }

  async unlinkBusiness(partnerId: string, businessId: string): Promise<void> {
    const partnerRef = adminDb.collection('partners').doc(partnerId);
    const publicRef = adminDb.collection('publicPartners').doc(partnerId);
    await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(partnerRef);
      if (!snapshot.exists) {
        return;
      }
      const current = snapshot.data() ?? {};
      const existing = Array.isArray(current.businesses)
        ? (current.businesses as PartnerBusiness[])
        : [];
      const businesses = existing.filter((business) => business.businessId !== businessId);
      transaction.update(partnerRef, {
        businesses,
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.set(
        publicRef,
        toPublicPartnerProfile(partnerId, {
          ...current,
          businesses,
        })
      );
    });
  }
}
