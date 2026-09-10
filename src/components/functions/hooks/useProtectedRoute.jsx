import React from "react";

import { useSelector } from "react-redux";
import { selectUsers } from "../../../store/userSlice";

const useProtectedRoute = () => {
  const { user } = useSelector(selectUsers);

  const protectedRoute = () => {
    if (user) {
      console.log("มี User");
      return;
    }
    console.log("ไม่มี User");
  };
  return { protectedRoute };
};

export default useProtectedRoute;
