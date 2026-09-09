import React from "react";
import { useDispatch } from "react-redux";
import { signInWithProvider } from "../firebase/authService";

const useSocialSignIn = () => {
  const dispatch = useDispatch();

  const signIn = async (providerName) => {
    try {
      const result = await signInWithProvider(providerName);
    } catch (err) {
      console.error(`${providerName} signin failed`, err);
    }
  };
};

export default useSocialSignIn;
