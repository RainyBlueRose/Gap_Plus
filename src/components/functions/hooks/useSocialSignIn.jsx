import React from "react";
import { useDispatch } from "react-redux";
import { signInWithProvider } from "../firebase/authService";

export const useSocialSignIn = () => {
  const dispatch = useDispatch();

  const signIn = async (providerName) => {
    try {
      const result = await signInWithProvider(providerName);
    } catch (err) {
      console.error(`${providerName} signin failed`, err);
    }
  };
  return { signIn };
};
