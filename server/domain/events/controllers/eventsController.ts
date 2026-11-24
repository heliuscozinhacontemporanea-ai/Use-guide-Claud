import { Request, Response } from 'express';
import { EventDomainError } from '../errors/eventDomainError';
import { getEventListingByIdUseCase } from '../usecases/getEventListingByIdUseCase';
import { listEventOccurrencesUseCase } from '../usecases/listEventOccurrencesUseCase';

const STATUS: Record<string, number> = {
  INVALID_ARGUMENT: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
};

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleEventError(res: Response, error: unknown): Response {
  const status = error instanceof EventDomainError ? STATUS[error.code] : undefined;
  if (error instanceof EventDomainError && status) {
    return sendError(res, status, error.code, error.message);
  }
  console.error('[EventsController]', {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(res, 500, 'INTERNAL_ERROR', 'Erro interno do servidor.');
}

/** Leitura pública do evento e das sessões. Criar e editar passam pelas rotas do parceiro (F4). */
export class EventsController {
  static async getPublicListing(req: Request, res: Response) {
    try {
      const id = String(req.params.id ?? '');
      const listing = await getEventListingByIdUseCase(id);
      if (!listing || listing.status === 'archived' || listing.visibility === 'private') {
        return sendError(res, 404, 'EVENT_NOT_FOUND', 'Evento não encontrado.');
      }
      return res.status(200).json({ status: 'success', data: listing });
    } catch (error) {
      return handleEventError(res, error);
    }
  }

  static async listPublicOccurrences(req: Request, res: Response) {
    try {
      const id = String(req.params.id ?? '');
      const occurrences = await listEventOccurrencesUseCase(id, { publicOnly: true });
      return res.status(200).json({ status: 'success', data: occurrences });
    } catch (error) {
      return handleEventError(res, error);
    }
  }
}
