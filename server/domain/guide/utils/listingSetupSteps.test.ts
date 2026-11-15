import { describe, expect, it } from 'vitest';
import { type ListingSetupInput, listingSetupSteps, stepsLost } from './listingSetupSteps';

const WEEK_OPEN = Object.fromEntries(
  ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'].map((day) => [
    day,
    { open: '08:00', close: '18:00', closed: false },
  ])
);

function base(overrides: Partial<ListingSetupInput> = {}): ListingSetupInput {
  return {
    category: 'restaurant',
    name: 'Peixada do Preá',
    state: 'CE',
    city: 'Cruz',
    images: ['https://example.com/a.jpg'],
    description: 'Peixe na brasa pé na areia.',
    address: 'Rua da Praia, 10',
    googleMapsLink: 'https://maps.app.goo.gl/x',
    location: 'Praia do Preá',
    instagramLink: 'https://instagram.com/peixada',
    websiteLink: '',
    declinedLinks: ['website'],
    operationalInfo: {
      languages: ['pt'],
      cuisineType: 'Frutos do mar',
      mealTypes: ['Almoço'],
      additionalServices: [],
      amenities: ['Wi-Fi'],
      operatingHours: WEEK_OPEN,
      menuLink: 'https://example.com/menu',
    },
    ...overrides,
  };
}

const ids = (input: ListingSetupInput) => listingSetupSteps(input).map((step) => step.id);
const find = (input: ListingSetupInput, id: string) =>
  listingSetupSteps(input).find((step) => step.id === id);

describe('listingSetupSteps', () => {
  it('restaurante completo: todos os passos feitos, com Contatos e links', () => {
    const steps = listingSetupSteps(base());
    expect(steps.map((step) => step.id)).toEqual([
      'name',
      'photos',
      'about',
      'where',
      'details',
      'contacts',
    ]);
    expect(steps.every((step) => step.done)).toBe(true);
  });

  it('rascunho recém-criado: só o nome e a cidade prontos', () => {
    const steps = listingSetupSteps({
      category: 'hotel',
      name: 'Pousada Brisa',
      state: 'CE',
      city: 'Jijoca de Jericoacoara',
      images: [],
      description: '',
      location: '',
    });
    expect(steps.filter((step) => step.done).map((step) => step.id)).toEqual(['name']);
    expect(steps.find((step) => step.id === 'where')?.missing).toEqual([
      'address',
      'googleMapsLink',
      'region',
    ]);
  });

  it('"Nenhuma destas" (lista vazia) conta como respondida; ausente não', () => {
    expect(find(base(), 'details')?.done).toBe(true);
    const info = { ...base().operationalInfo, additionalServices: undefined };
    expect(find(base({ operationalInfo: info }), 'details')?.missing).toEqual(['services']);
  });

  it('horário incompleto: falta um dia ou o fechamento', () => {
    const { sábado: _s, ...sixDays } = WEEK_OPEN;
    const info = { ...base().operationalInfo, operatingHours: sixDays };
    expect(find(base({ operationalInfo: info }), 'details')?.missing).toEqual(['hours']);
    const closedSunday = {
      ...WEEK_OPEN,
      domingo: { open: '', close: '', closed: true },
    };
    const ok = { ...base().operationalInfo, operatingHours: closedSunday };
    expect(find(base({ operationalInfo: ok }), 'details')?.done).toBe(true);
  });

  it('"Não tenho": Instagram, site e cardápio podem ser declinados', () => {
    const info = { ...base().operationalInfo, menuLink: '' };
    expect(find(base({ operationalInfo: info }), 'details')?.missing).toEqual(['menu']);
    expect(
      find(base({ operationalInfo: info, declinedLinks: ['menu', 'website'] }), 'details')?.done
    ).toBe(true);
    expect(find(base({ declinedLinks: [] }), 'contacts')?.missing).toEqual(['website']);
  });

  it('quem vende pelo app não tem o passo de Contatos e links (C2)', () => {
    const tour = base({
      category: 'tour',
      operationalInfo: { languages: ['pt'], itinerary: 'Dunas e lagoa', luggageInfo: 'Água' },
    });
    expect(ids(tour)).not.toContain('contacts');
    expect(listingSetupSteps(tour).every((step) => step.done)).toBe(true);
    const paidSight = base({
      category: 'sight',
      operationalInfo: { ...base().operationalInfo, access: 'pago' },
    });
    expect(ids(paidSight)).not.toContain('contacts');
  });

  it('passeio sem "o que levar" fica com o passo de detalhes aberto', () => {
    const tour = base({
      category: 'tour',
      operationalInfo: { languages: ['pt'], itinerary: 'Dunas' },
    });
    expect(find(tour, 'details')?.missing).toEqual(['luggage']);
  });

  it('translado: em "Onde fica" só a região é obrigatória', () => {
    const transfer = base({
      category: 'transfer',
      address: '',
      googleMapsLink: '',
      operationalInfo: {
        languages: ['pt'],
        transferRoutes: [{ from: 'Fortaleza', to: 'Jeri' }],
        vehicleTypes: ['Van'],
        luggageInfo: '1 mala',
      },
    });
    expect(find(transfer, 'where')?.done).toBe(true);
    expect(find({ ...transfer, location: '' }, 'where')?.missing).toEqual(['region']);
    expect(find(base({ address: '' }), 'where')?.missing).toEqual(['address']);
  });

  it('hospedagem: café da manhã pede tipos e o preço só quando não está incluso', () => {
    const hotel = (breakfast: object, petsPolicy = 'Não', petsExtraCost?: string) =>
      base({
        category: 'hotel',
        bookingLink: 'https://example.com/reservar',
        operationalInfo: {
          languages: ['pt'],
          breakfast,
          amenities: [],
          checkIn: { from: '14:00', to: '22:00' },
          checkOut: { from: '07:00', to: '11:00' },
          childrenAllowed: true,
          petsPolicy,
          petsExtraCost,
        },
      });
    expect(find(hotel({ serves: false }), 'details')?.done).toBe(true);
    expect(
      find(hotel({ serves: true, included: true, types: ['Regional'] }), 'details')?.done
    ).toBe(true);
    expect(
      find(hotel({ serves: true, included: false, types: ['Regional'] }), 'details')?.missing
    ).toEqual(['breakfast']);
    expect(find(hotel({ serves: false }, 'Sim'), 'details')?.missing).toEqual(['pets']);
    expect(find(hotel({ serves: false }, 'Sim', 'Gratuito'), 'details')?.done).toBe(true);
  });

  it('produtor só tem o passo do nome; dica não tem passos', () => {
    expect(ids(base({ category: 'producer' }))).toEqual(['name']);
    expect(ids(base({ category: 'tips' }))).toEqual([]);
  });
});

describe('stepsLost', () => {
  it('aponta só os passos que estavam completos e deixaram de estar', () => {
    const before = listingSetupSteps(base());
    const after = listingSetupSteps(base({ images: [], instagramLink: '' }));
    expect(stepsLost(before, after).map((step) => step.id)).toEqual(['photos', 'contacts']);
    const incomplete = listingSetupSteps(base({ description: '' }));
    expect(stepsLost(incomplete, listingSetupSteps(base({ description: '' })))).toEqual([]);
  });
});
