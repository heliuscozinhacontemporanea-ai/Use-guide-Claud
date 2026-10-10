import { describe, expect, it } from 'vitest';
import type { PartnerContentRecord } from '../../types/partnerContent';
import { getEmptyFormData, isValidUrl, mapItemToFormData } from './partnerFormMapper';

describe('partnerFormMapper', () => {
  const mockPartnerRecord: PartnerContentRecord = {
    id: 'item-123',
    name: 'Restaurante Mar Aberto',
    category: 'restaurant',
    description: 'Frutos do mar e vista da praia',
    location: 'jeri',
    address: 'Rua Principal, 100',
    whatsappLink: '88999999999',
    instagramLink: 'https://instagram.com/maraberto',
    websiteLink: 'https://maraberto.com.br',
    bookingLink: '',
    googleMapsLink: 'https://maps.google.com/?q=maraberto',
    image: 'https://example.com/img1.jpg',
    images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    isActive: true,
    operationalInfo: {
      cuisineType: 'Frutos do Mar',
      subcategory: 'Restaurante',
      mealTypes: ['Almoço', 'Jantar'],
      operatingHours: {
        domingo: { open: '11:00', close: '23:00', closed: false },
      },
    },
  };

  describe('mapItemToFormData', () => {
    it('deve mapear item do Guide para FormState preenchendo cpfCnpj com partnerCpfCnpj e sem acessar guideItem.cpfCnpj', () => {
      const partnerCpfCnpj = '12.345.678/0001-90';

      const guideItemProxy = new Proxy(
        { ...mockPartnerRecord } as PartnerContentRecord & { cpfCnpj?: string },
        {
          get(target, prop, receiver) {
            if (prop === 'cpfCnpj') {
              throw new Error('guideItem.cpfCnpj não deve ser acessado pelo mapper!');
            }
            return Reflect.get(target, prop, receiver);
          },
        }
      );

      const formData = mapItemToFormData(guideItemProxy, partnerCpfCnpj);

      expect(formData.cpfCnpj).toBe(partnerCpfCnpj);
      expect(formData.businessName).toBe('Restaurante Mar Aberto');
      expect(formData.category).toBe('restaurant');
      expect(formData.region).toBe('Jericoacoara');
      expect(formData.cuisineType).toBe('Frutos do Mar');
    });

    it('deve formatar imagens com file === undefined estrito e sem casts', () => {
      const formData = mapItemToFormData(mockPartnerRecord, '12345678900');

      expect(formData.images).toHaveLength(2);
      expect(formData.images[0]).toEqual({
        id: 'https://example.com/img1.jpg',
        preview: 'https://example.com/img1.jpg',
        file: undefined,
      });
      expect(formData.images[0]?.file).toBeUndefined();
    });
  });

  describe('getEmptyFormData', () => {
    it('deve retornar FormState inicial padrão com campos vazios', () => {
      const emptyForm = getEmptyFormData('hotel');

      expect(emptyForm.category).toBe('hotel');
      expect(emptyForm.businessName).toBe('');
      expect(emptyForm.cpfCnpj).toBe('');
      expect(emptyForm.images).toEqual([]);
      expect(emptyForm.termsAccepted).toBe(true);
    });
  });

  describe('isValidUrl', () => {
    it('deve validar URLs corretamente', () => {
      expect(isValidUrl('')).toBe(true);
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('example.com')).toBe(true);
      expect(isValidUrl('invalid-url-without-dot')).toBe(false);
    });
  });
});
