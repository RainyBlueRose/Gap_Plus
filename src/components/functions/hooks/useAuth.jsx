//ไว้ใช้ใส่ฟังก์ชั่นเกี่ยวกับ Authentication ซึ่งตอนนี้มี Signout 
import React from "react";

import { useDispatch } from "react-redux";

import { handleSignout } from "../firebase/authService";
import { logout } from "../../../store/userSlice";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../router/Router";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signOut = async () => {
    await handleSignout();
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  return { signOut };
};
