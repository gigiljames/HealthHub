import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface LoginState {
  email: string;
  password: string;
}

const initialState: LoginState = {
  email: "",
  password: "",
};

const loginSlice = createSlice({
  name: "login",
  initialState: initialState,
  reducers: {
    setEmail: (state, payload: PayloadAction<string>) => {
      state.email = payload.payload;
    },
    setPassword: (state, payload: PayloadAction<string>) => {
      state.password = payload.payload;
    },
  },
});

export const { setEmail, setPassword } = loginSlice.actions;

export default loginSlice.reducer;
