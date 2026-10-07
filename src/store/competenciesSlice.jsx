import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  competencies: [],
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

export const competenciesSlice = createSlice({
  name: "competencies",
  initialState,
  reducers: {
    setLoadingCompetencies(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setLoadingCompetencies } = competenciesSlice.actions;
export default competenciesSlice.reducer;
