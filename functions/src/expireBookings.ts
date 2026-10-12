import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob } from './callInternalJob';

// Devolve as vagas das reservas não pagas em 15 minutos.
export const expireBookings = onSchedule(
  {
    schedule: '*/5 * * * *',
    timeZone: 'America/Fortaleza',
  },
  async () => {
    await callInternalJob(process.env.BOOKINGS_EXPIRATION_JOB_URL, 'expireBookings');
  }
);
