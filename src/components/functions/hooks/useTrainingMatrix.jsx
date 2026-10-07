/*หลังจากโหลดข้อมูลพนักงานแล้วก็เอา JobCode ของพนักงานไปค้นหา course ต่างๆใน TrainingMatrix 
ต่อว่ามี Course อะไรบ้างแล้วเอามาเก็บไว้ใน Redux โดยค้นหาใน Cache ก่อนถ้ามีก็เอามาใช้ ถ้าไม่มีค่อยไปหาใน database 
จะได้ไม่เปลือง read quota */

import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";
import {
  setLoadingTrainingMatrix,
  setTrainingMatrix,
} from "../../../store/trainingMatrixSlice";

import { useEffect } from "react";
import { loadTrainingMatrix } from "../utils/loadTrainingMatrix";
import { db } from "../../config/firebase";
import { doc } from "firebase/firestore";

export function useTrainingMatrix() {
  const dispatch = useDispatch();
  const { user } = useSelector(selectUser);
  const jobCode = user?.jobCode;
  console.log("jobCode", jobCode);

  useEffect(() => {
    if (!jobCode) return console.log("useTrainingMatrix ไม่ได้ไปต่อ");
    dispatch(setLoadingTrainingMatrix("loading"));
    console.log("user", user);
    console.log("jobCode ได้ไปต่อ");
    async function load() {
      console.log("เรียกใช้ load");
      try {
        console.log("เข้า try");
        const ref = doc(db, "training_matrix", jobCode);
        const snap = await loadTrainingMatrix(ref, `gap:matrix:${jobCode}`);
        console.log("snap", snap);
        dispatch(setTrainingMatrix(snap));
      } catch (error) {
        console.error("โหลด Training Matrix ไม่สำเร็จ:", error);
      }
    }
    load();
  }, [jobCode, dispatch]);
}
