import { Outlet, Navigate } from "react-router-dom";
import { selectUser } from "../../../store/userSlice";
import { useSelector } from "react-redux";
import { ROUTES } from "../../router/Router";

const AdminProtectedRoute = () => {
  const { isAuthentication, authInitialize, user } = useSelector(selectUser);

  if (authInitialize) {
    return <div>loading ...</div>;
  }
  if (!isAuthentication) {
    console.log("ไม่มี User");
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  if (user.level !== "admin") {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  console.log("AdminProtectedRoute User info", user);
  return <Outlet />;
};

export default AdminProtectedRoute;
