import { ROUTES } from "../router/Router";
import { Link } from "react-router-dom";

export const AdminNavbar = () => {
  return (
    <div>
      <Link to={ROUTES.ADMINTRAININGMATRIX}>Training Matrix</Link>
    </div>
  );
};
