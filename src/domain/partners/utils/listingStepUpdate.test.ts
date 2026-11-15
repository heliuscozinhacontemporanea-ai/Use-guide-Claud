import { describe, expect, it } from 'vitest';
import { mapItemToFormData } from '../application/mappers/partnerFormMapper';
import type { PartnerContentRecord } from '../types/partnerContent';
import { listingStepUpdate } from './listingStepUpdate';

function item(overrides: Partial<PartnerContentRecord> = {}): PartnerContentRecord {
  return {
    id: 'item-1',
    name: 'Peixada do Preá',
    category: 'restaurant',
    description: '',
    image: '',
    images: [],
    location: '',
    ownerId: 'owner-1',
    operationalInfo: { languages: ['Português'], menuLink: 'https://example.com/menu' },
    ...overrides,
  } as PartnerContentRecord;
}

describe('listingStepUpdate', () => {
  it('fotos: a primeira vira a capa', () => {
    expect(
      listingStepUpdate('photos', item(), mapItemToFormData(item()), { images: ['a', 'b'] })
    ).toEqual({
      images: ['a', 'b'],
      image: 'a',
    });
  });

  it('sobre: descrição e idiomas, sem perder o resto do operationalInfo', () => {
    const form = { ...mapItemToFormData(item()), description: ' Peixe ', languages: ['Inglês'] };
    expect(listingStepUpdate('about', item(), form)).toEqual({
      description: 'Peixe',
      operationalInfo: { languages: ['Inglês'], menuLink: 'https://example.com/menu' },
    });
  });

  it('detalhes: lista vazia só conta como respondida com "Nenhuma destas"', () => {
    const form = { ...mapItemToFormData(item()), mealTypes: ['Almoço'], additionalServices: [] };
    const unanswered = listingStepUpdate('details', item(), form);
    expect(unanswered.operationalInfo).toMatchObject({ mealTypes: ['Almoço'] });
    expect(unanswered.operationalInfo).not.toHaveProperty('additionalServices');
    const none = listingStepUpdate('details', item(), form, {
      none: new Set(['additionalServices']),
    });
    expect(none.operationalInfo).toMatchObject({ additionalServices: [] });
    // Idiomas são do passo "Sobre": os detalhes não mexem neles.
    expect(none.operationalInfo?.languages).toEqual(['Português']);
  });

  it('detalhes do restaurante: "Não tenho cardápio online" limpa o link e grava o aviso', () => {
    const update = listingStepUpdate('details', item(), mapItemToFormData(item()), {
      declined: new Set(['menu']),
    });
    expect(update.declinedLinks).toEqual(['menu']);
    expect(update.operationalInfo?.menuLink).toBe('');
  });

  it('contatos: "Não tenho" grava o aviso e mantém o que o anúncio já declarou', () => {
    const base = item({ declinedLinks: ['menu'] });
    const form = { ...mapItemToFormData(base), instagram: 'https://instagram.com/peixada' };
    expect(listingStepUpdate('contacts', base, form, { declined: new Set(['website']) })).toEqual({
      instagramLink: 'https://instagram.com/peixada',
      websiteLink: '',
      declinedLinks: ['menu', 'website'],
    });
  });

  it('onde fica: região, endereço e mapa; estado e cidade só quando válidos', () => {
    const form = {
      ...mapItemToFormData(item()),
      region: 'Praia do Preá',
      address: 'Rua da Praia, 10',
      googleMaps: 'https://maps.app.goo.gl/x',
      state: 'CE',
      city: 'Cruz',
    };
    expect(listingStepUpdate('where', item(), form)).toEqual({
      location: 'Praia do Preá',
      address: 'Rua da Praia, 10',
      googleMapsLink: 'https://maps.app.goo.gl/x',
      state: 'CE',
      city: 'Cruz',
    });
  });
});
