import React from "react";

import { signInWithProvider } from "../firebase/authService";

import { useDispatch } from "react-redux";
import { login } from "../../../store/userSlice";

import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../router/Router";

export const useSocialSignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signIn = async (providerName) => {
    try {
      const { user } = await signInWithProvider(providerName);
      dispatch(
        login({
          email: user.email,
          uid: user.uid,
        }),
      );
      navigate(ROUTES.HOME);
    } catch (err) {
      console.error(`${providerName} signin failed`, err);
    }
  };
  return { signIn };
};
