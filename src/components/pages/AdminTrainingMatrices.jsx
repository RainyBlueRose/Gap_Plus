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
    setEditId(null);
    setForm({});
  }
  return (
    <div className="flex min-h-screen">
      <AdminNavbar />
      <main>
        <input
          className="border p-6"
          type="text"
          name="jobCode"
          value={search}
          placeholder="Job Code"
          onChange={handleQuery}
        />
        <button
          className="p-3 border"
          onClick={() => {
            loadTrainingMatrix();
          }}
        >
          ค้นหาข้อมูล
        </button>
        <button onClick={handleAddData}>เพิ่มข้อมูล</button>
        <table className="border">
          <thead className="">
            <tr>
              <th>#</th>
              <th>id</th>
              <th>Job Code</th>
              <th>Elective</th>
              <th>Mandatory</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr>
                <th>+</th>
                <td>สร้างอัตโนมัติ</td>
                <td>
                  <input
                    className="border"
                    type="text"
                    name="jobCode"
                    value={form.jobCode}
                    onChange={handleAddEdit}
                  />
                </td>
                <td>
                  {form.electives.map((e, index) => (
                    <div key={index}>
                      <input
                        className="border"
                        value={e}
                        onChange={(ev) => {
                          handleArrayChange(
                            "electives",
                            index,
                            ev.target.value,
                          );
                        }}
                      />
                    </div>
                  ))}
                </td>
                <td>
                  {form.mandatory.map((m, index) => (
                    <div key={index}>
                      <input
                        className="border"
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
                    </div>
                  ))}
                </td>
                <td>
                  <button onClick={handleAddSave}>Save</button>
                  <button onClick={handleCancel}>Cancel</button>
                </td>
              </tr>
            )}
            {training_matrices.map((item, index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>{item.id}</td>
                <td>
                  {editId === item.id ? (
                    <input
                      className="border"
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
                <td>
                  {editId === item.id ? (
                    <div>
                      {form.electives.map((e, i) => (
                        <div key={i}>
                          <input
                            className="border"
                            type="text"
                            value={form.electives[i]}
                            onChange={(ev) =>
                              handleArrayChange("electives", i, ev.target.value)
                            }
                          />
                          <button
                            className="border"
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
                          className="border"
                          onClick={() => handleAddArray("electives")}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    item.electives.map((e, index) => (
                      <div key={index}>
                        {index + 1}. {e}
                      </div>
                    ))
                  )}
                </td>
                <td>
                  {item.mandatory.map((m, index) => (
                    <div key={index}>
                      {index + 1}. {m}
                    </div>
                  ))}
                </td>
                <td>
                  {editId === item.id ? (
                    <div>
                      <button onClick={handleSave}>Save</button>
                      <button onClick={handleCancel}>Cancel</button>
                      <button onClick={handleDelete}>Remove</button>
                    </div>
                  ) : (
                    <button
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
      </main>
    </div>
  );
};

export default AdminTrainingMatrices;
