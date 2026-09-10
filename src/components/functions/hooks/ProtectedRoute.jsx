import React from "react";
import { Outlet } from "react-router-dom";

import { useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";

export const ProtectedRoute = () => {
  const { user } = useSelector(selectUser);

  if (!user) {
    console.log("ไม่มี User");
    return;
  }
  console.log("มี User");
  return <Outlet />;
};

export default ProtectedRoute;
