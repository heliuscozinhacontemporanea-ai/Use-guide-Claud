import crypto from 'crypto';
import { createEventAuditLogUseCase } from '../../events';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import type { TicketQrTokenPort } from '../ports/ticketQrTokenPort';
import {
  type OfflineCheckInEvent,
  type OfflineCheckInManifest,
  type OfflineCheckInSession,
  type OfflineCheckInSyncResultItem,
} from '../types/ticketingTypes';
import { hashTicketIdForOfflineManifest } from '../utils/offlineManifest';
import {
  assertCanOperateGate,
  gateForbidden,
  resolveGateSync,
  getAuditActorType,
  type TicketingActorContext,
} from './ticketingAccess';

const CHANGES_PAGE = 500;

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
    const { occurrence, listing } = await assertCanOperateGate(actor, params.occurrenceId);

    const nowMs = Date.now();
    const startsAtMs = new Date(occurrence.startsAt).getTime();
    const endsAtMs = new Date(occurrence.endsAt).getTime();
    const minPrepMs = startsAtMs - 24 * 3600 * 1000;
    const maxExpireMs = endsAtMs + 6 * 3600 * 1000;

    // Lista só depois do fim das vendas pelo app: assim ela já é a final (D21).
    const salesEndMs = new Date(occurrence.salesEndsAt || occurrence.startsAt).getTime();
    if (nowMs < salesEndMs) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'O check-in sem internet fica disponível depois do fim das vendas pelo app.'
      );
    }
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

    const keys = this.qrTokenPort.publicKeys();
    const keyId = keys[0]?.kid ?? '';
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
      keys,
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

    const gate = await resolveGateSync(actor, session.occurrenceId);
    const { listing } = gate;
    // Equipe da portaria (C1): só entram as leituras feitas enquanto a pessoa fazia parte dela.
    const allowed = gate.staff
      ? (
          await Promise.all(
            params.events.map(async (event) =>
              (await gate.accepts(event.scannedAt)) ? event : null
            )
          )
        ).filter((event): event is OfflineCheckInEvent => event !== null)
      : params.events;
    if (gate.staff && allowed.length === 0) throw gateForbidden();
    const refused: OfflineCheckInSyncResultItem[] = params.events
      .filter((event) => !allowed.includes(event))
      .map((event) => ({ clientEventId: event.clientEventId, status: 'invalid' }));

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

    const results = [
      ...(await this.port.syncOfflineCheckInsAtomic({
        session,
        checkedInBy: actor.uid,
        events: allowed,
      })),
      ...refused,
    ];

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

  /**
   * O que mudou na sessão desde a última atualização do aparelho (D21): trocas de QR, transferências,
   * cancelamentos e entradas. Só hash do ID, versão e situação, como no manifesto.
   */
  async listOfflineChanges(
    actor: TicketingActorContext,
    params: { sessionId: string; since: string }
  ): Promise<{
    serverTime: string;
    hasMore: boolean;
    tickets: Array<{ ticketIdHash: string; qrVersion: number; usable: boolean }>;
  }> {
    const session = await this.port.getOfflineCheckInSessionById(params.sessionId);
    if (!session) {
      throw new TicketingDomainError('NOT_FOUND', 'Sessão de check-in offline não encontrada.');
    }
    await assertCanOperateGate(actor, session.occurrenceId);
    const serverTime = new Date().toISOString();
    const changed = await this.port.listTicketsChangedSince(
      session.occurrenceId,
      params.since,
      CHANGES_PAGE + 1
    );
    return {
      serverTime:
        changed.length > CHANGES_PAGE
          ? (changed[CHANGES_PAGE - 1]?.updatedAt ?? serverTime)
          : serverTime,
      hasMore: changed.length > CHANGES_PAGE,
      tickets: changed.slice(0, CHANGES_PAGE).map((ticket) => ({
        ticketIdHash: hashTicketIdForOfflineManifest(ticket.id),
        qrVersion: ticket.qrVersion || 1,
        usable: ticket.status === 'issued',
      })),
    };
  }
}
