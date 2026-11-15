import {
  animate,
  easeIn,
  easeOut,
  type MotionValue,
  spring,
  useMotionValue,
  usePresence,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';
import { type FramePlayback, playFromFirstFrame } from '../../../ui/motion/playFromFirstFrame';
import {
  FADE,
  HERO_BACKDROP_IN,
  HERO_BACKDROP_OUT,
  HERO_CLOSE,
  HERO_OPEN,
} from '../../../ui/motion/tokens';
import { type HeroGeometry, heroFrame, type Rect } from '../utils/listingHeroFrame';
import { copyCardOverlays, findListingOrigin, type ListingOrigin } from './listingHeroOrigin';

const toRect = (element: Element): Rect => {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { left, top, width, height };
};

function measure(origin: ListingOrigin, hero: HTMLElement): HeroGeometry {
  return {
    cardPhoto: toRect(origin.photo),
    card: toRect(origin.card),
    cardRadius: Number.parseFloat(getComputedStyle(origin.card).borderTopLeftRadius) || 0,
    hero: toRect(hero),
    viewport: { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight },
  };
}

export interface ListingHeroStyles {
  /** Fechando, os toques já vão para a lista de baixo (como no Fotos do iPhone). */
  layer: { pointerEvents: MotionValue<string> };
  /** Fundo do anúncio (a tela de baixo aparece enquanto ele não está opaco). */
  backdrop: MotionValue<number>;
  page: {
    opacity: MotionValue<number>;
    clipPath: MotionValue<string>;
    visibility: MotionValue<string>;
  };
  photo: {
    x: MotionValue<number>;
    y: MotionValue<number>;
    scale: MotionValue<number>;
    clipPath: MotionValue<string>;
  };
  content: { y: MotionValue<number>; opacity: MotionValue<number> };
  /** Fechar, favoritar e compartilhar: aparecem quando a foto chega. */
  chrome: { opacity: MotionValue<number> };
  /** Degradê da capa, que dá leitura aos botões: entra na segunda metade do caminho. */
  shade: { opacity: MotionValue<number> };
  /** Nome e etiquetas do cartão sobre a foto: esmaecem na primeira metade do caminho. */
  cardLook: {
    x: MotionValue<number>;
    y: MotionValue<number>;
    scale: MotionValue<number>;
    opacity: MotionValue<number>;
  };
  /**
   * X ou Esc: a foto volta para o cartão primeiro e `onClosed` roda quando ela pousa, com a tela
   * parada (a troca de endereço refaz a tela e travaria o começo da volta). Não roda se o anúncio já
   * saiu por outro caminho nesse meio-tempo (outro cartão tocado). O voltar do sistema fecha quando o
   * anúncio sai da tela.
   */
  close: (onClosed: () => void) => void;
}

/**
 * A foto do cartão tocado vira a capa do anúncio e o conteúdo desce junto; ao fechar, tudo recolhe e
 * a foto volta para o cartão (efeito do vídeo de referência, 2026-11-15). Sem cartão na tela (link,
 * voltar, busca) ou com "reduzir movimento", o anúncio só esmaece.
 */
export function useListingHero({
  itemId,
  enabled,
  heroRef,
  cardLookRef,
}: {
  itemId: string;
  /** Aberto por um toque no cartão (`growsFromCard`). */
  enabled: boolean;
  heroRef: RefObject<HTMLElement | null>;
  /** Onde fica a cópia do que está sobre a foto do cartão. */
  cardLookRef: RefObject<HTMLElement | null>;
}): ListingHeroStyles {
  const reduced = useReducedMotion();
  const [isPresent, safeToRemove] = usePresence();
  const progress = useMotionValue(1);
  const backdrop = useMotionValue(0);
  const fade = useMotionValue(1);
  // Escondido até o primeiro quadro da animação: nada de anúncio inteiro antes de a foto sair do cartão.
  const visibility = useMotionValue('hidden');
  const geometry = useRef<HeroGeometry | null>(null);
  const origin = useRef<ListingOrigin | null>(null);
  const closing = useRef<Promise<void> | null>(null);
  const openFrame = useRef(0);
  const opening = useRef<FramePlayback | null>(null);
  const pointerEvents = useMotionValue('auto');
  const present = useRef(isPresent);
  present.current = isPresent;

  // O que do cartão sai de cena enquanto a capa (e a cópia do que fica sobre a foto) o representa.
  const covered = useRef<HTMLElement[]>([]);
  const restoreCard = () => {
    for (const element of covered.current) element.style.visibility = '';
  };

  // O anúncio monta e pinta pela primeira vez parado sobre o cartão, e a abertura começa depois disso,
  // contando o tempo do primeiro quadro que ela desenha (`playFromFirstFrame`). Com o `animate` criado
  // na montagem, a primeira pintura (pesada no celular) entrava na mola e a foto pulava ~40% do caminho.
  const afterFirstPaint = (step: (elapsedMs: number) => boolean) => {
    openFrame.current = requestAnimationFrame(() => {
      openFrame.current = requestAnimationFrame(() => {
        opening.current = playFromFirstFrame(step);
      });
    });
  };
  const fadeIn = (
    elapsedMs: number,
    transition: { duration: number },
    ease: (t: number) => number
  ) => ease(Math.min(1, elapsedMs / (transition.duration * 1000)));

  // biome-ignore lint/correctness/useExhaustiveDependencies: mede e anima uma vez, ao abrir.
  useLayoutEffect(() => {
    const found = enabled && !reduced ? findListingOrigin(itemId) : null;
    const hero = heroRef.current;
    if (found && hero) {
      origin.current = found;
      const look = cardLookRef.current;
      const copy = look ? copyCardOverlays(found, look) : { layout: null, covered: [found.photo] };
      covered.current = copy.covered;
      geometry.current = { ...measure(found, hero), cardLayout: copy.layout ?? undefined };
      progress.set(0);
      visibility.set('visible');
      const photo = spring({ keyframes: [0, 1], ...HERO_OPEN });
      afterFirstPaint((elapsed) => {
        // O cartão sai de cena no quadro em que a capa começa a sair dele. Não usar um ouvinte de
        // `progress` que se remove na própria chamada: o Motion percorre os ouvintes por posição, e o
        // seguinte (o recorte da página) perdia o primeiro quadro, que dava um pulo.
        for (const element of covered.current) element.style.visibility = 'hidden';
        const { value, done } = photo.next(elapsed);
        progress.set(done ? 1 : value);
        backdrop.set(fadeIn(elapsed, HERO_BACKDROP_IN, easeIn));
        return done && backdrop.get() === 1;
      });
    } else {
      fade.set(0);
      visibility.set('visible');
      afterFirstPaint((elapsed) => {
        fade.set(fadeIn(elapsed, FADE, easeOut));
        backdrop.set(fade.get());
        return fade.get() === 1;
      });
    }
    return () => {
      cancelAnimationFrame(openFrame.current);
      opening.current?.stop();
      restoreCard();
    };
  }, []);

  const close = () => {
    if (closing.current) return closing.current;
    // Fechou antes de a abertura começar ou no meio dela: a abertura para onde está.
    cancelAnimationFrame(openFrame.current);
    opening.current?.stop();
    pointerEvents.set('none');
    const found = origin.current;
    const hero = heroRef.current;
    // Volta para o cartão só se ele continua na tela e a capa não foi rolada para fora.
    const backToCard =
      !reduced &&
      found?.photo.isConnected &&
      hero &&
      hero.getBoundingClientRect().bottom > 80 &&
      findListingOrigin(itemId)?.photo === found.photo;
    let done: Promise<unknown>;
    if (backToCard && found && hero) {
      // Fechar no meio da abertura continua da posição atual; parado, mede de novo (a página pode ter rolado).
      if (progress.get() >= 1) {
        geometry.current = { ...measure(found, hero), cardLayout: geometry.current?.cardLayout };
      }
      void animate(backdrop, 0, HERO_BACKDROP_OUT);
      done = animate(progress, 0, HERO_CLOSE).finished;
    } else {
      geometry.current = null;
      void animate(backdrop, 0, FADE);
      done = animate(fade, 0, FADE).finished;
    }
    closing.current = done.then(restoreCard);
    return closing.current;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: a saída começa uma vez, quando o anúncio fecha.
  useEffect(() => {
    if (!isPresent) void close().then(() => safeToRemove?.());
  }, [isPresent]);

  const frame = (p: number) => (geometry.current ? heroFrame(geometry.current, p) : null);
  return {
    layer: { pointerEvents },
    backdrop,
    page: {
      opacity: fade,
      clipPath: useTransform(progress, (p) => frame(p)?.pageClipPath ?? 'none'),
      visibility,
    },
    photo: {
      x: useTransform(progress, (p) => frame(p)?.photo.x ?? 0),
      y: useTransform(progress, (p) => frame(p)?.photo.y ?? 0),
      scale: useTransform(progress, (p) => frame(p)?.photo.scale ?? 1),
      clipPath: useTransform(progress, (p) => frame(p)?.photo.clipPath ?? 'none'),
    },
    content: {
      y: useTransform(progress, (p) => frame(p)?.contentY ?? 0),
      opacity: backdrop,
    },
    chrome: { opacity: useTransform(progress, [0.8, 1], [0, 1]) },
    shade: { opacity: useTransform(progress, [0.5, 1], [0, 1]) },
    cardLook: {
      x: useTransform(progress, (p) => frame(p)?.cardLook?.x ?? 0),
      y: useTransform(progress, (p) => frame(p)?.cardLook?.y ?? 0),
      scale: useTransform(progress, (p) => frame(p)?.cardLook?.scale ?? 1),
      opacity: useTransform(progress, [0, 0.5], [1, 0]),
    },
    close: (onClosed) => {
      if (closing.current) return;
      void close().then(() => present.current && onClosed());
    },
  };
}
