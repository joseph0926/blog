import { create } from 'zustand';

interface RouteSelectState {
  selected: string[];
  toggle: (route: string) => void;
  reset: () => void;
}

export const useRouteSelect = create<RouteSelectState>((set) => ({
  selected: [],
  toggle: (route) =>
    set((s) =>
      s.selected.includes(route)
        ? { selected: s.selected.filter((r) => r !== route) }
        : { selected: [...s.selected, route] },
    ),
  reset: () => set({ selected: [] }),
}));
