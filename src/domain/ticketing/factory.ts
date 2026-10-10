import { HttpTicketingAdapter } from './adapters/httpTicketingAdapter';
import type { TicketingPort } from './ports/ticketingPort';

export const ticketingAdapter: TicketingPort = new HttpTicketingAdapter();
