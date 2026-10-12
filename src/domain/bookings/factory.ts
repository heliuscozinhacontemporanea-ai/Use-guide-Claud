import { HttpBookingsAdapter } from './adapters/httpBookingsAdapter';
import type { BookingsApiPort } from './ports/bookingsApiPort';

export const bookingsApi: BookingsApiPort = new HttpBookingsAdapter();
