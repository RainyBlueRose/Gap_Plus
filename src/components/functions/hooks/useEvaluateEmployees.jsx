import { useDispatch } from "react-redux";
import { useEffect } from "react";

import { useUserData } from "../../../store/userSlice";
import { setEvaluateEmployee } from "../../../store/evaluateEmployeeSlice";

import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";

async function fetchEvaluateEmployeesData(managerId) {
  const q = query(
    collection(db, "employees"),
    where("managerId", "==", managerId),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

const useEvaluateEmployees = () => {
  const dispatch = useDispatch();
  const { user } = useUserData();
  useEffect(() => {
    if (!user?.empId) return;

    let cancelled = false;

    const load = async () => {
      try {
        const managerEmployees = await fetchEvaluateEmployeesData(user.empId);
        if (!cancelled) {
          dispatch(setEvaluateEmployee(managerEmployees));
        }
      } catch (err) {
        console.error("fetch employees failed:", err);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user.empId, dispatch]);
};

export default useEvaluateEmployees;
