import { useEffect } from "react";

import { useUserData } from "../../../store/userSlice";
import { getDocs, query, where, collection } from "firebase/firestore";
import { db } from "../../config/firebase";

import { setEvaluate } from "../../../store/evaluateSlice";
import { useDispatch } from "react-redux";

async function fetchEvaluate(managerId) {
  const q = query(
    collection(db, "idp_records"),
    where("managerId", "==", managerId),
  );
  const snapdocs = await getDocs(q);
  return snapdocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

const useEvaluate = () => {
  const { user } = useUserData();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?.empId) return;

    fetchEvaluate(user.empId).then((list) => dispatch(setEvaluate(list)));
  }, [user?.empId, dispatch]);
};

export default useEvaluate;
