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

const btnPrimary =
  "rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";
const btnSecondary =
  "rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-100 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";
const btnDanger =
  "rounded-md border border-rose-300 bg-white px-4 py-2 text-rose-700 hover:bg-rose-50 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300";
const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

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

function CourseListEditor({ label, field, values, onChange, onRemove, onAdd }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      <div className="flex flex-col gap-2">
        {values.map((value, index) => (
          <div className="flex items-center gap-2" key={index}>
            <input
              className={inputCls}
              type="text"
              value={value}
              onChange={(event) => onChange(field, index, event.target.value)}
            />
            <button
              type="button"
              className={btnDanger}
              onClick={() => onRemove(field, index)}
            >
              เอาออก
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={`${btnSecondary} mt-2`} onClick={() => onAdd(field)}>
        เพิ่มรายการ
      </button>
    </div>
  );
}

function CourseList({ label, items }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">ไม่มีรายการ</p>
      ) : (
        <ol className="flex flex-col gap-1 text-sm text-slate-800">
          {items.map((item, index) => (
            <li key={index}>
              <span className="mr-2 text-slate-400">{index + 1}.</span>
              {item}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const AdminTrainingMatrices = () => {
  //editId เอาไว้เก็บ id ที่ทำการกดปุ่ม edit
  const [editId, setEditId] = useState(null);
  //form เอาไว้เก็บข้อมูลที่พิมพ์เข้ามาตอนที่จะ Add ข้อมูลหรือทำการแก้ไขข้อมูล
  const [form, setForm] = useState({});
  //training_matrices เอาไว้เก็บข้อมูลที่เรียกมาจาก Firebase แบบโดยรวม
  const [training_matrices, setTraining_matrices] = useState([]);

  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openIds, setOpenIds] = useState({});

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
    setLoading(true);
    try {
      const snap = await getDocs(q);
      const newData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTraining_matrices(newData);
      setLoaded(true);
      setOpenIds({});
    } finally {
      setLoading(false);
    }
  }

  function handleAddEdit(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEdit(item) {
    setEditId(item.id);
    setOpenIds((prev) => ({ ...prev, [item.id]: true }));
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
    await setDoc(doc(db, "training_matrices", newData.jobCode), newData);

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

  function toggleOpen(id) {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function expandAll() {
    const next = {};
    training_matrices.forEach((item) => {
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
        <h1 className="text-xl font-semibold text-slate-900">Training Matrices</h1>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-slate-500">
            {loaded
              ? `แสดง ${training_matrices.length} รายการ`
              : "ยังไม่ได้ค้นหา"}
          </p>
          {training_matrices.length > 0 && (
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
          className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
          onSubmit={(event) => {
            event.preventDefault();
            loadTrainingMatrix();
          }}
        >
          <label className="flex w-56 flex-col gap-1 text-sm text-slate-600">
            Job Code
            <input
              className={inputCls}
              type="text"
              name="jobCode"
              value={search}
              placeholder="เว้นว่างเพื่อค้นหาทั้งหมด"
              onChange={handleQuery}
            />
          </label>
          <button type="submit" className={btnPrimary} disabled={loading}>
            {loading ? "กำลังค้นหา..." : "ค้นหา"}
          </button>
          <button type="button" className={btnSecondary} onClick={handleAddData}>
            {isAdding ? "ปิดฟอร์มเพิ่มข้อมูล" : "เพิ่มข้อมูล"}
          </button>
        </form>

        <div className="flex flex-col gap-4">
          {isAdding && (
            <section className="rounded-lg border border-slate-300 bg-white p-4">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">เพิ่ม Training Matrix</h2>
              <p className="mb-4 text-sm text-slate-500">รหัสเอกสารจะถูกสร้างจาก Job Code</p>
              <label className="mb-4 flex max-w-sm flex-col gap-1 text-sm text-slate-600">
                Job Code
                <input
                  className={inputCls}
                  type="text"
                  name="jobCode"
                  value={form.jobCode}
                  onChange={handleAddEdit}
                />
              </label>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <CourseListEditor
                  label="Elective"
                  field="electives"
                  values={form.electives}
                  onChange={handleArrayChange}
                  onRemove={handleArrayRemove}
                  onAdd={handleAddArray}
                />
                <CourseListEditor
                  label="Mandatory"
                  field="mandatory"
                  values={form.mandatory}
                  onChange={handleArrayChange}
                  onRemove={handleArrayRemove}
                  onAdd={handleAddArray}
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" className={btnPrimary} onClick={handleAddSave}>
                  บันทึก
                </button>
                <button type="button" className={btnSecondary} onClick={handleCancel}>
                  ยกเลิก
                </button>
              </div>
            </section>
          )}

          {training_matrices.map((item) => {
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
                    <div className="text-lg font-semibold text-slate-900">{item.jobCode}</div>
                    <div className="break-all text-sm text-slate-500">รหัสเอกสาร: {item.id}</div>
                  </div>
                  <div className="shrink-0 text-right text-sm text-slate-500">
                    <div>Elective {item.electives?.length ?? 0}</div>
                    <div>Mandatory {item.mandatory?.length ?? 0}</div>
                  </div>
                </button>

                {open && (
                  <div className="border-t border-slate-200 p-4">
                    {editing ? (
                      <>
                        <label className="mb-4 flex max-w-sm flex-col gap-1 text-sm text-slate-600">
                          Job Code
                          <input
                            className={inputCls}
                            type="text"
                            name="jobCode"
                            placeholder="Job Code"
                            value={form.jobCode}
                            onChange={handleChange}
                          />
                        </label>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                          <CourseListEditor
                            label="Elective"
                            field="electives"
                            values={form.electives}
                            onChange={handleArrayChange}
                            onRemove={handleArrayRemove}
                            onAdd={handleAddArray}
                          />
                          <CourseListEditor
                            label="Mandatory"
                            field="mandatory"
                            values={form.mandatory}
                            onChange={handleArrayChange}
                            onRemove={handleArrayRemove}
                            onAdd={handleAddArray}
                          />
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
                        <dl className="mb-4 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                          <Info label="Job Code">{item.jobCode}</Info>
                          <Info label="รหัสเอกสาร">{item.id}</Info>
                        </dl>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                          <CourseList label="Elective" items={item.electives} />
                          <CourseList label="Mandatory" items={item.mandatory} />
                        </div>
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

          {!isAdding && training_matrices.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
              {loaded
                ? "ไม่พบข้อมูลที่ตรงกับ Job Code"
                : "กดค้นหาเพื่อดึงข้อมูล เว้นช่องไว้จะอ่านทั้งคอลเลกชัน"}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminTrainingMatrices;
