import React from "react";

import { useAuth } from "../functions/hooks/useAuth";

const Home = () => {
  const { signOut } = useAuth();
  return (
    <div>
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
