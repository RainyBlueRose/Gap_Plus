import { collection, getDocs, query } from "firebase/firestore";
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

  async function loadTrainingMatrix() {
    const q = query(collection(db, "training_matrices"));
    const snap = await getDocs(q);
    const newData = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(newData);
    setTraining_matrices(newData);

    function handleEdit(item) {
      setEditId(item.id);
      setForm({
        jobCode: item.jobCode,
        electives: [...item.electives],
        mandatory: [...item.mandatory],
      });
    }
  }
  return (
    <div className="flex min-h-screen">
      <AdminNavbar />
      <main>
        <button
          className="p-3 border"
          onClick={() => {
            loadTrainingMatrix();
          }}
        >
          ค้นหาข้อมูล
        </button>
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
                      value={
                        form.jobCode !== undefined ? form.jobCode : item.jobCode
                      }
                    ></input>
                  ) : (
                    item.jobCode
                  )}
                </td>
                <td>
                  {item.electives.map((e, index) => (
                    <div key={index}>
                      {index + 1}. {e}
                    </div>
                  ))}
                </td>
                <td>
                  {item.mandatory.map((m, index) => (
                    <div key={index}>
                      {index + 1}. {m}
                    </div>
                  ))}
                </td>
                <td>
                  <button
                    onClick={() => {
                      handleEdit(item);
                    }}
                  >
                    Edit
                  </button>
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
