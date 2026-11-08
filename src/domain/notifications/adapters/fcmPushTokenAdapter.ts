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
