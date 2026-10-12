/** Chama uma rota /internal do Cloud Run com a chave de job (header X-Internal-Job-Key). */
export async function callInternalJob(url: string | undefined, jobName: string): Promise<void> {
  const key = process.env.INTERNAL_JOB_KEY;
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
