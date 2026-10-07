/*หลังจากโหลดข้อมูลพนักงานแล้วก็เอา JobCode ของพนักงานไปค้นหา course ต่างๆใน TrainingMatrix 
ต่อว่ามี Course อะไรบ้างแล้วเอามาเก็บไว้ใน Redux โดยค้นหาใน Cache ก่อนถ้ามีก็เอามาใช้ ถ้าไม่มีค่อยไปหาใน database 
จะได้ไม่เปลือง read quota */

import { useDispatch, useSelector } from "react-redux";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

import { selectTrainingMatrix } from "../../../store/trainingMatrixSlice";
import { setLoadingCompetencies } from "../../../store/competenciesSlice";
import { selectUser } from "../../../store/userSlice";

import { loadCompetencies } from "../utils/loadCompetencies";

import { useEffect } from "react";

export function useCompetencies() {
  const dispatch = useDispatch();
  const { trainingMatrix } = useSelector(selectTrainingMatrix);

  const { user } = useSelector(selectUser);
  const { empId } = user;

  useEffect(() => {
    if (!trainingMatrix || Array.isArray(trainingMatrix)) return;
    dispatch(setLoadingCompetencies("loading"));

    const mandatory = trainingMatrix.mandatory ?? [];
    const electives = trainingMatrix.electives ?? [];

    const allCompetencies = {};

    async function load() {
      if (Array.isArray(mandatory) && mandatory.length > 0) {
        console.log("mandatory", mandatory);
        const q = query(
          collection(db, "competencies"),
          where("competencyName", "in", mandatory),
        );
        const snap = await loadCompetencies(
          q,
          `competencies-mandatory-${empId}`,
        );
        console.log("useCompetenciesmandatory", snap);
      }

      if (Array.isArray(electives) && electives.length > 0) {
        console.log("elective", electives);
        const q = query(
          collection(db, "competencies"),
          where("competencyName", "in", electives),
        );
        const snap = await loadCompetencies(
          q,
          `competencies-mandatory-${empId}`,
        );
        console.log("useCompetencieselectives", snap);
      }
    }

    load();
  }, [trainingMatrix, dispatch]);
}
