import { useState } from "react";

import Header from "../layouts/Header";

import { useCompetenciesData } from "../../store/competenciesSlice";

import { useTrainingMatrix } from "../functions/hooks/useTrainingMatrix";
import { useCompetencies } from "../functions/hooks/useCompetencies";
import { useIDPRecords } from "../functions/hooks/useIDPRecords";
import { useUploadCourseFile } from "../functions/hooks/useUploadCourseFile";
import { useCreateIDPRecords } from "../functions/hooks/useCreateIDPRecords";

const FileInput = ({ file, onChange, record }) => {
  const imgName = record?.name;
  const imgUrl = record?.url;
  return (
    <div>
      <label className="border px-3 py-1 cursor-pointer inline-block">
        {file ? file.name : "เลือกไฟล์"}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => onChange(e.target.files[0])}
        />
      </label>
      {imgUrl && (
        <a
          href={imgUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-blue-600 underline inline-block"
        >
          {imgName || "ดูรูปภาพ"}
        </a>
      )}
    </div>
  );
};

const MyLearning = () => {
  const { competencies, status } = useCompetenciesData();
  const { uploadCourseFileElective, uploadCourseFileMandatory } =
    useUploadCourseFile();
  const { setElectiveIDPRecords, checkSelectedCourse, getIDPRecord } =
    useIDPRecords();

  useTrainingMatrix();
  useCompetencies();
  useCreateIDPRecords();

  const [selectedMandatory, setSelectedMandatory] = useState(null);
  const [selectedSelective, setSelectedSelective] = useState(null);
  const [files, setFiles] = useState({});
  const [reflections, setReflection] = useState({});

  // ---------- handlers ----------

  const handleFileChange = (courseKey, file) => {
    if (!file) return;
    setFiles((prev) => ({ ...prev, [courseKey]: file }));
  };

  const handleReflectionChange = (courseKey, e) => {
    setReflection((prev) => ({ ...prev, [courseKey]: e.target.value }));
  };

  const handleSaveElective = async (competency, index) => {
    const file = files[index];
    const reflection = reflections[index];
    if (!file) return;
    await uploadCourseFileElective(competency, index, file, reflection);
  };

  const handleSaveMandatory = async (competency, index) => {
    const file = files[index];
    const reflection = reflections[index];
    if (!file) return;
    await uploadCourseFileMandatory(competency, index, file, reflection);
  };

  const closeElective = () => {
    setSelectedSelective(null);
    setFiles({});
    setReflection({});
  };

  const closeMandatory = () => {
    setSelectedMandatory(null);
    setFiles({});
  };

  // ---------- modals ----------

  const renderCourseElective = () => {
    if (!selectedSelective) return null;

    const courseStatus = checkSelectedCourse(selectedSelective);
    // รองรับ 3 กรณี: ยังไม่เลือก / In Progress / Complete
    if (
      courseStatus &&
      courseStatus !== "In Progress" &&
      courseStatus !== "Complete"
    ) {
      return null;
    }

    const selfLearningIndex = selectedSelective.courses.length + 1;
    const record = getIDPRecord(selectedSelective);
    const savedSelfLearning = record?.certificates?.[selfLearningIndex];

    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
        onClick={closeElective}
      >
        <div
          className="bg-white p-5 rounded w-3/4 h-3/4 overflow-y-auto"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex flex-col gap-3">
            {/* ถ้ามีสถานะแล้ว (In Progress / Complete) จะกดเลือกซ้ำไม่ได้ */}
            <button
              className="border p-5"
              disabled={!!courseStatus}
              onClick={() => setElectiveIDPRecords(selectedSelective)}
            >
              Select class
            </button>

            {selectedSelective.courses.map((course, index) => {
              const saved = record?.certificates?.[index];
              return (
                <div className="border" key={index}>
                  <div>
                    <a href={course.link}>{course.institute ?? course.link}</a>
                  </div>
                  <div className="flex flex-col gap-3">
                    <FileInput
                      file={files[index]}
                      onChange={(file) => handleFileChange(index, file)}
                      record={saved}
                    />
                    <textarea
                      className="border p-1 h-30"
                      placeholder="คำอธิบาย"
                      value={reflections[index] ?? saved?.reflection ?? ""}
                      onChange={(e) => handleReflectionChange(index, e)}
                    />
                    <button
                      className="border p-2 cursor-pointer"
                      onClick={() =>
                        handleSaveElective(selectedSelective, index)
                      }
                    >
                      บันทึก
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="border">
              <div>เรียนรู้ด้วยตนเอง</div>
              <div className="flex flex-col gap-3">
                <FileInput
                  file={files[selfLearningIndex]}
                  onChange={(file) => handleFileChange(selfLearningIndex, file)}
                />
                <textarea
                  className="border p-1 h-30"
                  placeholder="คำอธิบาย"
                  value={
                    reflections[selfLearningIndex] ??
                    savedSelfLearning?.reflection ??
                    ""
                  }
                  onChange={(e) => handleReflectionChange(selfLearningIndex, e)}
                />
                <button
                  className="border p-2 cursor-pointer"
                  onClick={() =>
                    handleSaveElective(selectedSelective, selfLearningIndex)
                  }
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCourseMandatory = () => {
    if (!selectedMandatory) return null;

    const courseStatus = checkSelectedCourse(selectedMandatory);
    // รองรับ 2 กรณี: ยังไม่เลือก / Complete
    if (courseStatus && courseStatus !== "Complete") return null;

    const selfLearningIndex = selectedMandatory.courses.length + 1;
    const record = getIDPRecord(selectedMandatory);
    const savedSelfLearning = record?.certificates?.[selfLearningIndex];

    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
        onClick={closeMandatory}
      >
        <div
          className="bg-white p-5 rounded w-3/4 h-3/4 overflow-y-auto"
          onClick={(event) => event.stopPropagation()}
        >
          <div>
            {courseStatus === "Complete" && <div>(complete)</div>}

            {selectedMandatory.courses.map((course, index) => {
              const saved = record?.certificates?.[index];
              return (
                <div key={index}>
                  <div>
                    <a href={course.link}>{course.institute ?? course.link}</a>
                  </div>
                  <div className="flex flex-col gap-3">
                    <FileInput
                      file={files[index]}
                      onChange={(file) => handleFileChange(index, file)}
                      record={saved}
                    />
                    <textarea
                      className="border p-1 h-30"
                      placeholder="คำอธิบาย"
                      value={reflections[index] ?? saved?.reflection ?? ""}
                      onChange={(e) => handleReflectionChange(index, e)}
                    />
                    <button
                      className="border p-2 cursor-pointer"
                      onClick={() =>
                        handleSaveMandatory(selectedMandatory, index)
                      }
                    >
                      บันทึก
                    </button>
                  </div>
                </div>
              );
            })}

            <div>
              <div className="flex flex-col gap-3">
                <div>เรียนรู้ด้วยตนเอง</div>
                <FileInput
                  file={files[selfLearningIndex]}
                  onChange={(file) => handleFileChange(selfLearningIndex, file)}
                />
                <textarea
                  className="border p-1 h-30"
                  placeholder="คำอธิบาย"
                  value={
                    reflections[selfLearningIndex] ??
                    savedSelfLearning?.reflection ??
                    ""
                  }
                  onChange={(e) => handleReflectionChange(selfLearningIndex, e)}
                />
                <button
                  className="border p-2 cursor-pointer"
                  onClick={() =>
                    handleSaveMandatory(selectedMandatory, selfLearningIndex)
                  }
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  function MyLearning(props) {
    return (
      <div>
        <div>{props.children}</div>
      </div>
    );
  }
  // ---------- page ----------

  function LoadingScreen({ loadingStatus }) {
    if (loadingStatus !== "loading") return;
    return <div>กำลังโหลด</div>;
  }

  function ClassesSection(props) {
    return <div>{props.children}</div>;
  }

  function ClassesMandatory() {
    return (
      <div>
        <div>Mandatory</div>
        {competencies.mandatory.map((m) => {
          const itemStatus = checkSelectedCourse(m);
          if (itemStatus && itemStatus !== "Complete") return null;

          return (
            <div key={m.id}>
              <div
                className="border p-5 hover:cursor-pointer"
                onClick={() => setSelectedMandatory(m)}
              >
                <div>
                  {m.competencyName}
                  {itemStatus && ` (${itemStatus})`}
                </div>
                <div>{m.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function ClassesSelective() {
    return (
      <div>
        <div>Selective</div>
        {competencies.electives.map((e) => {
          const itemStatus = checkSelectedCourse(e);
          if (
            itemStatus &&
            itemStatus !== "In Progress" &&
            itemStatus !== "Complete"
          ) {
            return null;
          }

          return (
            <div key={e.id}>
              <div
                className="border p-5 hover:cursor-pointer"
                onClick={() => setSelectedSelective(e)}
              >
                <div>
                  {e.competencyName}
                  {itemStatus && ` (${itemStatus})`}
                </div>
                <div>{e.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <MyLearning>
      <Header />
      <LoadingScreen loadingStatus={status} />
      <ClassesSection>
        <ClassesMandatory />
        <ClassesSelective />
      </ClassesSection>

      {renderCourseElective()}
      {renderCourseMandatory()}
    </MyLearning>
  );
};

export default MyLearning;
