//ไว้ใช้เช็คว่า Login รึยัง ถ้ายังให้กลับไปหน้า Login
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
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
