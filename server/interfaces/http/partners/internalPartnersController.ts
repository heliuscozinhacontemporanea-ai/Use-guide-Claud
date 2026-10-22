import type { Request, Response } from 'express';
import { refreshFeaturedListingsApplicationUseCase } from '../../../application/usecases/featured/refreshFeaturedListingsApplicationUseCase';
import { runListingPlanMaintenanceApplicationUseCase } from '../../../application/usecases/listingPlans/runListingPlanMaintenanceApplicationUseCase';

// Chamado pelo job diário checkExpiringPlans; a chave já foi conferida por verifyInternalJobKey.
// O rodízio do destaque roda depois da manutenção para já não contar os planos que venceram.
export class InternalPartnersController {
  static async checkExpiringPlans(_req: Request, res: Response): Promise<Response> {
    try {
      const maintenance = await runListingPlanMaintenanceApplicationUseCase();
      const featured = await refreshFeaturedListingsApplicationUseCase();
      return res.status(200).json({ ...maintenance, featured });
    } catch (error) {
      console.error('[partners.checkExpiringPlansJob]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno ao verificar planos expirando.',
        },
      });
    }
  }
}
