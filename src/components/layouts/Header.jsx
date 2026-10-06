//Header ข้างบน เอาไปใช้โดยการไป import ลงทุกหน้าที่อยากให้มี
import React from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../functions/hooks/useAuth";

const Header = () => {
    const { signOut } = useAuth();
  return (
    <div>
      <div>info ข้อมูล</div>
      <div>My Performance ผลงานของฉัน</div>
      <div>My Learning การเรียนรู้ของฉัน</div>
      <Link to="/MyLearning">(ชื่อ นามสกุล)</Link>
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
