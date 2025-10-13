import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { roles } from "../../constants/roles";

interface UserInfoState {
  id: string;
  name: string;
  email: string;
  role: string;
  isNewUser: boolean;
}

const initialState: UserInfoState = {
  id: "",
  name: "",
  email: "",
  role: roles.NONE,
  isNewUser: false,
};

const userInfoSlice = createSlice({
  name: "userInfo",
  initialState: initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfoState>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.isNewUser = action.payload.isNewUser;
    },
    setIsNewUser: (state, action: PayloadAction<boolean>) => {
      state.isNewUser = action.payload;
    },
  },
});

export const { setUserInfo, setIsNewUser } = userInfoSlice.actions;

export default userInfoSlice.reducer;
