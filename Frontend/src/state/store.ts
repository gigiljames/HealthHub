import { combineReducers, configureStore } from "@reduxjs/toolkit";
import signupReducer from "./auth/signupSlice";
import loginReducer from "./auth/loginSlice";
import tokenReducer from "./auth/tokenSlice";
import uProfileCreationReducer from "./user/uProfileCreationSlice";
import hProfileCreationReducer from "./hospital/hProfileCreationSlice";
import dProfileCreationReducer from "./doctor/dProfileCreationSlice";
import dSlotReducer from "./doctor/dSlotSlice";
import forgotPasswordReducer from "./auth/forgotPasswordSlice";
import userInfoReducer from "./auth/userInfoSlice";
import themeReducer from "./theme/themeSlice";
import notificationReducer from "./notification/notificationSlice";
import callReducer from "./call/callSlice";
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";

const rootPersistConfig = {
  key: "root",
  storage,
  whitelist: ["token", "userInfo"],
};

const themePersistConfig = {
  key: "theme",
  storage,
};

const appReducer = combineReducers({
  signup: signupReducer, //connected slice to reducer
  login: loginReducer,
  token: tokenReducer,
  forgotPassword: forgotPasswordReducer,
  uProfileCreation: uProfileCreationReducer,
  hProfileCreation: hProfileCreationReducer,
  dProfileCreation: dProfileCreationReducer,
  dSlot: dSlotReducer,
  userInfo: userInfoReducer,
  theme: persistReducer(themePersistConfig, themeReducer),
  notification: notificationReducer,
  call: callReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === "auth/logout") {
    state = undefined;
  }

  return appReducer(state, action);
};

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

// store gives getState function
// ReturnType gets the return type of the getState function
// which is basically the type of the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
