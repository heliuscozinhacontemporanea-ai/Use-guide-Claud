import type { Response } from 'express';
import { getPartnerAgendaApplicationUseCase } from '../../../application/usecases/partnerHome/getPartnerAgendaApplicationUseCase';
import { getPartnerEarningsApplicationUseCase } from '../../../application/usecases/partnerHome/getPartnerEarningsApplicationUseCase';
import { getPartnerReportsApplicationUseCase } from '../../../application/usecases/partnerHome/getPartnerReportsApplicationUseCase';
import { getPartnerEventSalesApplicationUseCase } from '../../../application/usecases/partnerHome/getPartnerEventSalesApplicationUseCase';
import { getPartnerCatalogApplicationUseCase } from '../../../application/usecases/partnerHome/getPartnerCatalogApplicationUseCase';
import { getPartnerHomeApplicationUseCase } from '../../../application/usecases/partnerHome/getPartnerHomeApplicationUseCase';
import { PartnerDomainError, savePartnerHomeCardsUseCase } from '../../../domain/partners';
import { TicketingDomainError } from '../../../domain/ticketing';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  PartnerAgendaQuerySchema,
  PartnerEventParamsSchema,
  PartnerReportsQuerySchema,
  SavePartnerHomeCardsSchema,
} from './schemas/partnerHomeSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

export class PartnerHomeController {
  static async get(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      // Só lê o que é do próprio uid: não há parâmetro de dono (AGENTS.md §7.10, A01).
      return res.status(200).json({ data: await getPartnerHomeApplicationUseCase(req.user.uid) });
    } catch (error) {
      console.error('[PartnerHomeController.get]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return sendError(
        res,
        503,
        'PARTNER_HOME_UNAVAILABLE',
        'Não foi possível carregar o início do painel agora.'
      );
    }
  }

  static async saveCards(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const body = SavePartnerHomeCardsSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Cartões inválidos.');
    try {
      const cards = await savePartnerHomeCardsUseCase(req.user.uid, body.data.cards);
      return res.status(200).json({ data: { cards } });
    } catch (error) {
      if (error instanceof PartnerDomainError) {
        const status = error.code === 'NOT_FOUND' ? 404 : 400;
        const code = error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'VALIDATION_ERROR';
        return sendError(res, status, code, error.message);
      }
      console.error('[PartnerHomeController.saveCards]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return sendError(res, 503, 'PARTNER_HOME_UNAVAILABLE', 'Não foi possível salvar agora.');
    }
  }

  static async getAgenda(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const query = PartnerAgendaQuerySchema.safeParse(req.query);
    if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Período inválido.');
    try {
      const data = await getPartnerAgendaApplicationUseCase(
        req.user.uid,
        query.data.from,
        query.data.to
      );
      return res.status(200).json({ data });
    } catch (error) {
      console.error('[PartnerHomeController.getAgenda]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return sendError(res, 503, 'PARTNER_HOME_UNAVAILABLE', 'Não foi possível carregar a agenda.');
    }
  }

  static async getCatalog(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      // Só os eventos do próprio uid (AGENTS.md §7.10, A01).
      return res
        .status(200)
        .json({ data: await getPartnerCatalogApplicationUseCase(req.user.uid) });
    } catch (error) {
      console.error('[PartnerHomeController.getCatalog]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return sendError(
        res,
        503,
        'PARTNER_HOME_UNAVAILABLE',
        'Não foi possível carregar o catálogo.'
      );
    }
  }

  static async getEventSales(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = PartnerEventParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Evento inválido.');
    try {
      const data = await getPartnerEventSalesApplicationUseCase(req.user.uid, params.data.eventId);
      return res.status(200).json({ data });
    } catch (error) {
      // Evento de outro dono responde igual a inexistente, para não confirmar que ele existe (A01).
      if (
        (error instanceof TicketingDomainError &&
          (error.code === 'FORBIDDEN' || error.code === 'NOT_FOUND')) ||
        (error instanceof Error && error.message === 'EVENT_NOT_FOUND')
      ) {
        return sendError(res, 404, 'EVENT_NOT_FOUND', 'Evento não encontrado.');
      }
      console.error('[PartnerHomeController.getEventSales]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return sendError(
        res,
        503,
        'PARTNER_HOME_UNAVAILABLE',
        'Não foi possível carregar as vendas.'
      );
    }
  }

  static async getEarnings(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      // Só os CNPJs do próprio uid (AGENTS.md §7.10, A01).
      return res
        .status(200)
        .json({ data: await getPartnerEarningsApplicationUseCase(req.user.uid) });
    } catch (error) {
      console.error('[PartnerHomeController.getEarnings]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return sendError(
        res,
        503,
        'PARTNER_HOME_UNAVAILABLE',
        'Não foi possível carregar os ganhos.'
      );
    }
  }

  static async getReports(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const query = PartnerReportsQuerySchema.safeParse(req.query);
    if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Período inválido.');
    try {
      const data = await getPartnerReportsApplicationUseCase(req.user.uid, query.data.period);
      return res.status(200).json({ data });
    } catch (error) {
      console.error('[PartnerHomeController.getReports]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return sendError(
        res,
        503,
        'PARTNER_HOME_UNAVAILABLE',
        'Não foi possível carregar os relatórios.'
      );
    }
  }
}
