import Header from "../layouts/Header";

import useEvaluateEmployees from "../functions/hooks/useEvaluateEmployees";
import useEvaluateTrainingMatrix from "../functions/hooks/useEvaluateTrainingMatrix";

import { useEvaluateEmployeesData } from "../../store/evaluateEmployeeSlice";
import { useEvaluateTrainingMatrixData } from "../../store/evaluateTrainingMatrixSlice";

function Page(props) {
  return <div>{props.children}</div>;
}

function MainSection(props) {
  return <div className="grid grid-cols-3 gap-3 p-3">{props.children}</div>;
}

function EmployeeList() {
  const { evaluateEmployees } = useEvaluateEmployeesData();
  return (
    <div className="">
      {evaluateEmployees.map((e, index) => (
        <div key={index} className="border">
          <div>{e.empId}</div>
          <div>{e.name}</div>
        </div>
      ))}
    </div>
  );
}

function showIDPRecords(jobCode) {
  const trainingMatrix = fetchEvaluateTrainingMatrixByJobCode(jobCode);
}

function fetchEvaluateTrainingMatrixByJobCode(jobCode) {
  const { evaluateTrainingMatrix } = { useEvaluateTrainingMatrixData };
  return evaluateTrainingMatrix.find((e) => e.jobCode === jobCode);
}

const Evaluate = () => {
  useEvaluateEmployees();
  useEvaluateTrainingMatrix();
  return (
    <Page>
      <Header />
      <MainSection>
        <EmployeeList />
      </MainSection>
    </Page>
  );
};

export default Evaluate;
