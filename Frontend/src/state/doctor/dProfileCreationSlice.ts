import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Education {
  id: string;
  title: string;
  institution: string;
  graduationYear: number;
  description?: string;
}

interface Certificates {
  medicalLicense: string;
  latestDegree: string;
}

export interface VerificationSubmission {
  _id: string;
  status: "pending" | "approved" | "rejected" | "resubmitted";
  remarks: string;
  submissionDate: string;
  reviewDate: string | null;
}

interface Experience {
  id: string;
  designation: string;
  hospital: string;
  description?: string;
  location: string;
  present: boolean;
  startDate: { month: number; year: number };
  endDate?: { month: number; year: number };
  type: string;
}

interface PracticeLocation {
  id: string;
  name: string;
  type: "ONLINE" | "HOSPITAL" | "CLINIC" | "PRIVATE_CLINIC";
  ownerId?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  consultationFee: number;
}

interface DProfileCreationState {
  name: string;
  email: string;
  about: string;
  dob: string;
  gender: string;
  phone: string;
  address: string;
  specialization: string;
  practiceType: "ONLINE_ONLY" | "MULTI_LOCATION" | "";
  practiceLocations: PracticeLocation[];
  certificates: Certificates;
  onlinePracticeFee?: number;
  verificationStatus?: "pending" | "approved" | "rejected" | "resubmitted";
  verificationSubmissions: VerificationSubmission[];
  activeSubmissionId: string;
  education: Education[];
  experience: Experience[];
}

const initialState: DProfileCreationState = {
  name: "",
  email: "",
  about: "",
  dob: "",
  gender: "",
  phone: "",
  address: "",
  specialization: "",
  practiceType: "",
  practiceLocations: [],
  certificates: {
    medicalLicense: "",
    latestDegree: "",
  },
  onlinePracticeFee: undefined,
  verificationStatus: undefined,
  verificationSubmissions: [],
  activeSubmissionId: "",
  education: [],
  experience: [],
};

const dProfileCreationSlice = createSlice({
  name: "dProfileCreation",
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setAbout: (state, action: PayloadAction<string>) => {
      state.about = action.payload;
    },
    setDob: (state, action: PayloadAction<string>) => {
      state.dob = action.payload;
    },
    setGender: (state, action: PayloadAction<string>) => {
      state.gender = action.payload;
    },
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    setSpecialization: (state, action: PayloadAction<string>) => {
      state.specialization = action.payload;
    },
    setOnlinePracticeFee: (state, action: PayloadAction<number>) => {
      state.onlinePracticeFee = action.payload;
    },
    setEducation: (state, action: PayloadAction<Education[]>) => {
      state.education = action.payload;
    },
    setPracticeType: (
      state,
      action: PayloadAction<"ONLINE_ONLY" | "MULTI_LOCATION">,
    ) => {
      state.practiceType = action.payload;
    },
    setCertificates: (state, action: PayloadAction<Certificates>) => {
      state.certificates = action.payload;
    },
    setVerificationStatus: (
      state,
      action: PayloadAction<
        "pending" | "approved" | "rejected" | "resubmitted"
      >,
    ) => {
      state.verificationStatus = action.payload;
    },
    setVerificationSubmissions: (
      state,
      action: PayloadAction<VerificationSubmission[]>,
    ) => {
      state.verificationSubmissions = action.payload;
    },
    setActiveSubmissionId: (state, action: PayloadAction<string>) => {
      state.activeSubmissionId = action.payload;
    },
    addPracticeLocation: (state, action: PayloadAction<PracticeLocation>) => {
      state.practiceLocations.push(action.payload);
    },
    updatePracticeLocation: (
      state,
      action: PayloadAction<PracticeLocation>,
    ) => {
      const index = state.practiceLocations.findIndex(
        (e) => e.id === action.payload.id,
      );
      if (index !== -1) {
        state.practiceLocations[index] = action.payload;
      }
    },
    deletePracticeLocation: (state, action: PayloadAction<string>) => {
      state.practiceLocations = state.practiceLocations.filter(
        (e) => e.id !== action.payload,
      );
    },
    addEducation: (state, action: PayloadAction<Education>) => {
      state.education.push(action.payload);
    },
    updateEducation: (state, action: PayloadAction<Education>) => {
      const index = state.education.findIndex(
        (e) => e.id === action.payload.id,
      );
      if (index !== -1) {
        state.education[index] = action.payload;
      }
    },
    deleteEducation: (state, action: PayloadAction<string>) => {
      state.education = state.education.filter((e) => e.id !== action.payload);
    },
    setExperience: (state, action: PayloadAction<Experience[]>) => {
      state.experience = action.payload;
    },
    addExperience: (state, action: PayloadAction<Experience>) => {
      state.experience.push(action.payload);
    },
    updateExperience: (state, action: PayloadAction<Experience>) => {
      const index = state.experience.findIndex(
        (e) => e.id === action.payload.id,
      );
      if (index !== -1) {
        state.experience[index] = action.payload;
      }
    },
    deleteExperience: (state, action: PayloadAction<string>) => {
      state.experience = state.experience.filter(
        (e) => e.id !== action.payload,
      );
    },
  },
});

export const {
  setName,
  setEmail,
  setAbout,
  setDob,
  setGender,
  setPhone,
  setAddress,
  setSpecialization,
  setEducation,
  setPracticeType,
  setOnlinePracticeFee,
  setCertificates,
  setVerificationStatus,
  setVerificationSubmissions,
  setActiveSubmissionId,
  addEducation,
  updateEducation,
  deleteEducation,
  addPracticeLocation,
  updatePracticeLocation,
  deletePracticeLocation,
  setExperience,
  addExperience,
  updateExperience,
  deleteExperience,
} = dProfileCreationSlice.actions;

export default dProfileCreationSlice.reducer;
