import { describe, expect, it } from 'vitest';
import { activateTrialSchema, registerPartnerSchema, verifyPartnerSchema } from './partnerSchema';

describe('Partner Validation Schemas (Backend)', () => {
  describe('registerPartnerSchema', () => {
    it('should validate complete partner registration payload with valid CPF', () => {
      const result = registerPartnerSchema.safeParse({
        formData: {
          category: 'hotel',
          cpfCnpj: '123.456.789-09',
          termsAccepted: true,
        },
      });
      expect(result.success).toBe(true);
    });

    it('should validate partner registration payload with valid numeric CNPJ', () => {
      const result = registerPartnerSchema.safeParse({
        formData: {
          category: 'restaurant',
          cpfCnpj: '00.000.000/0001-91',
          termsAccepted: true,
        },
      });
      expect(result.success).toBe(true);
    });

    it('should validate partner registration payload with valid alphanumeric CNPJ', () => {
      const result = registerPartnerSchema.safeParse({
        formData: {
          category: 'sight',
          cpfCnpj: '12.ABC.345/01DE-35',
          termsAccepted: true,
        },
      });
      expect(result.success).toBe(true);
    });

    it('should fail when termsAccepted is false', () => {
      const result = registerPartnerSchema.safeParse({
        formData: {
          category: 'hotel',
          cpfCnpj: '123.456.789-09',
          termsAccepted: false,
        },
      });
      expect(result.success).toBe(false);
    });

    it('should fail when cpfCnpj is invalid', () => {
      const result = registerPartnerSchema.safeParse({
        formData: {
          category: 'hotel',
          cpfCnpj: '123.456.789-00',
          termsAccepted: true,
        },
      });
      expect(result.success).toBe(false);
    });

    it('should fail when category is invalid', () => {
      const result = registerPartnerSchema.safeParse({
        formData: {
          category: 'invalid_category',
          cpfCnpj: '123.456.789-09',
          termsAccepted: true,
        },
      });
      expect(result.success).toBe(false);
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
        partnerId: 'partner_123',
      });
      expect(result.success).toBe(true);
    });

    it('should fail when partnerId is empty or missing', () => {
      expect(activateTrialSchema.safeParse({}).success).toBe(false);
      expect(activateTrialSchema.safeParse({ partnerId: '  ' }).success).toBe(false);
    });
  });
});
