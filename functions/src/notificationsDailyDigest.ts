import { defineString } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob, internalJobKey } from './callInternalJob';

const jobUrl = defineString('NOTIFICATIONS_DAILY_DIGEST_JOB_URL');

// Às 20h: parceiros que escolheram o resumo recebem um push com as vendas do dia (D25).
export const notificationsDailyDigest = onSchedule(
  {
    schedule: '0 20 * * *',
    timeZone: 'America/Sao_Paulo',
    secrets: [internalJobKey],
  },
  async () => {
    await callInternalJob(jobUrl.value(), 'notificationsDailyDigest');
  }
);
