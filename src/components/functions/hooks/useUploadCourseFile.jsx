import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../config/firebase";

import { useUserData } from "../../../store/userSlice";
export const useUploadCourseFile = (competency, index, file) => {
  const { user } = useUserData();
  const [savingIndex, setSavingIndex] = useState(null);
  const uploadCourseFile = async (competency, index, file) => {
    if (!file) return console.log("เข้า useUpload แต่ไม่เจอไฟล์");
    console.log("เข้า useUpload เจอไฟล์");
    console.log("competency", competency);
    console.log("file", file);
    const type = file.type.split("/").pop();
    setSavingIndex(index);
    try {
      const storageRef = ref(
        storage,
        `certificates/${user.empId}/cert_${user.empId}_${competency}_${index}.${type}`,
      );
      await uploadBytes(storageRef, file);
    } finally {
      setSavingIndex(null);
    }
  };

  return { uploadCourseFile, savingIndex };
};
