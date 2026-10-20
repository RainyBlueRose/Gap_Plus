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
    updateIDPRecordCertificate: (state, action) => {
      const { compKey, index, certificate, recordData } = action.payload;
      const record = state.idpRecords.find((item) => item.compKey === compKey);

      if (record) {
        record.certificates ??= {};
        record.certificates[index] = certificate;
        record.status = "complete";
        record.timestamp = recordData.timestamp;
      } else {
        state.idpRecords.push({
          ...recordData,
          certificates: {
            [index]: certificate,
          },
        });
      }
      state.loading = "succeeded";
    },
  },
});

export const selectIDPRecords = (state) => state.idpRecords;
export const useIDPRecordsData = () => useSelector(selectIDPRecords);
export const { setIDPRecords, updateIDPRecordCertificate } =
  idpRecordsSlice.actions;
export default idpRecordsSlice.reducer;
