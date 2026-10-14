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
    </div>
  );
};

export default admin;
