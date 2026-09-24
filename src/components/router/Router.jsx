//เอาไว้กำหนด Route ต่างๆ 
//export ROUTES เอาไว้จะได้ไม่ต้อง Hard Code
import React from "react";
import { createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "../functions/hooks/ProtectedRoute";
import { PublicRoute } from "../functions/hooks/PublicRoute";

import Login from "../pages/Login";
import Home from "../pages/Home";

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [{ path: "/", element: <Login /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/Home", element: <Home /> }],
  },
]);

export const ROUTES = {
  LOGIN: "/",
  HOME: "/Home",
};
