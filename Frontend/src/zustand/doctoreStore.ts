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
  editRuleModal: boolean;
  createRuleModal: boolean;
  recurr: boolean;
  slots: any[];
  toggleCreateSlotModal: () => void;
  toggleEditSlotModal: () => void;
  toggleEditRuleModal: () => void;
  toggleCreateRuleModal: () => void;
  setRecurr: (val: boolean) => void;
};

export const useDoctorSlotManagementStore = create<DoctorSlotManagementStore>(
  (set) => ({
    createSlotModal: false,
    editSlotModal: false,
    editRuleModal: false,
    createRuleModal: false,
    recurr: false,
    slots: [],
    toggleCreateSlotModal: () => {
      set((state) => ({ ...state, createSlotModal: !state.createSlotModal }));
    },
    toggleEditSlotModal: () => {
      set((state) => ({ ...state, editSlotModal: !state.editSlotModal }));
    },
    toggleEditRuleModal: () => {
      set((state) => ({ ...state, editRuleModal: !state.editRuleModal }));
    },
    toggleCreateRuleModal: () => {
      set((state) => ({ ...state, createRuleModal: !state.createRuleModal }));
    },
    setRecurr: (val) => {
      set((state) => ({ ...state, recurr: val }));
    },
  }),
);
