import { create } from "zustand";
import type { Surgery } from "../state/user/uProfileCreationSlice";

type UserProfileCreationStore = {
  surgeryModal: boolean;
  editSurgeryModal: boolean;
  editBasicInfoModal: boolean;
  editData: Surgery & { index: number };
  toggleSurgeryModal: () => void;
  toggleEditSurgeryModal: () => void;
  toggleEditBasicInfoModal: () => void;
  setEditData: (data: Surgery & { index: number }) => void;
};

type UserStore = {
  profileComponent: number;
  setProfileComponent: (value: number) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  profileComponent: 0,
  setProfileComponent(value) {
    set(() => ({
      profileComponent: value,
    }));
  },
}));

export const useUserProfileCreationStore = create<UserProfileCreationStore>(
  (set) => ({
    surgeryModal: false,
    editSurgeryModal: false,
    editBasicInfoModal: false,
    toggleEditBasicInfoModal: () => {
      set((state) => ({
        editBasicInfoModal: !state.editBasicInfoModal,
      }));
    },
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
