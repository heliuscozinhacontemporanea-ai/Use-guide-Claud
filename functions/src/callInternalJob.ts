import { defineSecret } from 'firebase-functions/params';

/**
 * Chave dos jobs internos no Secret Manager. Em Functions v2 um segredo só chega ao processo se a
 * função o declarar em `secrets` (AGENTS.md §7.8).
 */
export const internalJobKey = defineSecret('INTERNAL_JOB_KEY');

/** Chama uma rota /internal do Cloud Run com a chave de job (header X-Internal-Job-Key). */
export async function callInternalJob(url: string, jobName: string): Promise<void> {
  const key = internalJobKey.value();
  if (!url || !key) {
    throw new Error(`Job ${jobName} não configurado.`);
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Internal-Job-Key': key },
    signal: AbortSignal.timeout(50_000),
  });
  if (!response.ok) {
    throw new Error(`Falha no job ${jobName}: ${response.status}`);
  }
}
