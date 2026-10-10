import { create } from 'zustand';

interface AppState {
  activeCategoryFilter: string | null;
  searchQuery: string;
  setCategoryFilter: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeCategoryFilter: null,
  searchQuery: '',

  setCategoryFilter: (category) => set({ activeCategoryFilter: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  resetFilters: () => set({ activeCategoryFilter: null, searchQuery: '' }),
}));
