import {
  collection,
  getDocs,
  query,
  updateDoc,
  doc,
  where,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { useState } from "react";
import { db } from "../config/firebase";

import { AdminNavbar } from "../layouts/AdminNavbar";

const AdminTrainingMatrices = () => {
  //editId เอาไว้เก็บ id ที่ทำการกดปุ่ม edit
  const [editId, setEditId] = useState(null);
  //form เอาไว้เก็บข้อมูลที่พิมพ์เข้ามาตอนที่จะ Add ข้อมูลหรือทำการแก้ไขข้อมูล
  const [form, setForm] = useState({});
  //training_matrices เอาไว้เก็บข้อมูลที่เรียกมาจาก Firebase แบบโดยรวม
  const [training_matrices, setTraining_matrices] = useState([]);

  const [search, setSearch] = useState("");

  const [isAdding, setIsAdding] = useState(false);

  function handleQuery(e) {
    setSearch(e.target.value);
  }

  function handleAddData() {
    setEditId("");
    setIsAdding(!isAdding);
    setForm({
      id: "",
      jobCode: "",
      electives: [""],
      mandatory: [""],
    });
  }

  async function loadTrainingMatrix() {
    const cleanQuery = search.trim().toUpperCase();
    let q;
    if (cleanQuery === "") {
      q = query(collection(db, "training_matrices"));
    } else {
      q = query(
        collection(db, "training_matrices"),
        where("jobCode", ">=", cleanQuery),
        where("jobCode", "<=", cleanQuery + "\uf8ff"),
      );
    }
    const snap = await getDocs(q);
    const newData = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(newData);
    setTraining_matrices(newData);
  }

  function handleAddEdit(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEdit(item) {
    setEditId(item.id);
    setForm({
      jobCode: item.jobCode,
      electives: [...item.electives],
      mandatory: [...item.mandatory],
    });
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleArrayRemove(field, index) {
    const newArray = [...form[field].filter((_, i) => i !== index)];
    setForm({ ...form, [field]: newArray });
  }

  function handleArrayChange(field, index, value) {
    const newArray = [...form[field]];
    newArray[index] = value;
    setForm({ ...form, [field]: newArray });
  }

  function handleAddArray(field) {
    setForm({ ...form, [field]: [...form[field], ""] });
  }

  async function handleAddSave() {
    const newData = {
      jobCode: form.jobCode.toUpperCase(),
      electives: form.electives.filter((e) => e.trim() !== ""),
      mandatory: form.mandatory.filter((m) => m.trim() !== ""),
    };
    const docRef = await setDoc(
      doc(db, "training_matrices", newData.jobCode),
      newData,
    );

    setTraining_matrices([
      ...training_matrices,
      { id: newData.jobCode, ...newData },
    ]);

    setIsAdding(false);
    setEditId(null);
    setForm({});
  }
  async function handleSave() {
    const newData = {
      jobCode: form.jobCode,
      electives: form.electives.filter((e) => e.trim() !== ""),
      mandatory: form.mandatory.filter((m) => m.trim() !== ""),
    };
    await updateDoc(doc(db, "training_matrices", editId), newData);

    setTraining_matrices(
      training_matrices.map((item) =>
        item.id === editId ? { ...item, ...newData } : item,
      ),
    );

    setEditId(null);
    setForm({});
  }

  async function handleDelete() {
    await deleteDoc(doc(collection(db, "training_matrices"), editId));

    setTraining_matrices(
      training_matrices.filter((item) => item.id !== editId),
    );
    setEditId(null);
  }

  function handleCancel() {
    setIsAdding(false);
    setEditId(null);
    setForm({});
  }
  return (
    <div className="flex min-h-screen">
      <AdminNavbar />
      <main className="min-w-0 flex-1 p-6">
        <input
          className="mb-3 mr-2 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          type="text"
          name="jobCode"
          value={search}
          placeholder="Job Code"
          onChange={handleQuery}
        />
        <button
          className="mb-3 mr-2 rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          onClick={() => {
            loadTrainingMatrix();
          }}
        >
          ค้นหาข้อมูล
        </button>
        <button
          className="mb-3 rounded-md border border-sky-200 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
          onClick={handleAddData}
        >
          เพิ่มข้อมูล
        </button>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">#</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">ID</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Job Code</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Elective</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Mandatory</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr className="border-b border-slate-100 bg-sky-50/50">
                <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-500">+</th>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">สร้างอัตโนมัติ</td>
                <td className="px-4 py-3">
                  <input
                    className="w-full min-w-32 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    type="text"
                    name="jobCode"
                    value={form.jobCode}
                    onChange={handleAddEdit}
                  />
                </td>
                <td className="min-w-56 px-4 py-3">
                  {form.electives.map((e, index) => (
                    <div className="mb-2 flex items-center gap-2 last:mb-0" key={index}>
                      <input
                        className="w-full min-w-32 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        value={e}
                        onChange={(ev) => {
                          handleArrayChange(
                            "electives",
                            index,
                            ev.target.value,
                          );
                        }}
                      />
                      <button
                        className="rounded border border-rose-200 px-2 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                        onClick={() => {
                          handleArrayRemove("electives", index);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    className="mt-2 rounded border border-sky-200 px-3 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-50"
                    onClick={() => {
                      handleAddArray("electives");
                    }}
                  >
                    add
                  </button>
                </td>
                <td className="min-w-56 px-4 py-3">
                  {form.mandatory.map((m, index) => (
                    <div className="mb-2 flex items-center gap-2 last:mb-0" key={index}>
                      <input
                        className="w-full min-w-32 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        type="text"
                        value={m}
                        onChange={(ev) => {
                          handleArrayChange(
                            "mandatory",
                            index,
                            ev.target.value,
                          );
                        }}
                      />
                      <button
                        className="rounded border border-rose-200 px-2 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                        onClick={() => {
                          handleArrayRemove("mandatory", index);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    className="mt-2 rounded border border-sky-200 px-3 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-50"
                    onClick={() => {
                      handleAddArray("mandatory");
                    }}
                  >
                    add
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700" onClick={handleAddSave}>Save</button>
                    <button className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100" onClick={handleCancel}>Cancel</button>
                  </div>
                </td>
              </tr>
            )}
            {training_matrices.map((item, index) => (
              <tr key={index} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-sky-50/50">
                <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-500">{index + 1}</th>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.id}</td>
                <td className="px-4 py-3 text-slate-800">
                  {editId === item.id ? (
                    <input
                      className="w-full min-w-32 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      type="text"
                      name="jobCode"
                      placeholder="Job Code"
                      value={form.jobCode}
                      onChange={handleChange}
                    ></input>
                  ) : (
                    item.jobCode
                  )}
                </td>
                <td className="min-w-56 px-4 py-3 text-slate-600">
                  {editId === item.id ? (
                    <div>
                      {form.electives.map((e, i) => (
                        <div className="mb-2 flex items-center gap-2 last:mb-0" key={i}>
                          <input
                            className="w-full min-w-32 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            type="text"
                            value={form.electives[i]}
                            onChange={(ev) =>
                              handleArrayChange("electives", i, ev.target.value)
                            }
                          />
                          <button
                            className="rounded border border-rose-200 px-2 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                            onClick={() => {
                              handleArrayRemove("electives", i);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <div>
                        <button
                          className="rounded border border-sky-200 px-3 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-50"
                          onClick={() => handleAddArray("electives")}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    item.electives.map((e, index) => (
                      <div className="mb-1 last:mb-0" key={index}>
                        <span className="mr-2 text-slate-400">{index + 1}.</span>{e}
                      </div>
                    ))
                  )}
                </td>
                <td className="min-w-56 px-4 py-3 text-slate-600">
                  {item.mandatory.map((m, index) => (
                    <div className="mb-1 last:mb-0" key={index}>
                      <span className="mr-2 text-slate-400">{index + 1}.</span>{m}
                    </div>
                  ))}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {editId === item.id ? (
                    <div className="flex items-center gap-2">
                      <button className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700" onClick={handleSave}>Save</button>
                      <button className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100" onClick={handleCancel}>Cancel</button>
                      <button className="rounded bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700" onClick={handleDelete}>Remove</button>
                    </div>
                  ) : (
                    <button
                      className="rounded border border-sky-200 px-3 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-50"
                      onClick={() => {
                        handleEdit(item);
                      }}
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
      </main>
    </div>
  );
};

export default AdminTrainingMatrices;
