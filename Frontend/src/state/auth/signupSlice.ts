import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SignupState {
  name: string;
  email: string;
  password: string;
  rePassword: string;
}

const initialState: SignupState = {
  name: "",
  email: "",
  password: "",
  rePassword: "",
};

const signupSlice = createSlice({
  name: "signup",
  initialState: initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    setRePassword: (state, action: PayloadAction<string>) => {
      state.rePassword = action.payload;
    },
    resetSignupState: (state) => {
      state.email = "";
      state.name = "";
      state.password = "";
      state.rePassword = "";
    },
  },
});

export const {
  setName,
  setEmail,
  setPassword,
  setRePassword,
  resetSignupState,
} = signupSlice.actions;

export default signupSlice.reducer;
