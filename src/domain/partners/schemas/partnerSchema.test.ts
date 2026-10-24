import type { UserSession } from '../../auth';
import { describe, expect, it } from 'vitest';
import {
  partnerSubmissionSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step5SchemaContext,
  updatePartnerStatusSchema,
} from './partnerSchema';

describe('Partner Validation Schemas (Frontend)', () => {
  describe('Categoria e identidade (step1Schema)', () => {
    it('deve validar hotel com nome e descrição', () => {
      const result = step1Schema.safeParse({
        category: 'hotel',
        businessName: 'Pousada Sol & Mar',
        description: 'Uma linda pousada em Jericoacoara com vista para o mar.',
      });
      expect(result.success).toBe(true);
    });

    it('deve falhar quando a categoria for vazia', () => {
      const result = step1Schema.safeParse({
        category: '',
        businessName: 'Pousada Sol & Mar',
        description: 'Descrição válida',
      });
      expect(result.success).toBe(false);
    });

    it('deve aceitar categorias válidas: hotel, restaurant, sight, tour, producer', () => {
      for (const category of ['hotel', 'restaurant', 'sight', 'tour']) {
        const res = step1Schema.safeParse({
          category,
          businessName: 'Empresa Teste',
          description: 'Descrição válida do estabelecimento',
        });
        expect(res.success).toBe(true);
      }

      // Perfil de produtor: nome obrigatório, descrição opcional.
      const resProducer = step1Schema.safeParse({
        category: 'producer',
        businessName: 'Produtora Sol',
        description: '',
      });
      expect(resProducer.success).toBe(true);
      const producerWithoutName = step1Schema.safeParse({
        category: 'producer',
        businessName: '',
        description: '',
      });
      expect(producerWithoutName.success).toBe(false);
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

    it('tour exige duração positiva e ponto de encontro', () => {
      expect(
        step3Schema.safeParse({ category: 'tour', tourDurationHours: '3', meetingPoint: 'Vila' })
          .success
      ).toBe(true);
      const invalid = step3Schema.safeParse({ category: 'tour', tourDurationHours: '0' });
      expect(invalid.success).toBe(false);
      const paths = invalid.error?.issues.map((issue) => issue.path[0]);
      expect(paths).toEqual(expect.arrayContaining(['tourDurationHours', 'meetingPoint']));
    });

    it('transfer exige um trecho completo, um veículo e a capacidade', () => {
      expect(
        step3Schema.safeParse({
          category: 'transfer',
          transferRoutes: [{ from: 'Fortaleza', to: 'Jericoacoara' }],
          transferVehicles: ['Van'],
          maxPassengers: '12',
        }).success
      ).toBe(true);
      const invalid = step3Schema.safeParse({
        category: 'transfer',
        transferRoutes: [{ from: 'Fortaleza', to: ' ' }],
      });
      const paths = invalid.error?.issues.map((issue) => issue.path[0]);
      expect(paths).toEqual(
        expect.arrayContaining(['transferRoutes', 'transferVehicles', 'maxPassengers'])
      );
    });

    it('rental exige o que é alugado e o período mínimo', () => {
      expect(
        step3Schema.safeParse({
          category: 'rental',
          rentalVehicles: ['Quadriciclo'],
          minRentalHours: '2',
        }).success
      ).toBe(true);
      const invalid = step3Schema.safeParse({ category: 'rental' });
      const paths = invalid.error?.issues.map((issue) => issue.path[0]);
      expect(paths).toEqual(expect.arrayContaining(['rentalVehicles', 'minRentalHours']));
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
        currentUser: { uid: 'user_123', email: 'carlos@hotel.com' } as UserSession,
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
      });
      expect(result.success).toBe(true);
    });

    it('deve rejeitar partnerSubmissionSchema com categoria inválida ou termos false', () => {
      const resultCategory = partnerSubmissionSchema.safeParse({
        businessName: 'Pousada Sol',
        category: 'invalid-cat',
        phone: '85988888888',
        termsAccepted: true,
      });
      expect(resultCategory.success).toBe(false);

      const resultTerms = partnerSubmissionSchema.safeParse({
        businessName: 'Pousada Sol',
        category: 'hotel',
        phone: '85988888888',
        termsAccepted: false,
      });
      expect(resultTerms.success).toBe(false);
    });

    it('updatePartnerStatusSchema recusa o status pendente: a conta só é suspensa (D12)', () => {
      expect(
        updatePartnerStatusSchema.safeParse({ partnerId: 'partner-123', status: 'pending' }).success
      ).toBe(false);
    });

    it('deve validar updatePartnerStatusSchema', () => {
      const result = updatePartnerStatusSchema.safeParse({
        partnerId: 'partner-123',
        status: 'suspended',
      });
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('suspended');
    });
  });
});
