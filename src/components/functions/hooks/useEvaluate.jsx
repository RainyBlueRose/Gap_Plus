import { useUserData } from "../../../store/userSlice";
import { getDocs, query } from "firebase/firestore";
import { db } from "../../config/firebase";

const useEvaluate = () => {
  const { user } = useUserData();

  function load() {
    const q = query(collection(db))
  }
  return <div>useEvaluate</div>;
};

export default useEvaluate;
