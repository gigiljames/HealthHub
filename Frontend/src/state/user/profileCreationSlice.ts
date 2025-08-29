import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ProfileCreationState {
  name: string;
  maritalStatus: string;
  gender: string;
  height: number;
}

const initialState: ProfileCreationState = {
  name: "",
  maritalStatus: "",
  gender: "",
  dob: "",
  blood: "",
  allergies: [],
  occupation: "",
  height: null,
  weight: null,
  address: "",
  phone: "",
  tb: null,
  surgeries: [],
};
