/*หลังจากโหลดข้อมูลพนักงานแล้วก็เอา JobCode ของพนักงานไปค้นหา course ต่างๆใน TrainingMatrix 
ต่อว่ามี Course อะไรบ้างแล้วเอามาเก็บไว้ใน Redux โดยค้นหาใน Cache ก่อนถ้ามีก็เอามาใช้ ถ้าไม่มีค่อยไปหาใน database 
จะได้ไม่เปลือง read quota */

import { useDispatch, useSelector } from "react-redux";
import { selectTrainingMatrix } from "../../../store/trainingMatrixSlice";
import { useEffect } from "react";

export function useCompetencies() {
  const dispatch = useDispatch();
  const { trainingMatrix } = useSelector(selectTrainingMatrix);
  const mandatory = trainingMatrix.mandatory;
  const electives = trainingMatrix.electives;

  useEffect(() => {
    if (mandatory?.length > 0) {
      console.log("mandatory", mandatory);
    }
    if (electives?.length > 0) {
      console.log("elective", electives);
    }
  }, [mandatory, electives]);
}
