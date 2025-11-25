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
  hospitalManagementPage: string;
  showHospitalCard: boolean;
  hospitalId: string;
  toggle: () => void;
  setUserManagementPage: (page: string) => void;
  setHospitalManagementPage: (page: string) => void;
  setHospitalId: (id: string) => void;
  toggleHospitalCard: () => void;
};

export const useAdminStore = create<AdminStore>((set) => ({
  sidebarIsClosed: false,
  userManagementPage: "manage-users",
  showUserCard: false,
  userId: "",
  hospitalManagementPage: "manage-hospitals",
  showHospitalCard: false,
  hospitalId: "",
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
  setHospitalManagementPage: (page: string) => {
    set(() => ({
      hospitalManagementPage: page,
    }));
  },
  setHospitalId: (id) => set(() => ({ hospitalId: id })),
  toggleHospitalCard() {
    set((state) => ({
      showHospitalCard: !state.showHospitalCard,
    }));
  },
}));
