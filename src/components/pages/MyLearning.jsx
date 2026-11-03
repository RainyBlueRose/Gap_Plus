import { useState } from "react";

import Header from "../layouts/Header";

import { useCompetenciesData } from "../../store/competenciesSlice";

import { useTrainingMatrix } from "../functions/hooks/useTrainingMatrix";
import { useCompetencies } from "../functions/hooks/useCompetencies";
import { useIDPRecords } from "../functions/hooks/useIDPRecords";
import { useUploadCourseFile } from "../functions/hooks/useUploadCourseFile";
import { useCreateIDPRecords } from "../functions/hooks/useCreateIDPRecords";

function Page(props) {
  return (
    // <div className="bg-[#EDF0FF]">
    <div>
      <div>{props.children}</div>
    </div>
  );
}

function RenderCourseElectiveHeadline({
  onSelectCourseClick,
  competencyName,
  courseStatus,
  description,
}) {
  return (
    <div className="flex justify-between gap-3">
      <RenderCourseElectiveHeadlineText
        competencyName={competencyName}
        description={description}
      />
      <SavedSelectiveButton
        onSelectCourseClick={onSelectCourseClick}
        courseStatus={courseStatus}
      />
    </div>
  );
}

function RenderCourseElectiveHeadlineText({ competencyName, description }) {
  return (
    <div>
      <RenderCourseElectiveHeadlineName competencyName={competencyName} />
      <RenderCourseElectiveHeadlineDescription description={description} />
    </div>
  );
}

function RenderCourseElectiveHeadlineName({ competencyName }) {
  return (
    <div className="font-notosanthai-semibold text-xl">{competencyName}</div>
  );
}

function RenderCourseElectiveHeadlineDescription({ description }) {
  return (
    <div className="font-notosanthai-regular text-gray-400 text-sm">
      {description}
    </div>
  );
}

function SavedSelectiveButton({ onSelectCourseClick, courseStatus }) {
  return (
    <div className="flex flex-col justify-center font-notosanthai-regular whitespace-nowrap">
      {courseStatus === "In Progress" && (
        <div className="font-supreme-regular px-10 py-2 bg-[#B3C6F9] shadow-sm rounded-sm">
          In Progress
        </div>
      )}
      {courseStatus === "Complete" && (
        <div className="font-supreme-regular px-10 py-2 bg-[#85F8C4] shadow-sm rounded-sm">
          Complete
        </div>
      )}
      {courseStatus === undefined && (
        <button
          className="font-supreme-regular px-10 py-2 border border-[#2e4dff] text-[#2e4dff] bg-[#e0e5ff] shadow-sm rounded-sm"
          onClick={() => {
            onSelectCourseClick();
          }}
        >
          เลือกหลักสูตร
        </button>
      )}
    </div>
  );
}

function RenderCourseContainer({
  course,
  certificate,
  file,
  onFileChange,
  onTextChange,
  reflection,
  onSaveClick,
}) {
  return (
    <div className="rounded-lg shadow-xl border-lg">
      <div className="bg-[#FAFAFA] p-5 border-b-gray-100 rounded-t-lg">
        <RenderCourseContainerHeadline course={course} />
      </div>
      <div className="p-5">
        <RenderCourseContainerFileInput
          certificate={certificate}
          file={file}
          onFileChange={onFileChange}
        />
        <RenderCourseContainerTextInput
          reflection={reflection}
          certificate={certificate}
          onTextChange={onTextChange}
        />
        <RenderCourseContainerSaveButton onSaveClick={onSaveClick} />
      </div>
    </div>
  );
}

function RenderCourseContainerHeadline({ course }) {
  return (
    <div className="flex justify-between font-notosanthai-semibold">
      {course.link ? (
        <a className="text-xl" href={course.link}>
          {course.name === "" ? <div>{course.link}</div>: <div>{course.name}</div>}
        </a>
      ) : (
        <div className="text-xl">{course.name}</div>
      )}
      <div>{course.institute}</div>
    </div>
  );
}

function RenderCourseContainerFileInput({ file, certificate, onFileChange }) {
  const imgName = certificate?.name;
  const imgUrl = certificate?.url;
  return (
    <div className="flex flex-col gap-4">
      <label className="font-notosanthai-regular text-gray-700">
        หลักฐานการสำเร็จหลักสูตร / วุฒิบัตร (เลือกไฟล์)
      </label>
      <div className="rounded-xl p-5 bg-[#fafafa]">
        <label className="inline-block px-3 py-2 rounded-sm bg-white border-gray-500 border-2 rounded-[24px] font-notosanthai-regular px-10 hover:cursor-pointer">
          {file ? file.name : "เลือกไฟล์"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => onFileChange(e.target.files[0])}
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
    </div>
  );
}

function RenderCourseContainerTextInput({
  reflection,
  certificate,
  onTextChange,
}) {
  return (
    <div className="py-5">
      <h1 className="font-notosanthai-regular py-3 text-lg">
        คำอธิบายและการนำไปประยุกต์ใช้ในการปฏิบัติงาน
      </h1>
      <textarea
        className="border border-gray-200 border-2 rounded-lg w-full h-30 p-3 font-notosanthai-regular focus:border-gray-500 outline-none"
        placeholder="รายละเอียดความรู้ที่ได้รับ หรือสรุปผลสัมฤทธิ์ของหลักสูตร..."
        value={reflection ?? certificate?.reflection ?? ""}
        onChange={(e) => {
          onTextChange(e);
        }}
      ></textarea>
    </div>
  );
}

function RenderCourseContainerSaveButton({ onSaveClick }) {
  return (
    <div className="flex justify-end">
      <button
        className="inline-block px-3 py-2 rounded-xl bg-[#007AFF] rounded-[24px] font-notosanthai-regular text-white px-10 hover:cursor-pointer active:bg-[#006adb] transition duration-150"
        onClick={() => {
          onSaveClick();
        }}
      >
        บันทึก
      </button>
    </div>
  );
}

const MyLearning = () => {
  const { competencies, status } = useCompetenciesData();
  const { uploadCourseFileElective, uploadCourseFileMandatory } =
    useUploadCourseFile();
  const {
    setElectiveIDPRecords,
    checkSelectedCourseStatus,
    fetchIDPRecordFromCache,
  } = useIDPRecords();

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
    setReflection({});
  };

  // ---------- modals ----------
  /*
  
  
  
  
  
  
  
  
  
  */

  // <button
  //   className="border p-5"
  //   disabled={!!courseStatus}
  //   onClick={() => setElectiveIDPRecords(selectedSelective)}
  // >
  //   Select class
  // </button>
  const renderCourseElective = () => {
    if (!selectedSelective) return null;
    console.log("selectedSelective", selectedSelective);

    const courseStatus = checkSelectedCourseStatus(selectedSelective);
    // รองรับ 3 กรณี: ยังไม่เลือก / In Progress / Complete
    if (
      courseStatus &&
      courseStatus !== "In Progress" &&
      courseStatus !== "Complete"
    ) {
      return null;
    }

    const selfLearningIndex = selectedSelective.courses.length + 1;
    const idpRecord = fetchIDPRecordFromCache(selectedSelective);
    const savedSelfLearning = idpRecord?.certificates?.[selfLearningIndex];

    return (
      //กดด้านนอกกรอบจะปิด
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
        onClick={closeElective}
      >
        <div
          className="bg-white p-5 rounded w-2/4 h-3/4 overflow-y-auto"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex flex-col gap-3">
            {/* ถ้ามีสถานะแล้ว (In Progress / Complete) จะกดเลือกซ้ำไม่ได้ */}
            <RenderCourseElectiveHeadline
              onSelectCourseClick={() =>
                setElectiveIDPRecords(selectedSelective)
              }
              competencyName={selectedSelective.competencyName}
              description={selectedSelective.description}
              courseStatus={courseStatus}
            />

            {selectedSelective.courses.map((course, index) => {
              return (
                <RenderCourseContainer
                  key={index}
                  course={course}
                  file={files[index]}
                  onFileChange={(file) => {
                    handleFileChange(index, file);
                  }}
                  certificate={idpRecord?.certificates?.[index]}
                  reflection={reflections[index]}
                  onTextChange={(e) => {
                    handleReflectionChange(index, e);
                  }}
                  onSaveClick={() => {
                    handleSaveElective(selectedSelective, index);
                  }}
                />
              );
            })}
            <RenderCourseContainer
              course={{ name: "เรียนรู้ด้วยตนเอง" }}
              file={files[selfLearningIndex]}
              onFileChange={(file) => handleFileChange(selfLearningIndex, file)}
              certificate={savedSelfLearning}
              reflection={reflections[selfLearningIndex]}
              onTextChange={(e) => handleReflectionChange(selfLearningIndex, e)}
              onSaveClick={() =>
                handleSaveElective(selectedSelective, selfLearningIndex)
              }
            />
          </div>
        </div>
      </div>
    );
  };
  /*
  
  
  
  
  
  
  
  
  
  
  
  
  */

  const renderCourseMandatory = () => {
    if (!selectedMandatory) return null;

    const courseStatus = checkSelectedCourseStatus(selectedMandatory);
    // รองรับ 2 กรณี: ยังไม่เลือก / Complete
    if (courseStatus && courseStatus !== "Complete") return null;

    const selfLearningIndex = selectedMandatory.courses.length + 1;
    const idpRecord = fetchIDPRecordFromCache(selectedMandatory);
    const savedSelfLearning = idpRecord?.certificates?.[selfLearningIndex];

    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
        onClick={closeMandatory}
      >
        <div
          className="bg-white p-5 rounded w-2/4 h-3/4 overflow-y-auto"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex flex-col gap-3">
            <div className="flex justify-between gap-3">
              <RenderCourseElectiveHeadlineText
                competencyName={selectedMandatory.competencyName}
                description={selectedMandatory.description}
              />
              <ClassMandatoryStatus status={courseStatus} />
            </div>
            {selectedMandatory.courses.map((course, index) => {
              const saved = idpRecord?.certificates?.[index];
              return (
                <RenderCourseContainer
                  key={index}
                  course={{
                    ...course,
                    name: course.name || course.institute || course.link,
                  }}
                  file={files[index]}
                  onFileChange={(file) => handleFileChange(index, file)}
                  certificate={saved}
                  reflection={reflections[index]}
                  onTextChange={(e) => handleReflectionChange(index, e)}
                  onSaveClick={() =>
                    handleSaveMandatory(selectedMandatory, index)
                  }
                />
              );
            })}

            <RenderCourseContainer
              course={{ name: "เรียนรู้ด้วยตนเอง" }}
              file={files[selfLearningIndex]}
              onFileChange={(file) =>
                handleFileChange(selfLearningIndex, file)
              }
              certificate={savedSelfLearning}
              reflection={reflections[selfLearningIndex]}
              onTextChange={(e) =>
                handleReflectionChange(selfLearningIndex, e)
              }
              onSaveClick={() =>
                handleSaveMandatory(selectedMandatory, selfLearningIndex)
              }
            />
          </div>
        </div>
      </div>
    );
  };

  // ---------- page ----------

  function LoadingScreen({ loadingStatus }) {
    if (loadingStatus !== "loading") return;
    return <div>กำลังโหลด</div>;
  }

  function IntroSection(props) {
    return <div>{props.children}</div>;
  }

  function IntroHeadline() {
    return (
      <div>
        <IntroHeadlineText />
        <IntroSubHeadlineText />
      </div>
    );
  }
  function IntroHeadlineText() {
    return <div></div>;
  }

  function IntroSubHeadlineText() {
    return <div></div>;
  }

  function ClassesSection(props) {
    return <div className="p-10">{props.children}</div>;
  }

  function ClassesMandatory() {
    return (
      <div className="px-10 flex flex-col gap-5 bg-white rounded-lg">
        <ClassesMandatoryHeadline />
        <ClassesMandatoryContainer />
      </div>
    );
  }

  function ClassesMandatoryHeadline() {
    return (
      <div className="flex flex-col p-5 gap-1">
        <ClassesMandatoryHeadlineText />
        <ClassesMandatorySubHeadlineText />
      </div>
    );
  }

  function ClassesMandatoryContainer() {
    return (
      //ปรับจำนวน Grid ตรงนี้
      <div className="grid grid-cols-2 gap-4">
        {competencies.mandatory.map((m) => {
          const itemStatus = checkSelectedCourseStatus(m);
          if (itemStatus && itemStatus !== "Complete") return null;

          return (
            <div key={m.id}>
              <div
                className={`rounded-lg border border-gray-100 border-l-5 ${itemStatus === "Complete" ? `border-l-green-500` : `border-l-[#B3C6F9]`} p-5 hover:cursor-pointer h-full flex flex-col gap-4 justify-between`}
                onClick={() => setSelectedMandatory(m)}
              >
                <ClassesMandatoryContainerStatusAndHeadline
                  competencyName={m.competencyName}
                  status={itemStatus}
                />
                <ClassesDescriptionAndDetail description={m.description} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function ClassesMandatoryContainerStatusAndHeadline({
    competencyName,
    status,
  }) {
    return (
      <div className="flex justify-between">
        <div className="font-notosanthai-semibold text-lg">
          {competencyName}
        </div>
        <ClassMandatoryStatus status={status} />
      </div>
    );
  }

  function ClassesMandatoryHeadlineText() {
    return (
      <div className="font-supreme-regular text-3xl font-bold">Mandatory</div>
    );
  }

  function ClassesMandatorySubHeadlineText() {
    return (
      <div className="text-gray-600 font-notosanthai-regular">
        รายวิชาบังคับตามตำแหน่งงานของท่าน
      </div>
    );
  }

  function ClassMandatoryStatus({ status }) {
    return (
      <div>
        {status === "Complete" && (
          <div className="font-supreme-regular px-3 bg-[#85F8C4] shadow-sm rounded-sm whitespace-nowrap">
            Complete
          </div>
        )}
        {status === undefined && (
          <div className="font-supreme-regular px-3 bg-[#B3C6F9] shadow-sm rounded-sm whitespace-nowrap">
            Incomplete
          </div>
        )}
      </div>
    );
  }

  function ClassesDescriptionAndDetail({ description }) {
    return (
      <div className="flex">
        <ClassesMandatoryContainerDescription description={description} />
        <Detail />
      </div>
    );
  }

  function ClassesMandatoryContainerDescription({ description }) {
    return <div className="font-notosanthai-regular">{description}</div>;
  }

  function Detail() {
    return (
      <div className="flex items-center justify-end whitespace-nowrap items-end">
        <DetailText />
        <ArrowRightDown className="h-8 w-8 " />
      </div>
    );
  }

  function DetailText() {
    return <div className="font-notosanthai-regular">รายละเอียด</div>;
  }

  function ArrowRightDown({ className }) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        transform="rotate(180)"
        width="100%"
        height="100%"
        className={className}
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <path
            d="M17 17L7 7M7 7V16M7 7H16"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>{" "}
        </g>
      </svg>
    );
  }

  function ClassesSelective() {
    return (
      <div className="p-10 flex flex-col gap-5">
        <ClassesSelectiveHeadline />
        <ClassesSelectiveContainer />
      </div>
    );
  }

  function ClassesSelectiveContainer() {
    return (
      <div className="grid grid-cols-2 gap-4">
        {competencies.electives.map((e) => {
          const itemStatus = checkSelectedCourseStatus(e);
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
                className={`rounded-lg border border-gray-100 border-l-5 ${itemStatus === "Complete" ? `border-l-green-500` : itemStatus === "In Progress" ? `border-l-[#B3C6F9]` : `border-l-gray-500`} p-5 hover:cursor-pointer h-full flex flex-col gap-4 justify-between`}
                onClick={() => setSelectedSelective(e)}
              >
                <ClassesSelectiveContainerStatusAndHeadline
                  competencyName={e.competencyName}
                  status={itemStatus}
                />
                <ClassesDescriptionAndDetail description={e.description} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function ClassesSelectiveContainerStatusAndHeadline({
    competencyName,
    status,
  }) {
    return (
      <div className="flex justify-between">
        <div className="font-notosanthai-semibold text-lg">
          {competencyName}
        </div>
        <ClassSelectiveStatus status={status} />
      </div>
    );
  }

  function ClassSelectiveStatus({ status }) {
    return (
      <div>
        {status === undefined && (
          <div className="font-supreme-regular px-3 bg-[#ECF1FF] shadow-sm rounded-sm whitespace-nowrap">
            Not Selected
          </div>
        )}
        {status === "In Progress" && (
          <div className="font-supreme-regular px-3 bg-[#B3C6F9] shadow-sm rounded-sm whitespace-nowrap">
            Selected
          </div>
        )}
        {status === "Complete" && (
          <div className="font-supreme-regular px-3 bg-[#85F8C4] shadow-sm rounded-sm whitespace-nowrap">
            Complete
          </div>
        )}
      </div>
    );
  }

  function ClassesSelectiveHeadline() {
    return (
      <div className="flex flex-col p-5 gap-1">
        <ClassesSelectiveHeadlineText />
        <ClassesSelectiveSubHeadline />
      </div>
    );
  }

  function ClassesSelectiveHeadlineText() {
    return (
      <div className="font-supreme-regular text-3xl font-bold">Selective</div>
    );
  }

  function ClassesSelectiveSubHeadline() {
    return (
      <div className="text-gray-600 font-notosanthai-regular">
        ท่านสามารถเลือกวิชาที่ต้องการเรียนได้ที่แสดงอยู่โดยต้องเลือกอย่างน้อย 1
        วิชาเรียนและสามารถเลือกเรียนได้มากกว่า 1 วิชา
      </div>
    );
  }

  return (
    <Page>
      <Header />
      <LoadingScreen loadingStatus={status} />
      <IntroSection>
        <IntroHeadline />
      </IntroSection>
      <ClassesSection>
        <ClassesMandatory />
        <ClassesSelective />
      </ClassesSection>

      {renderCourseElective()}
      {renderCourseMandatory()}
    </Page>
  );
};

export default MyLearning;
