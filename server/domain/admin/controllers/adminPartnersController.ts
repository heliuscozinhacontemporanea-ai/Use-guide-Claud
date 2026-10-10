import type { Response } from 'express';
import { getAdminPartnersUseCase } from '../../../application/usecases/getAdminPartnersUseCase';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';

export class AdminPartnersController {
  static async getPartners(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const partners = await getAdminPartnersUseCase();
      res.status(200).json(partners);
    } catch (error: unknown) {
      console.error('[AdminPartnersController.getPartners Error]:', error);
      res.status(500).json({
        error: 'Erro ao buscar parceiros',
      });
    }
  }
}
