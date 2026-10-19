# Prompt 14.1 — Cloud Functions: segredo e parâmetros; .env.example só como modelo

> Lote 7, gerado do commit de referência `9368be2` da branch `claude/agents-md-v2`. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 14.1 — Cloud Functions: segredo e parâmetros; .env.example só como modelo

Resultado da comparação do zip após o lote 6: o código está idêntico à referência e o `package-lock.json` foi corrigido. O agente fez três correções fora do escopo, todas corretas e mantidas: as regras de `events` liberam leitura ao dono e ao admin, a escuta pública de eventos ganhou os filtros que as regras exigem, e `location` não grava mais campos `undefined`. Faltavam duas coisas: nas Cloud Functions v2 um segredo só chega ao código se a função o declarar (sem isso `INTERNAL_JOB_KEY` fica vazia e os jobs falham), e o `checkExpiringPlans` quebrava no import sem `FIRESTORE_DATABASE_ID`. O `.env.example` também recebeu valores reais.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

O QUE MUDA (só em functions/ e .env.example):
1) functions/src/callInternalJob.ts: INTERNAL_JOB_KEY passa a ser `defineSecret('INTERNAL_JOB_KEY')` de firebase-functions/params; a função recebe a URL já resolvida.
2) expireTicketingOrders, expireBookings e completeBookings: declaram `secrets: [internalJobKey]` no onSchedule e leem a URL de um parâmetro `defineString(...)` (o Firebase CLI pede o valor no primeiro deploy e grava em functions/.env.<projeto>).
3) checkExpiringPlans: o Firestore é inicializado só na execução (getDb()), não no import (AGENTS.md §2.2 item 4).
4) functions/src/callInternalJob.test.ts: novo.
5) .env.example volta a ser só modelo: OFFLINE_CHECKIN_KEY_ID e as três URLs ficam vazias, com o comentário explicando onde cada valor real fica. As variáveis que você removeu porque o código não usa (STRIPE_PUBLISHABLE_KEY, STRIPE_PLATFORM_ACCOUNT_ID, TICKET_QR_PRIVATE_KEY_PEM, TICKET_QR_PUBLIC_KEY_PEM) continuam removidas.
NÃO desfaça as suas correções em firestore.rules, firestore.rules.security.test.ts, eventPersistenceMappers.ts e firebaseGuideCatalogAdapter(.test).ts.

ARQUIVOS (crie, altere ou apague exatamente estes):
- .env.example (alterar)
- functions/src/callInternalJob.test.ts (criar)
- functions/src/callInternalJob.ts (alterar)
- functions/src/checkExpiringPlans.ts (alterar)
- functions/src/completeBookings.ts (alterar)
- functions/src/expireBookings.ts (alterar)
- functions/src/expireTicketingOrders.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== .env.example — diff ===
@@ -25,12 +25,16 @@ TICKET_QR_SECRET=
 # Segredo anterior do HMAC do QR durante uma rotação (AGENTS.md §7.8); vazio fora de rotação.
 TICKET_QR_SECRET_PREVIOUS=
 OFFLINE_CHECKIN_PRIVATE_KEY_PEM=
-OFFLINE_CHECKIN_KEY_ID=use-guide-rsa-pss-v1
-# Jobs internos (Cloud Functions → Cloud Run /internal/*). Use a URL *.run.app, nunca a do Hosting.
+OFFLINE_CHECKIN_KEY_ID=
+# Jobs internos (Cloud Functions → Cloud Run /internal/*).
+# Cloud Run: INTERNAL_JOB_KEY vem do Secret Manager.
+# Functions: INTERNAL_JOB_KEY é o mesmo segredo (declarado em `secrets`); as URLs são parâmetros que o
+# Firebase CLI pede no deploy e grava em functions/.env.<projeto>. Use a URL *.run.app, nunca a do Hosting,
+# ex.: https://<serviço>.run.app/internal/bookings/expire. Este arquivo é só modelo: não grave valores reais.
 INTERNAL_JOB_KEY=
-TICKETING_EXPIRATION_JOB_URL=https://use-guide-377157973786.us-east1.run.app/internal/ticketing/expire-orders
-BOOKINGS_EXPIRATION_JOB_URL=https://use-guide-377157973786.us-east1.run.app/internal/bookings/expire
-BOOKINGS_COMPLETION_JOB_URL=https://use-guide-377157973786.us-east1.run.app/internal/bookings/complete
+TICKETING_EXPIRATION_JOB_URL=
+BOOKINGS_EXPIRATION_JOB_URL=
+BOOKINGS_COMPLETION_JOB_URL=
 
 # Firebase Client SDK Credentials & App Check Config
 VITE_FIREBASE_API_KEY=

=== functions/src/callInternalJob.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const secret = vi.hoisted(() => ({ value: 'k'.repeat(32) }));
vi.mock('firebase-functions/params', () => ({
  defineSecret: () => ({ value: () => secret.value }),
}));

import { callInternalJob } from './callInternalJob';

describe('callInternalJob', () => {
  beforeEach(() => {
    secret.value = 'k'.repeat(32);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('envia a chave do Secret Manager no header', async () => {
    await callInternalJob('https://use-guide.run.app/internal/bookings/expire', 'expireBookings');
    expect(fetch).toHaveBeenCalledWith(
      'https://use-guide.run.app/internal/bookings/expire',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-Internal-Job-Key': 'k'.repeat(32) }),
      })
    );
  });

  it('falha com mensagem clara sem URL ou sem chave', async () => {
    await expect(callInternalJob('', 'expireBookings')).rejects.toThrow('não configurado');
    secret.value = '';
    await expect(callInternalJob('https://x.run.app/internal/x', 'expireBookings')).rejects.toThrow('não configurado');
  });

  it('resposta de erro do Cloud Run vira falha do job (o Scheduler registra e tenta de novo)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(callInternalJob('https://x.run.app/internal/x', 'expireBookings')).rejects.toThrow('503');
  });
});

=== functions/src/callInternalJob.ts — diff ===
@@ -1,6 +1,14 @@
+import { defineSecret } from 'firebase-functions/params';
+
+/**
+ * Chave dos jobs internos no Secret Manager. Em Functions v2 um segredo só chega ao processo se a
+ * função o declarar em `secrets` (AGENTS.md §7.8).
+ */
+export const internalJobKey = defineSecret('INTERNAL_JOB_KEY');
+
 /** Chama uma rota /internal do Cloud Run com a chave de job (header X-Internal-Job-Key). */
-export async function callInternalJob(url: string | undefined, jobName: string): Promise<void> {
-  const key = process.env.INTERNAL_JOB_KEY;
+export async function callInternalJob(url: string, jobName: string): Promise<void> {
+  const key = internalJobKey.value();
   if (!url || !key) {
     throw new Error(`Job ${jobName} não configurado.`);
   }

=== functions/src/checkExpiringPlans.ts — diff ===
@@ -1,23 +1,30 @@
 import { initializeApp } from 'firebase-admin/app';
-import { getFirestore, FieldValue } from 'firebase-admin/firestore';
+import { type Firestore, getFirestore, FieldValue } from 'firebase-admin/firestore';
 import { onSchedule } from 'firebase-functions/v2/scheduler';
 
-initializeApp();
+let firestore: Firestore | null = null;
 
-const databaseId = process.env.FIRESTORE_DATABASE_ID?.trim();
-
-if (!databaseId) {
-  throw new Error('FIRESTORE_DATABASE_ID não configurado');
+// Inicialização preguiçosa (AGENTS.md §2.2 item 4): o deploy carrega o módulo para ler as funções,
+// e uma variável ausente não pode derrubar essa leitura.
+function getDb(): Firestore {
+  if (!firestore) {
+    const databaseId = process.env.FIRESTORE_DATABASE_ID?.trim();
+    if (!databaseId) {
+      throw new Error('FIRESTORE_DATABASE_ID não configurado');
+    }
+    initializeApp();
+    firestore = getFirestore(databaseId);
+  }
+  return firestore;
 }
 
-const db = getFirestore(databaseId);
-
 const EXPIRATION_DAYS = 30;
 const ALERT_DAYS_BEFORE = 3;
 
 export const checkExpiringPlans = onSchedule(
   { schedule: '0 6 * * *', timeZone: 'America/Fortaleza' },
   async () => {
+    const db = getDb();
     const now = new Date();
     const alertThreshold = new Date(now);
     alertThreshold.setDate(alertThreshold.getDate() + ALERT_DAYS_BEFORE);

=== functions/src/completeBookings.ts — diff ===
@@ -1,13 +1,17 @@
+import { defineString } from 'firebase-functions/params';
 import { onSchedule } from 'firebase-functions/v2/scheduler';
-import { callInternalJob } from './callInternalJob';
+import { callInternalJob, internalJobKey } from './callInternalJob';
+
+const jobUrl = defineString('BOOKINGS_COMPLETION_JOB_URL');
 
 // Marca como concluídas as reservas cujo horário já terminou.
 export const completeBookings = onSchedule(
   {
     schedule: '0 3 * * *',
     timeZone: 'America/Fortaleza',
+    secrets: [internalJobKey],
   },
   async () => {
-    await callInternalJob(process.env.BOOKINGS_COMPLETION_JOB_URL, 'completeBookings');
+    await callInternalJob(jobUrl.value(), 'completeBookings');
   }
 );

=== functions/src/expireBookings.ts — diff ===
@@ -1,13 +1,17 @@
+import { defineString } from 'firebase-functions/params';
 import { onSchedule } from 'firebase-functions/v2/scheduler';
-import { callInternalJob } from './callInternalJob';
+import { callInternalJob, internalJobKey } from './callInternalJob';
+
+const jobUrl = defineString('BOOKINGS_EXPIRATION_JOB_URL');
 
 // Devolve as vagas das reservas não pagas em 15 minutos.
 export const expireBookings = onSchedule(
   {
     schedule: '*/5 * * * *',
     timeZone: 'America/Fortaleza',
+    secrets: [internalJobKey],
   },
   async () => {
-    await callInternalJob(process.env.BOOKINGS_EXPIRATION_JOB_URL, 'expireBookings');
+    await callInternalJob(jobUrl.value(), 'expireBookings');
   }
 );

=== functions/src/expireTicketingOrders.ts — diff ===
@@ -1,12 +1,17 @@
+import { defineString } from 'firebase-functions/params';
 import { onSchedule } from 'firebase-functions/v2/scheduler';
-import { callInternalJob } from './callInternalJob';
+import { callInternalJob, internalJobKey } from './callInternalJob';
+
+// URL *.run.app do Cloud Run; o Firebase CLI pede o valor no primeiro deploy.
+const jobUrl = defineString('TICKETING_EXPIRATION_JOB_URL');
 
 export const expireTicketingOrders = onSchedule(
   {
     schedule: '*/5 * * * *',
     timeZone: 'America/Fortaleza',
+    secrets: [internalJobKey],
   },
   async () => {
-    await callInternalJob(process.env.TICKETING_EXPIRATION_JOB_URL, 'expireTicketingOrders');
+    await callInternalJob(jobUrl.value(), 'expireTicketingOrders');
   }
 );

VERIFICAÇÃO (obrigatória):
- `npx tsc -p functions/tsconfig.json --noEmit` e `npm run typecheck` sem erros; `npx biome lint .` com 0 erros.
- `npm test` → 120 arquivos, 730 testes.
- `npm run build` sem erros.

No resumo, lembre-me das ações manuais (não execute):
1. `firebase functions:secrets:set INTERNAL_JOB_KEY` (o mesmo valor do segredo usado pelo Cloud Run).
2. `firebase deploy --only functions`: responder às perguntas das três URLs com a URL *.run.app do Cloud Run.
3. FIRESTORE_DATABASE_ID das Functions em functions/.env (não é segredo).
Responda no formato do AGENTS.md §16.3.
~~~~
