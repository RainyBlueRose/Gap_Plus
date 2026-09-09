import React from "react";
import { handleSignout } from "../functions/firebase/auth";

const Login = () => {
  return (
    <div>
      <div>
        <button>Login</button>
        <button onClick={handleSignout}>Logout</button>
      </div>
    </div>
  );
};

export default Login;
