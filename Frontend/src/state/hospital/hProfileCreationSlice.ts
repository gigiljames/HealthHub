import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface HProfileCreationState {
  name: string;
  type: string;
  establishedYear?: number | null;
  about?: string;
  profileImage?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  location: number[];
  workingHours?: string;
  hospitalRegistration?: string;
  gstCertificate?: string;
  features: string[];
  acceptedTerms: boolean;
  submissionDate?: string;
}

const initialState: HProfileCreationState = {
  name: "",
  type: "",
  establishedYear: null,
  about: "",
  profileImage: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  location: [0, 0],
  workingHours: "",
  hospitalRegistration: "",
  gstCertificate: "",
  features: [],
  acceptedTerms: false,
  submissionDate: "",
};

const hProfileCreationSlice = createSlice({
  name: "hProfileCreation",
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    setEstablishedYear: (state, action: PayloadAction<number | null>) => {
      state.establishedYear = action.payload;
    },
    setAbout: (state, action: PayloadAction<string | undefined>) => {
      state.about = action.payload;
    },
    setProfileImage: (state, action: PayloadAction<string>) => {
      state.profileImage = action.payload;
    },
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setWebsite: (state, action: PayloadAction<string | undefined>) => {
      state.website = action.payload;
    },
    setLocation: (state, action: PayloadAction<number[]>) => {
      state.location = action.payload;
    },
    setWorkingHours: (state, action: PayloadAction<string | undefined>) => {
      state.workingHours = action.payload;
    },
    setHospitalRegistration: (state, action: PayloadAction<string>) => {
      state.hospitalRegistration = action.payload;
    },
    setGstCertificate: (state, action: PayloadAction<string>) => {
      state.gstCertificate = action.payload;
    },
    setFeatures: (state, action: PayloadAction<string[]>) => {
      state.features = action.payload;
    },
    addFeature: (state, action: PayloadAction<string>) => {
      if (!state.features.includes(action.payload))
        state.features.push(action.payload);
    },
    removeFeature: (state, action: PayloadAction<number>) => {
      state.features.splice(action.payload, 1);
    },
    setAcceptedTerms: (state, action: PayloadAction<boolean>) => {
      state.acceptedTerms = action.payload;
    },
    setSubmissionDate: (state, action: PayloadAction<string>) => {
      state.submissionDate = action.payload;
    },
    resetHospitalProfile: () => initialState,
  },
});

export const {
  setName,
  setType,
  setEstablishedYear,
  setAbout,
  setProfileImage,
  setAddress,
  setPhone,
  setEmail,
  setWebsite,
  setLocation,
  setWorkingHours,
  setHospitalRegistration,
  setGstCertificate,
  setFeatures,
  addFeature,
  removeFeature,
  setAcceptedTerms,
  setSubmissionDate,
  resetHospitalProfile,
} = hProfileCreationSlice.actions;

export default hProfileCreationSlice.reducer;
