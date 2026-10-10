import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import type { AuthenticatedUserContext } from '../../../application/security/authenticatedUserContext';
import { createPartnerEventApplicationUseCase } from '../../../application/usecases/createPartnerEventApplicationUseCase';
import { createPartnerItemApplicationUseCase } from '../../../application/usecases/createPartnerItemApplicationUseCase';
import { deletePartnerEventApplicationUseCase } from '../../../application/usecases/deletePartnerEventApplicationUseCase';
import { deletePartnerItemApplicationUseCase } from '../../../application/usecases/deletePartnerItemApplicationUseCase';
import { updatePartnerEventApplicationUseCase } from '../../../application/usecases/updatePartnerEventApplicationUseCase';
import { updatePartnerItemApplicationUseCase } from '../../../application/usecases/updatePartnerItemApplicationUseCase';
import {
  cancelEventOccurrenceAndRefundApplicationUseCase,
  deleteEventOccurrenceSafelyApplicationUseCase,
  postponeEventOccurrenceAndNotifyApplicationUseCase,
  updateEventOccurrenceSafelyApplicationUseCase,
} from '../../../application/usecases/eventLifecycleOrchestrationUseCases';
import {
  createEventOccurrenceUseCase,
} from '../../events';
import {
  getEventSalesAnalyticsUseCase,
  listEventCheckInsForPartnerOrAdminUseCase,
  listEventOrdersForPartnerOrAdminUseCase,
  listEventRefundsForPartnerOrAdminUseCase,
} from '../../ticketing';
import {
  createPartnerEventOccurrenceSchema,
  createPartnerEventSchema,
  createPartnerItemSchema,
  updatePartnerEventOccurrenceSchema,
  updatePartnerEventSchema,
  updatePartnerItemSchema,
} from '../schemas/partnerContentSchema';

function requireGuideContext(req: AuthenticatedRequest): AuthenticatedUserContext {
  if (!req.guideUserContext) {
    throw new Error('Contexto de autorização não resolvido');
  }
  return req.guideUserContext;
}

function getErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

function sendControllerError(res: Response, error: unknown, fallbackMessage: string): Response {
  const code = getErrorCode(error);
  if (code === 'FORBIDDEN') {
    return res.status(403).json({
      error: error instanceof Error ? error.message : 'Acesso proibido',
    });
  }
  if (code === 'NOT_FOUND') {
    return res.status(404).json({
      error: error instanceof Error ? error.message : 'Recurso não encontrado',
    });
  }
  if (code === 'UNPROCESSABLE_ENTITY') {
    return res.status(422).json({
      error: error instanceof Error ? error.message : 'Operação não permitida',
    });
  }
  if (code === 'INVALID_ARGUMENT' || code === 'VALIDATION_ERROR' || code === 'INVALID_ID') {
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Dados inválidos',
    });
  }
  console.error('[PartnerContentController]', error);
  return res.status(500).json({
    error: fallbackMessage,
  });
}

export class PartnerContentController {
  static async createItem(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const parsed = createPartnerItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: parsed.error.format(),
        });
      }
      const itemId = await createPartnerItemApplicationUseCase(user, parsed.data);
      return res.status(201).json({ status: 'success', id: itemId });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao criar item do parceiro');
    }
  }

  static async updateItem(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

      const parsed = updatePartnerItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: parsed.error.format(),
        });
      }
      await updatePartnerItemApplicationUseCase(user, id, parsed.data);
      return res.status(200).json({ status: 'success', message: 'Item atualizado com sucesso' });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao atualizar item do parceiro');
    }
  }

  static async deleteItem(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

      await deletePartnerItemApplicationUseCase(user, id);
      return res.status(200).json({ status: 'success', message: 'Item excluído com sucesso' });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao excluir item do parceiro');
    }
  }

  static async createEvent(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const parsed = createPartnerEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: parsed.error.format(),
        });
      }
      const eventId = await createPartnerEventApplicationUseCase(user, parsed.data);
      return res.status(201).json({ status: 'success', id: eventId });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao criar evento do parceiro');
    }
  }

  static async updateEvent(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

      const parsed = updatePartnerEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: parsed.error.format(),
        });
      }
      await updatePartnerEventApplicationUseCase(user, id, parsed.data);
      return res.status(200).json({ status: 'success', message: 'Evento atualizado com sucesso' });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao atualizar evento do parceiro');
    }
  }

  static async deleteEvent(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

      await deletePartnerEventApplicationUseCase(user, id);
      return res.status(200).json({ status: 'success', message: 'Evento excluído com sucesso' });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao excluir evento do parceiro');
    }
  }

  static async createEventOccurrence(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const rawId = req.params.id;
      const eventListingId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!eventListingId) return res.status(400).json({ error: 'ID do evento é obrigatório' });

      const parsed = createPartnerEventOccurrenceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: parsed.error.format(),
        });
      }

      const occurrence = await createEventOccurrenceUseCase(user, {
        ...parsed.data,
        eventListingId,
      });
      return res.status(201).json({ status: 'success', id: occurrence.id, data: occurrence });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao criar ocorrência do evento');
    }
  }

  static async updateEventOccurrence(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const rawOccId = req.params.occurrenceId;
      const occurrenceId = Array.isArray(rawOccId) ? rawOccId[0] : rawOccId;
      if (!occurrenceId) return res.status(400).json({ error: 'ID da ocorrência é obrigatório' });

      const parsed = updatePartnerEventOccurrenceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: parsed.error.format(),
        });
      }

      const updated = await updateEventOccurrenceSafelyApplicationUseCase(
        user,
        occurrenceId,
        parsed.data
      );
      return res.status(200).json({ status: 'success', data: updated });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao atualizar ocorrência do evento');
    }
  }

  static async cancelEventOccurrence(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const rawOccId = req.params.occurrenceId;
      const occurrenceId = Array.isArray(rawOccId) ? rawOccId[0] : rawOccId;
      if (!occurrenceId) return res.status(400).json({ error: 'ID da ocorrência é obrigatório' });

      const reason = typeof req.body?.reason === 'string' ? req.body.reason : undefined;
      const updated = await cancelEventOccurrenceAndRefundApplicationUseCase(
        user,
        occurrenceId,
        reason
      );
      return res.status(200).json({ status: 'success', data: updated });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao cancelar ocorrência do evento');
    }
  }

  static async postponeEventOccurrence(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const rawOccId = req.params.occurrenceId;
      const occurrenceId = Array.isArray(rawOccId) ? rawOccId[0] : rawOccId;
      if (!occurrenceId) return res.status(400).json({ error: 'ID da ocorrência é obrigatório' });

      const startsAt = String(req.body?.startsAt ?? '');
      const endsAt = String(req.body?.endsAt ?? '');
      const reason = String(req.body?.reason ?? 'Evento adiado pelo parceiro.');
      const moveExistingOrders = req.body?.moveExistingOrders === true;
      const result = await postponeEventOccurrenceAndNotifyApplicationUseCase(user, occurrenceId, {
        startsAt,
        endsAt,
        salesStartsAt: req.body?.salesStartsAt,
        salesEndsAt: req.body?.salesEndsAt,
        reason,
        moveExistingOrders,
      });
      return res.status(200).json({ status: 'success', data: result });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao adiar ocorrência do evento');
    }
  }

  static async deleteEventOccurrence(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const rawOccId = req.params.occurrenceId;
      const occurrenceId = Array.isArray(rawOccId) ? rawOccId[0] : rawOccId;
      if (!occurrenceId) return res.status(400).json({ error: 'ID da ocorrência é obrigatório' });

      const result = await deleteEventOccurrenceSafelyApplicationUseCase(user, occurrenceId);
      return res.status(200).json({ status: 'success', ...result });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao remover ocorrência do evento');
    }
  }

  static async listEventOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const id = String(req.params.id || '');
      const orders = await listEventOrdersForPartnerOrAdminUseCase(user, id);
      return res.status(200).json({ status: 'success', data: orders });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao consultar pedidos do evento');
    }
  }

  static async listEventCheckIns(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const id = String(req.params.id || '');
      const checkIns = await listEventCheckInsForPartnerOrAdminUseCase(user, id);
      return res.status(200).json({ status: 'success', data: checkIns });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao consultar check-ins do evento');
    }
  }

  static async listEventRefunds(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const id = String(req.params.id || '');
      const refunds = await listEventRefundsForPartnerOrAdminUseCase(user, id);
      return res.status(200).json({ status: 'success', data: refunds });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao consultar reembolsos do evento');
    }
  }

  static async getEventSalesAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const user = requireGuideContext(req);
      const id = String(req.params.id || '');
      const occurrenceId =
        typeof req.query.occurrenceId === 'string' ? req.query.occurrenceId : undefined;
      const analytics = await getEventSalesAnalyticsUseCase(user, id, occurrenceId);
      return res.status(200).json({ status: 'success', data: analytics });
    } catch (error: unknown) {
      return sendControllerError(res, error, 'Erro ao consultar métricas de vendas do evento');
    }
  }
}
