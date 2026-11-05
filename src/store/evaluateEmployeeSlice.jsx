import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  evaluateEmployees: [],
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

export const evaluateEmployeeSlice = createSlice({
  name: "evaluateEmployee",
  initialState,
  reducers: {
    setEvaluateEmployee: (state, action) => {
      state.evaluateEmployees = action.payload;
    },
  },
});

export const { setEvaluateEmployee } = evaluateEmployeeSlice.actions;
export const selectEvaluateEmployees = (state) => state.evaluateEmployees;
export const useEvaluateEmployeesData = () =>
  useSelector(selectEvaluateEmployees);
export default evaluateEmployeeSlice.reducer;
