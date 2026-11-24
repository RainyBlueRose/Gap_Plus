import { useState } from "react";

import Header from "../layouts/Header";

import useEvaluateEmployees from "../functions/hooks/useEvaluateEmployees";
import useEvaluateTrainingMatrix from "../functions/hooks/useEvaluateTrainingMatrix";

import { useEvaluateEmployeesData } from "../../store/evaluateEmployeeSlice";
import { useEvaluateTrainingMatrixData } from "../../store/evaluateTrainingMatrixSlice";

import {
  query,
  collection,
  where,
  getDocs,
  doc,
  getDoc,
  writeBatch,
  serverTimestamp,
  increment,
  FieldPath,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../config/firebase";

/* ------------------------------------------------------------------ */
/* ออกแบบ collection: idp_scores  (1 document = การให้คะแนน 1 ครั้ง)      */
/*                                                                    */
/*   empId          รหัสพนักงานที่ถูกประเมิน                              */
/*   recordId       id ของเอกสารใน idp_records                           */
/*   compKey        id ของ competency (วิชา)                             */
/*   certKey        key ของ certificate ภายใน record.certificates         */
/*   score          คะแนน (ตัวเลข)                                       */
/*   comment        เหตุผล / คำอธิบาย                                    */
/*   evaluatorId    uid ของหัวหน้าที่ให้คะแนน                             */
/*   evaluatorName  ชื่อหัวหน้า                                          */
/*   pointDelta     คะแนนที่ถูกบวก/ลบจริงใน employees.pointBalance        */
/*   createdAt      เวลาที่ให้คะแนน (serverTimestamp)                    */
/*                                                                    */
/* - แก้คะแนน = สร้างเอกสารใหม่ (เก็บประวัติครบ ไม่ทับของเก่า)             */
/* - idp_records.certificates.<certKey>.score_id ชี้ไปที่คะแนนล่าสุดเสมอ    */
/* - ทุกครั้งที่ให้คะแนน จะปรับ employees/{empId}.pointBalance ด้วย         */
/*   (ถ้าเป็นการแก้คะแนน จะปรับเฉพาะส่วนต่างจากคะแนนครั้งก่อน)             */
/* ------------------------------------------------------------------ */

const MIN_SCORE = -10; // ปรับช่วงคะแนนได้ที่นี่ (ค่าลบ = หักแต้ม)
const MAX_SCORE = 10;
const IN_LIMIT = 30; // ข้อจำกัดของ Firestore สำหรับ "in"

const scoreKey = (recordId, certKey) => `${recordId}__${certKey}`;

function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size)
    result.push(arr.slice(i, i + size));
  return result;
}

function toMillis(ts) {
  if (!ts) return Number.MAX_SAFE_INTEGER; // เพิ่งบันทึก ยังไม่มีเวลาจาก server
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (ts instanceof Date) return ts.getTime();
  return 0;
}

function formatDate(ts) {
  if (!ts) return "เมื่อสักครู่";
  const date = typeof ts.toDate === "function" ? ts.toDate() : ts;
  return date.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatScore(score) {
  return score > 0 ? `+${score}` : `${score}`;
}

function getEvaluator() {
  const user = getAuth().currentUser;
  return {
    evaluatorId: user?.uid ?? null,
    evaluatorName: user?.displayName ?? user?.email ?? null,
  };
}

/* ------------------------------ Firestore ------------------------------ */

async function fetchCompetenciesByNames(names) {
  if (!names?.length) return [];
  const results = await Promise.all(
    chunk(names, IN_LIMIT).map(async (part) => {
      const q = query(
        collection(db, "competencies"),
        where("competencyName", "in", part),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    }),
  );
  return results.flat();
}

async function fetchIDPRecords(empId, competencyIDs) {
  if (!competencyIDs.length) return [];
  const results = await Promise.all(
    chunk(competencyIDs, IN_LIMIT).map(async (part) => {
      const q = query(
        collection(db, "idp_records"),
        where("empId", "==", empId),
        where("compKey", "in", part),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    }),
  );
  return results.flat();
}

// ดึงประวัติคะแนนทั้งหมดของพนักงาน แล้วจัดกลุ่มตาม record + certificate
// (เรียงฝั่ง client เพื่อไม่ต้องสร้าง composite index)
async function fetchScoreHistory(empId) {
  const q = query(collection(db, "idp_scores"), where("empId", "==", empId));
  const snapshot = await getDocs(q);

  const grouped = {};
  snapshot.docs.forEach((d) => {
    const data = { id: d.id, ...d.data() };
    const key = scoreKey(data.recordId, data.certKey);
    (grouped[key] ??= []).push(data);
  });
  Object.values(grouped).forEach((list) =>
    list.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)),
  );
  return grouped; // { [recordId__certKey]: [ล่าสุด, ..., เก่าสุด] }
}

// อ่านคะแนนคงเหลือของพนักงาน (document id ใน employees = empId)
async function fetchPointBalance(empId) {
  const snap = await getDoc(doc(db, "employees", empId));
  return snap.exists() ? (snap.data().pointBalance ?? null) : null;
}

// สร้างคะแนนใหม่ + อัปเดต score_id ใน record + ปรับ pointBalance พร้อมกันแบบ atomic
// previousScore = คะแนนล่าสุดของ certificate นี้ (ถ้าเคยให้แล้ว) ใช้คำนวณส่วนต่างตอนแก้คะแนน
async function createScore(record, certKey, { score, comment }, previousScore) {
  const scoreRef = doc(collection(db, "idp_scores"));
  const recordRef = doc(db, "idp_records", record.id);
  const employeeRef = doc(db, "employees", String(record.empId));
  const evaluator = getEvaluator();
  const delta = score - (previousScore ?? 0);

  const batch = writeBatch(db);
  batch.set(scoreRef, {
    empId: record.empId,
    recordId: record.id,
    compKey: record.compKey,
    certKey,
    score,
    comment,
    pointDelta: delta,
    ...evaluator,
    createdAt: serverTimestamp(),
  });
  // FieldPath ปลอดภัยแม้ certKey มีอักขระพิเศษ เช่น "."
  batch.update(
    recordRef,
    new FieldPath("certificates", certKey, "score_id"),
    scoreRef.id,
  );
  // increment เป็น atomic บน server ไม่ต้องอ่านค่าเดิมก่อน
  batch.update(employeeRef, { pointBalance: increment(delta) });
  await batch.commit();

  return {
    id: scoreRef.id,
    empId: record.empId,
    recordId: record.id,
    compKey: record.compKey,
    certKey,
    score,
    comment,
    pointDelta: delta,
    ...evaluator,
    createdAt: null,
  };
}

/* ------------------------------ UI parts ------------------------------ */

const btnPrimary =
  "rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";
const btnSecondary =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";
const inputCls =
  "w-full rounded-md border border-slate-300 bg-white p-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

function Page(props) {
  return <div className="min-h-screen bg-slate-50">{props.children}</div>;
}

function MainSection(props) {
  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 p-4 md:grid-cols-3">
      <h1 className="text-xl font-semibold text-slate-900 md:col-span-3">
        ประเมินคะแนนพนักงาน
      </h1>
      {props.children}
    </main>
  );
}

function ScoreBadge({ score }) {
  if (score === undefined) {
    return (
      <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
        รอประเมิน
      </span>
    );
  }
  const positive = score >= 0;
  return (
    <span
      className={`shrink-0 rounded px-2 py-0.5 text-sm font-semibold ${
        positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      }`}
    >
      {formatScore(score)}
    </span>
  );
}

function ScoreForm({ initial, onSubmit, onCancel }) {
  const [score, setScore] = useState(initial?.score ?? "");
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const value = Number(score);
    if (
      score === "" ||
      Number.isNaN(value) ||
      value < MIN_SCORE ||
      value > MAX_SCORE
    ) {
      setError(`กรุณากรอกคะแนนตั้งแต่ ${MIN_SCORE} ถึง ${MAX_SCORE}`);
      return;
    }
    if (!comment.trim()) {
      setError("กรุณากรอกเหตุผลในการให้คะแนน");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSubmit({ score: value, comment: comment.trim() });
    } catch (err) {
      console.error(err);
      setError("บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง");
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-sm text-slate-600">
          คะแนน ({MIN_SCORE} ถึง {MAX_SCORE}, ค่าลบ = หักแต้ม)
        </label>
        <input
          type="number"
          min={MIN_SCORE}
          max={MAX_SCORE}
          className={`${inputCls} sm:w-40`}
          placeholder="เช่น -5"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-600">คำอธิบาย</label>
        <textarea
          rows={3}
          className={inputCls}
          placeholder="อธิบายเหตุผลในการให้คะแนน"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      {error && <div className="text-sm text-rose-700">{error}</div>}
      <div className="flex gap-2">
        <button className={btnPrimary} onClick={handleSubmit} disabled={saving}>
          {saving ? "กำลังบันทึก..." : "บันทึกคะแนน"}
        </button>
        {onCancel && (
          <button className={btnSecondary} onClick={onCancel} disabled={saving}>
            ยกเลิก
          </button>
        )}
      </div>
    </div>
  );
}

// history = ประวัติคะแนนของ certificate นี้ (ล่าสุดอยู่ตัวแรก)
function ScoreSection({ history, onSave }) {
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const latest = history?.[0];

  async function handleSubmit(data) {
    await onSave(data);
    setEditing(false);
  }

  let body;
  if (!latest) {
    // ยังไม่เคยประเมิน → แสดงฟอร์ม
    body = <ScoreForm onSubmit={handleSubmit} />;
  } else if (editing) {
    // กำลังแก้ไข → ฟอร์มพร้อมค่าเดิม (บันทึกเป็นเอกสารใหม่ ประวัติเดิมยังอยู่)
    body = (
      <ScoreForm
        initial={latest}
        onSubmit={handleSubmit}
        onCancel={() => setEditing(false)}
      />
    );
  } else {
    // เคยประเมินแล้ว → แสดงคะแนนล่าสุด
    body = (
      <div className="flex flex-col gap-3">
        <div className="flex gap-4">
          <div
            className={`flex h-12 w-14 shrink-0 items-center justify-center rounded-md text-lg font-semibold ${
              latest.score >= 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {formatScore(latest.score)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="whitespace-pre-wrap break-words text-slate-700">
              {latest.comment}
            </p>
            <div className="mt-1 text-xs text-slate-500">
              {latest.evaluatorName ? `${latest.evaluatorName} · ` : ""}
              {formatDate(latest.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className={btnSecondary} onClick={() => setEditing(true)}>
            แก้ไขคะแนน
          </button>
          {history.length > 1 && (
            <button
              className={btnSecondary}
              onClick={() => setShowHistory((v) => !v)}
            >
              {showHistory ? "ซ่อนประวัติ" : `ดูประวัติ (${history.length})`}
            </button>
          )}
        </div>

        {showHistory && (
          <ul className="flex flex-col gap-2 border-t border-slate-200 pt-3">
            {history.map((h, i) => (
              <li
                key={h.id}
                className={`text-sm ${i === 0 ? "" : "opacity-60"}`}
              >
                <span
                  className={`font-semibold ${
                    h.score >= 0 ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {formatScore(h.score)}
                </span>{" "}
                <span className="text-slate-700">{h.comment}</span>
                <span className="text-slate-500">
                  {" "}
                  · {h.evaluatorName ? `${h.evaluatorName}, ` : ""}
                  {formatDate(h.createdAt)}
                  {i === 0 ? " (ล่าสุด)" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return <div className="rounded-md bg-slate-50 p-3">{body}</div>;
}

function Chevron({ open }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
        open ? "rotate-180" : ""
      }`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CourseList({ title, items, scoreHistory, onSaveScore }) {
  const [openCompId, setOpenCompId] = useState();
  const [openCertKey, setOpenCertKey] = useState();

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-medium text-slate-900">
        {title} <span className="text-sm text-slate-500">({items.length})</span>
      </h2>

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
          ไม่มีรายวิชา
        </p>
      )}

      {items.map(({ comp, record }) => {
        const isCompOpen = openCompId === comp.id;

        // ไม่ได้ส่ง
        if (!record) {
          return (
            <div
              key={comp.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="min-w-0">
                <div className="font-medium text-slate-900">
                  {comp.competencyName}
                </div>
                <div className="text-sm text-slate-500">{comp.description}</div>
              </div>
              <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                ไม่ได้ส่ง
              </span>
            </div>
          );
        }

        return (
          <div
            key={comp.id}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            <button
              type="button"
              aria-expanded={isCompOpen}
              className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
              onClick={() => {
                setOpenCompId(isCompOpen ? undefined : comp.id);
                setOpenCertKey(undefined);
              }}
            >
              <div className="min-w-0">
                <div className="font-medium text-slate-900">
                  {comp.competencyName}
                </div>
                <div className="text-sm text-slate-500">{comp.description}</div>
              </div>
              <Chevron open={isCompOpen} />
            </button>

            {isCompOpen && (
              <div className="divide-y divide-slate-100 border-t border-slate-100">
                {Object.entries(record.certificates ?? {}).map(
                  ([certKey, c]) => {
                    const fullKey = `${comp.id}__${certKey}`;
                    const isOpen = openCertKey === fullKey;
                    const history = scoreHistory[scoreKey(record.id, certKey)];

                    return (
                      <div key={certKey}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
                          onClick={() =>
                            setOpenCertKey(isOpen ? undefined : fullKey)
                          }
                        >
                          <div className="min-w-0">
                            <div className="text-slate-900">{c.compName}</div>
                            <div className="text-sm text-slate-500">
                              {c.name}
                            </div>
                            {c.reflection && (
                              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
                                {c.reflection}
                              </p>
                            )}
                          </div>
                          <ScoreBadge score={history?.[0]?.score} />
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-4">
                            <ScoreSection
                              history={history}
                              onSave={(data) =>
                                onSaveScore(record, certKey, data)
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

function EmployeeCard({ employee, pointBalance }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-lg font-medium text-slate-900">
            {employee?.name ?? "-"}
          </div>
          <div className="text-sm text-slate-500">{employee?.empId}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">คะแนนคงเหลือ</div>
          <div className="text-3xl font-semibold text-slate-900">
            {pointBalance === undefined ? "-" : (pointBalance ?? "ไม่พบข้อมูล")}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmployeeList() {
  const { evaluateEmployees } = useEvaluateEmployeesData();
  const { evaluateTrainingMatrix } = useEvaluateTrainingMatrixData();

  const [selectedEmpId, setSelectedEmpId] = useState();
  const [loading, setLoading] = useState(false);
  const [mandatoryItems, setMandatoryItems] = useState([]);
  const [electiveItems, setElectiveItems] = useState([]);
  const [scoreHistory, setScoreHistory] = useState({});
  const [pointBalance, setPointBalance] = useState();

  function findTrainingMatrixByJobCode(jobCode) {
    return evaluateTrainingMatrix.find((e) => e.jobCode === jobCode);
  }

  // จับคู่ competency กับ IDP record ของพนักงาน
  function pairWithRecords(competencies, records) {
    return competencies.map((comp) => ({
      comp,
      record: records.find((r) => r.compKey === comp.id) ?? null,
    }));
  }

  async function loadEmployee(employee) {
    const { empId, jobCode } = employee;
    setSelectedEmpId(empId);
    setLoading(true);
    setMandatoryItems([]);
    setElectiveItems([]);
    setScoreHistory({});
    setPointBalance(undefined);

    try {
      const trainingMatrix = findTrainingMatrixByJobCode(jobCode);
      const mandatory = trainingMatrix?.mandatory ?? [];
      const electives = trainingMatrix?.electives ?? [];

      const [mandatoryComps, electiveComps] = await Promise.all([
        fetchCompetenciesByNames(mandatory),
        fetchCompetenciesByNames(electives),
      ]);

      const [mandatoryRecords, electiveRecords, history, balance] =
        await Promise.all([
          fetchIDPRecords(
            empId,
            mandatoryComps.map((c) => c.id),
          ),
          fetchIDPRecords(
            empId,
            electiveComps.map((c) => c.id),
          ),
          fetchScoreHistory(empId),
          fetchPointBalance(empId),
        ]);

      setMandatoryItems(pairWithRecords(mandatoryComps, mandatoryRecords));
      setElectiveItems(pairWithRecords(electiveComps, electiveRecords));
      setScoreHistory(history);
      setPointBalance(balance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveScore(record, certKey, data) {
    const key = scoreKey(record.id, certKey);
    const previousScore = scoreHistory[key]?.[0]?.score;
    const newScore = await createScore(record, certKey, data, previousScore);

    // อ่านคะแนนคงเหลือล่าสุดจาก server มาแสดง
    fetchPointBalance(record.empId).then(setPointBalance).catch(console.error);

    // อัปเดต UI ทันที โดยไม่ต้อง fetch ใหม่
    setScoreHistory((prev) => ({
      ...prev,
      [key]: [newScore, ...(prev[key] ?? [])],
    }));

    const attachScoreId = (items) =>
      items.map((item) =>
        item.record?.id === record.id
          ? {
              ...item,
              record: {
                ...item.record,
                certificates: {
                  ...item.record.certificates,
                  [certKey]: {
                    ...item.record.certificates[certKey],
                    score_id: newScore.id,
                  },
                },
              },
            }
          : item,
      );
    setMandatoryItems(attachScoreId);
    setElectiveItems(attachScoreId);
  }

  const selectedEmployee = evaluateEmployees.find(
    (e) => e.empId === selectedEmpId,
  );

  return (
    <>
      <aside className="md:col-span-1">
        <ul className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto">
          {evaluateEmployees.map((e) => {
            const active = selectedEmpId === e.empId;
            return (
              <li key={e.empId}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => loadEmployee(e)}
                  className={`w-full rounded-lg border p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-medium">{e.name}</div>
                  <div
                    className={`text-sm ${active ? "text-slate-300" : "text-slate-500"}`}
                  >
                    {e.empId}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="flex flex-col gap-6 md:col-span-2">
        {!selectedEmpId && (
          <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
            เลือกพนักงานเพื่อเริ่มประเมิน
          </p>
        )}
        {loading && <p className="p-6 text-slate-500">กำลังโหลด...</p>}
        {selectedEmpId && !loading && (
          <>
            <EmployeeCard
              employee={selectedEmployee}
              pointBalance={pointBalance}
            />
            <CourseList
              title="Mandatory"
              items={mandatoryItems}
              scoreHistory={scoreHistory}
              onSaveScore={handleSaveScore}
            />
            <CourseList
              title="Elective"
              items={electiveItems}
              scoreHistory={scoreHistory}
              onSaveScore={handleSaveScore}
            />
          </>
        )}
      </div>
    </>
  );
}

const Evaluate = () => {
  useEvaluateEmployees();
  useEvaluateTrainingMatrix();
  return (
    <Page>
      <Header />
      <MainSection>
        <EmployeeList />
      </MainSection>
    </Page>
  );
};

export default Evaluate;
