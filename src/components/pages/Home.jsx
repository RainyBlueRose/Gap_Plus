import React from "react";

import { useAuth } from "../functions/hooks/useAuth";

import Header from "../layouts/Header";

const Home = () => {
  const { signOut } = useAuth();
  return (
    <div>
      <Header />
      <p>Home</p>
      <button
        onClick={() => {
          signOut();
        }}
      >
        {" "}
        Sing Out{" "}
      </button>
    </div>
  );
};

export default Home;
