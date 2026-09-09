import React, { useEffect } from "react";
import { router } from "./components/router/Router";
import { RouterProvider, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/config/firebase";

const App = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        return <Navigate to="/Home" />;
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
