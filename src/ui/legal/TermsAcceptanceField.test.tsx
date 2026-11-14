import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../shared/i18n';
import { TermsAcceptanceField } from './TermsAcceptanceField';

describe('TermsAcceptanceField (D15)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('o link abre os termos sem marcar a caixa; marcar avisa o formulário', async () => {
    const onChange = vi.fn();
    render(<TermsAcceptanceField audience="buyer" checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'termos e a política de cancelamento' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Compras, cancelamento e reembolso')).toBeTruthy();
    expect(screen.getAllByText(/Direito de arrependimento/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('Fechar'));
    // A folha sai com animação; até sair, o resto da tela fica escondido do leitor de tela (Radix).
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('termos do parceiro mostram as taxas vindas do backend', () => {
    render(
      <TermsAcceptanceField
        audience="partner"
        checked={false}
        onChange={() => {}}
        fees={{
          bookingsBps: 1500,
          ticketsBps: 1000,
          ticketsAbsorbedBps: 1250,
          ticketServiceFeeMinor: 300,
        }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'termos do parceiro' }));
    expect(screen.getByText(/15% nas reservas/)).toBeTruthy();
    expect(screen.getByText(/R\$\s3,00 por ingresso pago/)).toBeTruthy();
    expect(screen.getByText(/multa de 20%/)).toBeTruthy();
  });
});
