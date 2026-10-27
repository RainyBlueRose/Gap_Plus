//Header ข้างบน เอาไปใช้โดยการไป import ลงทุกหน้าที่อยากให้มี

import { Link } from "react-router-dom";

import { useAuth } from "../functions/hooks/useAuth";
import { ROUTES } from "../router/Router";

import { useUserData } from "../../store/userSlice";

const Header = () => {
  const { signOut } = useAuth();
  const { user } = useUserData();

  function NavBar(props) {
    return (
      <nav className="h-15 pl-60 pr-20 bg-gray-200">
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

  function AboutUser() {
    return (
      <nav>
        <button className="border w-35 h-10 rounded-xl">{user.name}</button>
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

  return (
    <NavBar>
      <NavIcon />
      <NavItems>
        <NavLinkItem to={ROUTES.HOME} children="About Gap Plus" />
        <NavLinkItem to={ROUTES.MYLEARNING} children="My Learning" />
        <AboutUser />
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
