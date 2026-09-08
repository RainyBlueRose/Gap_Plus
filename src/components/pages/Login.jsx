import React from "react";
import { handleSigninByGoogle } from "../functions/firebase/auth";

const Login = () => {
  return (
    <div>
      <div>
        <button onClick={handleSigninByGoogle}>Login</button>
      </div>
    </div>
  );
};

export default Login;
