import { AdminNavbar } from "../layouts/AdminNavbar";
import AirAsiaIcon from "../../assets/AirAsiaIcon.webp";

const admin = () => {
  return (
    <div className="flex min-h-screen">
      <AdminNavbar />
      <main className="flex flex-1 items-center justify-center bg-slate-50 p-8">
        <img
          src={AirAsiaIcon}
          alt="AirAsia"
          className="h-auto w-72 max-w-full object-contain"
        />
      </main>
    </div>
  );
}

export default admin;
