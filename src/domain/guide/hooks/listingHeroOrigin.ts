import type { CardLayout } from '../utils/listingHeroFrame';

/** Atributos que marcam o cartão e a foto dele, de onde a capa do anúncio sai. */
export const LISTING_CARD_ATTR = 'data-listing-card';
export const LISTING_PHOTO_ATTR = 'data-listing-photo';

// O mesmo anúncio pode estar em dois carrosséis: vale o cartão que a pessoa tocou.
let tappedCard: HTMLElement | null = null;

/** O cartão chama no toque, antes de abrir o anúncio. */
export function rememberTappedCard(card: HTMLElement) {
  tappedCard = card;
}

export interface ListingOrigin {
  card: HTMLElement;
  photo: HTMLElement;
}

function visiblePhoto(card: HTMLElement | null, itemId: string): ListingOrigin | null {
  if (!card?.isConnected || card.getAttribute(LISTING_CARD_ATTR) !== itemId) return null;
  const photo = card.querySelector<HTMLElement>(`[${LISTING_PHOTO_ATTR}]`);
  if (!photo) return null;
  const rect = photo.getBoundingClientRect();
  const onScreen = rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
  return onScreen ? { card, photo } : null;
}

/** O cartão do anúncio visível na tela, de preferência o que foi tocado; `null` se não houver. */
export function findListingOrigin(itemId: string): ListingOrigin | null {
  const tapped = visiblePhoto(tappedCard, itemId);
  if (tapped) return tapped;
  for (const card of document.querySelectorAll<HTMLElement>(`[${LISTING_CARD_ATTR}]`)) {
    const found = visiblePhoto(card, itemId);
    if (found) return found;
  }
  return null;
}

const isOver = (inner: DOMRect, outer: DOMRect) =>
  inner.left >= outer.left - 1 &&
  inner.right <= outer.right + 1 &&
  inner.top >= outer.top - 1 &&
  inner.bottom <= outer.bottom + 1;

export interface CardOverlayCopy {
  /** O cartão no tamanho de layout; `null` se não há nada sobre a foto (cartão horizontal). */
  layout: CardLayout | null;
  /**
   * O que sai de cena enquanto a capa e a cópia o representam: o cartão inteiro, quando a foto o
   * cobre; senão, a foto e o que foi copiado (o texto ao lado da foto continua à vista).
   */
  covered: HTMLElement[];
}

/**
 * Copia para `into` o que fica sobre a foto do cartão (nome, etiquetas, nota, degradê), no tamanho do
 * cartão, para esmaecer por cima da foto que cresce em vez de sumir no toque.
 */
export function copyCardOverlays(
  { card, photo }: ListingOrigin,
  into: HTMLElement
): CardOverlayCopy {
  const photoRect = photo.getBoundingClientRect();
  const originals = [...card.children].filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement &&
      child !== photo &&
      isOver(child.getBoundingClientRect(), photoRect)
  );
  if (originals.length === 0 || photo.offsetWidth === 0) return { layout: null, covered: [photo] };
  into.replaceChildren(...originals.map((child) => child.cloneNode(true)));
  // Por dentro da borda do cartão: é onde a foto e o que fica sobre ela se posicionam.
  const width = card.clientWidth;
  const height = card.clientHeight;
  into.style.width = `${width}px`;
  into.style.height = `${height}px`;
  const photoCoversCard = photo.offsetWidth >= width - 1 && photo.offsetHeight >= height - 1;
  return {
    layout: {
      width,
      height,
      photoLeft: photo.offsetLeft,
      photoTop: photo.offsetTop,
      photoWidth: photo.offsetWidth,
      photoHeight: photo.offsetHeight,
    },
    covered: photoCoversCard ? [card] : [photo, ...originals],
  };
}
