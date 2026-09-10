import React from "react";
import { selectUser } from "../../../store/userSlice";
import { ROUTES } from "../../router/Router";

const PublicRoute = () => {
  const { isAuthentication, authInitialize } = useSelector(selectUser);

  if (authInitialize) {
    return <div>loading ...</div>;
  }

  if (isAuthentication) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
};

export default PublicRoute;
