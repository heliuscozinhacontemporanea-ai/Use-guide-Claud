import type { Request, Response } from 'express';
import { expireUnpaidTicketOrdersApplicationUseCase } from '../../../application/usecases/notifications/expireUnpaidTicketOrdersApplicationUseCase';

// Chamado pelo job agendado; a chave já foi conferida pelo middleware verifyInternalJobKey.
export class InternalTicketingController {
  static async expireOrders(_req: Request, res: Response): Promise<Response> {
    try {
      const result = await expireUnpaidTicketOrdersApplicationUseCase();
      return res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      console.error('[InternalTicketingController.expireOrders]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      // 500 de propósito: o Scheduler registra a falha e a próxima rodada tenta de novo.
      return res
        .status(500)
        .json({ error: { code: 'EXPIRE_ORDERS_FAILED', message: 'Falha ao expirar pedidos.' } });
    }
  }
}
