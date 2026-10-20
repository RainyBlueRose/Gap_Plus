import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { db, storage } from "../../config/firebase";

import { useUserData } from "../../../store/userSlice";

const SELF_LEARNING_LABEL = "เรียนรู้ด้วยตนเอง";

export const useUploadCourseFile = () => {
  const { user } = useUserData();
  const [savingIndex, setSavingIndex] = useState(null);

  const uploadCertificate = async (competency, index, file, extraFields = {}) => {
    if (!file) return;

    const extension = file.type.split("/").pop();
    const storageRef = ref(
      storage,
      `certificates/${user.empId}/cert_${user.empId}_${competency.id}_${index}.${extension}`,
    );

    setSavingIndex(index);
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await setDoc(
        doc(db, "idp_records", `${user.id}_${competency.id}`),
        {
          ...extraFields,
          certificates: {
            [index]: {
              institute:
                competency.courses[index]?.institute || SELF_LEARNING_LABEL,
              name: file.name,
              url,
              reflection: null,
            },
          },
          status: "complete",
        },
        { merge: true },
      );
    } finally {
      setSavingIndex(null);
    }
  };

  const uploadCourseFileElective = (competency, index, file) =>
    uploadCertificate(competency, index, file);

  const uploadCourseFileMandatory = (competency, index, file) =>
    uploadCertificate(competency, index, file, {
      actedBy: user.id,
      compKey: competency.id,
      empId: user.id,
      empName: user.name,
      timestamp: new Date().toISOString(),
      type: "mandatory",
    });

  return { uploadCourseFileElective, uploadCourseFileMandatory, savingIndex };
};