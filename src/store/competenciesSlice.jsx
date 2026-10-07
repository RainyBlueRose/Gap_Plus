import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  competencies: {
    mandatory: [],
    electives: [],
  },
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

export const competenciesSlice = createSlice({
  name: "competencies",
  initialState,
  reducers: {
    setCompetencies: (state, action) => {
      state.competencies = action.payload; // { mandatory: [...], electives: [...] }
    },
    setLoadingCompetencies: (state, action) => {
      state.status = action.payload;
    },
  },
});

export const { setLoadingCompetencies, setCompetencies } =
  competenciesSlice.actions;
export const selectCompetencies = (state) => state.competencies;
export const useCompetenciesData = () => useSelector(selectCompetencies);
export default competenciesSlice.reducer;
