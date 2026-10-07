import React from "react";

import Header from "../layouts/Header";

import { useCompetenciesData } from "../../store/competenciesSlice";

const MyLearning = () => {
  return (
    <div>
      <Header />
      <div>MyLearning</div>
      <div>{useCompetenciesData}</div>
    </div>
  );
};

export default MyLearning;
