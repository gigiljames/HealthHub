import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Surgery {
  year: string;
  surgeryName: string;
  reason: string;
  surgeryType: "major" | "minor" | "";
  doctor: string;
  hospital: string;
}

interface ProfileCreationState {
  name: string;
  maritalStatus: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  allergies: string[];
  occupation: string;
  height: number;
  weight: number;
  address: string;
  phoneNumber: string;
  tb: boolean | null;
  bronchialAsthma: boolean | null;
  epilepsy: boolean | null;
  pastSurgeries: Surgery[];
}

const initialState: ProfileCreationState = {
  name: "",
  maritalStatus: "",
  gender: "",
  dob: "",
  bloodGroup: "",
  allergies: [],
  occupation: "",
  height: 0,
  weight: 0,
  address: "",
  phoneNumber: "",
  tb: null,
  bronchialAsthma: null,
  epilepsy: null,
  pastSurgeries: [],
};

const uProfileCreationSlice = createSlice({
  name: "uProfileCreation",
  initialState: initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setMaritalStatus: (state, action: PayloadAction<string>) => {
      state.maritalStatus = action.payload;
    },
    setGender: (state, action: PayloadAction<string>) => {
      state.gender = action.payload;
    },
    setDob: (state, action: PayloadAction<string>) => {
      state.dob = action.payload;
    },
    setBloodGroup: (state, action: PayloadAction<string>) => {
      state.bloodGroup = action.payload;
    },
    setAllergies: (state, action: PayloadAction<string[]>) => {
      state.allergies = action.payload;
    },
    addAllergy: (state, action: PayloadAction<string>) => {
      state.allergies.push(action.payload);
    },
    removeAllergy: (state, action: PayloadAction<number>) => {
      state.allergies.splice(action.payload, 1);
    },
    setOccupation: (state, action: PayloadAction<string>) => {
      state.occupation = action.payload;
    },
    setHeight: (state, action: PayloadAction<number>) => {
      state.height = action.payload;
    },
    setWeight: (state, action: PayloadAction<number>) => {
      state.weight = action.payload;
    },
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    setPhoneNumber: (state, action: PayloadAction<string>) => {
      state.phoneNumber = action.payload;
    },
    setTb: (state, action: PayloadAction<boolean>) => {
      state.tb = action.payload;
    },
    setBronchialAsthma: (state, action: PayloadAction<boolean>) => {
      state.bronchialAsthma = action.payload;
    },
    setEpilepsy: (state, action: PayloadAction<boolean>) => {
      state.epilepsy = action.payload;
    },
    addSurgery: (state, action: PayloadAction<Surgery>) => {
      state.pastSurgeries.push(action.payload);
    },
    removeSurgery: (state, action: PayloadAction<number>) => {
      state.pastSurgeries.splice(action.payload, 1);
    },
    updateSurgery: (
      state,
      action: PayloadAction<{ index: number; data: Surgery }>
    ) => {
      const { index, data } = action.payload;
      state.pastSurgeries[index] = data;
    },
  },
});

export const {
  setName,
  setMaritalStatus,
  setGender,
  setAddress,
  setBloodGroup,
  setBronchialAsthma,
  setDob,
  setEpilepsy,
  setHeight,
  setOccupation,
  setPhoneNumber,
  setTb,
  setWeight,
  setAllergies,
  addAllergy,
  removeAllergy,
  addSurgery,
  removeSurgery,
  updateSurgery,
} = uProfileCreationSlice.actions;

export default uProfileCreationSlice.reducer;
