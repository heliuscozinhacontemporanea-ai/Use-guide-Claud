import type { Response } from 'express';
import { acceptCourtesyLinkApplicationUseCase } from '../../../application/usecases/courtesies/acceptCourtesyLinkApplicationUseCase';
import { cancelCourtesyApplicationUseCase } from '../../../application/usecases/courtesies/cancelCourtesyApplicationUseCase';
import { CourtesyRecipientError } from '../../../application/usecases/courtesies/courtesyRecipientError';
import { createCourtesyLinkApplicationUseCase } from '../../../application/usecases/courtesies/createCourtesyLinkApplicationUseCase';
import { inviteCourtesyByUsernameApplicationUseCase } from '../../../application/usecases/courtesies/inviteCourtesyByUsernameApplicationUseCase';
import { previewCourtesyLinkApplicationUseCase } from '../../../application/usecases/courtesies/previewCourtesyLinkApplicationUseCase';
import { PartnerTermsPendingError } from '../../../application/usecases/partnerTermsGate';
import {
  CourtesyError,
  listEventCourtesiesUseCase,
  TicketingDomainError,
} from '../../../domain/ticketing';
import { UsernameError } from '../../../domain/users';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  courtesyIdParamsSchema,
  courtesyInviteSchema,
  courtesyLinkCreateSchema,
  courtesyLinkTokenSchema,
  courtesyListQuerySchema,
} from './courtesySchema';

const TICKETING_STATUS: Partial<Record<TicketingDomainError['code'], number>> = {
  INVALID_ARGUMENT: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
};

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function sendCourtesyError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof CourtesyError) {
    return sendError(res, error.status, error.code, error.message);
  }
  if (error instanceof PartnerTermsPendingError) {
    return sendError(res, 403, error.code, error.message);
  }
  if (error instanceof CourtesyRecipientError) {
    return sendError(res, 422, error.code, error.message);
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
    const status = TICKETING_STATUS[error.code] ?? 422;
    return sendError(res, status, error.code, error.message);
  }
  console.error(`[courtesy.${operation}]`, error instanceof Error ? error.name : 'unknown');
  return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível concluir a cortesia.');
}

function actorOf(req: AuthenticatedRequest) {
  return { uid: req.user?.uid ?? '', admin: req.user?.admin === true };
}

/** Cortesias do organizador (D27): lista, convite pelo @, link pessoal e cancelamento. */
export class CourtesyController {
  static async list(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = courtesyListQuerySchema.safeParse(req.query);
    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    try {
      const data = await listEventCourtesiesUseCase(actorOf(req), parsed.data.eventListingId);
      res.setHeader('Cache-Control', 'private, no-store');
      return res.status(200).json({ data });
    } catch (error) {
      return sendCourtesyError(res, error, 'list');
    }
  }

  static async invite(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = courtesyInviteSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    try {
      const data = await inviteCourtesyByUsernameApplicationUseCase(
        actorOf(req),
        parsed.data.occurrenceId,
        parsed.data.username
      );
      return res.status(201).json({ data });
    } catch (error) {
      return sendCourtesyError(res, error, 'invite');
    }
  }

  static async createLink(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = courtesyLinkCreateSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    try {
      const data = await createCourtesyLinkApplicationUseCase(
        actorOf(req),
        parsed.data.occurrenceId
      );
      // O código só existe nesta resposta; o servidor guarda o HMAC (§7.7).
      res.setHeader('Cache-Control', 'no-store');
      return res.status(201).json({ data });
    } catch (error) {
      return sendCourtesyError(res, error, 'createLink');
    }
  }

  static async cancel(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = courtesyIdParamsSchema.safeParse(req.params);
    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    try {
      await cancelCourtesyApplicationUseCase(actorOf(req), parsed.data.courtesyId);
      return res.status(204).send();
    } catch (error) {
      return sendCourtesyError(res, error, 'cancel');
    }
  }

  static async previewLink(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const params = courtesyIdParamsSchema.safeParse(req.params);
    const body = courtesyLinkTokenSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    }
    try {
      const data = await previewCourtesyLinkApplicationUseCase(
        params.data.courtesyId,
        body.data.token
      );
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ data });
    } catch (error) {
      return sendCourtesyError(res, error, 'previewLink');
    }
  }

  static async acceptLink(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const params = courtesyIdParamsSchema.safeParse(req.params);
    const body = courtesyLinkTokenSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    }
    try {
      const data = await acceptCourtesyLinkApplicationUseCase(
        { uid, emailVerified: req.user?.emailVerified === true },
        params.data.courtesyId,
        body.data.token
      );
      return res.status(200).json({ data });
    } catch (error) {
      return sendCourtesyError(res, error, 'acceptLink');
    }
  }
}
