import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  trainingMatrix: [],
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

export const trainingMatrixSlice = createSlice({
  name: "trainingMatrix",
  initialState,
  reducers: {},
});

export default trainingMatrixSlice.reducer;
