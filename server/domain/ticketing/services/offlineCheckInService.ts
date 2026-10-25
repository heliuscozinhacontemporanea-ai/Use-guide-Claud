import crypto from 'crypto';
import { createEventAuditLogUseCase } from '../../events';
import { hashTicketIdForOfflineManifest } from '../adapters/rsaPssTicketQrTokenAdapter';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketQrTokenPort } from '../ports/ticketQrTokenPort';
import type { TicketingPort } from '../ports/ticketingPort';
import {
  type OfflineCheckInEvent,
  type OfflineCheckInManifest,
  type OfflineCheckInSession,
  type OfflineCheckInSyncResultItem,
} from '../types/ticketingTypes';
import {
  assertCanManageOccurrence,
  getAuditActorType,
  type TicketingActorContext,
} from './ticketingAccess';

/** Check-in offline: manifesto assinado e sincronização. */
export class OfflineCheckInService {
  constructor(
    private readonly port: TicketingPort,
    private readonly qrTokenPort?: TicketQrTokenPort
  ) {}

  async prepareOfflineCheckInSession(
    actor: TicketingActorContext,
    params: {
      occurrenceId: string;
      stationId?: string;
    }
  ): Promise<{
    session: OfflineCheckInSession;
    manifest: OfflineCheckInManifest;
  }> {
    const { occurrence, listing } = await assertCanManageOccurrence(actor, params.occurrenceId);

    const nowMs = Date.now();
    const startsAtMs = new Date(occurrence.startsAt).getTime();
    const endsAtMs = new Date(occurrence.endsAt).getTime();
    const minPrepMs = startsAtMs - 24 * 3600 * 1000;
    const maxExpireMs = endsAtMs + 6 * 3600 * 1000;

    if (nowMs < minPrepMs) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'A preparação offline só é permitida a partir de 24 horas antes do início da ocorrência.'
      );
    }
    if (nowMs > maxExpireMs) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'O período operacional desta ocorrência para check-in offline já encerrou.'
      );
    }

    if (!this.qrTokenPort) {
      throw new TicketingDomainError(
        'SERVICE_UNAVAILABLE',
        'Chave pública de validação offline não configurada.'
      );
    }

    const { keyId, publicKeyJwk } = this.qrTokenPort.getPublicKeyMetadata();
    const allTickets = await this.port.listTicketsByOccurrenceId(occurrence.id);
    const eligibleTickets = allTickets
      .filter((t) => t.status === 'issued')
      .map((t) => ({
        ticketIdHash: hashTicketIdForOfflineManifest(t.id),
        qrVersion: t.qrVersion || 1,
      }));

    const issuedAt = new Date(nowMs).toISOString();
    const expiresAt = new Date(maxExpireMs).toISOString();
    const stationId = params.stationId?.trim() || 'station-default';

    const manifestPayloadForHash = JSON.stringify({
      occurrenceId: occurrence.id,
      eventListingId: listing.id,
      stationId,
      issuedAt,
      expiresAt,
      keyId,
      tickets: eligibleTickets,
    });
    const manifestHash = crypto.createHash('sha256').update(manifestPayloadForHash).digest('hex');

    const session = await this.port.createOfflineCheckInSession({
      partnerId: listing.ownerId,
      occurrenceId: occurrence.id,
      eventListingId: listing.id,
      stationId,
      issuedAt,
      expiresAt,
      manifestHash,
      status: 'active',
      keyId,
    });

    const manifest: OfflineCheckInManifest = {
      version: 1,
      sessionId: session.id,
      occurrenceId: occurrence.id,
      eventListingId: listing.id,
      stationId,
      issuedAt,
      expiresAt,
      keyId,
      publicKeyJwk,
      tickets: eligibleTickets,
    };

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'occurrence',
      resourceId: occurrence.id,
      action: 'offline_checkin.session_prepared',
      after: {
        sessionId: session.id,
        stationId,
        eligibleCount: eligibleTickets.length,
        expiresAt,
      },
    });

    return { session, manifest };
  }

  async syncOfflineCheckInEvents(
    actor: TicketingActorContext,
    params: {
      sessionId: string;
      events: OfflineCheckInEvent[];
    }
  ): Promise<{
    sessionId: string;
    results: OfflineCheckInSyncResultItem[];
  }> {
    const session = await this.port.getOfflineCheckInSessionById(params.sessionId);
    if (!session) {
      throw new TicketingDomainError('NOT_FOUND', 'Sessão de check-in offline não encontrada.');
    }

    const { listing } = await assertCanManageOccurrence(actor, session.occurrenceId);

    if (session.status !== 'active') {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        `Sessão offline não está ativa (status: ${session.status}).`
      );
    }

    if (Date.now() > new Date(session.expiresAt).getTime()) {
      return {
        sessionId: session.id,
        results: params.events.map((ev) => ({
          clientEventId: ev.clientEventId,
          status: 'expired',
        })),
      };
    }

    const results = await this.port.syncOfflineCheckInsAtomic({
      session,
      checkedInBy: actor.uid,
      events: params.events,
    });

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'occurrence',
      resourceId: session.occurrenceId,
      action: 'offline_checkin.synced',
      after: {
        sessionId: session.id,
        eventsProcessed: params.events.length,
      },
    });

    return {
      sessionId: session.id,
      results,
    };
  }
}
