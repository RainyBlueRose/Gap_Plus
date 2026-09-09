import React from "react";
import {
  handleSigninByGoogle,
  handleSignout,
} from "../functions/firebase/auth";

const Login = () => {
  return (
    <div>
      <div>
        <button onClick={handleSigninByGoogle}>Login</button>
        <button onClick={handleSignout}>Logout</button>
      </div>
    </div>
  );
};

export default Login;
