import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { NotificationDomainError } from '../errors/notificationErrors';
import {
  notificationIdParamsSchema,
  notificationPreferencesPatchSchema,
  pushDeviceSchema,
} from '../schemas/notificationSchema';
import { getNotificationPreferencesUseCase } from '../usecases/getNotificationPreferencesUseCase';
import { markAllNotificationsAsReadUseCase } from '../usecases/markAllNotificationsAsReadUseCase';
import { markNotificationAsReadUseCase } from '../usecases/markNotificationAsReadUseCase';
import { registerPushDeviceUseCase } from '../usecases/registerPushDeviceUseCase';
import { unregisterPushDeviceUseCase } from '../usecases/unregisterPushDeviceUseCase';
import { updateNotificationPreferencesUseCase } from '../usecases/updateNotificationPreferencesUseCase';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof NotificationDomainError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[NotificationController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(res, 500, 'INTERNAL_ERROR', 'Erro interno do servidor.');
}

export class NotificationController {
  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = notificationIdParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Aviso inválido.');
    try {
      await markNotificationAsReadUseCase(params.data.id, req.user.uid);
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error, 'markAsRead');
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      await markAllNotificationsAsReadUseCase(req.user.uid);
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error, 'markAllAsRead');
    }
  }

  static async getPreferences(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      return res.status(200).json({ data: await getNotificationPreferencesUseCase(req.user.uid) });
    } catch (error) {
      return handleError(res, error, 'getPreferences');
    }
  }

  static async updatePreferences(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const body = notificationPreferencesPatchSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Escolha inválida.');
    try {
      const data = await updateNotificationPreferencesUseCase(req.user.uid, body.data);
      return res.status(200).json({ data });
    } catch (error) {
      return handleError(res, error, 'updatePreferences');
    }
  }

  static async registerDevice(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const body = pushDeviceSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Aparelho inválido.');
    try {
      await registerPushDeviceUseCase(req.user.uid, body.data.token, body.data.locale ?? '');
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error, 'registerDevice');
    }
  }

  static async unregisterDevice(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const body = pushDeviceSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Aparelho inválido.');
    try {
      await unregisterPushDeviceUseCase(req.user.uid, body.data.token);
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error, 'unregisterDevice');
    }
  }
}
