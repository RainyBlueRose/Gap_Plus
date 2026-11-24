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

function Page(props) {
  return <div>{props.children}</div>;
}

function MainSection(props) {
  return <div className="grid grid-cols-3 gap-3 p-3">{props.children}</div>;
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
    <div className="flex flex-col gap-2">
      <input
        type="number"
        min={MIN_SCORE}
        max={MAX_SCORE}
        className="border p-1"
        placeholder={`คะแนน (${MIN_SCORE} ถึง ${MAX_SCORE}, ค่าลบ = หักแต้ม)`}
        value={score}
        onChange={(e) => setScore(e.target.value)}
      />
      <textarea
        className="border p-1"
        placeholder="คำอธิบาย"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <div className="text-red-600">{error}</div>}
      <div className="flex gap-2">
        <button
          className="border px-2"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "กำลังบันทึก..." : "บันทึกคะแนน"}
        </button>
        {onCancel && (
          <button className="border px-2" onClick={onCancel} disabled={saving}>
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

  // ยังไม่เคยประเมิน → แสดงฟอร์ม
  if (!latest) {
    return <ScoreForm onSubmit={handleSubmit} />;
  }

  // กำลังแก้ไข → ฟอร์มพร้อมค่าเดิม (บันทึกเป็นเอกสารใหม่ ประวัติเดิมยังอยู่)
  if (editing) {
    return (
      <ScoreForm
        initial={latest}
        onSubmit={handleSubmit}
        onCancel={() => setEditing(false)}
      />
    );
  }

  // เคยประเมินแล้ว → แสดงคะแนนล่าสุด
  return (
    <div className="flex flex-col gap-2">
      <div>
        <div>คะแนน: {formatScore(latest.score)}</div>
        <div>เหตุผล: {latest.comment}</div>
        <div className="text-sm text-gray-500">
          {latest.evaluatorName ? `โดย ${latest.evaluatorName} · ` : ""}
          {formatDate(latest.createdAt)}
        </div>
      </div>

      <div className="flex gap-2">
        <button className="border px-2" onClick={() => setEditing(true)}>
          แก้ไขคะแนน
        </button>
        {history.length > 1 && (
          <button
            className="border px-2"
            onClick={() => setShowHistory((v) => !v)}
          >
            {showHistory ? "ซ่อนประวัติ" : `ดูประวัติ (${history.length})`}
          </button>
        )}
      </div>

      {showHistory && (
        <div className="flex flex-col gap-1 border-t pt-2">
          {history.map((h, i) => (
            <div key={h.id} className="text-sm">
              {i === 0 ? "(ล่าสุด) " : ""}
              {formatScore(h.score)} — {h.comment}
              <span className="text-gray-500">
                {" "}
                · {h.evaluatorName ? `${h.evaluatorName}, ` : ""}
                {formatDate(h.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseList({ title, items, scoreHistory, onSaveScore }) {
  const [openCompId, setOpenCompId] = useState();
  const [openCertKey, setOpenCertKey] = useState();

  return (
    <div className="flex flex-col gap-3">
      <div className="font-bold">{title}</div>
      {items.length === 0 && <div>ไม่มีรายวิชา</div>}
      {items.map(({ comp, record }) => (
        <div key={comp.id}>
          {record ? (
            <div className="border h-auto">
              <div
                onClick={() => {
                  setOpenCompId(openCompId === comp.id ? undefined : comp.id);
                  setOpenCertKey(undefined);
                }}
              >
                <div>{comp.competencyName}</div>
                <div>{comp.description}</div>
              </div>

              {openCompId === comp.id &&
                Object.entries(record.certificates ?? {}).map(
                  ([certKey, c]) => {
                    const isOpen = openCertKey === `${comp.id}__${certKey}`;
                    return (
                      <div key={certKey}>
                        <div
                          onClick={() =>
                            setOpenCertKey(
                              isOpen ? undefined : `${comp.id}__${certKey}`,
                            )
                          }
                        >
                          <div className="flex justify-between">
                            <div>{c.compName}</div>
                            <div>{c.name}</div>
                          </div>
                          <div>{c.reflection}</div>
                        </div>

                        {isOpen && (
                          <ScoreSection
                            history={scoreHistory[scoreKey(record.id, certKey)]}
                            onSave={(data) =>
                              onSaveScore(record, certKey, data)
                            }
                          />
                        )}
                      </div>
                    );
                  },
                )}
            </div>
          ) : (
            <div>ไม่ได้ส่ง</div>
          )}
        </div>
      ))}
    </div>
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

  return (
    <>
      <div className="col-span-1">
        {evaluateEmployees.map((e) => (
          <div
            key={e.empId}
            className={`border cursor-pointer ${
              selectedEmpId === e.empId ? "bg-gray-100" : ""
            }`}
            onClick={() => loadEmployee(e)}
          >
            <div>{e.empId}</div>
            <div>{e.name}</div>
          </div>
        ))}
      </div>

      <div className="col-span-2 flex flex-col gap-6">
        {!selectedEmpId && <div>เลือกพนักงานทางซ้ายเพื่อเริ่มประเมิน</div>}
        {loading && <div>กำลังโหลด...</div>}
        {selectedEmpId && !loading && (
          <>
            <div>
              คะแนนคงเหลือ:{" "}
              {pointBalance === undefined
                ? "-"
                : (pointBalance ?? "ไม่พบข้อมูล")}
            </div>
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
