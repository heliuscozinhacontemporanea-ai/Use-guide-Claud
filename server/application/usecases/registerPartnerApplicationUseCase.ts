import { deletePartnerProfileUseCase, registerPartnerUseCase } from '../../domain/partners';
import { upgradeUserToPartnerUseCase } from '../../domain/users';
import type { PartnerRegistrationData } from '../../domain/partners';

export async function registerPartnerApplicationUseCase(
  uid: string,
  data: PartnerRegistrationData
): Promise<void> {
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
