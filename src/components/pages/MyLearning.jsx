import React from "react";

import Header from "../layouts/Header";

import { useCompetenciesData } from "../../store/competenciesSlice";

import { useTrainingMatrix } from "../functions/hooks/useTrainingMatrix";
import { useCompetencies } from "../functions/hooks/useCompetencies";

import { useState } from "react";

const MyLearning = () => {
  const { competencies, status } = useCompetenciesData();
  console.log("competencies my learning", competencies);

  useTrainingMatrix();
  useCompetencies();

  const [selectedCompetency, setSelectedCompetency] = useState(null);

  return (
    <div>
      <Header />

      {status === "loading" && <p>กำลังโหลด...</p>}

      <div>Mandatory</div>
      {competencies.mandatory.map((m) => (
        <div key={m.id}>
          <div
            className="border p-5 hover:cursor-pointer"
            onClick={() => {
              setSelectedCompetency(m);
            }}
          >
            <div>{m.competencyName}</div>
            <div>{m.description}</div>
          </div>
        </div>
      ))}
      <div>Elective</div>

      {selectedCompetency && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setSelectedCompetency(null)}
        >
          <div
            className="bg-white p-5 rounded"
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              <button
                className="border p-5 "
                onClick={() => {
                  console.log("selectClass");
                }}
              >
                Select class
              </button>
              {Object.values(selectedCompetency.courses).map(
                (course, index) => (
                  <div key={index}>
                    <div>{course.institute}</div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLearning;
