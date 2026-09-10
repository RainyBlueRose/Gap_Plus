import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: [],
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = [];
    },
  },
});

export const { login, logout } = userSlice.actions;
export const selectUsers = (state) => state.users;
export default userSlice.reducer;
