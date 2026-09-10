import React from "react";
import { Outlet, Navigate } from "react-router-dom";

import { useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";

export const ProtectedRoute = () => {
  const { isAuthentication } = useSelector(selectUser);

  if (!isAuthentication) {
    console.log("ไม่มี User");
    return <Navigate to="/" />;
  }
  console.log("มี User");
  return <Outlet />;
};

export default ProtectedRoute;
