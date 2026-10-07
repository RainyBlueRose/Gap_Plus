import React from "react";

import Header from "../layouts/Header";

import { useCompetenciesData } from "../../store/competenciesSlice";

const MyLearning = () => {
  const competenciesData = useCompetenciesData();
  console.log("competenciesData", competenciesData);
  return (
    <div>
      <Header />
      <div>MyLearning</div>
      <div></div>
    </div>
  );
};

export default MyLearning;
