import type { Response } from 'express';
import { PartnerTermsPendingError } from '../../../application/usecases/partnerTermsGate';
import { invitePromoterApplicationUseCase } from '../../../application/usecases/promoters/invitePromoterApplicationUseCase';
import { listMyPromotionsApplicationUseCase } from '../../../application/usecases/promoters/listMyPromotionsApplicationUseCase';
import { respondPromoterInviteApplicationUseCase } from '../../../application/usecases/promoters/respondPromoterInviteApplicationUseCase';
import {
  endPromoterUseCase,
  getEventPromotersUseCase,
  PromoterError,
  TicketingDomainError,
} from '../../../domain/ticketing';
import { UsernameError } from '../../../domain/users';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  promoterIdParamsSchema,
  promoterInviteSchema,
  promoterListQuerySchema,
  promoterResponseSchema,
} from './promoterSchema';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function sendPromoterError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof PromoterError) {
    return sendError(res, error.status, error.code, error.message);
  }
  if (error instanceof PartnerTermsPendingError) {
    return sendError(res, 403, error.code, error.message);
  }
  if (error instanceof UsernameError) {
    return sendError(
      res,
      error.code === 'USERNAME_NOT_FOUND' ? 404 : 400,
      error.code,
      error.message
    );
  }
  if (error instanceof TicketingDomainError) {
    return sendError(res, error.code === 'NOT_FOUND' ? 404 : 422, error.code, error.message);
  }
  console.error(`[promoter.${operation}]`, error instanceof Error ? error.name : 'unknown');
  return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível concluir.');
}

function actorOf(req: AuthenticatedRequest) {
  return { uid: req.user?.uid ?? '', admin: req.user?.admin === true };
}

/** Divulgadores (D27): organizador (lista, convite, encerrar) e divulgador (Divulgação, resposta). */
export class PromoterController {
  static async list(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = promoterListQuerySchema.safeParse(req.query);
    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    try {
      res.setHeader('Cache-Control', 'private, no-store');
      return res.status(200).json({
        data: await getEventPromotersUseCase(actorOf(req), parsed.data.eventListingId),
      });
    } catch (error) {
      return sendPromoterError(res, error, 'list');
    }
  }

  static async invite(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = promoterInviteSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    try {
      const data = await invitePromoterApplicationUseCase(
        actorOf(req),
        parsed.data.eventListingId,
        parsed.data.username,
        parsed.data.earning
      );
      return res.status(201).json({ data });
    } catch (error) {
      return sendPromoterError(res, error, 'invite');
    }
  }

  static async end(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = promoterIdParamsSchema.safeParse(req.params);
    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    try {
      await endPromoterUseCase(actorOf(req), parsed.data.promoterId);
      return res.status(204).send();
    } catch (error) {
      return sendPromoterError(res, error, 'end');
    }
  }

  static async mine(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    try {
      res.setHeader('Cache-Control', 'private, no-store');
      return res.status(200).json({ data: await listMyPromotionsApplicationUseCase(uid) });
    } catch (error) {
      return sendPromoterError(res, error, 'mine');
    }
  }

  static async respond(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const params = promoterIdParamsSchema.safeParse(req.params);
    const body = promoterResponseSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    }
    try {
      await respondPromoterInviteApplicationUseCase(uid, params.data.promoterId, body.data.accept);
      return res.status(204).send();
    } catch (error) {
      return sendPromoterError(res, error, 'respond');
    }
  }
}
