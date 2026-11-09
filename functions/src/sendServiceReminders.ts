import { defineString } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob, internalJobKey } from './callInternalJob';

const jobUrl = defineString('NOTIFICATIONS_REMINDERS_JOB_URL');

// A cada 15 min: lembretes da véspera e de 2 h antes, e convite para avaliar depois do evento (D25).
export const sendServiceReminders = onSchedule(
  {
    schedule: '*/15 * * * *',
    timeZone: 'America/Sao_Paulo',
    secrets: [internalJobKey],
  },
  async () => {
    await callInternalJob(jobUrl.value(), 'sendServiceReminders');
  }
);
