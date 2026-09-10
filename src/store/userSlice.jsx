import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: [],
  isAuthentication: false,
  authInitialize: true,
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
      state.isAuthentication = true;
    },
    logout(state) {
      state.user = [];
      state.isAuthentication = false;
    },
    setAuthInitialize(state, action) {
      state.authInitialize = action.payload;
    },
  },
});

export const { login, logout, setAuthInitialize } = userSlice.actions;
export const selectUser = (state) => state.user;
export default userSlice.reducer;
