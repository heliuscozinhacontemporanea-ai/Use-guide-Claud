# Prompt 23.2c — Push pelo Firebase Cloud Messaging, fila de envio e resumo diário

> Lote 19, gerado dos commits de referência `6739469..ef3d953` da branch `claude/agents-md-v2`. Aplique na ordem do lote (C18, A8, 22.1, 22.2, 22.6, 23.0, 23.1, 23.2a, 23.2b, 23.2c, 23.3, 23.4, 23.5), um por vez, depois do C18. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 23.2c — Push pelo Firebase Cloud Messaging, fila de envio e resumo diário

Push da D25, com Firebase Cloud Messaging (sem fornecedor novo).

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras estão nas decisões D25 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, AGENTS.md, docs/ nem .env. Em functions/ mexa só nos arquivos listados abaixo.

O QUE MUDA:
1) O aviso e a entrada da fila de envio (notificationOutbox) são gravados juntos. Job a cada minuto (POST /internal/notifications/dispatch) envia o push no idioma de cada aparelho, tira tokens recusados e tenta de novo até 5 vezes.
2) Textos do push no servidor, espelhados dos do app (teste de paridade).
3) Parceiro com "Resumo no fim do dia" não recebe push a cada venda; às 20h (POST /internal/notifications/daily-digest) recebe o resumo.
4) Aparelhos (pushDevices, só backend): POST e DELETE /api/notifications/devices; registrado ao ativar e a cada login, removido ao sair da conta e na exclusão de conta.
5) Service worker do PWA trata o push e o toque (public/push-sw.js, workbox importScripts).
6) Cloud Functions agendadas dispatchNotifications e notificationsDailyDigest.

ARQUIVOS (crie, altere ou apague exatamente estes):
- .env.example (alterar)
- firestore.indexes.json (alterar)
- firestore.rules (alterar)
- firestore.rules.notifications.test.ts (alterar)
- functions/src/dispatchNotifications.ts (criar)
- functions/src/index.ts (alterar)
- functions/src/notificationsDailyDigest.ts (criar)
- public/push-sw.js (criar)
- server.ts (alterar)
- server/domain/notifications/adapters/fcmPushSenderAdapter.ts (criar)
- server/domain/notifications/adapters/firebaseAdminNotificationAdapter.test.ts (alterar)
- server/domain/notifications/adapters/firebaseAdminNotificationAdapter.ts (alterar)
- server/domain/notifications/adapters/firestoreNotificationOutboxAdapter.ts (criar)
- server/domain/notifications/adapters/firestorePushDeviceAdapter.ts (criar)
- server/domain/notifications/controllers/notificationController.ts (alterar)
- server/domain/notifications/factory.ts (alterar)
- server/domain/notifications/i18n/notificationTexts.ts (criar)
- server/domain/notifications/index.ts (alterar)
- server/domain/notifications/ports/notificationRepositoryPort.ts (alterar)
- server/domain/notifications/ports/pushPorts.ts (criar)
- server/domain/notifications/routes/notificationRoutes.ts (alterar)
- server/domain/notifications/schemas/notificationSchema.ts (alterar)
- server/domain/notifications/services/notificationService.test.ts (alterar)
- server/domain/notifications/services/pushDispatchService.test.ts (criar)
- server/domain/notifications/services/pushDispatchService.ts (criar)
- server/domain/notifications/types/notificationTypes.ts (alterar)
- server/domain/notifications/usecases/deleteUserNotificationsUseCase.ts (alterar)
- server/domain/notifications/usecases/dispatchPushNotificationsUseCase.ts (criar)
- server/domain/notifications/usecases/enqueueDailySalesDigestUseCase.ts (criar)
- server/domain/notifications/usecases/registerPushDeviceUseCase.ts (criar)
- server/domain/notifications/usecases/unregisterPushDeviceUseCase.ts (criar)
- server/domain/notifications/utils/renderNotificationText.test.ts (criar)
- server/domain/notifications/utils/renderNotificationText.ts (criar)
- server/domain/seo/utils/routeSeo.ts (alterar)
- server/infrastructure/firebase/adminClient.ts (alterar)
- server/interfaces/http/notifications/internalNotificationsController.ts (criar)
- server/shared/kernel/siteUrl.ts (criar)
- src/app/UsernameGate.tsx (alterar)
- src/app/menu/SideMenu.tsx (alterar)
- src/app/signOut.ts (criar)
- src/domain/notifications/adapters/fcmPushTokenAdapter.ts (criar)
- src/domain/notifications/adapters/firestoreNotificationAdapter.ts (alterar)
- src/domain/notifications/application/usecases/disablePushOnThisDeviceUseCase.ts (criar)
- src/domain/notifications/application/usecases/syncPushDeviceUseCase.ts (criar)
- src/domain/notifications/components/NotificationBell.tsx (alterar)
- src/domain/notifications/factory.ts (alterar)
- src/domain/notifications/hooks/usePushDeviceState.ts (alterar)
- src/domain/notifications/index.ts (alterar)
- src/domain/notifications/ports/notificationPort.ts (alterar)
- src/shared/i18n/notifyTypesResources.ts (alterar)
- vite.config.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== .env.example — diff ===
@@ -65,6 +65,8 @@ BOOKINGS_EXPIRATION_JOB_URL=
 BOOKINGS_COMPLETION_JOB_URL=
 PARTNERS_EXPIRING_PLANS_JOB_URL=
 PAYOUTS_RELEASE_JOB_URL=
+NOTIFICATIONS_DISPATCH_JOB_URL=
+NOTIFICATIONS_DAILY_DIGEST_JOB_URL=
 
 # Firebase Client SDK Credentials & App Check Config
 VITE_FIREBASE_API_KEY=
@@ -76,6 +78,8 @@ VITE_FIREBASE_APP_ID=
 VITE_FIREBASE_MEASUREMENT_ID=G-793FTL80F1
 VITE_FIREBASE_FIRESTORE_DATABASE_ID=
 VITE_FIREBASE_RECAPTCHA_SITE_KEY=
+# Chave pública do push (Console do Firebase › Configurações do projeto › Cloud Messaging › Certificados push da Web).
+VITE_FIREBASE_VAPID_KEY=
 
 # Firebase Server Config
 FIREBASE_PROJECT_ID=

=== firestore.indexes.json — diff ===
@@ -14,6 +14,24 @@
         }
       ]
     },
+    {
+      "collectionGroup": "notifications",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "recipientUid",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "type",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "createdAt",
+          "order": "ASCENDING"
+        }
+      ]
+    },
     {
       "collectionGroup": "reviews",
       "queryScope": "COLLECTION",

=== firestore.rules — diff ===
@@ -171,6 +171,13 @@ service cloud.firestore {
     match /notificationPreferences/{uid} {
       allow read, write: if false;
     }
+    // Aparelhos do push e fila de envio (D25): só o backend.
+    match /pushDevices/{deviceId} {
+      allow read, write: if false;
+    }
+    match /notificationOutbox/{entryId} {
+      allow read, write: if false;
+    }
     match /transactions/{transactionId} {
       allow read, write: if false;
     }

=== firestore.rules.notifications.test.ts — diff ===
@@ -60,4 +60,11 @@ describe('Firestore Rules — Notificações (D25)', () => {
     await assertFails(getDoc(doc(db, 'notificationPreferences/user-a')));
     await assertFails(setDoc(doc(db, 'notificationPreferences/user-a'), { news: true }));
   });
+
+  it('aparelhos do push e fila de envio ficam só no backend', async () => {
+    const db = testEnv.authenticatedContext('user-a').firestore();
+    await assertFails(getDoc(doc(db, 'pushDevices/d-1')));
+    await assertFails(setDoc(doc(db, 'pushDevices/d-1'), { uid: 'user-a', token: 'x' }));
+    await assertFails(getDoc(doc(db, 'notificationOutbox/n-1')));
+  });
 });

=== functions/src/dispatchNotifications.ts — ARQUIVO NOVO, conteúdo completo ===
import { defineString } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob, internalJobKey } from './callInternalJob';

const jobUrl = defineString('NOTIFICATIONS_DISPATCH_JOB_URL');

// A cada minuto: envia por push os avisos da fila (outbox, D25). O aviso já está na central.
export const dispatchNotifications = onSchedule(
  {
    schedule: '* * * * *',
    timeZone: 'America/Fortaleza',
    secrets: [internalJobKey],
  },
  async () => {
    await callInternalJob(jobUrl.value(), 'dispatchNotifications');
  }
);

=== functions/src/index.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
export { checkExpiringPlans } from './checkExpiringPlans';
export { completeBookings } from './completeBookings';
export { dispatchNotifications } from './dispatchNotifications';
export { expireBookings } from './expireBookings';
export { expireTicketingOrders } from './expireTicketingOrders';
export { notificationsDailyDigest } from './notificationsDailyDigest';
export { releasePayouts } from './releasePayouts';

=== functions/src/notificationsDailyDigest.ts — ARQUIVO NOVO, conteúdo completo ===
import { defineString } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob, internalJobKey } from './callInternalJob';

const jobUrl = defineString('NOTIFICATIONS_DAILY_DIGEST_JOB_URL');

// Às 20h: parceiros que escolheram o resumo recebem um push com as vendas do dia (D25).
export const notificationsDailyDigest = onSchedule(
  {
    schedule: '0 20 * * *',
    timeZone: 'America/Fortaleza',
    secrets: [internalJobKey],
  },
  async () => {
    await callInternalJob(jobUrl.value(), 'notificationsDailyDigest');
  }
);

=== public/push-sw.js — ARQUIVO NOVO, conteúdo completo ===
/*
 * Push do Use Guide (D25), carregado pelo service worker do PWA (workbox `importScripts`).
 * O FCM entrega o JSON com `notification` e `fcmOptions.link`; o toque abre o app na tela do aviso.
 * Referência: https://firebase.google.com/docs/cloud-messaging/js/receive
 */
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    return;
  }
  const notification = payload.notification || {};
  const link = (payload.fcmOptions && payload.fcmOptions.link) || (payload.data && payload.data.link) || '/';
  if (!notification.title) return;
  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body || '',
      icon: notification.icon || '/pwa-192x192.png',
      badge: notification.badge || '/favicon-32x32.png',
      tag: notification.tag,
      data: { link },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.link) || '/', self.location.origin);
  // Só abre páginas do próprio app (nunca um link externo vindo do payload).
  const url = target.origin === self.location.origin ? target.href : self.location.origin;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if ('focus' in client && 'navigate' in client) {
          return client.navigate(url).then((page) => (page || client).focus());
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

=== server.ts — diff ===
@@ -14,6 +14,7 @@ import insightsRouter from './server/domain/insights/routes/insightsRoutes';
 import mediaRouter from './server/domain/media/routes/mediaRoutes';
 import notificationRouter from './server/domain/notifications/routes/notificationRoutes';
 import { adminMessageRouter } from './server/interfaces/http/notifications/adminMessageRoutes';
+import { InternalNotificationsController } from './server/interfaces/http/notifications/internalNotificationsController';
 import partnerRouter from './server/domain/partners/routes/partnerRoutes';
 import { PaymentController } from './server/domain/payment/controllers/paymentController';
 import paymentRouter from './server/domain/payment/routes/paymentRoutes';
@@ -153,6 +154,16 @@ async function startServer() {
     verifyInternalJobKey,
     InternalBookingsController.complete
   );
+  app.post(
+    '/internal/notifications/dispatch',
+    verifyInternalJobKey,
+    InternalNotificationsController.dispatch
+  );
+  app.post(
+    '/internal/notifications/daily-digest',
+    verifyInternalJobKey,
+    InternalNotificationsController.dailyDigest
+  );
   app.post(
     '/internal/partners/check-expiring-plans',
     verifyInternalJobKey,

=== server/domain/notifications/adapters/fcmPushSenderAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminMessaging } from '../../../infrastructure/firebase/adminClient';
import { SITE_URL } from '../../../shared/kernel/siteUrl';
import type { PushMessage, PushSenderPort } from '../ports/pushPorts';
import type { NotificationLink } from '../types/notificationTypes';

// O menu do app abre pela URL (`?menu=<tela>`) e o painel do parceiro por `?partner=1`.
const PATHS: Record<NotificationLink['screen'], string> = {
  tickets: '/?menu=tickets',
  bookings: '/?menu=bookings',
  purchases: '/?menu=purchases',
  partner: '/?partner=1',
  item: '/?partner=1',
  event: '/?partner=1',
};

// Erros do FCM que significam "este aparelho não recebe mais": o token sai da lista.
// Referência: https://firebase.google.com/docs/cloud-messaging/manage-tokens
const INVALID_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

export class FcmPushSenderAdapter implements PushSenderPort {
  async send(tokens: string[], message: PushMessage): Promise<{ invalidTokens: string[] }> {
    if (tokens.length === 0) return { invalidTokens: [] };
    const link = `${SITE_URL}${message.link ? PATHS[message.link.screen] : '/'}`;
    const response = await adminMessaging.sendEachForMulticast({
      tokens,
      webpush: {
        notification: {
          title: message.title,
          body: message.body,
          icon: '/pwa-192x192.png',
          badge: '/favicon-32x32.png',
          tag: message.tag,
        },
        fcmOptions: { link },
      },
      data: { link },
    });
    const invalidTokens = tokens.filter((_, index) => {
      const result = response.responses[index];
      return result && !result.success && INVALID_TOKEN_CODES.has(result.error?.code ?? '');
    });
    return { invalidTokens };
  }
}

=== server/domain/notifications/adapters/firebaseAdminNotificationAdapter.test.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const doc = { id: 'k1', get: vi.fn(), update: vi.fn(), set: vi.fn() };
  const collection = { doc: vi.fn(() => doc), where: vi.fn() };
  const batch = { create: vi.fn(), commit: vi.fn() };
  return {
    doc,
    collection,
    batch,
    adminDb: {
      collection: vi.fn(() => collection),
      bulkWriter: vi.fn(),
      batch: vi.fn(() => batch),
    },
  };
});

vi.mock('../../../infrastructure/firebase/adminClient', () => ({ adminDb: mocks.adminDb }));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP') },
  Timestamp: { fromDate: vi.fn((date: Date) => ({ date })), now: vi.fn(() => 'NOW') },
}));

import { FirebaseAdminNotificationAdapter } from './firebaseAdminNotificationAdapter';

describe('FirebaseAdminNotificationAdapter', () => {
  const adapter = new FirebaseAdminNotificationAdapter();
  const expiresAt = new Date('2027-02-01T00:00:00.000Z');

  beforeEach(() => vi.clearAllMocks());

  it('não altera aviso de outra pessoa', async () => {
    mocks.doc.get.mockResolvedValue({ exists: true, get: () => 'dono' });
    expect(await adapter.markAsRead('n1', 'intruso')).toBe(false);
    expect(mocks.doc.update).not.toHaveBeenCalled();
  });

  it('grava o aviso e a entrada do push juntos, e não repete o mesmo dedupeKey', async () => {
    mocks.batch.commit.mockResolvedValueOnce(undefined);
    expect(
      await adapter.create(
        { recipientUid: 'u1', type: 'plan_expiring', params: { days: 3 }, dedupeKey: 'k1' },
        expiresAt
      )
    ).toBe(true);
    expect(mocks.collection.doc).toHaveBeenCalledWith('k1');
    expect(mocks.batch.create).toHaveBeenCalledWith(mocks.doc, {
      recipientUid: 'u1',
      type: 'plan_expiring',
      params: { days: 3 },
      link: null,
      read: false,
      createdAt: 'SERVER_TIMESTAMP',
      expiresAt: { date: expiresAt },
    });
    expect(mocks.batch.create).toHaveBeenCalledWith(
      mocks.doc,
      expect.objectContaining({ type: 'plan_expiring', attempts: 0, notBefore: 'NOW' })
    );

    mocks.batch.commit.mockRejectedValueOnce(Object.assign(new Error('exists'), { code: 6 }));
    expect(
      await adapter.create(
        { recipientUid: 'u1', type: 'plan_expiring', dedupeKey: 'k1' },
        expiresAt
      )
    ).toBe(false);
  });
});

=== server/domain/notifications/adapters/firebaseAdminNotificationAdapter.ts — diff ===
@@ -5,6 +5,8 @@ import type { NewNotification, NotificationPreferences } from '../types/notifica
 
 const NOTIFICATIONS = 'notifications';
 const PREFERENCES = 'notificationPreferences';
+const OUTBOX = 'notificationOutbox';
+const SALE_TYPES = ['sale_ticket', 'sale_booking'];
 
 function toDocument(
   data: Omit<NewNotification, 'dedupeKey'>,
@@ -21,17 +23,31 @@ function toDocument(
   };
 }
 
+/** Entrada do push (§5.6): mesma escrita do aviso, mesmo id. */
+function toOutbox(data: Omit<NewNotification, 'dedupeKey'>): Record<string, unknown> {
+  return {
+    recipientUid: data.recipientUid,
+    type: data.type,
+    params: data.params ?? {},
+    link: data.link ?? null,
+    attempts: 0,
+    notBefore: Timestamp.now(),
+    createdAt: FieldValue.serverTimestamp(),
+  };
+}
+
 export class FirebaseAdminNotificationAdapter implements NotificationRepositoryPort {
   async create(notification: NewNotification, expiresAt: Date): Promise<boolean> {
-    const collection = adminDb.collection(NOTIFICATIONS);
     const { dedupeKey, ...data } = notification;
-    if (!dedupeKey) {
-      await collection.doc().set(toDocument(data, expiresAt));
-      return true;
-    }
+    const ref = dedupeKey
+      ? adminDb.collection(NOTIFICATIONS).doc(dedupeKey)
+      : adminDb.collection(NOTIFICATIONS).doc();
+    const batch = adminDb.batch();
+    // `create` falha se o documento já existe: o mesmo aviso nunca sai duas vezes.
+    batch.create(ref, toDocument(data, expiresAt));
+    batch.create(adminDb.collection(OUTBOX).doc(ref.id), toOutbox(data));
     try {
-      // `create` falha se o documento já existe: o mesmo aviso nunca sai duas vezes.
-      await collection.doc(dedupeKey).create(toDocument(data, expiresAt));
+      await batch.commit();
       return true;
     } catch (error) {
       if ((error as { code?: number }).code === 6) return false;
@@ -46,10 +62,9 @@ export class FirebaseAdminNotificationAdapter implements NotificationRepositoryP
   ): Promise<void> {
     const writer = adminDb.bulkWriter();
     for (const recipientUid of recipientUids) {
-      writer.set(
-        adminDb.collection(NOTIFICATIONS).doc(),
-        toDocument({ ...data, recipientUid }, expiresAt)
-      );
+      const ref = adminDb.collection(NOTIFICATIONS).doc();
+      writer.set(ref, toDocument({ ...data, recipientUid }, expiresAt));
+      writer.set(adminDb.collection(OUTBOX).doc(ref.id), toOutbox({ ...data, recipientUid }));
     }
     await writer.close();
   }
@@ -103,4 +118,20 @@ export class FirebaseAdminNotificationAdapter implements NotificationRepositoryP
     writer.delete(adminDb.collection(PREFERENCES).doc(uid));
     await writer.close();
   }
+
+  async listDailySalesRecipients(): Promise<string[]> {
+    const snap = await adminDb.collection(PREFERENCES).where('salesAlerts', '==', 'daily').get();
+    return snap.docs.map((doc) => doc.id);
+  }
+
+  async countSalesSince(uid: string, since: Date): Promise<number> {
+    const snap = await adminDb
+      .collection(NOTIFICATIONS)
+      .where('recipientUid', '==', uid)
+      .where('type', 'in', SALE_TYPES)
+      .where('createdAt', '>=', Timestamp.fromDate(since))
+      .count()
+      .get();
+    return snap.data().count;
+  }
 }

=== server/domain/notifications/adapters/firestoreNotificationOutboxAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { NotificationOutboxPort, OutboxEntry } from '../ports/pushPorts';
import type { NotificationType } from '../types/notificationTypes';

const OUTBOX = 'notificationOutbox';

export class FirestoreNotificationOutboxAdapter implements NotificationOutboxPort {
  async claimDue(now: Date, limit: number, leaseMs: number): Promise<OutboxEntry[]> {
    const snap = await adminDb
      .collection(OUTBOX)
      .where('notBefore', '<=', Timestamp.fromDate(now))
      .orderBy('notBefore')
      .limit(limit)
      .get();
    const claimed: OutboxEntry[] = [];
    for (const doc of snap.docs) {
      const entry = await adminDb.runTransaction(async (tx) => {
        const fresh = await tx.get(doc.ref);
        const notBefore = fresh.get('notBefore') as Timestamp | undefined;
        if (!fresh.exists || !notBefore || notBefore.toMillis() > now.getTime()) return null;
        tx.update(doc.ref, {
          notBefore: Timestamp.fromMillis(now.getTime() + leaseMs),
        });
        const data = fresh.data() ?? {};
        return {
          id: fresh.id,
          recipientUid: String(data.recipientUid ?? ''),
          type: data.type as NotificationType,
          params: (data.params ?? {}) as OutboxEntry['params'],
          link: (data.link ?? null) as OutboxEntry['link'],
          attempts: Number(data.attempts ?? 0),
        };
      });
      if (entry) claimed.push(entry);
    }
    return claimed;
  }

  async enqueue(entry: Omit<OutboxEntry, 'attempts'>, notBefore: Date): Promise<boolean> {
    try {
      await adminDb
        .collection(OUTBOX)
        .doc(entry.id)
        .create({
          recipientUid: entry.recipientUid,
          type: entry.type,
          params: entry.params,
          link: entry.link,
          attempts: 0,
          notBefore: Timestamp.fromDate(notBefore),
          createdAt: Timestamp.now(),
        });
      return true;
    } catch (error) {
      if ((error as { code?: number }).code === 6) return false;
      throw error;
    }
  }

  async complete(id: string): Promise<void> {
    await adminDb.collection(OUTBOX).doc(id).delete();
  }

  async defer(id: string, notBefore: Date): Promise<void> {
    await adminDb
      .collection(OUTBOX)
      .doc(id)
      .update({ notBefore: Timestamp.fromDate(notBefore) });
  }

  async retryLater(id: string, attempts: number, notBefore: Date): Promise<void> {
    await adminDb
      .collection(OUTBOX)
      .doc(id)
      .update({ attempts, notBefore: Timestamp.fromDate(notBefore) });
  }

  async deleteAllForUser(uid: string): Promise<void> {
    const snap = await adminDb.collection(OUTBOX).where('recipientUid', '==', uid).get();
    const writer = adminDb.bulkWriter();
    for (const doc of snap.docs) writer.delete(doc.ref);
    await writer.close();
  }
}

=== server/domain/notifications/adapters/firestorePushDeviceAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { PushDevice, PushDevicePort } from '../ports/pushPorts';

const DEVICES = 'pushDevices';

/** O id é o hash do token: o mesmo aparelho não vira duas linhas e o token não aparece em caminhos. */
function deviceId(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export class FirestorePushDeviceAdapter implements PushDevicePort {
  async register(uid: string, token: string, locale: string): Promise<void> {
    await adminDb.collection(DEVICES).doc(deviceId(token)).set({
      uid,
      token,
      locale,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async unregister(uid: string, token: string): Promise<void> {
    const ref = adminDb.collection(DEVICES).doc(deviceId(token));
    const snap = await ref.get();
    // Só a própria conta tira o aparelho; token de outra pessoa é ignorado sem revelar nada.
    if (snap.exists && snap.get('uid') === uid) await ref.delete();
  }

  async listForUser(uid: string): Promise<PushDevice[]> {
    const snap = await adminDb.collection(DEVICES).where('uid', '==', uid).get();
    return snap.docs.map((doc) => ({
      id: doc.id,
      token: String(doc.get('token') ?? ''),
      locale: String(doc.get('locale') ?? ''),
    }));
  }

  async remove(deviceIds: string[]): Promise<void> {
    const writer = adminDb.bulkWriter();
    for (const id of deviceIds) writer.delete(adminDb.collection(DEVICES).doc(id));
    await writer.close();
  }

  async deleteAllForUser(uid: string): Promise<void> {
    const snap = await adminDb.collection(DEVICES).where('uid', '==', uid).get();
    const writer = adminDb.bulkWriter();
    for (const doc of snap.docs) writer.delete(doc.ref);
    await writer.close();
  }
}

=== server/domain/notifications/controllers/notificationController.ts — diff ===
@@ -4,10 +4,13 @@ import { NotificationDomainError } from '../errors/notificationErrors';
 import {
   notificationIdParamsSchema,
   notificationPreferencesPatchSchema,
+  pushDeviceSchema,
 } from '../schemas/notificationSchema';
 import { getNotificationPreferencesUseCase } from '../usecases/getNotificationPreferencesUseCase';
 import { markAllNotificationsAsReadUseCase } from '../usecases/markAllNotificationsAsReadUseCase';
 import { markNotificationAsReadUseCase } from '../usecases/markNotificationAsReadUseCase';
+import { registerPushDeviceUseCase } from '../usecases/registerPushDeviceUseCase';
+import { unregisterPushDeviceUseCase } from '../usecases/unregisterPushDeviceUseCase';
 import { updateNotificationPreferencesUseCase } from '../usecases/updateNotificationPreferencesUseCase';
 
 function sendError(res: Response, status: number, code: string, message: string): Response {
@@ -67,4 +70,28 @@ export class NotificationController {
       return handleError(res, error, 'updatePreferences');
     }
   }
+
+  static async registerDevice(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    const body = pushDeviceSchema.safeParse(req.body);
+    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Aparelho inválido.');
+    try {
+      await registerPushDeviceUseCase(req.user.uid, body.data.token, body.data.locale ?? '');
+      return res.status(204).send();
+    } catch (error) {
+      return handleError(res, error, 'registerDevice');
+    }
+  }
+
+  static async unregisterDevice(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    const body = pushDeviceSchema.safeParse(req.body);
+    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Aparelho inválido.');
+    try {
+      await unregisterPushDeviceUseCase(req.user.uid, body.data.token);
+      return res.status(204).send();
+    } catch (error) {
+      return handleError(res, error, 'unregisterDevice');
+    }
+  }
 }

=== server/domain/notifications/factory.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { FcmPushSenderAdapter } from './adapters/fcmPushSenderAdapter';
import { FirebaseAdminNotificationAdapter } from './adapters/firebaseAdminNotificationAdapter';
import { FirestoreNotificationOutboxAdapter } from './adapters/firestoreNotificationOutboxAdapter';
import { FirestorePushDeviceAdapter } from './adapters/firestorePushDeviceAdapter';
import { NotificationService } from './services/notificationService';
import { PushDispatchService } from './services/pushDispatchService';

const notificationRepository = new FirebaseAdminNotificationAdapter();
export const notificationOutbox = new FirestoreNotificationOutboxAdapter();
export const pushDevices = new FirestorePushDeviceAdapter();

export const notificationService = new NotificationService(notificationRepository);
export const pushDispatchService = new PushDispatchService(
  notificationOutbox,
  pushDevices,
  new FcmPushSenderAdapter(),
  notificationRepository
);

=== server/domain/notifications/i18n/notificationTexts.ts — ARQUIVO NOVO, conteúdo completo ===
/**
 * Textos do push no idioma de quem recebe (D25, §12.5). Espelho de src/shared/i18n/notifyTypesResources.ts,
 * com teste de paridade. Variantes `Generic` quando o nome não veio; plural por Intl.PluralRules.
 */
export type NotificationTypeTexts = Record<string, Record<string, string>>;

export const NOTIFICATION_TEXTS_PT_BR: NotificationTypeTexts = {
  ticket_received: {
    title: 'Você recebeu um ingresso',
    body: 'Um ingresso para {{event}} está na sua carteira.',
    bodyGeneric: 'Um ingresso novo está na sua carteira.',
  },
  ticket_returned: {
    title: 'Ingresso devolvido',
    body: 'O ingresso para {{event}} voltou para a sua carteira.',
    bodyGeneric: 'Um ingresso voltou para a sua carteira.',
  },
  ticket_link_accepted: {
    title: 'Ingresso entregue',
    body: '{{username}} recebeu o ingresso que você enviou.',
    bodyGeneric: 'O ingresso que você enviou foi recebido.',
  },
  ticket_qr_replaced: {
    title: 'QR Code trocado',
    body: 'O QR Code e o código anteriores não valem mais. Se não foi você, fale com a gente.',
  },
  event_canceled: {
    title: 'Evento cancelado',
    body: '{{event}} foi cancelado. Já pedimos o seu reembolso.',
    bodyGeneric: 'Um evento seu foi cancelado. Já pedimos o seu reembolso.',
  },
  event_postponed: {
    title: 'Evento com nova data',
    body: '{{event}} passou para {{date}}. Seu ingresso vale na nova data. Se não puder ir, peça o reembolso em até 7 dias.',
    bodyGeneric: 'Um evento seu passou para {{date}}. Seu ingresso vale na nova data. Se não puder ir, peça o reembolso em até 7 dias.',
  },
  booking_provider_arrived: {
    title: '{{business}} chegou',
    titleGeneric: 'Seu guia chegou',
    body: 'Estão esperando você no local combinado. Mostre o seu código.',
  },
  booking_no_show_marked: {
    title: 'Ausência registrada',
    body: '{{business}} registrou que você não foi. Se você estava lá, conte pra gente em Compras.',
    bodyGeneric: 'O prestador registrou que você não foi. Se você estava lá, conte pra gente em Compras.',
  },
  booking_absence_in_review: {
    title: 'Estamos analisando',
    body: '{{business}} diz que esteve no local. Respondemos em até 5 dias.',
    bodyGeneric: 'O prestador diz que esteve no local. Respondemos em até 5 dias.',
  },
  booking_absence_refunded_buyer: {
    title: 'Reembolso a caminho',
    body: 'Você recebe de volta o valor pago, com a taxa de serviço.',
  },
  booking_confirmation_asked: {
    title: 'Deu tudo certo?',
    body: 'Conte pra gente em Compras se o serviço aconteceu, em até 72 horas.',
  },
  sale_ticket: {
    title: 'Nova venda',
    body_one: '{{count}} ingresso vendido.',
    body_other: '{{count}} ingressos vendidos.',
  },
  sale_booking: {
    title: 'Nova reserva',
    body_one: '{{offer}} para {{count}} pessoa.',
    body_other: '{{offer}} para {{count}} pessoas.',
  },
  sale_claim_opened: {
    title: 'Cliente abriu uma reclamação',
    body: 'O valor desta venda fica guardado até a decisão, em até 5 dias.',
  },
  booking_absence_reported: {
    title: 'Cliente diz que você não foi',
    body: 'Responda em até 2 horas nas reservas do painel. Sem resposta, o cliente é reembolsado e vale a multa de 20%.',
  },
  booking_absence_refunded_partner: {
    title: 'Cliente reembolsado',
    body: 'Não houve resposta no prazo. O cliente foi reembolsado e vale a multa de 20%.',
  },
  booking_confirmation_denied: {
    title: 'Cliente abriu uma reclamação',
    body: 'O cliente disse que o serviço não aconteceu. O valor fica guardado até a decisão, em até 5 dias.',
  },
  booking_confirmation_refunded_partner: {
    title: 'Cliente reembolsado',
    body: 'A chegada não foi confirmada com o código e o cliente disse que o serviço não aconteceu.',
  },
  booking_confirmation_expired_partner: {
    title: 'Cliente reembolsado',
    body: 'A chegada não foi confirmada com o código e o cliente não respondeu em 72 horas.',
  },
  review_received: {
    title: 'Nova avaliação',
    body_one: '{{user}} deu {{count}} estrela para {{item}}.',
    body_other: '{{user}} deu {{count}} estrelas para {{item}}.',
  },
  review_updated: {
    title: 'Avaliação atualizada',
    body_one: '{{user}} mudou a nota de {{item}} para {{count}} estrela.',
    body_other: '{{user}} mudou a nota de {{item}} para {{count}} estrelas.',
  },
  plan_expiring: {
    title: 'Seu plano está acabando',
    body_one: 'O plano de {{listing}} termina em {{count}} dia. Renove para manter o selo.',
    body_other: 'O plano de {{listing}} termina em {{count}} dias. Renove para manter o selo.',
  },
  plan_renewal_failed: {
    title: 'Não conseguimos renovar seu plano',
    body: 'O cartão não passou. Atualize a forma de pagamento para manter o selo.',
  },
  sale_daily_digest: {
    title: 'Suas vendas de hoje',
    body_one: '{{count}} venda ou reserva hoje. Veja os detalhes no painel.',
    body_other: '{{count}} vendas ou reservas hoje. Veja os detalhes no painel.',
  },
  admin_message: {
    title: '{{title}}',
    body: '{{message}}',
  },
};

export const NOTIFICATION_TEXTS_EN: NotificationTypeTexts = {
  ticket_received: {
    title: 'You got a ticket',
    body: 'A ticket for {{event}} is in your wallet.',
    bodyGeneric: 'A new ticket is in your wallet.',
  },
  ticket_returned: {
    title: 'Ticket returned',
    body: 'The ticket for {{event}} is back in your wallet.',
    bodyGeneric: 'A ticket is back in your wallet.',
  },
  ticket_link_accepted: {
    title: 'Ticket delivered',
    body: '{{username}} got the ticket you sent.',
    bodyGeneric: 'The ticket you sent was received.',
  },
  ticket_qr_replaced: {
    title: 'QR code replaced',
    body: 'The previous QR code and code no longer work. If this wasn’t you, contact us.',
  },
  event_canceled: {
    title: 'Event canceled',
    body: '{{event}} was canceled. Your refund is on its way.',
    bodyGeneric: 'One of your events was canceled. Your refund is on its way.',
  },
  event_postponed: {
    title: 'Event has a new date',
    body: '{{event}} moved to {{date}}. Your ticket is valid on the new date. If you can’t go, ask for a refund within 7 days.',
    bodyGeneric: 'One of your events moved to {{date}}. Your ticket is valid on the new date. If you can’t go, ask for a refund within 7 days.',
  },
  booking_provider_arrived: {
    title: '{{business}} has arrived',
    titleGeneric: 'Your guide has arrived',
    body: 'They’re waiting for you at the meeting point. Show your code.',
  },
  booking_no_show_marked: {
    title: 'Marked as no-show',
    body: '{{business}} marked that you didn’t show up. If you were there, tell us in Purchases.',
    bodyGeneric: 'The provider marked that you didn’t show up. If you were there, tell us in Purchases.',
  },
  booking_absence_in_review: {
    title: 'We’re looking into it',
    body: '{{business}} says they were there. We’ll get back to you within 5 days.',
    bodyGeneric: 'The provider says they were there. We’ll get back to you within 5 days.',
  },
  booking_absence_refunded_buyer: {
    title: 'Refund on its way',
    body: 'You’ll get back what you paid, including the service fee.',
  },
  booking_confirmation_asked: {
    title: 'Did everything go well?',
    body: 'Let us know in Purchases whether the service happened, within 72 hours.',
  },
  sale_ticket: {
    title: 'New sale',
    body_one: '{{count}} ticket sold.',
    body_other: '{{count}} tickets sold.',
  },
  sale_booking: {
    title: 'New booking',
    body_one: '{{offer}} for {{count}} person.',
    body_other: '{{offer}} for {{count}} people.',
  },
  sale_claim_opened: {
    title: 'A customer opened a complaint',
    body: 'The money from this sale is held until a decision, within 5 days.',
  },
  booking_absence_reported: {
    title: 'Customer says you didn’t show up',
    body: 'Reply within 2 hours in your panel’s bookings. Without a reply, the customer is refunded and the 20% fine applies.',
  },
  booking_absence_refunded_partner: {
    title: 'Customer refunded',
    body: 'There was no reply in time. The customer was refunded and the 20% fine applies.',
  },
  booking_confirmation_denied: {
    title: 'A customer opened a complaint',
    body: 'The customer said the service didn’t happen. The money is held until a decision, within 5 days.',
  },
  booking_confirmation_refunded_partner: {
    title: 'Customer refunded',
    body: 'Arrival wasn’t confirmed with the code and the customer said the service didn’t happen.',
  },
  booking_confirmation_expired_partner: {
    title: 'Customer refunded',
    body: 'Arrival wasn’t confirmed with the code and the customer didn’t reply within 72 hours.',
  },
  review_received: {
    title: 'New review',
    body_one: '{{user}} gave {{item}} {{count}} star.',
    body_other: '{{user}} gave {{item}} {{count}} stars.',
  },
  review_updated: {
    title: 'Review updated',
    body_one: '{{user}} changed their rating of {{item}} to {{count}} star.',
    body_other: '{{user}} changed their rating of {{item}} to {{count}} stars.',
  },
  plan_expiring: {
    title: 'Your plan is ending soon',
    body_one: 'The plan for {{listing}} ends in {{count}} day. Renew to keep the badge.',
    body_other: 'The plan for {{listing}} ends in {{count}} days. Renew to keep the badge.',
  },
  plan_renewal_failed: {
    title: 'We couldn’t renew your plan',
    body: 'The card was declined. Update your payment method to keep the badge.',
  },
  sale_daily_digest: {
    title: 'Today’s sales',
    body_one: '{{count}} sale or booking today. See the details in your panel.',
    body_other: '{{count}} sales or bookings today. See the details in your panel.',
  },
  admin_message: {
    title: '{{title}}',
    body: '{{message}}',
  },
};

export const NOTIFICATION_TEXTS_FR: NotificationTypeTexts = {
  ticket_received: {
    title: 'Vous avez reçu un billet',
    body: 'Un billet pour {{event}} est dans votre portefeuille.',
    bodyGeneric: 'Un nouveau billet est dans votre portefeuille.',
  },
  ticket_returned: {
    title: 'Billet rendu',
    body: 'Le billet pour {{event}} est revenu dans votre portefeuille.',
    bodyGeneric: 'Un billet est revenu dans votre portefeuille.',
  },
  ticket_link_accepted: {
    title: 'Billet remis',
    body: '{{username}} a reçu le billet que vous avez envoyé.',
    bodyGeneric: 'Le billet que vous avez envoyé a été reçu.',
  },
  ticket_qr_replaced: {
    title: 'QR code remplacé',
    body: 'L’ancien QR code et l’ancien code ne sont plus valables. Si ce n’était pas vous, contactez-nous.',
  },
  event_canceled: {
    title: 'Événement annulé',
    body: '{{event}} a été annulé. Votre remboursement est en cours.',
    bodyGeneric: 'Un de vos événements a été annulé. Votre remboursement est en cours.',
  },
  event_postponed: {
    title: 'Nouvelle date pour l’événement',
    body: '{{event}} est reporté au {{date}}. Votre billet est valable à la nouvelle date. Si vous ne pouvez pas venir, demandez le remboursement sous 7 jours.',
    bodyGeneric: 'Un de vos événements est reporté au {{date}}. Votre billet est valable à la nouvelle date. Si vous ne pouvez pas venir, demandez le remboursement sous 7 jours.',
  },
  booking_provider_arrived: {
    title: '{{business}} est arrivé',
    titleGeneric: 'Votre guide est arrivé',
    body: 'On vous attend au point de rendez-vous. Montrez votre code.',
  },
  booking_no_show_marked: {
    title: 'Absence enregistrée',
    body: '{{business}} a indiqué que vous n’êtes pas venu. Si vous étiez là, dites-le-nous dans Achats.',
    bodyGeneric: 'Le prestataire a indiqué que vous n’êtes pas venu. Si vous étiez là, dites-le-nous dans Achats.',
  },
  booking_absence_in_review: {
    title: 'Nous examinons la situation',
    body: '{{business}} affirme avoir été sur place. Nous répondons sous 5 jours.',
    bodyGeneric: 'Le prestataire affirme avoir été sur place. Nous répondons sous 5 jours.',
  },
  booking_absence_refunded_buyer: {
    title: 'Remboursement en cours',
    body: 'Vous récupérez le montant payé, frais de service compris.',
  },
  booking_confirmation_asked: {
    title: 'Tout s’est bien passé ?',
    body: 'Dites-nous dans Achats si la prestation a eu lieu, sous 72 heures.',
  },
  sale_ticket: {
    title: 'Nouvelle vente',
    body_one: '{{count}} billet vendu.',
    body_other: '{{count}} billets vendus.',
  },
  sale_booking: {
    title: 'Nouvelle réservation',
    body_one: '{{offer}} pour {{count}} personne.',
    body_other: '{{offer}} pour {{count}} personnes.',
  },
  sale_claim_opened: {
    title: 'Un client a ouvert une réclamation',
    body: 'Le montant de cette vente est retenu jusqu’à la décision, sous 5 jours.',
  },
  booking_absence_reported: {
    title: 'Le client dit que vous n’êtes pas venu',
    body: 'Répondez sous 2 heures dans les réservations de votre espace. Sans réponse, le client est remboursé et la pénalité de 20 % s’applique.',
  },
  booking_absence_refunded_partner: {
    title: 'Client remboursé',
    body: 'Aucune réponse dans le délai. Le client a été remboursé et la pénalité de 20 % s’applique.',
  },
  booking_confirmation_denied: {
    title: 'Un client a ouvert une réclamation',
    body: 'Le client dit que la prestation n’a pas eu lieu. Le montant est retenu jusqu’à la décision, sous 5 jours.',
  },
  booking_confirmation_refunded_partner: {
    title: 'Client remboursé',
    body: 'L’arrivée n’a pas été confirmée avec le code et le client dit que la prestation n’a pas eu lieu.',
  },
  booking_confirmation_expired_partner: {
    title: 'Client remboursé',
    body: 'L’arrivée n’a pas été confirmée avec le code et le client n’a pas répondu sous 72 heures.',
  },
  review_received: {
    title: 'Nouvel avis',
    body_one: '{{user}} a donné {{count}} étoile à {{item}}.',
    body_other: '{{user}} a donné {{count}} étoiles à {{item}}.',
  },
  review_updated: {
    title: 'Avis modifié',
    body_one: '{{user}} a changé sa note pour {{item}} : {{count}} étoile.',
    body_other: '{{user}} a changé sa note pour {{item}} : {{count}} étoiles.',
  },
  plan_expiring: {
    title: 'Votre formule se termine bientôt',
    body_one: 'La formule de {{listing}} se termine dans {{count}} jour. Renouvelez-la pour garder le badge.',
    body_other: 'La formule de {{listing}} se termine dans {{count}} jours. Renouvelez-la pour garder le badge.',
  },
  plan_renewal_failed: {
    title: 'Impossible de renouveler votre formule',
    body: 'La carte a été refusée. Mettez à jour votre moyen de paiement pour garder le badge.',
  },
  sale_daily_digest: {
    title: 'Vos ventes du jour',
    body_one: '{{count}} vente ou réservation aujourd’hui. Voir le détail dans votre espace.',
    body_other: '{{count}} ventes ou réservations aujourd’hui. Voir le détail dans votre espace.',
  },
  admin_message: {
    title: '{{title}}',
    body: '{{message}}',
  },
};

=== server/domain/notifications/index.ts — diff ===
@@ -8,6 +8,8 @@ export type {
 } from './types/notificationTypes';
 export { createNotificationUseCase } from './usecases/createNotificationUseCase';
 export { deleteUserNotificationsUseCase } from './usecases/deleteUserNotificationsUseCase';
+export { dispatchPushNotificationsUseCase } from './usecases/dispatchPushNotificationsUseCase';
+export { enqueueDailySalesDigestUseCase } from './usecases/enqueueDailySalesDigestUseCase';
 export { getNotificationPreferencesUseCase } from './usecases/getNotificationPreferencesUseCase';
 export { markAllNotificationsAsReadUseCase } from './usecases/markAllNotificationsAsReadUseCase';
 export { markNotificationAsReadUseCase } from './usecases/markNotificationAsReadUseCase';

=== server/domain/notifications/ports/notificationRepositoryPort.ts — diff ===
@@ -1,7 +1,7 @@
 import type { NewNotification, NotificationPreferences } from '../types/notificationTypes';
 
 export interface NotificationRepositoryPort {
-  /** Falso quando o `dedupeKey` já existe. */
+  /** Grava o aviso e a entrada do push juntos. Falso quando o `dedupeKey` já existe. */
   create(notification: NewNotification, expiresAt: Date): Promise<boolean>;
   createMany(
     recipientUids: string[],
@@ -14,4 +14,8 @@ export interface NotificationRepositoryPort {
   getPreferences(uid: string): Promise<Partial<NotificationPreferences> | null>;
   savePreferences(uid: string, preferences: NotificationPreferences): Promise<void>;
   deleteAllForUser(uid: string): Promise<void>;
+  /** Parceiros que escolheram o resumo no fim do dia. */
+  listDailySalesRecipients(): Promise<string[]>;
+  /** Avisos de venda e reserva gravados desde `since` (para o resumo do dia). */
+  countSalesSince(uid: string, since: Date): Promise<number>;
 }

=== server/domain/notifications/ports/pushPorts.ts — ARQUIVO NOVO, conteúdo completo ===
import type {
  NotificationLink,
  NotificationParams,
  NotificationType,
} from '../types/notificationTypes';

export interface PushDevice {
  id: string;
  token: string;
  locale: string;
}

/** Aparelhos com push ligado (D25). Só o backend lê; apagados ao sair, ao excluir a conta ou se o FCM recusar. */
export interface PushDevicePort {
  register(uid: string, token: string, locale: string): Promise<void>;
  unregister(uid: string, token: string): Promise<void>;
  listForUser(uid: string): Promise<PushDevice[]>;
  remove(deviceIds: string[]): Promise<void>;
  deleteAllForUser(uid: string): Promise<void>;
}

export interface PushMessage {
  title: string;
  body: string;
  link: NotificationLink | null;
  /** Mesmo aviso substitui o anterior no aparelho em vez de empilhar. */
  tag: string;
}

export interface PushSenderPort {
  /** Devolve os tokens que o FCM recusou de vez (aparelho desinstalado, permissão retirada). */
  send(tokens: string[], message: PushMessage): Promise<{ invalidTokens: string[] }>;
}

export interface OutboxEntry {
  id: string;
  recipientUid: string;
  type: NotificationType;
  params: NotificationParams;
  link: NotificationLink | null;
  attempts: number;
}

/**
 * Fila do push (outbox, §5.6). O aviso e a entrada nascem na mesma escrita; `notBefore` serve de
 * prazo e de trava: quem pega a entrada empurra o prazo, e outra execução do job não a repete.
 */
export interface NotificationOutboxPort {
  claimDue(now: Date, limit: number, leaseMs: number): Promise<OutboxEntry[]>;
  enqueue(entry: Omit<OutboxEntry, 'attempts'>, notBefore: Date): Promise<boolean>;
  complete(id: string): Promise<void>;
  defer(id: string, notBefore: Date): Promise<void>;
  retryLater(id: string, attempts: number, notBefore: Date): Promise<void>;
  deleteAllForUser(uid: string): Promise<void>;
}

=== server/domain/notifications/routes/notificationRoutes.ts — diff ===
@@ -8,5 +8,8 @@ router.patch('/read-all', verifyAuthToken, NotificationController.markAllAsRead)
 router.patch('/:id/read', verifyAuthToken, NotificationController.markAsRead);
 router.get('/preferences', verifyAuthToken, NotificationController.getPreferences);
 router.patch('/preferences', verifyAuthToken, NotificationController.updatePreferences);
+router.post('/devices', verifyAuthToken, NotificationController.registerDevice);
+// DELETE com corpo: o token não vai na URL (AGENTS.md §7.9).
+router.delete('/devices', verifyAuthToken, NotificationController.unregisterDevice);
 
 export default router;

=== server/domain/notifications/schemas/notificationSchema.ts — diff ===
@@ -10,3 +10,11 @@ export const notificationPreferencesPatchSchema = z
   .refine((patch) => Object.keys(patch).length > 0);
 
 export const notificationIdParamsSchema = z.object({ id: z.string().trim().min(1).max(128) });
+
+// Token do FCM: string opaca de ~150–200 caracteres; o limite só barra lixo.
+export const pushDeviceSchema = z
+  .object({
+    token: z.string().trim().min(20).max(4096),
+    locale: z.string().trim().max(10).optional(),
+  })
+  .strict();

=== server/domain/notifications/services/notificationService.test.ts — diff ===
@@ -14,6 +14,8 @@ function createRepository(): NotificationRepositoryPort {
     getPreferences: vi.fn().mockResolvedValue(null),
     savePreferences: vi.fn(),
     deleteAllForUser: vi.fn(),
+    listDailySalesRecipients: vi.fn(),
+    countSalesSince: vi.fn(),
   };
 }

=== server/domain/notifications/services/pushDispatchService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationRepositoryPort } from '../ports/notificationRepositoryPort';
import type {
  NotificationOutboxPort,
  OutboxEntry,
  PushDevicePort,
  PushSenderPort,
} from '../ports/pushPorts';
import { OPTIONAL_TYPES } from '../types/notificationTypes';
import { isQuietHour, nextMorning, PushDispatchService } from './pushDispatchService';

// 15h em Fortaleza (UTC−3).
const AFTERNOON = new Date('2026-11-03T18:00:00.000Z');
const NIGHT = new Date('2026-11-04T01:30:00.000Z'); // 22h30 do dia 3 em Fortaleza

function entry(partial: Partial<OutboxEntry> = {}): OutboxEntry {
  return {
    id: 'n1',
    recipientUid: 'u1',
    type: 'ticket_received',
    params: { event: 'Luau' },
    link: { screen: 'tickets' },
    attempts: 0,
    ...partial,
  };
}

describe('PushDispatchService', () => {
  let outbox: NotificationOutboxPort;
  let devices: PushDevicePort;
  let sender: PushSenderPort;
  let repo: NotificationRepositoryPort;
  let service: PushDispatchService;

  beforeEach(() => {
    outbox = {
      claimDue: vi.fn().mockResolvedValue([entry()]),
      enqueue: vi.fn().mockResolvedValue(true),
      complete: vi.fn(),
      defer: vi.fn(),
      retryLater: vi.fn(),
      deleteAllForUser: vi.fn(),
    };
    devices = {
      register: vi.fn(),
      unregister: vi.fn(),
      listForUser: vi.fn().mockResolvedValue([
        { id: 'd1', token: 't-pt', locale: 'pt-BR' },
        { id: 'd2', token: 't-fr', locale: 'fr' },
      ]),
      remove: vi.fn(),
      deleteAllForUser: vi.fn(),
    };
    sender = { send: vi.fn().mockResolvedValue({ invalidTokens: [] }) };
    repo = {
      create: vi.fn(),
      createMany: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getPreferences: vi.fn().mockResolvedValue(null),
      savePreferences: vi.fn(),
      deleteAllForUser: vi.fn(),
      listDailySalesRecipients: vi.fn().mockResolvedValue([]),
      countSalesSince: vi.fn(),
    };
    service = new PushDispatchService(outbox, devices, sender, repo);
  });

  it('envia no idioma de cada aparelho e tira da fila', async () => {
    const result = await service.dispatch(AFTERNOON);
    expect(sender.send).toHaveBeenCalledWith(['t-pt'], {
      title: 'Você recebeu um ingresso',
      body: 'Um ingresso para Luau está na sua carteira.',
      link: { screen: 'tickets' },
      tag: 'n1',
    });
    expect(sender.send).toHaveBeenCalledWith(
      ['t-fr'],
      expect.objectContaining({ title: 'Vous avez reçu un billet' })
    );
    expect(outbox.complete).toHaveBeenCalledWith('n1');
    expect(result).toMatchObject({ sent: 1, failed: 0 });
  });

  it('avisos importantes chegam também de madrugada', async () => {
    await service.dispatch(NIGHT);
    expect(sender.send).toHaveBeenCalled();
  });

  it('tira da lista o aparelho que o FCM recusou', async () => {
    vi.mocked(sender.send).mockResolvedValueOnce({ invalidTokens: ['t-pt'] });
    await service.dispatch(AFTERNOON);
    expect(devices.remove).toHaveBeenCalledWith(['d1']);
  });

  it('parceiro com resumo diário não recebe push a cada venda (a venda fica na central)', async () => {
    vi.mocked(outbox.claimDue).mockResolvedValue([
      entry({ type: 'sale_ticket', params: { count: 1 } }),
    ]);
    vi.mocked(repo.getPreferences).mockResolvedValue({ salesAlerts: 'daily' });
    const result = await service.dispatch(AFTERNOON);
    expect(sender.send).not.toHaveBeenCalled();
    expect(result.skipped).toBe(1);
  });

  it('aviso opcional respeita a escolha e espera as 9h', async () => {
    const optional = OPTIONAL_TYPES as Record<string, 'news'>;
    optional.ticket_received = 'news';
    try {
      vi.mocked(repo.getPreferences).mockResolvedValue({ news: true });
      expect(await service.dispatch(NIGHT)).toMatchObject({ deferred: 1 });
      expect(outbox.defer).toHaveBeenCalledWith('n1', new Date('2026-11-04T12:00:00.000Z'));

      vi.mocked(repo.getPreferences).mockResolvedValue({ news: false });
      expect(await service.dispatch(AFTERNOON)).toMatchObject({ skipped: 1 });
    } finally {
      delete optional.ticket_received;
    }
  });

  it('falha no envio volta para a fila com espera crescente; na 5ª tentativa desiste', async () => {
    vi.mocked(sender.send).mockRejectedValue(new Error('fcm down'));
    await service.dispatch(AFTERNOON);
    expect(outbox.retryLater).toHaveBeenCalledWith(
      'n1',
      1,
      new Date(AFTERNOON.getTime() + 2 * 60_000)
    );
    vi.mocked(outbox.claimDue).mockResolvedValue([entry({ attempts: 4 })]);
    await service.dispatch(AFTERNOON);
    expect(outbox.complete).toHaveBeenCalledWith('n1');
  });

  it('resumo do dia conta as vendas desde 0h de Fortaleza e não repete no mesmo dia', async () => {
    vi.mocked(repo.listDailySalesRecipients).mockResolvedValue(['p1', 'p2']);
    vi.mocked(repo.countSalesSince).mockImplementation(async (uid) => (uid === 'p1' ? 3 : 0));
    const at20h = new Date('2026-11-03T23:00:00.000Z');
    expect(await service.enqueueDailySalesDigest(at20h)).toBe(1);
    expect(repo.countSalesSince).toHaveBeenCalledWith('p1', new Date('2026-11-03T03:00:00.000Z'));
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'sale_daily_digest_p1_2026-11-03',
        type: 'sale_daily_digest',
        params: { count: 3 },
      }),
      at20h
    );
  });

  it('horário de silêncio é das 21h às 9h em Fortaleza', () => {
    expect(isQuietHour(AFTERNOON)).toBe(false);
    expect(isQuietHour(NIGHT)).toBe(true);
    expect(isQuietHour(new Date('2026-11-03T11:59:00.000Z'))).toBe(true);
    expect(nextMorning(new Date('2026-11-03T10:00:00.000Z'))).toEqual(
      new Date('2026-11-03T12:00:00.000Z')
    );
  });
});

=== server/domain/notifications/services/pushDispatchService.ts — ARQUIVO NOVO, conteúdo completo ===
import type { NotificationRepositoryPort } from '../ports/notificationRepositoryPort';
import type {
  NotificationOutboxPort,
  OutboxEntry,
  PushDevicePort,
  PushSenderPort,
} from '../ports/pushPorts';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_TYPES,
  OPTIONAL_TYPES,
} from '../types/notificationTypes';
import { renderNotificationText } from '../utils/renderNotificationText';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
// America/Fortaleza é UTC−3 o ano todo, sem horário de verão (AGENTS.md §1).
const FORTALEZA_OFFSET_MS = 3 * HOUR_MS;
const BATCH = 100;
const LEASE_MS = 5 * MINUTE_MS;
const MAX_ATTEMPTS = 5;

function fortalezaHour(now: Date): number {
  return new Date(now.getTime() - FORTALEZA_OFFSET_MS).getUTCHours();
}

function fortalezaDayStart(now: Date): Date {
  const local = now.getTime() - FORTALEZA_OFFSET_MS;
  return new Date(Math.floor(local / DAY_MS) * DAY_MS + FORTALEZA_OFFSET_MS);
}

/** Avisos opcionais nunca chegam das 21h às 9h (D25, revisão). */
export function isQuietHour(now: Date): boolean {
  const hour = fortalezaHour(now);
  return hour >= 21 || hour < 9;
}

export function nextMorning(now: Date): Date {
  const nine = new Date(fortalezaDayStart(now).getTime() + 9 * HOUR_MS);
  return fortalezaHour(now) < 9 ? nine : new Date(nine.getTime() + DAY_MS);
}

export interface DispatchResult {
  sent: number;
  skipped: number;
  deferred: number;
  failed: number;
}

export class PushDispatchService {
  constructor(
    private readonly outbox: NotificationOutboxPort,
    private readonly devices: PushDevicePort,
    private readonly sender: PushSenderPort,
    private readonly notifications: NotificationRepositoryPort
  ) {}

  async dispatch(now: Date): Promise<DispatchResult> {
    const result: DispatchResult = { sent: 0, skipped: 0, deferred: 0, failed: 0 };
    for (const entry of await this.outbox.claimDue(now, BATCH, LEASE_MS)) {
      try {
        result[await this.deliver(entry, now)] += 1;
      } catch {
        result.failed += 1;
        if (entry.attempts + 1 >= MAX_ATTEMPTS) {
          await this.outbox.complete(entry.id);
        } else {
          const backoff = MINUTE_MS * 2 ** (entry.attempts + 1);
          await this.outbox.retryLater(
            entry.id,
            entry.attempts + 1,
            new Date(now.getTime() + backoff)
          );
        }
      }
    }
    return result;
  }

  private async deliver(entry: OutboxEntry, now: Date): Promise<'sent' | 'skipped' | 'deferred'> {
    const preferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...((await this.notifications.getPreferences(entry.recipientUid)) ?? {}),
    };
    const optional = OPTIONAL_TYPES[entry.type];
    const dailySales =
      NOTIFICATION_TYPES[entry.type] === 'sales' &&
      entry.type !== 'sale_daily_digest' &&
      preferences.salesAlerts === 'daily';
    if ((optional && !preferences[optional]) || dailySales) {
      await this.outbox.complete(entry.id);
      return 'skipped';
    }
    if (optional && isQuietHour(now)) {
      await this.outbox.defer(entry.id, nextMorning(now));
      return 'deferred';
    }

    const devices = await this.devices.listForUser(entry.recipientUid);
    const invalid = new Set<string>();
    const byLocale = new Map<string, string[]>();
    for (const device of devices) {
      byLocale.set(device.locale, [...(byLocale.get(device.locale) ?? []), device.token]);
    }
    for (const [locale, tokens] of byLocale) {
      const text = renderNotificationText(entry.type, entry.params, locale);
      if (!text) continue;
      const { invalidTokens } = await this.sender.send(tokens, {
        ...text,
        link: entry.link,
        tag: entry.id,
      });
      for (const token of invalidTokens) invalid.add(token);
    }
    if (invalid.size > 0) {
      await this.devices.remove(
        devices.filter((device) => invalid.has(device.token)).map((device) => device.id)
      );
    }
    await this.outbox.complete(entry.id);
    return devices.length > 0 ? 'sent' : 'skipped';
  }

  /** Às 20h, quem escolheu o resumo recebe um push com as vendas do dia (D25). */
  async enqueueDailySalesDigest(now: Date): Promise<number> {
    const since = fortalezaDayStart(now);
    const day = since.toISOString().slice(0, 10);
    let queued = 0;
    for (const uid of await this.notifications.listDailySalesRecipients()) {
      const count = await this.notifications.countSalesSince(uid, since);
      if (count === 0) continue;
      const created = await this.outbox.enqueue(
        {
          id: `sale_daily_digest_${uid}_${day}`,
          recipientUid: uid,
          type: 'sale_daily_digest',
          params: { count },
          link: { screen: 'partner' },
        },
        now
      );
      if (created) queued += 1;
    }
    return queued;
  }
}

=== server/domain/notifications/types/notificationTypes.ts — diff ===
@@ -26,11 +26,15 @@ export const NOTIFICATION_TYPES = {
   review_updated: 'partnerReviews',
   plan_expiring: 'finance',
   plan_renewal_failed: 'finance',
+  sale_daily_digest: 'sales',
   admin_message: 'messages',
 } as const;
 
 export type NotificationType = keyof typeof NOTIFICATION_TYPES;
-export type NotificationCategory = (typeof NOTIFICATION_TYPES)[NotificationType] | 'news' | 'reviews';
+export type NotificationCategory =
+  | (typeof NOTIFICATION_TYPES)[NotificationType]
+  | 'news'
+  | 'reviews';
 
 /** Dados que entram no texto traduzido. Nada de PII além do que a pessoa já vê no app. */
 export type NotificationParams = Record<string, string | number>;
@@ -65,3 +69,9 @@ export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
 
 /** Avisos somem da central depois de 90 dias (TTL do Firestore em `expiresAt`). */
 export const NOTIFICATION_RETENTION_DAYS = 90;
+
+/**
+ * Tipos opcionais (D25, revisão): só saem com a escolha ligada e nunca das 21h às 9h (Fortaleza).
+ * Hoje nenhum aviso gravado é opcional; os pedidos de avaliação e as novidades entram aqui quando existirem.
+ */
+export const OPTIONAL_TYPES: Partial<Record<NotificationType, 'reviewRequests' | 'news'>> = {};

=== server/domain/notifications/usecases/deleteUserNotificationsUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { notificationOutbox, notificationService, pushDevices } from '../factory';

/** Exclusão de conta (§7.5): avisos, escolhas, aparelhos e o que ainda ia sair por push. */
export async function deleteUserNotificationsUseCase(uid: string): Promise<void> {
  await notificationService.deleteAllForUser(uid);
  await notificationOutbox.deleteAllForUser(uid);
  await pushDevices.deleteAllForUser(uid);
}

=== server/domain/notifications/usecases/dispatchPushNotificationsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { pushDispatchService } from '../factory';
import type { DispatchResult } from '../services/pushDispatchService';

export function dispatchPushNotificationsUseCase(now = new Date()): Promise<DispatchResult> {
  return pushDispatchService.dispatch(now);
}

=== server/domain/notifications/usecases/enqueueDailySalesDigestUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { pushDispatchService } from '../factory';

export function enqueueDailySalesDigestUseCase(now = new Date()): Promise<number> {
  return pushDispatchService.enqueueDailySalesDigest(now);
}

=== server/domain/notifications/usecases/registerPushDeviceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { pushDevices } from '../factory';
import { toLocale } from '../utils/renderNotificationText';

/** Liga o push neste aparelho; o idioma vale para os textos que ele recebe (§12.5). */
export function registerPushDeviceUseCase(
  uid: string,
  token: string,
  locale: string
): Promise<void> {
  return pushDevices.register(uid, token, toLocale(locale));
}

=== server/domain/notifications/usecases/unregisterPushDeviceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { pushDevices } from '../factory';

/** Ao sair da conta neste aparelho, ele para de receber (termos de privacidade, D25). */
export function unregisterPushDeviceUseCase(uid: string, token: string): Promise<void> {
  return pushDevices.unregister(uid, token);
}

=== server/domain/notifications/utils/renderNotificationText.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import * as app from '../../../../src/shared/i18n/notifyTypesResources';
import * as server from '../i18n/notificationTexts';
import { NOTIFICATION_TYPES } from '../types/notificationTypes';
import { renderNotificationText } from './renderNotificationText';

describe('textos do push', () => {
  it('são os mesmos da central no app, nos três idiomas (paridade)', () => {
    expect(server.NOTIFICATION_TEXTS_PT_BR).toEqual(app.notifyTypesPtBR);
    expect(server.NOTIFICATION_TEXTS_EN).toEqual(app.notifyTypesEn);
    expect(server.NOTIFICATION_TEXTS_FR).toEqual(app.notifyTypesFr);
  });

  it('todo tipo do catálogo tem texto', () => {
    for (const type of Object.keys(NOTIFICATION_TYPES)) {
      expect(server.NOTIFICATION_TEXTS_PT_BR[type], type).toBeDefined();
    }
  });

  it('usa o idioma do aparelho, o plural e a versão sem nome', () => {
    expect(renderNotificationText('sale_ticket', { count: 1 }, 'fr')).toEqual({
      title: 'Nouvelle vente',
      body: '1 billet vendu.',
    });
    expect(renderNotificationText('sale_ticket', { count: 3 }, 'pt-BR')?.body).toBe(
      '3 ingressos vendidos.'
    );
    expect(renderNotificationText('booking_provider_arrived', { business: '' }, 'en')?.title).toBe(
      'Your guide has arrived'
    );
    expect(renderNotificationText('ticket_link_accepted', { username: 'ana' }, 'xx')?.body).toBe(
      '@ana recebeu o ingresso que você enviou.'
    );
  });
});

=== server/domain/notifications/utils/renderNotificationText.ts — ARQUIVO NOVO, conteúdo completo ===
import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from '../../../shared/kernel/locale';
import {
  NOTIFICATION_TEXTS_EN,
  NOTIFICATION_TEXTS_FR,
  NOTIFICATION_TEXTS_PT_BR,
  type NotificationTypeTexts,
} from '../i18n/notificationTexts';
import type { NotificationParams } from '../types/notificationTypes';

const TEXTS: Record<Locale, NotificationTypeTexts> = {
  'pt-BR': NOTIFICATION_TEXTS_PT_BR,
  en: NOTIFICATION_TEXTS_EN,
  fr: NOTIFICATION_TEXTS_FR,
};
const NAMED_PARAMS = ['event', 'business', 'username', 'listing'];
const COUNT_PARAMS = ['count', 'participants', 'rating', 'days'];
const TIME_ZONE = 'America/Fortaleza';

export function toLocale(value: unknown): Locale {
  return SUPPORTED_LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(values[key] ?? ''));
}

/**
 * Título e texto do push no idioma do aparelho, com as mesmas regras da central no app
 * (versão sem nome, @ no usuário, data no fuso do negócio e plural do idioma).
 */
export function renderNotificationText(
  type: string,
  params: NotificationParams,
  localeInput: unknown
): { title: string; body: string } | null {
  const locale = toLocale(localeInput);
  const texts = TEXTS[locale][type];
  if (!texts) return null;
  const values: Record<string, string | number> = { ...params };
  if (typeof params.username === 'string' && params.username) {
    values.username = `@${params.username}`;
  }
  if (typeof params.startsAt === 'string') {
    values.date = new Intl.DateTimeFormat(locale, {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: TIME_ZONE,
    }).format(new Date(params.startsAt));
  }
  for (const key of COUNT_PARAMS) {
    if (typeof params[key] === 'number') values.count = params[key];
  }
  const missingName = NAMED_PARAMS.some((name) => name in params && !params[name]);
  const pick = (part: 'title' | 'body'): string => {
    const generic = texts[`${part}Generic`];
    if (missingName && generic) return generic;
    const plain = texts[part];
    if (plain) return plain;
    const plural = new Intl.PluralRules(locale).select(Number(values.count ?? 0));
    return texts[`${part}_${plural}`] ?? texts[`${part}_other`] ?? '';
  };
  return { title: fill(pick('title'), values), body: fill(pick('body'), values) };
}

=== server/domain/seo/utils/routeSeo.ts — diff ===
@@ -2,7 +2,9 @@ import type { Locale } from '../../../shared/kernel/locale';
 import type { RouteKey } from '../../../shared/kernel/localizedRoutes';
 import type { SeoGuideCategory, SeoMetadata } from '../types/seoTypes';
 
-export const SITE_URL = 'https://useguide.com.br';
+import { SITE_URL } from '../../../shared/kernel/siteUrl';
+
+export { SITE_URL };
 
 export const DEFAULT_SEO_IMAGE =
   'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0788355965.firebasestorage.app/o/Marca%2F412E6CA0-01A8-48B1-B07B-BA4233C81769.png?alt=media&token=ff7e5442-a701-4854-aefc-1e36bb5fbd34';

=== server/infrastructure/firebase/adminClient.ts — diff ===
@@ -1,6 +1,7 @@
 import { getApps, initializeApp, cert, applicationDefault, type App } from 'firebase-admin/app';
 import { getAuth, type Auth } from 'firebase-admin/auth';
 import { getFirestore, type Firestore } from 'firebase-admin/firestore';
+import { getMessaging, type Messaging } from 'firebase-admin/messaging';
 import { getStorage, type Storage } from 'firebase-admin/storage';
 
 function requiredEnv(name: string): string {
@@ -52,3 +53,4 @@ export const adminDb: Firestore = lazyInstance(() =>
 );
 export const adminAuth: Auth = lazyInstance(() => getAuth(getFirebaseAdminApp()));
 export const adminStorage: Storage = lazyInstance(() => getStorage(getFirebaseAdminApp()));
+export const adminMessaging: Messaging = lazyInstance(() => getMessaging(getFirebaseAdminApp()));

=== server/interfaces/http/notifications/internalNotificationsController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Request, Response } from 'express';
import {
  dispatchPushNotificationsUseCase,
  enqueueDailySalesDigestUseCase,
} from '../../../domain/notifications';

function fail(res: Response, operation: string, error: unknown): Response {
  console.error(`[InternalNotificationsController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  // 500 de propósito: o Scheduler registra a falha e a próxima rodada tenta de novo.
  return res
    .status(500)
    .json({ error: { code: 'PUSH_JOB_FAILED', message: 'Falha ao enviar notificações.' } });
}

/** Jobs do push (Cloud Scheduler, `X-Internal-Job-Key`): fila a cada minuto e resumo às 20h. */
export class InternalNotificationsController {
  static async dispatch(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({ data: await dispatchPushNotificationsUseCase() });
    } catch (error) {
      return fail(res, 'dispatch', error);
    }
  }

  static async dailyDigest(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({ data: { queued: await enqueueDailySalesDigestUseCase() } });
    } catch (error) {
      return fail(res, 'dailyDigest', error);
    }
  }
}

=== server/shared/kernel/siteUrl.ts — ARQUIVO NOVO, conteúdo completo ===
/** Domínio canônico do app (D22, D25): links do SEO, do push e dos e-mails. */
export const SITE_URL = 'https://useguide.com.br';

=== src/app/UsernameGate.tsx — diff ===
@@ -1,4 +1,5 @@
-import { logoutUseCase, useAuthContext } from '../domain/auth';
+import { useAuthContext } from '../domain/auth';
+import { signOut } from './signOut';
 import { UsernameOnboardingDialog } from '../domain/user';
 
 /**
@@ -12,7 +13,7 @@ export function UsernameGate() {
   return (
     <UsernameOnboardingDialog
       onDone={() => void refreshProfile()}
-      onSignOut={() => void logoutUseCase()}
+      onSignOut={() => void signOut()}
     />
   );
 }

=== src/app/menu/SideMenu.tsx — diff ===
@@ -1,6 +1,7 @@
 import { AnimatePresence, motion } from 'motion/react';
 import React from 'react';
-import { hasPasswordSignInUseCase, logoutUseCase } from '../../domain/auth';
+import { hasPasswordSignInUseCase } from '../../domain/auth';
+import { signOut } from '../signOut';
 import { useAuthContext } from '../../domain/auth/context/AuthContext';
 import { UserRole } from '../../domain/auth/types/auth';
 import { MyBookingsView } from '../../domain/bookings';
@@ -145,7 +146,7 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
   };
 
   const handleLogout = async () => {
-    await logoutUseCase();
+    await signOut();
     closeMenu();
   };

=== src/app/signOut.ts — ARQUIVO NOVO, conteúdo completo ===
import { logoutUseCase } from '../domain/auth';
import { disablePushOnThisDeviceUseCase } from '../domain/notifications';

/** Sair da conta: antes, este aparelho deixa de receber os avisos dela (D25). */
export async function signOut(): Promise<void> {
  await disablePushOnThisDeviceUseCase().catch(() => undefined);
  await logoutUseCase();
}

=== src/domain/notifications/adapters/fcmPushTokenAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { deleteToken, getMessaging, getToken, isSupported } from 'firebase/messaging';
import { firebaseApp } from '../../../shared/infrastructure/firebase/firebaseApp';

/**
 * Token do push neste aparelho (FCM, D25). Usa o service worker do PWA, que trata o evento `push`
 * em /push-sw.js; sem a chave VAPID configurada, o push fica desligado sem quebrar o app.
 */
export class FcmPushTokenAdapter {
  private async messaging() {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim();
    if (!vapidKey || !(await isSupported())) return null;
    return { messaging: getMessaging(firebaseApp), vapidKey };
  }

  async getToken(): Promise<string | null> {
    const setup = await this.messaging();
    if (!setup || !('serviceWorker' in navigator)) return null;
    const registration = await navigator.serviceWorker.ready;
    return getToken(setup.messaging, {
      vapidKey: setup.vapidKey,
      serviceWorkerRegistration: registration,
    });
  }

  async deleteToken(): Promise<void> {
    const setup = await this.messaging();
    if (setup) await deleteToken(setup.messaging);
  }
}

=== src/domain/notifications/adapters/firestoreNotificationAdapter.ts — diff ===
@@ -75,4 +75,30 @@ export class FirestoreNotificationAdapter implements NotificationPort {
     );
     if (!res.ok) throw new Error('PREFERENCES_SAVE_FAILED');
   }
+
+  async registerDevice(token: string, locale: string): Promise<void> {
+    const res = await firebaseApiFetch(
+      '/api/notifications/devices',
+      {
+        method: 'POST',
+        headers: { 'Content-Type': 'application/json' },
+        body: JSON.stringify({ token, locale }),
+      },
+      { requireAuth: true }
+    );
+    if (!res.ok) throw new Error('PUSH_DEVICE_FAILED');
+  }
+
+  async unregisterDevice(token: string): Promise<void> {
+    const res = await firebaseApiFetch(
+      '/api/notifications/devices',
+      {
+        method: 'DELETE',
+        headers: { 'Content-Type': 'application/json' },
+        body: JSON.stringify({ token }),
+      },
+      { requireAuth: true }
+    );
+    if (!res.ok) throw new Error('PUSH_DEVICE_FAILED');
+  }
 }

=== src/domain/notifications/application/usecases/disablePushOnThisDeviceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { notificationAdapter, pushTokenAdapter } from '../../factory';

/** Ao sair da conta: este aparelho para de receber avisos dela (privacidade, D25). */
export async function disablePushOnThisDeviceUseCase(): Promise<void> {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const token = await pushTokenAdapter.getToken();
  if (!token) return;
  await notificationAdapter.unregisterDevice(token);
  await pushTokenAdapter.deleteToken();
}

=== src/domain/notifications/application/usecases/syncPushDeviceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { notificationAdapter, pushTokenAdapter } from '../../factory';

/**
 * Com a permissão já dada, registra (ou atualiza) este aparelho para a conta logada. Chamado ao
 * ativar e a cada login: o FCM pode trocar o token. Falso quando o push não está disponível aqui.
 */
export async function syncPushDeviceUseCase(locale: string): Promise<boolean> {
  const token = await pushTokenAdapter.getToken();
  if (!token) return false;
  await notificationAdapter.registerDevice(token, locale);
  return true;
}

=== src/domain/notifications/components/NotificationBell.tsx — diff ===
@@ -1,4 +1,6 @@
-import { useState } from 'react';
+import { useEffect, useState } from 'react';
+import { useTranslation } from 'react-i18next';
+import { syncPushDeviceUseCase } from '../application/usecases/syncPushDeviceUseCase';
 import { useNotifications } from '../hooks/useNotifications';
 import type { NotificationLink } from '../types/notification';
 import { NotificationBellButton } from './NotificationBellButton';
@@ -16,6 +18,14 @@ export function NotificationBell({ uid, onNavigate, onOpenSettings }: Notificati
   const { items, unreadCount, loading, error, retry, markAsRead, markAllAsRead } =
     useNotifications(uid);
   const [open, setOpen] = useState(false);
+  const { i18n } = useTranslation();
+
+  // Permissão já dada neste aparelho: confirma o token a cada login e quando o idioma muda.
+  // biome-ignore lint/correctness/useExhaustiveDependencies: `uid` muda no login de outra conta.
+  useEffect(() => {
+    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
+    void syncPushDeviceUseCase(i18n.language).catch(() => false);
+  }, [uid, i18n.language]);
 
   return (
     <>

=== src/domain/notifications/factory.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { FcmPushTokenAdapter } from './adapters/fcmPushTokenAdapter';
import { FirestoreNotificationAdapter } from './adapters/firestoreNotificationAdapter';
import type { NotificationPort } from './ports/notificationPort';

export const notificationAdapter: NotificationPort = new FirestoreNotificationAdapter();
export const pushTokenAdapter = new FcmPushTokenAdapter();

=== src/domain/notifications/hooks/usePushDeviceState.ts — diff ===
@@ -1,4 +1,6 @@
 import { useCallback, useState } from 'react';
+import { useTranslation } from 'react-i18next';
+import { syncPushDeviceUseCase } from '../application/usecases/syncPushDeviceUseCase';
 import type { PushDeviceState } from '../types/notificationCategories';
 
 function isAppleMobile(): boolean {
@@ -35,13 +37,18 @@ function readState(): PushDeviceState {
  * navegadores recusam pedidos de permissão sem gesto da pessoa.
  */
 export function usePushDeviceState() {
+  const { i18n } = useTranslation();
   const [state, setState] = useState<PushDeviceState>(readState);
 
   const enable = useCallback(async () => {
     if (state !== 'default') return;
-    await Notification.requestPermission();
+    const permission = await Notification.requestPermission();
     setState(readState());
-  }, [state]);
+    if (permission === 'granted') {
+      // Sem servidor alcançável o aviso continua na central; o próximo login tenta de novo.
+      await syncPushDeviceUseCase(i18n.language).catch(() => false);
+    }
+  }, [state, i18n.language]);
 
   return { state, enable };
 }

=== src/domain/notifications/index.ts — diff ===
@@ -1,3 +1,4 @@
+export { disablePushOnThisDeviceUseCase } from './application/usecases/disablePushOnThisDeviceUseCase';
 export { markAllNotificationsAsReadUseCase } from './application/usecases/markAllNotificationsAsReadUseCase';
 export { markNotificationAsReadUseCase } from './application/usecases/markNotificationAsReadUseCase';
 export { sendAdminNotificationUseCase } from './application/usecases/sendAdminNotificationUseCase';

=== src/domain/notifications/ports/notificationPort.ts — diff ===
@@ -18,4 +18,8 @@ export interface NotificationPort {
   /** Escolhas da conta logada (D25): pedidos de avaliação, novidades e avisos de venda. */
   getPreferences(): Promise<NotificationPreferences>;
   updatePreferences(patch: Partial<NotificationPreferences>): Promise<void>;
+
+  /** Liga ou desliga o push deste aparelho para a conta logada. */
+  registerDevice(token: string, locale: string): Promise<void>;
+  unregisterDevice(token: string): Promise<void>;
 }

=== src/shared/i18n/notifyTypesResources.ts — diff ===
@@ -109,6 +109,11 @@ export const notifyTypesPtBR: NotificationTypeTexts = {
     title: 'Não conseguimos renovar seu plano',
     body: 'O cartão não passou. Atualize a forma de pagamento para manter o selo.',
   },
+  sale_daily_digest: {
+    title: 'Suas vendas de hoje',
+    body_one: '{{count}} venda ou reserva hoje. Veja os detalhes no painel.',
+    body_other: '{{count}} vendas ou reservas hoje. Veja os detalhes no painel.',
+  },
   admin_message: {
     title: '{{title}}',
     body: '{{message}}',
@@ -223,6 +228,11 @@ export const notifyTypesEn: NotificationTypeTexts = {
     title: 'We couldn’t renew your plan',
     body: 'The card was declined. Update your payment method to keep the badge.',
   },
+  sale_daily_digest: {
+    title: 'Today’s sales',
+    body_one: '{{count}} sale or booking today. See the details in your panel.',
+    body_other: '{{count}} sales or bookings today. See the details in your panel.',
+  },
   admin_message: {
     title: '{{title}}',
     body: '{{message}}',
@@ -339,6 +349,11 @@ export const notifyTypesFr: NotificationTypeTexts = {
     title: 'Impossible de renouveler votre formule',
     body: 'La carte a été refusée. Mettez à jour votre moyen de paiement pour garder le badge.',
   },
+  sale_daily_digest: {
+    title: 'Vos ventes du jour',
+    body_one: '{{count}} vente ou réservation aujourd’hui. Voir le détail dans votre espace.',
+    body_other: '{{count}} ventes ou réservations aujourd’hui. Voir le détail dans votre espace.',
+  },
   admin_message: {
     title: '{{title}}',
     body: '{{message}}',

=== vite.config.ts — diff ===
@@ -65,6 +65,8 @@ export default defineConfig(() => {
           ],
         },
         workbox: {
+          // Push (D25): trata `push` e o toque na notificação (public/push-sw.js).
+          importScripts: ['/push-sw.js'],
           globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
           maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
           navigateFallbackDenylist: [/^\/__/, /^\/api/],

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run firestore.rules.notifications.test.ts functions/src/dispatchNotifications.ts functions/src/index.ts functions/src/notificationsDailyDigest.ts server.ts server/domain/notifications/adapters/fcmPushSenderAdapter.ts server/domain/notifications/adapters/firebaseAdminNotificationAdapter.test.ts server/domain/notifications/adapters/firebaseAdminNotificationAdapter.ts server/domain/notifications/adapters/firestoreNotificationOutboxAdapter.ts server/domain/notifications/adapters/firestorePushDeviceAdapter.ts server/domain/notifications/controllers/notificationController.ts server/domain/notifications/factory.ts server/domain/notifications/i18n/notificationTexts.ts server/domain/notifications/index.ts server/domain/notifications/ports/notificationRepositoryPort.ts server/domain/notifications/ports/pushPorts.ts server/domain/notifications/routes/notificationRoutes.ts server/domain/notifications/schemas/notificationSchema.ts server/domain/notifications/services/notificationService.test.ts server/domain/notifications/services/pushDispatchService.test.ts server/domain/notifications/services/pushDispatchService.ts server/domain/notifications/types/notificationTypes.ts server/domain/notifications/usecases/deleteUserNotificationsUseCase.ts server/domain/notifications/usecases/dispatchPushNotificationsUseCase.ts server/domain/notifications/usecases/enqueueDailySalesDigestUseCase.ts server/domain/notifications/usecases/registerPushDeviceUseCase.ts server/domain/notifications/usecases/unregisterPushDeviceUseCase.ts server/domain/notifications/utils/renderNotificationText.test.ts server/domain/notifications/utils/renderNotificationText.ts server/domain/seo/utils/routeSeo.ts server/infrastructure/firebase/adminClient.ts server/interfaces/http/notifications/internalNotificationsController.ts server/shared/kernel/siteUrl.ts src/app/UsernameGate.tsx src/app/menu/SideMenu.tsx src/app/signOut.ts src/domain/notifications/adapters/fcmPushTokenAdapter.ts src/domain/notifications/adapters/firestoreNotificationAdapter.ts src/domain/notifications/application/usecases/disablePushOnThisDeviceUseCase.ts src/domain/notifications/application/usecases/syncPushDeviceUseCase.ts src/domain/notifications/components/NotificationBell.tsx src/domain/notifications/factory.ts src/domain/notifications/hooks/usePushDeviceState.ts src/domain/notifications/index.ts src/domain/notifications/ports/notificationPort.ts src/shared/i18n/notifyTypesResources.ts vite.config.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Console do Firebase › Configurações do projeto › Cloud Messaging › Certificados push da Web: gere a chave e coloque em `VITE_FIREBASE_VAPID_KEY` no painel Secrets do AI Studio e no build de produção. Sem ela o app funciona, mas sem push.
2. Confirme que a API Firebase Cloud Messaging está ativa e dê à conta de serviço do Cloud Run o papel "Firebase Cloud Messaging API Admin".
3. Em functions/.env.<projeto>, preencha `NOTIFICATIONS_DISPATCH_JOB_URL=https://<serviço>.run.app/internal/notifications/dispatch` e `NOTIFICATIONS_DAILY_DIGEST_JOB_URL=https://<serviço>.run.app/internal/notifications/daily-digest` (URL *.run.app, nunca a do Hosting).
4. Publique regras e índices do Firestore (`npm run deploy:firestore`) e as funções (`npm run deploy:functions`).
5. Publique uma revisão nova do Cloud Run (`use-guide`, `us-east1`) e o Hosting com o mesmo código.
