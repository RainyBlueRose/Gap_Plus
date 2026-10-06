import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import trainingMatrixSlice from "./trainingMatrixSlice";

export const store = configureStore({
  reducer: { user: userSlice, trainingMatrix: trainingMatrixSlice },
});
