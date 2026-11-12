import { HttpCourtesyAdapter } from './adapters/httpCourtesyAdapter';
import { HttpGateStaffAdapter } from './adapters/httpGateStaffAdapter';
import { HttpPromoterAdapter } from './adapters/httpPromoterAdapter';
import { HttpTicketingAdapter } from './adapters/httpTicketingAdapter';
import type { CourtesyPort } from './ports/courtesyPort';
import type { GateStaffPort } from './ports/gateStaffPort';
import type { PromoterPort } from './ports/promoterPort';
import type { TicketingPort } from './ports/ticketingPort';

export const ticketingAdapter: TicketingPort = new HttpTicketingAdapter();
export const courtesyAdapter: CourtesyPort = new HttpCourtesyAdapter();
export const promoterAdapter: PromoterPort = new HttpPromoterAdapter();
export const gateStaffAdapter: GateStaffPort = new HttpGateStaffAdapter();
