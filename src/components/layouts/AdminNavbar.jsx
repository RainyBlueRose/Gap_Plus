import { ROUTES } from "../router/Router";
import { Link } from "react-router-dom";

export const AdminNavbar = () => {
  return (
    <div className="border border-green-500 border-3 flex flex-col">
      <Link className="p-3 border" to={ROUTES.ADMIN}>
        Home
      </Link>
      <Link className="p-3 border" to={ROUTES.ADMINTRAININGMATRIX}>
        Training Matrix
      </Link>
      <Link className="p-3 border" to={ROUTES.OCRRESULT}>
        OCRResult
      </Link>
    </div>
  );
};
