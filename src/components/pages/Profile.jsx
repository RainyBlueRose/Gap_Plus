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
  { key: "level", label: "ระดับสิทธิ์", show: false },
];

/* ------------------------------ helpers ------------------------------ */

function displayValue(value) {
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
}

/* ------------------------------ UI parts ------------------------------ */

function Page(props) {
  return <div className="min-h-screen bg-slate-50">{props.children}</div>;
}

// การ์ดบนสุด: ชื่อ + ตำแหน่งทางซ้าย, คะแนนคงเหลือทางขวา
function SummaryCard({ title, subtitle, highlight }) {
  if (!title && !subtitle && !highlight) return null;
  return (
    <section className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {title && (
          <h2 className="font-notosanthai-semibold break-words text-2xl text-slate-900">
            {displayValue(title.value)}
          </h2>
        )}
        {subtitle && (
          <p className="font-notosanthai-regular mt-1 break-words text-slate-500">
            {displayValue(subtitle.value)}
          </p>
        )}
      </div>

      {highlight && (
        <div className="shrink-0 border-t border-slate-100 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 sm:text-right">
          <div className="text-sm text-slate-500">{highlight.label}</div>
          <div className="text-4xl font-semibold text-slate-900">
            {displayValue(highlight.value)}
          </div>
          <Link
            to={ROUTES.MYSCOREHISTORY}
            className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            ดูประวัติคะแนน ›
          </Link>
        </div>
      )}
    </section>
  );
}

// รายละเอียดแบบรายการ: label ซ้าย / value ขวา คั่นด้วยเส้นบาง ๆ
function DetailCard({ fields }) {
  if (fields.length === 0) return null;
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <h2 className="border-b border-slate-200 px-6 py-3 font-medium text-slate-900">
        ข้อมูลพนักงาน
      </h2>
      <dl className="divide-y divide-slate-100 px-6">
        {fields.map((field) => (
          <div
            key={field.key}
            className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4"
          >
            <dt className="text-sm text-slate-500 sm:pt-0.5">{field.label}</dt>
            <dd className="font-notosanthai-regular break-words text-slate-900 sm:col-span-2">
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
            <SummaryCard title={title} subtitle={subtitle} highlight={highlight} />
            <DetailCard fields={details} />
          </>
        )}
      </main>
    </Page>
  );
};

export default Profile;