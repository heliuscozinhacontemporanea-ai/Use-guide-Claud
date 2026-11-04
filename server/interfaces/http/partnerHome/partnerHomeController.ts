import type { Response } from 'express';
import { getPartnerHomeApplicationUseCase } from '../../../application/usecases/partnerHome/getPartnerHomeApplicationUseCase';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

export class PartnerHomeController {
  static async get(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      // Só lê o que é do próprio uid: não há parâmetro de dono (AGENTS.md §7.10, A01).
      return res.status(200).json({ data: await getPartnerHomeApplicationUseCase(req.user.uid) });
    } catch (error) {
      console.error('[PartnerHomeController.get]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return sendError(
        res,
        503,
        'PARTNER_HOME_UNAVAILABLE',
        'Não foi possível carregar o início do painel agora.'
      );
    }
  }
}
