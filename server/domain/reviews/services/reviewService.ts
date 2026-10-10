import { getVerifiedAttendanceForReviewUseCase } from '../../ticketing';
import { CreateReviewDTO } from '../dtos/CreateReviewDTO';
import { ReviewNotificationPort } from '../ports/reviewNotificationPort';
import { ReviewPort } from '../ports/reviewPort';

export class ReviewService {
  constructor(
    private readonly reviewPort: ReviewPort,
    private readonly reviewNotificationPort: ReviewNotificationPort
  ) {}

  async submitReview(dto: CreateReviewDTO): Promise<string> {
    if (!dto.itemId) {
      throw new Error('ID do item avaliado é obrigatório');
    }
    if (!Number.isInteger(dto.rating) || dto.rating < 1 || dto.rating > 5) {
      throw new Error('Nota de avaliação deve ser um número inteiro entre 1 e 5');
    }
    if (!dto.comment) {
      throw new Error('Comentário é obrigatório');
    }

    if (dto.itemCollection === 'events') {
      if (!dto.occurrenceId || !dto.ticketId) {
        throw new Error(
          'Para avaliar um evento é obrigatório possuir ingresso com presença verificada (occurrenceId e ticketId).'
        );
      }
      const attendance = await getVerifiedAttendanceForReviewUseCase({
        userId: dto.userId,
        occurrenceId: dto.occurrenceId,
        ticketId: dto.ticketId,
      });
      if (attendance.eventListingId !== dto.itemId) {
        throw new Error('O ingresso informado não pertence a este evento.');
      }
    }

    const result = await this.reviewPort.submitReviewAndRecalculateRating(dto);

    if (result.target.partnerId) {
      try {
        await this.reviewNotificationPort.notifyReviewReceived({
          recipientPartnerId: result.target.partnerId,
          itemName: result.target.name,
          userName: result.author.name,
          rating: result.rating,
          itemId: result.itemId,
          itemCollection: result.itemCollection,
          isUpdate: result.isUpdate,
        });
      } catch (error) {
        console.warn('[ReviewService] Falha ao enviar notificação da avaliação:', error);
      }
    }

    return result.reviewId;
  }

  async respondToReview(
    reviewId: string,
    response: string,
    responderId: string,
    isAdmin = false
  ): Promise<void> {
    if (!reviewId) {
      throw new Error('ID da avaliação é obrigatório');
    }
    if (!response.trim()) {
      throw new Error('Conteúdo da resposta é obrigatório');
    }

    await this.reviewPort.respondToReview(reviewId, response.trim(), responderId, isAdmin);
  }

  async deleteReview(reviewId: string, requesterId: string, isAdmin = false): Promise<void> {
    if (!reviewId) {
      throw new Error('ID da avaliação é obrigatório');
    }
    await this.reviewPort.deleteReview(reviewId, requesterId, isAdmin);
  }

  async deleteReviewsByUser(userId: string): Promise<void> {
    if (!userId) return;
    await this.reviewPort.deleteReviewsByUser(userId);
  }

  async getReviewsStats(): Promise<{ totalReviews: number; avgRating: number }> {
    return this.reviewPort.getReviewsStats();
  }
}
