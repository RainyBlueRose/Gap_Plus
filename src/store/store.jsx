import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import trainingMatrixSlice from "./trainingMatrixSlice";
import competenciesSlice from "./competenciesSlice";
import idpRecordsSlice from "./IDPRecordsSlice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    trainingMatrix: trainingMatrixSlice,
    competencies: competenciesSlice,
    idpRecords: idpRecordsSlice,
  },
});
