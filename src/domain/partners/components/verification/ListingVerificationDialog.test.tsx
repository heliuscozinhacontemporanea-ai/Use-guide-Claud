import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../../../media', () => ({ uploadVerificationFileUseCase: vi.fn() }));
vi.mock('../../application/usecases/getListingVerificationUseCase', () => ({
  getListingVerificationUseCase: mocks.get,
}));
vi.mock('../../application/usecases/submitListingVerificationUseCase', () => ({
  submitListingVerificationUseCase: vi.fn(),
}));

import { ListingVerificationDialog } from './ListingVerificationDialog';

const base = { ownerId: 'owner-1', sourceItemId: null, filesSent: [], maskedDocument: null };
const pousada = { id: 'item-1', name: 'Pousada Sol', category: 'hotel' };
const produtor = { id: 'item-3', name: 'Sol Produções', category: 'producer' };

describe('ListingVerificationDialog', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('estabelecimento sem envio mostra o formulário de documento', async () => {
    mocks.get.mockResolvedValue({
      ...base,
      itemId: 'item-1',
      mode: 'document',
      status: 'not_submitted',
    });
    render(
      <ListingVerificationDialog listing={pousada} accountListings={[pousada]} onClose={vi.fn()} />
    );
    expect(await screen.findByLabelText('Número do documento')).toBeInTheDocument();
  });

  it('perfil de produtor escolhe um estabelecimento da conta, nunca outro perfil', async () => {
    mocks.get.mockResolvedValue({
      ...base,
      itemId: 'item-3',
      mode: 'linked',
      status: 'not_submitted',
    });
    render(
      <ListingVerificationDialog
        listing={produtor}
        accountListings={[pousada, produtor]}
        onClose={vi.fn()}
      />
    );
    const select = await screen.findByLabelText('Estabelecimento de origem');
    const options = Array.from((select as HTMLSelectElement).options).map((option) => option.text);
    expect(options).toEqual(['Selecione', 'Pousada Sol']);
  });

  it('em análise mostra só o status, com o documento mascarado', async () => {
    mocks.get.mockResolvedValue({
      ...base,
      itemId: 'item-1',
      mode: 'document',
      status: 'pending',
      documentType: 'cnpj',
      maskedDocument: '**.***.***/0001-81',
    });
    render(
      <ListingVerificationDialog listing={pousada} accountListings={[pousada]} onClose={vi.fn()} />
    );
    expect(await screen.findByText('Documento: **.***.***/0001-81')).toBeInTheDocument();
    expect(screen.queryByLabelText('Número do documento')).not.toBeInTheDocument();
  });
});
