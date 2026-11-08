import { sendAdminMessageUseCase } from '../../domain/notifications';
import { getAllPartnerIdsUseCase } from '../../domain/partners';

/** "Todos os parceiros" depende de `partners`; `notifications` continua folha (§5.4). */
export async function sendAdminMessageApplicationUseCase(input: {
  recipientIds: string[] | 'all';
  title: string;
  message: string;
}): Promise<void> {
  const recipients =
    input.recipientIds === 'all' ? await getAllPartnerIdsUseCase() : input.recipientIds;
  await sendAdminMessageUseCase(recipients, input.title, input.message);
}
