import type { Request, Response } from 'express';
import { announceTermsUpdatesApplicationUseCase } from '../../../application/usecases/legalTerms/announceTermsUpdatesApplicationUseCase';

// Chamado pelo job de hora em hora; a chave já foi conferida por verifyInternalJobKey.
export class InternalTermsController {
  static async announce(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json(await announceTermsUpdatesApplicationUseCase());
    } catch (error) {
      console.error('[legalTerms.announceJob]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      // 500 de propósito: o próximo disparo continua de onde parou.
      return res.status(500).json({
        error: { code: 'TERMS_ANNOUNCE_FAILED', message: 'Falha ao avisar sobre os termos.' },
      });
    }
  }
}
