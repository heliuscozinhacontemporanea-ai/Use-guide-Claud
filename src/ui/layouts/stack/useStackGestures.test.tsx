import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { type StackGestureHandlers, useStackGestures } from './useStackGestures';

function Sheet({ handlers }: { handlers: StackGestureHandlers }) {
  const ref = useRef<HTMLDivElement>(null);
  useStackGestures(
    ref,
    { enabled: true, sheet: true, canGoBack: true, getScroller: () => null },
    handlers
  );
  return (
    <div ref={ref}>
      <p>título</p>
      <div data-gesture-ignore="">mapa</div>
    </div>
  );
}

const handlers = (): StackGestureHandlers => ({
  onSheetDrag: vi.fn(),
  onSheetRelease: vi.fn(),
  onPageDragStart: vi.fn(),
  onPageDrag: vi.fn(),
  onPageRelease: vi.fn(),
});

function drag(target: Element, dx: number, dy: number) {
  fireEvent.pointerDown(target, { pointerType: 'mouse', button: 0, clientX: 50, clientY: 50 });
  fireEvent.pointerMove(window, { pointerType: 'mouse', clientX: 50 + dx, clientY: 50 + dy });
  fireEvent.pointerUp(window, { pointerType: 'mouse', clientX: 50 + dx, clientY: 50 + dy });
}

describe('useStackGestures', () => {
  it('arrastar para baixo fora da área ignorada mexe na folha', () => {
    const h = handlers();
    render(<Sheet handlers={h} />);
    drag(screen.getByText('título'), 0, 200);
    expect(h.onSheetDrag).toHaveBeenCalled();
    expect(h.onSheetRelease).toHaveBeenCalled();
  });

  it('dentro de mapa (data-gesture-ignore) nem fecha a folha nem volta a tela', () => {
    const h = handlers();
    render(<Sheet handlers={h} />);
    drag(screen.getByText('mapa'), 0, 200);
    drag(screen.getByText('mapa'), 200, 0);
    expect(h.onSheetDrag).not.toHaveBeenCalled();
    expect(h.onPageDragStart).not.toHaveBeenCalled();
  });
});
