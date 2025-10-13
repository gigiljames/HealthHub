import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { roles } from "../../constants/roles";

interface TokenState {
  token: string;
  role: string;
}

const initialState: TokenState = {
  token: "",
  role: roles.NONE,
};

const tokenSlice = createSlice({
  name: "token",
  initialState: initialState,
  reducers: {
    addToken: (state, action: PayloadAction<TokenState>) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
    },
    removeToken: (state) => {
      state.token = "";
      state.role = roles.NONE;
    },
  },
});

export const { addToken, removeToken } = tokenSlice.actions;

export default tokenSlice.reducer;
