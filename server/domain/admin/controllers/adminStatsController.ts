import { Response } from 'express';
import { getAdminStatsApplicationUseCase } from '../../../application/usecases/getAdminStatsApplicationUseCase';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';

export class AdminStatsController {
  static async getStats(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await getAdminStatsApplicationUseCase();
      res.status(200).json(stats);
    } catch (error: unknown) {
      console.error('[AdminStatsController.getStats Error]:', error);
      res.status(500).json({ error: 'Erro ao calcular estatísticas' });
    }
  }
}
