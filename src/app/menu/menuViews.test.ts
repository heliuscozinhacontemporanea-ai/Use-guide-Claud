import { describe, expect, it } from 'vitest';
import {
  MENU_VIEWS,
  menuParamFor,
  parentMenuView,
  parseMenuParam,
  visibleMenuView,
} from './menuViews';

describe('sub-telas do menu', () => {
  it('lê o parâmetro da URL: ausente fecha, "1" e desconhecido abrem a tela principal', () => {
    expect(parseMenuParam(null)).toBeNull();
    expect(parseMenuParam('1')).toBe('main');
    expect(parseMenuParam('favorites')).toBe('favorites');
    expect(parseMenuParam('qualquer-coisa')).toBe('main');
  });

  it('ida e volta do parâmetro preserva a sub-tela', () => {
    for (const view of MENU_VIEWS) {
      expect(parseMenuParam(menuParamFor(view))).toBe(view);
    }
  });

  it('voltar leva à tela-mãe: idioma e aparência voltam para configurações, senha para a conta', () => {
    expect(parentMenuView('language')).toBe('settings');
    expect(parentMenuView('appearance')).toBe('settings');
    expect(parentMenuView('purchases')).toBe('settings');
    expect(parentMenuView('password')).toBe('account');
    expect(parentMenuView('favorites')).toBe('main');
    expect(parentMenuView('bookings')).toBe('main');
    expect(parentMenuView('main')).toBe('main');
  });

  it('sem login, telas com dados do usuário mostram a tela principal (com o login)', () => {
    for (const view of [
      'account',
      'password',
      'tickets',
      'bookings',
      'favorites',
      'purchases',
    ] as const) {
      expect(visibleMenuView(view, false)).toBe('main');
      expect(visibleMenuView(view, true)).toBe(view);
    }
    expect(visibleMenuView('settings', false)).toBe('settings');
    expect(visibleMenuView('support', false)).toBe('support');
  });
});
