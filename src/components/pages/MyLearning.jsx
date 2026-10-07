import React from "react";

import Header from "../layouts/Header";

import { useCompetenciesData } from "../../store/competenciesSlice";

const MyLearning = () => {
  const { competencies, status } = useCompetenciesData();

  return (
    <div>
      <Header />
      <div>MyLearning</div>

      {status === "loading" && <p>กำลังโหลด...</p>}

      <h2>วิชาบังคับ</h2>
      {competencies.mandatory.map((c) => (
        <div key={c.id}>
          <h3>{c.competencyName}</h3>
          <p>{c.description}</p>
        </div>
      ))}
    </div>
  );
};

export default MyLearning;
