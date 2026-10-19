import { describe, expect, it } from 'vitest';
import { activateTrialSchema, registerPartnerSchema, verifyPartnerSchema } from './partnerSchema';

describe('Partner Validation Schemas (Backend)', () => {
  describe('registerPartnerSchema', () => {
    it('aceita só o aceite dos termos: o documento é do estabelecimento (D12)', () => {
      expect(registerPartnerSchema.safeParse({ formData: { termsAccepted: true } }).success).toBe(
        true
      );
    });

    it('recusa CPF/CNPJ na conta (campo extra)', () => {
      const result = registerPartnerSchema.safeParse({
        formData: { cpfCnpj: '529.982.247-25', termsAccepted: true },
      });
      expect(result.success).toBe(false);
    });

    it('should fail when termsAccepted is false', () => {
      expect(registerPartnerSchema.safeParse({ formData: { termsAccepted: false } }).success).toBe(
        false
      );
    });

    it('should fail when formData is missing', () => {
      expect(registerPartnerSchema.safeParse({}).success).toBe(false);
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
