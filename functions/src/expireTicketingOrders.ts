import { defineString } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob, internalJobKey } from './callInternalJob';

// URL *.run.app do Cloud Run; o Firebase CLI pede o valor no primeiro deploy.
const jobUrl = defineString('TICKETING_EXPIRATION_JOB_URL');

export const expireTicketingOrders = onSchedule(
  {
    schedule: '*/5 * * * *',
    timeZone: 'America/Fortaleza',
    secrets: [internalJobKey],
  },
  async () => {
    await callInternalJob(jobUrl.value(), 'expireTicketingOrders');
  }
);
