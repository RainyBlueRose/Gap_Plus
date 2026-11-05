import { setEvaluateTrainingMatrix } from "../../../store/evaluateTrainingMatrixSlice";
import { useEvaluateEmployeesData } from "../../../store/evaluateEmployeeSlice";

import { useDispatch } from "react-redux";
import { useEffect } from "react";

import { getDocs, collection, query, where } from "firebase/firestore";

async function fetchEvaluateTrainingMatrix(jobCode) {}

const useEvaluateTrainingMatrix = () => {
  const { evaluateEmployees } = useEvaluateEmployeesData();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!evaluateEmployees) return;
    let cancelled = false;

    return () => {
      cancelled = true;
    };
  }, [evaluate?.jobCode, dispatch]);
};

export default useEvaluateTrainingMatrix;
