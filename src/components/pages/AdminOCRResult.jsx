import { useState } from "react";
import { AdminNavbar } from "../layouts/AdminNavbar";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../config/firebase";

const AdminOCRResult = () => {
  const [ocrResults, setOCRResults] = useState([]);

  const rows = ocrResults.flatMap(
    ({ id, empId, empName, compKey, certificates }) =>
      Object.entries(certificates ?? {}).map(([certKey, cert]) => ({
        key: `${id}-${certKey}`,
        empId,
        empName,
        compKey,
        ...cert,
      })),
  );

  console.log("ocrResults", ocrResults);

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
          <table className="border">
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Name</th>
                <th>Competency Key</th>
                <th>OCR Result</th>
                <th>Image</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, index) => (
                <tr
                  key={item.key}
                  className="border border-gray-300 hover:bg-gray-50"
                >
                  <th className="border border-gray-300 px-4 py-3">
                    {index + 1}
                  </th>
                  <td className="border border-gray-300 px-4 py-3">
                    {item.empId}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {item.empName}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {item.compKey}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {item.ocrResult ?? "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noreferrer">
                        {item.name || "ดูไฟล์"}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOCRResult;
