import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n, LOCALE_STORAGE_KEY } from '../../shared/i18n';
import { LocalePreference } from './LocalePreference';

const auth = vi.hoisted(() => ({
  value: { user: null as { uid: string } | null, profile: null as Record<string, unknown> | null },
}));
const updatePreferredLocaleUseCase = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('../../domain/auth/context/AuthContext', () => ({ useAuthContext: () => auth.value }));
vi.mock('../../domain/user', () => ({ updatePreferredLocaleUseCase }));

function CurrentPath() {
  return <span data-testid="path">{useLocation().pathname}</span>;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="*"
          element={
            <>
              <LocalePreference />
              <CurrentPath />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

function setBrowserLanguages(languages: string[]) {
  Object.defineProperty(navigator, 'languages', { configurable: true, value: languages });
  Object.defineProperty(navigator, 'language', { configurable: true, value: languages[0] });
}

describe('LocalePreference (decisão D10)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    auth.value = { user: null, profile: null };
    vi.clearAllMocks();
  });
  afterEach(async () => {
    setBrowserLanguages(['pt-BR']);
    await i18n.changeLanguage('pt-BR');
  });

  it('página em português aberta por link mostra o aviso no idioma do navegador', () => {
    setBrowserLanguages(['en-US']);
    renderAt('/eventos');
    expect(screen.getByText('This page is also available in English.')).toBeTruthy();
  });

  it('"View in English" grava a escolha e leva para a mesma página em inglês', () => {
    setBrowserLanguages(['en-US']);
    renderAt('/eventos');
    fireEvent.click(screen.getByRole('button', { name: 'View in English' }));
    expect(screen.getByTestId('path').textContent).toBe('/en/events');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
    expect(screen.queryByText('This page is also available in English.')).toBeNull();
  });

  it('"Continue in Portuguese" grava português e o aviso não volta', () => {
    setBrowserLanguages(['fr-FR']);
    renderAt('/eventos');
    fireEvent.click(screen.getByRole('button', { name: 'Continuer en portugais' }));
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('pt-BR');
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('sem aviso com navegador em português ou em página com idioma na URL', () => {
    setBrowserLanguages(['pt-BR']);
    const { unmount } = renderAt('/eventos');
    expect(screen.queryByRole('region')).toBeNull();
    unmount();
    setBrowserLanguages(['en-US']);
    renderAt('/en/events');
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('a escolha feita com login sobe para a conta', () => {
    setBrowserLanguages(['en-US']);
    auth.value = { user: { uid: 'u1' }, profile: { uid: 'u1', preferredLocale: 'en' } };
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    renderAt('/eventos');
    fireEvent.click(screen.getByRole('button', { name: 'View in English' }));
    expect(updatePreferredLocaleUseCase).toHaveBeenCalledWith('en');
  });

  it('o idioma salvo na conta vale neste aparelho', () => {
    setBrowserLanguages(['pt-BR']);
    auth.value = { user: { uid: 'u1' }, profile: { uid: 'u1', preferredLocale: 'fr' } };
    renderAt('/eventos');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr');
    expect(screen.getByText('Cette page est aussi disponible en français.')).toBeTruthy();
    expect(updatePreferredLocaleUseCase).not.toHaveBeenCalled();
  });

  it('conta sem idioma recebe a escolha feita antes do login', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'fr');
    auth.value = { user: { uid: 'u1' }, profile: { uid: 'u1', preferredLocale: null } };
    await act(async () => {
      renderAt('/fr');
    });
    expect(updatePreferredLocaleUseCase).toHaveBeenCalledWith('fr');
  });
});
