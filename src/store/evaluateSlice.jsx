import { createSlice } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

const initialState = {
  evaluates: [],
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

export const evaluateSlice = createSlice({
  name: "evaluate",
  initialState,
  reducers: {
    setEvaluate: (state, action) => {
      state.evaluates = action.payload;
      state.loading = "succeeded";
    },
  },
});

export const selectEvaluate = (state) => state.evaluate;
export const useEvaluateData = () => useSelector(selectEvaluate);
export default evaluateSlice.reducer;
