/** Item do catálogo (domínio guide) visto pelo bookings: só o que a regra de oferta precisa. */
export interface BookableItem {
  id: string;
  ownerId: string;
  partnerId: string;
  category: string;
  /** Nome do estabelecimento, mostrado ao cliente na reserva (D20). */
  name: string;
}

export interface BookableItemLookupPort {
  getItem(guideItemId: string): Promise<BookableItem | null>;
}
