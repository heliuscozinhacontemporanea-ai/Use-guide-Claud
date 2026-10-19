import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getEmptyFormData } from '../application/mappers/partnerFormMapper';
import type { FormState } from '../types/partsForm';
import { useListingEditorValidation } from './useListingEditorValidation';

function validTour(): FormState {
  return {
    ...getEmptyFormData('tour'),
    businessName: 'Passeio Lagoa do Paraíso',
    description: 'Roteiro de meio dia pelas lagoas.',
    region: 'Jericoacoara',
    phone: '88999999999',
    tourDurationHours: '4',
    meetingPoint: 'Praça principal',
    googleMaps: 'https://maps.google.com/?q=jericoacoara',
    images: [{ id: 'img-1', preview: 'https://img.example/1.jpg' }],
  };
}

function validate(formData: FormState): boolean {
  const { result } = renderHook(() => useListingEditorValidation(formData));
  let valid = false;
  act(() => {
    valid = result.current.validateAll(true);
  });
  return valid;
}

describe('useListingEditorValidation', () => {
  it('aceita um cadastro completo sem CPF/CNPJ (editor do admin)', () => {
    expect(validate(validTour())).toBe(true);
  });

  it('exige os campos da categoria e ao menos uma foto', () => {
    expect(validate({ ...validTour(), meetingPoint: '' })).toBe(false);
    expect(validate({ ...validTour(), images: [] })).toBe(false);
  });

  it('perfil de produtor não exige descrição nem foto', () => {
    expect(
      validate({
        ...getEmptyFormData('producer'),
        businessName: 'Produções Ceará',
        region: 'Jericoacoara',
        phone: '88999999999',
        googleMaps: 'https://maps.google.com/?q=jericoacoara',
      })
    ).toBe(true);
  });

  it('recusa quando o telefone é inválido', () => {
    const { result } = renderHook(() => useListingEditorValidation(validTour()));
    let valid = true;
    act(() => {
      valid = result.current.validateAll(false);
    });
    expect(valid).toBe(false);
  });
});
