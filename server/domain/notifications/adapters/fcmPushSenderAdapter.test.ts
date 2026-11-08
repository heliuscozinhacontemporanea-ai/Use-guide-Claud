import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../infrastructure/firebase/adminClient', () => ({ adminMessaging: {} }));

import { buildFcmMulticastMessage } from './fcmPushSenderAdapter';

describe('buildFcmMulticastMessage', () => {
  it('monta o web push com ícone, tag do aviso e link absoluto da tela certa', () => {
    expect(
      buildFcmMulticastMessage(['t1', 't2'], {
        title: 'Você recebeu um ingresso',
        body: 'Um ingresso para Luau está na sua carteira.',
        link: { screen: 'tickets' },
        tag: 'n1',
      })
    ).toEqual({
      tokens: ['t1', 't2'],
      webpush: {
        notification: {
          title: 'Você recebeu um ingresso',
          body: 'Um ingresso para Luau está na sua carteira.',
          icon: '/pwa-192x192.png',
          badge: '/favicon-32x32.png',
          tag: 'n1',
        },
        fcmOptions: { link: 'https://useguide.com.br/?menu=tickets' },
      },
      data: { link: 'https://useguide.com.br/?menu=tickets' },
    });
  });

  it('aviso do parceiro abre o painel; sem destino, a página inicial', () => {
    const partner = buildFcmMulticastMessage(['t'], {
      title: 'a',
      body: 'b',
      link: { screen: 'partner' },
      tag: 'x',
    });
    expect(partner.webpush.fcmOptions.link).toBe('https://useguide.com.br/?partner=1');
    const none = buildFcmMulticastMessage(['t'], { title: 'a', body: 'b', link: null, tag: 'x' });
    expect(none.data.link).toBe('https://useguide.com.br/');
  });
});
