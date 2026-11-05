import type { ReactNode } from 'react';
import type { EventSessionsFieldProps } from '../../events';
import type { PartnerProfile, SubscriptionPlan } from '../types/partner';
import type { PartnerContentRecord } from '../types/partnerContent';
import type { PartnerTodayItem } from '../types/partnerHome';
import type { PartnerAgoraRenders } from './panel/PartnerAgoraSection';
import type { PartnerCatalogRenders } from './panel/PartnerCatalogSection';
import type { PartnerEarningsRenders } from './panel/PartnerEarningsTab';
import type { PartnerAccountView } from './panel/PartnerMoreSection';

/** O que a composição recebe para abrir a folha de um item da Agenda. */
export interface AgendaSheetProps {
  item: PartnerTodayItem;
  /** Aberta pelo cartão de portaria ou de lista sem internet de "Agora": já na portaria. */
  gate?: boolean;
  onClose: () => void;
  onChanged: () => void;
}

export interface PartnerPanelProps {
  profile?: PartnerProfile;
  subscriptionPlans?: SubscriptionPlan[];
  renderReports?: (props: {
    partnerId: string;
    items: PartnerContentRecord[];
    events: PartnerContentRecord[];
    /** Avaliações sem resposta por item, do Início (contadas no servidor). */
    unansweredReviews: Record<string, number>;
  }) => ReactNode;
  renderCheckoutModal?: (props: {
    isOpen: boolean;
    onClose: () => void;
    /** Estabelecimento que recebe o plano (D11). */
    itemId: string;
    planId: string;
    itemName: string;
    amountMinor: number;
    onPaymentSuccess: () => void;
  }) => ReactNode;
  renderEventTicketingManager?: (eventListingId: string) => ReactNode;
  /** Campo de sessões do evento (domínio events), montado pela composição do app. */
  renderEventSessionsField?: (props: EventSessionsFieldProps) => ReactNode;
  /** Assinatura no cartão do plano de um estabelecimento, montada pela composição. */
  renderPlanSubscription?: (itemId: string, onLiveChange: (live: boolean) => void) => ReactNode;
  /** Passeios, visitas e avaliações do Catálogo (outros domínios), montados pela composição. */
  renderCatalog?: PartnerCatalogRenders;
  /** Chamado ao fechar o checkout depois de um pagamento confirmado, para recarregar o perfil. */
  onPlanPurchased?: () => void;
  /** Ganhos (domínio payment), montado pela composição. */
  renderEarnings?: PartnerEarningsRenders;
  /** Resumo dos avisos de venda na linha Notificações do Mais (notifications). */
  renderNotificationsHint?: () => ReactNode;
  /** Conta de recebimento do evento em Editar evento (payment), montada pela composição. */
  renderEventAccountCard?: (establishmentId: string, establishmentName: string) => ReactNode;
  /** "Cheguei", folha do código e contatos de "Agora" (domínio bookings), montados pela composição. */
  renderAgora?: PartnerAgoraRenders;
  /** Folha do horário de reserva (domínio bookings), montada pela composição. */
  renderSlotSheet?: (props: AgendaSheetProps) => ReactNode;
  /** Folha da sessão de evento (domínio ticketing), montada pela composição. */
  renderSessionSheet?: (props: AgendaSheetProps) => ReactNode;
  /** Notificações, termos do parceiro e ajuda (outros domínios), montados pela composição. */
  renderAccountView?: (view: PartnerAccountView, onBack: () => void) => ReactNode;
}
