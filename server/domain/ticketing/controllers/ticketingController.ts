import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import {
  confirmTicketOrderPaymentClientReturnApplicationUseCase,
  createTicketOrderPaymentIntentApplicationUseCase,
  processTicketRefundApplicationUseCase,
} from '../../../application/usecases/ticketingPaymentOrchestrationUseCases';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { hashTicketIdForOfflineManifest } from '../adapters/rsaPssTicketQrTokenAdapter';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import {
  checkInTicketSchema,
  createOfflineCheckInSessionSchema,
  createPromoCodeSchema,
  createTicketOrderSchema,
  createTicketTypeSchema,
  joinWaitlistSchema,
  payTicketOrderSchema,
  requestTicketRefundSchema,
  syncOfflineCheckInsSchema,
  transferTicketSchema,
  updateTicketTypeSchema,
} from '../schemas/ticketingSchema';
import {
  archiveTicketTypeUseCase,
  checkInTicketUseCase,
  createEventPromoCodeUseCase,
  createOfflineCheckInSessionUseCase,
  createTicketOrderUseCase,
  createTicketTypeUseCase,
  expireAllOverdueOrdersUseCase,
  expireTicketOrderUseCase,
  getEventSalesAnalyticsUseCase,
  getTicketOrderUseCase,
  getTicketQrTokenUseCase,
  joinEventWaitlistUseCase,
  listEventCheckInsForPartnerOrAdminUseCase,
  listEventOrdersForPartnerOrAdminUseCase,
  listEventRefundsForPartnerOrAdminUseCase,
  listPublicTicketTypesByOccurrenceUseCase,
  listTicketTypesForManagementUseCase,
  listUserTicketOrdersUseCase,
  listUserTicketsUseCase,
  reissueTicketQrTokenUseCase,
  syncOfflineCheckInsUseCase,
  transferTicketUseCase,
  updateTicketTypeUseCase,
} from '../usecases/ticketingUseCases';

function getActor(req: AuthenticatedRequest) {
  return {
    uid: req.user?.uid || '',
    admin: req.user?.admin === true,
    role: req.user?.admin === true ? 'admin' : 'user',
  };
}

function handleTicketingError(res: Response, error: unknown): Response {
  if (error instanceof TicketingDomainError) {
    switch (error.code) {
      case 'INVALID_ARGUMENT':
        return res.status(400).json({ error: error.message });
      case 'FORBIDDEN':
        return res.status(403).json({ error: error.message });
      case 'NOT_FOUND':
        return res.status(404).json({ error: error.message });
      case 'CONFLICT':
        return res.status(409).json({ error: error.message });
      case 'UNPROCESSABLE_ENTITY':
        return res.status(422).json({ error: error.message });
      case 'SERVICE_UNAVAILABLE':
        return res.status(503).json({ error: error.message });
    }
  }
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: unknown }).code);
    const msg = error instanceof Error ? error.message : 'Erro na operação.';
    if (code === 'FORBIDDEN') return res.status(403).json({ error: msg });
    if (code === 'NOT_FOUND') return res.status(404).json({ error: msg });
    if (code === 'CONFLICT') return res.status(409).json({ error: msg });
    if (code === 'UNPROCESSABLE_ENTITY') return res.status(422).json({ error: msg });
  }
  console.error('[TicketingController]', error);
  return res.status(500).json({ error: 'Erro interno no serviço de ingressos.' });
}

export class TicketingController {
  static async listPublicTicketTypes(req: Request, res: Response) {
    try {
      const occurrenceId = String(req.params.occurrenceId || req.query.occurrenceId || '');
      if (!occurrenceId) {
        return res.status(400).json({ error: 'occurrenceId é obrigatório.' });
      }
      const list = await listPublicTicketTypesByOccurrenceUseCase(occurrenceId);
      return res.status(200).json({ status: 'success', data: list });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async listManagementTicketTypes(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const occurrenceId = String(req.params.occurrenceId || req.query.occurrenceId || '');
      const list = await listTicketTypesForManagementUseCase(getActor(req), occurrenceId);
      return res.status(200).json({ status: 'success', data: list });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async createTicketType(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const parsed = createTicketTypeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten() });
      }
      const created = await createTicketTypeUseCase(getActor(req), parsed.data);
      return res.status(201).json({ status: 'success', id: created.id, data: created });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async updateTicketType(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const parsed = updateTicketTypeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten() });
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
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const ticketTypeId = String(req.params.ticketTypeId || req.params.id || '');
      const result = await archiveTicketTypeUseCase(getActor(req), ticketTypeId);
      return res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const parsed = createTicketOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten() });
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
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const orderId = String(req.params.id || '');
      const parsed = payTicketOrderSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados de pagamento inválidos.', details: parsed.error.flatten() });
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
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const orderId = String(req.params.id || '');
      const paymentIntentId = String(req.body?.paymentIntentId || req.query.paymentIntentId || '');
      if (!paymentIntentId) {
        return res.status(400).json({ error: 'paymentIntentId é obrigatório.' });
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
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const orderId = String(req.params.id || '');
      const { order } = await getTicketOrderUseCase(getActor(req), orderId);
      if (order.buyerId !== req.user.uid && req.user.admin !== true) {
        return res.status(403).json({ error: 'Acesso negado a este pedido.' });
      }
      await expireTicketOrderUseCase(orderId);
      return res.status(200).json({ status: 'success', orderId, expired: true });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  // A chave do job é verificada antes, pelo middleware verifyInternalJobKey.
  static async expireOrdersInternalJob(_req: Request, res: Response) {
    try {
      const result = await expireAllOverdueOrdersUseCase();
      return res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async listUserOrders(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const orders = await listUserTicketOrdersUseCase(getActor(req));
      return res.status(200).json({ status: 'success', data: orders });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async getOrder(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
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
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const tickets = await listUserTicketsUseCase(getActor(req));
      return res.status(200).json({ status: 'success', data: tickets });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async getTicketQrToken(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
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

  static async reissueTicketQrToken(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const ticketId = String(req.params.id || '');
      const result = await reissueTicketQrTokenUseCase(getActor(req), ticketId);
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

  static async requestRefund(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const parsed = requestTicketRefundSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten() });
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

  static async transferTicket(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const parsed = transferTicketSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten() });
      }
      const ticketId = String(req.params.id || '');
      const result = await transferTicketUseCase(getActor(req), {
        ticketId,
        ...parsed.data,
      });
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async checkInTicket(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const parsed = checkInTicketSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten() });
      }
      const result = await checkInTicketUseCase(getActor(req), parsed.data);
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async createOfflineCheckInSession(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const parsed = createOfflineCheckInSessionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten() });
      }
      const result = await createOfflineCheckInSessionUseCase(getActor(req), parsed.data);
      return res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async syncOfflineCheckIns(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const parsed = syncOfflineCheckInsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten() });
      }
      const rawEvents = parsed.data.events || parsed.data.items || [];
      if (rawEvents.length === 0) {
        return res.status(400).json({ error: 'Nenhum evento offline informado.' });
      }
      const normalizedEvents = rawEvents.map((ev) => {
        const scannedAt =
          ('scannedAt' in ev && ev.scannedAt) ||
          ev.checkedInAt ||
          new Date().toISOString();
        const occurrenceId =
          ('occurrenceId' in ev && ev.occurrenceId) ||
          parsed.data.occurrenceId ||
          '';
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
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
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
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const eventListingId = String(req.params.id || '');
      const orders = await listEventOrdersForPartnerOrAdminUseCase(
        getActor(req),
        eventListingId
      );
      return res.status(200).json({ status: 'success', data: orders });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async listEventCheckIns(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
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
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const eventListingId = String(req.params.id || '');
      const refunds = await listEventRefundsForPartnerOrAdminUseCase(
        getActor(req),
        eventListingId
      );
      return res.status(200).json({ status: 'success', data: refunds });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async createPromoCode(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const parsed = createPromoCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten() });
      }
      const created = await createEventPromoCodeUseCase(getActor(req), parsed.data);
      return res.status(201).json({ status: 'success', data: created });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async joinWaitlist(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const parsed = joinWaitlistSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten() });
      }
      const entry = await joinEventWaitlistUseCase(getActor(req), parsed.data);
      return res.status(201).json({ status: 'success', data: entry });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }
}
