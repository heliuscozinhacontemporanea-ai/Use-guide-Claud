import { deleteResourcesByOwnerUseCase } from '../../domain/guide';
import { deleteEventsByOwnerUseCase } from '../../domain/events';
import {
  deleteOwnerListingPlansUseCase,
  deleteOwnerListingVerificationsUseCase,
  deletePartnerProfileUseCase,
} from '../../domain/partners';
import { deleteReviewsByUserUseCase } from '../../domain/reviews';
import { deleteUserAccountUseCase } from '../../domain/users';
import { deleteVerificationFiles } from './listingVerification/deleteVerificationFiles';

export interface UserDeletionCoordinatorDependencies {
  deleteReviewsByUser: (uid: string) => Promise<void>;
  deletePartnerProfile: (uid: string) => Promise<void>;
  deleteResourcesByOwner: (uid: string) => Promise<void>;
  deleteEventsByOwner?: (uid: string) => Promise<void>;
  /** Verificações, documentos cifrados e arquivos enviados (D12). */
  deleteListingVerifications?: (uid: string) => Promise<void>;
  /** Planos dos estabelecimentos (D11). */
  deleteListingPlans?: (uid: string) => Promise<void>;
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
    deleteListingPlans: (id) => deleteOwnerListingPlansUseCase(id),
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
  await deps.deletePartnerProfile(uid);
  await deps.deleteUserAccount(uid);
}
