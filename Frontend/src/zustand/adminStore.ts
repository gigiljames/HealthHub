import { create } from "zustand";

type AdminStore = {
  sidebarIsClosed: boolean;
  userManagementPage: string;
  showUserCard: boolean;
  userId: string;
  toggle: () => void;
  setUserManagementPage: (page: string) => void;
  toggleUserCard: () => void;
  setUserId: (id: string) => void;
};

export const useAdminStore = create<AdminStore>((set) => ({
  sidebarIsClosed: false,
  userManagementPage: "manage-users",
  showUserCard: false,
  userId: "",
  toggle: () =>
    set((state) => ({
      sidebarIsClosed: !state.sidebarIsClosed,
    })),
  setUserManagementPage: (page: string) => {
    set(() => ({
      userManagementPage: page,
    }));
  },
  toggleUserCard() {
    set((state) => ({
      showUserCard: !state.showUserCard,
    }));
  },
  setUserId(id) {
    set(() => ({
      userId: id,
    }));
  },
}));
