import Header from "../layouts/Header";
import useEvaluateEmployees from "../functions/hooks/useEvaluateEmployees";
import { useState } from "react";

function Page(props) {
  return <div>{props.children}</div>;
}

function MainSection(props) {
  return <div className="grid grid-cols-3 gap-3 p-3">{props.children}</div>;
}

function EmployeeList() {
  return <div></div>;
}

const Evaluate = () => {
  useEvaluateEmployees();
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
