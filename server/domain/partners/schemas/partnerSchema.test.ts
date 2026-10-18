import { describe, expect, it } from 'vitest';
import {
  registerPartnerSchema,
  verifyPartnerSchema,
  activateTrialSchema,
  updatePartnerStatusSchema,
} from './partnerSchema';

describe('Partner Validation Schemas (Backend)', () => {
  describe('registerPartnerSchema', () => {
    it('should validate complete partner registration data', () => {
      const result = registerPartnerSchema.safeParse({
        formData: {
          category: 'hotel',
          cpfCnpj: '52998224725',
          termsAccepted: true,
        },
      });
      expect(result.success).toBe(true);
    });

    it('should fail when formData is missing', () => {
      const result = registerPartnerSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('verifyPartnerSchema', () => {
    it('aceita só a decisão do admin (conceder ou retirar o selo)', () => {
      expect(verifyPartnerSchema.safeParse({ partnerId: 'p1', isVerified: true }).success).toBe(
        true
      );
      expect(verifyPartnerSchema.safeParse({ partnerId: 'p1', isVerified: false }).success).toBe(
        true
      );
    });

    it('rejeita tipo e validade vindos do cliente: o servidor decide e preserva o plano pago', () => {
      const result = verifyPartnerSchema.safeParse({
        partnerId: 'p1',
        isVerified: true,
        verifiedUntil: '2026-12-31T23:59:59.000Z',
        verificationType: 'annual',
      });
      expect(result.success).toBe(false);
    });

    it('rejeita parceiro sem ID', () => {
      expect(verifyPartnerSchema.safeParse({ partnerId: ' ', isVerified: true }).success).toBe(
        false
      );
    });
  });
  describe('activateTrialSchema', () => {
    it('should validate trial activation with required trimmed partnerId', () => {
      const result = activateTrialSchema.safeParse({
        partnerId: '  partner_abc  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.partnerId).toBe('partner_abc');
      }
    });

    it('should fail when partnerId is missing or empty', () => {
      expect(activateTrialSchema.safeParse({}).success).toBe(false);
      expect(activateTrialSchema.safeParse({ partnerId: '   ' }).success).toBe(false);
    });
  });

  describe('updatePartnerStatusSchema', () => {
    it('should validate valid status values', () => {
      expect(
        updatePartnerStatusSchema.safeParse({ partnerId: 'p1', status: 'active' }).success
      ).toBe(true);
      expect(
        updatePartnerStatusSchema.safeParse({ partnerId: 'p1', status: 'pending' }).success
      ).toBe(true);
      expect(
        updatePartnerStatusSchema.safeParse({ partnerId: 'p1', status: 'suspended' }).success
      ).toBe(true);
    });

    it('should fail with invalid status value', () => {
      expect(
        updatePartnerStatusSchema.safeParse({ partnerId: 'p1', status: 'unknown' }).success
      ).toBe(false);
    });
  });
});
