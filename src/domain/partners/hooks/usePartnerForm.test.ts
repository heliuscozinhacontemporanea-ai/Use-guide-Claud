import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { subscribeToAuthStateUseCase } from '../../auth';
import { usePartnerForm } from './usePartnerForm';

let authCallback: ((session: any) => void) | null = null;

vi.mock('../../auth', () => ({
  subscribeToAuthStateUseCase: vi.fn((cb) => {
    authCallback = cb;
    cb(null);
    return () => {
      authCallback = null;
    };
  }),
  registerWithEmailUseCase: vi.fn(),
  loginWithEmailUseCase: vi.fn(),
}));

vi.mock('../application/usecases/createPartnerContentItemUseCase', () => ({
  createPartnerContentItemUseCase: vi.fn().mockResolvedValue('item-123'),
}));

vi.mock('../application/usecases/createOrUpdatePartnerProfileUseCase', () => ({
  createOrUpdatePartnerProfileUseCase: vi.fn().mockResolvedValue(undefined),
}));

describe('usePartnerForm Hook', () => {
  const categories = ['hotel', 'restaurant', 'sight', 'tour', 'event'];
  const mockSetCurrentStep = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    authCallback = null;
  });

  it('inicializa com valores padrão e métodos do react-hook-form', () => {
    const { result } = renderHook(() => usePartnerForm(categories, mockSetCurrentStep));

    expect(result.current.formData.category).toBe('');
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.submitError).toBeNull();
    expect(result.current.methods).toBeDefined();
    expect(result.current.currentUser).toBeNull();
  });

  it('realtime & subscription: deve se inscrever no estado de autenticação e atualizar currentUser dinamicamente', () => {
    const { result } = renderHook(() => usePartnerForm(categories, mockSetCurrentStep));

    expect(subscribeToAuthStateUseCase).toHaveBeenCalled();
    expect(result.current.currentUser).toBeNull();

    const mockSession = { uid: 'user-777', email: 'parceiro@exemplo.com' };

    act(() => {
      if (authCallback) {
        authCallback(mockSession);
      }
    });

    expect(result.current.currentUser).toEqual(mockSession);
  });

  it('category & CPF/CNPJ: valida etapa 1 e define erro quando CPF/CNPJ for inválido', () => {
    const { result } = renderHook(() => usePartnerForm(categories, mockSetCurrentStep));

    act(() => {
      result.current.methods.setValue('category', 'hotel');
      result.current.methods.setValue('cpfCnpj', '111.111.111-11');
      result.current.methods.setValue('businessName', 'Pousada Sol');
      result.current.methods.setValue(
        'description',
        'Pousada linda em Jericoacoara com vista para as dunas.'
      );
    });

    let isValid = false;
    act(() => {
      isValid = result.current.isStep1Valid();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.cpfCnpj).toBeDefined();
  });

  it('category & CPF/CNPJ: valida etapa 1 e retorna true quando categoria e CPF/CNPJ forem válidos', () => {
    const { result } = renderHook(() => usePartnerForm(categories, mockSetCurrentStep));

    act(() => {
      result.current.methods.setValue('category', 'hotel');
      result.current.methods.setValue('cpfCnpj', '529.982.247-25');
      result.current.methods.setValue('businessName', 'Pousada Sol');
      result.current.methods.setValue(
        'description',
        'Pousada linda em Jericoacoara com vista para as dunas.'
      );
    });

    let isValid = false;
    act(() => {
      isValid = result.current.isStep1Valid();
    });

    expect(isValid).toBe(true);
  });

  it('termsAccepted: valida etapa 5 e exige que os termos sejam aceitos', () => {
    const { result } = renderHook(() => usePartnerForm(categories, mockSetCurrentStep));

    act(() => {
      result.current.methods.setValue('category', 'hotel');
      result.current.methods.setValue('firstName', 'João');
      result.current.methods.setValue('email', 'joao@pousada.com');
      result.current.methods.setValue('password', 'Password123');
      result.current.methods.setValue('confirmPassword', 'Password123');
      result.current.methods.setValue('images', [
        { file: new File([], 'pousada.jpg'), id: 'img-1', preview: 'blob:img' },
      ]);
      result.current.methods.setValue('termsAccepted', false);
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validateStep5();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.termsAccepted).toBeDefined();

    act(() => {
      result.current.methods.setValue('termsAccepted', true);
    });

    act(() => {
      isValid = result.current.validateStep5();
    });

    expect(isValid).toBe(true);
  });

  it('Partner DTO & submissão: reseta o formulário e erros quando resetForm é chamado', () => {
    const { result } = renderHook(() => usePartnerForm(categories, mockSetCurrentStep));

    act(() => {
      result.current.methods.setValue('businessName', 'Teste');
      result.current.resetForm();
    });

    expect(result.current.formData.businessName).toBe('');
    expect(result.current.errors).toEqual({});
  });
});
