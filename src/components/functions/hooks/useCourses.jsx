/*หลังจากโหลดข้อมูลพนักงานแล้วก็เอา JobCode ของพนักงานไปค้นหา course ต่างๆใน TrainingMatrix 
ต่อว่ามี Course อะไรบ้างแล้วเอามาเก็บไว้ใน Redux โดยค้นหาใน Cache ก่อนถ้ามีก็เอามาใช้ ถ้าไม่มีค่อยไปหาใน database 
จะได้ไม่เปลือง read quota */

import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";
import { useEffect } from "react";

export function useCourse() {
  const dispatch = useDispatch();
  const { user } = useSelector(selectUser);
  const jobCode = user.jobCode;

  useEffect(() => {
    if (!jobCode) return console.log("useCourse ไม่ได้ไปต่อ");
    console.log("jobCode ได้ไปต่อ", jobCode);
  });
}
