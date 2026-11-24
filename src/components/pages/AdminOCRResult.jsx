import { useState } from "react";
import { AdminNavbar } from "../layouts/AdminNavbar";
import {
  getDocs,
  collection,
  doc,
  updateDoc,
  FieldPath,
} from "firebase/firestore";
import { db } from "../config/firebase";

/* ------------------------------------------------------------------ */
/* วิธีแสดงผล                                                           */
/*                                                                    */
/* 1 เอกสารใน idp_records = 1 การ์ด (เริ่มต้นย่อไว้ กดเพื่อขยาย)          */
/*   ส่วนบนของการ์ด = ข้อมูลระดับ record (พนักงาน, วิชา, สถานะ ฯลฯ)        */
/*     → แก้ครั้งเดียวมีผลกับทุกไฟล์ใน record นี้                         */
/*   ส่วนล่างของการ์ด = certificates แต่ละไฟล์ แยกเป็นกล่องละไฟล์          */
/*     → แก้ได้เฉพาะไฟล์นั้น                                            */
/* ------------------------------------------------------------------ */

/**
 * กำหนดว่าฟิลด์ไหนแก้ไขได้ (true/false)
 * ฟิลด์ที่ไม่อยู่ในรายการนี้ (empId, managerId, url, timestamp ฯลฯ) แสดงอย่างเดียว
 */
const EDITABLE = {
  // ระดับ record (มีผลทุกไฟล์ใน record)
  status: true,
  // ระดับ certificate (มีผลเฉพาะไฟล์นั้น)
  ocrStatus: true,
  ocrResult: true,
  ocrText: true,
  reflection: false, // คำอธิบายของพนักงานเอง ปิดไว้ก่อน
};

const RECORD_EDIT_FIELDS = ["status"].filter((f) => EDITABLE[f]);
const CERT_EDIT_FIELDS = ["ocrStatus", "ocrResult", "ocrText", "reflection"].filter(
  (f) => EDITABLE[f],
);

const btnPrimary =
  "rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";
const btnSecondary =
  "rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-100 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";
const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";
const linkCls = "break-all text-blue-700 underline hover:text-blue-900";

/* ------------------------------ helpers ------------------------------ */

function safeUrl(link) {
  if (typeof link !== "string") return null;
  try {
    const url = new URL(link.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
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

function certEntries(record) {
  return Object.entries(record.certificates ?? {}).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
}

function recordSearchText(record) {
  return [
    record.id,
    record.empId,
    record.empName,
    record.managerId,
    record.actedBy,
    record.compKey,
    record.type,
    record.status,
    formatTimestamp(record.timestamp),
  ]
    .filter((v) => v !== undefined && v !== null)
    .join(" ")
    .toLowerCase();
}

function certSearchText(cert) {
  return Object.values(cert ?? {})
    .filter((v) => v !== undefined && v !== null)
    .join(" ")
    .toLowerCase();
}

// แปลง records → กลุ่ม { record, rows: [{ certKey, cert }] } ตามตัวกรอง
function buildGroups(records, { query, status, ocrStatus }) {
  const q = query.trim().toLowerCase();

  return records
    .map((record) => {
      if (status && record.status !== status) return null;

      const recordText = recordSearchText(record);
      const certs = certEntries(record);
      let rows;

      if (certs.length === 0) {
        // record ที่ยังไม่มีไฟล์ ก็ยังแสดงให้เห็น
        const match = !ocrStatus && (!q || recordText.includes(q));
        rows = match ? [{ certKey: null, cert: null }] : [];
      } else {
        rows = certs
          .filter(([, cert]) => {
            if (ocrStatus && cert.ocrStatus !== ocrStatus) return false;
            return !q || recordText.includes(q) || certSearchText(cert).includes(q);
          })
          .map(([certKey, cert]) => ({ certKey, cert }));
      }

      return rows.length ? { record, rows } : null;
    })
    .filter(Boolean);
}

function certBoxKey(recordId, certKey) {
  return `${recordId}__${certKey}`;
}

function statusColor(status) {
  if (status === "Complete" || status === "completed") return "text-emerald-700";
  if (status === "failed") return "text-rose-700";
  return "text-slate-900";
}

/* ------------------------------ parts ------------------------------ */

// แถว "ชื่อหัวข้อ : ค่า" ใช้ในกล่องไฟล์
function Row({ label, children }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[12rem_1fr] sm:gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-slate-900">{children}</dd>
    </div>
  );
}

// ข้อมูลเล็ก ๆ ในส่วนหัวของการ์ด
function Info({ label, children }) {
  return (
    <div>
      <dt className="inline text-slate-500">{label}: </dt>
      <dd className="inline break-all text-slate-900">{children}</dd>
    </div>
  );
}

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

// แถวสรุปของ record (เห็นตลอด กดเพื่อขยาย/ย่อ)
function RecordSummary({ record, certs, open, onToggle }) {
  const failed = certs.filter(([, c]) => c.ocrStatus === "failed").length;
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className="flex w-full items-center gap-3 bg-slate-50 p-4 text-left hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
    >
      <Chevron open={open} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-lg font-semibold text-slate-900">
            {show(record.empName)}
          </span>
          <span className="text-slate-600">{show(record.empId)}</span>
        </div>
        <div className="break-all text-sm text-slate-500">
          วิชา: {show(record.compKey)}
        </div>
      </div>
      <div className="shrink-0 text-right text-sm">
        <div className={`font-semibold ${statusColor(record.status)}`}>
          {show(record.status)}
        </div>
        <div className="text-slate-500">
          {certs.length} ไฟล์
          {failed > 0 && (
            <span className="text-rose-700"> · OCR ล้มเหลว {failed}</span>
          )}
        </div>
      </div>
    </button>
  );
}

// รายละเอียดของ record (เห็นเมื่อขยาย)
function RecordDetails({
  record,
  fileCount,
  isEditing,
  form,
  setForm,
  onEdit,
  onSave,
  onCancel,
  saving,
  error,
  statusOptions,
}) {
  return (
    <div className="border-t border-slate-200 p-4">
      <div className="mb-4">
        {isEditing ? (
          <div className="flex max-w-sm flex-col gap-2">
            <label className="text-sm text-slate-600">
              สถานะ
              <input
                className={`${inputCls} mt-1`}
                list="status-options"
                value={form.status ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              />
            </label>
            <datalist id="status-options">
              {statusOptions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <p className="text-sm text-slate-500">
              การแก้ไขนี้มีผลกับทุกไฟล์ใน record นี้ ({fileCount} ไฟล์)
            </p>
            {error && (
              <p role="alert" className="text-sm text-rose-700">
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
        ) : (
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-slate-500">สถานะ</div>
              <div className={`text-lg font-semibold ${statusColor(record.status)}`}>
                {show(record.status)}
              </div>
            </div>
            {RECORD_EDIT_FIELDS.length > 0 && (
              <button className={btnSecondary} onClick={onEdit}>
                แก้ไขสถานะ
              </button>
            )}
          </div>
        )}
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <Info label="วิชา">{show(record.compKey)}</Info>
        <Info label="ประเภท">{show(record.type)}</Info>
        <Info label="เวลา">{formatTimestamp(record.timestamp)}</Info>
        <Info label="รหัสหัวหน้า">{show(record.managerId)}</Info>
        <Info label="ผู้ดำเนินการ">{show(record.actedBy)}</Info>
        <Info label="รหัสเอกสาร">{record.id}</Info>
      </dl>
    </div>
  );
}

function CertificateBox({
  certKey,
  cert,
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
  ocrStatusOptions,
}) {
  const expanded = open || isEditing; // ระหว่างแก้ไขจะขยายค้างไว้
  const fileUrl = safeUrl(cert.url);
  const courseLink = safeUrl(cert.compLink);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div>
      {/* แถวสรุปของไฟล์ (กดเพื่อขยาย/ย่อ) */}
      <div className="flex items-center gap-2 pr-4 hover:bg-slate-50">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
        >
          <Chevron open={expanded} />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-900">
              ไฟล์ที่ {certKey}
              <span className="font-normal text-slate-600"> · {show(cert.name)}</span>
            </div>
            <div className="truncate text-sm text-slate-500">
              OCR:{" "}
              <span className={statusColor(cert.ocrStatus)}>{show(cert.ocrStatus)}</span>
              {cert.ocrResult ? ` · ผล: ${cert.ocrResult}` : ""}
            </div>
          </div>
        </button>
        {!isEditing && CERT_EDIT_FIELDS.length > 0 && (
          <button className={btnSecondary} onClick={onEdit}>
            แก้ไข
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 sm:pl-12">
          <dl className="flex flex-col gap-2">
            <Row label="ไฟล์ที่ส่ง">
              {fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkCls}
                >
                  {cert.name || "เปิดไฟล์"} ↗
                </a>
              ) : (
                show(cert.name)
              )}
            </Row>

            <Row label="สถาบัน">{show(cert.institute)}</Row>

            <Row label="หลักสูตร">
              {courseLink ? (
                <a
                  href={courseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkCls}
                >
                  {show(cert.compName)} ↗
                </a>
              ) : (
                show(cert.compName)
              )}
            </Row>

            <Row label="คำอธิบายของพนักงาน">
              {isEditing && EDITABLE.reflection ? (
                <textarea
                  rows={3}
                  className={inputCls}
                  value={form.reflection ?? ""}
                  onChange={set("reflection")}
                />
              ) : (
                <span className="whitespace-pre-wrap">{show(cert.reflection)}</span>
              )}
            </Row>

            <Row label="สถานะ OCR">
              {isEditing && EDITABLE.ocrStatus ? (
                <>
                  <input
                    className={inputCls}
                    list="ocr-status-options"
                    value={form.ocrStatus ?? ""}
                    onChange={set("ocrStatus")}
                  />
                  <datalist id="ocr-status-options">
                    {ocrStatusOptions.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </>
              ) : (
                <span className={`font-medium ${statusColor(cert.ocrStatus)}`}>
                  {show(cert.ocrStatus)}
                </span>
              )}
            </Row>

            <Row label="ผลลัพธ์ OCR">
              {isEditing && EDITABLE.ocrResult ? (
                <input
                  className={inputCls}
                  value={form.ocrResult ?? ""}
                  onChange={set("ocrResult")}
                />
              ) : (
                <span className="font-semibold">{show(cert.ocrResult)}</span>
              )}
            </Row>

            <Row label="ข้อความที่ OCR อ่านได้">
              {isEditing && EDITABLE.ocrText ? (
                <textarea
                  rows={3}
                  className={inputCls}
                  value={form.ocrText ?? ""}
                  onChange={set("ocrText")}
                />
              ) : (
                <span className="block max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {show(cert.ocrText)}
                </span>
              )}
            </Row>

            {cert.ocrError && (
              <Row label="ข้อผิดพลาด">
                <span className="text-rose-700">{cert.ocrError}</span>
              </Row>
            )}
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
    </div>
  );
}

/* ------------------------------ page ------------------------------ */

const AdminOCRResult = () => {
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ocrFilter, setOcrFilter] = useState("");

  // { type: "record", id } หรือ { type: "cert", id, certKey }
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ค่าเริ่มต้นย่อไว้ทั้งหมด แอดมินกดขยายเองเมื่ออยากดูรายละเอียด
  const [openRecords, setOpenRecords] = useState({}); // { [recordId]: true }
  const [openCerts, setOpenCerts] = useState({}); // { [recordId__certKey]: true }

  /* ---------- data ---------- */

  async function loadRecords() {
    setLoading(true);
    setLoadError("");
    try {
      const snap = await getDocs(collection(db, "idp_records"));
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoaded(true);
      setEditing(null);
    } catch (error) {
      console.error("Failed to load idp_records", error);
      setLoadError("โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- editing ---------- */

  function cancelEdit() {
    setEditing(null);
    setForm({});
    setSaveError("");
  }

  function startEditRecord(record) {
    setEditing({ type: "record", id: record.id });
    setOpenRecords((prev) => ({ ...prev, [record.id]: true }));
    setForm(Object.fromEntries(RECORD_EDIT_FIELDS.map((f) => [f, record[f] ?? ""])));
    setSaveError("");
  }

  function startEditCert(record, certKey, cert) {
    setEditing({ type: "cert", id: record.id, certKey });
    setOpenCerts((prev) => ({ ...prev, [certBoxKey(record.id, certKey)]: true }));
    setForm(Object.fromEntries(CERT_EDIT_FIELDS.map((f) => [f, cert[f] ?? ""])));
    setSaveError("");
  }

  // เทียบกับค่าเดิม แล้วเขียนเฉพาะฟิลด์ที่เปลี่ยน
  function diff(fields, original) {
    const changes = {};
    fields.forEach((field) => {
      const next = String(form[field] ?? "").trim();
      if (next !== String(original?.[field] ?? "")) changes[field] = next;
    });
    return changes;
  }

  async function saveRecord(record) {
    const changes = diff(RECORD_EDIT_FIELDS, record);
    if (Object.keys(changes).length === 0) {
      cancelEdit();
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      await updateDoc(doc(db, "idp_records", record.id), changes);
      // อัปเดตที่ record เดียว → ทุกไฟล์ใน record นี้เปลี่ยนตามทันที
      setRecords((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, ...changes } : r)),
      );
      cancelEdit();
    } catch (error) {
      console.error("Failed to update record", error);
      setSaveError("บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  async function saveCert(record, certKey) {
    const changes = diff(CERT_EDIT_FIELDS, record.certificates?.[certKey]);
    if (Object.keys(changes).length === 0) {
      cancelEdit();
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      // FieldPath: ปลอดภัยแม้ certKey มีอักขระพิเศษ
      const args = Object.entries(changes).flatMap(([field, value]) => [
        new FieldPath("certificates", certKey, field),
        value,
      ]);
      await updateDoc(doc(db, "idp_records", record.id), ...args);

      setRecords((prev) =>
        prev.map((r) =>
          r.id === record.id
            ? {
                ...r,
                certificates: {
                  ...r.certificates,
                  [certKey]: { ...r.certificates?.[certKey], ...changes },
                },
              }
            : r,
        ),
      );
      cancelEdit();
    } catch (error) {
      console.error("Failed to update certificate", error);
      setSaveError("บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  /* ---------- derived ---------- */

  const statusOptions = [
    ...new Set(records.map((r) => r.status).filter(Boolean)),
  ].sort();
  const ocrStatusOptions = [
    ...new Set(
      records.flatMap((r) => certEntries(r).map(([, c]) => c.ocrStatus)).filter(Boolean),
    ),
  ].sort();

  const groups = buildGroups(records, {
    query,
    status: statusFilter,
    ocrStatus: ocrFilter,
  });
  const fileCount = groups.reduce(
    (sum, g) => sum + g.rows.filter((r) => r.cert).length,
    0,
  );
  const hasFilter = query || statusFilter || ocrFilter;

  function clearFilters() {
    setQuery("");
    setStatusFilter("");
    setOcrFilter("");
  }

  function toggleRecord(id) {
    setOpenRecords((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleCert(key) {
    setOpenCerts((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // ขยาย/ย่อทั้งหมดของรายการที่แสดงอยู่ตอนนี้
  function expandAll() {
    const records = {};
    const certs = {};
    groups.forEach(({ record, rows }) => {
      records[record.id] = true;
      rows.forEach(({ certKey, cert }) => {
        if (cert) certs[certBoxKey(record.id, certKey)] = true;
      });
    });
    setOpenRecords(records);
    setOpenCerts(certs);
  }

  function collapseAll() {
    setOpenRecords({});
    setOpenCerts({});
  }

  /* ---------- render ---------- */

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="min-w-0 flex-1 p-6">
        <h1 className="text-xl font-semibold text-slate-900">OCR Result</h1>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-slate-500">
            {loaded
              ? `พบ ${groups.length} record · ${fileCount} ไฟล์`
              : "ยังไม่ได้โหลดข้อมูล"}
          </p>
          {groups.length > 0 && (
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

        {/* ค้นหา / กรอง */}
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <button className={btnPrimary} onClick={loadRecords} disabled={loading}>
            {loading ? "กำลังโหลด..." : loaded ? "โหลดใหม่" : "โหลดข้อมูล"}
          </button>

          <label className="flex min-w-64 flex-1 flex-col gap-1 text-sm text-slate-600">
            ค้นหา
            <input
              type="search"
              className={inputCls}
              placeholder="พิมพ์ชื่อ รหัสพนักงาน หรือผล OCR"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            สถานะ
            <select
              className={inputCls}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            สถานะ OCR
            <select
              className={inputCls}
              value={ocrFilter}
              onChange={(e) => setOcrFilter(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {ocrStatusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <button className={btnSecondary} onClick={clearFilters} disabled={!hasFilter}>
            ล้างตัวกรอง
          </button>
        </div>

        {loadError && (
          <p role="alert" className="mb-4 text-rose-700">
            {loadError}
          </p>
        )}

        {/* รายการ */}
        <div className="flex flex-col gap-4">
          {groups.map(({ record, rows }) => {
            const editingRecord =
              editing?.type === "record" && editing.id === record.id;
            const expandedRecord = !!openRecords[record.id] || editingRecord;
            const certs = certEntries(record);

            return (
              <section
                key={record.id}
                className="overflow-hidden rounded-lg border border-slate-300 bg-white"
              >
                <RecordSummary
                  record={record}
                  certs={certs}
                  open={expandedRecord}
                  onToggle={() => toggleRecord(record.id)}
                />

                {expandedRecord && (
                  <>
                    <RecordDetails
                      record={record}
                      fileCount={certs.length}
                      isEditing={editingRecord}
                      form={form}
                      setForm={setForm}
                      onEdit={() => startEditRecord(record)}
                      onSave={() => saveRecord(record)}
                      onCancel={cancelEdit}
                      saving={saving}
                      error={editingRecord ? saveError : ""}
                      statusOptions={statusOptions}
                    />

                    {rows[0].cert === null ? (
                      <p className="border-t border-slate-200 p-4 text-slate-500">
                        ยังไม่มีไฟล์ที่ส่งใน record นี้
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-200 border-t border-slate-200">
                        {rows.map(({ certKey, cert }) => {
                          const boxKey = certBoxKey(record.id, certKey);
                          const editingCert =
                            editing?.type === "cert" &&
                            editing.id === record.id &&
                            editing.certKey === certKey;

                          return (
                            <CertificateBox
                              key={certKey}
                              certKey={certKey}
                              cert={cert}
                              open={!!openCerts[boxKey]}
                              onToggle={() => toggleCert(boxKey)}
                              isEditing={editingCert}
                              form={form}
                              setForm={setForm}
                              onEdit={() => startEditCert(record, certKey, cert)}
                              onSave={() => saveCert(record, certKey)}
                              onCancel={cancelEdit}
                              saving={saving}
                              error={editingCert ? saveError : ""}
                              ocrStatusOptions={ocrStatusOptions}
                            />
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </section>
            );
          })}

          {groups.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
              {loaded
                ? "ไม่พบข้อมูลที่ตรงกับเงื่อนไขค้นหา"
                : "กด “โหลดข้อมูล” เพื่อดึงข้อมูลจาก idp_records"}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminOCRResult;