import { describe, expect, it } from 'vitest';
import { registerPartnerSchema } from './partnerSchema';

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
});
