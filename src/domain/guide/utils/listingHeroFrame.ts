export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** De onde a foto sai (o cartão tocado) e para onde vai (a capa do anúncio), na tela. */
export interface HeroGeometry {
  /** A foto dentro do cartão. */
  cardPhoto: Rect;
  /** O cartão inteiro: o anúncio se abre a partir dele. */
  card: Rect;
  cardRadius: number;
  /** A capa do anúncio no lugar dela (sem transformação). */
  hero: Rect;
  viewport: Rect;
}

export interface HeroFrame {
  /** Na capa, com origem no canto de cima à esquerda. */
  photo: { x: number; y: number; scale: number; clipPath: string };
  /** O conteúdo acompanha a parte de baixo da foto. */
  contentY: number;
  /** A área do anúncio que aparece: do cartão à tela inteira. */
  pageClipPath: string;
}

export function lerpRect(from: Rect, to: Rect, p: number): Rect {
  const mix = (a: number, b: number) => a + (b - a) * p;
  return {
    left: mix(from.left, to.left),
    top: mix(from.top, to.top),
    width: mix(from.width, to.width),
    height: mix(from.height, to.height),
  };
}

const px = (value: number) => `${Math.round(value * 100) / 100}px`;

/**
 * Um quadro da foto que cresce do cartão (p = 0) até a capa (p = 1). A foto sempre cobre a área
 * visível, como no Fotos do iPhone: o recorte do cartão vai se abrindo até a foto inteira. Só usa
 * transformação e recorte, sem mexer no tamanho dos elementos (DESIGN.md P9).
 */
export function heroFrame(geometry: HeroGeometry, p: number): HeroFrame {
  const { hero, cardPhoto, card, viewport, cardRadius } = geometry;
  const visible = lerpRect(cardPhoto, hero, p);
  const scale = Math.max(visible.width / hero.width, visible.height / hero.height);
  const x = visible.left + visible.width / 2 - hero.left - (scale * hero.width) / 2;
  const y = visible.top + visible.height / 2 - hero.top - (scale * hero.height) / 2;
  const insetX = Math.max(0, (hero.width - visible.width / scale) / 2);
  const insetY = Math.max(0, (hero.height - visible.height / scale) / 2);
  // Os cantos arredondados vêm do recorte da página, que é o contorno do cartão: a foto do cartão só
  // é arredondada onde encosta nos cantos dele (no cartão horizontal, os da direita são retos).
  const radius = cardRadius * (1 - p);
  const page = lerpRect(card, viewport, p);
  return {
    photo: { x, y, scale, clipPath: `inset(${px(insetY)} ${px(insetX)})` },
    contentY: visible.top + visible.height - (hero.top + hero.height),
    pageClipPath: `inset(${px(page.top)} ${px(viewport.width - page.left - page.width)} ${px(
      viewport.height - page.top - page.height
    )} ${px(page.left)} round ${px(radius)})`,
  };
}
