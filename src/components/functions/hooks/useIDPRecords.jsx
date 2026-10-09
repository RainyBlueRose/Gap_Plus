import React, { useEffect } from "react";
import { useUserData } from "../../../store/userSlice";

import { createElectiveIDPRecord } from "../utils/createIDPRecord";

export const useIDPRecords = () => {
  const { user } = useUserData();

  useEffect(() => {});

  function setElectiveIDPRecords(comp) {
    createElectiveIDPRecord(user, comp);
  }
  return { setElectiveIDPRecords };
};
