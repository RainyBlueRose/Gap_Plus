//Header ข้างบน เอาไปใช้โดยการไป import ลงทุกหน้าที่อยากให้มี
import React from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../functions/hooks/useAuth";
import { ROUTES } from "../router/Router";

const Header = () => {
  const { signOut } = useAuth();
  return (
    <div className="flex justify-between">
      <div></div>
      <div className="flex gap-10">
        <Link to={ROUTES.HOME}>info ข้อมูล</Link>
        <div>My Performance ผลงานของฉัน</div>
        <Link to={ROUTES.MYLEARNING}>My Learning การเรียนรู้ของฉัน</Link>
      </div>
      <div className="flex">
        <div>(ชื่อ นามสกุล)</div>
        <div>AllStar</div>
        <button
          onClick={() => {
            signOut();
          }}
        >
          {" "}
          Sing Out{" "}
        </button>
      </div>
    </div>
  );
};

export default Header;
