/** Item do catálogo (domínio guide) visto pelo bookings: só o que a regra de oferta precisa. */
export interface BookableItem {
  id: string;
  ownerId: string;
  partnerId: string;
  category: string;
  /** Nome do estabelecimento, mostrado ao cliente na reserva (D20). */
  name: string;
  /** Fuso do estabelecimento (D28); sem estado e cidade no cadastro, ausente. */
  timeZone?: string;
  /** Cidade do estabelecimento, mostrada ao lado da hora para quem está em outro fuso. */
  city?: string;
}

export interface BookableItemLookupPort {
  getItem(guideItemId: string): Promise<BookableItem | null>;
}
