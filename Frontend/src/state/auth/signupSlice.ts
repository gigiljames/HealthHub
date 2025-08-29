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
    setName: (state, payload: PayloadAction<string>) => {
      state.name = payload.payload;
    },
    setEmail: (state, payload: PayloadAction<string>) => {
      state.email = payload.payload;
    },
    setPassword: (state, payload: PayloadAction<string>) => {
      state.password = payload.payload;
    },
    setRePassword: (state, payload: PayloadAction<string>) => {
      state.rePassword = payload.payload;
    },
  },
});

export const { setName, setEmail, setPassword, setRePassword } =
  signupSlice.actions;

export default signupSlice.reducer;
