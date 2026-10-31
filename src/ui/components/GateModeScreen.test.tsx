import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../shared/i18n';
import { GateModeScreen } from './GateModeScreen';

describe('modo portaria (D21)', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('código digitado mostra o resultado até "Próximo" e volta para a leitura', async () => {
    const onCode = vi.fn().mockResolvedValue({
      tone: 'danger',
      headline: 'Entrada recusada',
      detail: 'Este ingresso já entrou às 21:14.',
    });
    render(
      <GateModeScreen
        title="Luau"
        online
        codePrefix="INGR"
        codeLength={8}
        codeAlphabet="23456789ABCDEFGHJKMNPQRSTUVWXYZ"
        onQr={vi.fn()}
        onCode={onCode}
        onClose={vi.fn()}
      />
    );
    // Sem câmera no ambiente de teste: a tela orienta a usar o código.
    expect(await screen.findByText(/Use “Inserir código”/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Inserir código' }));
    const boxes = await screen.findAllByRole('textbox');
    fireEvent.paste(boxes[0] as HTMLElement, {
      clipboardData: { getData: () => 'INGR:K7M4QXAB' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(onCode).toHaveBeenCalledWith('K7M4QXAB'));
    expect(await screen.findByText('Entrada recusada')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Inserir código' })).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(screen.queryByText('Entrada recusada')).toBeNull();
  });
});
