import { setEvaluateTrainingMatrix } from "../../../store/evaluateTrainingMatrixSlice";
import { useEvaluateEmployeesData } from "../../../store/evaluateEmployeeSlice";

import { useDispatch } from "react-redux";
import { useEffect } from "react";

import { getDocs, collection, query, where } from "firebase/firestore";

async function fetchEvaluateTrainingMatrix(jobCode) {
  const q = query(
    collection(db, "training_matrices"),
    where("jobCode", "in", jobCode),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

const useEvaluateTrainingMatrix = () => {
  const { evaluateEmployees, loading } = useEvaluateEmployeesData();
  const dispatch = useDispatch();

  useEffect(() => {
    if (loading !== "succeeded") return;
    let cancelled = false;

    const load = async () => {
      const jobCodeList = evaluateEmployees.map((e) => e.jobCode);
      const trainingMatrix = await fetchEvaluateTrainingMatrix(jobCodeList);

      if (!cancelled) {
        dispatch(setEvaluateTrainingMatrix(trainingMatrix));
      }
    };
    return () => {
      cancelled = true;
    };
  }, [loading, dispatch]);
};

export default useEvaluateTrainingMatrix;
