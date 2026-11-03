import { type Response, Router } from 'express';
import { sendAdminMessageApplicationUseCase } from '../../../application/usecases/sendAdminMessageApplicationUseCase';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAdminToken } from '../../../infrastructure/auth/authMiddleware';
import { sendAdminMessageSchema } from './adminMessageSchema';

async function send(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const body = sendAdminMessageSchema.safeParse(req.body);
  if (!body.success) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: 'Mensagem inválida.' } });
  }
  try {
    await sendAdminMessageApplicationUseCase(body.data);
    return res.status(204).send();
  } catch (error) {
    console.error('[AdminMessage.send]', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
    return res
      .status(500)
      .json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' } });
  }
}

export const adminMessageRouter = Router();
adminMessageRouter.post('/', verifyAdminToken, send);
