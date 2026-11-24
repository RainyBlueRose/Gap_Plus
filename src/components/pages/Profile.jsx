import { Link } from "react-router-dom";

import Header from "../layouts/Header";

import { ROUTES } from "../router/Router";
import { useUserData } from "../../store/userSlice";

/* ------------------------------------------------------------------ */
/* กำหนดว่าจะแสดงข้อมูลอะไรบ้างที่นี่                                      */
/*                                                                    */
/*   show: true / false  แสดงหรือซ่อนฟิลด์นั้น                           */
/*   area:               ตำแหน่งที่แสดงในหน้า                            */
/*     "title"      ชื่อใหญ่ในการ์ดด้านบน                                 */
/*     "subtitle"   บรรทัดรองใต้ชื่อ                                     */
/*     "highlight"  การ์ดตัวเลขเด่น (คะแนนคงเหลือ)                        */
/*     (ไม่ใส่)      รายละเอียดแบบ label / value                         */
/*                                                                    */
/* ฟิลด์ที่ไม่อยู่ในรายการนี้จะไม่ถูกแสดงเลย (เช่น ฟิลด์ใหม่ที่เพิ่มในอนาคต)   */
/* ลำดับในรายการ = ลำดับที่แสดง                                          */
/* ------------------------------------------------------------------ */
const PROFILE_FIELDS = [
  { key: "name", label: "ชื่อ", show: true, area: "title" },
  { key: "position", label: "ตำแหน่ง", show: true, area: "subtitle" },
  { key: "pointBalance", label: "คะแนนคงเหลือ", show: true, area: "highlight" },
  { key: "department", label: "แผนก", show: true },
  { key: "jobCode", label: "Job Code", show: true },
  { key: "empId", label: "รหัสพนักงาน", show: true },
  { key: "email", label: "อีเมล", show: true },
  { key: "managerName", label: "หัวหน้างาน", show: true },
  { key: "managerId", label: "รหัสหัวหน้างาน", show: false },
  { key: "id", label: "ID", show: false },
];

/* ------------------------------ helpers ------------------------------ */

function getInitials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]);
  return letters.join("").toUpperCase() || "?";
}

function displayValue(value) {
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
}

/* ------------------------------ UI parts ------------------------------ */

function Page(props) {
  return <div className="min-h-screen bg-slate-50">{props.children}</div>;
}

function ProfileCard({ title, subtitle }) {
  if (!title && !subtitle) return null;
  return (
    <section className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <div
        className="font-supreme-regular flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white"
        aria-hidden="true"
      >
        {getInitials(title?.value)}
      </div>
      <div className="min-w-0">
        {title && (
          <h2 className="font-notosanthai-semibold break-words text-xl text-slate-900">
            {displayValue(title.value)}
          </h2>
        )}
        {subtitle && (
          <p className="font-notosanthai-regular break-words text-slate-500">
            {displayValue(subtitle.value)}
          </p>
        )}
      </div>
    </section>
  );
}

function HighlightCard({ field }) {
  return (
    <section className="flex items-end justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <div>
        <div className="text-sm text-slate-500">{field.label}</div>
        <div className="mt-1 text-4xl font-semibold text-slate-900">
          {displayValue(field.value)}
        </div>
      </div>
      <Link
        to={ROUTES.MYSCOREHISTORY}
        className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        ดูประวัติคะแนน ›
      </Link>
    </section>
  );
}

function DetailCard({ fields }) {
  if (fields.length === 0) return null;
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className="min-w-0">
            <dt className="text-sm text-slate-500">{field.label}</dt>
            <dd className="font-notosanthai-regular break-words text-slate-900">
              {displayValue(field.value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ------------------------------ page ------------------------------ */

const Profile = () => {
  const { user } = useUserData();

  // เลือกเฉพาะฟิลด์ที่ตั้ง show: true แล้วผูกกับค่าจริงของผู้ใช้
  const fields = PROFILE_FIELDS.filter((f) => f.show).map((f) => ({
    ...f,
    value: user?.[f.key],
  }));

  const title = fields.find((f) => f.area === "title");
  const subtitle = fields.find((f) => f.area === "subtitle");
  const highlight = fields.find((f) => f.area === "highlight");
  const details = fields.filter((f) => !f.area);

  return (
    <Page>
      <Header />
      <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
        <h1 className="text-xl font-semibold text-slate-900">โปรไฟล์ของฉัน</h1>

        {!user ? (
          <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">
            ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่อีกครั้ง
          </p>
        ) : (
          <>
            <ProfileCard title={title} subtitle={subtitle} />
            {highlight && <HighlightCard field={highlight} />}
            <DetailCard fields={details} />
          </>
        )}
      </main>
    </Page>
  );
};

export default Profile;
