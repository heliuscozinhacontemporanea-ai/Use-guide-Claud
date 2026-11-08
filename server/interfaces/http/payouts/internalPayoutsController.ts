import type { Request, Response } from 'express';
import { releaseDuePayoutsUseCase } from '../../../domain/payment';

/** Jobs internos do repasse (Cloud Scheduler, `X-Internal-Job-Key`). */
export class InternalPayoutsController {
  static async release(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({ data: await releaseDuePayoutsUseCase(200) });
    } catch (error) {
      console.error('[InternalPayoutsController.release]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      // 500 de propósito: o Scheduler registra a falha e a próxima rodada tenta de novo.
      return res
        .status(500)
        .json({ error: { code: 'PAYOUT_RELEASE_FAILED', message: 'Falha ao liberar repasses.' } });
    }
  }
}
