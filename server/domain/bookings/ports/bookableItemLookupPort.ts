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
  /** Rascunho não vende (D34, B68). */
  published: boolean;
  /** Aluguel e translado: veículos do anúncio (a oferta escolhe um, F3b). */
  vehicleTypes?: string[];
  /** Translado: trechos do anúncio (a oferta escolhe um, num sentido). */
  transferRoutes?: Array<{ from: string; to: string }>;
  /** Aluguel: horário de funcionamento por dia da semana (0 = domingo), na hora do lugar. */
  openingHours?: Array<{ open: string; close: string } | null>;
}

export interface BookableItemLookupPort {
  getItem(guideItemId: string): Promise<BookableItem | null>;
}
