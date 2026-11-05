import { useDispatch } from "react-redux";
import { useUserData } from "../../../store/userSlice";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";

async function fetchEvaluateEmployeesData(managerId) {
  const q = query(
    collection(db, "employees"),
    where("managerId", "==", managerId),
  );

  const managerEmployees = await getDocs(q);
  console.log("managerEmployees", managerEmployees);
}

const useEvaluateEmployees = () => {
  const { user } = useUserData();
  fetchEvaluateEmployeesData();
};

export default useEvaluateEmployees;
