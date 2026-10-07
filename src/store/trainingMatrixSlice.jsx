import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  trainingMatrix: [],
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

export const trainingMatrixSlice = createSlice({
  name: "trainingMatrix",
  initialState,
  reducers: {
    setLoadingTrainingMatrix(state, action) {
      state.loading = action.payload;
    },
    setTrainingMatrix(state, action) {
      state.trainingMatrix = action.payload;
      state.loading = "succeeded";
    },
  },
});

export const { setLoadingTrainingMatrix, setTrainingMatrix } =
  trainingMatrixSlice.actions;
export default trainingMatrixSlice.reducer;
