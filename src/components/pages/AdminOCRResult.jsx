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
      <div className="min-w-0 flex-1 p-6">
        <div>
          <button
            className="mb-4 rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            onClick={() => {
              loadOCRResult();
            }}
          >
            ค้นหาข้อมูล
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">#</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  ID
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Name
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Competency Key
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  OCR Result
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Image
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, index) => (
                <tr
                  key={item.key}
                  className="border-b border-slate-100 transition-colors last:border-0 hover:bg-sky-50/50"
                >
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-500">
                    {index + 1}
                  </th>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {item.empId}
                  </td>
                  <td className="px-4 py-3 text-slate-800">{item.empName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {item.compKey}
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    {item.ocrResult ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {item.url ? (
                      <a
                        className="text-sky-700 hover:underline"
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.name || "ดูไฟล์"}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">-</td>
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
