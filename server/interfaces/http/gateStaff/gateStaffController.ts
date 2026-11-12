import type { Response } from 'express';
import { inviteGateStaffApplicationUseCase } from '../../../application/usecases/gateStaff/inviteGateStaffApplicationUseCase';
import { listMyGatesApplicationUseCase } from '../../../application/usecases/gateStaff/listMyGatesApplicationUseCase';
import { listOwnerGateStaffApplicationUseCase } from '../../../application/usecases/gateStaff/listOwnerGateStaffApplicationUseCase';
import {
  GateStaffError,
  leaveGateStaffUseCase,
  removeGateStaffUseCase,
  respondGateStaffInviteUseCase,
} from '../../../domain/gateStaff';
import { getGateCountsUseCase, TicketingDomainError } from '../../../domain/ticketing';
import { UsernameError } from '../../../domain/users';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  gateOccurrenceParamsSchema,
  gateStaffIdParamsSchema,
  gateStaffInviteSchema,
  gateStaffResponseSchema,
} from './gateStaffSchema';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function sendGateError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof GateStaffError) {
    return sendError(res, error.status, error.code, error.message);
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
    // Sessão de outro evento responde igual a inexistente, para não confirmar que existe (A01).
    const hidden = error.code === 'NOT_FOUND' || error.code === 'FORBIDDEN';
    return hidden
      ? sendError(res, 404, 'NOT_FOUND', 'Sessão não encontrada.')
      : sendError(res, 422, error.code, error.message);
  }
  console.error(`[gateStaff.${operation}]`, error instanceof Error ? error.name : 'unknown');
  return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível concluir.');
}

type Handler<T> = (uid: string, req: AuthenticatedRequest) => Promise<T> | T;

/** Login, cabeçalho sem cache e o formato único de erro (§10.2) para todas as rotas da equipe. */
function handle<T>(operation: string, status: number, run: Handler<T>) {
  return async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    const uid = req.user?.uid;
    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    try {
      const data = await run(uid, req);
      res.setHeader('Cache-Control', 'private, no-store');
      return res.status(status).json({ data });
    } catch (error) {
      if (error instanceof ValidationFailed) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
      }
      return sendGateError(res, error, operation);
    }
  };
}

class ValidationFailed extends Error {}

function parse<T>(
  schema: { safeParse: (value: unknown) => { success: boolean; data?: T } },
  value: unknown
): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success || parsed.data === undefined) throw new ValidationFailed();
  return parsed.data;
}

/** Equipe da portaria (C1): o dono convida, vê e remove; a pessoa responde, vê as portarias e sai. */
export const GateStaffController = {
  listForOwner: handle('listForOwner', 200, (uid) => listOwnerGateStaffApplicationUseCase(uid)),

  invite: handle('invite', 201, (uid, req) => {
    const body = parse(gateStaffInviteSchema, req.body);
    return inviteGateStaffApplicationUseCase(uid, body.eventListingId, body.username);
  }),

  remove: handle('remove', 200, async (uid, req) => {
    const { memberId } = parse(gateStaffIdParamsSchema, req.params);
    await removeGateStaffUseCase(uid, memberId);
    return { id: memberId };
  }),

  mine: handle('mine', 200, (uid) => listMyGatesApplicationUseCase(uid)),

  respond: handle('respond', 200, async (uid, req) => {
    const { memberId } = parse(gateStaffIdParamsSchema, req.params);
    const { accept } = parse(gateStaffResponseSchema, req.body);
    const member = await respondGateStaffInviteUseCase(uid, memberId, accept);
    return { id: member.id, status: member.status };
  }),

  leave: handle('leave', 200, async (uid, req) => {
    const { memberId } = parse(gateStaffIdParamsSchema, req.params);
    await leaveGateStaffUseCase(uid, memberId);
    return { id: memberId };
  }),

  counts: handle('counts', 200, (uid, req) => {
    const { occurrenceId } = parse(gateOccurrenceParamsSchema, req.params);
    return getGateCountsUseCase({ uid, admin: req.user?.admin === true }, occurrenceId);
  }),
};
