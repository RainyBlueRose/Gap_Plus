import { collection, getDocs, query } from "firebase/firestore";
import React, { useState } from "react";
import { db } from "../config/firebase";

const admin = () => {
  const [training_matrices, setTraining_matrices] = useState([]);
  async function loadTrainingMatrix() {
    const q = query(collection(db, "training_matrices"));
    const snap = await getDocs(q);
    const newData = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("loadTrainingMatrix newData", newData);
    setTraining_matrices(newData);
    console.log("loadTrainingMatrix data", training_matrices);
  }
  return (
    <div>
      <div>admin</div>
      <button
        className="p-3 border"
        onClick={() => {
          loadTrainingMatrix();
        }}
      >
        TrainingMatrix
      </button>
      <table className="border">
        <thead className="">
          <tr>
            <th>#</th>
            <th>id</th>
            <th>Job Code</th>
            <th>Elective</th>
            <th>Mandatory</th>
          </tr>
        </thead>
        <tbody>
          {training_matrices.map((item, index) => (
            <tr key={index}>
              <th>{index + 1}</th>
              <td>{item.id}</td>
              <td>{item.jobCode}</td>
              <td>
                {item.electives.map((e, index) => (
                  <tr key={index}>
                    <td>
                      {index + 1}. {e}
                    </td>
                  </tr>
                ))}
              </td>
              <td>
                {item.mandatory.map((m, index) => (
                  <tr key={index}>
                    <td>
                      {index + 1}. {m}
                    </td>
                  </tr>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default admin;
