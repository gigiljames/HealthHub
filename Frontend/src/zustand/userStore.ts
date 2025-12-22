import { create } from "zustand";
import type { Surgery } from "../state/user/uProfileCreationSlice";

type UserProfileCreationStore = {
  surgeryModal: boolean;
  editSurgeryModal: boolean;
  editBasicInfoModal: boolean;
  editContactInfoModal: boolean;
  editIllnessModal: boolean;
  editData: Surgery & { index: number };
  toggleSurgeryModal: () => void;
  toggleEditSurgeryModal: () => void;
  toggleEditBasicInfoModal: () => void;
  toggleEditContactInfoModal: () => void;
  toggleEditIllnessModal: () => void;
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
    editIllnessModal: false,
    toggleEditIllnessModal: () => {
      set((state) => ({
        editIllnessModal: !state.editIllnessModal,
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
    editContactInfoModal: false,
    toggleEditContactInfoModal: () => {
      set((state) => ({
        editContactInfoModal: !state.editContactInfoModal,
      }));
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
