import { ROUTES } from "../router/Router";
import { Link, NavLink } from "react-router-dom";

/* ------------------------------ icons ------------------------------ */

function Icon({ children }) {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const HomeIcon = () => (
  <Icon>
    <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />
  </Icon>
);

const MatrixIcon = () => (
  <Icon>
    <path d="M4 5h16v14H4zM4 10h16M4 15h16M10 5v14" />
  </Icon>
);

const DocumentIcon = () => (
  <Icon>
    <path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" />
  </Icon>
);

const UsersIcon = () => (
  <Icon>
    <path d="M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5M16 4.3a3.5 3.5 0 010 6.4M17.5 14.7c2.4.6 4 2.3 4 5.3" />
  </Icon>
);

const ScoreIcon = () => (
  <Icon>
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z" />
  </Icon>
);
/* ------------------------------ parts ------------------------------ */

function AdminNavLink({ to, label, icon: IconComponent, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 ${
          isActive
            ? "bg-red-50 text-red-700"
            : "text-slate-700 hover:bg-red-50 hover:text-red-700"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-red-600"
              aria-hidden="true"
            />
          )}
          <IconComponent />
          {label}
        </>
      )}
    </NavLink>
  );
}

function AdminNavHeader() {
  return (
    <div className="mb-6 border-b border-slate-100 px-3 pb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
        Administration
      </p>
      <h2 className="mt-1 text-xl font-semibold text-slate-900">Admin</h2>
    </div>
  );
}

function BackToApp() {
  return (
    <Link
      to={ROUTES.HOME}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      <span aria-hidden="true">←</span>
      กลับสู่ GAP Plus
    </Link>
  );
}

/* ------------------------------ navbar ------------------------------ */

// sticky + h-screen: เมนูอยู่กับที่ ไม่เลื่อนตามเมื่อเนื้อหาด้านขวายาว
export const AdminNavbar = () => {
  /* ------------------------------ items ------------------------------ */

  // รายการเมนู: เพิ่ม/ลบ/เรียงลำดับที่นี่ที่เดียว
  // end: true = ถือว่า active เฉพาะ path ตรงกันเท่านั้น (จำเป็นสำหรับหน้า Home
  //      ไม่งั้นจะ active ค้างอยู่ทุกหน้าย่อยที่ขึ้นต้นด้วย path เดียวกัน)
  const ADMIN_NAV_ITEMS = [
    { to: ROUTES.ADMIN, label: "Home", icon: HomeIcon, end: true },
    {
      to: ROUTES.ADMINTRAININGMATRIX,
      label: "Training Matrix",
      icon: MatrixIcon,
    },
    { to: ROUTES.ADMINOCRRESULT, label: "IDP Records", icon: DocumentIcon },
    { to: ROUTES.ADMINEMPLOYEES, label: "Employees", icon: UsersIcon },
    { to: ROUTES.ADMINIDPSCORE, label: "IDP Score", icon: ScoreIcon },
  ];
  return (
    <nav
      aria-label="เมนูผู้ดูแลระบบ"
      className="sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white px-4 py-6"
    >
      <AdminNavHeader />

      <ul className="flex flex-col gap-1">
        {ADMIN_NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <AdminNavLink {...item} />
          </li>
        ))}
      </ul>

      <div className="mt-auto border-t border-slate-100 pt-4">
        <BackToApp />
      </div>
    </nav>
  );
};
