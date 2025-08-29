import { create } from "zustand";

type AdminStore = {
  sidebarIsClosed: boolean;
  toggle: () => void;
};

export const useAdminStore = create<AdminStore>((set) => ({
  sidebarIsClosed: false,
  toggle: () =>
    set((state) => ({
      sidebarIsClosed: !state.sidebarIsClosed,
    })),
}));
