import { HttpCourtesyAdapter } from './adapters/httpCourtesyAdapter';
import { HttpTicketingAdapter } from './adapters/httpTicketingAdapter';
import type { CourtesyPort } from './ports/courtesyPort';
import type { TicketingPort } from './ports/ticketingPort';

export const ticketingAdapter: TicketingPort = new HttpTicketingAdapter();
export const courtesyAdapter: CourtesyPort = new HttpCourtesyAdapter();
