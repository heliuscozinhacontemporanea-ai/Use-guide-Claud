import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { PartnerDomainError } from '../errors/partnerDomainError';
import {
  toPartnerProfileDTO,
  toPublicPartnerProfileDTO as toPublicPartnerProfile,
} from '../mappers/partnerMapper';
import { PartnerPort } from '../ports/partnerPort';
import { normalizeDocument } from '../services/documentIdentity';
import type {
  PartnerBusiness,
  PartnerProfileDocument,
  PartnerRegistrationData,
  PartnerStatus,
  PartnerTrialState,
  PartnerVerificationData,
  RegisterPartnerResult,
} from '../types/partnerTypes';

function getPersistedDocumentKey(
  data: Record<string, unknown>
): string | null {
  const candidate =
    typeof data.cpfCnpjClean === 'string' &&
    data.cpfCnpjClean.trim()
      ? data.cpfCnpjClean
      : typeof data.cpfCnpj === 'string' &&
          data.cpfCnpj.trim()
        ? data.cpfCnpj
        : null;

  if (!candidate) {
    return null;
  }

  const normalized = normalizeDocument(candidate);

  return normalized || null;
}

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
        const data = (snap.data() || {}) as Record<string, unknown>;
        const cleanDoc = getPersistedDocumentKey(data);
        if (cleanDoc) {
          transaction.delete(adminDb.collection('partnerDocumentKeys').doc(cleanDoc));
        }
        transaction.delete(partnerRef);
      }
      transaction.delete(publicRef);
    });
  }

  async registerPartner(
    uid: string,
    data: PartnerRegistrationData
  ): Promise<RegisterPartnerResult> {
    const cleanDoc = normalizeDocument(data.cpfCnpj);
    if (!cleanDoc) {
      throw new PartnerDomainError('INVALID_ARGUMENT', 'CPF/CNPJ é obrigatório');
    }
    const partnerRef = adminDb.collection('partners').doc(uid);
    const publicRef = adminDb.collection('publicPartners').doc(uid);
    let created = false;

    await adminDb.runTransaction(async (transaction) => {
      const docKeyRef = adminDb.collection('partnerDocumentKeys').doc(cleanDoc);
      const docKeySnap = await transaction.get(docKeyRef);
      if (docKeySnap.exists) {
        const keyData = docKeySnap.data() as { partnerId?: string } | undefined;
        if (keyData?.partnerId && keyData.partnerId !== uid) {
          throw new PartnerDomainError('CONFLICT', 'CPF/CNPJ já cadastrado para outro parceiro.');
        }
      }

      const partnerSnap = await transaction.get(partnerRef);
      const exists = partnerSnap.exists;
      created = !exists;

      transaction.set(docKeyRef, {
        partnerId: uid,
        createdAt: FieldValue.serverTimestamp(),
      });

      if (exists) {
        const oldData = (partnerSnap.data() || {}) as Record<string, unknown>;
        const oldDoc = getPersistedDocumentKey(oldData);
        if (oldDoc && oldDoc !== cleanDoc) {
          transaction.delete(adminDb.collection('partnerDocumentKeys').doc(oldDoc));
        }

        const nextData = {
          ...oldData,
          cpfCnpjClean: cleanDoc,
          cpfCnpj: data.cpfCnpj,
          termsAccepted: data.termsAccepted,
        };

        transaction.update(partnerRef, {
          cpfCnpjClean: cleanDoc,
          cpfCnpj: data.cpfCnpj,
          termsAccepted: data.termsAccepted,
          updatedAt: FieldValue.serverTimestamp(),
        });

        transaction.set(publicRef, toPublicPartnerProfile(uid, nextData));
      } else {
        const nextData = {
          businesses: [],
          cpfCnpjClean: cleanDoc,
          cpfCnpj: data.cpfCnpj,
          hasUsedTrial: false,
          isVerified: false,
          verificationType: null,
          verifiedUntil: null,
          isVerificationSuspended: false,
          status: 'active',
          termsAccepted: data.termsAccepted,
        };

        transaction.set(partnerRef, {
          ...nextData,
          createdAt: FieldValue.serverTimestamp(),
        });

        transaction.set(publicRef, toPublicPartnerProfile(uid, nextData));
      }
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

  async updatePartnerVerificationProfile(
    partnerId: string,
    verification: PartnerVerificationData
  ): Promise<void> {
    await this.mutatePartnerAtomically(partnerId, () => ({
      ...verification,
    }));
  }

  async activateTrialAtomically(partnerId: string, verifiedUntil: string): Promise<void> {
    const ref = adminDb.collection('partners').doc(partnerId);
    const publicPartnerRef = adminDb.collection('publicPartners').doc(partnerId);
    await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) {
        throw new PartnerDomainError('NOT_FOUND', 'Perfil de parceiro não encontrado');
      }
      const data = snapshot.data() ?? {};
      if (data.status === 'suspended') {
        throw new PartnerDomainError(
          'FORBIDDEN',
          'Parceiro suspenso não pode ativar o período de testes.'
        );
      }
      if (data.hasUsedTrial === true) {
        throw new PartnerDomainError('CONFLICT', 'O período de testes já foi utilizado.');
      }
      const currentExpiry = data.verifiedUntil;
      if (data.isVerified === true && currentExpiry) {
        const expiryDate =
          typeof currentExpiry.toDate === 'function'
            ? currentExpiry.toDate()
            : new Date(currentExpiry);
        if (
          expiryDate instanceof Date &&
          !Number.isNaN(expiryDate.getTime()) &&
          expiryDate > new Date()
        ) {
          throw new PartnerDomainError('CONFLICT', 'O parceiro já possui uma verificação ativa.');
        }
      }

      const nextData = {
        ...data,
        isVerified: true,
        verifiedUntil,
        verificationType: 'trial',
        isVerificationSuspended: false,
        hasUsedTrial: true,
      };

      transaction.update(ref, {
        isVerified: true,
        verifiedUntil,
        verificationType: 'trial',
        isVerificationSuspended: false,
        hasUsedTrial: true,
        updatedAt: FieldValue.serverTimestamp(),
      });

      transaction.set(publicPartnerRef, toPublicPartnerProfile(partnerId, nextData));
    });
  }

  async restoreTrialStateAtomically(partnerId: string, state: PartnerTrialState): Promise<void> {
    const partnerRef = adminDb.collection('partners').doc(partnerId);
    const publicRef = adminDb.collection('publicPartners').doc(partnerId);

    await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(partnerRef);
      if (!snapshot.exists) {
        throw new PartnerDomainError('NOT_FOUND', 'Perfil de parceiro não encontrado');
      }

      const current = snapshot.data() ?? {};
      const next = {
        ...current,
        ...state,
      };

      transaction.update(partnerRef, {
        ...state,
        updatedAt: FieldValue.serverTimestamp(),
      });

      transaction.set(publicRef, toPublicPartnerProfile(partnerId, next));
    });
  }
}
