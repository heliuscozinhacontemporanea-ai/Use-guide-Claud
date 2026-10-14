import { cancelEventListingAndRefundApplicationUseCase } from '../../../application/usecases/cancelEventListingAndRefundApplicationUseCase';
import { cancelEventOccurrenceAndRefundApplicationUseCase } from '../../../application/usecases/cancelEventOccurrenceAndRefundApplicationUseCase';
import { deleteEventListingSafelyApplicationUseCase } from '../../../application/usecases/deleteEventListingSafelyApplicationUseCase';
import { deleteEventOccurrenceSafelyApplicationUseCase } from '../../../application/usecases/deleteEventOccurrenceSafelyApplicationUseCase';
import { postponeEventOccurrenceAndNotifyApplicationUseCase } from '../../../application/usecases/postponeEventOccurrenceAndNotifyApplicationUseCase';
import { updateEventListingSafelyApplicationUseCase } from '../../../application/usecases/updateEventListingSafelyApplicationUseCase';
import { updateEventOccurrenceSafelyApplicationUseCase } from '../../../application/usecases/updateEventOccurrenceSafelyApplicationUseCase';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { EventDomainError } from '../errors/eventDomainError';
import {
  createEventListingSchema,
  createEventOccurrenceSchema,
  updateEventListingSchema,
  updateEventOccurrenceSchema,
} from '../schemas/eventSchema';
import { archiveEventListingUseCase } from '../usecases/archiveEventListingUseCase';
import { createEventListingUseCase } from '../usecases/createEventListingUseCase';
import { createEventOccurrenceUseCase } from '../usecases/createEventOccurrenceUseCase';
import { getEventListingByIdUseCase } from '../usecases/getEventListingByIdUseCase';
import { listEventOccurrencesUseCase } from '../usecases/listEventOccurrencesUseCase';
import { pauseEventListingUseCase } from '../usecases/pauseEventListingUseCase';
import { publishEventListingUseCase } from '../usecases/publishEventListingUseCase';

function handleEventError(res: Response, error: unknown): Response {
  if (error instanceof EventDomainError) {
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
    }
  }
  console.error('[EventsController]', error);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

function getActor(req: AuthenticatedRequest) {
  return {
    uid: req.user?.uid || '',
    admin: req.user?.admin === true,
    role: req.user?.admin ? 'admin' : 'partner',
  };
}

export class EventsController {
  static async getPublicListing(req: Request, res: Response) {
    try {
      const id = String(req.params.id ?? '');
      const listing = await getEventListingByIdUseCase(id);
      if (!listing || listing.status === 'archived' || listing.visibility === 'private') {
        return res.status(404).json({ error: 'Evento não encontrado.' });
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

  static async createListing(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado.' });
      }
      const parsed = createEventListingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos.',
          details: parsed.error.flatten(),
        });
      }
      const result = await createEventListingUseCase(getActor(req), parsed.data);
      return res.status(201).json({
        status: 'success',
        id: result.listing.id,
        data: result,
      });
    } catch (error) {
      return handleEventError(res, error);
    }
  }

  static async updateListing(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado.' });
      }
      const parsed = updateEventListingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos.',
          details: parsed.error.flatten(),
        });
      }
      const id = String(req.params.id ?? '');
      const updated = await updateEventListingSafelyApplicationUseCase(
        getActor(req),
        id,
        parsed.data
      );
      return res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
      return handleEventError(res, error);
    }
  }

  static async publishListing(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const id = String(req.params.id ?? '');
      const updated = await publishEventListingUseCase(getActor(req), id);
      return res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
      return handleEventError(res, error);
    }
  }

  static async pauseListing(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const id = String(req.params.id ?? '');
      const updated = await pauseEventListingUseCase(getActor(req), id);
      return res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
      return handleEventError(res, error);
    }
  }

  static async archiveListing(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const id = String(req.params.id ?? '');
      const updated = await archiveEventListingUseCase(getActor(req), id);
      return res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
      return handleEventError(res, error);
    }
  }

  static async cancelListing(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const id = String(req.params.id ?? '');
      const reason = typeof req.body?.reason === 'string' ? req.body.reason : undefined;
      const result = await cancelEventListingAndRefundApplicationUseCase(
        getActor(req),
        id,
        reason
      );
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return handleEventError(res, error);
    }
  }

  static async deleteListing(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const id = String(req.params.id ?? '');
      const result = await deleteEventListingSafelyApplicationUseCase(getActor(req), id);
      return res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      return handleEventError(res, error);
    }
  }

  static async createOccurrence(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const parsed = createEventOccurrenceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos.',
          details: parsed.error.flatten(),
        });
      }
      const eventListingId = String(req.params.id ?? '');
      const occurrence = await createEventOccurrenceUseCase(getActor(req), {
        ...parsed.data,
        eventListingId,
      });
      return res.status(201).json({ status: 'success', id: occurrence.id, data: occurrence });
    } catch (error) {
      return handleEventError(res, error);
    }
  }

  static async updateOccurrence(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const parsed = updateEventOccurrenceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos.',
          details: parsed.error.flatten(),
        });
      }
      const occurrenceId = String(req.params.occurrenceId ?? '');
      const updated = await updateEventOccurrenceSafelyApplicationUseCase(
        getActor(req),
        occurrenceId,
        parsed.data
      );
      return res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
      return handleEventError(res, error);
    }
  }

  static async cancelOccurrence(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const occurrenceId = String(req.params.occurrenceId ?? req.params.id ?? '');
      const reason = typeof req.body?.reason === 'string' ? req.body.reason : undefined;
      const updated = await cancelEventOccurrenceAndRefundApplicationUseCase(
        getActor(req),
        occurrenceId,
        reason
      );
      return res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
      return handleEventError(res, error);
    }
  }

  static async postponeOccurrence(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const occurrenceId = String(req.params.occurrenceId ?? '');
      const startsAt = String(req.body?.startsAt ?? '');
      const endsAt = String(req.body?.endsAt ?? '');
      const reason = String(req.body?.reason ?? 'Evento adiado.');
      const moveExistingOrders = req.body?.moveExistingOrders === true;
      const result = await postponeEventOccurrenceAndNotifyApplicationUseCase(
        getActor(req),
        occurrenceId,
        {
          startsAt,
          endsAt,
          salesStartsAt: req.body?.salesStartsAt,
          salesEndsAt: req.body?.salesEndsAt,
          reason,
          moveExistingOrders,
        }
      );
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return handleEventError(res, error);
    }
  }

  static async deleteOccurrence(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
      const occurrenceId = String(req.params.occurrenceId ?? '');
      const result = await deleteEventOccurrenceSafelyApplicationUseCase(
        getActor(req),
        occurrenceId
      );
      return res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      return handleEventError(res, error);
    }
  }
}
