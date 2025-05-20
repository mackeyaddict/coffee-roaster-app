import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slice/auth.slice";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
} from "redux-persist";
import roastSlice from "./slice/roast.slice";

const reducers = combineReducers({
  auth: authSlice,
  roast: roastSlice
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "roast"],
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: import.meta.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});