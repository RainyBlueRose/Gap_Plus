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
    const date = new Date();
    createElectiveIDPRecord(user, comp);
    dispatch(
      setIDPRecords([
        ...idpRecords,
        {
          actedBy: user.id,
          certificates: {},
          compKey: comp.id,
          empId: user.id,
          empName: user.name,
          status: "In Progress",
          timestamp: date.toISOString(),
          type: "selective",
        },
      ]),
    );
  }

  function checkSelectedElective(competency) {
    if (!competency) return;
    console.log("checkSelectedElective idpRecords", idpRecords);
    console.log("checkSelectedElective competency", competency);
    const selectedCompetency = idpRecords.filter(
      (item) => item.compKey === competency.id,
    );
    if (selectedCompetency.length === 0) {
      console.log("ผู้ใช้ไม่ได้เลือก", competency.id);
      return;
    }
    console.log("ผู้ใช้เลือก", selectedCompetency[0].compKey);
  }
  return {
    setElectiveIDPRecords,
    checkSelectedElective,
  };
};
