import { userService } from '../factory';

export async function upgradeUserToPartnerUseCase(uid: string): Promise<void> {
  if (!uid) {
    throw new Error('UID do usuário é obrigatório');
  }
  await userService.upgradeRoleToPartner(uid);
}
