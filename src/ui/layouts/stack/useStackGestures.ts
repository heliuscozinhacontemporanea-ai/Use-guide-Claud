import { type RefObject, useEffect, useRef } from 'react';
import { DRAG_SLOP_PX } from '../../motion/tokens';

export interface StackGestureHandlers {
  /** Arrastar na vertical: a folha segue o dedo (dy > 0 para baixo). */
  onSheetDrag: (dy: number) => void;
  onSheetRelease: (dy: number, velocityY: number) => void;
  /** Arrastar da esquerda para a direita: a tela de cima segue o dedo. */
  onPageDragStart: () => void;
  onPageDrag: (dx: number) => void;
  onPageRelease: (dx: number, velocityX: number) => void;
}

interface GestureOptions {
  enabled: boolean;
  /** Arrastar na vertical mexe numa folha (fechar). Sem folha (`PushStack`), a vertical é só rolagem. */
  sheet?: boolean;
  /** Há tela para voltar (o arrasto para a direita só vale fora da primeira). */
  canGoBack: boolean;
  /** Rolagem da tela de cima: o conteúdo que rola tem prioridade sobre fechar a folha. */
  getScroller: () => HTMLElement | null;
}

const INTERACTIVE =
  'button, a, input, select, textarea, label, [role="button"], [role="switch"], [role="slider"]';

/** Algum ancestral rola para os lados (carrossel, mapa): o gesto de voltar não começa ali. */
function insideHorizontalScroller(target: Element, root: Element): boolean {
  for (let el: Element | null = target; el && el !== root; el = el.parentElement) {
    if (el instanceof HTMLElement && el.scrollWidth > el.clientWidth + 1) {
      const overflow = getComputedStyle(el).overflowX;
      if (overflow === 'auto' || overflow === 'scroll') return true;
    }
    if (el instanceof HTMLElement && el.dataset.gestureIgnore !== undefined) return true;
  }
  return false;
}

type Axis = 'sheet' | 'page' | 'none';
interface Track {
  x0: number;
  y0: number;
  axis: Axis | null;
  onInteractive: boolean;
  inScroller: boolean;
  scrollTop: number;
  canScroll: boolean;
  samples: Array<[number, number, number]>;
}

/**
 * Gestos da folha em pilha (DESIGN.md P18, D33): para baixo fecha a folha (quando o conteúdo está no
 * topo); da esquerda para a direita volta uma tela, menos começando em cima de botão. Toque e mouse.
 * Mais de 8 px de movimento vira arraste e o toque que estava embaixo do dedo não é acionado.
 */
export function useStackGestures(
  ref: RefObject<HTMLElement | null>,
  options: GestureOptions,
  handlers: StackGestureHandlers
) {
  const latest = useRef({ options, handlers });
  latest.current = { options, handlers };

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let track: Track | null = null;
    let swallowClick = false;

    const start = (x: number, y: number, target: EventTarget | null, time: number) => {
      const { options: opts } = latest.current;
      if (!opts.enabled || !(target instanceof Element)) return;
      const scroller = opts.getScroller();
      swallowClick = false;
      track = {
        x0: x,
        y0: y,
        axis: null,
        onInteractive: !!target.closest(INTERACTIVE),
        inScroller: insideHorizontalScroller(target, root),
        scrollTop: scroller?.scrollTop ?? 0,
        canScroll: scroller ? scroller.scrollHeight > scroller.clientHeight + 1 : false,
        samples: [[time, x, y]],
      };
    };

    /** Devolve true quando o movimento é do gesto (e o padrão do navegador deve ser impedido). */
    const move = (x: number, y: number, time: number): boolean => {
      if (!track) return false;
      const { options: opts, handlers: h } = latest.current;
      const dx = x - track.x0;
      const dy = y - track.y0;
      track.samples.push([time, x, y]);
      if (track.samples.length > 6) track.samples.shift();
      if (track.axis === null) {
        if (Math.hypot(dx, dy) < DRAG_SLOP_PX) return false;
        swallowClick = true;
        if (Math.abs(dy) > Math.abs(dx)) {
          const atTop = track.scrollTop <= 0;
          const sheetDrag = (dy > 0 && atTop) || (dy < 0 && !track.canScroll);
          track.axis = opts.sheet !== false && sheetDrag ? 'sheet' : 'none';
        } else {
          const back = dx > 0 && opts.canGoBack && !track.onInteractive && !track.inScroller;
          track.axis = back ? 'page' : 'none';
          if (back) h.onPageDragStart();
        }
      }
      if (track.axis === 'sheet') h.onSheetDrag(dy);
      else if (track.axis === 'page') h.onPageDrag(Math.max(0, dx));
      return track.axis === 'sheet' || track.axis === 'page';
    };

    const end = () => {
      if (!track) return;
      const { handlers: h } = latest.current;
      const first = track.samples[0] ?? [0, track.x0, track.y0];
      const last = track.samples[track.samples.length - 1] ?? first;
      const [t0, x0, y0] = first;
      const [t1, x1, y1] = last;
      const dt = Math.max(1, t1 - t0) / 1000;
      const vx = (x1 - x0) / dt;
      const vy = (y1 - y0) / dt;
      const dx = x1 - track.x0;
      const dy = y1 - track.y0;
      if (track.axis === 'sheet') h.onSheetRelease(dy, vy);
      else if (track.axis === 'page') h.onPageRelease(Math.max(0, dx), vx);
      track = null;
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (e.touches.length !== 1 || !t) return;
      start(t.clientX, t.clientY, e.target, e.timeStamp);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t && move(t.clientX, t.clientY, e.timeStamp) && e.cancelable) e.preventDefault();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      start(e.clientX, e.clientY, e.target, e.timeStamp);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (move(e.clientX, e.clientY, e.timeStamp)) e.preventDefault();
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') end();
    };
    const onClick = (e: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      e.stopPropagation();
      e.preventDefault();
    };

    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove', onTouchMove, { passive: false });
    root.addEventListener('touchend', end);
    root.addEventListener('touchcancel', end);
    root.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    root.addEventListener('click', onClick, true);
    return () => {
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove', onTouchMove);
      root.removeEventListener('touchend', end);
      root.removeEventListener('touchcancel', end);
      root.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      root.removeEventListener('click', onClick, true);
    };
  }, [ref]);
}
