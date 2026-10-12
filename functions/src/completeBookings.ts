import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob } from './callInternalJob';

// Marca como concluídas as reservas cujo horário já terminou.
export const completeBookings = onSchedule(
  {
    schedule: '0 3 * * *',
    timeZone: 'America/Fortaleza',
  },
  async () => {
    await callInternalJob(process.env.BOOKINGS_COMPLETION_JOB_URL, 'completeBookings');
  }
);
