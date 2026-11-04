import { useEffect } from "react";

import { useUserData } from "../../../store/userSlice";
import { getDocs, query, where, collection } from "firebase/firestore";
import { db } from "../../config/firebase";

import { setEvaluate } from "../../../store/evaluateSlice";
import { useDispatch } from "react-redux";

const useEvaluate = () => {
  const { user } = useUserData();
  const dispatch = useDispatch();

  useEffect(() => {
    async function load() {
      if (!user?.empId) return;
      const q = query(
        collection(db, "idp_records"),
        where("managerId", "==", user.empId),
      );
      const snapdocs = await getDocs(q);
      const evaluate = snapdocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      dispatch(setEvaluate(evaluate));
    }

    load();
  }, [user?.empId, dispatch]);
};

export default useEvaluate;
