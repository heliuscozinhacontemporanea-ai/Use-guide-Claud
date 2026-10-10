import { Response } from 'express';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import { CreateReviewDTO } from '../dtos/CreateReviewDTO';
import { submitReviewSchema, respondReviewSchema } from '../schemas/reviewSchema';
import { reviewService } from '../factory';

export class ReviewController {
  static async submitReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const parseResult = submitReviewSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Erro de validação no payload da avaliação',
          details: parseResult.error.issues,
        });
        return;
      }

      const dto = CreateReviewDTO.fromRaw({
        itemId: parseResult.data.itemId,
        itemCollection: parseResult.data.itemCollection,
        userId: req.user.uid,
        rating: parseResult.data.rating,
        comment: parseResult.data.comment,
        occurrenceId: parseResult.data.occurrenceId,
        ticketId: parseResult.data.ticketId,
      });

      const reviewId = await reviewService.submitReview(dto);

      res.status(201).json({
        status: 'success',
        id: reviewId,
      });
    } catch (error: any) {
      console.error('[ReviewController.submitReview Error]:', error);

      if (
        typeof error.message === 'string' &&
        error.message.includes('Parceiros não podem avaliar')
      ) {
        res.status(403).json({ error: error.message });
        return;
      }

      if (typeof error.message === 'string' && error.message.includes('não encontrado')) {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({
        error: error.message || 'Erro interno ao salvar avaliação.',
      });
    }
  }

  static async respondToReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const rawReviewId = req.params.id;
      const reviewId = Array.isArray(rawReviewId) ? rawReviewId[0] : rawReviewId;

      if (!reviewId || !reviewId.trim()) {
        res.status(400).json({ error: 'ID da avaliação é obrigatório' });
        return;
      }

      const parseResult = respondReviewSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Erro de validação no payload de resposta',
          details: parseResult.error.issues,
        });
        return;
      }

      await reviewService.respondToReview(
        reviewId,
        parseResult.data.response,
        req.user.uid,
        req.user.admin
      );

      res.status(200).json({
        status: 'success',
        message: 'Resposta registrada com sucesso',
      });
    } catch (error: any) {
      console.error('[ReviewController.respondToReview Error]:', error);

      if (typeof error.message === 'string' && error.message.includes('Não autorizado')) {
        res.status(403).json({ error: error.message });
        return;
      }

      if (typeof error.message === 'string' && error.message.includes('não encontrada')) {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({
        error: error.message || 'Erro interno ao responder avaliação.',
      });
    }
  }

  static async deleteReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const rawReviewId = req.params.id;
      const reviewId = Array.isArray(rawReviewId) ? rawReviewId[0] : rawReviewId;

      if (!reviewId || !reviewId.trim()) {
        res.status(400).json({ error: 'ID da avaliação é obrigatório' });
        return;
      }

      await reviewService.deleteReview(reviewId.trim(), req.user.uid, req.user.admin);

      res.status(200).json({
        status: 'success',
        message: 'Avaliação excluída com sucesso',
      });
    } catch (error: any) {
      console.error('[ReviewController.deleteReview Error]:', error);

      if (typeof error.message === 'string' && error.message.includes('Não autorizado')) {
        res.status(403).json({ error: error.message });
        return;
      }

      if (typeof error.message === 'string' && error.message.includes('não encontrada')) {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({
        error: error.message || 'Erro interno ao excluir avaliação.',
      });
    }
  }
}
