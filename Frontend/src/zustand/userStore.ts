import { create } from "zustand";

type UserProfileCreationStore = {
  surgeryModal: boolean;
  toggleSurgeryModal: () => void;
};

export const useUserProfileCreationStore = create<UserProfileCreationStore>(
  (set) => ({
    surgeryModal: false,
    toggleSurgeryModal: () => {
      set((state) => ({
        surgeryModal: !state.surgeryModal,
      }));
    },
  })
);
