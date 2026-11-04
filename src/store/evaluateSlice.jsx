import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  evaluate: [],
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

export const evaluateSlice = createSlice({
  name: "evaluate",
  initialState,
  reducers: {},
});

export const selectEvaluate = (state) => state.evaluate;
export const useEavaluateData = () => useSelector(selectEvaluate);
export default evaluateSlice.reducer;
