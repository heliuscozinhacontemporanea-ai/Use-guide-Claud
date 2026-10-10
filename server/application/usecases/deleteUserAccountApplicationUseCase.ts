import { deleteResourcesByOwnerUseCase } from '../../domain/guide';
import { deleteEventsByOwnerUseCase } from '../../domain/events';
import { deletePartnerProfileUseCase } from '../../domain/partners';
import { deleteReviewsByUserUseCase } from '../../domain/reviews';
import { deleteUserAccountUseCase } from '../../domain/users';

export interface UserDeletionCoordinatorDependencies {
  deleteReviewsByUser: (uid: string) => Promise<void>;
  deletePartnerProfile: (uid: string) => Promise<void>;
  deleteResourcesByOwner: (uid: string) => Promise<void>;
  deleteEventsByOwner?: (uid: string) => Promise<void>;
  deleteUserAccount: (uid: string) => Promise<void>;
}

export async function deleteUserAccountApplicationUseCase(
  uid: string,
  deps: UserDeletionCoordinatorDependencies = {
    deleteReviewsByUser: (id) => deleteReviewsByUserUseCase(id),
    deletePartnerProfile: (id) => deletePartnerProfileUseCase(id),
    deleteResourcesByOwner: (id) => deleteResourcesByOwnerUseCase(id),
    deleteEventsByOwner: (id) => deleteEventsByOwnerUseCase(id),
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
  await deps.deletePartnerProfile(uid);
  await deps.deleteUserAccount(uid);
}
