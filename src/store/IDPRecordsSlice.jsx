import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  idpRecords: [],
  loading: "idle",
  error: null,
};

export const idpRecordsSlice = createSlice({
  name: "idpRecords",
  initialState,
  reducer: {},
});

export const selectIDPRecords = (state) => state.IDPRecords;
export const useIDPRecordsData = () => useSelector(selectIDPRecords);
export default idpRecordsSlice.reducer;
