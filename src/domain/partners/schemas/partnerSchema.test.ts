import { describe, expect, it } from 'vitest';
import {
  partnerSubmissionSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step5SchemaContext,
  updatePartnerStatusSchema,
  updatePartnerVerificationSchema,
} from './partnerSchema';

// Valid CPF with correct checksum: 52998224725 / 529.982.247-25
// Valid CNPJ with correct checksum: 00000000000191 / 00.000.000/0001-91
const VALID_TEST_CPF = '529.982.247-25';
const VALID_TEST_CNPJ = '00.000.000/0001-91';
const INVALID_TEST_CPF = '111.111.111-11';
const INVALID_TEST_CNPJ = '12.345.678/0001-00';

describe('Partner Validation Schemas (Frontend)', () => {
  describe('CPF/CNPJ e Categoria (step1Schema)', () => {
    it('deve validar hotel com CPF/CNPJ válido (CNPJ)', () => {
      const result = step1Schema.safeParse({
        category: 'hotel',
        businessName: 'Pousada Sol & Mar',
        cpfCnpj: VALID_TEST_CNPJ,
        description: 'Uma linda pousada em Jericoacoara com vista para o mar.',
      });
      expect(result.success).toBe(true);
    });

    it('deve validar hotel com CPF/CNPJ válido (CPF)', () => {
      const result = step1Schema.safeParse({
        category: 'hotel',
        businessName: 'Pousada Sol & Mar',
        cpfCnpj: VALID_TEST_CPF,
        description: 'Uma linda pousada em Jericoacoara com vista para o mar.',
      });
      expect(result.success).toBe(true);
    });

    it('deve falhar quando CPF/CNPJ for inválido (CPF ou CNPJ com formato/checksum incorreto)', () => {
      const resultCpf = step1Schema.safeParse({
        category: 'hotel',
        businessName: 'Pousada Sol & Mar',
        cpfCnpj: INVALID_TEST_CPF,
        description: 'Descrição válida',
      });
      expect(resultCpf.success).toBe(false);

      const resultCnpj = step1Schema.safeParse({
        category: 'hotel',
        businessName: 'Pousada Sol & Mar',
        cpfCnpj: INVALID_TEST_CNPJ,
        description: 'Descrição válida',
      });
      expect(resultCnpj.success).toBe(false);
    });

    it('deve falhar quando a categoria for vazia', () => {
      const result = step1Schema.safeParse({
        category: '',
        businessName: 'Pousada Sol & Mar',
        cpfCnpj: VALID_TEST_CNPJ,
        description: 'Descrição válida',
      });
      expect(result.success).toBe(false);
    });

    it('deve aceitar categorias válidas: hotel, restaurant, sight, tour, event', () => {
      for (const category of ['hotel', 'restaurant', 'sight', 'tour']) {
        const res = step1Schema.safeParse({
          category,
          businessName: 'Empresa Teste',
          cpfCnpj: VALID_TEST_CPF,
          description: 'Descrição válida do estabelecimento',
        });
        expect(res.success).toBe(true);
      }

      const resEvent = step1Schema.safeParse({
        category: 'event',
        businessName: '',
        cpfCnpj: VALID_TEST_CPF,
        description: '',
      });
      expect(resEvent.success).toBe(true);
    });
  });

  describe('step2Schema', () => {
    it('deve validar dados de contato do hotel com booking link e google maps', () => {
      const result = step2Schema.safeParse({
        category: 'hotel',
        phone: '(85) 98888-8888',
        phoneDdi: '+55',
        googleMaps: 'https://maps.google.com/?q=Jericoacoara',
        region: 'Jericoacoara',
        bookingLinks: 'https://booking.com/hotel-test',
        website: 'https://hoteltest.com',
        instagram: '@hoteltest',
        address: 'Rua Principal, 100',
      });
      expect(result.success).toBe(true);
    });

    it('deve falhar quando o hotel não tiver booking link', () => {
      const result = step2Schema.safeParse({
        category: 'hotel',
        phone: '(85) 98888-8888',
        googleMaps: 'https://maps.google.com/?q=Jericoacoara',
        region: 'Jericoacoara',
        bookingLinks: '',
      });
      expect(result.success).toBe(false);
    });

    it('deve falhar quando telefone for vazio', () => {
      const result = step2Schema.safeParse({
        category: 'hotel',
        phone: '',
        googleMaps: 'https://maps.google.com/?q=Jericoacoara',
        region: 'Jericoacoara',
        bookingLinks: 'https://booking.com/hotel-test',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('step3Schema', () => {
    it('deve validar configurações de café da manhã do hotel', () => {
      const result = step3Schema.safeParse({
        category: 'hotel',
        servesBreakfast: true,
        breakfastIncluded: true,
        breakfastPrice: '',
        amenities: ['Wi-Fi Grátis', 'Piscina'],
      });
      expect(result.success).toBe(true);
    });

    it('deve validar subcategoria e tipo de cozinha de restaurante', () => {
      const result = step3Schema.safeParse({
        category: 'restaurant',
        subcategory: 'Restaurante Típico',
        cuisineType: 'Frutos do Mar',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('termsAccepted e Contexto de Cadastro (step5SchemaContext)', () => {
    it('deve validar novo parceiro com termos aceitos e senha', () => {
      const schema = step5SchemaContext({
        currentUser: null,
      });

      const result = schema.safeParse({
        termsAccepted: true,
        images: [{ file: new File([], 'test.jpg'), id: '1', preview: 'blob:test' }],
        category: 'hotel',
        firstName: 'Carlos',
        lastName: 'Ferreira',
        email: 'carlos@hotel.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });
      expect(result.success).toBe(true);
    });

    it('termsAccepted false: deve falhar quando termos não forem aceitos pelo novo parceiro', () => {
      const schema = step5SchemaContext({
        currentUser: null,
      });

      const result = schema.safeParse({
        termsAccepted: false,
        images: [{ file: new File([], 'test.jpg'), id: '1', preview: 'blob:test' }],
        category: 'hotel',
        firstName: 'Carlos',
        lastName: 'Ferreira',
        email: 'carlos@hotel.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });
      expect(result.success).toBe(false);
    });

    it('deve permitir cadastro sem senha se houver sessão de usuário existente (currentUser)', () => {
      const schema = step5SchemaContext({
        currentUser: { uid: 'user_123', email: 'carlos@hotel.com' } as any,
      });

      const result = schema.safeParse({
        termsAccepted: true,
        images: [{ file: new File([], 'test.jpg'), id: '1', preview: 'blob:test' }],
        category: 'hotel',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Partner DTO Schemas', () => {
    it('deve validar partnerSubmissionSchema com campos completos', () => {
      const result = partnerSubmissionSchema.safeParse({
        businessName: 'Pousada Sol',
        category: 'hotel',
        phone: '85988888888',
        termsAccepted: true,
        cpfCnpj: VALID_TEST_CNPJ,
      });
      expect(result.success).toBe(true);
    });

    it('deve rejeitar partnerSubmissionSchema com categoria inválida ou termos false', () => {
      const resultCategory = partnerSubmissionSchema.safeParse({
        businessName: 'Pousada Sol',
        category: 'invalid-cat',
        phone: '85988888888',
        termsAccepted: true,
        cpfCnpj: VALID_TEST_CNPJ,
      });
      expect(resultCategory.success).toBe(false);

      const resultTerms = partnerSubmissionSchema.safeParse({
        businessName: 'Pousada Sol',
        category: 'hotel',
        phone: '85988888888',
        termsAccepted: false,
        cpfCnpj: VALID_TEST_CNPJ,
      });
      expect(resultTerms.success).toBe(false);
    });

    it('deve validar updatePartnerStatusSchema', () => {
      const result = updatePartnerStatusSchema.safeParse({
        partnerId: 'partner-123',
        status: 'suspended',
      });
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('suspended');
    });

    it('deve validar updatePartnerVerificationSchema quando verificado e com tipo válido', () => {
      const result = updatePartnerVerificationSchema.safeParse({
        partnerId: 'partner-123',
        isVerified: true,
        verifiedUntil: '2027-01-01T00:00:00.000Z',
        verificationType: 'annual',
      });
      expect(result.success).toBe(true);
    });

    it('updatePartnerVerificationSchema: deve falhar quando isVerified=true sem verifiedUntil ou sem verificationType', () => {
      const missingDate = updatePartnerVerificationSchema.safeParse({
        partnerId: 'partner-123',
        isVerified: true,
        verifiedUntil: null,
        verificationType: 'monthly',
      });
      expect(missingDate.success).toBe(false);

      const missingType = updatePartnerVerificationSchema.safeParse({
        partnerId: 'partner-123',
        isVerified: true,
        verifiedUntil: '2027-01-01T00:00:00.000Z',
        verificationType: null,
      });
      expect(missingType.success).toBe(false);
    });

    it('updatePartnerVerificationSchema: deve falhar quando isVerified=false com verifiedUntil diferente de null', () => {
      const invalidNotVerified = updatePartnerVerificationSchema.safeParse({
        partnerId: 'partner-123',
        isVerified: false,
        verifiedUntil: '2027-01-01T00:00:00.000Z',
        verificationType: null,
      });
      expect(invalidNotVerified.success).toBe(false);

      const validNotVerified = updatePartnerVerificationSchema.safeParse({
        partnerId: 'partner-123',
        isVerified: false,
        verifiedUntil: null,
        verificationType: null,
      });
      expect(validNotVerified.success).toBe(true);
    });

    it('updatePartnerVerificationSchema: deve rejeitar verificationType quando isVerified=false', () => {
      const result = updatePartnerVerificationSchema.safeParse({
        partnerId: 'partner-123',
        isVerified: false,
        verifiedUntil: null,
        verificationType: 'annual',
      });

      expect(result.success).toBe(false);
    });
  });
});
