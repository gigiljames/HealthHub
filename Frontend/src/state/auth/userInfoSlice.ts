import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { roles } from "../../constants/roles";

interface UserInfoState {
  id: string;
  name: string;
  email: string;
  role: string;
  isNewUser: boolean;
  onboardingStep: number;
}

const initialState: UserInfoState = {
  id: "",
  name: "",
  email: "",
  role: roles.NONE,
  isNewUser: false,
  onboardingStep: 0,
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
      state.onboardingStep = action.payload.onboardingStep;
    },
    setIsNewUser: (state, action: PayloadAction<boolean>) => {
      state.isNewUser = action.payload;
    },
    setOnboardingStep: (state, action: PayloadAction<number>) => {
      state.onboardingStep = action.payload;
    },
  },
});

export const { setUserInfo, setIsNewUser, setOnboardingStep } =
  userInfoSlice.actions;

export default userInfoSlice.reducer;
