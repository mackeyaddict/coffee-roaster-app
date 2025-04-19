import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: {
    uid: "",
    email: "",
    fullName: "",
    role: "" 
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = {
        uid: action.payload.uid,
        email: action.payload.email,
        fullName: action.payload.fullName,
      };
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = {
        uid: "",
        email: "",
        fullName: "",
      };
    },
  },
});


export const { login, logout } = authSlice.actions;

export default authSlice.reducer;