import { create } from "zustand";

type DoctorProfileCreationStore = {
  educationModal: boolean;
  toggleEducationModal: () => void;
  experienceModal: boolean;
  toggleExperienceModal: () => void;
};

export const useDoctorProfileCreationStore = create<DoctorProfileCreationStore>(
  (set) => ({
    educationModal: false,
    experienceModal: false,

    toggleEducationModal: () => {
      set((state) => ({ ...state, educationModal: !state.educationModal }));
    },
    toggleExperienceModal: () => {
      set((state) => ({ ...state, experienceModal: !state.experienceModal }));
    },
  })
);

type DoctorSlotManagementStore = {
  createSlotModal: boolean;
  editSlotModal: boolean;
  recurr: boolean;
  toggleCreateSlotModal: () => void;
  toggleEditSlotModal: () => void;
  setRecurr: (val: boolean) => void;
};

export const useDoctorSlotManagementStore = create<DoctorSlotManagementStore>(
  (set) => ({
    createSlotModal: false,
    toggleCreateSlotModal: () => {
      set((state) => ({ ...state, createSlotModal: !state.createSlotModal }));
    },
    editSlotModal: false,
    toggleEditSlotModal: () => {
      set((state) => ({ ...state, editSlotModal: !state.editSlotModal }));
    },
    recurr: false,
    setRecurr: (val) => {
      set((state) => ({ ...state, recurr: val }));
    },
  })
);
