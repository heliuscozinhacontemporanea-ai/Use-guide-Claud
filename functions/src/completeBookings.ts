import { defineString } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob, internalJobKey } from './callInternalJob';

const jobUrl = defineString('BOOKINGS_COMPLETION_JOB_URL');

// Marca como concluídas as reservas cujo horário já terminou.
export const completeBookings = onSchedule(
  {
    schedule: '0 3 * * *',
    timeZone: 'America/Fortaleza',
    secrets: [internalJobKey],
  },
  async () => {
    await callInternalJob(jobUrl.value(), 'completeBookings');
  }
);
