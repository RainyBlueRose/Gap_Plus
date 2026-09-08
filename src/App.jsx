import React from "react";
import { router } from "./components/router/Router";
import { RouterProvider } from "react-router-dom";

const App = () => {
  return (
    <div>
      <RouterProvider router={router} />;
    </div>
  );
};

export default App;
