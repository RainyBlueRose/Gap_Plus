import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { subscribeToAuthChanges } from "../firebase/authService";

const useAuthListener = () => {
  const dispatch = useDispatch;

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        dispatch(
          login({
            email: user.email,
            uid: user.uid,
          }),
        );
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);
};

export default useAuthListener;
