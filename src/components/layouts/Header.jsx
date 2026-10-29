//Header ข้างบน เอาไปใช้โดยการไป import ลงทุกหน้าที่อยากให้มี

import { Link } from "react-router-dom";

import { useAuth } from "../functions/hooks/useAuth";
import { ROUTES } from "../router/Router";

import { useUserData } from "../../store/userSlice";
import { useState } from "react";

const Header = () => {
  const { signOut } = useAuth();
  const { user } = useUserData();
  const [open, setOpen] = useState(false);

  function NavBar(props) {
    return (
      <nav className="h-20 pl-60 pr-20 font-supreme-regular bg-white">
        <ul className="flex justify-between items-center h-full">
          {props.children}
        </ul>
      </nav>
    );
  }

  function NavItems(props) {
    return (
      <nav className="h-full">
        <ul className="flex items-center gap-7 h-full">{props.children}</ul>
      </nav>
    );
  }

  function NavIcon() {
    return (
      <nav className="">
        <ul>GAP Plus</ul>
      </nav>
    );
  }

  function NavLinkItem({ to, children }) {
    return (
      <nav className="group relative flex items-center h-full cursor-pointer after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#FF0000] after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-100">
        <Link
          to={to}
          className="px-3 py-1.5 rounded-lg transition-colors duration-200 group-hover:bg-gray-100"
        >
          {children}
        </Link>
      </nav>
    );
  }

  function AboutUser(props) {
    return (
      <nav
        className="relative"
        onMouseEnter={() => {
          setOpen(true);
        }}
        onMouseLeave={() => {
          setOpen(false);
        }}
      >
        <button
          className={`px-5 py-1 rounded-sm bg-gray-100 transition duration-200 ${open ? `bg-red-600` : ``}`}
          onClick={() => {
            setOpen(true);
          }}
        >
          {user.name}
        </button>

        {open && props.children}
      </nav>
    );
  }

  function SignOut() {
    return (
      <button
        className="hover:bg-gray-100 h-10 p-2 rounded w-full text-left"
        onClick={signOut}
      >
        Sign Out
      </button>
    );
  }

  function UserDropdown() {
    return (
      <nav className="absolute rounded-xl shadow-xl bg-white p-3 pt-2 w-80 right-0">
        <SignOut />
      </nav>
    );
  }

  return (
    <NavBar>
      <NavIcon />
      <NavItems>
        <NavLinkItem to={ROUTES.HOME} children="About Gap Plus" />
        <NavLinkItem to={ROUTES.MYLEARNING} children="My Learning" />
        <AboutUser>
          <UserDropdown />
        </AboutUser>
      </NavItems>
    </NavBar>
  );
};

export default Header;
