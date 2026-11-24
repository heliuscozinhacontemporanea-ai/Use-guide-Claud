import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({
  submit: vi.fn(),
  listMine: vi.fn(),
  confirm: vi.fn(async () => true),
}));
vi.mock('../../application/usecases/submitListingClaimUseCase', () => ({
  submitListingClaimUseCase: m.submit,
}));
vi.mock('../../application/usecases/listMyListingClaimsUseCase', () => ({
  listMyListingClaimsUseCase: m.listMine,
}));
vi.mock('../verification/DocumentVerificationForm', () => ({
  DocumentVerificationForm: ({
    onSubmit,
    extra,
    submitLabel,
  }: {
    onSubmit: (values: unknown) => Promise<void>;
    extra: React.ReactNode;
    submitLabel: string;
  }) => (
    <div>
      {extra}
      <button type="button" onClick={() => void onSubmit({ documentType: 'cnpj' })}>
        {submitLabel}
      </button>
    </div>
  ),
}));
vi.mock('../../../../shared/stores/useUIStore', () => ({
  useUI: () => ({ showToast: vi.fn(), confirmAction: m.confirm }),
}));

import type { AdminListingClaim, MyListingClaim } from '../../types/listingClaim';
import { ClaimListingPage } from './ClaimListingPage';
import { ListingClaimCard } from './ListingClaimCard';
import { ListingClaimRow } from './ListingClaimRow';
import { MyListingClaimsCards } from './MyListingClaimsCards';

const target = {
  itemId: 'item-1',
  name: 'Cantinho do Preá',
  category: 'restaurant',
  city: 'Jijoca',
  image: null,
};

describe('"Sou o dono" nas telas (D35)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('a linha do anúncio é um botão discreto com "Sou o dono"', () => {
    const onClaim = vi.fn();
    render(<ListingClaimRow onClaim={onClaim} />);
    fireEvent.click(screen.getByRole('button', { name: /É o dono deste lugar\?.*Sou o dono/ }));
    expect(onClaim).toHaveBeenCalled();
  });

  it('quem não é parceiro precisa aceitar os Termos do parceiro antes de enviar', async () => {
    const onSent = vi.fn();
    render(<ClaimListingPage target={target} needsTerms onSent={onSent} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enviar pedido' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('aceite os Termos do parceiro');
    expect(m.submit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar pedido' }));
    await waitFor(() => expect(onSent).toHaveBeenCalled());
    expect(m.submit).toHaveBeenCalledWith('item-1', { documentType: 'cnpj' }, true);
  });

  it('erro do servidor vira mensagem traduzida', async () => {
    m.submit.mockRejectedValueOnce(new Error('DOCUMENT_IN_USE'));
    render(<ClaimListingPage target={target} needsTerms={false} onSent={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enviar pedido' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Este documento já está em outra conta.'
    );
  });

  it('o painel mostra o pedido em análise e o recusado com "Enviar de novo"', async () => {
    const base = {
      documentType: 'cnpj',
      maskedDocument: '**',
      holderRole: 'owner',
      cadastur: null,
      filesSent: [] as MyListingClaim['filesSent'],
    } as const;
    const claims: MyListingClaim[] = [
      {
        ...base,
        claimId: 'a',
        itemId: 'item-1',
        listingName: 'Cantinho',
        status: 'pending',
        rejectionReason: null,
        submittedAt: '2026-11-22T12:00:00.000Z',
        reviewedAt: null,
      },
      {
        ...base,
        claimId: 'b',
        itemId: 'item-2',
        listingName: 'Pousada',
        status: 'rejected',
        rejectionReason: 'Documento ilegível',
        submittedAt: '2026-11-20T12:00:00.000Z',
        reviewedAt: '2026-11-21T12:00:00.000Z',
      },
      {
        ...base,
        claimId: 'c',
        itemId: 'item-3',
        listingName: 'Antigo',
        status: 'approved',
        rejectionReason: null,
        submittedAt: '2026-11-01T12:00:00.000Z',
        reviewedAt: '2026-11-02T12:00:00.000Z',
      },
    ];
    m.listMine.mockResolvedValue(claims);
    const onResend = vi.fn();
    render(
      <MyListingClaimsCards onResend={onResend} now={new Date('2026-11-24T12:00:00Z').getTime()} />
    );
    expect(await screen.findByText('Cantinho')).toBeTruthy();
    expect(screen.getByText('Em análise')).toBeTruthy();
    expect(screen.getByText('Motivo: Documento ilegível')).toBeTruthy();
    expect(screen.queryByText('Antigo')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar de novo' }));
    expect(onResend).toHaveBeenCalledWith(expect.objectContaining({ claimId: 'b' }));
  });

  it('admin: aprovar pede confirmação; recusar exige motivo', async () => {
    const claim: AdminListingClaim = {
      claimId: 'item-1_ana',
      itemId: 'item-1',
      status: 'pending',
      documentType: 'cnpj',
      maskedDocument: '**.***.678/0001-90',
      holderRole: 'owner',
      cadastur: null,
      rejectionReason: null,
      submittedAt: '2026-11-22T12:00:00.000Z',
      reviewedAt: null,
      filesSent: ['cnpjCard', 'identity'],
      listing: { name: 'Cantinho do Preá', category: 'restaurant', city: 'Jijoca' },
      claimantName: 'Ana Lima',
      otherClaims: [
        {
          claimantName: 'Bruno Reis',
          holderRole: 'representative',
          submittedAt: '2026-11-21T12:00:00.000Z',
        },
      ],
    };
    const onReview = vi.fn(async () => undefined);
    render(
      <ListingClaimCard claim={claim} onReview={onReview} onReturn={vi.fn()} onOpenFile={vi.fn()} />
    );
    expect(screen.getByText(/Outro pedido para este lugar: Bruno Reis/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Aprovar' }));
    await waitFor(() => expect(onReview).toHaveBeenCalledWith('approve', null));
    expect(m.confirm).toHaveBeenCalledWith(
      expect.stringContaining('Passar o anúncio para Ana Lima?'),
      expect.anything()
    );

    fireEvent.click(screen.getByRole('button', { name: 'Recusar' }));
    const send = screen.getAllByRole('button', { name: 'Recusar' }).at(-1) as HTMLButtonElement;
    expect(send.disabled).toBe(true);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Documento ilegível' } });
    fireEvent.click(send);
    await waitFor(() => expect(onReview).toHaveBeenCalledWith('reject', 'Documento ilegível'));
  });
});
