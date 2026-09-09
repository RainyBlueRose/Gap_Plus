import React from "react";
import { handleSignout } from "../functions/firebase/auth";
import { useSocialSignIn } from "../functions/hooks/useSocialSignIn";

const Login = () => {
  const { signIn } = useSocialSignIn();

  return (
    <div>
      <div>
        <button onClick={signIn("google")}>Login by Google</button>
        <button onClick={handleSignout}>Logout</button>
      </div>
    </div>
  );
};

export default Login;
