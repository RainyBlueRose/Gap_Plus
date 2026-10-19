//เอาไว้กำหนด Route ต่างๆ
//export ROUTES เอาไว้จะได้ไม่ต้อง Hard Code
import React from "react";
import { createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "../functions/hooks/ProtectedRoute";
import { PublicRoute } from "../functions/hooks/PublicRoute";
import { AdminProtectedRoute } from "../functions/hooks/AdminProtectedRoute";

import Login from "../pages/Login";
import Home from "../pages/Home";
import MyLearning from "../pages/MyLearning";
import Admin from "../pages/admin";
import AdminTrainingMatrices from "../pages/AdminTrainingMatrices";
import AdminOCRResult from "../pages/AdminOCRResult";

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [{ path: "/", element: <Login /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/Home", element: <Home /> },
      { path: "/MyLearning", element: <MyLearning /> },
    ],
  },
  {
    element: <AdminProtectedRoute />,
    children: [
      { path: "/Admin", element: <Admin /> },
      { path: "/Admin/Training_matrices", element: <AdminTrainingMatrices /> },
      { path: "/Admin/OCRResult", element: <AdminOCRResult /> },
    ],
  },
]);

export const ROUTES = {
  LOGIN: "/",
  HOME: "/Home",
  MYLEARNING: "/MyLearning",
  ADMIN: "/Admin",
  ADMINTRAININGMATRIX: "/Admin/Training_matrices",
};
