import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  courses: [],
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

export const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {},
});
