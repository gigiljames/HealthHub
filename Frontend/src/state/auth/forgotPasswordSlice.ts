import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ForgotPasswordState {
  email: string;
  password: string;
  rePassword: string;
  token: string;
}

const initialState: ForgotPasswordState = {
  email: "",
  password: "",
  rePassword: "",
  token: "",
};

const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState: initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    setRePassword: (state, action: PayloadAction<string>) => {
      state.rePassword = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
});

export const { setEmail, setPassword, setRePassword, setToken } =
  forgotPasswordSlice.actions;

export default forgotPasswordSlice.reducer;
