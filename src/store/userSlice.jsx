import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: [],
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};
