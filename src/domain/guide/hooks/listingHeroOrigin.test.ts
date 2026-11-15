import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
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
