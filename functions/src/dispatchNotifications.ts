import { defineString } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob, internalJobKey } from './callInternalJob';

const jobUrl = defineString('NOTIFICATIONS_DISPATCH_JOB_URL');

// A cada minuto: envia por push os avisos da fila (outbox, D25). O aviso já está na central.
export const dispatchNotifications = onSchedule(
  {
    schedule: '* * * * *',
    timeZone: 'America/Sao_Paulo',
    secrets: [internalJobKey],
  },
  async () => {
    await callInternalJob(jobUrl.value(), 'dispatchNotifications');
  }
);
