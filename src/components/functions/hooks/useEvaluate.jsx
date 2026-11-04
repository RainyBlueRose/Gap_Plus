import { useEffect } from "react";

import { useUserData } from "../../../store/userSlice";
import { getDocs, query, where, collection } from "firebase/firestore";
import { db } from "../../config/firebase";

import {} from "../../../store/evaluateSlice"

const useEvaluate = () => {
  const { user } = useUserData();

  useEffect(() => {
    load();
  }, [user?.empId]);

  async function load() {
    if (!user?.empId) return;
    const q = query(
      collection(db, "idp_records"),
      where("managerId", "==", user.empId),
    );
    const evaluate = await getDocs(q);
  }
  return <div>useEvaluate</div>;
};

export default useEvaluate;
