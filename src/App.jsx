import React, { useEffect } from "react";
import { router } from "./components/router/Router";
import { RouterProvider } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/config/firebase";

const App = () => {
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      console.log("user", user);
    });
  }, []);
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
