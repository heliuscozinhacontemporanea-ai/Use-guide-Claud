import { describe, expect, it, vi } from 'vitest';
import { subscribeToDocumentUseCase } from '../../../database';
import { subscribeToPartnerProfileUseCase } from './subscribeToPartnerProfileUseCase';

vi.mock('../../../database', () => ({
  subscribeToDocumentUseCase: vi.fn(),
}));

describe('subscribeToPartnerProfileUseCase', () => {
  it('deve delegar para subscribeToDocumentUseCase com a collection publicPartners', () => {
    const unsubscribeMock = vi.fn();
    vi.mocked(subscribeToDocumentUseCase).mockReturnValueOnce(unsubscribeMock);

    const onUpdate = vi.fn();
    const onError = vi.fn();

    const unsubscribe = subscribeToPartnerProfileUseCase('partner-123', onUpdate, onError);

    expect(subscribeToDocumentUseCase).toHaveBeenCalledWith(
      'publicPartners',
      'partner-123',
      onUpdate,
      onError
    );
    expect(unsubscribe).toBe(unsubscribeMock);
  });

  it('deve lançar erro se partnerId for vazio', () => {
    expect(() => subscribeToPartnerProfileUseCase('', vi.fn())).toThrow();
  });
});
