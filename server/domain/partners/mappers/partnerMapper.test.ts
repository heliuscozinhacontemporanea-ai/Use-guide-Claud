import { describe, expect, it } from 'vitest';
import { toPartnerProfileDTO, toPublicPartnerProfileDTO } from './partnerMapper';

describe('partnerMapper', () => {
  const rawPersistenceData = {
    businesses: [
      { businessId: 'item-1', businessName: 'Restaurante Sabor', type: 'item' },
      { businessId: 'event-1', businessName: 'Festival Gastronômico', type: 'event' },
    ],
    isVerified: true,
    verifiedUntil: '2026-12-31T23:59:59.000Z',
    verificationType: 'annual',
    isVerificationSuspended: false,
    status: 'active',
    hasUsedTrial: true,
    termsAccepted: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  };

  describe('toPartnerProfileDTO', () => {
    it('deve converter dados brutos em PartnerProfileDTO', () => {
      const dto = toPartnerProfileDTO('partner-123', rawPersistenceData);

      expect(dto).toEqual({
        id: 'partner-123',
        businesses: [
          { businessId: 'item-1', businessName: 'Restaurante Sabor', type: 'item' },
          { businessId: 'event-1', businessName: 'Festival Gastronômico', type: 'event' },
        ],
        isVerified: true,
        verifiedUntil: '2026-12-31T23:59:59.000Z',
        verificationType: 'annual',
        isVerificationSuspended: false,
        status: 'active',
        hasUsedTrial: true,
        termsAccepted: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });
    });

    it.each(['invalid-status', 'pending'])('deve lançar erro se status for %s', (status) => {
      expect(() =>
        toPartnerProfileDTO('partner-123', {
          ...rawPersistenceData,
          status,
        })
      ).toThrow('Status Partner inválido persistido no Firestore.');
    });

    it('deve lançar erro se verificationType for inválido', () => {
      expect(() =>
        toPartnerProfileDTO('partner-123', {
          ...rawPersistenceData,
          verificationType: 'invalid-type',
        })
      ).toThrow('Tipo de verificação Partner inválido persistido no Firestore.');
    });

    it('deve lançar erro se business.type for inválido e nunca converter silenciosamente para item', () => {
      expect(() =>
        toPartnerProfileDTO('partner-123', {
          ...rawPersistenceData,
          businesses: [{ businessId: '1', businessName: 'Test', type: 'unknown' }],
        })
      ).toThrow('Tipo de negócio Parceiro inválido.');

      expect(() =>
        toPartnerProfileDTO('partner-123', {
          ...rawPersistenceData,
          businesses: [{ businessId: '1', businessName: 'Test', type: '' }],
        })
      ).toThrow('Tipo de negócio Parceiro inválido.');
    });
  });

  describe('toPublicPartnerProfileDTO', () => {
    it('deve lançar erro se business.type for inválido na projeção pública', () => {
      expect(() =>
        toPublicPartnerProfileDTO('partner-123', {
          ...rawPersistenceData,
          businesses: [{ businessId: '1', businessName: 'Test', type: 'corrupted' }],
        })
      ).toThrow('Tipo de negócio Parceiro inválido.');
    });

    it('deve lançar erro se status for inválido na projeção pública', () => {
      expect(() =>
        toPublicPartnerProfileDTO('partner-123', {
          ...rawPersistenceData,
          status: 'unknown_status',
        })
      ).toThrow('Status Partner inválido persistido no Firestore.');
    });

    it('deve projetar estritamente campos públicos sem vazar dados sensíveis ou de persistência', () => {
      const publicDto = toPublicPartnerProfileDTO('partner-123', rawPersistenceData);

      expect(publicDto).toEqual({
        id: 'partner-123',
        businesses: [
          { businessId: 'item-1', businessName: 'Restaurante Sabor', type: 'item' },
          { businessId: 'event-1', businessName: 'Festival Gastronômico', type: 'event' },
        ],
        isVerified: true,
        verifiedUntil: '2026-12-31T23:59:59.000Z',
        isVerificationSuspended: false,
        status: 'active',
      });

      expect(publicDto).not.toHaveProperty('termsAccepted');
      expect(publicDto).not.toHaveProperty('hasUsedTrial');
      expect(publicDto).not.toHaveProperty('verificationType');
    });
  });
});
