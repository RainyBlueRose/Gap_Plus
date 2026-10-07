import React from "react";

import Header from "../layouts/Header";

import { useCompetenciesData } from "../../store/competenciesSlice";

const MyLearning = () => {
  const { competencies, status } = useCompetenciesData();
  console.log("competencies my learning", competencies);

  return (
    <div>
      <Header />
      <div>MyLearning</div>

      {status === "loading" && <p>กำลังโหลด...</p>}

      <h2>วิชาบังคับ</h2>
      {competencies.mandatory.map((c) => (
        <div key={c.id}>
          <h3>{c.competencyName}</h3>
          {c.courses.map((d) => (
            <div key={d.link}>
              <a href={d.link}>{d.institute}</a>
            </div>
          ))}
          <p>{c.description}</p>
        </div>
      ))}
      {competencies.electives.map((c) => (
        <div key={c.id}>
          <h3>{c.competencyName}</h3>
          {c.courses.map((d) => (
            <div key={d.link}>
              <div key={d.link}>
                <a href={d.link}>{d.institute}</a>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MyLearning;
