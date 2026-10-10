import { createNotificationUseCase } from '../../notifications';
import { ReviewNotificationPort, ReviewNotificationContext } from '../ports/reviewNotificationPort';

export class ReviewNotificationAdapter implements ReviewNotificationPort {
  async notifyReviewReceived(context: ReviewNotificationContext): Promise<void> {
    const title = context.isUpdate ? 'Avaliação Atualizada' : 'Nova Avaliação Recebida';

    const action = context.isUpdate ? 'atualizou sua avaliação de' : 'avaliou';

    const message = `${context.userName} ${action} ${context.itemName} com nota ${context.rating}.`;

    await createNotificationUseCase({
      recipientPartnerId: context.recipientPartnerId,
      type: 'review',
      title,
      message,
      relatedItemId: context.itemId,
      itemCollection: context.itemCollection,
    });
  }
}
