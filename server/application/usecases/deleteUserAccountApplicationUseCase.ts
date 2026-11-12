import { anonymizeBuyerBookingsUseCase } from '../../domain/bookings';
import { deleteEventsByOwnerUseCase } from '../../domain/events';
import { deleteResourcesByOwnerUseCase } from '../../domain/guide';
import { deleteUserNotificationsUseCase } from '../../domain/notifications';
import {
  deleteOwnerListingPlansUseCase,
  deleteOwnerListingVerificationsUseCase,
  deletePartnerProfileUseCase,
} from '../../domain/partners';
import { cancelPartnerPlanSubscriptionsUseCase } from '../../domain/payment';
import { anonymizeGateStaffUseCase } from '../../domain/gateStaff';
import { deleteReviewsByUserUseCase } from '../../domain/reviews';
import {
  anonymizeCourtesyGuestUseCase,
  anonymizePromoterUseCase,
  anonymizeTicketingUserUseCase,
} from '../../domain/ticketing';
import { deleteUserAccountUseCase, releaseUsernamesUseCase } from '../../domain/users';
import { deleteVerificationFiles } from './listingVerification/deleteVerificationFiles';

export interface UserDeletionCoordinatorDependencies {
  deleteReviewsByUser: (uid: string) => Promise<void>;
  deletePartnerProfile: (uid: string) => Promise<void>;
  deleteResourcesByOwner: (uid: string) => Promise<void>;
  deleteEventsByOwner?: (uid: string) => Promise<void>;
  /** Verificações, documentos cifrados e arquivos enviados (D12). */
  deleteListingVerifications?: (uid: string) => Promise<void>;
  /** Planos dos estabelecimentos (D11): cancela as assinaturas no Stripe e apaga os planos. */
  deleteListingPlans?: (uid: string) => Promise<void>;
  /** Reservas do comprador: tira endereço e nomes e mantém o registro financeiro (§7.5, D20). */
  anonymizeBuyerBookings?: (uid: string) => Promise<void>;
  /** Pedidos, ingressos, transferências e lista de espera: sai nome e e-mail, fica o registro (§7.5). */
  anonymizeTicketing?: (uid: string) => Promise<void>;
  /** Avisos e escolhas de notificação (D25, §7.5). */
  deleteNotifications?: (uid: string) => Promise<void>;
  /** O @ fica reservado por 14 dias e depois é liberado (D21). */
  releaseUsernames?: (uid: string) => Promise<void>;
  deleteUserAccount: (uid: string) => Promise<void>;
}

export async function deleteUserAccountApplicationUseCase(
  uid: string,
  deps: UserDeletionCoordinatorDependencies = {
    deleteReviewsByUser: (id) => deleteReviewsByUserUseCase(id),
    deletePartnerProfile: (id) => deletePartnerProfileUseCase(id),
    deleteResourcesByOwner: (id) => deleteResourcesByOwnerUseCase(id),
    deleteEventsByOwner: (id) => deleteEventsByOwnerUseCase(id),
    deleteListingVerifications: async (id) =>
      deleteVerificationFiles(await deleteOwnerListingVerificationsUseCase(id)),
    deleteListingPlans: async (id) => {
      await cancelPartnerPlanSubscriptionsUseCase(id);
      await deleteOwnerListingPlansUseCase(id);
    },
    anonymizeBuyerBookings: async (id) => {
      await anonymizeBuyerBookingsUseCase(id);
    },
    anonymizeTicketing: async (id) => {
      await anonymizeTicketingUserUseCase(id);
      // A lista de convidados do organizador guarda @ e nome públicos (D27).
      await anonymizeCourtesyGuestUseCase(id);
      await anonymizePromoterUseCase(id);
      // A equipe da portaria guarda @ e nome públicos de quem foi convidado (C1).
      await anonymizeGateStaffUseCase(id);
    },
    deleteNotifications: (id) => deleteUserNotificationsUseCase(id),
    releaseUsernames: (id) => releaseUsernamesUseCase(id),
    deleteUserAccount: (id) => deleteUserAccountUseCase(id),
  }
): Promise<void> {
  if (!uid) {
    throw new Error('UID do usuário é obrigatório para exclusão');
  }

  await deps.deleteReviewsByUser(uid);
  await deps.deleteResourcesByOwner(uid);
  if (deps.deleteEventsByOwner) {
    await deps.deleteEventsByOwner(uid);
  }
  if (deps.deleteListingVerifications) {
    await deps.deleteListingVerifications(uid);
  }
  if (deps.deleteListingPlans) {
    await deps.deleteListingPlans(uid);
  }
  if (deps.anonymizeBuyerBookings) {
    await deps.anonymizeBuyerBookings(uid);
  }
  if (deps.anonymizeTicketing) {
    await deps.anonymizeTicketing(uid);
  }
  if (deps.deleteNotifications) {
    await deps.deleteNotifications(uid);
  }
  if (deps.releaseUsernames) {
    await deps.releaseUsernames(uid);
  }
  await deps.deletePartnerProfile(uid);
  await deps.deleteUserAccount(uid);
}
