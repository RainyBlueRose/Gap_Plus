import React, { useState } from "react";

import Header from "../layouts/Header";

import { useCompetenciesData } from "../../store/competenciesSlice";

import { useTrainingMatrix } from "../functions/hooks/useTrainingMatrix";
import { useCompetencies } from "../functions/hooks/useCompetencies";
import { useIDPRecords } from "../functions/hooks/useIDPRecords";
import { useUploadCourseFile } from "../functions/hooks/useUploadCourseFile";

const MyLearning = () => {
  const { competencies, status } = useCompetenciesData();
  const { uploadCourseFile, savingIndex } = useUploadCourseFile();

  useTrainingMatrix();
  useCompetencies();

  console.log("competencies", competencies);

  const { setElectiveIDPRecords } = useIDPRecords();

  const [selectedMandatory, setSelectedMandatory] = useState(null);
  const [selectedSelective, setSelectedSelective] = useState(null);

  const [files, setFiles] = useState({});

  const handleFileChange = (courseKey, file) => {
    if (!file) return;
    setFiles((prev) => ({ ...prev, [courseKey]: file }));
  };

  const FileInput = ({ file, onChange }) => (
    <label className="border px-3 py-1 cursor-pointer inline-block">
      {file ? file.name : "เลือกไฟล์"}
      <input
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onChange(e.target.files[0])}
      />
    </label>
  );

  const handleSave = async (competency, index) => {
    const file = files[index];
    if (!file) return console.log("ยังไม่ได้เลือกไฟล์");
    await uploadCourseFile(competency, index, file);
  };
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
          onClick={() => {
            setSelectedSelective(null);
            setFiles({});
          }}
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
              {selectedSelective.courses.map((course, index) => (
                <div key={index}>
                  <div>
                    <a href={course.link}>{course.institute ?? course.link}</a>
                  </div>
                  <FileInput
                    file={files[index]}
                    onChange={(file) => handleFileChange(index, file)}
                  />
                  <button
                    onClick={() => {
                      handleSave(selectedSelective.id, index);
                    }}
                  >
                    handleSave
                  </button>
                </div>
              ))}
            </div>
            <div></div>
          </div>
        </div>
      )}
      {selectedMandatory && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          onClick={() => {
            setSelectedMandatory(null);
            setFiles({});
          }}
        >
          <div
            className="bg-white p-5 rounded"
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              {selectedMandatory.courses.map((course, index) => (
                <div key={index}>
                  <div>
                    <a href={course.link}>{course.institute ?? course.link}</a>
                  </div>
                  <FileInput
                    file={files[index]}
                    onChange={(file) => handleFileChange(index, file)}
                  />
                  <button
                    onClick={() => {
                      handleSave(selectedMandatory.id, index);
                    }}
                  >
                    handleSave
                  </button>
                </div>
              ))}
            </div>
            <div></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLearning;
