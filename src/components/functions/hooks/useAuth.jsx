import React from "react";

import { useDispatch } from "react-redux";

import { handleSignout } from "../firebase/authService";
import { logout } from "../../../store/userSlice";

export const useAuth = () => {
  const dispatch = useDispatch();

  const logout = async () => {
    await handleSignout();
    dispatch(logout());
  };

  return { logout };
};
