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
    }
    async function load() {
      const q = query(
        collection(db, "idp_records"),
        where("empId", "==", empId),
      );
      const snap = await loadDocs(q, `gap:idp:${empId}`);
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
          id: `${user.id}_${comp.id}`,
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
  /*เอาไว้เช็ค status ของ idp records ที่ใส่เข้ามา เอาไปเทียบกับข้อมูลใน redux ถ้าไม่เจอแปลว่าไม่มีใน redux ก็จะไมม่คืนค่าอะไร ถ้าเจอก็แปลว่ามี 
แปลว่าไม่กดลงทะเบียนแล้วใน selective ก็เคยส่งแล้วใน mandatory */
  const fetchIDPRecordFromCache = (competency) =>
    idpRecords.find((r) => r.compKey === competency.id); // ปรับ key ให้ตรงกับของจริง

  const checkSelectedCourseStatus = (competency) => fetchIDPRecordFromCache(competency)?.status;

  return {
    setElectiveIDPRecords,
    checkSelectedCourseStatus,
    fetchIDPRecordFromCache,
  };
};
