import { AdminNavbar } from "../layouts/AdminNavbar";
import { useState } from "react";
import { db } from "../config/firebase";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

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

  function handleAddData() {
    setEditId("");
    setIsAdding(!isAdding);
    setForm({
      department: "",
      email: "",
      jobCode: "",
      level: "",
      managerId: "",
      managerName: "",
      name: "",
      pointBalance: 100,
      position: "",
    });
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEdit(item) {
    setEditId(item.id);
    setForm({
      department: item.department ?? "",
      email: item.email ?? "",
      jobCode: item.jobCode ?? "",
      level: item.level ?? "",
      managerId: item.managerId ?? "",
      managerName: item.managerName ?? "",
      name: item.name ?? "",
      pointBalance: item.pointBalance ?? 0,
      position: item.position ?? "",
    });
  }

  async function handleSave() {
    const newData = {
      department: form.department.trim(),
      email: form.email.trim(),
      jobCode: form.jobCode.trim(),
      level: form.level.trim(),
      managerId: form.managerId.trim(),
      managerName: form.managerName.trim(),
      name: form.name.trim(),
      pointBalance: Number(form.pointBalance),
      position: form.position.trim(),
    };
    await updateDoc(doc(db, "employees", editId), newData);

    setEmployees(
      employees.map((item) =>
        item.id === editId ? { ...item, ...newData } : item,
      ),
    );

    setEditId(null);
    setForm({});
  }

  function handleCancel() {
    setIsAdding(false);
    setEditId(null);
    setForm({});
  }

  async function handleDelete() {
    await deleteDoc(doc(collection(db, "employees"), editId));

    setEmployees(employees.filter((item) => item.id !== editId));
    setEditId(null);
  }

  return (
    <div className="flex min-h-screen">
      <AdminNavbar />

      <div className="min-w-0 flex-1 p-6">
        <button
          className="mb-4 rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          onClick={() => {
            loadEmployees();
          }}
        >
          ค้นหาข้อมูล
        </button>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">#</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">ID</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Name</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Email</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Department</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Job Code</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Level</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Manager ID</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Manager Name</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Point Balance</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Position</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((item, index) => (
              <tr key={index} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-sky-50/50">
                <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-500">{index + 1}</th>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.empId}</td>
                <td className="px-4 py-3 text-slate-800">
                  {editId === item.id ? (
                    <input
                      className="w-full min-w-32 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={form.name}
                      onChange={handleChange}
                    ></input>
                  ) : (
                    item.name
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {editId === item.id ? (
                    <input
                      className="w-full min-w-32 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      type="text"
                      name="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={handleChange}
                    ></input>
                  ) : (
                    item.email
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {editId === item.id ? (
                    <input
                      className="w-full min-w-32 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      type="text"
                      name="department"
                      placeholder="Department"
                      value={form.department}
                      onChange={handleChange}
                    ></input>
                  ) : (
                    item.department
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {editId === item.id ? (
                    <input
                      className="w-full min-w-24 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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
                <td className="px-4 py-3 text-slate-600">
                  {editId === item.id ? (
                    <input
                      className="w-full min-w-24 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      type="text"
                      name="level"
                      placeholder="Level"
                      value={form.level}
                      onChange={handleChange}
                    ></input>
                  ) : (
                    item.level
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {editId === item.id ? (
                    <input
                      className="w-full min-w-24 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      type="text"
                      name="managerId"
                      placeholder="Manager ID"
                      value={form.managerId}
                      onChange={handleChange}
                    ></input>
                  ) : (
                    item.managerId
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {editId === item.id ? (
                    <input
                      className="w-full min-w-32 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      type="text"
                      name="managerName"
                      placeholder="Manager Name"
                      value={form.managerName}
                      onChange={handleChange}
                    ></input>
                  ) : (
                    item.managerName
                  )}
                </td>
                <td className="px-4 py-3 font-medium tabular-nums text-slate-700">
                  {editId === item.id ? (
                    <input
                      className="w-full min-w-24 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      type="text"
                      name="pointBalance"
                      placeholder="Point Balance"
                      value={form.pointBalance ?? ""}
                      onChange={handleChange}
                    ></input>
                  ) : (
                    [item.pointBalance]
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {editId === item.id ? (
                    <input
                      className="w-full min-w-32 rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      type="text"
                      name="position"
                      placeholder="Position"
                      value={form.position}
                      onChange={handleChange}
                    ></input>
                  ) : (
                    item.position
                  )}
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
      </div>
    </div>
  );
};

export default AdminEmployees;
