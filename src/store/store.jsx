import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import trainingMatrixSlice from "./trainingMatrixSlice";
import competenciesSlice from "./competenciesSlice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    trainingMatrix: trainingMatrixSlice,
    competencies: competenciesSlice,
  },
});
