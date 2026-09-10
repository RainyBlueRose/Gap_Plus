import React from "react";

import { useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";

export const ProtectedRoute = () => {
  const { user } = useSelector(selectUser);

  if (!user) {
    console.log("ไม่มี User");
    return;
  }
  console.log("มี User");
};

export default ProtectedRoute;
