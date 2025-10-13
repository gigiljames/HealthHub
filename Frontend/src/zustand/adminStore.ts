import { create } from "zustand";

type AdminStore = {
  sidebarIsClosed: boolean;
  userManagementPage: string;
  toggle: () => void;
  setUserManagementPage: (page: string) => void;
};

export const useAdminStore = create<AdminStore>((set) => ({
  sidebarIsClosed: false,
  userManagementPage: "manage-users",
  toggle: () =>
    set((state) => ({
      sidebarIsClosed: !state.sidebarIsClosed,
    })),
  setUserManagementPage: (page: string) => {
    set(() => ({
      userManagementPage: page,
    }));
  },
}));
