import { defineString } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob, internalJobKey } from './callInternalJob';

const jobUrl = defineString('PAYOUTS_RELEASE_JOB_URL');

// De hora em hora: transfere ao CNPJ os repasses cujo prazo (fim do serviço + 48 h) já passou (D14).
export const releasePayouts = onSchedule(
  {
    schedule: '0 * * * *',
    timeZone: 'America/Fortaleza',
    secrets: [internalJobKey],
  },
  async () => {
    await callInternalJob(jobUrl.value(), 'releasePayouts');
  }
);
