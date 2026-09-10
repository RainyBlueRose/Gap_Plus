import React from "react";

import { useDispatch } from "react-redux";

import { handleSignout } from "../firebase/authService";
import { logout } from "../../../store/userSlice";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signOut = async () => {
    await handleSignout();
    dispatch(logout());
    navigate("/");
  };

  return { signOut };
};
