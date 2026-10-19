import { AdminNavbar } from "../layouts/AdminNavbar";
import { useState } from "react";
import { db } from "../config/firebase";
import { collection, query, getDocs } from "firebase/firestore";

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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEdit(item) {
    setEditId(item.id);
    setForm({
      department: "",
      email: "",
      empId: "",
      jobCode: "",
      level: "",
      managerId: "",
      managerName: "",
      name: "",
      pointBalance: null,
      position: "",
    });
  }

  return (
    <div className="flex min-h-screen">
      <AdminNavbar />

      <div>
        <button
          className="p-3 border"
          onClick={() => {
            loadEmployees();
          }}
        >
          ค้นหาข้อมูล
        </button>
        <table className="border">
          <thead className="border">
            <tr>
              <th>#</th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>department</th>
              <th>Job Code</th>
              <th>Level</th>
              <th>Manager ID</th>
              <th>Manager Name</th>
              <th>Point Balance</th>
              <th>Position</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((item, index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>{item.empId}</td>
                <td>
                  {editId === item.id ? (
                    <input
                      className="border"
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
                <td>
                  {editId === item.id ? (
                    <input
                      className="border"
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
                <td>
                  {editId === item.id ? (
                    <input
                      className="border"
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
                    <input
                      className="border"
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
                <td>
                  {editId === item.id ? (
                    <input
                      className="border"
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
                <td>
                  {editId === item.id ? (
                    <input
                      className="border"
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
                <td>
                  {editId === item.id ? (
                    <input
                      className="border"
                      type="text"
                      name="pointBalance"
                      placeholder="Point Balance"
                      value={form.pointBalance}
                      onChange={handleChange}
                    ></input>
                  ) : (
                    [item.pointBalance]
                  )}
                </td>
                <td>
                  {editId === item.id ? (
                    <input
                      className="border"
                      type="text"
                      name="position"
                      placeholder="Position"
                      value={form.position}
                      onChange={handleChange}
                    ></input>
                  ) : (
                    [item.position]
                  )}
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
      </div>
    </div>
  );
};

export default AdminEmployees;
