import type { Response } from 'express';
import { AccountClosureBlockedError } from '../../../application/usecases/accountClosure/accountClosureBlockedError';
import { closePartnerApplicationUseCase } from '../../../application/usecases/accountClosure/closePartnerApplicationUseCase';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { PartnerClosureParamsSchema } from './schemas/partnerClosureSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

/** Encerrar o perfil de parceiro: o próprio parceiro ou o admin, com as travas de venda (2026-11-16). */
export class PartnerClosureController {
  static async close(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = PartnerClosureParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Parceiro inválido.');
    const partnerId = params.data.partnerId ?? uid;
    if (!req.user?.admin && partnerId !== uid) {
      return sendError(res, 403, 'FORBIDDEN', 'Sem permissão para encerrar este parceiro.');
    }
    try {
      await closePartnerApplicationUseCase(partnerId);
      return res.status(204).end();
    } catch (error) {
      if (error instanceof AccountClosureBlockedError) {
        return res.status(409).json({
          error: { code: error.code, message: error.message, blockers: error.blockers },
        });
      }
      console.error('[PartnerClosureController.close]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível encerrar o parceiro agora.');
    }
  }
}
