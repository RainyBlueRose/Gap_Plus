import React, { useEffect } from "react";
import { router } from "./components/router/Router";
import { RouterProvider, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/config/firebase";

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("เปิดonAuthStateChanged");
      if (!user) {
        console.log("ไม่พบ User");
        navigate("/");
        return;
      }
      console.log("พบ User");
      navigate("/Home");
      return;
    });
    return () => {
      console.log("ปิดonAuthStateChanged");
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
