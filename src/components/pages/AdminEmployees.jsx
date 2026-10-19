import { AdminNavbar } from "../layouts/AdminNavbar";
import { useState } from "react";
import { db } from "../config/firebase";
import { collection, query, getDocs } from "firebase/firestore";

const AdminEmployees = () => {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  async function loadEmployees() {
    const q = query(collection(db, "employees"));
    const snap = await getDocs(q);
    const newData = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(newData);
    setEmployees(newData);
  }
  return (
    <div className="flex min-h-screen">
      <AdminNavbar />

      <div>
        <button
          className="p-3 border"
          onClick={() => {
            loadEmployees();
          }}
        >
          ค้นหาข้อมูล
        </button>
      </div>
    </div>
  );
};

export default AdminEmployees;
