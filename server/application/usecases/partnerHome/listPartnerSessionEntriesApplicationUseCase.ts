import {
  listEventCheckInsForPartnerOrAdminUseCase,
  listEventTicketsForPartnerOrAdminUseCase,
} from '../../../domain/ticketing';
import { getUserPublicProfileUseCase } from '../../../domain/users';

/** Entrada na portaria (A2): nome público, lote e horário; sem e-mail, documento nem titular. */
export interface PartnerSessionEntryView {
  id: string;
  name: string | null;
  ticketType: string | null;
  courtesy: boolean;
  at: string;
  /** Registrada com internet ou enviada depois pela lista sem internet. */
  source: 'online' | 'offline';
  /** Quem liberou a entrada (C1): o próprio dono ou o @ de alguém da equipe da portaria. */
  releasedByOwner: boolean;
  releasedByUsername: string | null;
}

/** Quem entrou na sessão e quando, do mais recente ao mais antigo. A posse vem do ticketing. */
export async function listPartnerSessionEntriesApplicationUseCase(
  ownerUid: string,
  eventId: string,
  occurrenceId: string
): Promise<PartnerSessionEntryView[]> {
  const actor = { uid: ownerUid, admin: false, role: 'partner' as const };
  // Primeiro as entradas: evento de outro dono lança FORBIDDEN antes de ler o resto.
  const checkIns = (await listEventCheckInsForPartnerOrAdminUseCase(actor, eventId)).filter(
    (checkIn) => checkIn.occurrenceId === occurrenceId
  );
  if (checkIns.length === 0) return [];
  const tickets = new Map(
    (await listEventTicketsForPartnerOrAdminUseCase(actor, eventId)).map((ticket) => [
      ticket.id,
      ticket,
    ])
  );
  const owners = [
    ...new Set(checkIns.flatMap((checkIn) => tickets.get(checkIn.ticketId)?.ownerUserId ?? [])),
  ];
  const staff = checkIns
    .map((checkIn) => checkIn.checkedInBy)
    .filter((uid) => uid && uid !== ownerUid);
  const profiles = new Map(
    await Promise.all(
      [...new Set([...owners, ...staff])].map(
        async (uid) => [uid, await getUserPublicProfileUseCase(uid).catch(() => null)] as const
      )
    )
  );
  return checkIns
    .map((checkIn) => {
      const ticket = tickets.get(checkIn.ticketId);
      return {
        id: checkIn.id,
        name: ticket ? (profiles.get(ticket.ownerUserId)?.displayName ?? null) : null,
        ticketType: ticket?.ticketTypeSnapshot?.name ?? null,
        courtesy: Boolean(ticket?.courtesyId),
        at: checkIn.checkedInAt,
        source: checkIn.source,
        releasedByOwner: checkIn.checkedInBy === ownerUid,
        releasedByUsername:
          checkIn.checkedInBy === ownerUid
            ? null
            : (profiles.get(checkIn.checkedInBy)?.username ?? null),
      };
    })
    .sort((a, b) => b.at.localeCompare(a.at));
}
