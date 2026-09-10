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
  },
});

export const { login, logout } = userSlice.actions;
export const selectUser = (state) => state.user;
export default userSlice.reducer;
