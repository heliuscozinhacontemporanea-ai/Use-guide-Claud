import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../shared/i18n';
import { stackSheetProgress } from '../motion/stackSheetProgress';
import { Dialog } from './Dialog';

function Sheet({ dismissible = true }: { dismissible?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        abrir
      </button>
      <Dialog open={open} onOpenChange={setOpen} title="Detalhe" dismissible={dismissible}>
        <p>conteúdo</p>
      </Dialog>
    </>
  );
}

/** Folha mostrada só enquanto `show`: some de uma vez, sem a animação de saída. */
function UnmountedSheet({ show }: { show: boolean }) {
  return show ? (
    <Dialog open onOpenChange={() => undefined} title="Oferta">
      <p>ações</p>
    </Dialog>
  ) : null;
}

const openSheets = () =>
  ((window.history.state as { ugSheets?: string[] } | null)?.ugSheets ?? []).length;

describe('Dialog (D33)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, '');
  });

  it('folha que some de uma vez (o pai deixa de mostrá-la) devolve o fundo do app', async () => {
    const { rerender } = render(<UnmountedSheet show />);
    // Aberta, a folha leva o app atrás a virar cartão.
    await waitFor(() => expect(stackSheetProgress.get()).toBeGreaterThan(0.5), { timeout: 3000 });
    rerender(<UnmountedSheet show={false} />);
    await waitFor(() => expect(stackSheetProgress.get()).toBeLessThan(0.01), { timeout: 3000 });
  });

  it('aberta, entra no histórico; o voltar do sistema fecha só ela', async () => {
    render(<Sheet />);
    fireEvent.click(screen.getByRole('button', { name: 'abrir' }));
    expect(screen.getByRole('dialog', { name: 'Detalhe' })).toBeTruthy();
    expect(openSheets()).toBe(1);

    act(() => window.history.back());
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(openSheets()).toBe(0);
  });

  it('fechar pelo X tira a entrada do histórico, para o voltar seguinte não reabrir', async () => {
    const back = vi.spyOn(window.history, 'back');
    render(<Sheet />);
    fireEvent.click(screen.getByRole('button', { name: 'abrir' }));
    fireEvent.click(screen.getByRole('button', { name: i18n.t('common.close') }));
    expect(back).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('passo obrigatório (dismissible=false) não entra no histórico nem tem botão fechar', () => {
    render(<Sheet dismissible={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'abrir' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(openSheets()).toBe(0);
    expect(screen.queryByRole('button', { name: i18n.t('common.close') })).toBeNull();
  });
});
