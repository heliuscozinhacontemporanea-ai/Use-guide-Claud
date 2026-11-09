import { defineString } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob, internalJobKey } from './callInternalJob';

// Avisa parceiros ou usuários quando uma versão grande dos termos é publicada; continua de onde parou.
const jobUrl = defineString('TERMS_ANNOUNCEMENTS_JOB_URL');

export const announceTermsUpdates = onSchedule(
  {
    schedule: '17 * * * *',
    timeZone: 'America/Sao_Paulo',
    secrets: [internalJobKey],
  },
  async () => {
    await callInternalJob(jobUrl.value(), 'announceTermsUpdates');
  }
);
