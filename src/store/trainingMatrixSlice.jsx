import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  trainingMatrix: [],
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

export const fetchTrainingMatrix = createAsyncThunk(
  "trainingMatrix/fetchTrainingMatrix",
  async (jobCode, { rejectWithValue }) => {
    try {
      console.log("jobCode", jobCode);
    } catch {}
  },
);

export const trainingMatrixSlice = createSlice({
  name: "trainingMatrix",
  initialState,
  reducers: {},
});

export default trainingMatrixSlice.reducer;
