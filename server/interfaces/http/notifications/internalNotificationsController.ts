import type { Request, Response } from 'express';
import { sendServiceRemindersApplicationUseCase } from '../../../application/usecases/notifications/sendServiceRemindersApplicationUseCase';
import {
  dispatchPushNotificationsUseCase,
  enqueueDailySalesDigestUseCase,
} from '../../../domain/notifications';

function fail(res: Response, operation: string, error: unknown): Response {
  console.error(`[InternalNotificationsController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  // 500 de propósito: o Scheduler registra a falha e a próxima rodada tenta de novo.
  return res
    .status(500)
    .json({ error: { code: 'PUSH_JOB_FAILED', message: 'Falha ao enviar notificações.' } });
}

/** Jobs das notificações (Cloud Scheduler, `X-Internal-Job-Key`): fila, lembretes e resumo das 20h. */
export class InternalNotificationsController {
  static async dispatch(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({ data: await dispatchPushNotificationsUseCase() });
    } catch (error) {
      return fail(res, 'dispatch', error);
    }
  }

  static async dailyDigest(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({ data: { queued: await enqueueDailySalesDigestUseCase() } });
    } catch (error) {
      return fail(res, 'dailyDigest', error);
    }
  }

  static async reminders(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({ data: await sendServiceRemindersApplicationUseCase() });
    } catch (error) {
      return fail(res, 'reminders', error);
    }
  }
}
