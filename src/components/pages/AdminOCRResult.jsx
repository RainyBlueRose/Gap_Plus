import { useState } from "react";
import { AdminNavbar } from "../layouts/AdminNavbar";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../config/firebase";

const AdminOCRResult = () => {
  const [ocrResults, setOCRResults] = useState([]);

  async function loadOCRResult() {
    const q = collection(db, "idp_records");
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setOCRResults(data);
  }

  return (
    <div className="flex min-h-screen">
      <AdminNavbar />
      <div>
        <button
          className="border p-3"
          onClick={() => {
            loadOCRResult();
          }}
        >
          ค้นหาข้อมูล
        </button>
      </div>
      <div>
        <table className="border"></table>
      </div>
    </div>
  );
};

export default AdminOCRResult;
