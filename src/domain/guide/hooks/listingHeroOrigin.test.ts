import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  copyCardOverlays,
  findListingOrigin,
  LISTING_CARD_ATTR,
  LISTING_PHOTO_ATTR,
  rememberTappedCard,
} from './listingHeroOrigin';

const ON_SCREEN = { left: 16, top: 100, width: 200, height: 200 };
const OFF_SCREEN = { left: 16, top: -400, width: 200, height: 200 };

function card(itemId: string, rect: typeof ON_SCREEN) {
  const element = document.createElement('button');
  element.setAttribute(LISTING_CARD_ATTR, itemId);
  const photo = document.createElement('span');
  photo.setAttribute(LISTING_PHOTO_ATTR, '');
  photo.getBoundingClientRect = () =>
    ({ ...rect, right: rect.left + rect.width, bottom: rect.top + rect.height }) as DOMRect;
  element.append(photo);
  document.body.append(element);
  return { element, photo };
}

describe('findListingOrigin', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('o mesmo anúncio em dois carrosséis: vale o cartão tocado', () => {
    const first = card('buggy', ON_SCREEN);
    const tapped = card('buggy', ON_SCREEN);
    rememberTappedCard(tapped.element);
    expect(findListingOrigin('buggy')).toEqual({ card: tapped.element, photo: tapped.photo });
    expect(findListingOrigin('buggy')?.card).not.toBe(first.element);
  });

  it('sem toque, usa o primeiro cartão do anúncio com a foto na tela', () => {
    card('buggy', OFF_SCREEN);
    const visible = card('buggy', ON_SCREEN);
    card('lagoa', ON_SCREEN);
    expect(findListingOrigin('buggy')?.photo).toBe(visible.photo);
  });

  it('cartão tocado que saiu da tela ou é de outro anúncio não serve', () => {
    const tapped = card('buggy', OFF_SCREEN);
    rememberTappedCard(tapped.element);
    expect(findListingOrigin('buggy')).toBeNull();
    expect(findListingOrigin('lagoa')).toBeNull();
  });
});

describe('copyCardOverlays', () => {
  const rect = (left: number, top: number, width: number, height: number) =>
    ({ left, top, width, height, right: left + width, bottom: top + height }) as DOMRect;
  const layout = (element: HTMLElement, width: number, height: number, left = 0, top = 0) => {
    Object.defineProperties(element, {
      offsetWidth: { value: width },
      offsetHeight: { value: height },
      offsetLeft: { value: left },
      offsetTop: { value: top },
    });
  };

  it('copia só o que fica sobre a foto, no tamanho e com os cantos do cartão', () => {
    const card = document.createElement('button');
    const photo = document.createElement('span');
    const caption = document.createElement('span');
    caption.textContent = 'Buggy do Preá';
    const beside = document.createElement('span');
    beside.textContent = 'ao lado';
    card.append(photo, caption, beside);
    document.body.append(card);
    photo.getBoundingClientRect = () => rect(0, 0, 200, 200);
    caption.getBoundingClientRect = () => rect(0, 140, 200, 60);
    beside.getBoundingClientRect = () => rect(210, 0, 100, 200);
    layout(card, 200, 200);
    layout(photo, 200, 200);
    const into = document.createElement('div');

    const copy = copyCardOverlays({ card, photo }, into);
    expect(copy.layout).toEqual({
      width: 200,
      height: 200,
      photoLeft: 0,
      photoTop: 0,
      photoWidth: 200,
      photoHeight: 200,
    });
    // A foto cobre o cartão: ele sai de cena inteiro enquanto a capa o representa.
    expect(copy.covered).toEqual([card]);
    expect(into.textContent).toBe('Buggy do Preá');
    expect(into.style.width).toBe('200px');
    // O original continua no cartão.
    expect(card.contains(caption)).toBe(true);
  });

  it('cartão com o texto ao lado da foto: nada a copiar', () => {
    const card = document.createElement('button');
    const photo = document.createElement('span');
    const beside = document.createElement('span');
    card.append(photo, beside);
    photo.getBoundingClientRect = () => rect(0, 0, 100, 160);
    beside.getBoundingClientRect = () => rect(100, 0, 240, 160);
    layout(photo, 100, 160);
    // Só a foto sai de cena; o texto ao lado continua à vista.
    expect(copyCardOverlays({ card, photo }, document.createElement('div'))).toEqual({
      layout: null,
      covered: [photo],
    });
  });
});
