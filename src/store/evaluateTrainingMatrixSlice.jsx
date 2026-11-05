import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  evaluateTrainingMatrix: [],
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

export const evaluateTrainingMatrixSlice = createSlice({
  name: "evaluateTrainingMatrix",
  initialState,
  reducers: {
    setEvaluateTrainingMatrix: (state, action) => {
      state.evaluateTrainingMatrix = action.payload;
      state.loading = "succeeded";
    },
  },
});

export default evaluateTrainingMatrixSlice.reducer;
export const selectEvaluateTrainingMatrix = (state) =>
  state.evaluateTrainingMatrix;
export const useEvaluateTrainingMatrixData = useSelector(
  selectEvaluateTrainingMatrix,
);
export const { setEvaluateTrainingMatrix } =
  evaluateTrainingMatrixSlice.actions;
