import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import pkg from '../../../../package.json';
import { i18n } from '../../../shared/i18n';
import { AboutView } from './AboutView';

describe('AboutView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra só a versão do package.json e abre termos, termos do parceiro e licenças', () => {
    const handlers = { onTerms: vi.fn(), onPartner: vi.fn(), onLicenses: vi.fn() };
    render(
      <AboutView
        onBack={() => undefined}
        onOpenTerms={handlers.onTerms}
        onOpenPartnerTerms={handlers.onPartner}
        onOpenLicenses={handlers.onLicenses}
      />
    );
    expect(screen.getByText(`Versão ${pkg.version}`)).toBeTruthy();
    expect(screen.queryByText(/build/)).toBeNull();
    const rows = screen.getAllByRole('button').map((button) => button.textContent);
    expect(rows.slice(-3)).toEqual([
      'Termos e políticas',
      'Termos do parceiro',
      'Licenças e créditos',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Termos do parceiro' }));
    expect(handlers.onPartner).toHaveBeenCalled();
    expect(
      screen.getByText(`© ${new Date().getFullYear()} Use Guide. Todos os direitos reservados.`)
    ).toBeTruthy();
  });
});
