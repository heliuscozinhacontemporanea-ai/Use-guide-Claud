import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { createTicketTypeSchema, updateTicketTypeSchema } from '../schemas/ticketingSchema';
import { archiveTicketTypeUseCase } from '../usecases/archiveTicketTypeUseCase';
import { createTicketTypeUseCase } from '../usecases/createTicketTypeUseCase';
import { listPublicTicketTypesByOccurrenceUseCase } from '../usecases/listPublicTicketTypesByOccurrenceUseCase';
import { listTicketTypesForManagementUseCase } from '../usecases/listTicketTypesForManagementUseCase';
import { updateTicketTypeUseCase } from '../usecases/updateTicketTypeUseCase';
import { getActor, handleTicketingError, sendError } from './ticketingHttp';

/** Tipos de ingresso: a lista pública da sessão e a gestão do dono do evento. */
export class TicketTypeController {
  static async listPublicTicketTypes(req: Request, res: Response) {
    try {
      const occurrenceId = String(req.params.occurrenceId || req.query.occurrenceId || '');
      if (!occurrenceId) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'occurrenceId é obrigatório.');
      }
      const list = await listPublicTicketTypesByOccurrenceUseCase(occurrenceId);
      return res.status(200).json({ status: 'success', data: list });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async listManagementTicketTypes(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const occurrenceId = String(req.params.occurrenceId || req.query.occurrenceId || '');
      const list = await listTicketTypesForManagementUseCase(getActor(req), occurrenceId);
      return res.status(200).json({ status: 'success', data: list });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async createTicketType(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const parsed = createTicketTypeSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
      }
      const created = await createTicketTypeUseCase(getActor(req), parsed.data);
      return res.status(201).json({ status: 'success', id: created.id, data: created });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async updateTicketType(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const parsed = updateTicketTypeSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
      }
      const ticketTypeId = String(req.params.ticketTypeId || req.params.id || '');
      const updated = await updateTicketTypeUseCase(getActor(req), ticketTypeId, parsed.data);
      return res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async archiveOrDeleteTicketType(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const ticketTypeId = String(req.params.ticketTypeId || req.params.id || '');
      const result = await archiveTicketTypeUseCase(getActor(req), ticketTypeId);
      return res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }
}
