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

  const [mandatoryCompetenciesIDs, setMandatoryCompetenciesIDs] = useState();
  const [electiveCompetenciesIDs, setElectiveCompetenciesIDs] = useState();
  const [mandatoryIDPRecords, setMandatoryIDPRecords] = useState();
  const [electiveIDPRecords, setElectiveIDPRecords] = useState();

  async function getIDPRecords(jobCode) {
    const trainingMatrix = findTrainingMatrixByJobCode(jobCode);
    const { mandatory, electives } = trainingMatrix;
    const mandatoryCompetenciesIDs =
      await fetchCompetencieIDsByCourses(mandatory);
    const electiveCompetenciesIDs =
      await fetchCompetencieIDsByCourses(electives);
    const mandatoryIDPRecords = await fetchIDPRecordsByCompetencieIDs(
      mandatoryCompetenciesIDs,
    );
    const electiveIDPRecords = await fetchIDPRecordsByCompetencieIDs(
      electiveCompetenciesIDs,
    );
    setMandatoryCompetenciesIDs(mandatoryCompetenciesIDs);
    setElectiveCompetenciesIDs(electiveCompetenciesIDs);
    setMandatoryIDPRecords(mandatoryIDPRecords);
    setElectiveIDPRecords(electiveIDPRecords);
  }

  function MandatoryCourseList() {
    if (!mandatoryIDPRecords) return;
    const mandatory = checkCompleteIDPRecordsByCompetencieIDs(
      mandatoryCompetenciesIDs,
      mandatoryIDPRecords,
    );
    console.log("mandatory", mandatory);
    return <></>;
  }

  function checkCompleteIDPRecordsByCompetencieIDs(competencieIDs, IDPRecords) {
    return competencieIDs.map((compKey) => ({
      compKey,
      record: IDPRecords.find((record) => record.compKey === compKey) ?? null,
    }));
  }

  function findTrainingMatrixByJobCode(jobCode) {
    return evaluateTrainingMatrix.find((e) => e.jobCode === jobCode);
  }

  async function fetchCompetencieIDsByCourses(courses) {
    const q = query(
      collection(db, "competencies"),
      where("competencyName", "in", courses),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.id);
  }

  async function fetchIDPRecordsByCompetencieIDs(competencieIDs) {
    const q = query(
      collection(db, "idp_records"),
      where("compKey", "in", competencieIDs),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  return (
    <>
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
      <div className="col-span-2">
        <MandatoryCourseList />
      </div>
    </>
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
