import { adminMessaging } from '../../../infrastructure/firebase/adminClient';
import { SITE_URL } from '../../../shared/kernel/siteUrl';
import type { PushMessage, PushSenderPort } from '../ports/pushPorts';
import type { NotificationLink } from '../types/notificationTypes';

// O menu do app abre pela URL (`?menu=<tela>`) e o painel do parceiro por `?partner=1`.
const PATHS: Record<NotificationLink['screen'], string> = {
  tickets: '/?menu=tickets',
  bookings: '/?menu=bookings',
  purchases: '/?menu=purchases',
  reviews: '/?menu=reviews',
  account: '/?menu=username',
  partner: '/?partner=1',
  item: '/?partner=1',
  event: '/?partner=1',
  promotions: '/?menu=promotions',
  terms: '/?menu=terms',
  partner_terms: '/?menu=partner-terms',
};

// Erros do FCM que significam "este aparelho não recebe mais": o token sai da lista.
// Referência: https://firebase.google.com/docs/cloud-messaging/manage-tokens
const INVALID_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

/** Mensagem do FCM para os aparelhos (web push). Separada para a simulação e os testes. */
export function buildFcmMulticastMessage(tokens: string[], message: PushMessage) {
  const link = `${SITE_URL}${message.link ? PATHS[message.link.screen] : '/'}`;
  return {
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
  };
}

export class FcmPushSenderAdapter implements PushSenderPort {
  async send(tokens: string[], message: PushMessage): Promise<{ invalidTokens: string[] }> {
    if (tokens.length === 0) return { invalidTokens: [] };
    const response = await adminMessaging.sendEachForMulticast(
      buildFcmMulticastMessage(tokens, message)
    );
    const invalidTokens = tokens.filter((_, index) => {
      const result = response.responses[index];
      return result && !result.success && INVALID_TOKEN_CODES.has(result.error?.code ?? '');
    });
    return { invalidTokens };
  }
}
