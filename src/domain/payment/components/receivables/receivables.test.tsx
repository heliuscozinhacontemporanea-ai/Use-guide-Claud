import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ declare: vi.fn() }));
vi.mock('../../application/usecases/declareForceMajeureUseCase', () => ({
  declareForceMajeureUseCase: m.declare,
}));

import type { AccountDebtView } from '../../types/receivables';
import { canDeclareForceMajeure, canPayDebt, debtStatusKey } from './debtStatus';
import { ForceMajeureDialog } from './ForceMajeureDialog';
import { payoutStatusKey } from './payoutStatus';

const NOW = new Date('2026-10-26T12:00:00.000Z');
const DEBT: AccountDebtView = {
  id: 'debt-1',
  accountKey: 'key-1',
  reason: 'cancellation_penalty',
  referenceType: 'booking_slot',
  amountMinor: 2000,
  remainingMinor: 2000,
  status: 'open',
  dueAt: '2026-10-27T12:00:00.000Z',
  overdue: false,
  createdAt: '2026-10-26T11:00:00.000Z',
};

describe('regras de tela de dívidas e extrato (D16)', () => {
  it('força maior só na multa aberta, antes do vencimento e uma vez', () => {
    expect(canDeclareForceMajeure(DEBT, NOW)).toBe(true);
    expect(canDeclareForceMajeure({ ...DEBT, reason: 'dispute_lost' }, NOW)).toBe(false);
    expect(canDeclareForceMajeure({ ...DEBT, forceMajeureStatus: 'rejected' }, NOW)).toBe(false);
    expect(canDeclareForceMajeure(DEBT, new Date('2026-10-28T00:00:00.000Z'))).toBe(false);
  });

  it('multa suspensa não se paga; recusada volta a ser cobrada', () => {
    expect(canPayDebt({ ...DEBT, status: 'suspended' })).toBe(false);
    expect(debtStatusKey({ ...DEBT, status: 'suspended' })).toBe('suspended');
    const rejected = { ...DEBT, forceMajeureStatus: 'rejected' as const };
    expect(debtStatusKey(rejected)).toBe('rejected');
    expect(canPayDebt(rejected)).toBe(true);
  });

  it('status do extrato: reclamação vem antes da contestação', () => {
    const base = {
      status: 'on_hold' as const,
      holdReasons: ['dispute', 'claim'] as Array<'dispute' | 'claim'>,
      canceledReason: null,
    };
    expect(payoutStatusKey(base as never)).toBe('claim');
    expect(payoutStatusKey({ ...base, holdReasons: ['dispute'] } as never)).toBe('dispute');
    expect(
      payoutStatusKey({
        status: 'canceled',
        canceledReason: 'dispute_lost',
        holdReasons: [],
      } as never)
    ).toBe('dispute_lost');
  });
});

describe('ForceMajeureDialog (D16 3A)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('exige motivo de 10 caracteres e prova antes de enviar', async () => {
    const onDeclared = vi.fn();
    render(<ForceMajeureDialog debt={DEBT} onClose={vi.fn()} onDeclared={onDeclared} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enviar para análise' }));
    expect(await screen.findByText(/pelo menos 10 caracteres/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('O que aconteceu'), {
      target: { value: 'Vento acima de 40 nós, travessia proibida.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar para análise' }));
    expect(await screen.findByText('Anexe uma prova.')).toBeTruthy();
    expect(m.declare).not.toHaveBeenCalled();

    const proof = new File(['%PDF'], 'prova.pdf', { type: 'application/pdf' });
    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [proof] },
    });
    m.declare.mockResolvedValue({ ...DEBT, status: 'suspended' });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar para análise' }));
    await waitFor(() => expect(onDeclared).toHaveBeenCalled());
    expect(m.declare).toHaveBeenCalledWith('debt-1', {
      reason: 'Vento acima de 40 nós, travessia proibida.',
      proof,
    });
  });

  it('erro da API traduzido pelo código', async () => {
    m.declare.mockRejectedValue(new Error('FORCE_MAJEURE_TOO_LATE'));
    render(<ForceMajeureDialog debt={DEBT} onClose={vi.fn()} onDeclared={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('O que aconteceu'), {
      target: { value: 'Interdição da praia pela prefeitura.' },
    });
    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [new File(['x'], 'foto.jpg', { type: 'image/jpeg' })] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar para análise' }));
    expect(await screen.findByText(/antes do vencimento da multa/)).toBeTruthy();
  });
});
