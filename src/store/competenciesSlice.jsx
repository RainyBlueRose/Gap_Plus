import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  competencies: [],
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

export const competenciesSlice = createSlice({
  name: "competencies",
  initialState,
  reducers: {},
});

export default competenciesSlice.reducer;
