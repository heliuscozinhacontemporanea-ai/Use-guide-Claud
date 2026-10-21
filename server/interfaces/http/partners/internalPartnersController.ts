import type { Request, Response } from 'express';
import { runListingPlanMaintenanceApplicationUseCase } from '../../../application/usecases/listingPlans/runListingPlanMaintenanceApplicationUseCase';

// Chamado pelo job agendado checkExpiringPlans; a chave já foi conferida por verifyInternalJobKey.
export class InternalPartnersController {
  static async checkExpiringPlans(_req: Request, res: Response): Promise<Response> {
    try {
      const result = await runListingPlanMaintenanceApplicationUseCase();
      return res.status(200).json(result);
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
