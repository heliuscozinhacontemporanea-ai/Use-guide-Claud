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
