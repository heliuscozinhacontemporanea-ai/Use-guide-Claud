import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedUserContext } from '../../../shared/kernel/authenticatedUserContext';
import { GuideDomainError } from '../errors/guideDomainError';
import type { GuidePort } from '../ports/guidePort';
import type { GuideItemRecord } from '../types/guideTypes';
import { GuideService } from './guideService';

const partner: AuthenticatedUserContext = { uid: 'partner-1', role: 'partner', admin: false };
const admin: AuthenticatedUserContext = { uid: 'admin-1', role: 'admin', admin: true };
const intruder: AuthenticatedUserContext = { uid: 'partner-2', role: 'partner', admin: false };

const WEEK_OPEN = Object.fromEntries(
  ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'].map((day) => [
    day,
    { open: '08:00', close: '18:00', closed: false },
  ])
);

function completeRestaurant(overrides: Partial<GuideItemRecord> = {}): GuideItemRecord {
  return {
    id: 'item-1',
    ownerId: 'partner-1',
    category: 'restaurant',
    name: 'Peixada do Preá',
    state: 'CE',
    city: 'Cruz',
    image: 'https://example.com/a.jpg',
    images: ['https://example.com/a.jpg'],
    description: 'Peixe na brasa.',
    address: 'Rua da Praia, 10',
    googleMapsLink: 'https://maps.app.goo.gl/x',
    location: 'Praia do Preá',
    instagramLink: 'https://instagram.com/peixada',
    declinedLinks: ['website'],
    operationalInfo: {
      languages: ['pt'],
      cuisineType: 'Frutos do mar',
      mealTypes: ['Almoço'],
      additionalServices: [],
      amenities: [],
      operatingHours: WEEK_OPEN,
      menuLink: 'https://example.com/menu',
    },
    isActive: true,
    rating: 0,
    reviewCount: 0,
    isVerified: false,
    verifiedUntil: null,
    verificationType: null,
    isVerificationSuspended: false,
    publication: 'draft',
    ...overrides,
  };
}

function portMock(): GuidePort {
  return {
    createItem: vi.fn().mockResolvedValue('item-1'),
    updateItem: vi.fn(),
    setPublication: vi.fn(),
    deleteItem: vi.fn(),
    getItemById: vi.fn(),
    updateItemVerification: vi.fn(),
    updateReviewAggregate: vi.fn(),
    deleteResourcesByOwner: vi.fn(),
    getAllItems: vi.fn(),
    listItemsByOwner: vi.fn(),
    getItemContact: vi.fn(),
    setItemContact: vi.fn(),
    deleteItemContact: vi.fn(),
  };
}

const draftInput = {
  name: 'Pousada Brisa',
  description: '',
  image: '',
  images: [],
  location: '',
  state: 'CE' as const,
  city: 'Jijoca de Jericoacoara',
};

describe('GuideService · rascunho e publicação (D34)', () => {
  let port: GuidePort;
  let service: GuideService;

  beforeEach(() => {
    port = portMock();
    service = new GuideService(port);
  });

  it('anúncio nasce como rascunho; o perfil de produtor e a dica, publicados', async () => {
    await service.createItem(partner, { ...draftInput, category: 'hotel' });
    expect(port.createItem).toHaveBeenLastCalledWith(
      expect.objectContaining({ publication: 'draft', ownerId: 'partner-1' })
    );
    await service.createItem(partner, { ...draftInput, category: 'producer' });
    expect(port.createItem).toHaveBeenLastCalledWith(
      expect.objectContaining({ publication: 'published' })
    );
    await service.createItem(admin, { ...draftInput, category: 'sight' });
    expect(port.createItem).toHaveBeenLastCalledWith(
      expect.objectContaining({ publication: 'draft' })
    );
    await service.createItem(admin, { ...draftInput, category: 'tips' });
    expect(port.createItem).toHaveBeenLastCalledWith(
      expect.objectContaining({ publication: 'published' })
    );
  });

  it('o que o admin cadastra é do Use Guide, nunca da conta pessoal (F4)', async () => {
    for (const category of [
      'hotel',
      'restaurant',
      'sight',
      'tour',
      'transfer',
      'rental',
    ] as const) {
      await service.createItem(admin, { ...draftInput, category });
      expect(port.createItem).toHaveBeenLastCalledWith(
        expect.objectContaining({ ownerId: 'useguide', category })
      );
    }
    await expect(
      service.createItem(admin, { ...draftInput, category: 'producer' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('o admin publica o anúncio do Use Guide com o mínimo: nome, cidade, região e 1 foto', async () => {
    const minimal = completeRestaurant({
      ownerId: 'useguide',
      description: '',
      address: '',
      googleMapsLink: '',
      operationalInfo: {},
    });
    vi.mocked(port.getItemById).mockResolvedValue(minimal);
    await service.publishItem(admin, 'item-1');
    expect(port.setPublication).toHaveBeenCalledWith('item-1', 'published');
  });

  it('sem foto ou sem região, o anúncio do Use Guide não é publicado', async () => {
    vi.mocked(port.getItemById).mockResolvedValue(
      completeRestaurant({ ownerId: 'useguide', images: [], location: '' })
    );
    await expect(service.publishItem(admin, 'item-1')).rejects.toMatchObject({
      code: 'LISTING_INCOMPLETE',
      details: {
        steps: [
          { id: 'photos', missing: ['images'] },
          { id: 'where', missing: ['region'] },
        ],
      },
    });
    expect(port.setPublication).not.toHaveBeenCalled();
  });

  it('rascunho de parceiro publicado pelo admin segue a regra inteira do parceiro', async () => {
    vi.mocked(port.getItemById).mockResolvedValue(completeRestaurant({ description: '' }));
    await expect(service.publishItem(admin, 'item-1')).rejects.toMatchObject({
      code: 'LISTING_INCOMPLETE',
    });
    expect(port.setPublication).not.toHaveBeenCalled();
  });

  it('o cliente não escolhe a publicação: o valor vem só do servidor', async () => {
    const forged = { ...draftInput, category: 'hotel' as const, publication: 'published' };
    await service.createItem(partner, forged);
    expect(port.createItem).toHaveBeenLastCalledWith(
      expect.objectContaining({ publication: 'draft' })
    );
  });

  it('publicar com passos faltando é recusado com os passos e o que falta', async () => {
    vi.mocked(port.getItemById).mockResolvedValue(
      completeRestaurant({ images: [], description: '' })
    );
    const error = await service.publishItem(partner, 'item-1').catch((caught) => caught);
    expect(error).toBeInstanceOf(GuideDomainError);
    expect(error.code).toBe('LISTING_INCOMPLETE');
    expect(error.details).toEqual({
      steps: [
        { id: 'photos', missing: ['images'] },
        { id: 'about', missing: ['description'] },
      ],
    });
    expect(port.setPublication).not.toHaveBeenCalled();
  });

  it('publica o rascunho completo; publicar de novo não faz nada', async () => {
    vi.mocked(port.getItemById).mockResolvedValue(completeRestaurant());
    await service.publishItem(partner, 'item-1');
    expect(port.setPublication).toHaveBeenCalledWith('item-1', 'published');
    vi.mocked(port.getItemById).mockResolvedValue(completeRestaurant({ publication: 'published' }));
    await service.publishItem(partner, 'item-1');
    expect(port.setPublication).toHaveBeenCalledTimes(1);
  });

  it('IDOR: outro parceiro não publica o rascunho de alguém', async () => {
    vi.mocked(port.getItemById).mockResolvedValue(completeRestaurant());
    await expect(service.publishItem(intruder, 'item-1')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(port.setPublication).not.toHaveBeenCalled();
  });

  it('anúncio publicado: salvar algo que deixaria um passo incompleto é recusado', async () => {
    vi.mocked(port.getItemById).mockResolvedValue(completeRestaurant({ publication: 'published' }));
    await expect(service.updateItem(partner, 'item-1', { images: [] })).rejects.toMatchObject({
      code: 'LISTING_INCOMPLETE',
      details: { steps: [{ id: 'photos', missing: ['images'] }] },
    });
    expect(port.updateItem).not.toHaveBeenCalled();
    await service.updateItem(partner, 'item-1', { description: 'Peixe e lagosta na brasa.' });
    expect(port.updateItem).toHaveBeenCalledTimes(1);
  });

  it('anúncio publicado e já incompleto continua podendo ser salvo', async () => {
    vi.mocked(port.getItemById).mockResolvedValue(
      completeRestaurant({ publication: 'published', description: '' })
    );
    await service.updateItem(partner, 'item-1', { name: 'Peixada do Preá 2' });
    expect(port.updateItem).toHaveBeenCalledTimes(1);
  });

  it('rascunho salva livremente, mesmo tirando o que já estava preenchido', async () => {
    vi.mocked(port.getItemById).mockResolvedValue(completeRestaurant());
    await service.updateItem(partner, 'item-1', { images: [] });
    expect(port.updateItem).toHaveBeenCalledWith('item-1', { images: [] });
  });
});
