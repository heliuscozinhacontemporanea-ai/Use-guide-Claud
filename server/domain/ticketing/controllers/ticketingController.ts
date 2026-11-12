import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { confirmTicketOrderPaymentClientReturnApplicationUseCase } from '../../../application/usecases/confirmTicketOrderPaymentClientReturnApplicationUseCase';
import { createTicketOrderPaymentIntentApplicationUseCase } from '../../../application/usecases/createTicketOrderPaymentIntentApplicationUseCase';
import { processTicketRefundApplicationUseCase } from '../../../application/usecases/processTicketRefundApplicationUseCase';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import {
  checkInTicketSchema,
  createOfflineCheckInSessionSchema,
  createTicketOrderSchema,
  createTicketTypeSchema,
  joinWaitlistSchema,
  payTicketOrderSchema,
  requestTicketRefundSchema,
  syncOfflineCheckInsSchema,
  updateTicketTypeSchema,
} from '../schemas/ticketingSchema';
import { PromotionsDomainError } from '../../promotions';
import type { TicketOrder } from '../types/ticketingTypes';
import { archiveTicketTypeUseCase } from '../usecases/archiveTicketTypeUseCase';
import { checkInTicketUseCase } from '../usecases/checkInTicketUseCase';
import { createOfflineCheckInSessionUseCase } from '../usecases/createOfflineCheckInSessionUseCase';
import { createTicketOrderUseCase } from '../usecases/createTicketOrderUseCase';
import { createTicketTypeUseCase } from '../usecases/createTicketTypeUseCase';
import { expireTicketOrderUseCase } from '../usecases/expireTicketOrderUseCase';
import { getEventSalesAnalyticsUseCase } from '../usecases/getEventSalesAnalyticsUseCase';
import { getTicketOrderUseCase } from '../usecases/getTicketOrderUseCase';
import { getTicketQrTokenUseCase } from '../usecases/getTicketQrTokenUseCase';
import { joinEventWaitlistUseCase } from '../usecases/joinEventWaitlistUseCase';
import { listEventCheckInsForPartnerOrAdminUseCase } from '../usecases/listEventCheckInsForPartnerOrAdminUseCase';
import { listEventOrdersForPartnerOrAdminUseCase } from '../usecases/listEventOrdersForPartnerOrAdminUseCase';
import { listEventRefundsForPartnerOrAdminUseCase } from '../usecases/listEventRefundsForPartnerOrAdminUseCase';
import { listOfflineCheckInChangesUseCase } from '../usecases/listOfflineCheckInChangesUseCase';
import { listPublicTicketTypesByOccurrenceUseCase } from '../usecases/listPublicTicketTypesByOccurrenceUseCase';
import { listTicketTypesForManagementUseCase } from '../usecases/listTicketTypesForManagementUseCase';
import { listUserTicketOrdersUseCase } from '../usecases/listUserTicketOrdersUseCase';
import { listUserTicketsUseCase } from '../usecases/listUserTicketsUseCase';
import { swapTicketQrUseCase } from '../usecases/swapTicketQrUseCase';
import { syncOfflineCheckInsUseCase } from '../usecases/syncOfflineCheckInsUseCase';
import { updateTicketTypeUseCase } from '../usecases/updateTicketTypeUseCase';
import { hashTicketIdForOfflineManifest } from '../utils/offlineManifest';

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

function getActor(req: AuthenticatedRequest) {
  return {
    uid: req.user?.uid || '',
    admin: req.user?.admin === true,
    role: req.user?.admin === true ? 'admin' : 'user',
    emailVerified: req.user?.emailVerified === true,
  };
}

const STATUS_BY_CODE: Record<string, number> = {
  INVALID_ARGUMENT: 400,
  FORBIDDEN: 403,
  EMAIL_NOT_VERIFIED: 403,
  NOT_FOUND: 404,
  TRANSFER_LINK_INVALID: 404,
  CONFLICT: 409,
  TRANSFER_LINK_EXPIRED: 410,
  UNPROCESSABLE_ENTITY: 422,
  TRANSFER_ONLY_TO_BUYER: 422,
  TRANSFER_LINK_OWN: 422,
  COURTESY_NOT_TRANSFERABLE: 422,
  TOO_MANY_REQUESTS: 429,
  SERVICE_UNAVAILABLE: 503,
};

/** Formato único de erro (§10.2): `code` estável e mensagem segura para a pessoa. */
function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleTicketingError(res: Response, error: unknown): Response {
  // Cupom recusado na compra: a tela traduz pelo código (inválido, encerrado, esgotado, já usado).
  if (error instanceof PromotionsDomainError) {
    return sendError(res, 422, error.code, error.message);
  }
  if (error instanceof TicketingDomainError) {
    const status = STATUS_BY_CODE[error.code];
    if (status) return sendError(res, status, error.code, error.message);
  }
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: unknown }).code);
    const status = ['FORBIDDEN', 'NOT_FOUND', 'CONFLICT', 'UNPROCESSABLE_ENTITY'].includes(code)
      ? STATUS_BY_CODE[code]
      : undefined;
    if (status) {
      return sendError(
        res,
        status,
        code,
        error instanceof Error ? error.message : 'Erro na operação.'
      );
    }
  }
  console.error('[TicketingController]', error instanceof Error ? error.name : 'unknown');
  return sendError(res, 500, 'INTERNAL_ERROR', 'Erro interno no serviço de ingressos.');
}

export class TicketingController {
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

  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const parsed = createTicketOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
      }
      const result = await createTicketOrderUseCase(getActor(req), parsed.data);
      return res.status(result.isIdempotentReplay ? 200 : 201).json({
        status: 'success',
        id: result.order.id,
        serverNow: result.serverNow,
        data: result,
      });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async createOrderPaymentIntent(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const orderId = String(req.params.id || '');
      const parsed = payTicketOrderSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados de pagamento inválidos.');
      }
      const result = await createTicketOrderPaymentIntentApplicationUseCase(getActor(req), {
        orderId,
        idempotencyKey: parsed.data.idempotencyKey || randomUUID(),
      });
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async confirmOrderPaymentReturn(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const orderId = String(req.params.id || '');
      const paymentIntentId = String(req.body?.paymentIntentId || req.query.paymentIntentId || '');
      if (!paymentIntentId) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'paymentIntentId é obrigatório.');
      }
      const result = await confirmTicketOrderPaymentClientReturnApplicationUseCase(getActor(req), {
        orderId,
        paymentIntentId,
      });
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async expireOrder(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const orderId = String(req.params.id || '');
      const { order } = await getTicketOrderUseCase(getActor(req), orderId);
      if (order.buyerId !== req.user.uid && req.user.admin !== true) {
        return sendError(res, 403, 'FORBIDDEN', 'Acesso negado a este pedido.');
      }
      await expireTicketOrderUseCase(orderId);
      return res.status(200).json({ status: 'success', orderId, expired: true });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async listUserOrders(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const orders = await listUserTicketOrdersUseCase(getActor(req));
      return res.status(200).json({ status: 'success', data: orders });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async getOrder(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const id = String(req.params.id || '');
      const result = await getTicketOrderUseCase(getActor(req), id);
      return res.status(200).json({
        status: 'success',
        serverNow: new Date().toISOString(),
        data: result,
      });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async listUserTickets(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const tickets = await listUserTicketsUseCase(getActor(req));
      return res.status(200).json({ status: 'success', data: tickets });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async getTicketQrToken(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const ticketId = String(req.params.id || '');
      const result = await getTicketQrTokenUseCase(getActor(req), ticketId);
      return res.status(200).json({
        status: 'success',
        ticketId: result.ticketId,
        token: result.token,
        expiresAt: result.expiresAt,
        data: result,
      });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async swapTicketQr(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const result = await swapTicketQrUseCase(getActor(req), String(req.params.id || ''));
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async listOfflineCheckInChanges(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const since = typeof req.query.since === 'string' ? req.query.since : '';
      if (Number.isNaN(new Date(since).getTime())) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Parâmetro since inválido.');
      }
      const result = await listOfflineCheckInChangesUseCase(getActor(req), {
        sessionId: String(req.params.sessionId || ''),
        since: new Date(since).toISOString(),
      });
      // A lista muda a cada entrada: sem cache de proxy nem do navegador.
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async requestRefund(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const parsed = requestTicketRefundSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
      }
      const orderId = String(req.params.id || '');
      const result = await processTicketRefundApplicationUseCase(getActor(req), {
        orderId,
        ...parsed.data,
      });
      return res.status(result.isReplay ? 200 : 201).json({
        status: 'success',
        data: result.refund,
      });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async checkInTicket(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const parsed = checkInTicketSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
      }
      const result = await checkInTicketUseCase(getActor(req), parsed.data);
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async createOfflineCheckInSession(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const parsed = createOfflineCheckInSessionSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
      }
      const result = await createOfflineCheckInSessionUseCase(getActor(req), parsed.data);
      return res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async syncOfflineCheckIns(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const parsed = syncOfflineCheckInsSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
      }
      const rawEvents = parsed.data.events || parsed.data.items || [];
      if (rawEvents.length === 0) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Nenhum evento offline informado.');
      }
      const normalizedEvents = rawEvents.map((ev) => {
        const scannedAt =
          ('scannedAt' in ev && ev.scannedAt) || ev.checkedInAt || new Date().toISOString();
        const occurrenceId =
          ('occurrenceId' in ev && ev.occurrenceId) || parsed.data.occurrenceId || '';
        return {
          clientEventId: ev.clientEventId,
          sessionId: parsed.data.sessionId,
          ticketId: ev.ticketId,
          ticketIdHash:
            ('ticketIdHash' in ev && ev.ticketIdHash) ||
            hashTicketIdForOfflineManifest(ev.ticketId),
          occurrenceId,
          qrVersion: ev.qrVersion ?? 1,
          scannedAt,
        };
      });
      const result = await syncOfflineCheckInsUseCase(getActor(req), {
        sessionId: parsed.data.sessionId,
        events: normalizedEvents,
      });
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

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

  static async joinWaitlist(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const parsed = joinWaitlistSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
      }
      const entry = await joinEventWaitlistUseCase(getActor(req), parsed.data);
      return res.status(201).json({ status: 'success', data: entry });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }
}
