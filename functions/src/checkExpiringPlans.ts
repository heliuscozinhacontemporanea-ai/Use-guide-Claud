import { defineString } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob, internalJobKey } from './callInternalJob';

// Notifica parceiros verificados cujo plano expira nos próximos 3 dias.
const jobUrl = defineString('PARTNERS_EXPIRING_PLANS_JOB_URL');

export const checkExpiringPlans = onSchedule(
  {
    schedule: '0 6 * * *',
    timeZone: 'America/Fortaleza',
    secrets: [internalJobKey],
  },
  async () => {
    await callInternalJob(jobUrl.value(), 'checkExpiringPlans');
  }
);
