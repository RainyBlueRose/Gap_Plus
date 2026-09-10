import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { ROUTES } from "../../router/Router";

import { useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";

export const ProtectedRoute = () => {
  const { isAuthentication, authInitialize } = useSelector(selectUser);

  if (authInitialize) {
    return <div>loading ...</div>;
  }

  if (!isAuthentication) {
    console.log("ไม่มี User");
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  console.log("มี User");
  return <Outlet />;
};

export default ProtectedRoute;
