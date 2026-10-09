import React from "react";

import { doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export const createIDPRecord = async (user, compId) => {
  const idpinfo = await setDoc(doc(db, "idp_records", `${user.id}_${compId}`), {
    actedBy: user.id,
  });
};
