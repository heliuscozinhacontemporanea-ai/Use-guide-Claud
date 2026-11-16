import { archiveOffersByOwnerUseCase } from '../../../domain/bookings';
import { deleteResourcesByOwnerUseCase } from '../../../domain/guide';
import {
  deleteOwnerListingPlansUseCase,
  deleteOwnerListingVerificationsUseCase,
  deletePartnerProfileUseCase,
} from '../../../domain/partners';
import { cancelPartnerPlanSubscriptionsUseCase } from '../../../domain/payment';
import { deleteVerificationFiles } from '../listingVerification/deleteVerificationFiles';
import { AccountClosureBlockedError } from './accountClosureBlockedError';
import { closeOwnerEventsApplicationUseCase } from './closeOwnerEventsApplicationUseCase';
import { listAccountClosureBlockersApplicationUseCase } from './listAccountClosureBlockersApplicationUseCase';

export interface PartnerClosureDependencies {
  listBlockers: (uid: string) => Promise<string[]>;
  archiveOffers: (uid: string) => Promise<void>;
  deleteListings: (uid: string) => Promise<void>;
  closeEvents: (uid: string) => Promise<void>;
  /** Verificações, documentos cifrados e arquivos enviados (D12, §7.5). */
  deleteVerifications: (uid: string) => Promise<void>;
  /** Planos (D11): cancela as assinaturas no Stripe e apaga os planos. */
  deletePlans: (uid: string) => Promise<void>;
  deletePartnerProfile: (uid: string) => Promise<void>;
}

const defaults: PartnerClosureDependencies = {
  listBlockers: (uid) => listAccountClosureBlockersApplicationUseCase(uid),
  archiveOffers: (uid) => archiveOffersByOwnerUseCase(uid),
  deleteListings: (uid) => deleteResourcesByOwnerUseCase(uid),
  closeEvents: (uid) => closeOwnerEventsApplicationUseCase(uid),
  deleteVerifications: async (uid) =>
    deleteVerificationFiles(await deleteOwnerListingVerificationsUseCase(uid)),
  deletePlans: async (uid) => {
    await cancelPartnerPlanSubscriptionsUseCase(uid);
    await deleteOwnerListingPlansUseCase(uid);
  },
  deletePartnerProfile: (uid) => deletePartnerProfileUseCase(uid),
};

/** Recusa encerrar quando há vendas em andamento (travas aprovadas em 2026-11-16, 1a e 2a). */
export async function assertAccountCanCloseApplicationUseCase(
  uid: string,
  listBlockers: PartnerClosureDependencies['listBlockers'] = defaults.listBlockers
): Promise<void> {
  const blockers = await listBlockers(uid);
  if (blockers.length > 0) {
    throw new AccountClosureBlockedError(blockers as AccountClosureBlockedError['blockers']);
  }
}

/**
 * Encerra o perfil de parceiro: confere as travas e tira do app o que ele publicou (ofertas
 * arquivadas, anúncios apagados, eventos com vendas arquivados), sem apagar a conta do usuário.
 */
export async function closePartnerApplicationUseCase(
  uid: string,
  deps: PartnerClosureDependencies = defaults
): Promise<void> {
  if (!uid) throw new Error('UID do parceiro é obrigatório');
  await assertAccountCanCloseApplicationUseCase(uid, deps.listBlockers);
  await deps.archiveOffers(uid);
  await deps.deleteListings(uid);
  await deps.closeEvents(uid);
  await deps.deleteVerifications(uid);
  await deps.deletePlans(uid);
  await deps.deletePartnerProfile(uid);
}
