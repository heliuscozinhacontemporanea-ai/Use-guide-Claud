import { getEventListingByIdUseCase, listEventOccurrencesUseCase } from '../../../domain/events';
import { listMyPromotionsUseCase, type PromoterRow } from '../../../domain/ticketing';
import { courtesyBusinessName } from '../courtesies/courtesyBusinessName';

export interface MyPromotion extends Omit<PromoterRow, 'promoter'> {
  eventTitle: string;
  businessName: string | null;
  /** Próxima sessão, ou a última quando todas já passaram. */
  startsAt: string | null;
  username: string | null;
}

/** Divulgação do usuário (p26): cada evento com o combinado, as vendas e o código do link. */
export async function listMyPromotionsApplicationUseCase(uid: string): Promise<MyPromotion[]> {
  const rows = await listMyPromotionsUseCase(uid);
  const nowIso = new Date().toISOString();
  return Promise.all(
    rows.map(async ({ promoter, ...row }) => {
      const [listing, occurrences] = await Promise.all([
        getEventListingByIdUseCase(row.eventListingId).catch(() => null),
        listEventOccurrencesUseCase(row.eventListingId).catch(() => []),
      ]);
      const starts = occurrences
        .filter((occurrence) => occurrence.status !== 'canceled')
        .map((occurrence) => occurrence.startsAt)
        .sort();
      return {
        ...row,
        username: promoter.username,
        eventTitle: listing?.title ?? '',
        businessName: await courtesyBusinessName(listing?.establishmentId),
        startsAt: starts.find((iso) => iso >= nowIso) ?? starts.at(-1) ?? null,
      };
    })
  );
}
