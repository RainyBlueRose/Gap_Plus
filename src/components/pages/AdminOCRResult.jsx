import { useState } from "react";
import { AdminNavbar } from "../layouts/AdminNavbar";
import { getDocs, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const AdminOCRResult = () => {
  const [ocrResults, setOCRResults] = useState([]);
  const [editKey, setEditKey] = useState(null);
  const [form, setForm] = useState({ ocrResult: "" });
  const [saveError, setSaveError] = useState("");

  const rows = ocrResults.flatMap(
    ({ id, empId, empName, compKey, status, certificates }) =>
      Object.entries(certificates ?? {}).map(([certKey, cert]) => ({
        key: `${id}-${certKey}`,
        id,
        certKey,
        empId,
        empName,
        compKey,
        status,
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

  function handleEdit(item) {
    setEditKey(item.key);
    setForm({ ocrResult: item.ocrResult ?? "" });
    setSaveError("");
  }

  async function handleSave(item) {
    const ocrResult = form.ocrResult.trim();
    setSaveError("");

    try {
      await updateDoc(doc(db, "idp_records", item.id), {
        [`certificates.${item.certKey}.ocrResult`]: ocrResult,
      });

      setOCRResults((currentResults) =>
        currentResults.map((record) =>
          record.id === item.id
            ? {
                ...record,
                certificates: {
                  ...record.certificates,
                  [item.certKey]: {
                    ...record.certificates?.[item.certKey],
                    ocrResult,
                  },
                },
              }
            : record,
        ),
      );
      setEditKey(null);
      setForm({ ocrResult: "" });
    } catch (error) {
      console.error("Failed to update OCR result", error);
      setSaveError("บันทึกผล OCR ไม่สำเร็จ กรุณาลองอีกครั้ง");
    }
  }

  function handleCancel() {
    setEditKey(null);
    setForm({ ocrResult: "" });
    setSaveError("");
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
                  Status
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
                    {item.status ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    {editKey === item.key ? (
                      <input
                        className="w-full min-w-32 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        type="text"
                        value={form.ocrResult}
                        onChange={(event) =>
                          setForm({ ocrResult: event.target.value })
                        }
                      />
                    ) : (
                      item.ocrResult ?? "-"
                    )}
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
                  <td className="px-4 py-3 text-slate-600">
                    {editKey === item.key ? (
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                          onClick={() => handleSave(item)}
                        >
                          Save
                        </button>
                        <button
                          className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="rounded border border-sky-200 px-3 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-50"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {saveError && (
          <p className="mt-3 text-sm text-rose-700" role="alert">
            {saveError}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminOCRResult;
