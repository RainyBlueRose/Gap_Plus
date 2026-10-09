import React from "react";

import { doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export const createElectiveIDPRecord = async (user, comp) => {
  console.log("user", user);
  console.log("comp", comp);
  const idpinfo = await setDoc(
    doc(db, "idp_records", `${user.id}_${comp.id}`),
    {
      actedBy: user.id,
      certificates: {},
      compKey: comp.id,
      compName: "?",
      empId: user.id,
      empName: user.name,
      status: "In Progress",
      timestamp: Date.now(),
      type: "electives",
    },
    { merge: true },
  );
};
