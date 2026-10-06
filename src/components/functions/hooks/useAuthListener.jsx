//เปิดเช็คสถานะและข้อมูลการเข้าสู่ระบบตอนเปิดหน้าเว็บใหม่หรือรีเฟรช แล้วปิดเช็คสถานะตอนปิดแอพหรือรีเฟรช
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { subscribeToAuthChanges } from "../firebase/authService";
import {
  login,
  logout,
  setAuthInitialize,
  fetchUserByEmail,
} from "../../../store/userSlice";

export const useAuthListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      console.log("เปิด onAuthStateChanged");
      dispatch(setAuthInitialize(true));
      if (user) {
        console.log("user", user);
        dispatch(fetchUserByEmail(user.email));
      } else {
        dispatch(logout());
      }
      dispatch(setAuthInitialize(false));
    });
    return () => {
      console.log("ปิด onAuthStateChanged");
      unsubscribe();
    };
  }, []);
};
