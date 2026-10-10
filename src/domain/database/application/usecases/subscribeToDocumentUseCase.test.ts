import { describe, expect, it, vi } from 'vitest';
import { subscribeToPartnerProfileUseCase } from '../../../partners/application/usecases/subscribeToPartnerProfileUseCase';
import { databaseAdapter } from '../../factory';
import { subscribeToDocumentUseCase } from './subscribeToDocumentUseCase';

vi.mock('../../factory', () => ({
  databaseAdapter: {
    subscribeToDocument: vi.fn(),
  },
}));

describe('Nova Fronteira Database: subscribeToDocumentUseCase', () => {
  it('deve verificar que o UseCase chama a porta do Database Port (databaseAdapter.subscribeToDocument)', () => {
    const unsubscribeMock = vi.fn();
    vi.mocked(databaseAdapter.subscribeToDocument).mockReturnValueOnce(unsubscribeMock);

    const onUpdate = vi.fn();
    const onError = vi.fn();

    const unsubscribe = subscribeToDocumentUseCase(
      'publicPartners',
      'partner-123',
      onUpdate,
      onError
    );

    expect(databaseAdapter.subscribeToDocument).toHaveBeenCalledWith(
      'publicPartners',
      'partner-123',
      onUpdate,
      onError
    );
    expect(unsubscribe).toBe(unsubscribeMock);
  });

  it('deve verificar que o domínio Partner não chama databaseAdapter diretamente, mas usa o subscribeToDocumentUseCase', () => {
    // Spies on subscribeToDocumentUseCase execution
    const onUpdate = vi.fn();
    const onError = vi.fn();
    const unsubscribeMock = vi.fn();

    vi.mocked(databaseAdapter.subscribeToDocument).mockReturnValueOnce(unsubscribeMock);

    const unsubscribe = subscribeToPartnerProfileUseCase('partner-abc', onUpdate, onError);

    // Confirms Partner usecase routed through subscribeToDocumentUseCase -> DatabasePort
    expect(databaseAdapter.subscribeToDocument).toHaveBeenCalledWith(
      'publicPartners',
      'partner-abc',
      onUpdate,
      onError
    );
    expect(unsubscribe).toBe(unsubscribeMock);
  });
});
