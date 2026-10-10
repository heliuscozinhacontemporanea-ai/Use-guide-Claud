import { create } from 'zustand';
import { subscribeGuideCatalog } from '../factory';
import { GuideItem } from '../types/guide';

interface GuideCatalogState {
  items: GuideItem[];
  events: GuideItem[];
  loading: boolean;
  error: string | null;
  subscriberCount: number;
  catalogUnsubscribe: (() => void) | null;
  acquire: () => () => void;
  retry: () => void;
}

export const useGuideCatalogStore = create<GuideCatalogState>((set, get) => ({
  items: [],
  events: [],
  loading: true,
  error: null,
  subscriberCount: 0,
  catalogUnsubscribe: null,

  acquire: () => {
    const current = get();
    set({
      subscriberCount: current.subscriberCount + 1,
    });

    if (current.subscriberCount === 0) {
      const unsubscribe = subscribeGuideCatalog(
        ({ items, events }) => {
          set({
            items,
            events,
            loading: false,
            error: null,
          });
        },
        (error) => {
          console.error('[GuideCatalogStore]', error);
          set({
            loading: false,
            error: 'Não foi possível carregar o conteúdo do guia agora.',
          });
        }
      );

      set({
        catalogUnsubscribe: unsubscribe,
        loading: true,
        error: null,
      });
    }

    let released = false;
    return () => {
      if (released) {
        return;
      }
      released = true;
      const state = get();
      const nextCount = Math.max(0, state.subscriberCount - 1);

      if (nextCount === 0) {
        state.catalogUnsubscribe?.();
        set({
          subscriberCount: 0,
          catalogUnsubscribe: null,
        });
        return;
      }

      set({
        subscriberCount: nextCount,
      });
    };
  },

  retry: () => {
    const current = get();
    current.catalogUnsubscribe?.();
    set({
      items: [],
      events: [],
      loading: true,
      error: null,
      catalogUnsubscribe: null,
    });

    if (current.subscriberCount > 0) {
      const unsubscribe = subscribeGuideCatalog(
        ({ items, events }) => {
          set({
            items,
            events,
            loading: false,
            error: null,
          });
        },
        (error) => {
          console.error('[GuideCatalogStore]', error);
          set({
            loading: false,
            error: 'Não foi possível carregar o conteúdo do guia agora.',
          });
        }
      );

      set({
        catalogUnsubscribe: unsubscribe,
      });
    }
  },
}));
