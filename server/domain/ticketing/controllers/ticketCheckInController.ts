import { Response } from 'express';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  checkInTicketSchema,
  createOfflineCheckInSessionSchema,
  syncOfflineCheckInsSchema,
} from '../schemas/ticketingSchema';
import { checkInTicketUseCase } from '../usecases/checkInTicketUseCase';
import { createOfflineCheckInSessionUseCase } from '../usecases/createOfflineCheckInSessionUseCase';
import { listOfflineCheckInChangesUseCase } from '../usecases/listOfflineCheckInChangesUseCase';
import { syncOfflineCheckInsUseCase } from '../usecases/syncOfflineCheckInsUseCase';
import { hashTicketIdForOfflineManifest } from '../utils/offlineManifest';
import { getActor, handleTicketingError, sendError } from './ticketingHttp';

/** Portaria: check-in na hora e a lista sem internet (C5). */
export class TicketCheckInController {
  static async checkInTicket(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const parsed = checkInTicketSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
      }
      const { ticket, checkIn } = await checkInTicketUseCase(getActor(req), parsed.data);
      // Saída por allowlist (§7.9 regra 4): a portaria, inclusive a equipe (C1), vê só o nome do
      // titular, o lote e se é convidado; nunca o e-mail, o comprador nem o hash do QR.
      return res.status(200).json({
        status: 'success',
        data: {
          ticket: {
            id: ticket.id,
            status: ticket.status,
            holderName: ticket.holderName,
            courtesyId: ticket.courtesyId ?? null,
            ticketTypeSnapshot: ticket.ticketTypeSnapshot
              ? { name: ticket.ticketTypeSnapshot.name }
              : null,
            checkedInAt: ticket.checkedInAt ?? null,
          },
          checkIn: {
            id: checkIn.id,
            ticketId: checkIn.ticketId,
            occurrenceId: checkIn.occurrenceId,
            source: checkIn.source,
            checkedInAt: checkIn.checkedInAt,
          },
        },
      });
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
}
