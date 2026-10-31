/**
 * Sub-telas do menu lateral. A tela aberta fica na URL (`?menu=<view>`), então o menu pode ser
 * aberto direto numa sub-tela (ex: "Ver minhas reservas" depois do pagamento) e sobrevive ao recarregar.
 */
export const MENU_VIEWS = [
  'main',
  'account',
  'password',
  'tickets',
  'bookings',
  'favorites',
  'reviews',
  'settings',
  'purchases',
  'username',
  'language',
  'appearance',
  'support',
  'about',
] as const;
export type MenuView = (typeof MENU_VIEWS)[number];

const MAIN_MENU_PARAM = '1';

/** Para onde o botão "voltar" de cada sub-tela leva. */
const PARENT_VIEW: Record<Exclude<MenuView, 'main'>, MenuView> = {
  account: 'main',
  password: 'account',
  tickets: 'main',
  bookings: 'main',
  favorites: 'main',
  reviews: 'main',
  settings: 'main',
  purchases: 'settings',
  username: 'settings',
  language: 'settings',
  appearance: 'settings',
  support: 'settings',
  about: 'settings',
};

/** Sub-telas com dados do próprio usuário: sem login, o menu mostra a tela principal (com o login). */
const PRIVATE_VIEWS: readonly MenuView[] = [
  'account',
  'password',
  'tickets',
  'bookings',
  'favorites',
  'reviews',
  'purchases',
  'username',
];

function isMenuView(value: string): value is MenuView {
  return (MENU_VIEWS as readonly string[]).includes(value);
}

/** `null` = menu fechado. Valor desconhecido abre a tela principal. */
export function parseMenuParam(value: string | null): MenuView | null {
  if (value === null) return null;
  return isMenuView(value) ? value : 'main';
}

export function menuParamFor(view: MenuView): string {
  return view === 'main' ? MAIN_MENU_PARAM : view;
}

export function parentMenuView(view: MenuView): MenuView {
  return view === 'main' ? 'main' : PARENT_VIEW[view];
}

export function visibleMenuView(view: MenuView, isAuthenticated: boolean): MenuView {
  return !isAuthenticated && PRIVATE_VIEWS.includes(view) ? 'main' : view;
}
