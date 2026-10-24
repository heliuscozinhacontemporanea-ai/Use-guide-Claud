import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../shared/i18n';
import { VerifiedSealButton } from './VerifiedSealButton';

describe('VerifiedSealButton (D11)', () => {
  beforeEach(async () => {
    // O Popover do Radix mede o gatilho; o jsdom não tem ResizeObserver.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
    await i18n.changeLanguage('pt-BR');
  });

  it('ao tocar no selo explica o que ele significa', async () => {
    render(<VerifiedSealButton />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Ver o que significa o selo Use Guide Verificado' })
    );
    expect(
      await screen.findByText(
        'Responsável verificado pelo Use Guide · assinante do plano Use Guide Verificado.'
      )
    ).toBeTruthy();
  });
});
