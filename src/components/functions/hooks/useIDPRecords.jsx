import { useEffect } from "react";
import { useUserData } from "../../../store/userSlice";
import {
  setIDPRecords,
  useIDPRecordsData,
} from "../../../store/IDPRecordsSlice";

import { createElectiveIDPRecord } from "../utils/createIDPRecord";
import { loadDocs } from "../utils/loadDocs";
import { collection, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useDispatch } from "react-redux";

export const useIDPRecords = () => {
  const dispatch = useDispatch();
  const { user } = useUserData();
  const { idpRecords } = useIDPRecordsData();
  const empId = user?.empId;
  let cancelled = false;

  useEffect(() => {
    if (!empId) {
      return console.log("useIDPRecords ไม่ได้ไปต่อ");
    }
    async function load() {
      const q = query(
        collection(db, "idp_records"),
        where("empId", "==", empId),
      );
      const snap = await loadDocs(q, `gap:idp:${empId}`);
      console.log("useIDPRecords", snap);
      dispatch(setIDPRecords(snap));

      if (cancelled) return;
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [empId]);

  function setElectiveIDPRecords(comp) {
    createElectiveIDPRecord(user, comp);
  }

  function checkSelectedElective(competency) {
    if (!competency) return;
    console.log("checkSelectedElective idpRecords", idpRecords);
    console.log("checkSelectedElective competency", competency);
    const selectedCompetency = idpRecords.filter(
      (item) => item.compKey === competency.id,
    );
    console.log("selectedCompetency", selectedCompetency);
  }
  return { setElectiveIDPRecords, checkSelectedElective };
};
