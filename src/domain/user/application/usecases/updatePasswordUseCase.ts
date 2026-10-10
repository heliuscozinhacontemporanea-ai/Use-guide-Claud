import { reauthenticateUseCase, changePasswordUseCase } from '../../../auth';
import { PasswordData } from '../../types/user';
import { updatePasswordSchema } from '../../schemas/userSchema';

export async function updatePasswordUseCase(
  email: string,
  passwordData: PasswordData
): Promise<void> {
  updatePasswordSchema.parse(passwordData);
  await reauthenticateUseCase(email, passwordData.current);
  await changePasswordUseCase(passwordData.new);
}
