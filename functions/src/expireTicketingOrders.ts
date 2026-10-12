import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob } from './callInternalJob';

export const expireTicketingOrders = onSchedule(
  {
    schedule: '*/5 * * * *',
    timeZone: 'America/Fortaleza',
  },
  async () => {
    await callInternalJob(process.env.TICKETING_EXPIRATION_JOB_URL, 'expireTicketingOrders');
  }
);
