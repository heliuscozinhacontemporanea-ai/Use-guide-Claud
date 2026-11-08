import {
  deletePartnerProfileUseCase,
  PartnerDomainError,
  registerPartnerUseCase,
} from '../../domain/partners';
import { upgradeUserToPartnerUseCase } from '../../domain/users';
import type { PartnerRegistrationData } from '../../domain/partners';

export async function registerPartnerApplicationUseCase(
  actor: { uid: string; emailVerified: boolean },
  data: PartnerRegistrationData
): Promise<void> {
  // E-mail confirmado antes de virar parceiro (AGENTS.md §7.10, A07).
  if (!actor.emailVerified) {
    throw new PartnerDomainError(
      'EMAIL_NOT_VERIFIED',
      'Confirme seu e-mail antes de cadastrar seu negócio.'
    );
  }
  const { uid } = actor;
  const registration = await registerPartnerUseCase(uid, data);
  try {
    await upgradeUserToPartnerUseCase(uid);
  } catch (error) {
    if (registration.created) {
      try {
        await deletePartnerProfileUseCase(uid);
      } catch (rollbackError) {
        console.error(
          '[registerPartnerApplicationUseCase] Falha no rollback do Partner após erro no upgrade do usuário:',
          rollbackError
        );
      }
    }
    throw error;
  }
}
