import Header from "../layouts/Header";
import useEvaluate from "../functions/hooks/useEvaluate";
const Evaluate = () => {
  useEvaluate();
  return (
    <div>
      <Header />
      <div>Evaluate</div>
    </div>
  );
};

export default Evaluate;
