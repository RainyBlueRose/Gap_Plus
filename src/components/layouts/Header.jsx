//Header ข้างบน เอาไปใช้โดยการไป import ลงทุกหน้าที่อยากให้มี
import React from "react";

import { useAuth } from "../functions/hooks/useAuth";

const Header = () => {
    const { signOut } = useAuth();
  return (
    <div>
      <div>info ข้อมูล</div>
      <div>My Performance ผลงานของฉัน</div>
      <div>My Learning การเรียนรู้ของฉัน</div>
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
