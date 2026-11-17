import { describe, expect, it } from 'vitest';
import type { PartnerSubmissionData } from '../../types/partner';
import { mapPartnerSubmissionToGuideItem } from './partnerSubmissionToGuide';

describe('mapPartnerSubmissionToGuideItem', () => {
  const baseData: PartnerSubmissionData = {
    businessName: 'Estabelecimento Teste',
    category: 'hotel',
    description: 'Descrição de teste',
    region: 'Jericoacoara',
    address: 'Rua Principal, 100',
    phone: '(85) 99999-9999',
    phoneDdi: '+55',
    instagram: '@teste',
    website: 'https://teste.com',
    bookingLinks: 'https://booking.com',
    googleMaps: 'https://maps.google.com',
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao@teste.com',
  };

  it('hotel: deve mapear corretamente parceiro da categoria hotel', () => {
    const hotelData: PartnerSubmissionData = {
      ...baseData,
      category: 'hotel',
      checkInFrom: '14:00',
      checkInTo: '22:00',
      servesBreakfast: true,
      breakfastIncluded: true,
    };

    const result = mapPartnerSubmissionToGuideItem(hotelData, ['https://img1.jpg']);
    expect(result.name).toBe('Estabelecimento Teste');
    expect(result.category).toBe('hotel');
    expect(result.image).toBe('https://img1.jpg');
    expect(result.images).toEqual(['https://img1.jpg']);
    expect(result.location).toBe('Jericoacoara');
    expect(result.operationalInfo).toMatchObject({
      checkIn: { from: '14:00', to: '22:00' },
      breakfast: { serves: true, included: true },
    });
  });

  it('restaurant: deve mapear corretamente parceiro da categoria restaurant', () => {
    const restaurantData: PartnerSubmissionData = {
      ...baseData,
      category: 'restaurant',
      subcategory: 'Bistrô',
      cuisineType: 'Contemporânea',
    };

    const result = mapPartnerSubmissionToGuideItem(restaurantData, ['https://restaurante.jpg']);
    expect(result.category).toBe('restaurant');
    expect(result.operationalInfo).toMatchObject({
      subcategory: 'Bistrô',
      cuisineType: 'Contemporânea',
    });
  });

  it('sight: grava o acesso; o preço da entrada fica na oferta (F3, D34)', () => {
    const sightData: PartnerSubmissionData = {
      ...baseData,
      category: 'sight',
      sightAccessType: 'pago',
    };

    const result = mapPartnerSubmissionToGuideItem(sightData, ['https://ponto.jpg']);
    expect(result.category).toBe('sight');
    expect(result.operationalInfo).toMatchObject({ access: 'pago' });
    expect(result.operationalInfo).not.toHaveProperty('price');
  });

  it('categoria inválida: deve lançar erro se a categoria for incompatível (ex: event)', () => {
    const invalidCategoryData: PartnerSubmissionData = {
      ...baseData,
      category: 'event',
    };

    expect(() => mapPartnerSubmissionToGuideItem(invalidCategoryData, ['https://img.jpg'])).toThrow(
      'Categoria de Partner incompatível com conteúdo do Guide.'
    );
  });

  it('sem região: deve lançar erro quando região estiver vazia ou contiver apenas espaços', () => {
    const noRegionData: PartnerSubmissionData = {
      ...baseData,
      region: '   ',
    };

    expect(() => mapPartnerSubmissionToGuideItem(noRegionData, ['https://img.jpg'])).toThrow(
      'Região é obrigatória'
    );
  });

  it('sem imagem: deve lançar erro quando o array de URLs de imagem estiver vazio', () => {
    expect(() => mapPartnerSubmissionToGuideItem(baseData, [])).toThrow(
      'Ao menos uma imagem é obrigatória'
    );
  });

  it('grava o telefone em E.164', () => {
    const result = mapPartnerSubmissionToGuideItem(baseData, ['https://img1.jpg']);
    expect(result.phone).toBe('+5585999999999');
  });

  it('perfil de produtor pode não ter fotos; estabelecimento precisa de ao menos uma', () => {
    const producer = mapPartnerSubmissionToGuideItem(
      { ...baseData, category: 'producer', description: '' },
      []
    );
    expect(producer.category).toBe('producer');
    expect(producer.operationalInfo).toBeUndefined();
    expect(() => mapPartnerSubmissionToGuideItem(baseData, [])).toThrow();
  });

  it('não força o item como ativo (a edição não reativa item desativado)', () => {
    const result = mapPartnerSubmissionToGuideItem(baseData, ['https://img1.jpg']);
    expect(result).not.toHaveProperty('isActive');
  });
  it('tour: grava roteiro e itens inclusos; duração e ponto de encontro ficam na oferta', () => {
    const result = mapPartnerSubmissionToGuideItem(
      {
        ...baseData,
        category: 'tour',
        itinerary: 'Lagoa do Paraíso e Pedra Furada',
        tourIncludes: ['Guia'],
      },
      ['https://tour.jpg']
    );
    expect(result.category).toBe('tour');
    expect(result.operationalInfo).toMatchObject({
      itinerary: 'Lagoa do Paraíso e Pedra Furada',
      includes: ['Guia'],
    });
    expect(result.operationalInfo).not.toHaveProperty('durationMinutes');
    expect(result.operationalInfo).not.toHaveProperty('meetingPoint');
  });

  it('transfer: descarta trechos incompletos; passageiros ficam na oferta', () => {
    const result = mapPartnerSubmissionToGuideItem(
      {
        ...baseData,
        category: 'transfer',
        transferRoutes: [
          { from: 'Fortaleza', to: 'Jericoacoara' },
          { from: 'Jijoca', to: '' },
        ],
        transferVehicles: ['4x4'],
        luggageInfo: '1 mala por pessoa',
      },
      ['https://transfer.jpg']
    );
    expect(result.category).toBe('transfer');
    expect(result.operationalInfo).toMatchObject({
      transferRoutes: [{ from: 'Fortaleza', to: 'Jericoacoara' }],
      vehicleTypes: ['4x4'],
      luggageInfo: '1 mala por pessoa',
    });
    expect(result.operationalInfo).not.toHaveProperty('maxPassengers');
  });

  it('rental: grava caução e habilitação; o período mínimo fica na oferta', () => {
    const result = mapPartnerSubmissionToGuideItem(
      {
        ...baseData,
        category: 'rental',
        rentalVehicles: ['Quadriciclo'],
        depositRequired: true,
        driverLicenseRequired: false,
      },
      ['https://rental.jpg']
    );
    expect(result.category).toBe('rental');
    expect(result.operationalInfo).toMatchObject({
      vehicleTypes: ['Quadriciclo'],
      depositRequired: true,
      driverLicenseRequired: false,
    });
    expect(result.operationalInfo).not.toHaveProperty('minRentalHours');
  });
});
