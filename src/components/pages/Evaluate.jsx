import { useState } from "react";

import Header from "../layouts/Header";

import useEvaluateEmployees from "../functions/hooks/useEvaluateEmployees";
import useEvaluateTrainingMatrix from "../functions/hooks/useEvaluateTrainingMatrix";

import { useEvaluateEmployeesData } from "../../store/evaluateEmployeeSlice";
import { useEvaluateTrainingMatrixData } from "../../store/evaluateTrainingMatrixSlice";

import { query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

function Page(props) {
  return <div>{props.children}</div>;
}

function MainSection(props) {
  return <div className="grid grid-cols-3 gap-3 p-3">{props.children}</div>;
}

function EmployeeList() {
  const { evaluateEmployees } = useEvaluateEmployeesData();
  const { evaluateTrainingMatrix } = useEvaluateTrainingMatrixData();

  const [mandatorys, setMandatory] = useState();
  const [electives, setElectives] = useState();
  const [selectEmployee, setSelectEmployee] = useState();

  async function getIDPRecords(jobCode) {
    const trainingMatrix = findTrainingMatrixByJobCode(jobCode);
    const { mandatory, electives } = trainingMatrix;
    console.log("mandatory", mandatory);
    console.log("electives", electives);
    const mandatoryCompetenciesID =
      await fetchCompetenciesIDByCourses(mandatory);
    console.log("mandatoryCompetenciesID", mandatoryCompetenciesID);
  }

  function findTrainingMatrixByJobCode(jobCode) {
    return evaluateTrainingMatrix.find((e) => e.jobCode === jobCode);
  }

  async function fetchCompetenciesIDByCourses(courses) {
    const q = query(
      collection(db, "competencies"),
      where("competencyName", "in", courses),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.id);
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
