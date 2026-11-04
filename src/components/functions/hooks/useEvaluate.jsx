import { useUserData } from "../../../store/userSlice";

const useEvaluate = () => {
  const { user } = useUserData();
  console.log(user)
  return <div>useEvaluate</div>;
};

export default useEvaluate;
