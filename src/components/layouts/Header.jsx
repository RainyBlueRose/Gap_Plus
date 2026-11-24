//Header ข้างบน เอาไปใช้โดยการไป import ลงทุกหน้าที่อยากให้มี

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";

import { useAuth } from "../functions/hooks/useAuth";
import { ROUTES } from "../router/Router";

import { useUserData } from "../../store/userSlice";

/* ------------------------------ nav links ------------------------------ */

// เมนูบนจอใหญ่: มีเส้นใต้สีแดงเมื่ออยู่หน้านั้นหรือชี้เมาส์
const desktopLinkBase =
  "relative flex h-full items-center px-3 transition-colors after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[3px] after:rounded-full after:bg-red-600 after:transition-transform after:duration-100 after:content-[''] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400";

function NavLinkItem({ to, children, mobile, onClick }) {
  const className = ({ isActive }) => {
    if (mobile) {
      return `block rounded-md px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
        isActive
          ? "bg-slate-100 text-slate-900"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`;
    }
    return `${desktopLinkBase} ${
      isActive
        ? "text-slate-900 after:scale-x-100"
        : "text-slate-600 hover:text-slate-900 after:scale-x-0 hover:after:scale-x-100"
    }`;
  };

  return (
    <NavLink
      to={to}
      end={to === ROUTES.HOME}
      className={className}
      onClick={onClick}
    >
      {children}
    </NavLink>
  );
}

/* ------------------------------ user menu ------------------------------ */

function SignOut({ onClick }) {
  return (
    <button
      className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      onClick={onClick}
    >
      Sign Out
    </button>
  );
}

function Profile({ onClick }) {
  return (
    <button
      className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      onClick={onClick}
    >
      Profile
    </button>
  );
}

function Admin({ onClick }) {
  return (
    <button
      className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      onClick={onClick}
    >
      Admin
    </button>
  );
}

function UserDropdown({ isAdmin, onSignOut }) {
  const navigate = useNavigate();
  return (
    <div
      role="menu"
      className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
    >
      <Profile onClick={() => navigate(ROUTES.PROFILE)} />
      {/* แสดงเมนู Admin เฉพาะผู้ใช้ที่ level เป็น admin */}
      {isAdmin && <Admin onClick={() => navigate(ROUTES.ADMIN)} />}
      <SignOut onClick={onSignOut} />
    </div>
  );
}

// เมนูผู้ใช้บนจอใหญ่: คลิกเพื่อเปิด คลิกข้างนอกหรือกด Esc เพื่อปิด
function AboutUser({ name, isAdmin, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-md border px-4 py-1.5 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
          open
            ? "border-slate-300 bg-slate-100"
            : "border-slate-200 bg-white hover:bg-slate-50"
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="max-w-40 truncate">{name}</span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${
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
      </button>

      {open && (
        <UserDropdown
          isAdmin={isAdmin}
          onSignOut={() => {
            setOpen(false);
            onSignOut();
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------ layout ------------------------------ */

function NavBar(props) {
  return (
    <header className="font-supreme-regular border-b border-slate-200 bg-white">
      {props.children}
    </header>
  );
}

function NavIcon() {
  return (
    <Link
      to={ROUTES.HOME}
      className="text-xl font-bold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      GAP Plus
    </Link>
  );
}

function MenuButton({ open, onClick }) {
  return (
    <button
      className="rounded-md border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 md:hidden"
      aria-label="เมนู"
      aria-expanded={open}
      onClick={onClick}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        {open ? (
          <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
        ) : (
          <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}

const Header = () => {
  const { signOut } = useAuth();
  const { user } = useUserData();
  const [menuOpen, setMenuOpen] = useState(false);

  // เป็นแอดมินเมื่อ user.level เท่ากับ "admin" (ไม่สนตัวพิมพ์เล็ก/ใหญ่)
  const isAdmin = String(user?.level ?? "").toLowerCase() === "admin";

  // รายการเมนู: เพิ่ม/ลบ/เรียงลำดับที่นี่ที่เดียว
  const NAV_LINKS = [
    { to: ROUTES.MYLEARNING, label: "My Learning" },
    { to: ROUTES.MYSCOREHISTORY, label: "My Score" },
    { to: ROUTES.EVALUATE, label: "Evaluate" },
  ];

  return (
    <NavBar>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <NavIcon />

        {/* จอใหญ่ */}
        <nav
          aria-label="เมนูหลัก"
          className="hidden h-full items-center gap-2 md:flex"
        >
          <ul className="flex h-full items-center gap-2">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to} className="h-full">
                <NavLinkItem to={to}>{label}</NavLinkItem>
              </li>
            ))}
          </ul>
          {user && (
            <AboutUser name={user.name} isAdmin={isAdmin} onSignOut={signOut} />
          )}
        </nav>

        {/* มือถือ */}
        <MenuButton open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
      </div>

      {menuOpen && (
        <nav
          aria-label="เมนูหลัก"
          className="border-t border-slate-200 bg-white px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLinkItem to={to} mobile onClick={() => setMenuOpen(false)}>
                  {label}
                </NavLinkItem>
              </li>
            ))}
          </ul>
          {user && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <div className="truncate px-3 pb-2 text-slate-900">
                {user.name}
              </div>
              <ul className="flex flex-col gap-1">
                <li>
                  <NavLinkItem
                    to={ROUTES.PROFILE}
                    mobile
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </NavLinkItem>
                </li>
                {/* เมนู Admin เฉพาะผู้ใช้ที่ level เป็น admin (เหมือนบนจอใหญ่) */}
                {isAdmin && (
                  <li>
                    <NavLinkItem
                      to={ROUTES.ADMIN}
                      mobile
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin
                    </NavLinkItem>
                  </li>
                )}
                <li>
                  <button
                    className="block w-full rounded-md px-3 py-2 text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </nav>
      )}
    </NavBar>
  );
};

export default Header;
