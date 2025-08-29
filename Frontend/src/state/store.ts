import { configureStore } from "@reduxjs/toolkit";
import signupReducer from "./auth/signupSlice";
import loginReducer from "./auth/loginSlice";

export const store = configureStore({
  reducer: {
    signup: signupReducer, //connected slice to reducer
    login: loginReducer,
  },
});

// store gives getState function
// ReturnType gets the return type of the getState function
// which is basically the type of the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
