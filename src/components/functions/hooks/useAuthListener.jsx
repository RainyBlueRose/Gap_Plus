import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { subscribeToAuthChanges } from "../firebase/authService";
import { login, logout } from "../../../store/userSlice";

export const useAuthListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      console.log("เปิด onAuthStateChanged");
      if (user) {
        dispatch(
          login({
            email: user.email,
            uid: user.uid,
          }),
        );
      } else {
        dispatch(logout());
      }
    });
    return () => {
      console.log("ปิด onAuthStateChanged");
      unsubscribe();
    };
  }, []);
};
