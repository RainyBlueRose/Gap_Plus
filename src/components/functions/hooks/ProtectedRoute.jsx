import React from "react";

import { useSelector } from "react-redux";
import { selectUsers } from "../../../store/userSlice";

const ProtectedRoute = () => {
  const { user } = useSelector(selectUsers);

  if (!user) {
    console.log("ไม่มี User");
    return;
  }
  console.log("มี User");
};

export default ProtectedRoute;
