/** Categorias de aviso (D25). As de parceiro só aparecem para quem é parceiro. */
export const USER_CATEGORIES = [
  'purchases',
  'tickets',
  'bookings',
  'reviews',
  'account',
  'news',
] as const;
export const PARTNER_CATEGORIES = [
  'sales',
  'operations',
  'finance',
  'partnerReviews',
  'registration',
  'messages',
] as const;

export type UserCategory = (typeof USER_CATEGORIES)[number];
export type PartnerCategory = (typeof PARTNER_CATEGORIES)[number];
export type NotificationCategory = UserCategory | PartnerCategory;

/** Sempre aparecem na central; a pessoa só escolhe se também chegam como push. */
export const ALWAYS_IN_CENTER: readonly NotificationCategory[] = [
  'purchases',
  'account',
  'operations',
  'messages',
];

export interface NotificationPreferences {
  /** Push por categoria. Novidades nascem desligadas (LGPD). */
  push: Record<NotificationCategory, boolean>;
  /** Das 22h às 8h (Fortaleza), sem push; avisos com prazo chegam mesmo assim. */
  quietHours: boolean;
  /** Parceiro: um resumo por dia em vez de um push por venda. */
  dailyDigest: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  push: {
    purchases: true,
    tickets: true,
    bookings: true,
    reviews: true,
    account: true,
    news: false,
    sales: true,
    operations: true,
    finance: true,
    partnerReviews: true,
    registration: true,
    messages: true,
  },
  quietHours: true,
  dailyDigest: false,
};

/** Estado do push neste aparelho. `install`: iPhone/iPad fora da Tela de Início. */
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
