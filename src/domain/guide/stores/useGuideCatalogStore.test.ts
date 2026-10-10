import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGuideCatalogStore } from './useGuideCatalogStore';
import { subscribeGuideCatalog } from '../factory';

vi.mock('../factory', () => ({
  subscribeGuideCatalog: vi.fn(),
}));

describe('useGuideCatalogStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGuideCatalogStore.setState({
      items: [],
      events: [],
      loading: true,
      error: null,
      subscriberCount: 0,
      catalogUnsubscribe: null,
    });
  });

  it('cria uma única assinatura para múltiplos consumidores', () => {
    const unsubscribe = vi.fn();
    vi.mocked(subscribeGuideCatalog).mockReturnValue(unsubscribe);

    const releaseA = useGuideCatalogStore.getState().acquire();
    const releaseB = useGuideCatalogStore.getState().acquire();

    expect(subscribeGuideCatalog).toHaveBeenCalledTimes(1);
    expect(useGuideCatalogStore.getState().subscriberCount).toBe(2);

    releaseA();
    expect(unsubscribe).not.toHaveBeenCalled();
    expect(useGuideCatalogStore.getState().subscriberCount).toBe(1);

    releaseB();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(useGuideCatalogStore.getState().subscriberCount).toBe(0);
  });

  it('atualiza items e events', () => {
    let callback: ((data: { items: unknown[]; events: unknown[] }) => void) | undefined;

    vi.mocked(subscribeGuideCatalog).mockImplementation((onUpdate) => {
      callback = onUpdate as typeof callback;
      return vi.fn();
    });

    const release = useGuideCatalogStore.getState().acquire();

    const items = [
      {
        id: 'item-1',
        name: 'Hotel Sol',
      },
    ];
    const events = [
      {
        id: 'event-1',
        name: 'Festival',
      },
    ];

    callback?.({
      items,
      events,
    });

    const state = useGuideCatalogStore.getState();

    expect(state.items).toEqual(items);
    expect(state.events).toEqual(events);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();

    release();
  });

  it('não executa unsubscribe duas vezes para o mesmo consumidor', () => {
    const unsubscribe = vi.fn();
    vi.mocked(subscribeGuideCatalog).mockReturnValue(unsubscribe);

    const release = useGuideCatalogStore.getState().acquire();

    release();
    release();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
