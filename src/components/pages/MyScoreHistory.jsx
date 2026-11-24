import { useEffect, useMemo, useState } from "react";

import Header from "../layouts/Header";

import {
  query,
  collection,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../config/firebase";

/* ------------------------------------------------------------------ */
/* หน้าประวัติการถูกให้คะแนนสำหรับพนักงาน                                */
/*                                                                    */
/* ข้อมูลที่ใช้:                                                        */
/*   employees/{empId}      -> pointBalance (คะแนนคงเหลือ)              */
/*   idp_scores (empId ==)  -> ประวัติการให้คะแนนและเหตุผลของหัวหน้า        */
/*   competencies/{compKey} -> ชื่อรายวิชา                              */
/*   idp_records/{recordId} -> ชื่อ certificate                         */
/* ------------------------------------------------------------------ */

/**
 * *** จุดที่ต้องปรับให้ตรงกับระบบของคุณ ***
 * ฟังก์ชันนี้ต้องคืนรหัสพนักงาน (empId) ของคนที่ล็อกอินอยู่
 * ตอนนี้ใช้ uid ของ Firebase Auth เป็นค่าเริ่มต้น ซึ่งอาจไม่ตรงกับ empId
 * ถ้าเก็บ empId ไว้ที่อื่น (Redux store, custom claim, ตาราง users ฯลฯ) ให้แก้ตรงนี้
 * หรือส่งผ่าน prop: <MyScoreHistory empId="6604022630438" />
 */
function getCurrentEmpId() {
  return getAuth().currentUser?.uid ?? null;
}

/* ------------------------------ helpers ------------------------------ */

function toMillis(ts) {
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (ts instanceof Date) return ts.getTime();
  return 0;
}

function formatDate(ts) {
  if (!ts) return "-";
  const date = typeof ts.toDate === "function" ? ts.toDate() : ts;
  return date.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}

function formatScore(n) {
  return n > 0 ? `+${n}` : `${n}`;
}

async function fetchHistory(empId) {
  const [scoreSnap, empSnap] = await Promise.all([
    getDocs(query(collection(db, "idp_scores"), where("empId", "==", empId))),
    getDoc(doc(db, "employees", String(empId))),
  ]);

  const scores = scoreSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // ดึงชื่อรายวิชาและชื่อ certificate มาแสดงแทนรหัส
  const compIds = [...new Set(scores.map((s) => s.compKey).filter(Boolean))];
  const recordIds = [...new Set(scores.map((s) => s.recordId).filter(Boolean))];

  const [compDocs, recordDocs] = await Promise.all([
    Promise.all(compIds.map((id) => getDoc(doc(db, "competencies", id)))),
    Promise.all(recordIds.map((id) => getDoc(doc(db, "idp_records", id)))),
  ]);

  const competencies = Object.fromEntries(
    compDocs.filter((d) => d.exists()).map((d) => [d.id, d.data()]),
  );
  const records = Object.fromEntries(
    recordDocs.filter((d) => d.exists()).map((d) => [d.id, d.data()]),
  );

  // ใหม่สุดขึ้นก่อน
  scores.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

  // คะแนนล่าสุดของแต่ละ certificate คือคะแนนที่มีผลจริง ที่เหลือคือครั้งที่ถูกแก้ไขแล้ว
  const seen = new Set();
  const entries = scores.map((s) => {
    const key = `${s.recordId}__${s.certKey}`;
    const isCurrent = !seen.has(key);
    seen.add(key);
    return {
      ...s,
      isCurrent,
      courseName: competencies[s.compKey]?.competencyName ?? "ไม่ทราบรายวิชา",
      certName: records[s.recordId]?.certificates?.[s.certKey]?.name ?? "",
    };
  });

  return {
    pointBalance: empSnap.exists() ? (empSnap.data().pointBalance ?? null) : null,
    entries,
  };
}

/* ------------------------------ UI parts ------------------------------ */

function SummaryCard({ pointBalance, gained, lost }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="text-sm text-slate-500">คะแนนคงเหลือ</div>
      <div className="mt-1 text-4xl font-semibold text-slate-900">
        {pointBalance ?? "-"}
      </div>
      <div className="mt-4 flex gap-6 border-t border-slate-100 pt-4 text-sm">
        <div>
          <div className="text-slate-500">ได้รับเพิ่ม</div>
          <div className="font-medium text-emerald-700">+{gained}</div>
        </div>
        <div>
          <div className="text-slate-500">ถูกหัก</div>
          <div className="font-medium text-rose-700">-{lost}</div>
        </div>
      </div>
    </section>
  );
}

const FILTERS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "plus", label: "ได้คะแนน" },
  { id: "minus", label: "ถูกหักคะแนน" },
];

function FilterTabs({ value, onChange }) {
  return (
    <div role="tablist" className="flex gap-1">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          role="tab"
          aria-selected={value === f.id}
          onClick={() => onChange(f.id)}
          className={`rounded-md px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
            value === f.id
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

function HistoryItem({ entry }) {
  const positive = entry.score >= 0;
  return (
    <li
      className={`flex gap-4 rounded-lg border border-slate-200 bg-white p-4 ${
        entry.isCurrent ? "" : "opacity-60"
      }`}
    >
      <div
        className={`flex h-12 w-14 shrink-0 items-center justify-center rounded-md text-lg font-semibold ${
          positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
        }`}
        aria-label={`คะแนน ${formatScore(entry.score)}`}
      >
        {formatScore(entry.score)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <span className="font-medium text-slate-900">{entry.courseName}</span>
          {!entry.isCurrent && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
              ถูกแก้ไขแล้ว
            </span>
          )}
        </div>
        {entry.certName && (
          <div className="text-sm text-slate-500">{entry.certName}</div>
        )}

        <p className="mt-2 whitespace-pre-wrap break-words text-slate-700">
          {entry.comment || "ไม่มีคำอธิบาย"}
        </p>

        <div className="mt-2 text-xs text-slate-500">
          {entry.evaluatorName ? `${entry.evaluatorName} · ` : ""}
          {formatDate(entry.createdAt)}
        </div>
      </div>
    </li>
  );
}

/* ------------------------------ page ------------------------------ */

export default function MyScoreHistory({ empId: empIdProp }) {
  const empId = empIdProp ?? getCurrentEmpId();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showEdited, setShowEdited] = useState(false);

  useEffect(() => {
    if (!empId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchHistory(empId)
      .then((result) => !cancelled && setData(result))
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError("โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [empId]);

  // สรุปยอดจากคะแนนที่มีผลจริงเท่านั้น (ไม่นับครั้งที่ถูกแก้ไขแล้ว)
  const summary = useMemo(() => {
    const current = (data?.entries ?? []).filter((e) => e.isCurrent);
    return {
      gained: current.reduce((sum, e) => sum + Math.max(e.score, 0), 0),
      lost: current.reduce((sum, e) => sum + Math.abs(Math.min(e.score, 0)), 0),
      hasEdited: (data?.entries ?? []).some((e) => !e.isCurrent),
    };
  }, [data]);

  const visible = useMemo(() => {
    return (data?.entries ?? []).filter((e) => {
      if (!showEdited && !e.isCurrent) return false;
      if (filter === "plus") return e.score >= 0;
      if (filter === "minus") return e.score < 0;
      return true;
    });
  }, [data, filter, showEdited]);

  let content;
  if (!empId) {
    content = (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">
        ไม่พบรหัสพนักงาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง
      </p>
    );
  } else if (loading) {
    content = <p className="p-6 text-slate-500">กำลังโหลด...</p>;
  } else if (error) {
    content = (
      <p className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error}
      </p>
    );
  } else {
    content = (
      <div className="flex flex-col gap-4">
        <SummaryCard
          pointBalance={data?.pointBalance}
          gained={summary.gained}
          lost={summary.lost}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <FilterTabs value={filter} onChange={setFilter} />
          {summary.hasEdited && (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={showEdited}
                onChange={(e) => setShowEdited(e.target.checked)}
              />
              แสดงรายการที่ถูกแก้ไขแล้ว
            </label>
          )}
        </div>

        {visible.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
            {data?.entries.length
              ? "ไม่มีรายการในหมวดนี้"
              : "ยังไม่มีประวัติการให้คะแนน"}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((entry) => (
              <HistoryItem key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-2xl p-4">
        <h1 className="mb-4 text-xl font-semibold text-slate-900">
          ประวัติการประเมินของฉัน
        </h1>
        {content}
      </main>
    </div>
  );
}
