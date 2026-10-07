/*หลังจากโหลดข้อมูลพนักงานแล้วก็เอา JobCode ของพนักงานไปค้นหา course ต่างๆใน TrainingMatrix 
ต่อว่ามี Course อะไรบ้างแล้วเอามาเก็บไว้ใน Redux โดยค้นหาใน Cache ก่อนถ้ามีก็เอามาใช้ ถ้าไม่มีค่อยไปหาใน database 
จะได้ไม่เปลือง read quota */

import { useDispatch, useSelector } from "react-redux";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

import { selectTrainingMatrix } from "../../../store/trainingMatrixSlice";
import {
  setLoadingCompetencies,
  setCompetencies,
} from "../../../store/competenciesSlice";
import { selectUser } from "../../../store/userSlice";

import { loadCompetencies } from "../utils/loadCompetencies";

import { useEffect } from "react";

export function useCompetencies() {
  const dispatch = useDispatch();
  const { trainingMatrix } = useSelector(selectTrainingMatrix);
  const { user } = useSelector(selectUser);
  const jobCode = user?.jobCode;

  useEffect(() => {
    if (!trainingMatrix || Array.isArray(trainingMatrix)) return;

    let cancelled = false;
    const mandatory = trainingMatrix.mandatory ?? [];
    const electives = trainingMatrix.electives ?? [];

    // ฟังก์ชันช่วย: ดึงรายวิชาของกลุ่มหนึ่ง (ถ้าว่างคืน array ว่าง)
    async function fetchGroup(names, groupKey) {
      if (names.length === 0) return [];
      const q = query(
        collection(db, "competencies"),
        where("competencyName", "in", names),
      );
      return await loadCompetencies(q, `gap:comp:${groupKey}:${jobCode}`);
    }

    async function load() {
      dispatch(setLoadingCompetencies("loading"));
      try {
        // ดึงสองกลุ่มพร้อมกัน แล้วรวมเป็นก้อนเดียว
        const [mandatoryList, electiveList] = await Promise.all([
          fetchGroup(mandatory, "mandatory"),
          fetchGroup(electives, "electives"),
        ]);

        if (cancelled) return;

        const allCompetencies = {
          mandatory: mandatoryList,
          electives: electiveList,
        };

        dispatch(setCompetencies(allCompetencies)); // dispatch ครั้งเดียว
        dispatch(setLoadingCompetencies("succeeded"));
      } catch (e) {
        console.error("โหลด competencies ไม่สำเร็จ", e);
        if (!cancelled) dispatch(setLoadingCompetencies("failed"));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [trainingMatrix, jobCode, dispatch]);
}
