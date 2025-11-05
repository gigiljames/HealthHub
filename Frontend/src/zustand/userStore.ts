import { create } from "zustand";
import type { Surgery } from "../state/user/uProfileCreationSlice";

type UserProfileCreationStore = {
  surgeryModal: boolean;
  editSurgeryModal: boolean;
  editData: Surgery & { index: number };
  toggleSurgeryModal: () => void;
  toggleEditSurgeryModal: () => void;
  setEditData: (data: Surgery & { index: number }) => void;
};

export const useUserProfileCreationStore = create<UserProfileCreationStore>(
  (set) => ({
    surgeryModal: false,
    editSurgeryModal: false,
    editData: {
      year: "",
      surgeryName: "",
      reason: "",
      surgeryType: "",
      doctor: "",
      hospital: "",
      index: -1,
    },
    toggleSurgeryModal: () => {
      set((state) => ({
        surgeryModal: !state.surgeryModal,
      }));
    },
    toggleEditSurgeryModal: () => {
      set((state) => ({
        editSurgeryModal: !state.editSurgeryModal,
      }));
    },
    setEditData(data) {
      set(() => ({
        editData: data,
      }));
    },
  })
);
