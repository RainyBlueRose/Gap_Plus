import React, { useState } from "react";

import Header from "../layouts/Header";

import { useCompetenciesData } from "../../store/competenciesSlice";

import { useTrainingMatrix } from "../functions/hooks/useTrainingMatrix";
import { useCompetencies } from "../functions/hooks/useCompetencies";
import { useIDPRecords } from "../functions/hooks/useIDPRecords";

const MyLearning = () => {
  const { competencies, status } = useCompetenciesData();

  useTrainingMatrix();
  useCompetencies();

  const { setElectiveIDPRecords } = useIDPRecords();

  const [selectedMandatory, setSelectedMandatory] = useState(null);
  const [selectedSelective, setSelectedSelective] = useState(null);

  console.log("competencies", competencies);

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
              setSelectedMandatory(m);
            }}
          >
            <div>{m.competencyName}</div>
            <div>{m.description}</div>
          </div>
        </div>
      ))}
      <div>Elective</div>

      {competencies.electives.map((e) => (
        <div key={e.id}>
          <div
            className="border p-5 hover:cursor-pointer"
            onClick={() => {
              setSelectedSelective(e);
            }}
          >
            <div>{e.competencyName}</div>
            <div>{e.description}</div>
          </div>
        </div>
      ))}

      {selectedSelective && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setSelectedSelective(null)}
        >
          <div
            className="bg-white p-5 rounded"
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              <button
                className="border p-5 "
                onClick={() => {
                  setElectiveIDPRecords(selectedSelective);
                }}
              >
                Select class
              </button>
              {Object.values(selectedSelective.courses).map((course, index) => (
                <div key={index}>
                  <a href={course.link}>{course.institute}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {selectedMandatory && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setSelectedMandatory(null)}
        >
          <div
            className="bg-white p-5 rounded"
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              {Object.values(selectedMandatory.courses).map((course, index) => (
                <div key={index}>
                  <div>{course.institute}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLearning;
