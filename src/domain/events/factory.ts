import { HttpEventsAdapter } from './adapters/httpEventsAdapter';
import type { EventsPort } from './ports/eventsPort';

export const eventsAdapter: EventsPort = new HttpEventsAdapter();
