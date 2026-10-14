import { defineString } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob, internalJobKey } from './callInternalJob';

const jobUrl = defineString('BOOKINGS_EXPIRATION_JOB_URL');

// Devolve as vagas das reservas não pagas em 15 minutos.
export const expireBookings = onSchedule(
  {
    schedule: '*/5 * * * *',
    timeZone: 'America/Fortaleza',
    secrets: [internalJobKey],
  },
  async () => {
    await callInternalJob(jobUrl.value(), 'expireBookings');
  }
);
