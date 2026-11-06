import { useState } from "react";

import Header from "../layouts/Header";

import useEvaluateEmployees from "../functions/hooks/useEvaluateEmployees";
import useEvaluateTrainingMatrix, {
  useFindTrainingMatrixByJobCode,
} from "../functions/hooks/useEvaluateTrainingMatrix";

import { useEvaluateEmployeesData } from "../../store/evaluateEmployeeSlice";

function Page(props) {
  return <div>{props.children}</div>;
}

function MainSection(props) {
  return <div className="grid grid-cols-3 gap-3 p-3">{props.children}</div>;
}

function EmployeeList() {
  const { evaluateEmployees } = useEvaluateEmployeesData();
  const findTrainingMatrixByJobCide = useFindTrainingMatrixByJobCode();

  const [mandatorys, setMandatory] = useState();
  const [electives, setElectives] = useState();

  function getIDPRecords(jobCode) {
    const trainingMatrix = findTrainingMatrixByJobCide(jobCode);
    const { mandatory, electives } = trainingMatrix;
    setMandatory(mandatory);
    setElectives(electives);
  }

  return (
    <div>
      <div className="col-span-1">
        {evaluateEmployees.map((e, index) => (
          <div
            key={index}
            className="border"
            onClick={() => {
              getIDPRecords(e.jobCode);
            }}
          >
            <div>{e.empId}</div>
            <div>{e.name}</div>
          </div>
        ))}
      </div>
      <div className="col-span-2"></div>
    </div>
  );
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
