import { Response } from 'express';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { getEventSalesAnalyticsUseCase } from '../usecases/getEventSalesAnalyticsUseCase';
import { listEventCheckInsForPartnerOrAdminUseCase } from '../usecases/listEventCheckInsForPartnerOrAdminUseCase';
import { listEventOrdersForPartnerOrAdminUseCase } from '../usecases/listEventOrdersForPartnerOrAdminUseCase';
import { listEventRefundsForPartnerOrAdminUseCase } from '../usecases/listEventRefundsForPartnerOrAdminUseCase';
import { getActor, handleTicketingError, sendError } from './ticketingHttp';
import type { TicketOrder } from '../types/ticketingTypes';

/** Pedido para o dono do evento: dados da venda, sem os dados pessoais do comprador. */
function toPartnerOrderDto(order: TicketOrder) {
  return {
    id: order.id,
    eventListingId: order.eventListingId,
    occurrenceId: order.occurrenceId,
    status: order.status,
    currency: order.currency,
    subtotalMinor: order.subtotalMinor,
    discountMinor: order.discountMinor,
    platformFeeMinor: order.platformFeeMinor,
    paymentFeeMinor: order.paymentFeeMinor,
    serviceFeeMinor: order.serviceFeeMinor,
    totalMinor: order.totalMinor,
    paymentMethod: order.paymentMethod,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

/** Relatórios de venda do evento para o admin: pedidos, reembolsos, check-ins e números. */
export class EventTicketingReportController {
  static async getEventSalesAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const eventListingId = String(req.params.id || '');
      const occurrenceId =
        typeof req.query.occurrenceId === 'string' ? req.query.occurrenceId : undefined;
      const analytics = await getEventSalesAnalyticsUseCase(
        getActor(req),
        eventListingId,
        occurrenceId
      );
      return res.status(200).json({ status: 'success', data: analytics });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async listEventOrders(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const eventListingId = String(req.params.id || '');
      const actor = getActor(req);
      const orders = await listEventOrdersForPartnerOrAdminUseCase(actor, eventListingId);
      // Parceiro não recebe e-mail nem documento do comprador (AGENTS.md §7.9 regra 4, D27).
      return res
        .status(200)
        .json({ status: 'success', data: actor.admin ? orders : orders.map(toPartnerOrderDto) });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async listEventCheckIns(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const eventListingId = String(req.params.id || '');
      const checkIns = await listEventCheckInsForPartnerOrAdminUseCase(
        getActor(req),
        eventListingId
      );
      return res.status(200).json({ status: 'success', data: checkIns });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async listEventRefunds(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const eventListingId = String(req.params.id || '');
      const refunds = await listEventRefundsForPartnerOrAdminUseCase(getActor(req), eventListingId);
      return res.status(200).json({ status: 'success', data: refunds });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }
}
