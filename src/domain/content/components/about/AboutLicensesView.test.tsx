import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { AboutLicensesView } from './AboutLicensesView';

describe('AboutLicensesView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra o crédito da animação e as bibliotecas, com o texto da licença ao abrir', async () => {
    render(<AboutLicensesView onBack={() => undefined} />);
    const credit = screen.getByRole('button', { name: /Animação do hamster/ });
    expect(screen.getByText('por Nawsome · Uiverse.io')).toBeTruthy();
    fireEvent.click(credit);
    expect(credit.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/Copyright \(c\) Nawsome/)).toBeTruthy();

    expect(await screen.findByRole('button', { name: /^react, \d/ })).toBeTruthy();
    expect(screen.getByText(/Bibliotecas de código aberto \(\d+\)/)).toBeTruthy();
  });
});
