import React, { useEffect } from "react";
import { router } from "./components/router/Router";
import { RouterProvider, useNavigate } from "react-router-dom";

import { useAuthListener } from "./components/functions/hooks/useAuthListener";
import { useTrainingMatrix } from "./components/functions/hooks/useTrainingMatrix";
import { useCourse } from "./components/functions/hooks/useCourses";

const App = () => {
  useAuthListener();
  useTrainingMatrix();
  useCourse();
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
