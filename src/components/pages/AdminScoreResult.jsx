import { useState } from "react";
import { AdminNavbar } from "../layouts/AdminNavbar";
import { getAuth } from "firebase/auth";
import {
  getDocs,
  collection,
  query,
  where,
  doc,
  writeBatch,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";

/* ------------------------------------------------------------------ */
/* หน้าค้นหา/แก้ไขข้อมูลใน collection idp_scores                         */
/*                                                                    */
/* 1 เอกสาร = การให้คะแนน 1 ครั้ง → แสดงเป็น 1 การ์ด                      */
/* เริ่มต้นย่อไว้ กดที่แถวเพื่อขยายดูรายละเอียด (เหมือนหน้า OCR Result)     */
/*                                                                    */
/* ข้อควรรู้เรื่องการแก้ "คะแนน"                                          */
/*   คะแนนมีผลกับ employees/{empId}.pointBalance                        */
/*   → เมื่อแก้คะแนน ระบบจะปรับ pointBalance ด้วยส่วนต่าง (ใหม่ - เดิม)      */
/*     และปรับ pointDelta ของเอกสารนี้ให้ตรงกัน ทั้งหมดอยู่ใน batch เดียว    */
/*   → แก้คะแนนได้เฉพาะ "รายการล่าสุด" ของแต่ละไฟล์ (recordId + certKey)    */
/*     รายการเก่าที่ถูกแทนที่แล้ว แก้ได้เฉพาะเหตุผล เพราะไม่ได้มีผลกับยอดแล้ว  */
/*   ทุกครั้งที่แก้จะบันทึก updatedAt / updatedBy ไว้เป็นร่องรอย            */
/* ------------------------------------------------------------------ */

/**
 * กำหนดว่าฟิลด์ไหนแก้ไขได้ (true/false)
 * ฟิลด์ที่ไม่อยู่ในรายการนี้ (empId, recordId, evaluator, createdAt ฯลฯ) แสดงอย่างเดียว
 */
const EDITABLE = {
  score: true,
  comment: true,
};

// ช่วงคะแนน ต้องตรงกับหน้า Evaluate (ค่าลบ = หักแต้ม)
const MIN_SCORE = -10;
const MAX_SCORE = 10;

// ส่งได้แค่ช่องเดียวไป Firestore เรียงจากช่องที่แคบที่สุด
const SERVER_FIELD_PRIORITY = [
  "empId",
  "recordId",
  "compKey",
  "evaluatorId",
  "evaluatorName",
  "certKey",
];

const TEXT_FILTERS = [
  { key: "empId", label: "รหัสพนักงาน", placeholder: "empId" },
  { key: "compKey", label: "วิชา", placeholder: "compKey" },
  { key: "certKey", label: "ไฟล์ที่", placeholder: "1" },
  { key: "recordId", label: "รหัส record", placeholder: "recordId" },
  { key: "evaluatorName", label: "ชื่อผู้ประเมิน", placeholder: "บางส่วนของชื่อ" },
  { key: "evaluatorId", label: "รหัสผู้ประเมิน", placeholder: "uid" },
  { key: "comment", label: "เหตุผล", placeholder: "บางส่วนของเหตุผล" },
  { key: "score", label: "คะแนน", placeholder: "เช่น 5 หรือ -2" },
];

const EMPTY_SEARCH = {
  empId: "",
  compKey: "",
  certKey: "",
  recordId: "",
  evaluatorName: "",
  evaluatorId: "",
  comment: "",
  score: "",
};

const btnPrimary =
  "rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";
const btnSecondary =
  "rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-100 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";
const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

/* ------------------------------ helpers ------------------------------ */

function toMillis(ts) {
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (ts instanceof Date) return ts.getTime();
  const parsed = new Date(ts).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatTimestamp(ts) {
  if (!ts) return "-";
  const date = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
  if (Number.isNaN(date.getTime())) return String(ts);
  return date.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}

function show(value) {
  return value === undefined || value === null || value === "" ? "-" : String(value);
}

function formatScore(n) {
  if (typeof n !== "number") return "-";
  return n > 0 ? `+${n}` : `${n}`;
}

function evaluatorLabel(item) {
  return item.evaluatorName || item.evaluatorId || "-";
}

function groupKey(item) {
  return `${item.recordId}__${item.certKey}`;
}

// รายการล่าสุดของแต่ละไฟล์ (recordId + certKey) → คืนเป็น Set ของ id
function computeLatestIds(items) {
  const seen = new Set();
  const latest = new Set();
  [...items]
    .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
    .forEach((item) => {
      const key = groupKey(item);
      if (!seen.has(key)) {
        seen.add(key);
        latest.add(item.id);
      }
    });
  return latest;
}

function matchesLoadedScore(item, filters) {
  return TEXT_FILTERS.every(({ key }) => {
    const value = filters[key].trim().toLowerCase();
    if (!value) return true;
    return String(item[key] ?? "").toLowerCase().includes(value);
  });
}

function getEditor() {
  const user = getAuth().currentUser;
  return user?.displayName ?? user?.email ?? user?.uid ?? null;
}

/* ------------------------------ parts ------------------------------ */

function Chevron({ open }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
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

function ScoreChip({ score }) {
  const positive = typeof score === "number" && score >= 0;
  return (
    <span
      className={`flex h-10 w-14 shrink-0 items-center justify-center rounded-md text-lg font-semibold ${
        positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      }`}
    >
      {formatScore(score)}
    </span>
  );
}

// แถว "ชื่อหัวข้อ : ค่า"
function Row({ label, children }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[12rem_1fr] sm:gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-slate-900">{children}</dd>
    </div>
  );
}

function ScoreItem({
  item,
  isLatest,
  open,
  onToggle,
  isEditing,
  form,
  setForm,
  onEdit,
  onSave,
  onCancel,
  saving,
  error,
}) {
  const expanded = open || isEditing; // ระหว่างแก้ไขจะขยายค้างไว้
  const canEditScore = EDITABLE.score && isLatest;
  const canEdit = canEditScore || EDITABLE.comment;

  return (
    <section className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      {/* แถวสรุป (กดเพื่อขยาย/ย่อ) */}
      <div className="flex items-center gap-2 bg-slate-50 pr-4 hover:bg-slate-100">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
        >
          <Chevron open={expanded} />
          <ScoreChip score={item.score} />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-900">
              พนักงาน {show(item.empId)}
            </div>
            <div className="break-all text-sm text-slate-500">
              วิชา: {show(item.compKey)} · ไฟล์ที่ {show(item.certKey)}
            </div>
          </div>
          <div className="hidden shrink-0 text-right text-sm sm:block">
            <div className="text-slate-700">{evaluatorLabel(item)}</div>
            <div className="text-slate-500">
              {formatTimestamp(item.createdAt)} ·{" "}
              <span className={isLatest ? "text-emerald-700" : "text-slate-500"}>
                {isLatest ? "ล่าสุด" : "ประวัติเก่า"}
              </span>
            </div>
          </div>
        </button>
        {!isEditing && canEdit && (
          <button className={btnSecondary} onClick={onEdit}>
            แก้ไข
          </button>
        )}
      </div>

      {expanded && (
        <div className="border-t border-slate-200 p-4 sm:pl-12">
          <dl className="flex flex-col gap-2">
            <Row label="รหัสพนักงาน">{show(item.empId)}</Row>
            <Row label="วิชา">{show(item.compKey)}</Row>
            <Row label="ไฟล์ที่">{show(item.certKey)}</Row>

            <Row label="คะแนน">
              {isEditing && EDITABLE.score ? (
                canEditScore ? (
                  <div className="max-w-xs">
                    <input
                      type="number"
                      min={MIN_SCORE}
                      max={MAX_SCORE}
                      className={inputCls}
                      value={form.score ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
                    />
                    <p className="mt-1 text-sm text-slate-500">
                      {MIN_SCORE} ถึง {MAX_SCORE} · ระบบจะปรับคะแนนคงเหลือของพนักงาน
                      ตามส่วนต่างให้อัตโนมัติ
                    </p>
                  </div>
                ) : (
                  <span>
                    <span className="font-semibold">{formatScore(item.score)}</span>
                    <span className="block text-sm text-slate-500">
                      แก้คะแนนได้เฉพาะรายการล่าสุดของไฟล์นี้
                    </span>
                  </span>
                )
              ) : (
                <span className="font-semibold">{formatScore(item.score)}</span>
              )}
            </Row>

            <Row label="เหตุผล">
              {isEditing && EDITABLE.comment ? (
                <textarea
                  rows={3}
                  className={inputCls}
                  value={form.comment ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                />
              ) : (
                <span className="whitespace-pre-wrap">{show(item.comment)}</span>
              )}
            </Row>

            <Row label="ผลต่อคะแนนคงเหลือ">{formatScore(item.pointDelta)}</Row>
            <Row label="ผู้ประเมิน">
              {show(item.evaluatorName)}
              {item.evaluatorId ? ` (${item.evaluatorId})` : ""}
            </Row>
            <Row label="เวลาที่ให้คะแนน">{formatTimestamp(item.createdAt)}</Row>
            {item.updatedAt && (
              <Row label="แก้ไขล่าสุด">
                {formatTimestamp(item.updatedAt)}
                {item.updatedBy ? ` โดย ${item.updatedBy}` : ""}
              </Row>
            )}
            <Row label="รหัส record">
              <span className="break-all">{show(item.recordId)}</span>
            </Row>
            <Row label="รหัสเอกสาร">
              <span className="break-all">{item.id}</span>
            </Row>
          </dl>

          {isEditing && (
            <div className="mt-4 flex flex-col gap-2">
              {error && (
                <p role="alert" className="text-rose-700">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button className={btnPrimary} onClick={onSave} disabled={saving}>
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
                <button className={btnSecondary} onClick={onCancel} disabled={saving}>
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ------------------------------ page ------------------------------ */

const AdminScoreResult = () => {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState(EMPTY_SEARCH);
  const [signFilter, setSignFilter] = useState(""); // "" | "plus" | "minus"
  const [onlyLatest, setOnlyLatest] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ค่าเริ่มต้นย่อไว้ทั้งหมด แอดมินกดขยายเองเมื่ออยากดูรายละเอียด
  const [openItems, setOpenItems] = useState({}); // { [scoreId]: true }

  /* ---------- data ---------- */

  async function loadScores(event) {
    event?.preventDefault();

    const serverField = SERVER_FIELD_PRIORITY.find((key) => search[key].trim() !== "");
    const scoresQuery = serverField
      ? query(
          collection(db, "idp_scores"),
          where(serverField, "==", search[serverField].trim()),
        )
      : collection(db, "idp_scores");

    setLoading(true);
    setLoadError("");
    try {
      const snap = await getDocs(scoresQuery);
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      setItems(data);
      setLoaded(true);
      setEditingId(null);
      setOpenItems({});
    } catch (error) {
      console.error("Failed to search idp_scores", error);
      setLoadError("ค้นหาข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- editing ---------- */

  function cancelEdit() {
    setEditingId(null);
    setForm({});
    setSaveError("");
  }

  function startEdit(item) {
    setEditingId(item.id);
    setOpenItems((prev) => ({ ...prev, [item.id]: true }));
    setForm({
      score: String(item.score ?? ""),
      comment: item.comment ?? "",
    });
    setSaveError("");
  }

  async function saveItem(item, isLatest) {
    const changes = {};
    let scoreDiff = 0;

    // เหตุผล
    if (EDITABLE.comment) {
      const nextComment = String(form.comment ?? "").trim();
      if (!nextComment) {
        setSaveError("กรุณากรอกเหตุผลในการให้คะแนน");
        return;
      }
      if (nextComment !== String(item.comment ?? "")) changes.comment = nextComment;
    }

    // คะแนน (เฉพาะรายการล่าสุด)
    if (EDITABLE.score && isLatest) {
      const nextScore = Number(form.score);
      if (
        form.score === "" ||
        Number.isNaN(nextScore) ||
        nextScore < MIN_SCORE ||
        nextScore > MAX_SCORE
      ) {
        setSaveError(`กรุณากรอกคะแนนตั้งแต่ ${MIN_SCORE} ถึง ${MAX_SCORE}`);
        return;
      }
      if (nextScore !== item.score) {
        changes.score = nextScore;
        scoreDiff = nextScore - (item.score ?? 0);
        // ให้ผลรวม pointDelta ของไฟล์นี้ยังตรงกับคะแนนล่าสุด
        changes.pointDelta = (item.pointDelta ?? item.score ?? 0) + scoreDiff;
      }
    }

    if (Object.keys(changes).length === 0) {
      cancelEdit();
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      const editor = getEditor();
      const batch = writeBatch(db);

      batch.update(doc(db, "idp_scores", item.id), {
        ...changes,
        updatedAt: serverTimestamp(),
        updatedBy: editor,
      });

      // คะแนนเปลี่ยน → ปรับยอดคงเหลือของพนักงานด้วยส่วนต่าง (atomic)
      if (scoreDiff !== 0) {
        batch.update(doc(db, "employees", String(item.empId)), {
          pointBalance: increment(scoreDiff),
        });
      }

      await batch.commit();

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, ...changes, updatedAt: new Date(), updatedBy: editor }
            : i,
        ),
      );
      cancelEdit();
    } catch (error) {
      console.error("Failed to update idp_scores", error);
      setSaveError(
        "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง (ถ้าแก้คะแนน ตรวจว่ามีเอกสารพนักงานใน employees)",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ---------- derived ---------- */

  const latestIds = computeLatestIds(items);

  const list = items.filter((item) => {
    if (!matchesLoadedScore(item, search)) return false;
    if (onlyLatest && !latestIds.has(item.id)) return false;
    if (signFilter === "plus" && !(item.score >= 0)) return false;
    if (signFilter === "minus" && !(item.score < 0)) return false;
    return true;
  });

  const hasFilter =
    signFilter ||
    onlyLatest ||
    Object.values(search).some((value) => value.trim() !== "");

  function clearFilters() {
    setSearch(EMPTY_SEARCH);
    setSignFilter("");
    setOnlyLatest(false);
  }

  function setSearchField(key, value) {
    setSearch((current) => ({ ...current, [key]: value }));
  }

  function toggleItem(id) {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function expandAll() {
    setOpenItems(Object.fromEntries(list.map((item) => [item.id, true])));
  }

  function collapseAll() {
    setOpenItems({});
  }

  /* ---------- render ---------- */

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="min-w-0 flex-1 p-6">
        <h1 className="text-xl font-semibold text-slate-900">Score History</h1>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-slate-500">
            {loaded
              ? `อ่าน ${items.length} รายการจาก Firestore · แสดง ${list.length} รายการ`
              : "ยังไม่ได้ค้นหา"}
          </p>
          {list.length > 0 && (
            <div className="flex gap-2">
              <button className={btnSecondary} onClick={expandAll}>
                ขยายทั้งหมด
              </button>
              <button className={btnSecondary} onClick={collapseAll}>
                ย่อทั้งหมด
              </button>
            </div>
          )}
        </div>

        <form
          className="mb-4 rounded-lg border border-slate-200 bg-white p-4"
          onSubmit={loadScores}
        >
          <p className="mb-3 text-sm text-slate-500">
            {/* สามารถใส่คำอธิบายข้างบนช่อง filter ได้ แต่ตอนนี้ไม่ได้ใส่*/}
          </p>
          <div className="flex flex-wrap items-end gap-3">
            {TEXT_FILTERS.map(({ key, label, placeholder }) => (
              <label key={key} className="flex w-44 flex-col gap-1 text-sm text-slate-600">
                {label}
                <input
                  className={inputCls}
                  value={search[key]}
                  placeholder={placeholder}
                  onChange={(e) => setSearchField(key, e.target.value)}
                />
              </label>
            ))}

            <label className="flex w-44 flex-col gap-1 text-sm text-slate-600">
              ผลคะแนน
              <select
                className={inputCls}
                value={signFilter}
                onChange={(e) => setSignFilter(e.target.value)}
              >
                <option value="">ทั้งหมด</option>
                <option value="plus">ได้คะแนน (+)</option>
                <option value="minus">ถูกหักคะแนน (-)</option>
              </select>
            </label>

            <label className="flex items-center gap-2 pb-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={onlyLatest}
                onChange={(e) => setOnlyLatest(e.target.checked)}
              />
              เฉพาะรายการล่าสุด
            </label>

            <button type="submit" className={btnPrimary} disabled={loading}>
              {loading ? "กำลังค้นหา..." : "ค้นหา"}
            </button>
            <button
              type="button"
              className={btnSecondary}
              onClick={clearFilters}
              disabled={!hasFilter || loading}
            >
              ล้างตัวกรอง
            </button>
          </div>
        </form>

        {loadError && (
          <p role="alert" className="mb-4 text-rose-700">
            {loadError}
          </p>
        )}

        {/* รายการ */}
        <div className="flex flex-col gap-3">
          {list.map((item) => {
            const isEditing = editingId === item.id;
            return (
              <ScoreItem
                key={item.id}
                item={item}
                isLatest={latestIds.has(item.id)}
                open={!!openItems[item.id]}
                onToggle={() => toggleItem(item.id)}
                isEditing={isEditing}
                form={form}
                setForm={setForm}
                onEdit={() => startEdit(item)}
                onSave={() => saveItem(item, latestIds.has(item.id))}
                onCancel={cancelEdit}
                saving={saving}
                error={isEditing ? saveError : ""}
              />
            );
          })}

          {list.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
              {loaded
                ? "ไม่พบข้อมูลที่ตรงกับเงื่อนไขค้นหา"
                : "กรอกตัวกรองแล้วกดค้นหา เว้นช่องระดับเอกสารไว้ทั้งหมดจะอ่านทั้งคอลเลกชัน"}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminScoreResult;
