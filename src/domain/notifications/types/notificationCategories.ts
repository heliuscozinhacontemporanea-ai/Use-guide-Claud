/** Assunto de cada aviso (D25). Define o ícone na central e para onde o toque leva. */
export type NotificationCategory =
  | 'purchases'
  | 'tickets'
  | 'bookings'
  | 'reviews'
  | 'account'
  | 'news'
  | 'sales'
  | 'operations'
  | 'finance'
  | 'partnerReviews'
  | 'registration'
  | 'messages';

/**
 * O que a pessoa escolhe (D25, revisão). Compras, ingressos, reservas, conta e, para o parceiro,
 * vendas, cancelamentos, reclamações e repasses chegam sempre: sem eles a pessoa perde um serviço
 * ou um prazo. Avisos opcionais nunca chegam das 21h às 9h (Fortaleza).
 */
export interface NotificationPreferences {
  /** Pedido de avaliação depois de um passeio, evento ou estadia. */
  reviewRequests: boolean;
  /** Novidades e ofertas. Nascem desligadas (LGPD e Apple HIG: marketing só com aceite). */
  news: boolean;
  /** Parceiro: um aviso a cada venda ou um resumo no fim do dia. */
  salesAlerts: 'each' | 'daily';
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  reviewRequests: true,
  news: false,
  salesAlerts: 'each',
};

/** Estado das notificações neste aparelho. `install`: iPhone/iPad fora da Tela de Início. */
export type PushDeviceState = 'unsupported' | 'install' | 'default' | 'granted' | 'denied';

/** Linha da central de notificações, já no idioma de quem lê. */
export interface NotificationCenterItem {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: Date;
  read: boolean;
}
