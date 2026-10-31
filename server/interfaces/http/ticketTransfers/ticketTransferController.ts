import type { Response } from 'express';
import {
  TicketTransferError,
  transferTicketToUsernameApplicationUseCase,
} from '../../../application/usecases/ticketing/transferTicketToUsernameApplicationUseCase';
import { acceptTicketTransferLinkApplicationUseCase } from '../../../application/usecases/ticketing/acceptTicketTransferLinkApplicationUseCase';
import { createTicketTransferLinkApplicationUseCase } from '../../../application/usecases/ticketing/createTicketTransferLinkApplicationUseCase';
import { returnTicketToBuyerApplicationUseCase } from '../../../application/usecases/ticketing/returnTicketToBuyerApplicationUseCase';
import {
  TicketingDomainError,
  cancelTicketTransferLinkUseCase,
  previewTicketTransferLinkUseCase,
} from '../../../domain/ticketing';
import { UsernameError } from '../../../domain/users';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  ticketReturnSchema,
  ticketTransferSchema,
  transferLinkTokenSchema,
} from './ticketTransferSchema';

const TICKETING_STATUS: Record<TicketingDomainError['code'], number> = {
  INVALID_ARGUMENT: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  TRANSFER_ONLY_TO_BUYER: 422,
  TRANSFER_LINK_INVALID: 404,
  TRANSFER_LINK_EXPIRED: 410,
  TRANSFER_LINK_OWN: 422,
  SERVICE_UNAVAILABLE: 503,
};

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function sendTransferError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof UsernameError) {
    return sendError(
      res,
      error.code === 'USERNAME_NOT_FOUND' ? 404 : 400,
      error.code,
      error.message
    );
  }
  if (error instanceof TicketTransferError) {
    return sendError(res, 422, error.code, error.message);
  }
  if (error instanceof TicketingDomainError) {
    return sendError(res, TICKETING_STATUS[error.code], error.code, error.message);
  }
  console.error(`[ticketTransfer.${operation}]`, error instanceof Error ? error.name : 'unknown');
  return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível transferir o ingresso.');
}

export class TicketTransferController {
  static async transfer(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = ticketTransferSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    try {
      const result = await transferTicketToUsernameApplicationUseCase(
        { uid, admin: req.user?.admin === true },
        parsed.data.ticketId,
        parsed.data.username
      );
      return res.status(200).json(result);
    } catch (error) {
      return sendTransferError(res, error, 'transfer');
    }
  }

  static async returnToBuyer(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = ticketReturnSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    try {
      const result = await returnTicketToBuyerApplicationUseCase(
        { uid, admin: req.user?.admin === true },
        parsed.data.ticketId
      );
      return res.status(200).json(result);
    } catch (error) {
      return sendTransferError(res, error, 'returnToBuyer');
    }
  }

  static async createLink(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = ticketReturnSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    try {
      const link = await createTicketTransferLinkApplicationUseCase(
        { uid, admin: req.user?.admin === true },
        parsed.data.ticketId
      );
      // O código do link só sai nesta resposta; não pode ficar em cache.
      res.setHeader('Cache-Control', 'no-store');
      return res.status(201).json(link);
    } catch (error) {
      return sendTransferError(res, error, 'createLink');
    }
  }

  static async cancelLink(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = ticketReturnSchema.safeParse({ ticketId: req.params.ticketId });
    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    try {
      await cancelTicketTransferLinkUseCase({ uid, admin: false }, parsed.data.ticketId);
      return res.status(204).send();
    } catch (error) {
      return sendTransferError(res, error, 'cancelLink');
    }
  }

  static async previewLink(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = transferLinkTokenSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 404, 'TRANSFER_LINK_INVALID', 'Link inválido.');
    try {
      return res
        .status(200)
        .json(
          await previewTicketTransferLinkUseCase(String(req.params.linkId ?? ''), parsed.data.token)
        );
    } catch (error) {
      return sendTransferError(res, error, 'previewLink');
    }
  }

  static async acceptLink(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = transferLinkTokenSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 404, 'TRANSFER_LINK_INVALID', 'Link inválido.');
    try {
      const result = await acceptTicketTransferLinkApplicationUseCase(
        { uid, emailVerified: req.user?.emailVerified === true },
        String(req.params.linkId ?? ''),
        parsed.data.token
      );
      return res.status(200).json(result);
    } catch (error) {
      return sendTransferError(res, error, 'acceptLink');
    }
  }
}
