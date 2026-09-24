//ไว้เช็คว่า Login รึยัง ถ้า Login แล้วข้ามหน้า Login ไปเลย
import React from "react";

import { useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";

import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../../router/Router";

export const PublicRoute = () => {
  const { isAuthentication, authInitialize } = useSelector(selectUser);

  if (authInitialize) {
    return <div>loading ...</div>;
  }

  if (isAuthentication) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return <Outlet />;
};
