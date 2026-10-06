//Header ข้างบน เอาไปใช้โดยการไป import ลงทุกหน้าที่อยากให้มี
import React from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../functions/hooks/useAuth";
import { ROUTES } from "../router/Router";

const Header = () => {
  const { signOut } = useAuth();
  return (
    <div>
      <div>info ข้อมูล</div>
      <div>My Performance ผลงานของฉัน</div>
      <Link to={ROUTES.MYLEARNING}>My Learning การเรียนรู้ของฉัน</Link>
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
  );
};

export default Header;
