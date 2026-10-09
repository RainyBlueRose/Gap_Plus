import React from "react";
import { useUserData } from "../../../store/userSlice";

import { createIDPRecord } from "../utils/createIDPRecord";

export const useIDPRecords = () => {
  const { user } = useUserData();

  function setIDPRecords(compId) {
    createIDPRecord(user, compId);
  }
  return { setIDPRecords };
};
