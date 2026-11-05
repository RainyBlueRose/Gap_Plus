import Header from "../layouts/Header";
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
