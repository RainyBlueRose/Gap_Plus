import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  idpRecords: [],
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

export const idpRecordsSlice = createSlice({
  name: "idpRecords",
  initialState,
  reducers: {
    setIDPRecords: (state, action) => {
      state.idpRecords = action.payload;
      state.loading = "succeeded";
    },
  },
});

export const selectIDPRecords = (state) => state.IDPRecords;
export const useIDPRecordsData = () => useSelector(selectIDPRecords);
export const { setIDPRecords } = idpRecordsSlice.actions;
export default idpRecordsSlice.reducer;
