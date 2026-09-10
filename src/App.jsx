import React, { useEffect } from "react";
import { router } from "./components/router/Router";
import { RouterProvider, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/config/firebase";
import { useAuthListener } from "./components/functions/hooks/useAuthListener";

const App = () => {
  useAuthListener();
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
