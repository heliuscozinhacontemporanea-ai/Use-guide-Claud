import { describe, expect, it } from 'vitest';
import { INITIAL_FORM_DATA } from '../constants/formDefaults';
import type { FormState } from '../types/partsForm';
import {
  isSignupStep1Incomplete,
  isSignupStep2Incomplete,
  isSignupStep3Incomplete,
  isSignupStep4Incomplete,
  isSignupStep5Incomplete,
} from './signupStepGates';

const form = (overrides: Partial<FormState>): FormState => ({ ...INITIAL_FORM_DATA, ...overrides });

describe('signupStepGates', () => {
  it('etapa 1 não pede documento: categoria, nome e descrição bastam (D12)', () => {
    expect(isSignupStep1Incomplete(form({}))).toBe(true);
    expect(isSignupStep1Incomplete(form({ category: 'hotel', businessName: 'Pousada' }))).toBe(
      true
    );
    expect(
      isSignupStep1Incomplete(
        form({ category: 'hotel', businessName: 'Pousada', description: 'Vista para as dunas' })
      )
    ).toBe(false);
    expect(isSignupStep1Incomplete(form({ category: 'producer' }))).toBe(false);
  });

  it('etapa 2 exige link de reserva só para hospedagem', () => {
    const base = { phone: '88999999999', region: 'Jericoacoara', googleMaps: 'https://maps' };
    expect(isSignupStep2Incomplete(form({ ...base, category: 'restaurant' }))).toBe(false);
    expect(isSignupStep2Incomplete(form({ ...base, category: 'hotel' }))).toBe(true);
    expect(isSignupStep2Incomplete(form({ category: 'producer', phone: '88999999999' }))).toBe(
      false
    );
  });

  it('etapa 3 pede o preço do café quando não está incluso', () => {
    const hotel = form({ category: 'hotel', servesBreakfast: true, breakfastIncluded: false });
    expect(isSignupStep3Incomplete(hotel)).toBe(true);
    expect(isSignupStep3Incomplete({ ...hotel, breakfastPrice: '30' })).toBe(false);
  });

  it('etapa 4 pede custo extra de pet quando o pet é aceito', () => {
    const hotel = form({
      category: 'hotel',
      checkInFrom: '14:00',
      checkInTo: '22:00',
      checkOutFrom: '08:00',
      checkOutTo: '12:00',
      childrenAllowed: true,
      petsPolicy: 'Sim',
    });
    expect(isSignupStep4Incomplete(hotel)).toBe(true);
    expect(isSignupStep4Incomplete({ ...hotel, petsExtraCost: '50' })).toBe(false);
    expect(isSignupStep4Incomplete(form({ category: 'restaurant' }))).toBe(false);
  });

  it('etapa 5 exige senha forte só de quem ainda não tem conta', () => {
    const data = form({
      category: 'producer',
      termsAccepted: true,
      firstName: 'Ana',
      email: 'ana@exemplo.com',
      password: 'fraca',
      confirmPassword: 'fraca',
    });
    expect(isSignupStep5Incomplete(data, false)).toBe(true);
    expect(isSignupStep5Incomplete(data, true)).toBe(false);
    expect(
      isSignupStep5Incomplete(
        { ...data, password: 'Forte1234', confirmPassword: 'Forte1234' },
        false
      )
    ).toBe(false);
  });
});
