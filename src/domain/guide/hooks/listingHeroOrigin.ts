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
