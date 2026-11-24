import { AdminNavbar } from "../layouts/AdminNavbar";
import { useState } from "react";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

const btnPrimary =
  "rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";
const btnSecondary =
  "rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-100 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";
const btnDanger =
  "rounded-md border border-rose-300 bg-white px-4 py-2 text-rose-700 hover:bg-rose-50 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300";
const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

const searchFields = [
  { key: "empId", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "department", label: "Department" },
  { key: "jobCode", label: "Job Code" },
  { key: "level", label: "Level" },
  { key: "managerId", label: "Manager ID" },
  { key: "managerName", label: "Manager Name" },
  { key: "pointBalance", label: "Point Balance", type: "number" },
  { key: "position", label: "Position" },
];

const editFields = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "department", label: "Department" },
  { key: "jobCode", label: "Job Code" },
  { key: "level", label: "Level" },
  { key: "managerId", label: "Manager ID" },
  { key: "managerName", label: "Manager Name" },
  { key: "pointBalance", label: "Point Balance" },
  { key: "position", label: "Position" },
];

function Chevron({ open }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
        open ? "rotate-180" : ""
      }`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Info({ label, children }) {
  return (
    <div>
      <dt className="inline text-slate-500">{label}: </dt>
      <dd className="inline break-all text-slate-900">{children}</dd>
    </div>
  );
}

function show(value) {
  return value === undefined || value === null || value === "" ? "-" : String(value);
}

function matchesLoadedEmployee(employee, filters) {
  return searchFields.every(({ key }) => {
    const value = filters[key].trim().toLowerCase();
    if (!value) return true;
    return String(employee[key] ?? "").toLowerCase().includes(value);
  });
}

const AdminEmployees = () => {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState({
    empId: "",
    name: "",
    email: "",
    department: "",
    jobCode: "",
    level: "",
    managerId: "",
    managerName: "",
    pointBalance: "",
    position: "",
  });
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [openIds, setOpenIds] = useState({});

  async function loadEmployees() {
    setIsSearching(true);
    setSearchError("");

    try {
      const filters = searchFields
        .filter(({ key }) => search[key].trim() !== "")
        .map(({ key, type }) =>
          where(
            key,
            "==",
            type === "number" ? Number(search[key]) : search[key].trim(),
          ),
        );
      const employeesQuery = query(collection(db, "employees"), ...filters);
      const snap = await getDocs(employeesQuery);
      const fetchedEmployees = snap.docs.map((employeeDoc) => ({
        id: employeeDoc.id,
        ...employeeDoc.data(),
      }));

      setEmployees((currentEmployees) => {
        const mergedEmployees = new Map(
          currentEmployees.map((employee) => [employee.id, employee]),
        );
        fetchedEmployees.forEach((employee) => {
          mergedEmployees.set(employee.id, employee);
        });
        return Array.from(mergedEmployees.values());
      });
      setLoaded(true);
    } catch (error) {
      console.error("Failed to search employees", error);
      setSearchError("ค้นหาข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setIsSearching(false);
    }
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
    setOpenIds((prev) => ({ ...prev, [item.id]: true }));
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

  function toggleOpen(id) {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const visibleEmployees = employees.filter((employee) =>
    matchesLoadedEmployee(employee, search),
  );

  function expandAll() {
    const next = {};
    visibleEmployees.forEach((item) => {
      next[item.id] = true;
    });
    setOpenIds(next);
  }

  function collapseAll() {
    setOpenIds({});
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="min-w-0 flex-1 p-6">
        <h1 className="text-xl font-semibold text-slate-900">Employees</h1>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-slate-500">
            {loaded
              ? `อ่าน ${employees.length} รายการจาก Firestore · แสดง ${visibleEmployees.length} รายการ`
              : "ยังไม่ได้ค้นหา"}
          </p>
          {visibleEmployees.length > 0 && (
            <div className="flex gap-2">
              <button type="button" className={btnSecondary} onClick={expandAll}>
                ขยายทั้งหมด
              </button>
              <button type="button" className={btnSecondary} onClick={collapseAll}>
                ย่อทั้งหมด
              </button>
            </div>
          )}
        </div>

        <form
          className="mb-4 rounded-lg border border-slate-200 bg-white p-4"
          onSubmit={(event) => {
            event.preventDefault();
            loadEmployees();
          }}
        >
          <p className="mb-3 text-sm text-slate-500">
            หลังกดค้นหาแล้ว การพิมพ์ในช่องเหล่านี้กรองเฉพาะรายการที่โหลดมาแล้วทันที
            ไม่มีการอ่านเพิ่ม พิมพ์เพียงบางส่วนก็แสดงรายการที่มีข้อความนั้น
            กดค้นหาอีกครั้งเมื่อต้องการดึงข้อมูลจาก Firestore ใหม่
          </p>
          <div className="flex flex-wrap items-end gap-3">
            {searchFields.map(({ key, label, type = "text" }) => (
              <label key={key} className="flex w-44 flex-col gap-1 text-sm text-slate-600">
                {label}
                <input
                  className={inputCls}
                  type={type}
                  value={search[key]}
                  onChange={(event) =>
                    setSearch((currentSearch) => ({
                      ...currentSearch,
                      [key]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
            <button type="submit" className={btnPrimary} disabled={isSearching}>
              {isSearching ? "กำลังค้นหา..." : "ค้นหา"}
            </button>
          </div>
        </form>

        {searchError && (
          <p className="mb-4 text-rose-700" role="alert">
            {searchError}
          </p>
        )}

        <div className="flex flex-col gap-4">
          {visibleEmployees.map((item) => {
            const editing = editId === item.id;
            const open = !!openIds[item.id] || editing;

            return (
              <section
                key={item.id}
                className="overflow-hidden rounded-lg border border-slate-300 bg-white"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggleOpen(item.id)}
                  className="flex w-full items-center gap-3 bg-slate-50 p-4 text-left hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
                >
                  <Chevron open={open} />
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-semibold text-slate-900">{show(item.name)}</div>
                    <div className="break-all text-sm text-slate-500">{show(item.empId)}</div>
                  </div>
                  <div className="shrink-0 text-right text-sm text-slate-500">
                    <div>{show(item.department)}</div>
                    <div>{show(item.jobCode)}</div>
                  </div>
                </button>

                {open && (
                  <div className="border-t border-slate-200 p-4">
                    {editing ? (
                      <>
                        <dl className="mb-4 text-sm">
                          <Info label="ID">{show(item.empId)}</Info>
                        </dl>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {editFields.map(({ key, label }) => (
                            <label key={key} className="flex flex-col gap-1 text-sm text-slate-600">
                              {label}
                              <input
                                className={inputCls}
                                type="text"
                                name={key}
                                placeholder={label}
                                value={form[key] ?? ""}
                                onChange={handleChange}
                              />
                            </label>
                          ))}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button type="button" className={btnPrimary} onClick={handleSave}>
                            บันทึก
                          </button>
                          <button type="button" className={btnSecondary} onClick={handleCancel}>
                            ยกเลิก
                          </button>
                          <button type="button" className={btnDanger} onClick={handleDelete}>
                            ลบ
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
                          <Info label="ID">{show(item.empId)}</Info>
                          <Info label="Name">{show(item.name)}</Info>
                          <Info label="Email">{show(item.email)}</Info>
                          <Info label="Department">{show(item.department)}</Info>
                          <Info label="Job Code">{show(item.jobCode)}</Info>
                          <Info label="Level">{show(item.level)}</Info>
                          <Info label="Manager ID">{show(item.managerId)}</Info>
                          <Info label="Manager Name">{show(item.managerName)}</Info>
                          <Info label="Point Balance">{show(item.pointBalance)}</Info>
                          <Info label="Position">{show(item.position)}</Info>
                        </dl>
                        <button
                          type="button"
                          className={`${btnSecondary} mt-4`}
                          onClick={() => handleEdit(item)}
                        >
                          แก้ไข
                        </button>
                      </>
                    )}
                  </div>
                )}
              </section>
            );
          })}

          {visibleEmployees.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
              {loaded
                ? "ไม่พบข้อมูลที่ตรงกับเงื่อนไขค้นหา"
                : "กรอกตัวกรองแล้วกดค้นหา เว้นทุกช่องไว้จะอ่านทั้งคอลเลกชัน"}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminEmployees;
