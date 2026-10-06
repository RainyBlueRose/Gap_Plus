import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../components/config/firebase";

const initialState = {
  user: [],
  isAuthentication: false,
  authInitialize: true,
  loading: "idle", // idle, loading, succeeded, failed
  error: null,
};

//เอาไว้ใช้ตอนผู้ใช้ Login หรือ Refresh ให้เอา gmail ที่ใช้ Login มาค้นหาผ่านฟีล email ถ้าเจอให้ เอาข้อมูลไปใส่ State ทั้งหมดเลย ถ้าไม่เจอให้ค่า error ไม่เจอ ถ้าผิดพลาดให้ระบุ error message ใน state
export const fetchUserByEmail = createAsyncThunk(
  "user/fetchUserByEmail",
  async (email, { rejectWithValue }) => {
    try {
      console.log("email", email);
      const q = query(collection(db, "employees"), where("email", "==", email));
      const snap = await getDocs(q);
      if (snap.empty) return rejectWithValue("ไม่พบผู้ใช้");
      const d = snap.docs[0];
      return { id: d.id, ...d.data() };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
      state.isAuthentication = true;
    },
    logout(state) {
      state.user = [];
      state.isAuthentication = false;
      state.loading = "idle";
    },
    setAuthInitialize(state, action) {
      state.authInitialize = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserByEmail.pending, (state) => {
        state.loading = "loading";
      })
      .addCase(fetchUserByEmail.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.isAuthentication = true;
        state.user = action.payload;
      })
      .addCase(fetchUserByEmail.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { login, logout, setAuthInitialize } = userSlice.actions;
export const selectUser = (state) => state.user;
export default userSlice.reducer;
