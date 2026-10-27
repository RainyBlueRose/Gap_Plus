//Header ข้างบน เอาไปใช้โดยการไป import ลงทุกหน้าที่อยากให้มี

import { Link } from "react-router-dom";

import { useAuth } from "../functions/hooks/useAuth";
import { ROUTES } from "../router/Router";

import { useUserData } from "../../store/userSlice";
import { useState } from "react";

const Header = () => {
  const { signOut } = useAuth();
  const { user } = useUserData();

  function NavBar(props) {
    return (
      <nav className="h-20 pl-60 pr-20">
        <ul className="flex justify-between items-center h-full">
          {props.children}
        </ul>
      </nav>
    );
  }

  function NavItems(props) {
    return (
      <nav className="">
        <ul className="flex items-center gap-5 ">{props.children}</ul>
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

  function AboutUser(props) {
    const [open, setOpen] = useState(false);
    return (
      <nav className="relative">
        <button
          className="border w-45 h-15 rounded-xl bg-white"
          onClick={() => {
            setOpen(!open);
          }}
        >
          {user.name}
        </button>

        {open && props.children}
      </nav>
    );
  }

  function NavLinkItem({ to, children }) {
    return (
      <nav>
        <Link to={to}>{children}</Link>
      </nav>
    );
  }

  function SignOut() {
    return (
      <nav className="flex items-center hover:bg-gray-100 h-10 p-2 rounded">
        <button className="hover:bg-black" onClick={signOut}> Sign Out</button>
      </nav>
    );
  }

  function UserDropdown() {
    return (
      <nav className="absolute rounded-xl shadow-xl bg-white p-3 mt-2 w-80 right-0">
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
  // return (
  //   <div className="flex justify-between mx-auto pl-60 pr-20 h-15 items-center">
  //     <icon></icon>
  //     <div className="flex gap-5 items-center">
  //       <Link to={ROUTES.HOME}>About GAP Plus</Link>
  //       <div>My Performance</div>
  //       <Link to={ROUTES.MYLEARNING}>My Learning</Link>
  //       <button
  //         className="border w-40 h-10 rounded-xl cursor-pointer"
  //         onClick={() => {}}
  //       >
  //         {user.name}
  //       </button>
  //     </div>
  //   </div>
  // );
};

export default Header;
