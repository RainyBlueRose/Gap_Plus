import { useState } from "react";

import Header from "../layouts/Header";

import { useCompetenciesData } from "../../store/competenciesSlice";

import { useTrainingMatrix } from "../functions/hooks/useTrainingMatrix";
import { useCompetencies } from "../functions/hooks/useCompetencies";
import { useIDPRecords } from "../functions/hooks/useIDPRecords";
import { useUploadCourseFile } from "../functions/hooks/useUploadCourseFile";
import { useCreateIDPRecords } from "../functions/hooks/useCreateIDPRecords";

const MyLearning = () => {
  const { competencies, status } = useCompetenciesData();
  const { uploadCourseFileElective, uploadCourseFileMandatory, savingIndex } =
    useUploadCourseFile();

  useTrainingMatrix();
  useCompetencies();
  useCreateIDPRecords();

  console.log("competencies", competencies);

  const { setElectiveIDPRecords, checkSelectedElective } = useIDPRecords();
  const [selectedMandatory, setSelectedMandatory] = useState(null);
  const [selectedSelective, setSelectedSelective] = useState(null);
  checkSelectedElective(competencies.electives[1]);
  console.log("competencies[1]", competencies.electives[1]);

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

  const handleSaveElective = async (competency, index) => {
    const file = files[index];
    if (!file) return console.log("ยังไม่ได้เลือกไฟล์");
    await uploadCourseFileElective(competency, index, file);
  };
  const handleSaveMandatory = async (competency, index) => {
    const file = files[index];
    if (!file) return console.log("ยังไม่ได้เลือกไฟล์");
    await uploadCourseFileMandatory(competency, index, file);
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
            className="bg-white p-5 rounded w-3/4 h-3/4  overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-3">
              <button
                className="border p-5 "
                onClick={() => {
                  setElectiveIDPRecords(selectedSelective);
                }}
              >
                Select class
              </button>
              {selectedSelective.courses.map((course, index) => (
                <div className="border" key={index}>
                  <div>
                    <a href={course.link}>{course.institute ?? course.link}</a>
                  </div>
                  <div className="flex flex-col gap-3">
                    <FileInput
                      file={files[index]}
                      onChange={(file) => handleFileChange(index, file)}
                    />
                    <textarea
                      className="border p-1 h-30"
                      type="text"
                      placeholder="คำอธิบาย"
                    />
                    <button
                      className="border p-2 cursor-pointer"
                      onClick={() => {
                        handleSaveElective(selectedSelective, index);
                      }}
                    >
                      บันทึก
                    </button>
                  </div>
                </div>
              ))}
              <div className="border">
                <div>เรียนรู้ด้วยตนเอง</div>
                <div className="flex flex-col gap-3">
                  <FileInput
                    file={files[selectedSelective.courses.length + 1]}
                    onChange={(file) =>
                      handleFileChange(
                        selectedSelective.courses.length + 1,
                        file,
                      )
                    }
                  />
                  <textarea
                    className="border p-1 h-30"
                    type="text"
                    placeholder="คำอธิบาย"
                  />
                  <button
                    className="border p-2 cursor-pointer"
                    onClick={() => {
                      handleSaveElective(
                        selectedSelective,
                        selectedSelective.courses.length + 1,
                      );
                    }}
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            </div>
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
            className="bg-white p-5 rounded w-3/4 h-3/4  overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              {selectedMandatory.courses.map((course, index) => (
                <div key={index}>
                  <div>
                    <a href={course.link}>{course.institute ?? course.link}</a>
                  </div>
                  <div className="flex flex-col gap-3">
                    <FileInput
                      file={files[index]}
                      onChange={(file) => handleFileChange(index, file)}
                    />
                    <textarea
                      className="border p-1 h-30"
                      type="text"
                      placeholder="คำอธิบาย"
                    />
                    <button
                      className="border p-2 cursor-pointer"
                      onClick={() => {
                        handleSaveMandatory(selectedMandatory, index);
                      }}
                    >
                      บันทึก
                    </button>
                  </div>
                </div>
              ))}
              <div>
                <div className="flex flex-col gap-3">
                  <div>เรียนรู้ด้วยตนเอง</div>
                  <FileInput
                    file={files[selectedMandatory.courses.length + 1]}
                    onChange={(file) =>
                      handleFileChange(
                        [selectedMandatory.courses.length + 1],
                        file,
                      )
                    }
                  />
                  <textarea
                    className="border p-1 h-30"
                    type="text"
                    placeholder="คำอธิบาย"
                  />
                  <button
                    className="border p-2 cursor-pointer"
                    onClick={() => {
                      handleSaveMandatory(selectedMandatory, [
                        selectedMandatory.courses.length + 1,
                      ]);
                    }}
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLearning;
