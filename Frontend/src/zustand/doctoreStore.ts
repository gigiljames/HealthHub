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
