import { useCallback, useEffect, useState } from "react";

import Header from "../layouts/Header";

import { useCompetenciesData } from "../../store/competenciesSlice";

import { useTrainingMatrix } from "../functions/hooks/useTrainingMatrix";
import { useCompetencies } from "../functions/hooks/useCompetencies";
import { useIDPRecords } from "../functions/hooks/useIDPRecords";
import { useUploadCourseFile } from "../functions/hooks/useUploadCourseFile";
import { useCreateIDPRecords } from "../functions/hooks/useCreateIDPRecords";

/* ------------------------------------------------------------------ */
/* หน้าลงทะเบียนวิชาเรียนของพนักงาน                                      */
/*                                                                    */
/* โครงสร้างหลังการ refactor:                                            */
/*   MyLearning        ดึงข้อมูล/ hook ต่าง ๆ และเก็บว่าเปิดวิชาไหนอยู่       */
/*   CompetencySection รายการวิชา (ใช้ร่วมกันทั้ง Mandatory / Selective)   */
/*   CourseModal       หน้าต่างรายละเอียดวิชา (รวมของเดิมที่ซ้ำกัน 2 ชุด)     */
/*   CourseCard        การ์ดหลักสูตร 1 รายการ: เลือกไฟล์ + คำอธิบาย + บันทึก  */
/* ------------------------------------------------------------------ */

const btnPrimary =
  "rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";
const btnSecondary =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

/* ------------------------------ helpers ------------------------------ */

// เปิดลิงก์เฉพาะ http/https เท่านั้น
function safeUrl(link) {
  if (typeof link !== "string") return null;
  try {
    const url = new URL(link.trim());
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

// กติกาเดิม: Mandatory แสดงเฉพาะที่ยังไม่เริ่ม/Complete,
// Selective แสดงเฉพาะที่ยังไม่เลือก/In Progress/Complete
function isVisible(type, status) {
  if (!status) return true;
  if (type === "mandatory") return status === "Complete";
  return status === "In Progress" || status === "Complete";
}

/* ------------------------------ status ------------------------------ */

function StatusBadge({ type, status }) {
  let label;
  let tone;
  if (status === "Complete") {
    label = "Complete";
    tone = "bg-emerald-50 text-emerald-700";
  } else if (status === "In Progress") {
    label = "Selected";
    tone = "bg-blue-50 text-blue-700";
  } else {
    label = type === "mandatory" ? "Incomplete" : "Not selected";
    tone = "bg-slate-100 text-slate-600";
  }
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded px-2 py-0.5 text-xs font-supreme-regular ${tone}`}
    >
      {label}
    </span>
  );
}

function statusBorder(status) {
  if (status === "Complete") return "border-l-emerald-500";
  if (status === "In Progress") return "border-l-blue-500";
  return "border-l-slate-300";
}

/* ------------------------------ list ------------------------------ */

function CompetencyCard({ type, competency, status, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex h-full w-full flex-col justify-between gap-4 rounded-lg border border-l-4 border-slate-200 bg-white p-4 text-left hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${statusBorder(status)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="font-notosanthai-semibold text-lg text-slate-900">
          {competency.competencyName}
        </div>
        <StatusBadge type={type} status={status} />
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="font-notosanthai-regular text-sm text-slate-500">
          {competency.description}
        </div>
        <span className="shrink-0 whitespace-nowrap text-sm text-slate-700">
          รายละเอียด ›
        </span>
      </div>
    </button>
  );
}

function CompetencySection({
  type,
  title,
  subtitle,
  items,
  getStatus,
  onOpen,
}) {
  const visibleItems = items
    .map((competency) => ({ competency, status: getStatus(competency) }))
    .filter(({ status }) => isVisible(type, status));

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-supreme-regular text-2xl font-bold text-slate-900">
          {title}
        </h2>
        <p className="font-notosanthai-regular text-slate-500">{subtitle}</p>
      </div>

      {visibleItems.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
          ไม่มีรายวิชา
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {visibleItems.map(({ competency, status }) => (
            <CompetencyCard
              key={competency.id}
              type={type}
              competency={competency}
              status={status}
              onOpen={() => onOpen({ type, competency })}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------ modal ------------------------------ */

function CourseCard({
  course,
  certificate,
  file,
  reflection,
  onFileChange,
  onTextChange,
  onSave,
  saving,
  message,
}) {
  const displayName = course.name || course.institute || course.link;
  const courseLink = safeUrl(course.link);
  const savedUrl = safeUrl(certificate?.url);

  return (
    <div className="shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
        {courseLink ? (
          <a
            href={courseLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-notosanthai-semibold break-all text-lg text-blue-700 underline underline-offset-2 hover:text-blue-900"
          >
            {displayName} ↗
          </a>
        ) : (
          <div className="font-notosanthai-semibold text-lg text-slate-900">
            {displayName}
          </div>
        )}
        {course.institute && course.institute !== displayName && (
          <div className="font-notosanthai-regular shrink-0 text-sm text-slate-500">
            {course.institute}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div>
          <div className="font-notosanthai-regular mb-2 text-sm text-slate-600">
            หลักฐานการสำเร็จหลักสูตร / วุฒิบัตร (เลือกไฟล์)
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label
              className={`${btnSecondary} cursor-pointer focus-within:ring-2 focus-within:ring-slate-400`}
            >
              เลือกไฟล์
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => onFileChange(e.target.files[0])}
              />
            </label>
            <span className="font-notosanthai-regular break-all text-sm text-slate-600">
              {file ? file.name : "ยังไม่ได้เลือกไฟล์ใหม่"}
            </span>
            {savedUrl && (
              <a
                href={savedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-notosanthai-regular break-all text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900"
              >
                {certificate?.name || "ดูไฟล์ที่ส่งแล้ว"} ↗
              </a>
            )}
          </div>
        </div>

        <div>
          <label className="font-notosanthai-regular mb-2 block text-sm text-slate-600">
            คำอธิบายและการนำไปประยุกต์ใช้ในการปฏิบัติงาน
          </label>
          <textarea
            rows={4}
            className="font-notosanthai-regular w-full rounded-md border border-slate-300 bg-white p-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            placeholder="รายละเอียดความรู้ที่ได้รับ หรือสรุปผลสัมฤทธิ์ของหลักสูตร..."
            value={reflection ?? certificate?.reflection ?? ""}
            onChange={onTextChange}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          {message && (
            <span
              className={`text-sm ${
                message.type === "error" ? "text-rose-700" : "text-emerald-700"
              }`}
            >
              {message.text}
            </span>
          )}
          <button className={btnPrimary} onClick={onSave} disabled={saving}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CourseModal({
  type,
  competency,
  status,
  idpRecord,
  onClose,
  onSelectCourse,
  onUpload,
}) {
  // state ของไฟล์/คำอธิบายอยู่ในโมดัล เมื่อปิดโมดัลจะถูกล้างอัตโนมัติ
  const [files, setFiles] = useState({});
  const [reflections, setReflections] = useState({});
  const [savingIndex, setSavingIndex] = useState(null);
  const [messages, setMessages] = useState({});
  const [selecting, setSelecting] = useState(false);

  // ปิดด้วยปุ่ม Esc และล็อกการเลื่อนของหน้าด้านหลัง
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const courses = competency.courses ?? [];
  // หมายเหตุ: ใช้ length + 1 ตามโครงสร้างข้อมูลเดิม (ข้าม index = length)
  // ห้ามเปลี่ยน ไม่เช่นนั้นจะอ่านข้อมูลที่เคยบันทึกไว้ไม่เจอ
  const selfLearningIndex = courses.length + 1;

  const cards = [
    ...courses.map((course, index) => ({ index, course })),
    { index: selfLearningIndex, course: { name: "เรียนรู้ด้วยตนเอง" } },
  ];

  function setMessage(index, message) {
    setMessages((prev) => ({ ...prev, [index]: message }));
  }

  async function handleSave(index) {
    const certificate = idpRecord?.certificates?.[index];
    const file = files[index];
    if (!file) {
      setMessage(index, { type: "error", text: "กรุณาเลือกไฟล์ก่อนบันทึก" });
      return;
    }

    setSavingIndex(index);
    setMessage(index, null);
    try {
      // ถ้าไม่ได้แก้คำอธิบาย ให้ส่งค่าที่เคยบันทึกไว้ แทนที่จะส่ง undefined
      const reflection = reflections[index] ?? certificate?.reflection ?? "";
      await onUpload(competency, index, file, reflection);
      setFiles((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      setMessage(index, { type: "success", text: "บันทึกแล้ว" });
    } catch (err) {
      console.error(err);
      setMessage(index, {
        type: "error",
        text: "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง",
      });
    } finally {
      setSavingIndex(null);
    }
  }

  async function handleSelect() {
    setSelecting(true);
    try {
      await onSelectCourse(competency);
    } catch (err) {
      console.error(err);
    } finally {
      setSelecting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose} // กดนอกกรอบเพื่อปิด
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-modal-title"
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white p-4">
          <div className="min-w-0">
            <h2
              id="course-modal-title"
              className="font-notosanthai-semibold text-xl text-slate-900"
            >
              {competency.competencyName}
            </h2>
            <p className="font-notosanthai-regular text-sm text-slate-500">
              {competency.description}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {type === "elective" && !status ? (
              <button
                className={btnPrimary}
                onClick={handleSelect}
                disabled={selecting}
              >
                {selecting ? "กำลังเลือก..." : "เลือกหลักสูตร"}
              </button>
            ) : (
              <StatusBadge type={type} status={status} />
            )}
            <button
              className={btnSecondary}
              onClick={onClose}
              aria-label="ปิดหน้าต่าง"
            >
              ปิด
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto p-4">
          {cards.map(({ index, course }) => (
            <CourseCard
              key={index}
              course={course}
              certificate={idpRecord?.certificates?.[index]}
              file={files[index]}
              reflection={reflections[index]}
              onFileChange={(file) => {
                if (!file) return;
                setFiles((prev) => ({ ...prev, [index]: file }));
              }}
              onTextChange={(e) =>
                setReflections((prev) => ({ ...prev, [index]: e.target.value }))
              }
              onSave={() => handleSave(index)}
              saving={savingIndex === index}
              message={messages[index]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ page ------------------------------ */

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

  // { type: "mandatory" | "elective", competency } หรือ null
  const [selected, setSelected] = useState(null);
  const closeModal = useCallback(() => setSelected(null), []);

  function renderModal() {
    if (!selected) return null;
    const { type, competency } = selected;

    const courseStatus = checkSelectedCourseStatus(competency);
    if (!isVisible(type, courseStatus)) return null;

    return (
      <CourseModal
        type={type}
        competency={competency}
        status={courseStatus}
        idpRecord={fetchIDPRecordFromCache(competency)}
        onClose={closeModal}
        onSelectCourse={setElectiveIDPRecords}
        onUpload={
          type === "elective"
            ? uploadCourseFileElective
            : uploadCourseFileMandatory
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 p-4">
        <h1 className="text-xl font-semibold text-slate-900">
          วิชาเรียนของฉัน
        </h1>

        {status === "loading" && <p className="text-slate-500">กำลังโหลด...</p>}

        <CompetencySection
          type="mandatory"
          title="Mandatory"
          subtitle="รายวิชาบังคับตามตำแหน่งงานของท่าน"
          items={competencies?.mandatory ?? []}
          getStatus={checkSelectedCourseStatus}
          onOpen={setSelected}
        />

        <CompetencySection
          type="elective"
          title="Selective"
          subtitle="ท่านสามารถเลือกวิชาที่ต้องการเรียนได้ที่แสดงอยู่โดยต้องเลือกอย่างน้อย 1 วิชาเรียนและสามารถเลือกเรียนได้มากกว่า 1 วิชา"
          items={competencies?.electives ?? []}
          getStatus={checkSelectedCourseStatus}
          onOpen={setSelected}
        />
      </main>

      {renderModal()}
    </div>
  );
};

export default MyLearning;
