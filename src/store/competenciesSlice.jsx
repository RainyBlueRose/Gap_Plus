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
    setCompetencies: (state, action) => {
      state.data = action.payload; // { mandatory: [...], electives: [...] }
    },
    setLoadingCompetencies: (state, action) => {
      state.status = action.payload;
    },
  },
});

export const { setLoadingCompetencies, setCompetencies } =
  competenciesSlice.actions;
export const selectCompetencies = (state) => state.competencies;
export default competenciesSlice.reducer;
