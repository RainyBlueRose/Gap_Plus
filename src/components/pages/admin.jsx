import { AdminNavbar } from "../layouts/AdminNavbar";

const admin = () => {
  
  return (
    <div className="flex min-h-screen">
      <AdminNavbar/>
      <main className="flex-1">
        <div>admin</div>
        
      </main>
    </div>
  );
}

export default admin;
