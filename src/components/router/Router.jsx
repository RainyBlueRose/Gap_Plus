import React from "react";
import { createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "../functions/hooks/ProtectedRoute";

import Login from "../pages/Login";
import Home from "../pages/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/Home", element: <Home /> }],
  },
]);

export const routes = {
  login: "/",
  home: "/Home",
};
