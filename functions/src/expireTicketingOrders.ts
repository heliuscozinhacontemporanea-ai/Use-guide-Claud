import { onSchedule } from 'firebase-functions/v2/scheduler';

export const expireTicketingOrders = onSchedule(
  {
    schedule: '*/5 * * * *',
    timeZone: 'America/Fortaleza',
  },
  async () => {
    const url = process.env.TICKETING_EXPIRATION_JOB_URL;
    const key = process.env.TICKETING_EXPIRATION_JOB_KEY;
    if (!url || !key) {
      throw new Error('Job de expiração não configurado.');
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Job-Key': key,
      },
    });
    if (!response.ok) {
      throw new Error(`Falha no job de expiração: ${response.status}`);
    }
  }
);
