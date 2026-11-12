import { ROUTES } from "../router/Router";
import { Link } from "react-router-dom";

export const AdminNavbar = () => {
  return (
    <nav className="w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6">
      <div className="mb-8 px-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
          Administration
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">Admin</h2>
      </div>
      <div className="flex flex-col gap-1">
        <Link
          className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-700"
          to={ROUTES.ADMIN}
        >
          Home
        </Link>
        <Link
          className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-700"
          to={ROUTES.ADMINTRAININGMATRIX}
        >
          Training Matrix
        </Link>
        <Link
          className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-700"
          to={ROUTES.ADMINOCRRESULT}
        >
          OCR Result
        </Link>
        <Link
          className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-700"
          to={ROUTES.ADMINEMPLOYEES}
        >
          Employees
        </Link>
      </div>
    </nav>
  );
};
