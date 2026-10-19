import { describe, expect, it } from 'vitest';
import { EventListingPersistenceMapper } from './eventPersistenceMappers';

const contactFields = {
  phone: '+5588999999999',
  websiteLink: 'https://evento.example',
  instagramLink: 'https://instagram.com/evento',
  bookingLink: 'https://ingressos.example',
};

describe('EventListingPersistenceMapper — contato do evento (B19)', () => {
  it('grava o contato só nos campos do topo, sem o objeto contact', () => {
    const doc = EventListingPersistenceMapper.toPersistenceCreate({
      ownerId: 'owner-1',
      name: 'Luau',
      description: 'Música ao vivo',
      images: [],
      location: 'Jericoacoara',
      ...contactFields,
    });
    expect(doc).toMatchObject(contactFields);
    expect(doc).not.toHaveProperty('contact');
  });

  it('a atualização também não grava contact', () => {
    const patch = EventListingPersistenceMapper.toPersistenceUpdate({ phone: contactFields.phone });
    expect(patch).toMatchObject({ phone: contactFields.phone });
    expect(patch).not.toHaveProperty('contact');
  });

  it('lê o contato dos campos do topo', () => {
    const listing = EventListingPersistenceMapper.toDomain('ev-1', {
      ownerId: 'owner-1',
      title: 'Luau',
      description: '',
      images: [],
      location: 'Jericoacoara',
      status: 'published',
      ...contactFields,
    });
    expect(listing).toMatchObject(contactFields);
  });
});
