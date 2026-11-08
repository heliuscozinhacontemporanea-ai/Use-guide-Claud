/** Envio de um aviso a muitas contas, em partes; guarda até onde foi para continuar depois. */
export interface NotificationCampaign {
  id: string;
  status: 'sending' | 'done';
  cursor: string | null;
  sent: number;
  updatedAt: string;
}

export interface NotificationCampaignPort {
  get(id: string): Promise<NotificationCampaign | null>;
  save(campaign: NotificationCampaign): Promise<void>;
}
