//Header ข้างบน เอาไปใช้โดยการไป import ลงทุกหน้าที่อยากให้มี

import { Link } from "react-router-dom";

import { useAuth } from "../functions/hooks/useAuth";
import { ROUTES } from "../router/Router";

import { useUserData } from "../../store/userSlice";

const Header = () => {
  const { signOut } = useAuth();
  const { user } = useUserData();
  return (
    <div className="flex justify-between">
      <div>GAP +</div>
      <div className="flex gap-10">
        <Link to={ROUTES.HOME}>About GAP Plus</Link>
        <div>My Performance</div>
        <Link to={ROUTES.MYLEARNING}>My Learning</Link>
      </div>
      <div className="flex">
        <div>{user.name}</div>
      </div>
    </div>
  );
};

export default Header;
