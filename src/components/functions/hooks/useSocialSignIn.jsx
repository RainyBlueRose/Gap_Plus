import React from "react";

import { signInWithProvider } from "../firebase/authService";

import { useDispatch } from "react-redux";
import { login } from "../../../store/userSlice";

export const useSocialSignIn = () => {
  const dispatch = useDispatch();

  const signIn = async (providerName) => {
    try {
      const { user } = await signInWithProvider(providerName);
      console.log("userinfo", user);
      dispatch(
        login({
          email: user.email,
          uid: user.uid,
        }),
      );
    } catch (err) {
      console.error(`${providerName} signin failed`, err);
    }
  };
  return { signIn };
};
