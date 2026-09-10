import React from "react";

import { useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";

import { Navigate } from "react-router-dom";
import { ROUTES } from "../../router/Router";

export const PublicRoute = () => {
  const { isAuthentication, authInitialize } = useSelector(selectUser);

  if (authInitialize) {
    return <div>loading ...</div>;
  }

  if (isAuthentication) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
};
