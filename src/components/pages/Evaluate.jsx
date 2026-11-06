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

  const [mandatoryCompetencies, setMandatoryCompetencies] = useState();
  const [electiveCompetencies, setElectiveCompetencies] = useState();
  const [mandatoryIDPRecords, setMandatoryIDPRecords] = useState();
  const [electiveIDPRecords, setElectiveIDPRecords] = useState();

  const [openIndex, setOpenIndex] = useState();

  async function getIDPRecords(employee) {
    const { empId, jobCode } = employee;

    // หา training matrix จาก jobCode ของพนักงานที่เลือก
    const trainingMatrix = findTrainingMatrixByJobCode(jobCode);
    const { mandatory, electives } = trainingMatrix;

    // console.log("mandatory",mandatory)
    // console.log("electives",electives)
    // ดึงวิชาต่างๆจากรายการใน training matrix และแยกออกเป็นสองส่วนคือ mandatory และ elective
    const mandatoryCompetencies = await fetchCompetencieIDsByCourses(mandatory);
    const electiveCompetencies = await fetchCompetencieIDsByCourses(electives);

    // แยกเอาแค่ไอดีของ course ต่างๆออกมาเพื่อเอาไปใช้หา idp record ของพนักงานต่อได้โดยง่าย
    const mandatoryCompetenciesIDs = mandatoryCompetencies.map((m) => m.id);
    const electiveCompetenciesIDs = electiveCompetencies.map((e) => e.id);

    // หา IDP record ของพนักงาน โดยใช้ empId และ competencie ID เพื่อจะได้ดคงได้ถูกคนและถูกวิชาทั้ง mandatory และ elective
    const mandatoryIDPRecords = await fetchIDPRecordsByCompetencieIDs(
      empId,
      mandatoryCompetenciesIDs,
    );
    const electiveIDPRecords = await fetchIDPRecordsByCompetencieIDs(
      empId,
      electiveCompetenciesIDs,
    );

    // เก็บข้อมูล competencie, IDP records ของพนักงานลง State
    setMandatoryCompetencies(mandatoryCompetencies);
    setElectiveCompetencies(electiveCompetencies);
    setMandatoryIDPRecords(mandatoryIDPRecords);
    setElectiveIDPRecords(electiveIDPRecords);
  }

  function MandatoryCourseList() {
    if (!mandatoryIDPRecords) return;
    const mandatory = checkCompleteIDPRecordsByCompetencieIDs(
      mandatoryCompetencies,
      mandatoryIDPRecords,
    );
    console.log("mandatory", mandatory);
    return (
      <div className="flex flex-col gap-3">
        {mandatory.map((m, index) => (
          <div key={index}>
            {m.record ? (
              <div className="border h-auto" onClick={() => setOpenIndex(index)}>
                <div>{m.comp.competencyName}</div>
                <div>{m.comp.description}</div>
                {index === openIndex && <div>hello openIndex</div>}
              </div>
            ) : (
              <div>ไม่ได้ส่ง</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function checkCompleteIDPRecordsByCompetencieIDs(competencie, IDPRecords) {
    return competencie.map((c) => ({
      comp: c,
      record: IDPRecords.find((record) => record.compKey === c.id) ?? null,
    }));
  }

  function findTrainingMatrixByJobCode(jobCode) {
    return evaluateTrainingMatrix.find((e) => e.jobCode === jobCode);
  }

  async function fetchCompetencieIDsByCourses(courses) {
    // console.log("fetchCompetencieIDsByCourses")
    const q = query(
      collection(db, "competencies"),
      where("competencyName", "in", courses),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async function fetchIDPRecordsByCompetencieIDs(empId, competencieIDs) {
    // console.log("fetchCompetencieIDsByCourses")
    const q = query(
      collection(db, "idp_records"),
      where("empId", "==", empId),
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
              getIDPRecords(e);
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
