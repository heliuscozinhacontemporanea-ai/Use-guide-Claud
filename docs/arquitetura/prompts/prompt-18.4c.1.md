# Prompt 18.4c.1 — Agendamento do job de repasse (D14)

> Lote 17, gerado do commit de referência `6d8ff33` da branch `claude/agents-md-v2`. Aplique depois do 18.4c. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4c.1 — Agendamento do job de repasse (D14)

Complemento do 18.4c: sem este agendamento, nenhum repasse é liberado.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive o arquivo novo. Não reescreva os arquivos do seu jeito. Nenhuma dependência nova.

O QUE MUDA: nova Cloud Function agendada releasePayouts (de hora em hora, fuso America/Fortaleza), no mesmo padrão de completeBookings: chama POST /internal/payouts/release do Cloud Run com o header X-Internal-Job-Key (segredo INTERNAL_JOB_KEY). A URL vem do parâmetro PAYOUTS_RELEASE_JOB_URL, documentado no .env.example.

ARQUIVOS (crie, altere ou apague exatamente estes):
- .env.example (alterar)
- functions/src/index.ts (alterar)
- functions/src/releasePayouts.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== .env.example — diff ===
@@ -44,6 +44,7 @@ TICKETING_EXPIRATION_JOB_URL=
 BOOKINGS_EXPIRATION_JOB_URL=
 BOOKINGS_COMPLETION_JOB_URL=
 PARTNERS_EXPIRING_PLANS_JOB_URL=
+PAYOUTS_RELEASE_JOB_URL=
 
 # Firebase Client SDK Credentials & App Check Config
 VITE_FIREBASE_API_KEY=

=== functions/src/index.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
export { checkExpiringPlans } from './checkExpiringPlans';
export { completeBookings } from './completeBookings';
export { expireBookings } from './expireBookings';
export { expireTicketingOrders } from './expireTicketingOrders';
export { releasePayouts } from './releasePayouts';

=== functions/src/releasePayouts.ts — ARQUIVO NOVO, conteúdo completo ===
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

VERIFICAÇÃO (obrigatória):
- `cd functions && npx tsc --noEmit` sem erros;
- `npm run typecheck` e `npm run build` na raiz;
- `npx vitest run functions` (todos verdes; a função nova segue o padrão de completeBookings, que não tem teste próprio).

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Faça o deploy das Functions: `npm run deploy:functions`. O Firebase CLI pede o parâmetro PAYOUTS_RELEASE_JOB_URL: informe a URL *.run.app do serviço use-guide seguida de /internal/payouts/release (ex.: https://use-guide-xxxx.us-east1.run.app/internal/payouts/release). Nunca a URL do Hosting. O CLI grava o valor em functions/.env.<projeto>.
2. O segredo INTERNAL_JOB_KEY já existe (o mesmo das outras funções agendadas); não crie outro.
3. Confira no Console do Google Cloud → Cloud Scheduler que o job firebase-schedule-releasePayouts-us-central1 (ou da sua região) aparece com frequência 0 * * * *, e use "Forçar execução" uma vez: o log da função deve mostrar resposta 200.
