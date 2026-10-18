import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../config/firebase";

import { useUserData } from "../../../store/userSlice";
export const useUploadCourseFile = (competency, index, file) => {
  const { user } = useUserData();
  const [savingIndex, setSavingIndex] = useState(null);
  const uploadCourseFile = async (competency, index, file) => {
    if (!file) return console.log("เข้า useUpload แต่ไม่เจอไฟล์");
    console.log("เข้า useUpload เจอไฟล์");
    console.log("useUploadCourseFile competency", competency);
    console.log("file", file);
    const type = file.type.split("/").pop();
    setSavingIndex(index);
    try {
      const storageRef = ref(
        storage,
        `certificates/${user.empId}/cert_${user.empId}_${competency.id}_${index}.${type}`,
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      console.log("useUploadCourseFile url", url);
      const dataRef = doc(db, "idp_records", `${user.id}_${competency.id}`);
      await setDoc(
        dataRef,
        {
          certificates: {
            [index]: {
              institute: competency.courses[index].institute,
              name: file.name,
              url: url,
              reflection: null,
              ocrResult: null,
              ocrText: null,
              ocrError: null,
            },
          },
          [`ocrStatus${index}`]: "pending",
          status: "complete",
        },

        { merge: true },
      );
    } finally {
      setSavingIndex(null);
    }
  };

  return { uploadCourseFile, savingIndex };
};
