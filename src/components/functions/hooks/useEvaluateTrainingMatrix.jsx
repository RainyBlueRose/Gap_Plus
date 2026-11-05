import {
  setEvaluateTrainingMatrix,
  useEvaluateTrainingMatrixData,
} from "../../../store/evaluateTrainingMatrixSlice";
import { useEvaluateEmployeesData } from "../../../store/evaluateEmployeeSlice";

import { useDispatch } from "react-redux";
import { useEffect } from "react";

import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";

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
      const jobCodeList = [
        ...new Set(evaluateEmployees.map((e) => e.jobCode).filter(Boolean)),
      ];
      const trainingMatrix = await fetchEvaluateTrainingMatrix(jobCodeList);

      if (!cancelled) {
        dispatch(setEvaluateTrainingMatrix(trainingMatrix));
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [loading, dispatch]);
};

export default useEvaluateTrainingMatrix;

export const useFindTrainingMatrixByJobCode = () => {
  const { evaluateTrainingMatrix } = useEvaluateTrainingMatrixData();
  return (jobCode) => evaluateTrainingMatrix.find((e) => e.jobCode === jobCode);
};
