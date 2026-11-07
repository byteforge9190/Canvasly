import { create } from 'zustand';

interface OverlayState {
  openOverlays: Map<
    string,
    {
      triggeredBy: string;
      openedAt: number;
    }
  >;
  open: (id: string, triggerId: string) => void;
  close: (id: string) => void;
  toggle: (id: string, triggerId: string) => void;
  closeAll: () => void;
  isOpen: (id: string) => boolean;
}

// NO persist middleware - ephemeral state only
export const useOverlayStore = create<OverlayState>((set, get) => ({
  openOverlays: new Map(),

  open: (id, triggerId) =>
    set((state) => {
      const next = new Map(state.openOverlays);
      next.set(id, { triggeredBy: triggerId, openedAt: Date.now() });
      return { openOverlays: next };
    }),

  close: (id) =>
    set((state) => {
      const next = new Map(state.openOverlays);
      next.delete(id);
      return { openOverlays: next };
    }),

  toggle: (id, triggerId) =>
    set((state) => {
      const next = new Map(state.openOverlays);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, { triggeredBy: triggerId, openedAt: Date.now() });
      }
      return { openOverlays: next };
    }),

  closeAll: () => set({ openOverlays: new Map() }),

  isOpen: (id) => get().openOverlays.has(id),
}));
