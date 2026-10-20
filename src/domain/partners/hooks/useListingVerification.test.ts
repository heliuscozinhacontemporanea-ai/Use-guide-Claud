import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { EMPTY_DOCUMENT_VERIFICATION_FORM } from '../schemas/listingVerificationFormSchema';

const mocks = vi.hoisted(() => ({ get: vi.fn(), submit: vi.fn(), upload: vi.fn() }));

vi.mock('../../media', () => ({ uploadVerificationFileUseCase: mocks.upload }));
vi.mock('../application/usecases/getListingVerificationUseCase', () => ({
  getListingVerificationUseCase: mocks.get,
}));
vi.mock('../application/usecases/submitListingVerificationUseCase', () => ({
  submitListingVerificationUseCase: mocks.submit,
}));

import { useListingVerification } from './useListingVerification';

const file = (name: string) => new File(['x'], name, { type: 'application/pdf' });

describe('useListingVerification', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
    mocks.get.mockResolvedValue({ itemId: 'item-1', status: 'not_submitted' });
    mocks.submit.mockResolvedValue({ itemId: 'item-1', status: 'pending' });
    mocks.upload.mockImplementation(async (f: File) => ({ fileId: `verification/u/${f.name}` }));
  });

  it('envia só os arquivos que a escolha exige', async () => {
    const { result } = renderHook(() => useListingVerification('item-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.submitDocument({
        ...EMPTY_DOCUMENT_VERIFICATION_FORM,
        documentType: 'cpf',
        document: '529.982.247-25',
        holderRole: 'owner',
        identity: file('id.pdf'),
        // Sobras de uma escolha anterior (CNPJ e representante) não saem do navegador.
        cnpjCard: file('card.pdf'),
        authorization: file('auth.pdf'),
      });
    });

    expect(mocks.upload).toHaveBeenCalledTimes(1);
    expect(mocks.submit).toHaveBeenCalledWith('item-1', {
      mode: 'document',
      documentType: 'cpf',
      document: '529.982.247-25',
      holderRole: 'owner',
      files: { identity: 'verification/u/id.pdf' },
      cadastur: null,
    });
    expect(result.current.data?.status).toBe('pending');
  });

  it('traduz o código de erro do backend', async () => {
    mocks.submit.mockRejectedValue(new Error('CNPJ_ALREADY_USED'));
    const { result } = renderHook(() => useListingVerification('item-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.submitLinked('item-2')).rejects.toThrow(
      'Este CNPJ já está em outro estabelecimento.'
    );
  });
});
