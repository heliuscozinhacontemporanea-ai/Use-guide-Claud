import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { useUIStore } from '../../../../shared/stores/useUIStore';
import type { ListingVerificationQueueEntry } from '../../types/listingVerification';
import { VerificationQueueCard } from './VerificationQueueCard';

const entry: ListingVerificationQueueEntry = {
  itemId: 'item-1',
  ownerId: 'owner-1',
  mode: 'document',
  sourceItemId: null,
  status: 'pending',
  documentType: 'cnpj',
  maskedDocument: '**.***.***/0001-81',
  holderRole: 'representative',
  cadastur: null,
  rejectionReason: null,
  submittedAt: '2026-10-19T15:00:00.000Z',
  reviewedAt: null,
  filesSent: ['cnpjCard', 'identity'],
  listingName: 'Pousada Sol',
  listingCategory: 'hotel',
  ownerName: 'Ana Silva',
};

describe('VerificationQueueCard', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra dados mascarados, data no fuso de Fortaleza e os arquivos enviados', () => {
    render(<VerificationQueueCard entry={entry} onReview={vi.fn()} onOpenFile={vi.fn()} />);
    expect(screen.getByText('**.***.***/0001-81')).toBeInTheDocument();
    expect(screen.getByText('Enviado em 19/10/2026, 12:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cartão CNPJ/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Autorização/ })).not.toBeInTheDocument();
  });

  it('recusa só com motivo de pelo menos 5 caracteres', async () => {
    const onReview = vi.fn().mockResolvedValue(undefined);
    render(<VerificationQueueCard entry={entry} onReview={onReview} onOpenFile={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Recusar' }));
    const confirm = screen.getByRole('button', { name: 'Confirmar recusa' });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Motivo da recusa'), {
      target: { value: 'Cartão ilegível' },
    });
    fireEvent.click(confirm);
    await waitFor(() => expect(onReview).toHaveBeenCalledWith('reject', 'Cartão ilegível'));
  });

  it('aprovação passa pela confirmação', async () => {
    const onReview = vi.fn().mockResolvedValue(undefined);
    const confirmAction = vi.fn().mockResolvedValue(false);
    useUIStore.setState({ confirmAction });
    render(<VerificationQueueCard entry={entry} onReview={onReview} onOpenFile={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Aprovar' }));
    await waitFor(() =>
      expect(confirmAction).toHaveBeenCalledWith(
        expect.stringContaining('Aprovar a verificação?'),
        {
          tone: 'positive',
          confirmLabel: 'Aprovar',
        }
      )
    );
    expect(onReview).not.toHaveBeenCalled();
  });
});
