import { combineReducers, configureStore, createStore } from "@reduxjs/toolkit";
import signupReducer from "./auth/signupSlice";
import loginReducer from "./auth/loginSlice";
import tokenReducer from "./auth/tokenSlice";
import uProfileCreationReducer from "./user/uProfileCreationSlice";
import hProfileCreationReducer from "./hospital/hProfileCreationSlice";
import forgotPasswordReducer from "./auth/forgotPasswordSlice";
import userInfoReducer from "./auth/userInfoSlice";
import storage from "redux-persist/lib/storage";
import {
  persistStore,
  persistReducer,
  // FLUSH,
  // REHYDRATE,
  // PAUSE,
  // PERSIST,
  // PURGE,
  // REGISTER,
} from "redux-persist";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["token", "userInfo"],
};

const rootReducer = combineReducers({
  signup: signupReducer, //connected slice to reducer
  login: loginReducer,
  token: tokenReducer,
  forgotPassword: forgotPasswordReducer,
  uProfileCreation: uProfileCreationReducer,
  hProfileCreation: hProfileCreationReducer,
  userInfo: userInfoReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
//       },
//     }),
// });

export const store = createStore(persistedReducer);

// store gives getState function
// ReturnType gets the return type of the getState function
// which is basically the type of the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
